import Link from 'next/link';
import { Button } from '@/shared/components';
import Image from 'next/image';

interface PodCompletePageProps {
  params: Promise<{ id: string }>;
}

export default async function PotCompletePage({
  params,
}: PodCompletePageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  // TODO: 사용자의 완료된 팟이 있는지 pot id로 API로 확인
  return (
    <div className="flex flex-col gap-3 p-10">
      <h1 className="text-4xl font-bold">Your group is ready</h1>
      <div className="flex flex-col gap-10 md:flex-row">
        <div className="bg-accent flex flex-2 flex-col gap-3 p-3">
          <h2 className="text-3xl font-bold">Cherry tomato group A</h2>
          <ul>
            <li>Review your items</li>
            <li>and complete your payment.</li>
          </ul>
          <div className="mt-auto flex"></div>
          <Button
            type="button"
            variant="default"
            size="touch"
            className="min-h-10 w-full py-2"
            render={<Link href={`/pods/waiting?id=${id}`} />}
          >
            Review and pay
          </Button>
          <Button
            type="button"
            variant="actionOutline"
            size="touch"
            className="min-h-10 w-full py-2"
          >
            My buying groups
          </Button>
        </div>
        <div className="flex flex-col items-center gap-3">
          <Image
            className="shrink-0 border"
            src={''}
            alt="Image"
            width={300}
            height={200}
          />
          <ul className="bg-accent flex w-full flex-col gap-3 p-3">
            <li className="text-2xl font-bold">Your items</li>
            <li>Cherry tomatoes · 300g </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
