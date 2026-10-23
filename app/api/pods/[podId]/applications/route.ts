import {
  PodWriteError,
  applyPod,
  resolveIdempotencyKey,
} from '@/domains/pods/pods.write.server';

/** POST /api/pods/:podId/applications — 팟 참여 신청 (멱등 키: Idempotency-Key 헤더) */
export async function POST(
  request: Request,
  ctx: { params: Promise<{ podId: string }> },
): Promise<Response> {
  const { podId } = await ctx.params;
  const idempotencyKey = resolveIdempotencyKey(
    request.headers.get('Idempotency-Key'),
  );

  try {
    const data = await applyPod(podId, idempotencyKey);
    return Response.json({ data });
  } catch (e) {
    if (e instanceof PodWriteError) {
      return Response.json(
        { error: { message: e.message } },
        { status: e.status },
      );
    }
    console.error('소분팟 참여 신청 실패', e);
    return Response.json(
      {
        error: {
          message: '참여 신청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.',
        },
      },
      { status: 500 },
    );
  }
}
