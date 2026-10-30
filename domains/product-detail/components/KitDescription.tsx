import { foodLabel } from '@/shared/lib/food-label';
import { translateProductText } from '@/domains/products/product-copy.en';
import Image from 'next/image';
import kits from '@/domains/products/data/diyKits.json';

export default function KitDescription({ id }: { id: string }) {
  const kit = kits.find((item) => item.id === id);
  if (!kit) return null;
  const name = foodLabel(kit.name);
  const included = kit.included.map(foodLabel).join(' · ');
  const image = (role: keyof typeof kit.imageAssets, alt: string) => {
    const src = kit.imageAssets[role];
    return src ? (
      <div className="relative aspect-square w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 767px) calc(100vw - 32px), 480px"
          className="object-cover"
        />
      </div>
    ) : null;
  };
  return (
    <section id="product-description" className="scroll-mt-40 space-y-10">
      <h2 className="text-2xl font-bold">Product details</h2>
      <section className="kit-composition" aria-labelledby="kit-story-heading">
        <div className="kit-composition-copy">
          <h3 id="kit-story-heading">What goes into your kit</h3>
          <p className="leading-7">
            {kit.included.length
              ? `Combine ${included} with ingredients from home to make a meal of your own.`
              : 'Included ingredients are under review.'}
          </p>
        </div>
        <figure className="kit-composition-figure">
          {image('02', `${name} — included ingredient concept`)}
          <figcaption className="text-muted-foreground mt-3 text-sm">
            {kit.included.length
              ? `Included ingredients: ${included}. This is an AI-generated example; delivery specifications are not yet confirmed.`
              : 'Included ingredients are still to be confirmed.'}
          </figcaption>
        </figure>
      </section>
      <section id="kit-contents" className="scroll-mt-40 space-y-6">
        <h3>A recipe for one</h3>
        <div className="grid gap-8 md:grid-cols-2">
          {[
            { title: 'Included in this kit', items: kit.includedIngredients },
            { title: 'Bring your own', items: kit.pantryIngredients },
          ].map((group) => (
            <div key={group.title}>
              <h4 className="mb-3 font-semibold">{group.title}</h4>
              {group.items.length ? (
                <dl>
                  {group.items.map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between gap-4 border-t py-3"
                    >
                      <dt>{foodLabel(item.name)}</dt>
                      <dd className="shrink-0">
                        {item.amount}{' '}
                        {item.unit === '개'
                          ? item.amount === 1
                            ? 'piece'
                            : 'pieces'
                          : item.unit}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p>Contents under review</p>
              )}
            </div>
          ))}
        </div>
        <p className="text-muted-foreground text-sm">
          Amounts and recipes are proposals for review. Retail and delivery
          weights are not yet confirmed. Ingredients listed under “Bring your
          own” are not included.
        </p>
      </section>
      <section id="kit-recipe" className="scroll-mt-40 space-y-4">
        <h3>Make it your own</h3>
        <div className="mx-auto max-w-[480px]">
          {image('03', `${name} — preparation and cooking example`)}
        </div>
        <ol>
          {kit.recipeSteps.map((step, index) => (
            <li
              key={step}
              className="grid grid-cols-[2rem_1fr] gap-4 border-t py-5"
            >
              <span aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p>{translateProductText(step)}</p>
            </li>
          ))}
        </ol>
      </section>
      {kit.storyImage && (
        <section className="kit-composition">
          <div className="kit-composition-copy">
            <h3>From ingredients to your table</h3>
            <p>
              Prepare and cook the ingredients to create a plate of your own.
            </p>
          </div>
          <div className="kit-composition-figure">
            {image('07', `${name} — ingredients and serving concept`)}
          </div>
        </section>
      )}
      <p className="text-muted-foreground text-sm leading-6">
        {translateProductText(kit.reviewNote)} Check each supplier’s product
        label for allergen and storage information.
      </p>
    </section>
  );
}
