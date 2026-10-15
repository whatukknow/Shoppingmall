import { CurationCarousel, type CurationSlide } from '@/shared/components';

const slides: CurationSlide[] = [
  {
    subtitle: 'ISSUE 01',
    title: '느긋하게 차리는,\n나의 한 접시',
    description: '작은 식탁에 어울리는 오늘의 장보기 이야기를 만나보세요.',
  },
  {
    subtitle: 'LITTLE PORTIONS',
    title: '필요한 만큼,\n가볍게',
    description: '내게 맞는 양으로 더 즐거운 식탁을 준비해요.',
  },
  {
    subtitle: 'YOUR EVERYDAY MARKET',
    title: '매일의 식탁을\n다정하게',
    description: '좋은 재료와 함께하는 새로운 일상을 소개합니다.',
  },
];

export function MainBannerCuration() {
  return (
    <div className="mt-6">
      <CurationCarousel slides={slides} />
    </div>
  );
}
