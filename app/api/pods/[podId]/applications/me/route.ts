import {
  PodWriteError,
  cancelPodApplication,
} from '@/domains/pods/pods.write.server';

/** DELETE /api/pods/:podId/applications/me — 본인의 팟 참여 신청 취소 */
export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ podId: string }> },
): Promise<Response> {
  const { podId } = await ctx.params;
  void request;

  try {
    const data = await cancelPodApplication(podId);
    return Response.json({ data });
  } catch (e) {
    if (e instanceof PodWriteError) {
      return Response.json(
        { error: { message: e.message } },
        { status: e.status },
      );
    }
    console.error('소분팟 참여 취소 실패', e);
    return Response.json(
      {
        error: {
          message: 'Could not leave the group. Please try again shortly.',
        },
      },
      { status: 500 },
    );
  }
}
