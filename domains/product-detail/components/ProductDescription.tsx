import { ProductDescriptionData } from '../data/productDetail.types';

// 혹시 여러 값이 들어가도록 변경될까봐 props 별도로 정의함
type ProductDescriptionProps = {
  description: ProductDescriptionData | null;
};

export default function ProductDescription({
  description,
}: ProductDescriptionProps) {
  return (
    <section id="product-description" className="scroll-mt-24 space-y-10">
      <h2 className="text-2xl font-bold">상품 설명</h2>

      <section aria-labelledby="crop-story-heading">
        <h3 id="crop-story-heading">작물 이야기</h3>

        {/* 외부에서 전달받은 농장 이미지 URL이 있을 때만 표시합니다. */}
        {description?.imageUrl?.trim() && (
          // 외부 이미지의 도메인과 원본 비율을 그대로 사용합니다.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={description.imageUrl.trim()}
            alt={
              description.farmName
                ? `${description.farmName} 농장 풍경`
                : '작물 재배 농장 풍경'
            }
            loading="lazy"
            decoding="async"
            className="my-4 block h-auto w-full"
          />
        )}
        <p>{description?.farmName ?? '농장 정보 준비 중'}</p>
        <p>{description?.farmInfo ?? '농장 소개 준비 중'}</p>
      </section>

      <section aria-labelledby="product-details-heading">
        <h3 id="product-details-heading" className="text-lg font-bold">
          알아두면 좋은 정보
        </h3>

        <dl className="mt-4">
          <div className="grid grid-cols-[120px_1fr] gap-4 border-b py-3">
            <dt>구성·내용량</dt>
            <dd>{description?.basicInfo?.contentGuide ?? '정보 준비 중'}</dd>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-4 border-b py-3">
            <dt>원재료</dt>
            <dd>{description?.basicInfo?.ingredients ?? '정보 준비 중'}</dd>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-4 border-b py-3">
            <dt>알레르기</dt>
            <dd>{description?.basicInfo?.allergyInfo ?? '정보 준비 중'}</dd>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-4 border-b py-3">
            <dt>보관 방법</dt>
            <dd>{description?.basicInfo?.storageMethod ?? '정보 준비 중'}</dd>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-4 border-b py-3">
            <dt>배송 안내</dt>
            <dd>{description?.basicInfo?.shippingInfo ?? '정보 준비 중'}</dd>
          </div>
        </dl>

        {description?.basicInfo?.notice && (
          <p className="mt-4 text-sm">{description.basicInfo.notice}</p>
        )}
      </section>
      <section aria-labelledby="product-tips-heading">
        <h3 id="product-tips-heading" className="text-lg font-bold">
          나의 식탁에 담는 방법
        </h3>

        {description && description.tips.length > 0 ? (
          <ol className="mt-4">
            {description.tips.map((tip, index) => (
              <li
                key={tip.id}
                className="border-border grid grid-cols-[2rem_1fr] gap-4 border-t py-5"
              >
                <span
                  aria-hidden="true"
                  className="text-primary text-sm font-bold"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                <div className="space-y-2">
                  <h4 className="text-primary font-semibold">{tip.title}</h4>

                  <p className="text-sm leading-6 whitespace-pre-line">
                    {tip.content}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            활용 팁을 준비하고 있습니다.
          </p>
        )}
      </section>
    </section>
  );
}
