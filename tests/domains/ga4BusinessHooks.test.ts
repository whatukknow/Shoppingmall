import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';
import { isValidElement } from 'react';
import ts from 'typescript';
import {
  hasErrors,
  validateLogin,
  validateSignup,
} from '../../domains/auth/auth.validate';
import type {
  SignInRequest,
  SignupValues,
} from '../../domains/auth/auth.types';
import * as authTypes from '../../domains/auth/auth.types';
import { ApiError } from '../../shared/lib/client';
import type { TasteProfile } from '../../domains/auth/users.types';
import { HomeProductCard } from '../../domains/home/components/HomeProductCard';
import { ProductCarousel } from '../../domains/home/components/ProductCarousel';
import * as answersModule from '../../domains/home/onboarding/react/answers';
import * as recommendation from '../../domains/home/onboarding/react/recommendation';
import { defaultTasteConfig } from '../../domains/admin/taste-config';
import { recommendConfigured } from '../../domains/admin/recommend';
import * as tasteProfile from '../../domains/home/onboarding/react/tasteProfile';
import type { HomeCardItem } from '../../domains/home/home.types';

type ElementNode = { type: unknown; props: Record<string, unknown> };
type Component = (props: Record<string, unknown>) => unknown;
const localRequire = createRequire(import.meta.url);

function element(value: unknown): ElementNode {
  assert.ok(isValidElement(value));
  return value as ElementNode;
}

