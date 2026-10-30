import { findCatalogProduct } from '@/domains/products/catalog/catalog';
import { CY } from './pixelEngine';

export type PixelRect = {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
};

// 기존 상품명으로 그린 픽셀은 재사용한다. 새 이름 때문에 kit 기본값이
// 표시되지 않도록 카탈로그 ID를 표시용 별칭과 분리해 연결한다.
const originalRawIcons: Readonly<Record<string, string>> = {
  'raw-02': '한 끼 토마토',
  'raw-04': '단호박',
  'raw-07': '작은 딸기 한 팩',
  'raw-08': '양파 소포장',
  'raw-10': '대파 소포장',
  'raw-13': '사과',
  'raw-14': '제철 귤',
  'raw-16': '구이용 소고기 소분',
  'raw-17': '달걀 소포장',
};

const colors = {
  outline: '#5B3B33',
  white: '#FFFFFF',
  cream: '#FFF6DE',
  yellow: '#FFD45E',
  lightYellow: '#FFF0B0',
  orange: '#FF9F4A',
  pink: '#F7A9B8',
  lightPink: '#FBD3DA',
  red: '#F2665E',
  green: '#6CC25C',
  darkGreen: '#3F9447',
  mint: '#BFE8A8',
  brown: '#C98A58',
  lightBrown: '#E8B67E',
  purple: '#A77BD0',
  darkPurple: '#6E4A8E',
  grey: '#CDD4DC',
  lightGrey: '#E9EDF1',
  navy: '#4F5E8C',
} as const;

