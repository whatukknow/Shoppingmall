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
      <h2 className="text-2xl font-bold">Product details</h2>

      <section aria-labelledby="crop-story-heading">
        <h3 id="crop-story-heading">From the farm</h3>

        {/* 외부에서 전달받은 농장 이미지 URL이 있을 때만 표시합니다. */}
        {description?.imageUrl?.trim() && (
          // 외부 이미지의 도메인과 원본 비율을 그대로 사용합니다.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={description.imageUrl.trim()}
            alt={
              description.farmName
                ? `${description.farmName} farm landscape`
                : 'The farm where it grows'
            }
            loading="lazy"
            decoding="async"
            className="my-4 block h-auto w-full"
          />
        )}
        <p>{description?.farmName ?? 'Farm details coming soon'}</p>
        <p>{description?.farmInfo ?? 'Farm story coming soon'}</p>
      </section>

      <section aria-labelledby="product-details-heading">
        <h3 id="product-details-heading" className="text-lg font-bold">
          Good to know
        </h3>

        <dl className="mt-4">
          <div className="grid grid-cols-[120px_1fr] gap-4 border-b py-3">
            <dt>Contents and quantity</dt>
            <dd>
              {description?.basicInfo?.contentGuide ?? 'Details coming soon'}
            </dd>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-4 border-b py-3">
            <dt>Ingredients</dt>
            <dd>
              {description?.basicInfo?.ingredients ?? 'Details coming soon'}
            </dd>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-4 border-b py-3">
            <dt>Allergens</dt>
            <dd>
              {description?.basicInfo?.allergyInfo ?? 'Details coming soon'}
            </dd>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-4 border-b py-3">
            <dt>Storage</dt>
            <dd>
              {description?.basicInfo?.storageMethod ?? 'Details coming soon'}
            </dd>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-4 border-b py-3">
            <dt>Delivery</dt>
            <dd>
              {description?.basicInfo?.shippingInfo ?? 'Details coming soon'}
            </dd>
          </div>
        </dl>

        {description?.basicInfo?.notice && (
          <p className="mt-4 text-sm">{description.basicInfo.notice}</p>
        )}
      </section>
      <section aria-labelledby="product-tips-heading">
        <h3 id="product-tips-heading" className="text-lg font-bold">
          Ideas for your table
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
            Serving ideas coming soon.
          </p>
        )}
      </section>
    </section>
  );
}
