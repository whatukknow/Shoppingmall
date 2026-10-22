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
            {'작게 나누는 좋은 식탁'}
          </div>
          <h1>
            {'혼자 먹는 식탁에도,'}
            <br />
            {'충분한 선택이 필요하니까.'}
          </h1>
          <p>
            {'필요한 만큼 고르고, 함께 신선함을 나누는 일.'}
            <br />
            {'Little portions는 한 사람의 식탁에서 시작합니다.'}
          </p>
          <div className="heroWords word">
            {'A LITTLE.'}
            <br />
            <span>{'TOGETHER.'}</span>
          </div>
          <a className="readMore" href="#people">
            {'우리의 이야기 ↓'}
          </a>
        </section>
        <section className="storySection split" id="people">
          <div>
            <div className="eb storySectionLabel font-sans">
              {'01 / 달라진 생활'}
            </div>
            <h2>
              {'혼자 사는 삶에 맞는'}
              <br />
              {'장보기가 필요합니다.'}
            </h2>
            <p>
              {'서로 다른 하루, 저마다의 한 끼.'}
              <br />
              {'우리는 그 식탁의 크기에 맞추고 싶습니다.'}
            </p>
          </div>
          <div className="stat">
            <div className="ring" role="img" aria-label="제공 수치 36.6퍼센트">
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
            <span className="lab">{'1인 가구 비중 · 제공 수치'}</span>
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
            <span className="lab">{'1인 가구의 1인용 용량 선호'}</span>
          </div>
          <div>
            <div className="eb storySectionLabel font-sans">
              {'02 / 나에게 알맞은 양'}
            </div>
            <h2>
              {'많이 사는 것보다,'}
              <br />
              {'남김없이 먹는 기쁨.'}
            </h2>
            <p>
              {'한 봉지를 다 먹을 걱정보다'}
              <br />
              {'오늘 먹을 한 접시를 생각할 수 있도록.'}
              <br />
              {'우리가 생각하는 기본 단위는 한 사람의 분량입니다.'}
            </p>
            <div className="portionService">
              <strong>한 사람의 분량으로, 함께 나눠요.</strong>
              <p>필요한 식재료를 고르고 함께 나눌 팟에 참여해요.</p>
              <Link href="/products">함께 나눌 상품 보기 →</Link>
            </div>
          </div>
        </section>
        <section className="storySection shoppingBarriers">
          <div className="eb storySectionLabel font-sans">
            03 / 장보기 앞에서
          </div>
          <h2>
            조금만 사고 싶은데,
            <br />
            넘어야 할 문턱은 큽니다.
          </h2>
          <div className="painPair">
            <article className="pn">
              <span className="kwb">고르기 어렵다</span>
              <div className="big painMetric" data-count="61.5">
                61.5<span>%</span>
              </div>
              <span className="lab">상품을 찾을 때 검색부터 시작</span>
              <p>
                무엇을 먹을지 정하지 못한 날에도,
                <br />
                이제 내 취향에서 장보기를 시작해요.
              </p>
            </article>
            <article className="pn">
              <span className="kwb">배송비 문턱</span>
              <div className="price painMetric">
                <b>1.4만</b>
                <span>vs</span>
                <b>4만</b>
              </div>
              <span className="lab">1회 장보기 / 무료배송 문턱</span>
              <p>
                무료배송을 위해 더 담는 대신,
                <br />
                필요한 양을 함께 나눌 수 있다면.
              </p>
            </article>
          </div>
          <div className="serviceAnswers">
            <article className="serviceAnswer">
              <div className="eb">취향으로 발견하기</div>
              <h3>AI가 추천하는 당신의 장바구니</h3>
              <p>
                한 끼 사주의 세 가지 질문에 답하고,
                <br />
                나에게 어울리는 식재료와 한 끼 키트를 발견해요.
              </p>
              <Link href="/onboarding">내 취향 추천 보기 →</Link>
            </article>
            <article className="serviceAnswer">
              <div className="eb">필요한 만큼 나누기</div>
              <h3>함께 나누는 소분마켓</h3>
              <p>
                혼자 사기엔 많은 식재료도 필요한 양만큼.
                <br />
                함께 나눌 소분팟을 찾아 장보기 부담을 덜어요.
              </p>
              <Link href="/products">소분마켓 둘러보기 →</Link>
            </article>
          </div>
        </section>
        <section className="storySection funnelSection slide" id="together">
          <div className="eb storySectionLabel font-sans">
            {'04 / 그래서, Little portions'}
          </div>
          <h2>
            {'검색에서 취향으로.'}
            <br />
            {'장바구니에서 소분 신청으로.'}
          </h2>
          <p>
            {'나에게 맞는 한 끼를 발견하고, 필요한 만큼 신청하는 흐름.'}
            <br />
            {'작은 선택이 더 자연스럽게 이어지도록 생각했습니다.'}
          </p>
          <div className="graphicHint">{'장보기 흐름을 비교해보세요'}</div>
          <MobileShoppingFlow />
          <div className="s3wrap">
            <div
              className="scene3d"
              id="f3d"
              role="img"
              aria-label="위: 국내 이커머스 공통 흐름 8단계(특가 배너, 검색, 상품 목록, 상품 상세, 옵션·수량, 장바구니, 회원·최소금액, 결제). 아래: Little Portions 5단계(메인, AI 취향 설문, 추천 음식, 상품 상세, 소분 신청)."
            >
              <svg id="f3svg" aria-hidden="true"></svg>
              <div id="f3cards"></div>
              <div className="ctr c1">
                <b>{'8'}</b>
                <span>{'단계 · 국내 이커머스'}</span>
              </div>
              <div className="ctr c2">
                <b>{'5'}</b>
                <span>{'단계 · Little Portions'}</span>
              </div>
              <span className="hint">{'카드에 마우스를 올리면 단계 설명'}</span>
              <button type="button" className="rp" id="f3rp">
                {'↻ 다시 재생 (R)'}
              </button>
            </div>
          </div>
          <p className="graphicNote">
            {'그래픽의 단계 비교와 이탈 표현은 데모데이의 UX 기획 가설입니다.'}
          </p>
        </section>
        <section className="storySection scale">
          <div className="eb storySectionLabel font-sans">
            {'05 / 작은 식탁이 모이면'}
          </div>
          <h2>
            {'한 사람의 장보기는'}
            <br />
            {'작은 이야기가 아닙니다.'}
          </h2>
          <div className="marketStats">
            <div>
              <div className="big">
                {'약 '}
                <b data-count="195">{'195'}</b>
                <span>{'만 명'}</span>
              </div>
              <span className="lab">{'2030 온라인 장보기 1인 가구수'}</span>
              <p>{'우리가 떠올리는 사람들의 생활.'}</p>
            </div>
            <div>
              <div className="big">
                {'약 '}
                <b data-count="22">{'22'}</b>
                <span>{'조 원'}</span>
              </div>
              <span className="lab">{'1인 가구 연간 식료품 지출'}</span>
              <p>{'매일의 식탁을 만드는 수많은 선택.'}</p>
            </div>
          </div>
        </section>
        <section className="storySection closing">
          <div className="eb storySectionLabel">
            {'JUST ENOUGH, ALWAYS FRESH'}
          </div>
          <h2>
            {'장보기의 크기를'}
            <br />
            {'당신의 식탁에 맞춥니다.'}
          </h2>
          <p>{'필요한 만큼, 함께 신선하게.'}</p>
          <a href="#brand-story-top" className="storyButton">
            {'Little portions의 이야기 다시 보기 ↑'}
          </a>
          <div className="word endLogo">{'Little portions'}</div>
        </section>
      </div>
      <aside className="storySources">
        <strong>{'브랜드 이야기 · 디자인 시안'}</strong>
        <p>
          {
            '제공된 데모데이 자료의 그래픽과 움직임을 활용했습니다. 수치는 사용자 제공 기획값입니다.'
          }
          <br />
          {
            '36.6%의 분모(인구/가구)와 기준 연도, 각 조사의 범위·출처는 실제 게시 전 확인이 필요합니다. 약 195만 명·약 22조 원은 기획상 추정값이며 무료배송 문턱은 비교 기준입니다.'
          }
        </p>
      </aside>
    </main>
  );
}
