import type {
  TossPaymentsSDK,
  TossPaymentsWidgets,
  WidgetSelectedPaymentMethod,
} from '@tosspayments/tosspayments-sdk';

import type { PaymentMethods } from '@/domains/payment/data/payment.types';

export type TossPaymentWindowInput = {
  method: Exclude<PaymentMethods, ''>;
  orderId: string;
  orderName: string;
  amount: number;
  customerName: string;
  customerMobilePhone: string;
};

// SDK가 이 타입을 별도로 export하지 않으므로 실제 메서드 응답에서 추론한다.
type PaymentWindow = Awaited<
  ReturnType<TossPaymentsWidgets['renderPaymentWindow']>
>;

type WindowWidgets = Pick<
  TossPaymentsWidgets,
  'setAmount' | 'renderPaymentWindow' | 'requestPayment'
>;

type Dependencies = {
  loadSdk: (
    clientKey: string,
  ) => Promise<{ widgets: (input: { customerKey: string }) => WindowWidgets }>;
  customerKey: Parameters<TossPaymentsSDK['widgets']>[0]['customerKey'];
  getOrigin: () => string;
};

export class TossPaymentWindowError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'TossPaymentWindowError';
  }
}

export function validateWidgetClientKey(clientKey: string | undefined) {
  if (!clientKey || !/^(test|live)_gck_\S+$/.test(clientKey)) {
    throw new TossPaymentWindowError(
      'INVALID_WIDGET_CLIENT_KEY',
      '결제창형 결제용 클라이언트 키(gck)를 확인해주세요.',
    );
  }

  return clientKey;
}

function abortError() {
  const error = new Error('결제창 세션이 종료되었습니다.');
  error.name = 'AbortError';
  return error;
}

function matchesSiteMethod(
  selected: TossPaymentWindowInput['method'],
  actual: WidgetSelectedPaymentMethod,
) {
  // code가 CARD인 커스텀 수단도 있으므로 경로를 뜻하는 method를 검사한다.
  if (actual.method !== 'CARD') return false;

  return selected === 'tosspay'
    ? actual.card.easyPay === 'TOSSPAY'
    : actual.card.easyPay === undefined;
}

/**
 * 결제창 렌더 완료는 결제 세션 완료가 아니다. 취소·오류·abort 때만 종료하고,
 * Redirect 요청이 resolve되어도 페이지 이동/언마운트 전에는 잠금을 유지한다.
 * 공식 순서: https://docs.tosspayments.com/sdk/v2/js/payment-window
 */
export function createTossPaymentWindowController(dependencies: Dependencies) {
  let active = false;

  return {
    request(
      input: TossPaymentWindowInput,
      clientKey: string,
      signal: AbortSignal,
    ): Promise<void> {
      validateWidgetClientKey(clientKey);

      if (signal.aborted) return Promise.reject(abortError());
      if (active) {
        return Promise.reject(
          new TossPaymentWindowError(
            'PAYMENT_WINDOW_BUSY',
            '이미 결제창을 열고 있습니다.',
          ),
        );
      }

      active = true;

      return new Promise<void>((_resolve, reject) => {
        let ownedWindow: PaymentWindow | undefined;
        let stopped = false;
        let startupFinished = false;
        let submitting = false;
        let cleanup: Promise<void> | undefined;

        const destroyOwnedWindow = () => {
          if (!ownedWindow) return Promise.resolve();
          const windowToDestroy = ownedWindow;
          ownedWindow = undefined;
          // 소유한 창만 정리한다. 전역 clearTossPayments()는 사용하지 않는다.
          return Promise.resolve()
            .then(() => windowToDestroy.destroy())
            .catch(() => {
              // 원래 취소/실패를 보존하고 destroy 거절이 미처리되지 않게 한다.
            });
        };

        const releaseAfterCleanup = () => {
          cleanup = destroyOwnedWindow().finally(() => {
            if (startupFinished) active = false;
          });
          return cleanup;
        };

        const stop = async (error: unknown) => {
          if (stopped) return;
          stopped = true;
          signal.removeEventListener('abort', onAbort);
          // render가 아직 진행 중이면 아래 startup finally가 늦게 온 창도 제거한다.
          await releaseAfterCleanup();
          reject(error);
        };

        const onAbort = () => {
          void stop(abortError());
        };

        signal.addEventListener('abort', onAbort, { once: true });

        void (async () => {
          try {
            const sdk = await dependencies.loadSdk(clientKey);
            if (stopped) return;

            const widgets = sdk.widgets({
              customerKey: dependencies.customerKey,
            });
            await widgets.setAmount({ currency: 'KRW', value: input.amount });
            if (stopped) return;

            ownedWindow = await widgets.renderPaymentWindow({
              orderName: input.orderName,
            });
            if (stopped) return;

            ownedWindow.on('cancel', async () => {
              await stop(
                new TossPaymentWindowError(
                  'USER_CANCEL',
                  '결제가 취소되었습니다.',
                ),
              );
            });

            ownedWindow.on(
              'paymentRequest',
              async ({ paymentMethod, paymentInfo }) => {
                if (stopped || submitting) return;
                submitting = true;
                try {
                  // SDK는 수단 사전 선택을 지원하지 않는다. 기존 라디오의 선택과
                  // 구매자가 창에서 실제 고른 수단이 같은 경우에만 요청한다.
                  if (
                    !matchesSiteMethod(input.method, paymentMethod) ||
                    !matchesSiteMethod(input.method, paymentInfo)
                  ) {
                    throw new TossPaymentWindowError(
                      'PAYMENT_METHOD_MISMATCH',
                      '사이트와 결제창에서 같은 카드 또는 토스페이를 선택해주세요.',
                    );
                  }

                  if (
                    paymentInfo.amount.currency !== 'KRW' ||
                    paymentInfo.amount.value !== input.amount
                  ) {
                    throw new TossPaymentWindowError(
                      'PAYMENT_AMOUNT_MISMATCH',
                      '결제창의 금액이 주문 금액과 다릅니다.',
                    );
                  }

                  const origin = dependencies.getOrigin();
                  // event payload, method, amount는 이 요청에 전달하지 않는다.
                  await widgets.requestPayment({
                    orderId: input.orderId,
                    orderName: input.orderName,
                    customerName: input.customerName,
                    customerMobilePhone: input.customerMobilePhone,
                    successUrl: `${origin}/payment/pay-completed`,
                    failUrl: `${origin}/payment/pay-failed`,
                  });
                } catch (error) {
                  await stop(error);
                }
              },
            );
          } catch (error) {
            await stop(error);
          } finally {
            startupFinished = true;
            if (stopped) {
              await cleanup;
              await releaseAfterCleanup();
            }
          }
        })();
      });
    },
  };
}
