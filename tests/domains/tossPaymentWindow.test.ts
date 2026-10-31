import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { isValidElement } from 'react';
import ts from 'typescript';
import type {
  TossPaymentsWidgets,
  WidgetSelectedPaymentMethod,
} from '@tosspayments/tosspayments-sdk';

import {
  createTossPaymentWindowController,
  validateWidgetClientKey,
  type TossPaymentWindowInput,
} from '@/domains/payment/pg-toss/tossPaymentWindow';
import PaymentMethod from '@/domains/payment/components/PaymentMethod';
import { validateDelivery } from '@/domains/payment/data/payment.validation';
import type { DeliveryInfos } from '@/domains/payment/data/payment.types';

type PaymentWindow = Awaited<
  ReturnType<TossPaymentsWidgets['renderPaymentWindow']>
>;
type WindowWidgets = Pick<
  TossPaymentsWidgets,
  'setAmount' | 'renderPaymentWindow' | 'requestPayment'
>;
type EventArguments = PaymentWindow['on'] extends {
  (...args: infer First): void;
  (...args: infer Second): void;
}
  ? First | Second
  : never;
type PaymentListener = Extract<EventArguments, ['paymentRequest', unknown]>[1];
type PaymentEvent = Parameters<PaymentListener>[0];

const clientKey = 'test_gck_syntheticOnly';
const order: TossPaymentWindowInput = {
  method: 'card',
  orderId: 'SYNTHETIC-ORDER-152',
  orderName: 'Synthetic product',
  amount: 15800,
  customerName: 'Synthetic Buyer',
  customerMobilePhone: '01000000000',
};
const card: WidgetSelectedPaymentMethod = {
  code: 'CARD',
  method: 'CARD',
  card: {},
};
const tossPay: WidgetSelectedPaymentMethod = {
  code: 'TOSSPAY',
  method: 'CARD',
  card: { easyPay: 'TOSSPAY' },
};

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function eventFor(method: WidgetSelectedPaymentMethod): PaymentEvent {
  const amount = { value: order.amount, currency: 'KRW' };
  if (method.method === 'VIRTUAL_ACCOUNT') {
    return {
      paymentMethod: method,
      paymentInfo: {
        ...method,
        amount,
        virtualAccount: { dueDate: '2026-11-01T23:59:59+09:00' },
      },
    };
  }
  return {
    paymentMethod: method,
    paymentInfo: {
      ...method,
      amount,
    },
  };
}

function createHarness(
  options: {
    origin?: string;
    load?: Promise<void>;
    amount?: Promise<void>;
    render?: Promise<PaymentWindow>;
    renderError?: unknown;
    request?: Promise<void>;
    requestError?: unknown;
    destroy?: Promise<void>;
  } = {},
) {
  const calls: { name: string; input?: unknown }[] = [];
  let paymentListener: ((event: PaymentEvent) => Promise<void>) | undefined;
  let cancelListener: (() => Promise<void>) | undefined;
  const ready = deferred<void>();

  const fakeWindow: PaymentWindow = {
    on(
      name: 'paymentRequest' | 'cancel',
      listener:
        ((event: PaymentEvent) => Promise<void>) | (() => Promise<void>),
    ) {
      if (name === 'paymentRequest') {
        paymentListener = listener as (event: PaymentEvent) => Promise<void>;
        ready.resolve();
      } else {
        cancelListener = listener as () => Promise<void>;
      }
    },
    async destroy() {
      calls.push({ name: 'destroy' });
      await options.destroy;
    },
  };
  const widgets = {
    async setAmount(input: unknown) {
      calls.push({ name: 'amount', input });
      await options.amount;
    },
    async renderPaymentWindow(input: unknown) {
      calls.push({ name: 'render', input });
      if (options.renderError) throw options.renderError;
      return options.render ? await options.render : fakeWindow;
    },
    async requestPayment(input: unknown) {
      calls.push({ name: 'request', input });
      if (options.requestError) throw options.requestError;
      await options.request;
    },
  } as WindowWidgets;

  const controller = createTossPaymentWindowController({
    customerKey: 'SYNTHETIC_ANONYMOUS',
    getOrigin: () => options.origin ?? 'http://localhost:3000',
    async loadSdk(key) {
      calls.push({ name: 'load', input: key });
      await options.load;
      return {
        widgets(input) {
          calls.push({ name: 'widgets', input });
          return widgets;
        },
      };
    },
  });

  return {
    calls,
    controller,
    fakeWindow,
    ready: ready.promise,
    submit(event = eventFor(card)) {
      assert.ok(paymentListener);
      return paymentListener(event);
    },
    cancel() {
      assert.ok(cancelListener);
      return cancelListener();
    },
  };
}

