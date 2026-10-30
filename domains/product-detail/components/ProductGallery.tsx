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
    <section aria-label="Product image" className="product-gallery w-full">
      {/* 메인 이미지 */}
      <div className="product-gallery-main relative aspect-square w-full overflow-hidden">
        {currentImage ? (
          <Image
            src={currentImage}
            alt={`${name}, image ${currentIndex + 1}`}
            fill
            sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) 600px, 620px"
            className="object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center">
            Product image coming soon
          </div>
        )}
      </div>

      {/* 썸네일 목록 */}
      {imageList.length > 1 && (
        <div
          role="group"
          aria-label="Choose a product image"
          className="product-gallery-thumbnails mt-3 grid grid-cols-4 gap-3"
        >
          {imageList.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View product image ${index + 1}`}
              aria-pressed={currentIndex === index}
              className={`focus-visible:outline-primary relative aspect-square overflow-hidden border-2 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                currentIndex === index ? 'border-primary' : 'border-transparent'
              }`}
            >
              <Image
                src={image}
                alt=""
                fill
                sizes="72px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
