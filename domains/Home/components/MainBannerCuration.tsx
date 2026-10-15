import { CurationCarousel } from '@/shared/components/CurationCarousel';

export function MainBannerCuration() {
  return (
    <CurationCarousel
      slides={[
        {
          subtitle: 'LITTLE PORTIONS',
          title: '느긋하게 차리는,\n나의 한 접시',
          description: '오늘의 식탁을 채워 줄 작은 영감을 만나보세요.',
        },
      ]}
    />
  );
}
