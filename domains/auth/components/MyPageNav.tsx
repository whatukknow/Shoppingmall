import Link from 'next/link';

type MyPageNavProps = {
  name: string;
  active: 'pods' | 'profile' | 'taste';
  myPodsHref?: string;
  profileHref?: string;
  tasteHref?: string;
};

// 마이페이지 왼쪽 사이드 메뉴 (PC 전용)
// ProfileView 의 <nav> 블록을 그대로 옮긴 컴포넌트 — 모양·클래스 불변
export function MyPageNav({
  name,
  active,
  myPodsHref,
  profileHref,
  tasteHref,
}: MyPageNavProps) {
  const items = [
    {
      key: 'pods' as const,
      label: 'My buying groups',
      href: myPodsHref,
    },
    {
      key: 'profile' as const,
      label: 'My account',
      href: profileHref,
    },
    {
      key: 'taste' as const,
      label: 'Taste preferences',
      href: tasteHref,
    },
  ];

  return (
    <nav aria-label="Account menu" className="hidden flex-col gap-3 md:flex">
      <p className="font-bold">{name}</p>
      <ul className="flex flex-col gap-2 text-sm">
        {items.map((item) => (
          <li key={item.key}>
            {item.key === active ? (
              <span aria-current="page" className="font-bold">
                ● {item.label}
              </span>
            ) : item.href ? (
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-muted-foreground">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
