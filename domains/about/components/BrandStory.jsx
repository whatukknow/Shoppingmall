'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { MobileShoppingFlow } from './MobileShoppingFlow';
import { mountBrandStory } from '../motion/brandStoryMotion';

/** Page body only. The G-team root layout owns the navbar and footer. */
export default function BrandStory() {
  const rootRef = useRef(null);
  useEffect(() => {
    if (!rootRef.current) return;
    return mountBrandStory(rootRef.current);
  }, []);
  return (
    <main ref={rootRef} className="brand-story">
      <div id="brand-story-top">
        <section className="storySection intro">
          <div className="eb storySectionLabel font-sans">
            {'Small portions. A better table.'}
          </div>
          <h1>
            {'A table for one'}
            <br />
            {'deserves more choice.'}
          </h1>
          <p>
            {'Choose just enough. Share the freshness.'}
            <br />
            {'Little Portions starts with a table for one.'}
          </p>
          <div className="heroWords word">
            {'A LITTLE.'}
            <br />
            <span>{'TOGETHER.'}</span>
          </div>
          <a className="readMore" href="#people">
            {'Our story ↓'}
          </a>
        </section>
        <section className="storySection split" id="people">
          <div>
            <div className="eb storySectionLabel font-sans">
              {'01 / The way we live'}
            </div>
            <h2>
              {'Groceries that fit'}
              <br />
              {'a life of your own.'}
            </h2>
            <p>
              {'Different days. Different meals.'}
              <br />
              {'We want shopping to fit your table.'}
            </p>
          </div>
          <div className="stat">
            <div
              className="ring"
              role="img"
              aria-label="Provided planning figure: 36.6 percent"
            >
              <svg viewBox="0 0 240 240">
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  fill="none"
                  stroke="#E3D6B6"
                  strokeWidth="20"
                ></circle>
                <circle
                  className="ringInk"
                  cx="120"
                  cy="120"
                  r="100"
                  fill="none"
                  stroke="#591921"
                  strokeWidth="20"
                  strokeDasharray="230 629"
                  transform="rotate(-90 120 120)"
                ></circle>
              </svg>
              <div className="big" data-count="36.6">
                {'36.6'}
                <span>{'%'}</span>
              </div>
            </div>
            <span className="lab">
              {'Single-person households · provided figure'}
            </span>
          </div>
        </section>
        <section className="storySection portion split">
          <div className="stat">
            <div className="big" data-count="61">
              {'61'}
              <span>{'%'}</span>
            </div>
            <div className="portionDots" aria-hidden="true">
              <i className="on" style={{ '--j': '0' }}></i>
              <i className="on" style={{ '--j': '1' }}></i>
              <i className="on" style={{ '--j': '2' }}></i>
              <i className="on" style={{ '--j': '3' }}></i>
              <i className="on" style={{ '--j': '4' }}></i>
              <i className="on" style={{ '--j': '5' }}></i>
              <i className="on" style={{ '--j': '6' }}></i>
              <i className="on" style={{ '--j': '7' }}></i>
              <i className="on" style={{ '--j': '8' }}></i>
              <i className="on" style={{ '--j': '9' }}></i>
              <i className="on" style={{ '--j': '10' }}></i>
              <i className="on" style={{ '--j': '11' }}></i>
              <i className="on" style={{ '--j': '12' }}></i>
              <i className="on" style={{ '--j': '13' }}></i>
              <i className="on" style={{ '--j': '14' }}></i>
              <i className="on" style={{ '--j': '15' }}></i>
              <i className="on" style={{ '--j': '16' }}></i>
              <i className="on" style={{ '--j': '17' }}></i>
              <i className="on" style={{ '--j': '18' }}></i>
              <i className="on" style={{ '--j': '19' }}></i>
              <i className="on" style={{ '--j': '20' }}></i>
              <i className="on" style={{ '--j': '21' }}></i>
              <i className="on" style={{ '--j': '22' }}></i>
              <i className="on" style={{ '--j': '23' }}></i>
              <i className="on" style={{ '--j': '24' }}></i>
              <i className="on" style={{ '--j': '25' }}></i>
              <i className="on" style={{ '--j': '26' }}></i>
              <i className="on" style={{ '--j': '27' }}></i>
              <i className="on" style={{ '--j': '28' }}></i>
              <i className="on" style={{ '--j': '29' }}></i>
              <i className="on" style={{ '--j': '30' }}></i>
              <i className="on" style={{ '--j': '31' }}></i>
              <i className="on" style={{ '--j': '32' }}></i>
              <i className="on" style={{ '--j': '33' }}></i>
              <i className="on" style={{ '--j': '34' }}></i>
              <i className="on" style={{ '--j': '35' }}></i>
              <i className="on" style={{ '--j': '36' }}></i>
              <i className="on" style={{ '--j': '37' }}></i>
              <i className="on" style={{ '--j': '38' }}></i>
              <i className="on" style={{ '--j': '39' }}></i>
              <i className="on" style={{ '--j': '40' }}></i>
              <i className="on" style={{ '--j': '41' }}></i>
              <i className="on" style={{ '--j': '42' }}></i>
              <i className="on" style={{ '--j': '43' }}></i>
              <i className="on" style={{ '--j': '44' }}></i>
              <i className="on" style={{ '--j': '45' }}></i>
              <i className="on" style={{ '--j': '46' }}></i>
              <i className="on" style={{ '--j': '47' }}></i>
              <i className="on" style={{ '--j': '48' }}></i>
              <i className="on" style={{ '--j': '49' }}></i>
              <i className="on" style={{ '--j': '50' }}></i>
              <i className="on" style={{ '--j': '51' }}></i>
              <i className="on" style={{ '--j': '52' }}></i>
              <i className="on" style={{ '--j': '53' }}></i>
              <i className="on" style={{ '--j': '54' }}></i>
              <i className="on" style={{ '--j': '55' }}></i>
              <i className="on" style={{ '--j': '56' }}></i>
              <i className="on" style={{ '--j': '57' }}></i>
              <i className="on" style={{ '--j': '58' }}></i>
              <i className="on" style={{ '--j': '59' }}></i>
              <i className="on" style={{ '--j': '60' }}></i>
              <i style={{ '--j': '61' }}></i>
              <i style={{ '--j': '62' }}></i>
              <i style={{ '--j': '63' }}></i>
              <i style={{ '--j': '64' }}></i>
              <i style={{ '--j': '65' }}></i>
              <i style={{ '--j': '66' }}></i>
              <i style={{ '--j': '67' }}></i>
              <i style={{ '--j': '68' }}></i>
              <i style={{ '--j': '69' }}></i>
              <i style={{ '--j': '70' }}></i>
              <i style={{ '--j': '71' }}></i>
              <i style={{ '--j': '72' }}></i>
              <i style={{ '--j': '73' }}></i>
              <i style={{ '--j': '74' }}></i>
              <i style={{ '--j': '75' }}></i>
              <i style={{ '--j': '76' }}></i>
              <i style={{ '--j': '77' }}></i>
              <i style={{ '--j': '78' }}></i>
              <i style={{ '--j': '79' }}></i>
              <i style={{ '--j': '80' }}></i>
              <i style={{ '--j': '81' }}></i>
              <i style={{ '--j': '82' }}></i>
              <i style={{ '--j': '83' }}></i>
              <i style={{ '--j': '84' }}></i>
              <i style={{ '--j': '85' }}></i>
              <i style={{ '--j': '86' }}></i>
              <i style={{ '--j': '87' }}></i>
              <i style={{ '--j': '88' }}></i>
              <i style={{ '--j': '89' }}></i>
              <i style={{ '--j': '90' }}></i>
              <i style={{ '--j': '91' }}></i>
              <i style={{ '--j': '92' }}></i>
              <i style={{ '--j': '93' }}></i>
              <i style={{ '--j': '94' }}></i>
              <i style={{ '--j': '95' }}></i>
              <i style={{ '--j': '96' }}></i>
              <i style={{ '--j': '97' }}></i>
              <i style={{ '--j': '98' }}></i>
              <i style={{ '--j': '99' }}></i>
            </div>
            <span className="lab">
              {'Preference for single portions among people living alone'}
            </span>
          </div>
          <div>
            <div className="eb storySectionLabel font-sans">
              {'02 / Just the right amount'}
            </div>
            <h2>
              {'The joy of finishing a meal,'}
              <br />
              {'without the leftovers.'}
            </h2>
            <p>
              {'Less worry about finishing a whole pack.'}
              <br />
              {'More thought for today’s plate.'}
              <br />
              {'Our starting point is a portion for one.'}
            </p>
            <div className="portionService">
              <strong>Share a pack. Enjoy your portion.</strong>
              <p>Pick your ingredients and join a group to share an order.</p>
              <Link href="/products">Explore shared orders →</Link>
            </div>
          </div>
        </section>
        <section className="storySection shoppingBarriers">
          <div className="eb storySectionLabel font-sans">
            03 / The barriers to buying less
          </div>
          <h2>
            You only need a little.
            <br />
            Why does it take so much?
          </h2>
          <div className="painPair">
            <article className="pn">
              <span className="kwb">Too much to choose from</span>
              <div className="big painMetric" data-count="61.5">
                61.5<span>%</span>
              </div>
              <span className="lab">Shopping starts with a search</span>
              <p>
                Even when you don’t know what to eat,
                <br />
                start with your taste.
              </p>
            </article>
            <article className="pn">
              <span className="kwb">Delivery thresholds</span>
              <div className="price painMetric">
                <b>₩14k</b>
                <span>vs</span>
                <b>₩40k</b>
              </div>
              <span className="lab">Per shop / free-delivery threshold</span>
              <p>
                Instead of buying more for free delivery,
                <br />
                what if we shared just what we need?
              </p>
            </article>
          </div>
          <div className="serviceAnswers">
            <article className="serviceAnswer">
              <div className="eb">Discover through taste</div>
              <h3>Picked for your taste</h3>
              <p>
                Answer three playful food fortune questions
                <br />
                to discover ingredients and meal kits that fit your day.
              </p>
              <Link href="/onboarding">Find my food picks →</Link>
            </article>
            <article className="serviceAnswer">
              <div className="eb">Share just enough</div>
              <h3>A market for smaller portions</h3>
              <p>
                Get your share of ingredients sold in larger packs.
                <br />
                Join a buying group and make your next shop a little lighter.
              </p>
              <Link href="/products">Explore the market →</Link>
            </article>
          </div>
        </section>
        <section className="storySection funnelSection slide" id="together">
          <div className="eb storySectionLabel font-sans">
            {'04 / Meet Little Portions'}
          </div>
          <h2>
            {'From searching to discovering.'}
            <br />
            {'From filling a cart to sharing a pack.'}
          </h2>
          <p>
            {'Discover your next meal and order just what you need.'}
            <br />
            {'We designed a flow that makes smaller choices feel natural.'}
          </p>
          <div className="graphicHint">{'Compare the shopping journeys'}</div>
          <MobileShoppingFlow />
          <div className="s3wrap">
            <div
              className="scene3d"
              id="f3d"
              role="img"
              aria-label="Top: a typical Korean ecommerce journey in eight steps, from promotions to payment. Bottom: the proposed Little Portions journey in five steps, from discovery to joining a group."
            >
              <svg id="f3svg" aria-hidden="true"></svg>
              <div id="f3cards"></div>
              <div className="ctr c1">
                <b>{'8'}</b>
                <span>{'steps · Typical ecommerce'}</span>
              </div>
              <div className="ctr c2">
                <b>{'5'}</b>
                <span>{'steps · Little Portions'}</span>
              </div>
              <span className="hint">{'Hover over a card for details'}</span>
              <button type="button" className="rp" id="f3rp">
                {'↻ Replay (R)'}
              </button>
            </div>
          </div>
          <p className="graphicNote">
            {
              'The journey comparison and drop-off animation illustrate a UX hypothesis, not measured results.'
            }
          </p>
        </section>
        <section className="storySection scale">
          <div className="eb storySectionLabel font-sans">
            {'05 / Small tables add up'}
          </div>
          <h2>
            {'Shopping for one'}
            <br />
            {'is a bigger story.'}
          </h2>
          <div className="marketStats">
            <div>
              <div className="big">
                {'Approx. '}
                <b data-count="195">{'195'}</b>
                <span>{'× 10,000 people'}</span>
              </div>
              <span className="lab">
                {
                  'People in their 20s–30s living alone who shop for groceries online'
                }
              </span>
              <p>{'The everyday lives we design for.'}</p>
            </div>
            <div>
              <div className="big">
                {'Approx. '}
                <b data-count="22">{'22'}</b>
                <span>{'trillion KRW'}</span>
              </div>
              <span className="lab">
                {'Annual grocery spending by single-person households'}
              </span>
              <p>{'Countless choices that shape everyday meals.'}</p>
            </div>
          </div>
        </section>
        <section className="storySection closing">
          <div className="eb storySectionLabel">
            {'JUST ENOUGH, ALWAYS FRESH'}
          </div>
          <h2>
            {'Groceries sized'}
            <br />
            {'for your table.'}
          </h2>
          <p>{'Just enough. Fresh together.'}</p>
          <a href="#brand-story-top" className="storyButton">
            {'Back to our story ↑'}
          </a>
          <div className="word endLogo">{'Little portions'}</div>
        </section>
      </div>
      <aside className="storySources">
        <strong>{'Our story · Design prototype'}</strong>
        <p>
          {
            'Graphics and animations are based on the supplied demo day materials. Figures are provided planning assumptions.'
          }
          <br />
          {
            'The basis and reference year for 36.6%, and the scope and sources of each survey, need verification before publication. Approximately 1.95 million people and KRW 22 trillion are planning estimates. The free-delivery threshold is a comparison benchmark.'
          }
        </p>
      </aside>
    </main>
  );
}
