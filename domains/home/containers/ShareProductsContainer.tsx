// 서버에서 회원별 추천 데이터를 읽고 기존 캐러셀에 전달하는 경계
import { ShareProductsCarousel } from '@/domains/home/components/ShareProductsCarousel';
import {
  getAiRecommendations,
  getRandomRecommendations,
  getRecommendationStatus,
} from '@/domains/home/home.api';
import { loadHomeRecommendations } from '@/domains/home/data/homeRecommendations';

export default async function ShareProductsContainer() {
  const { products, mode } = await loadHomeRecommendations(
    await getRecommendationStatus(),
    { ai: getAiRecommendations, random: getRandomRecommendations },
  );
  return <ShareProductsCarousel products={products} mode={mode} />;
}
