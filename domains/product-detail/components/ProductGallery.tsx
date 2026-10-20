'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { ProductGalleryProps } from '../data/productDetail.types';

export default function ProductGallery({ name, images }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const imageList = images.filter((image) => image.trim() !== '');

  const currentIndex = Math.min(activeIndex, Math.max(imageList.length - 1, 0));

  const currentImage = imageList[currentIndex];

  return (
    <section aria-label="상품 이미지" className="w-full">
      {/* 메인 이미지 */}
      <div className="relative aspect-square w-full overflow-hidden">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={`${name} 상품 이미지 ${currentIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 540px"
            className="object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            상품 이미지 준비 중
          </div>
        )}
      </div>

      {/* 썸네일 목록 */}
      {imageList.length > 1 && (
        <div
          role="group"
          aria-label="상품 이미지 선택"
          className="mt-3 grid grid-cols-4 gap-3"
        >
          {imageList.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`${index + 1}번 상품 이미지 보기`}
              aria-pressed={currentIndex === index}
              className={`focus-visible:outline-primary relative aspect-square overflow-hidden border-2 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                currentIndex === index ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="120px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
