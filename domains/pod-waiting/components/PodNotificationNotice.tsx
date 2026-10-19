// 모집 중 안내 영역
export default function PodNotificationNotice() {
  return (
    <section
      aria-labelledby="pod-notification-title"
      className="rounded-xl border border-current/15 bg-white/20 p-5"
    >
      <h2 id="pod-notification-title" className="font-bold">
        모집 현황을 확인해 주세요
      </h2>

      <p className="mt-2 text-sm leading-6">
        모집이 완료되면 결제할 수 있어요.
        현재 모집 상태는 이 페이지에서 확인해 주세요.
      </p>
    </section>
  );
}