import { NavigationAction } from '@/shared/components';

export default function ProductDetailNav() {
  return (
    <nav aria-label="상품 상세 메뉴" className="border-border w-full border-y">
      <ul className="grid grid-cols-2">
        <li className="border-border min-w-0 border-r">
          <NavigationAction
            label="상품 설명"
            target={{ href: '#product-description' }}
            className="min-h-12 w-full"
          />
        </li>

        <li className="min-w-0">
          <NavigationAction
            label="모집 중인 팟"
            target={{ href: '#live-pods' }}
            className="min-h-12 w-full"
          />
        </li>
      </ul>
    </nav>
  );
}
