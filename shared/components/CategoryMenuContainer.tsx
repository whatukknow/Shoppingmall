'use client'; // 클릭에 반응하는 부분의 경계

import { useState } from 'react';
import { CategoryMenuView, type CategoryItem } from './CategoryMenuView';

// 임시 카테고리 목록 (회의록의 8개 카테고리)
// GET categories API가 준비되면 이 목록 대신 API 데이터를 넘기기
const defaultCategories: CategoryItem[] = [
  { name: '채소', href: '/category/vegetable' },
  { name: '과일', href: '/category/fruit' },
  { name: '육류·계란', href: '/category/meat-egg' },
  { name: '해산물', href: '/category/seafood' },
  { name: '유제품', href: '/category/dairy' },
  { name: '곡물·면·빵', href: '/category/grain' },
  { name: '조미료·소스', href: '/category/sauce' },
  { name: '스낵·제과', href: '/category/snack' },
];

export default function CategoryMenuContainer() {
  // 열림/닫힘 스위치. 처음엔 닫힌 상태
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <CategoryMenuView
      isOpen={isOpen}
      categories={defaultCategories}
      onToggle={handleToggle}
      onClose={handleClose}
    />
  );
}
