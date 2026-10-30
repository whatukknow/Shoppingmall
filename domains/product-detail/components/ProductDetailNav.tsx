import { NavigationAction } from '@/shared/components';

export default function ProductDetailNav() {
  return (
    <nav
      aria-label="Product details navigation"
      className="border-border w-full border-y"
    >
      <ul className="grid grid-cols-2">
        <li className="border-border min-w-0 border-r">
          <NavigationAction
            label="Product details"
            target={{ href: '#product-description' }}
            className="min-h-12 w-full"
          />
        </li>

        <li className="min-w-0">
          <NavigationAction
            label="Open buying groups"
            target={{ href: '#live-pods' }}
            className="min-h-12 w-full"
          />
        </li>
      </ul>
    </nav>
  );
}