function drawRawIcon(id: string): PixelRect[] {
  const cells: (string | null)[][] = Array.from({ length: 20 }, () =>
    Array<string | null>(20).fill(null),
  );
  const dot = (x: number, y: number, color: string) => {
    const row = cells[Math.round(y)];
    if (row && x >= 0 && x < 20) row[Math.round(x)] = color;
  };
  const ellipse = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    color: string,
  ) => {
    for (let y = 1; y < 19; y++) {
      for (let x = 1; x < 19; x++) {
        if (((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1)
          cells[y][x] = color;
      }
    }
  };
  const line = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    width = 1,
  ) => {
    const length = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
    for (let step = 0; step <= length; step++) {
      const x = x1 + ((x2 - x1) * step) / length;
      const y = y1 + ((y2 - y1) * step) / length;
      if (width === 1) dot(x, y, color);
      else ellipse(x, y, width / 2, width / 2, color);
    }
  };
  const leaf = (x: number, y: number, color: string, stem: string) => {
    ellipse(x, y, 3.1, 4.3, color);
    line(x, y - 2, x, y + 3, stem);
  };
  const berry = (x: number, y: number, color: string) => {
    ellipse(x, y, 3.1, 3.1, color);
    dot(x - 1, y - 1, colors.white);
  };

  switch (id) {
    case 'raw-01': // 참외: 노란 타원과 세로의 흰 줄
      ellipse(10, 11, 6, 7, colors.yellow);
      line(10, 2, 11, 4, colors.darkGreen);
      line(6, 7, 6, 14, colors.cream);
      line(10, 5, 10, 16, colors.cream);
      line(14, 7, 14, 14, colors.cream);
      break;
    case 'raw-03': // 머스크멜론: 둥근 연녹색 과피와 그물무늬
      ellipse(10, 11, 7, 7, colors.mint);
      line(10, 2, 10, 5, colors.darkGreen);
      line(7, 2, 13, 2, colors.brown);
      for (const [x, y] of [
        [5, 9],
        [8, 6],
        [8, 12],
        [11, 9],
        [11, 15],
        [14, 6],
        [14, 12],
      ]) {
        line(x, y, x + 2, y + 2, colors.cream);
        line(x + 2, y, x, y + 2, colors.cream);
      }
      break;
    case 'raw-05': // 홍감자: 붉은 껍질과 감자 눈
      ellipse(8, 11, 6, 6, '#C77E88');
      ellipse(13.5, 13, 4.5, 4.5, '#DB9AA0');
      for (const [x, y] of [
        [5, 9],
        [9, 7],
        [10, 13],
        [15, 12],
      ])
        dot(x, y, colors.outline);
      line(5, 7, 7, 6, colors.lightPink);
      break;
    case 'raw-06': // 적포도
      for (const [x, y] of [
        [6, 7],
        [11, 7],
        [15, 9],
        [7, 12],
        [12, 12],
        [10, 16],
      ])
        berry(x, y, colors.darkPurple);
      ellipse(12, 3, 3.5, 1.5, colors.green);
      line(9, 3, 9, 6, colors.brown);
      break;
    case 'raw-09': // 양배추: 둥근 잎이 겹친 결구
      ellipse(10, 11, 8, 7, colors.green);
      ellipse(8, 9, 5, 5, colors.mint);
      ellipse(12, 11, 4, 5, '#9CD67E');
      line(5, 8, 13, 15, colors.darkGreen);
      line(15, 7, 8, 16, colors.darkGreen);
      break;
    case 'raw-11': // 완두콩 꼬투리와 알
      line(4, 15, 15, 6, colors.darkGreen, 7);
      line(4, 14, 14, 6, colors.mint, 4);
      for (const [x, y] of [
        [5, 13],
        [9, 10],
        [13, 7],
      ])
        ellipse(x, y, 2, 2, colors.green);
      line(15, 5, 17, 3, colors.darkGreen);
      break;
    case 'raw-12': // 방울양배추: 작은 결구 세 개
      for (const [x, y] of [
        [6, 8],
        [14, 9],
        [10, 15],
      ]) {
        ellipse(x, y, 4, 4, colors.green);
        ellipse(x - 1, y - 1, 2.6, 2.6, colors.mint);
        line(x - 1, y - 2, x + 1, y + 2, colors.darkGreen);
      }
      break;
    case 'raw-15': // 수박 한 조각
      ellipse(10, 10, 8, 7, colors.darkGreen);
      ellipse(10, 9, 7, 6, colors.mint);
      ellipse(10, 8, 6, 5, colors.red);
      for (const [x, y] of [
        [7, 7],
        [11, 6],
        [13, 9],
        [9, 11],
      ])
        dot(x, y, colors.outline);
      break;
    case 'raw-18': // 돼지목살: 분홍 살과 지방 마블링
      ellipse(10, 11, 8, 6, colors.pink);
      ellipse(10, 11, 6.5, 4.5, colors.lightPink);
      line(5, 8, 13, 14, colors.cream, 2);
      line(11, 7, 8, 15, colors.pink, 2);
      break;
    case 'raw-19': // 닭다리: 살과 뼈 끝
      line(10, 11, 15, 16, colors.cream, 3);
      ellipse(14, 17, 1.5, 1.5, colors.white);
      ellipse(17, 15, 1.5, 1.5, colors.white);
      ellipse(8, 8, 5, 6, colors.lightPink);
      ellipse(7, 7, 3.2, 3.6, '#FBE4E6');
      break;
    case 'raw-20': // 블루베리
      for (const [x, y] of [
        [6, 8],
        [13, 7],
        [9, 14],
        [15, 14],
      ]) {
        berry(x, y, colors.navy);
        dot(x, y, colors.purple);
      }
      break;
    case 'raw-21': // 용과: 분홍 과피, 녹색 비늘과 씨 있는 흰 단면
      ellipse(10, 11, 6.5, 7, colors.pink);
      for (const [x, y] of [
        [5, 5],
        [14, 4],
        [4, 11],
        [15, 12],
      ])
        line(x, y, x + 1, y + 3, colors.green, 2);
      ellipse(10, 11, 4.3, 5, colors.cream);
      for (const [x, y] of [
        [8, 8],
        [11, 9],
        [8, 12],
        [12, 13],
        [10, 15],
      ])
        dot(x, y, colors.outline);
      break;
    case 'raw-22': // 복숭아
      ellipse(7.5, 11, 5.5, 6, colors.lightPink);
      ellipse(12.5, 11, 5.5, 6, colors.pink);
      line(10, 7, 9, 15, colors.red);
      ellipse(13, 3, 4, 1.5, colors.green);
      line(10, 3, 10, 5, colors.brown);
      break;
    case 'raw-23': // 고구마: 자주색의 긴 뿌리
      line(5, 14, 14, 7, colors.darkPurple, 8);
      line(6, 13, 13, 8, '#B87E9B', 5);
      for (const [x, y] of [
        [6, 12],
        [9, 10],
        [12, 8],
      ])
        dot(x, y, colors.lightBrown);
      break;
    case 'raw-24': // 케일: 주름진 진녹색 잎
      for (const [x, y] of [
        [6, 6],
        [11, 4],
        [15, 7],
        [6, 11],
        [13, 11],
      ])
        ellipse(x, y, 3.5, 3.5, colors.darkGreen);
      line(10, 6, 10, 18, colors.mint, 2);
      line(10, 11, 6, 8, colors.green);
      line(10, 13, 15, 9, colors.green);
      break;
    case 'raw-25': // 적근대: 붉은 잎맥
      leaf(6, 9, colors.darkGreen, colors.red);
      leaf(13, 8, colors.green, colors.red);
      line(6, 10, 11, 18, colors.red, 2);
      line(13, 9, 11, 18, colors.red, 2);
      break;
    case 'raw-26': // 꽃상추: 옅은 녹색의 펼쳐진 잎
      for (const [x, y] of [
        [4, 8],
        [8, 5],
        [13, 5],
        [16, 9],
        [8, 12],
        [13, 12],
      ])
        ellipse(x, y, 3.5, 4, colors.mint);
      line(10, 8, 10, 17, colors.cream, 2);
      line(10, 13, 5, 9, colors.green);
      line(10, 13, 15, 9, colors.green);
      break;
    case 'raw-27': // 배추: 긴 연녹색 결구와 흰 잎줄기
      ellipse(10, 10, 6.5, 8, colors.mint);
      ellipse(10, 13, 5.5, 4.5, colors.cream);
      line(7, 7, 8, 16, colors.green);
      line(13, 7, 12, 16, colors.green);
      line(10, 5, 10, 16, colors.white);
      break;
    case 'raw-28': // 골든키위 단면
      ellipse(10, 11, 7.5, 6.5, colors.brown);
      ellipse(10, 11, 6, 5, colors.yellow);
      ellipse(10, 11, 2, 2, colors.cream);
      for (const [x, y] of [
        [6, 8],
        [10, 7],
        [14, 9],
        [14, 13],
        [10, 15],
        [6, 13],
      ])
        dot(x, y, colors.outline);
      break;
    case 'raw-29': // 닭가슴살: 뼈 없는 옅은 살 두 조각
      ellipse(7, 10, 4.5, 7, '#FBE4E6');
      ellipse(13.5, 11, 4, 6, colors.lightPink);
      line(6, 7, 5, 13, colors.cream);
      line(14, 8, 13, 14, colors.cream);
      break;
    case 'raw-30': // 산딸기: 작은 붉은 알이 모인 열매
      for (const [x, y] of [
        [7, 8],
        [12, 8],
        [5, 12],
        [10, 12],
        [15, 12],
        [8, 16],
        [12, 16],
      ])
        ellipse(x, y, 2.3, 2.3, colors.red);
      line(7, 5, 13, 5, colors.green, 2);
      dot(10, 3, colors.darkGreen);
      break;
    case 'raw-31': // 갈치: 길고 은색인 몸통
      line(4, 5, 13, 8, colors.grey, 4);
      line(13, 8, 14, 13, colors.grey, 4);
      line(14, 13, 7, 17, colors.grey, 3);
      line(5, 4, 13, 7, colors.lightGrey);
      line(14, 10, 14, 13, colors.white);
      dot(4, 5, colors.navy);
      line(8, 17, 5, 18, colors.grey, 2);
      break;
    case 'raw-32': // 삼겹살: 살과 지방의 띠
      for (let y = 5; y <= 15; y++) {
        line(3, y, 17, y - 1, y % 4 < 2 ? colors.pink : colors.cream);
      }
      break;
    case 'raw-33':
    case 'raw-34': {
      // 고추: 휘어진 긴 과실과 초록 꼭지
      const color = id === 'raw-33' ? colors.green : colors.red;
      line(6, 6, 11, 10, color, 6);
      line(11, 10, 14, 15, color, 4);
      line(14, 15, 17, 16, color, 2);
      line(6, 6, 5, 3, colors.darkGreen, 2);
      line(8, 7, 10, 9, id === 'raw-33' ? colors.mint : colors.lightPink);
      break;
    }
  }

  // 원래 엔진과 같은 20x20 격자·갈색 외곽선·한 줄 rect 출력 형식을 유지한다.
  const outlined = cells.map((row) => [...row]);
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 20; x++) {
      if (cells[y][x]) continue;
      if (
        [
          [0, -1],
          [0, 1],
          [-1, 0],
          [1, 0],
        ].some(([dx, dy]) => cells[y + dy]?.[x + dx])
      )
        outlined[y][x] = colors.outline;
    }
  }
  const rects: PixelRect[] = [];
  for (let y = 0; y < 20; y++) {
    let x = 0;
    while (x < 20) {
      const fill = outlined[y][x];
      if (!fill) {
        x++;
        continue;
      }
      const start = x;
      while (x < 20 && outlined[y][x] === fill) x++;
      rects.push({ x: start, y, width: x - start, height: 1, fill });
    }
  }
  return rects;
}

const cachedRawIcons = new Map<string, PixelRect[]>();

/** 기존 캐릭터·장식·설문 아이콘은 건드리지 않고 카탈로그 상품만 연결한다. */
export function catalogPixelRects(name: string): PixelRect[] | undefined {
  if ((CY.names as string[]).includes(name)) return undefined;
  const product = findCatalogProduct(name);
  if (!product) return undefined;
  if ('sourceName' in product) return CY.px(product.sourceName) as PixelRect[];
  const originalName = originalRawIcons[product.id];
  if (originalName) return CY.px(originalName) as PixelRect[];
  let rects = cachedRawIcons.get(product.id);
  if (!rects) {
    rects = drawRawIcon(product.id);
    cachedRawIcons.set(product.id, rects);
  }
  return rects;
}