function findElement(
  root: unknown,
  matches: (node: ElementNode) => boolean,
): ElementNode {
  if (Array.isArray(root)) {
    for (const child of root) {
      try {
        return findElement(child, matches);
      } catch {
        // 다음 형제에서 찾는다.
      }
    }
  } else if (isValidElement(root)) {
    const node = element(root);
    if (matches(node)) return node;
    return findElement(node.props.children, matches);
  }
  throw new Error('Synthetic element was not found');
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

// 실제 컴포넌트 소스를 실행하고 hook·브라우저·서버 요청 경계만 합성한다.
// React 렌더러/브라우저/실제 API·DB·GA 수신 검증과 구분한다.
function createRuntime() {
  const slots: unknown[] = [];
  let cursor = 0;
  const effects: (() => void)[] = [];
  const transitions: Promise<void>[] = [];
  const timers = new Map<number, () => void>();
  let nextTimer = 0;
  const react = {
    useState(initial: unknown) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [
        slots[index],
        (next: unknown) => {
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
    useTransition() {
      return [
        false,
        (callback: () => Promise<void>) => {
          transitions.push(callback());
        },
      ];
    },
    useEffect(effect: () => void, deps: unknown[]) {
      const index = cursor++;
      const previous = slots[index] as unknown[] | undefined;
      if (!previous || deps.some((value, i) => value !== previous[i])) {
        slots[index] = deps;
        effects.push(effect);
      }
    },
  };
  return {
    react,
    render(component: Component, props: Record<string, unknown> = {}) {
      cursor = 0;
      const tree = element(component(props));
      effects.splice(0).forEach((effect) => effect());
      return tree;
    },
    async finishTransitions() {
      await Promise.all(transitions.splice(0));
    },
    setTimeout(callback: () => void) {
      timers.set(++nextTimer, callback);
      return nextTimer;
    },
    clearTimeout(id: number) {
      timers.delete(id);
    },
    runTimers() {
      const pending = [...timers.values()];
      timers.clear();
      pending.forEach((callback) => callback());
    },
  };
}

function loadSource(
  path: string,
  dependencies: Record<string, unknown>,
  runtime: ReturnType<typeof createRuntime>,
  windowFixture: unknown = {},
  expose = '',
) {
  const source = readFileSync(
    new URL(`../../${path}`, import.meta.url),
    'utf8',
  );
  const compiled = ts.transpileModule(`${source}\n${expose}`, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
  });
  const commonjs = { exports: {} as Record<string, Component> };
  const fakeRequire = (specifier: string): unknown => {
    if (specifier === 'react/jsx-runtime') return localRequire(specifier);
    if (specifier === 'react') return runtime.react;
    if (specifier in dependencies) return dependencies[specifier];
    throw new Error(`Unexpected synthetic dependency: ${specifier}`);
  };
  new Function(
    'require',
    'module',
    'exports',
    'window',
    'setTimeout',
    'clearTimeout',
    'setInterval',
    'clearInterval',
    compiled.outputText,
  )(
    fakeRequire,
    commonjs,
    commonjs.exports,
    windowFixture,
    runtime.setTimeout,
    runtime.clearTimeout,
    () => 0,
    () => {},
  );
  return commonjs.exports;
}

const validSignup: SignupValues = {
  name: 'Synthetic Person',
  email: 'synthetic@example.invalid',
  password: 'synthetic-password',
  passwordConfirm: 'synthetic-password',
  agreeTerms: true,
  agreePrivacy: true,
  agreeNotification: false,
};

const syntheticSignupToken = '00000000-0000-4000-8000-000000000001';

function createTokenStorage() {
  const values = new Map<string, string>();
  const failures = { read: false, write: false, remove: false };
  const storage = {
    getItem(key: string) {
      if (failures.read) throw new Error('synthetic storage read failure');
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      if (failures.write) throw new Error('synthetic storage write failure');
      values.set(key, value);
    },
    removeItem(key: string) {
      if (failures.remove) throw new Error('synthetic storage removal failure');
      values.delete(key);
    },
  };
  const api = loadSource(
    'domains/auth/auth.api.ts',
    {
      '@/shared/lib/client': { apiClient: {} },
      './auth.types': authTypes,
    },
    createRuntime(),
    { sessionStorage: storage },
  ) as unknown as {
    storeSignupAttemptToken(value: unknown): boolean;
    readSignupAttemptToken(): string | undefined;
    consumeSignupAttemptToken(value: string): boolean;
  };
  return { ...api, values, failures, storage };
}

function signupHarness(
  options: {
    signup?: () => Promise<unknown>;
    storage?: ReturnType<typeof createTokenStorage>;
  } = {},
) {
  const runtime = createRuntime();
  const storage = options.storage ?? createTokenStorage();
  const steps: string[] = [];
  const loaded = loadSource(
    'domains/auth/containers/SignupContainer.tsx',
    {
      'next/navigation': {
        useRouter: () => ({
          push: () => {
            steps.push('navigate');
          },
        }),
      },
      '@/domains/auth/auth.api': {
        signUp: async () => {
          steps.push('signup');
          return options.signup
            ? await options.signup()
            : { data: { signupAttemptToken: syntheticSignupToken } };
        },
        storeSignupAttemptToken: (token: unknown) => {
          steps.push('store');
          return storage.storeSignupAttemptToken(token);
        },
      },
      '@/domains/auth/auth.types': authTypes,
      '@/domains/auth/components/SignupForm': { SignupForm: 'signup-form' },
      '@/domains/auth/auth.validate': { hasErrors, validateSignup },
      '@/domains/auth/auth.redirect': { withNext: (path: string) => path },
      '@/shared/lib/analytics/client': {
        trackSignUp() {
          assert.fail('가입 요청만으로 분석 이벤트를 보내면 안 됨');
        },
      },
    },
    runtime,
  );
  const render = () => runtime.render(loaded.default, { redirectTo: '/' });
  return {
    runtime,
    steps,
    storage,
    render,
    fill() {
      const form = render();
      for (const [key, value] of Object.entries(validSignup)) {
        (form.props.onChange as (key: string, value: unknown) => void)(
          key,
          value,
        );
      }
      return render();
    },
  };
}

function loginHarness(
  options: {
    signin?: () => Promise<unknown>;
    storage?: ReturnType<typeof createTokenStorage>;
    track?: () => void;
    navigate?: () => void;
  } = {},
) {
  const runtime = createRuntime();
  const storage = options.storage ?? createTokenStorage();
  const steps: string[] = [];
  const requests: SignInRequest[] = [];
  const eventArguments: unknown[][] = [];
  const loaded = loadSource(
    'domains/auth/containers/LoginContainer.tsx',
    {
      'next/navigation': {
        useRouter: () => ({
          push() {
            steps.push('navigate');
            options.navigate?.();
          },
          refresh() {
            steps.push('refresh');
          },
        }),
      },
      '@/domains/auth/data/authPreviewSession': {
        AUTH_PREVIEW_SESSION_KEY: 'synthetic-preview',
      },
      '@/domains/auth/auth.api': {
        readSignupAttemptToken: storage.readSignupAttemptToken,
        consumeSignupAttemptToken: storage.consumeSignupAttemptToken,
        signIn: async (body: SignInRequest) => {
          steps.push('signin');
          requests.push(body);
          return options.signin
            ? await options.signin()
            : { data: { signUpAnalyticsEligible: true } };
        },
      },
      '@/domains/auth/components/LoginForm': { LoginForm: 'login-form' },
      '@/domains/auth/auth.validate': { hasErrors, validateLogin },
      '@/domains/auth/auth.redirect': { withNext: (path: string) => path },
      '@/shared/lib/client': { ApiError },
      '@/shared/lib/analytics/client': {
        trackSignUp: (...args: unknown[]) => {
          steps.push('event');
          eventArguments.push(args);
          options.track?.();
          return true;
        },
      },
    },
    runtime,
    { sessionStorage: storage.storage },
  );
  const render = () => runtime.render(loaded.default, { redirectTo: '/' });
  return {
    runtime,
    steps,
    storage,
    requests,
    eventArguments,
    render,
    fill() {
      const form = render();
      for (const [key, value] of Object.entries({
        email: validSignup.email,
        password: validSignup.password,
      })) {
        (form.props.onChange as (key: string, value: string) => void)(
          key,
          value,
        );
      }
      return render();
    },
  };
}

const fixtureAnswers = {
  ...answersModule.initialAnswers,
  nick: 'Synthetic',
  y: 1990,
  m: 3,
  d: 7,
  sun: 'p' as const,
  fridge: 'sauce' as const,
};

function tasteHarness(
  options: {
    save?: () => Promise<unknown>;
    track?: () => void;
    navigate?: () => void;
  } = {},
) {
  const runtime = createRuntime();
  const steps: string[] = [];
  const saved: TasteProfile[] = [];
  const events: unknown[] = [];
  const destinations: string[] = [];
  const loaded = loadSource(
    'domains/home/onboarding/react/ResultStep.tsx',
    {
      '@/shared/lib/food-label': { foodLabel: (value: string) => value },
      '@/domains/admin/recommend': { recommendConfigured },
      'next/navigation': {},
      './TasteFrame': { TasteFrame: 'taste-frame' },
      './TasteProvider': {
        useTaste: () => ({
          answers: fixtureAnswers,
          config: defaultTasteConfig,
          tasteRevision: 0,
          remaining: () => ({ day: 0, week: 0 }),
        }),
      },
      './answers': answersModule,
      './recommendation': recommendation,
      './PixelIcon': { PixelIcon: 'pixel-icon' },
      '@/domains/auth/users.api': {
        saveTasteProfile: async (profile: TasteProfile) => {
          steps.push('save');
          saved.push(profile);
          return options.save ? await options.save() : {};
        },
      },
      './tasteProfile': tasteProfile,
      './ShoppingWalk': { ShoppingWalk: 'shopping-walk' },
      '@/shared/lib/analytics/client': {
        trackTasteProfileSaved: (payload: unknown) => {
          steps.push('event');
          events.push(payload);
          options.track?.();
          return true;
        },
      },
    },
    runtime,
    {
      matchMedia: () => ({ matches: true }),
      location: {
        assign: (path: string) => {
          steps.push('navigate');
          destinations.push(path);
          options.navigate?.();
        },
      },
    },
    'export { ResultContent };',
  );
  const render = () => runtime.render(loaded.ResultContent, { onRestart() {} });
  const complete = () => {
    const frame = render();
    return (
      findElement(frame.props.overlay, (node) => node.props.className === 'yes')
        .props.onClick as () => Promise<void>
    )();
  };
  return {
    runtime,
    steps,
    saved,
    events,
    destinations,
    render,
    complete,
    openModal(preference: boolean) {
      render();
      runtime.runTimers();
      const frame = render();
      const walk = findElement(
        frame.props.children,
        (node) => node.type === 'shopping-walk',
      );
      (walk.props.ref as { current: unknown }).current = {
        run(callback: (quote: unknown) => void) {
          callback({ n: 0, why: 'same' });
        },
      };
      (
        findElement(
          frame.props.actions,
          (node) => node.props.className === 'btn',
        ).props.onClick as () => void
      )();
      runtime.runTimers();
      if (preference) {
        (
          findElement(
            render().props.overlay,
            (node) => node.props.className === 'ben pick',
          ).props.onClick as () => void
        )();
      }
      render();
    },
  };
}

describe('GA4 가입 요청과 인증 완료 경계', () => {
  it('입력 오류/가입 요청 대기/실패는 전송하지 않고 성공 후 표식만 저장한다', async () => {
    const gate = deferred<unknown>();
    const fake = signupHarness({ signup: () => gate.promise });
    (fake.render().props.onSubmit as () => void)();
    assert.deepEqual(fake.steps, []);
    const form = fake.fill();
    (form.props.onSubmit as () => void)();
    (form.props.onSubmit as () => void)();
    assert.deepEqual(fake.steps, ['signup']);
    assert.equal(fake.storage.readSignupAttemptToken(), undefined);
    gate.resolve({ data: { signupAttemptToken: syntheticSignupToken } });
    await fake.runtime.finishTransitions();
    assert.deepEqual(fake.steps, ['signup', 'store', 'navigate']);
    assert.equal(fake.storage.readSignupAttemptToken(), syntheticSignupToken);
    assert.deepEqual([...fake.storage.values.values()], [syntheticSignupToken]);

    const failed = signupHarness({
      signup: async () => {
        throw new Error('synthetic failure');
      },
    });
    (failed.fill().props.onSubmit as () => void)();
    await failed.runtime.finishTransitions();
    assert.deepEqual(failed.steps, ['signup']);
    assert.equal(failed.storage.readSignupAttemptToken(), undefined);
  });

  it('가입 표식 누락/형식 오류/저장 실패는 기존 로그인 이동을 유지한다', async () => {
    for (const value of [undefined, 'invalid', syntheticSignupToken]) {
      const storage = createTokenStorage();
      if (value === syntheticSignupToken) storage.failures.write = true;
      const fake = signupHarness({
        storage,
        signup: async () => ({ data: { signupAttemptToken: value } }),
      });
      (fake.fill().props.onSubmit as () => void)();
      await fake.runtime.finishTransitions();
      assert.deepEqual(fake.steps, ['signup', 'store', 'navigate']);
      assert.equal(storage.readSignupAttemptToken(), undefined);
    }
  });

  it('로그인 응답 전에는 전송하지 않고 인증된 신규 가입 표식을 한 번만 소비한다', async () => {
    const gate = deferred<unknown>();
    const storage = createTokenStorage();
    storage.storeSignupAttemptToken(syntheticSignupToken);
    const fake = loginHarness({ storage, signin: () => gate.promise });
    const form = fake.fill();
    (form.props.onSubmit as () => void)();
    (form.props.onSubmit as () => void)();
    assert.equal(fake.requests.length, 1);
    assert.equal(fake.requests[0].signupAttemptToken, syntheticSignupToken);
    assert.deepEqual(fake.eventArguments, []);
    gate.resolve({ data: { signUpAnalyticsEligible: true } });
    await fake.runtime.finishTransitions();
    assert.deepEqual(fake.steps, ['signin', 'event', 'navigate', 'refresh']);
    assert.deepEqual(fake.eventArguments, [[]]);
    assert.equal(storage.readSignupAttemptToken(), undefined);
    (fake.render().props.onSubmit as () => void)();
    await fake.runtime.finishTransitions();
    assert.equal(fake.requests[1].signupAttemptToken, undefined);
    assert.equal(fake.eventArguments.length, 1);
  });

  it('로그인 실패는 표식을 보존하고 성공 재시도에서만 전송한다', async () => {
    let attempts = 0;
    const storage = createTokenStorage();
    storage.storeSignupAttemptToken(syntheticSignupToken);
    const fake = loginHarness({
      storage,
      signin: async () => {
        if (++attempts === 1)
          throw new ApiError(401, 'HTTP_ERROR', 'synthetic failure');
        return { data: { signUpAnalyticsEligible: true } };
      },
    });
    (fake.fill().props.onSubmit as () => void)();
    await fake.runtime.finishTransitions();
    assert.deepEqual(fake.steps, ['signin']);
    assert.equal(storage.readSignupAttemptToken(), syntheticSignupToken);
    assert.equal(fake.render().props.formError, 'Incorrect email or password.');
    (fake.render().props.onSubmit as () => void)();
    await fake.runtime.finishTransitions();
    assert.deepEqual(fake.eventArguments, [[]]);
  });

  it('기존 계정/재전송/알 수 없는 응답 또는 저장소 장애는 로그인만 완료한다', async () => {
    for (const scenario of [
      'missing',
      'malformed',
      'ineligible',
      'unknown',
      'read-failure',
      'consume-failure',
    ]) {
      const storage = createTokenStorage();
      if (scenario !== 'missing')
        storage.storeSignupAttemptToken(syntheticSignupToken);
      if (scenario === 'malformed') {
        const key = [...storage.values.keys()][0];
        storage.values.set(key, 'invalid');
      }
      if (scenario === 'read-failure') storage.failures.read = true;
      if (scenario === 'consume-failure') storage.failures.remove = true;
      const fake = loginHarness({
        storage,
        signin: async () => ({
          data:
            scenario === 'ineligible'
              ? { signUpAnalyticsEligible: false }
              : scenario === 'unknown'
                ? {}
                : { signUpAnalyticsEligible: true },
        }),
      });
      (fake.fill().props.onSubmit as () => void)();
      await fake.runtime.finishTransitions();
      assert.deepEqual(fake.steps, ['signin', 'navigate', 'refresh'], scenario);
      assert.deepEqual(fake.eventArguments, [], scenario);
      if (['missing', 'malformed', 'read-failure'].includes(scenario))
        assert.equal('signupAttemptToken' in fake.requests[0], false);
    }
  });

  it('분석 예외와 이후 이동 재시도는 인증 완료 이벤트를 중복하지 않는다', async () => {
    let navigations = 0;
    const storage = createTokenStorage();
    storage.storeSignupAttemptToken(syntheticSignupToken);
    const fake = loginHarness({
      storage,
      track() {
        throw new Error('synthetic analytics failure');
      },
      navigate() {
        if (++navigations === 1)
          throw new Error('synthetic navigation failure');
      },
    });
    (fake.fill().props.onSubmit as () => void)();
    await fake.runtime.finishTransitions();
    (fake.render().props.onSubmit as () => void)();
    await fake.runtime.finishTransitions();
    assert.equal(navigations, 2);
    assert.deepEqual(fake.eventArguments, [[]]);
  });
});

describe('GA4 취향 저장 성공 경계', () => {
  it('결과 조회와 저장 미동의 이동은 완료 이벤트를 만들지 않는다', async () => {
    const fake = tasteHarness();
    fake.openModal(false);
    assert.deepEqual(fake.events, []);
    await fake.complete();
    assert.deepEqual(fake.saved, []);
    assert.deepEqual(fake.events, []);
    assert.deepEqual(fake.destinations, ['/#share-products']);
  });

  it('저장 응답을 기다리고 겹친 클릭은 저장/이벤트를 중복하지 않는다', async () => {
    const gate = deferred<unknown>();
    const fake = tasteHarness({ save: () => gate.promise });
    fake.openModal(true);
    const first = fake.complete();
    await fake.complete();
    assert.equal(fake.saved.length, 1);
    assert.deepEqual(fake.events, []);
    assert.deepEqual(fake.destinations, []);
    gate.resolve({});
    await first;
    const profile = fake.saved[0];
    const count = tasteProfile.tasteRecommendationIds(
      profile.items,
      profile.kit,
    ).length;
    assert.ok(count > 0);
    assert.deepEqual(fake.events, [{ recommendationCount: count }]);
    assert.deepEqual(fake.steps, ['save', 'event', 'navigate']);
  });

  it('저장 실패 뒤 재시도는 가능하고 성공한 저장만 전송한다', async () => {
    let attempts = 0;
    const fake = tasteHarness({
      save: async () => {
        if (++attempts === 1) throw new Error('synthetic save failure');
        return {};
      },
    });
    fake.openModal(true);
    await fake.complete();
    assert.deepEqual(fake.events, []);
    assert.deepEqual(fake.destinations, []);
    const frame = fake.render();
    const status = findElement(
      frame.props.overlay,
      (node) => node.props.role === 'status',
    );
    assert.equal(
      status.props.children,
      'Could not save your preferences. Please try again.',
    );
    await fake.complete();
    assert.equal(fake.saved.length, 2);
    assert.equal(fake.events.length, 1);
  });

  it('분석 예외와 저장 이후 이동 실패는 추가 완료 이벤트를 만들지 않는다', async () => {
    let navigations = 0;
    const fake = tasteHarness({
      track() {
        throw new Error('synthetic analytics failure');
      },
      navigate() {
        if (++navigations === 1)
          throw new Error('synthetic navigation failure');
      },
    });
    fake.openModal(true);
    await fake.complete();
    await fake.complete();
    assert.equal(navigations, 2);
    assert.equal(fake.events.length, 1);
    assert.equal(
      typeof (fake.events[0] as { recommendationCount: unknown })
        .recommendationCount,
      'number',
    );
    assert.deepEqual(Object.keys(fake.events[0] as object), [
      'recommendationCount',
    ]);
  });
});

describe('GA4 실제 추천 카드 링크 콜백', () => {
  const product: HomeCardItem = {
    id: 'raw-19',
    name: 'Kale',
    imageUrl: '/synthetic.webp',
  };
  for (const [mode, source] of [
    ['ai', 'personalized'],
    ['random', 'random'],
  ] as const) {
    it(`${mode} 카드는 표시 상품과 전체 목록 인덱스를 클릭 때만 전송한다`, () => {
      const runtime = createRuntime();
      const events: unknown[] = [];
      const loaded = loadSource(
        'domains/home/components/ShareProductsCarousel.tsx',
        {
          '@/shared/components/CarouselContainer': {
            CarouselContainer: 'carousel',
          },
          './TasteFinderPromptCard': { TasteFinderPromptCard: 'taste-prompt' },
          './HomeProductCard': { HomeProductCard },
          '@/shared/lib/analytics/client': {
            trackRecommendationClick: (payload: unknown) =>
              events.push(payload),
          },
        },
        runtime,
      );
      const frame = runtime.render(loaded.ShareProductsCarousel, {
        products: [product],
        mode,
      });
      const carousel = findElement(frame, (node) => node.type === 'carousel');
      const card = element(
        (
          carousel.props.renderItem as (
            item: HomeCardItem,
            index: number,
          ) => unknown
        )(product, 6),
      );
      const link = element(
        HomeProductCard(card.props as Parameters<typeof HomeProductCard>[0]),
      );
      assert.deepEqual(events, []);
      assert.equal(link.props.href, '/products/raw-19');
      assert.equal(link.props.onClick, card.props.onClick);
      for (const interaction of [
        { metaKey: true, detail: 1 },
        { ctrlKey: true, detail: 1 },
        { detail: 0 },
      ]) {
        const event = Object.freeze({
          ...interaction,
          preventDefault() {
            assert.fail('navigation was prevented');
          },
          stopPropagation() {
            assert.fail('propagation was stopped');
          },
        });
        (link.props.onClick as (event: unknown) => void)(event);
      }
      assert.deepEqual(
        events,
        Array.from({ length: 3 }, () => ({
          itemId: product.id,
          itemName: product.name,
          index: 6,
          source,
        })),
      );
    });
  }

  it('취향 안내/일반 탐색/다른 공용 카드는 추천 클릭을 연결하지 않는다', () => {
    const runtime = createRuntime();
    const loaded = loadSource(
      'domains/home/components/ShareProductsCarousel.tsx',
      {
        '@/shared/components/CarouselContainer': {
          CarouselContainer: 'carousel',
        },
        './TasteFinderPromptCard': { TasteFinderPromptCard: 'taste-prompt' },
        './HomeProductCard': { HomeProductCard },
        '@/shared/lib/analytics/client': {
          trackRecommendationClick() {
            assert.fail('unexpected event');
          },
        },
      },
      runtime,
    );
    const frame = runtime.render(loaded.ShareProductsCarousel, {
      products: [product],
      mode: 'needs-taste',
    });
    assert.ok(findElement(frame, (node) => node.type === 'taste-prompt'));
    assert.throws(() => findElement(frame, (node) => node.type === 'carousel'));
    const otherCard = element(
      HomeProductCard({ product, href: '/products/raw-19' }),
    );
    assert.equal(otherCard.props.onClick, undefined);
    const explore = ProductCarousel({ products: [product] });
    const carousel = findElement(
      explore,
      (node) => typeof node.props.renderItem === 'function',
    );
    const link = element(
      (carousel.props.renderItem as (item: HomeCardItem) => unknown)(product),
    );
    assert.equal(link.props.onClick, undefined);
  });

  it('분석 예외에도 기존 추천 링크 콜백은 던지지 않는다', () => {
    const runtime = createRuntime();
    const loaded = loadSource(
      'domains/home/components/ShareProductsCarousel.tsx',
      {
        '@/shared/components/CarouselContainer': {
          CarouselContainer: 'carousel',
        },
        './TasteFinderPromptCard': { TasteFinderPromptCard: 'taste-prompt' },
        './HomeProductCard': { HomeProductCard },
        '@/shared/lib/analytics/client': {
          trackRecommendationClick() {
            throw new Error('synthetic analytics failure');
          },
        },
      },
      runtime,
    );
    const frame = runtime.render(loaded.ShareProductsCarousel, {
      products: [product],
      mode: 'ai',
    });
    const carousel = findElement(frame, (node) => node.type === 'carousel');
    const card = element(
      (
        carousel.props.renderItem as (
          item: HomeCardItem,
          index: number,
        ) => unknown
      )(product, 0),
    );
    const link = element(
      HomeProductCard(card.props as Parameters<typeof HomeProductCard>[0]),
    );
    assert.doesNotThrow(() => (link.props.onClick as () => void)());
    assert.equal(link.props.href, '/products/raw-19');
  });
});