function observe(promise: Promise<void>) {
  let settled = false;
  const result = promise.then(
    () => {
      settled = true;
      return undefined;
    },
    (error: unknown) => {
      settled = true;
      return error;
    },
  );
  return { result, isSettled: () => settled };
}

async function flush() {
  await new Promise<void>((resolve) => setImmediate(resolve));
}

type ElementNode = {
  type: unknown;
  props: Record<string, unknown>;
};

function findElement(
  root: unknown,
  matches: (node: ElementNode) => boolean,
): ElementNode {
  if (Array.isArray(root)) {
    for (const child of root) {
      try {
        return findElement(child, matches);
      } catch {
        /* 다음 형제에서 탐색 */
      }
    }
  } else if (isValidElement(root)) {
    const node = root as ElementNode;
    if (matches(node)) return node;
    return findElement(node.props.children, matches);
  }
  throw new Error('Synthetic element was not found');
}

// 실제 PaymentPage 코드를 실행하되 React hook 저장소와 외부 경계만 합성한다.
// 브라우저/React 렌더러 검증은 별도이며 서버 액션·SDK·DB는 호출하지 않는다.
function createPageHarness(
  options: {
    pendingOrder?: Promise<unknown>;
    invalidKey?: boolean;
    delivery?: DeliveryInfos;
  } = {},
) {
  const fixtureDelivery: DeliveryInfos = options.delivery ?? {
    recipientName: '테스트',
    recipientPhone: '01000000000',
    postalCode: '00000',
    recipientAddress: 'Synthetic address',
    recipientAddressDetail: 'Synthetic unit',
    entranceInstructions: '',
  };
  const slots: unknown[] = [];
  let cursor = 0;
  let cleanup: (() => void) | undefined;
  let unmounted = false;
  let updatesAfterUnmount = 0;
  const steps: string[] = [];
  const deliveries: DeliveryInfos[] = [];
  const requests: {
    input: TossPaymentWindowInput;
    signal: AbortSignal;
    gate: ReturnType<typeof deferred<void>>;
  }[] = [];
  const localRequire = createRequire(import.meta.url);
  const commonjs = { exports: {} as { default: (props: unknown) => unknown } };
  const source = readFileSync(
    new URL(
      '../../domains/payment/components/PaymentPage.tsx',
      import.meta.url,
    ),
    'utf8',
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const fakeRequire = (specifier: string): unknown => {
    if (specifier === 'react/jsx-runtime') return localRequire(specifier);
    if (specifier === 'react')
      return {
        useState(initial: unknown) {
          const index = cursor++;
          if (!(index in slots)) slots[index] = initial;
          return [
            slots[index],
            (next: unknown) => {
              if (unmounted) updatesAfterUnmount++;
              slots[index] =
                typeof next === 'function'
                  ? (next as (previous: unknown) => unknown)(slots[index])
                  : next;
            },
          ];
        },
        useRef(initial: unknown) {
          const index = cursor++;
          if (!(index in slots)) slots[index] = { current: initial };
          return slots[index];
        },
        useEffect(effect: () => () => void) {
          if (!cleanup) cleanup = effect();
        },
      };
    if (specifier.endsWith('/useSelectedPodIds'))
      return { useSelectedPodIds: () => ['synthetic-pod'] };
    if (specifier.endsWith('/payment.validation')) return { validateDelivery };
    if (specifier.endsWith('/payment.session'))
      return {
        saveSelectedPodIds: () => {
          steps.push('save');
          return true;
        },
      };
    if (specifier.endsWith('/payment.actions'))
      return {
        createPendingOrderAction: async (
          _ids: string[],
          delivery: DeliveryInfos,
        ) => {
          steps.push('order');
          deliveries.push(delivery);
          return (
            options.pendingOrder ?? {
              success: true,
              orderId: order.orderId,
              orderName: order.orderName,
              amount: order.amount,
            }
          );
        },
      };
    if (specifier.endsWith('/requestTossPayment'))
      return {
        validateTossPaymentClientKey() {
          steps.push('key');
          if (options.invalidKey) throw new Error('synthetic key failure');
        },
        requestTossPayment(
          input: TossPaymentWindowInput,
          { signal }: { signal: AbortSignal },
        ) {
          const gate = deferred<void>();
          requests.push({ input, signal, gate });
          signal.addEventListener(
            'abort',
            () =>
              gate.reject(
                Object.assign(new Error('synthetic abort'), {
                  name: 'AbortError',
                }),
              ),
            { once: true },
          );
          return gate.promise;
        },
      };
    const componentNames: Record<string, string> = {
      DeliveryForm: 'delivery-form',
      PaymentMethod: 'payment-method',
      PaymentOrderItems: 'payment-items',
      PaymentSummary: 'payment-summary',
    };
    const component = componentNames[specifier.split('/').at(-1) ?? ''];
    if (component) return { __esModule: true, default: component };
    throw new Error(`Unexpected synthetic dependency: ${specifier}`);
  };
  const documentFixture = { getElementById: () => ({ focus() {} }) };
  new Function('require', 'module', 'exports', 'document', compiled.outputText)(
    fakeRequire,
    commonjs,
    commonjs.exports,
    documentFixture,
  );
  const render = () => {
    cursor = 0;
    const tree = commonjs.exports.default({
      initialDelivery: fixtureDelivery,
      items: [
        {
          podId: 'synthetic-pod',
          productName: 'Synthetic product',
          optionLabel: 'Synthetic option',
          quantity: 1,
          unitPrice: 12800,
          imageUrl: null,
        },
      ],
    });
    const props = (type: string) =>
      findElement(tree, (node) => node.type === type).props;
    return {
      toss: () => (props('payment-method').onTossPay as () => Promise<void>)(),
      choose: (method: 'card' | 'tosspay') =>
        (props('payment-method').onChange as (method: string) => void)(method),
      consent: () =>
        (
          props('payment-summary').onPrivacyConsentChange as (
            checked: boolean,
          ) => void
        )(true),
      submit: () =>
        (
          props('form').onSubmit as (event: {
            preventDefault: () => void;
          }) => Promise<void>
        )({ preventDefault() {} }),
      paymentProps: props('payment-method'),
      tree,
    };
  };
  return {
    render,
    steps,
    deliveries,
    requests,
    fixtureDelivery,
    updatesAfterUnmount: () => updatesAfterUnmount,
    unmount() {
      unmounted = true;
      cleanup?.();
    },
  };
}

describe('기존 Toss Pay 타일의 실제 결제 진입 (합성 경계)', () => {
  it('같은 로고·그리드의 Toss Pay를 실제 버튼으로 제공하며 카드 라디오를 유지한다', () => {
    let activations = 0;
    let selections = 0;
    const tree = PaymentMethod({
      value: 'tosspay',
      error: undefined,
      onChange: () => selections++,
      onTossPay: () => activations++,
      disabled: false,
    });
    const button = findElement(tree, (node) => node.type === 'button');
    assert.equal(button.props.type, 'button');
    assert.equal(button.props.id, 'paymentMethod-tosspay');
    assert.equal(button.props['aria-pressed'], true);
    assert.equal(button.props.disabled, false);
    (button.props.onClick as () => void)();
    (button.props.onClick as () => void)();
    assert.equal(activations, 2);
    assert.equal(selections, 0);
    const radio = findElement(tree, (node) => node.type === 'input');
    assert.equal(radio.props.type, 'radio');
    assert.equal(radio.props.value, 'card');
    assert.equal(
      findElement(
        tree,
        (node) => node.props.src === '/images/payment/tosspay.png',
      ).props.className,
      'payment-method-logo',
    );
    const disabled = PaymentMethod({
      value: '',
      error: undefined,
      onChange() {},
      onTossPay() {},
      disabled: true,
    });
    assert.equal(
      findElement(disabled, (node) => node.type === 'button').props.disabled,
      true,
    );
  });

  it('타일 클릭은 명시적 TossPay로 시작하고 중복을 막으며 취소 뒤 같은 타일로 다시 시작한다', async () => {
    const fake = createPageHarness();
    fake.render().consent();
    const page = fake.render();
    const first = page.toss();
    const duplicate = page.toss();
    await flush();
    assert.equal(fake.deliveries.length, 1);
    assert.deepEqual(fake.deliveries[0], fake.fixtureDelivery);
    assert.equal(fake.requests[0].input.method, 'tosspay');
    assert.ok(fake.steps.indexOf('key') < fake.steps.indexOf('order'));
    assert.equal(fake.render().paymentProps.value, 'tosspay');
    assert.equal(fake.render().paymentProps.disabled, true);
    fake.requests[0].gate.reject({ code: 'USER_CANCEL' });
    await first;
    await duplicate;
    const retried = fake.render().toss();
    await flush();
    assert.equal(fake.requests.length, 2);
    assert.equal(fake.requests[1].input.method, 'tosspay');
    fake.requests[1].gate.reject({ code: 'USER_CANCEL' });
    await retried;
  });

  it('타일도 필수 동의/배송 검사를 통과해야 하며 기존 카드 선택 후 Pay 흐름을 보존한다', async () => {
    const fake = createPageHarness();
    await fake.render().toss();
    assert.equal(fake.requests.length, 0);
    assert.equal(fake.deliveries.length, 0);
    assert.match(
      String(
        fake.render().tree &&
          findElement(
            fake.render().tree,
            (node) => node.type === 'payment-summary',
          ).props.privacyError,
      ),
      /consent/,
    );
    fake.render().choose('card');
    assert.equal(fake.deliveries.length, 0);
    fake.render().consent();
    const pending = fake.render().submit();
    await flush();
    assert.equal(fake.requests[0].input.method, 'card');
    fake.requests[0].gate.reject({ code: 'USER_CANCEL' });
    await pending;
    const invalidDelivery = createPageHarness({
      delivery: { ...fake.fixtureDelivery, recipientName: '' },
    });
    invalidDelivery.render().consent();
    await invalidDelivery.render().toss();
    assert.equal(invalidDelivery.deliveries.length, 0);
  });

  it('타일의 키 실패는 가주문을 만들지 않고 언마운트 뒤 가주문 응답은 창/상태를 갱신하지 않는다', async () => {
    const invalid = createPageHarness({ invalidKey: true });
    invalid.render().consent();
    await invalid.render().toss();
    assert.equal(invalid.deliveries.length, 0);
    const pendingOrder = deferred<unknown>();
    const fake = createPageHarness({ pendingOrder: pendingOrder.promise });
    fake.render().consent();
    const pending = fake.render().toss();
    fake.unmount();
    pendingOrder.resolve({
      success: true,
      orderId: order.orderId,
      orderName: order.orderName,
      amount: order.amount,
    });
    await pending;
    assert.equal(fake.requests.length, 0);
    assert.equal(fake.updatesAfterUnmount(), 0);
  });
});

describe('토스 결제창형 클라이언트 세션 (합성 SDK, 외부 요청 없음)', () => {
  it('결제창형 gck만 허용하고 기존 ck·시크릿·빈 키를 초기화 전에 차단한다', () => {
    assert.equal(validateWidgetClientKey(clientKey), clientKey);
    assert.equal(
      validateWidgetClientKey('live_gck_syntheticOnly'),
      'live_gck_syntheticOnly',
    );
    const fake = createHarness();
    for (const key of [
      undefined,
      '',
      'test_ck_legacy',
      'test_gsk_secret',
      'test_sk_secret',
      ' test_gck_invalid',
      'test_gck_',
      'test_gck_white space',
    ]) {
      assert.throws(() => validateWidgetClientKey(key), {
        code: 'INVALID_WIDGET_CLIENT_KEY',
      });
      if (key !== undefined) {
        assert.throws(
          () =>
            fake.controller.request(order, key, new AbortController().signal),
          { code: 'INVALID_WIDGET_CLIENT_KEY' },
        );
      }
    }
    assert.deepEqual(fake.calls, []);
  });

  it('익명 초기화 → 금액 설정 완료 → 창 렌더 순서를 지키고 렌더 뒤에도 잠근다', async () => {
    const amount = deferred<void>();
    const fake = createHarness({ amount: amount.promise });
    const observed = observe(
      fake.controller.request(order, clientKey, new AbortController().signal),
    );
    await flush();
    assert.deepEqual(
      fake.calls.map(({ name }) => name),
      ['load', 'widgets', 'amount'],
    );
    assert.deepEqual(fake.calls[1].input, {
      customerKey: 'SYNTHETIC_ANONYMOUS',
    });
    assert.deepEqual(fake.calls[2].input, { currency: 'KRW', value: 15800 });
    amount.resolve();
    await fake.ready;
    assert.deepEqual(fake.calls[3], {
      name: 'render',
      input: { orderName: order.orderName },
    });
    assert.equal(observed.isSettled(), false);
    await assert.rejects(
      fake.controller.request(order, clientKey, new AbortController().signal),
      { code: 'PAYMENT_WINDOW_BUSY' },
    );
    assert.equal(fake.calls.filter(({ name }) => name === 'render').length, 1);
    await fake.cancel();
    assert.equal(
      ((await observed.result) as { code: string }).code,
      'USER_CANCEL',
    );
    assert.equal(fake.calls.filter(({ name }) => name === 'destroy').length, 1);
  });

  it('같은 틱의 창 열기와 paymentRequest 중복을 차단하고 요청 resolve 뒤에도 유지한다', async () => {
    const request = deferred<void>();
    const fake = createHarness({
      request: request.promise,
      origin: 'https://preview.example.test',
    });
    const controller = new AbortController();
    const observed = observe(
      fake.controller.request(order, clientKey, controller.signal),
    );
    await assert.rejects(
      fake.controller.request(order, clientKey, new AbortController().signal),
      { code: 'PAYMENT_WINDOW_BUSY' },
    );
    await fake.ready;
    const first = fake.submit();
    await fake.submit();
    assert.equal(fake.calls.filter(({ name }) => name === 'request').length, 1);
    const payload = fake.calls.find(({ name }) => name === 'request')?.input;
    assert.deepEqual(payload, {
      orderId: order.orderId,
      orderName: order.orderName,
      customerName: order.customerName,
      customerMobilePhone: order.customerMobilePhone,
      successUrl: 'https://preview.example.test/payment/pay-completed',
      failUrl: 'https://preview.example.test/payment/pay-failed',
    });
    request.resolve();
    await first;
    assert.equal(observed.isSettled(), false);
    await fake.submit();
    assert.equal(fake.calls.filter(({ name }) => name === 'request').length, 1);
    await assert.rejects(
      fake.controller.request(order, clientKey, new AbortController().signal),
      { code: 'PAYMENT_WINDOW_BUSY' },
    );
    controller.abort();
    assert.equal(((await observed.result) as Error).name, 'AbortError');
  });

  for (const method of ['card', 'tosspay'] as const) {
    it(`${method} 라디오와 실제 창의 일치 수단만 요청하며 localhost 콜백을 보존한다`, async () => {
      const fake = createHarness();
      const observed = observe(
        fake.controller.request(
          { ...order, method },
          clientKey,
          new AbortController().signal,
        ),
      );
      await fake.ready;
      await fake.submit(eventFor(method === 'card' ? card : tossPay));
      assert.equal(
        fake.calls.filter(({ name }) => name === 'request').length,
        1,
      );
      assert.equal(
        (
          fake.calls.find(({ name }) => name === 'request')?.input as {
            successUrl: string;
          }
        ).successUrl,
        'http://localhost:3000/payment/pay-completed',
      );
      await fake.cancel();
      await observed.result;
    });
  }

  const unsupported: WidgetSelectedPaymentMethod[] = [
    { code: 'TRANSFER', method: 'TRANSFER', transfer: {} },
    { code: 'VIRTUAL_ACCOUNT', method: 'VIRTUAL_ACCOUNT' },
    { code: 'BRANDPAY', method: 'BRANDPAY', brandpay: { method: 'CARD' } },
    { code: 'CARD', method: 'CUSTOM', custom: { key: 'CARD' } },
    {
      code: 'PAYPAL',
      method: 'FOREIGN_EASY_PAY',
      foreignEasyPay: { provider: 'PAYPAL' },
    },
    { code: 'MOBILE_PHONE', method: 'MOBILE_PHONE' },
    { code: 'NAVERPAY', method: 'CARD', card: { easyPay: 'NAVERPAY' } },
  ];

  for (const actual of [...unsupported, tossPay]) {
    it(`card 선택에서 ${actual.method}/${actual.code}를 provider 요청 전 차단한다`, async () => {
      const fake = createHarness();
      const observed = observe(
        fake.controller.request(order, clientKey, new AbortController().signal),
      );
      await fake.ready;
      await fake.submit(eventFor(actual));
      assert.equal(
        ((await observed.result) as { code: string }).code,
        'PAYMENT_METHOD_MISMATCH',
      );
      assert.equal(
        fake.calls.filter(({ name }) => name === 'request').length,
        0,
      );
      assert.equal(
        fake.calls.filter(({ name }) => name === 'destroy').length,
        1,
      );
    });
  }

  it('TossPay 라디오에서 일반 카드와 서로 다른 두 이벤트 스냅샷도 차단한다', async () => {
    for (const event of [
      eventFor(card),
      { paymentMethod: tossPay, paymentInfo: eventFor(card).paymentInfo },
    ]) {
      const fake = createHarness();
      const observed = observe(
        fake.controller.request(
          { ...order, method: 'tosspay' },
          clientKey,
          new AbortController().signal,
        ),
      );
      await fake.ready;
      await fake.submit(event);
      assert.equal(
        ((await observed.result) as { code: string }).code,
        'PAYMENT_METHOD_MISMATCH',
      );
      assert.equal(
        fake.calls.filter(({ name }) => name === 'request').length,
        0,
      );
    }
  });

  it('이벤트 금액이나 통화가 서버 주문과 다르면 요청하지 않는다', async () => {
    for (const amount of [
      { value: 1, currency: 'KRW' },
      { value: 15800, currency: 'USD' },
    ]) {
      const fake = createHarness();
      const observed = observe(
        fake.controller.request(order, clientKey, new AbortController().signal),
      );
      await fake.ready;
      const event = eventFor(card);
      event.paymentInfo.amount = amount;
      await fake.submit(event);
      assert.equal(
        ((await observed.result) as { code: string }).code,
        'PAYMENT_AMOUNT_MISMATCH',
      );
      assert.equal(
        fake.calls.filter(({ name }) => name === 'request').length,
        0,
      );
    }
  });

  it('렌더 단계 취소/오류를 전달하고 다음 시도를 허용한다', async () => {
    for (const error of [
      { code: 'USER_CANCEL' },
      new Error('synthetic render error'),
    ]) {
      const fake = createHarness({ renderError: error });
      assert.equal(
        await observe(
          fake.controller.request(
            order,
            clientKey,
            new AbortController().signal,
          ),
        ).result,
        error,
      );
      await flush();
      assert.equal(
        await observe(
          fake.controller.request(
            order,
            clientKey,
            new AbortController().signal,
          ),
        ).result,
        error,
      );
      assert.equal(
        fake.calls.filter(({ name }) => name === 'render').length,
        2,
      );
      assert.equal(
        fake.calls.filter(({ name }) => name === 'request').length,
        0,
      );
    }
  });

  it('requestPayment 취소와 요청 오류를 전달하며 소유한 창을 정리한다', async () => {
    for (const error of [
      { code: 'USER_CANCEL' },
      { code: 'PAY_PROCESS_CANCELED' },
      new Error('synthetic request error'),
    ]) {
      const fake = createHarness({ requestError: error });
      const observed = observe(
        fake.controller.request(order, clientKey, new AbortController().signal),
      );
      await fake.ready;
      await fake.submit();
      assert.equal(await observed.result, error);
      assert.equal(
        fake.calls.filter(({ name }) => name === 'destroy').length,
        1,
      );
      await fake.submit();
      assert.equal(
        fake.calls.filter(({ name }) => name === 'request').length,
        1,
      );
    }
  });

  it('창 제거가 끝나기 전에 다음 창을 열지 않고 취소 뒤 새 세션을 연다', async () => {
    const destroyed = deferred<void>();
    const fake = createHarness({ destroy: destroyed.promise });
    const observed = observe(
      fake.controller.request(order, clientKey, new AbortController().signal),
    );
    await fake.ready;
    const cancel = fake.cancel();
    await assert.rejects(
      fake.controller.request(order, clientKey, new AbortController().signal),
      { code: 'PAYMENT_WINDOW_BUSY' },
    );
    destroyed.resolve();
    await cancel;
    await observed.result;
    const replacement = observe(
      fake.controller.request(order, clientKey, new AbortController().signal),
    );
    await flush();
    assert.equal(fake.calls.filter(({ name }) => name === 'render').length, 2);
    await fake.cancel();
    await replacement.result;
    assert.equal(fake.calls.filter(({ name }) => name === 'destroy').length, 2);
  });

  it('시작 전 abort는 SDK를 호출하지 않고, 로딩/금액 대기 중 abort는 렌더하지 않는다', async () => {
    const stopped = new AbortController();
    stopped.abort();
    const before = createHarness();
    await assert.rejects(
      before.controller.request(order, clientKey, stopped.signal),
      { name: 'AbortError' },
    );
    assert.deepEqual(before.calls, []);

    for (const phase of ['load', 'amount'] as const) {
      const gate = deferred<void>();
      const fake = createHarness({ [phase]: gate.promise });
      const controller = new AbortController();
      const observed = observe(
        fake.controller.request(order, clientKey, controller.signal),
      );
      await flush();
      controller.abort();
      assert.equal(((await observed.result) as Error).name, 'AbortError');
      gate.resolve();
      await flush();
      assert.equal(
        fake.calls.filter(({ name }) => name === 'render').length,
        0,
      );
    }
  });

  it('unmount/abort 뒤 늦게 resolve된 창을 제거하고 이벤트를 연결하지 않는다', async () => {
    const rendered = deferred<PaymentWindow>();
    const fake = createHarness({ render: rendered.promise });
    const controller = new AbortController();
    const observed = observe(
      fake.controller.request(order, clientKey, controller.signal),
    );
    await flush();
    controller.abort();
    assert.equal(((await observed.result) as Error).name, 'AbortError');
    await assert.rejects(
      fake.controller.request(order, clientKey, new AbortController().signal),
      { code: 'PAYMENT_WINDOW_BUSY' },
    );
    rendered.resolve(fake.fakeWindow);
    await flush();
    assert.equal(fake.calls.filter(({ name }) => name === 'destroy').length, 1);
    assert.equal(fake.calls.filter(({ name }) => name === 'request').length, 0);
    assert.throws(() => fake.submit());
  });

  it('요청 대기 중 abort와 늦은 요청 실패도 중복 정리/미처리 거절을 만들지 않는다', async () => {
    const request = deferred<void>();
    const fake = createHarness({ request: request.promise });
    const controller = new AbortController();
    const observed = observe(
      fake.controller.request(order, clientKey, controller.signal),
    );
    await fake.ready;
    const submission = fake.submit();
    controller.abort();
    assert.equal(((await observed.result) as Error).name, 'AbortError');
    request.reject(new Error('late synthetic failure'));
    await submission;
    await fake.cancel();
    assert.equal(fake.calls.filter(({ name }) => name === 'destroy').length, 1);
  });
});
