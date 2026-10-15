import Link from 'next/link';

// 카테고리 하나의 모양
export type CategoryItem = {
  name: string;
  href: string;
};

type CategoryMenuViewProps = {
  isOpen: boolean;
  categories: CategoryItem[];
  onToggle: () => void;
  onClose: () => void;
};

// 카테고리 메뉴의 "모양"만 담당. 열림/닫힘은 Container가 알려줌
export function CategoryMenuView({
  isOpen,
  categories,
  onToggle,
  onClose,
}: CategoryMenuViewProps) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls="category-panel"
      >
        카테고리 ⌄
      </button>

      {isOpen && (
        <div
          id="category-panel"
          className="bg-background text-foreground border-foreground/20 absolute top-full right-4 left-4 z-50 mt-4 border px-10 py-10 text-base font-normal whitespace-normal"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[26px] font-bold">필요한 만큼, 골라 담아요.</p>
              <Link
                href="/products"
                onClick={onClose}
                className="mt-6 inline-block text-[15px] font-bold"
              >
                전체 상품 보기 ↗
              </Link>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[15px] font-bold"
            >
              닫기 ✕
            </button>
          </div>

          <hr className="border-foreground/30 my-6" />

          <ul className="grid grid-cols-4 gap-y-12">
            {categories.map((category) => (
              <li key={category.href}>
                <Link
                  href={category.href}
                  onClick={onClose}
                  className="text-[20px] font-bold hover:underline"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>

          <p className="font-heading mt-16 text-[14px] uppercase">
            Little Portion / Your everyday market
          </p>
        </div>
      )}
    </>
  );
}
