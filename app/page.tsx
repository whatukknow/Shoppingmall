import { MainNavigation, MastHead } from '@/shared/components';
import { FreshPickCardContainer } from '@/domains/Home/components/FreshPickCardContainer';
import { MainBannerCuration } from '@/domains/Home/components/MainBannerCuration';
import { PortionMarket } from '@/domains/Home/components/PortionMarket';
import { StoryCardsContainer } from '@/domains/Home/components/StoryCardsContainer';
import { YourPantryContainer } from '@/domains/Home/components/YourPantryContainer';

export default function Home() {
  return (
    <main className="bg-background min-h-screen">
      <MastHead />
      <MainBannerCuration />
      <MainNavigation />
      <StoryCardsContainer />
      {/* 오늘의 식탁, 어디로 떠나볼까요? */}
      <FreshPickCardContainer />
      {/* 01 Fresh Picks */}
      <YourPantryContainer products={[]} />
      {/* 취향을 담는 장바구니: 실제 상품·장바구니 연결 전 */}
      <PortionMarket href="/portion-market" />
      {/* 소분 마켓 */}
    </main>
  );
}
