// 모집 중 안내 영역
export default function PodNotificationNotice() {
  return (
    <section
      aria-labelledby="pod-notification-title"
      className="rounded-xl border border-current/15 bg-white/20 p-5"
    >
      <h2 id="pod-notification-title" className="font-bold">
        Track your buying group
      </h2>

      <p className="mt-2 text-sm leading-6">
        Payment opens when the group is full. Track its progress on this page.
      </p>
    </section>
  );
}
