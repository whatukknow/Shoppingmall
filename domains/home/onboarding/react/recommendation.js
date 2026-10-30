export var EL = {
  목: {
    h: '木',
    e: 'el:목',
    c: '#5E8B4A',
    tint: '#E3EEDB',
    t: 'A green table',
    copy: 'Start the week fresh. Green ingredients are your match.',
    go: ['한 줌의 바질', '레몬', '오이', '잎채소 소분 믹스', '고수'],
  },
  화: {
    h: '火',
    e: 'el:화',
    c: '#C2412F',
    tint: '#F6DDD6',
    t: 'A vibrant table',
    copy: 'A week full of energy. Try vibrant red ingredients.',
    go: [
      '한 끼 토마토',
      '작은 딸기 한 팩',
      '사과',
      '채끝 스테이크 소분',
      '당근',
    ],
  },
  토: {
    h: '土',
    e: 'el:토',
    c: '#C9902A',
    tint: '#F6E8C8',
    t: 'A golden table',
    copy: 'A grounded, comforting week. Warm golden ingredients are your match.',
    go: ['달걀 소포장', '단호박', '밤', '감자', '버터 소포장'],
  },
  금: {
    h: '金',
    e: 'el:금',
    c: '#8C8270',
    tint: '#EFEBE2',
    t: 'A simple table',
    copy: 'Keep it simple this week. Gentle, light ingredients are your match.',
    go: ['우유 소포장', '양송이', '두부', '양파 소포장', '닭고기 소포장'],
  },
  수: {
    h: '水',
    e: 'el:수',
    c: '#2F4A6A',
    tint: '#DCE5EF',
    t: 'A sea-inspired table',
    copy: 'A calm, nourishing week. Explore seafood and savory flavors.',
    go: ['손질 새우', '손질 꽃게', '손질 오징어', '무화과', '참치캔'],
  },
};
var ANI = [
  '쥐',
  '소',
  '호랑이',
  '토끼',
  '용',
  '뱀',
  '말',
  '양',
  '원숭이',
  '닭',
  '개',
  '돼지',
].map(function (n) {
  return [n, 'ani:' + n];
});
var STEM = ['금', '금', '수', '수', '목', '목', '화', '화', '토', '토'];
export function saju(y, m, d) {
  var yy = m < 2 || (m === 2 && d < 4) ? y - 1 : y;
  var a = ANI[(((yy - 4) % 12) + 12) % 12];
  return { el: STEM[yy % 10], animal: a[0], ae: a[1], y: yy };
}

var P = [
  ['브리오슈 프렌치토스트', 'K', '토', 'b'],
  ['토마토 라구 파스타', 'K', '화', 'cn'],
  ['와플 브런치', 'K', '토', 'b'],
  ['새우와 구운 채소', 'K', '수', 'c'],
  ['딸기 크림 케이크', 'K', '금', 'nb'],
  ['햄 프렌치토스트', 'K', '토', 'b'],
  ['햄·달걀 바게트', 'K', '토', 'bp'],
  ['토마토 리가토니', 'K', '화', 'c'],
  ['버섯 크림 파스타', 'K', '금', 'cn'],
  ['피크닉 베이글 샌드위치', 'K', '금', 'p'],
  ['에그 샌드위치', 'K', '토', 'pb'],
  ['토마토 치즈 샐러드', 'K', '화', 'np'],
  ['청포도 치즈 샐러드', 'K', '목', 'pn'],
  ['바질페스토 그린 샐러드', 'K', '목', 'pb'],
  ['새우·달걀 브런치', 'K', '수', 'b'],
  ['청어알 메밀 비빔면', 'K', '수', 'nc'],
  ['타코 샐러드', 'K', '화', 'pn'],
  ['토마토 뇨키', 'K', '화', 'c'],
  ['달걀 치즈 파스타', 'K', '토', 'cn'],
  ['베이글 아침 식탁', 'K', '금', 'b'],
  ['피크닉 샌드위치 박스', 'K', '', 'p'],
  ['토마토 바질 한 접시', 'K', '', 'c'],
  ['참외', 'R', '토', 'bp'],
  ['완숙 토마토', 'R', '화', 'cp', 'v'],
  ['머스크멜론', 'R', '토', 'bp'],
  ['단호박', 'R', '토', 'c', 'v'],
  ['홍감자', 'R', '토', 'c', 'v'],
  ['적포도', 'R', '수', 'pn'],
  ['설향 딸기', 'R', '화', 'bp'],
  ['양파', 'R', '금', 'c', 'v'],
  ['양배추', 'R', '목', 'c', 'v'],
  ['대파', 'R', '목', 'cn', 'v'],
  ['완두콩', 'R', '목', 'c', 'v'],
  ['방울양배추', 'R', '목', 'c', 'v'],
  ['사과', 'R', '화', 'pb'],
  ['감귤', 'R', '토', 'np'],
  ['수박', 'R', '수', 'np'],
  ['스테이크용 고기', 'R', '화', 'cn'],
  ['계란', 'R', '토', 'bc'],
  ['돼지목살', 'R', '화', 'cn'],
  ['닭다리', 'R', '금', 'bc'],
  ['블루베리', 'R', '수', 'bp'],
  ['용과', 'R', '화', 'np'],
  ['복숭아', 'R', '화', 'bp'],
  ['고구마', 'R', '토', 'cn', 'v'],
  ['케일', 'R', '목', 'cp', 'v'],
  ['적근대', 'R', '목', 'cp', 'v'],
  ['꽃상추', 'R', '목', 'bp', 'v'],
  ['배추', 'R', '목', 'cn', 'v'],
  ['골든키위', 'R', '토', 'bp'],
  ['닭가슴살', 'R', '금', 'bc'],
  ['산딸기', 'R', '화', 'bp'],
  ['제주도 갈치', 'R', '수', 'cn'],
  ['돼지삼겹살', 'R', '화', 'cn'],
  ['청고추', 'R', '목', 'cn', 'v'],
  ['홍고추', 'R', '화', 'cn', 'v'],
];

export var SUN = {
  b: { t: 'A lazy brunch', d: 'An easy start at 11', m: 'scene:b', s: '' },
  p: {
    t: 'A riverside picnic',
    d: 'A picnic blanket and a breeze',
    m: 'scene:p',
    s: '',
  },
  n: {
    t: 'Netflix and snacks',
    d: 'A cozy bowl under the covers',
    m: 'scene:n',
    s: '',
  },
  c: {
    t: 'Market shopping and cooking',
    d: 'A stroll with your shopping bag',
    m: 'scene:c',
    s: '',
  },
};
export var FRI = {
  empty: {
    t: 'Almost empty',
    d: 'Just a bottle of water',
    m: 'fr:empty',
    s: '',
  },
  sauce: {
    t: 'Full of sauces',
    d: 'Ketchup, soy sauce, mayo…',
    m: 'fr:sauce',
    s: '',
  },
  banchan: {
    t: 'Plenty of side dishes',
    d: 'Homemade sides and leftovers',
    m: 'fr:banchan',
    s: '',
  },
  wilted: {
    t: 'Vegetables need using',
    d: 'That forgotten bunch of green onions',
    m: 'fr:wilted',
    s: '',
  },
};
export var SUN_W = {
  b: 'A lazy brunch',
  p: 'A riverside picnic',
  n: 'Netflix and snacks',
  c: 'Market shopping and cooking',
};
export var FRI_W = {
  empty: 'Your fridge is empty, so we started with <b>the essentials</b>.',
  sauce: 'You have sauces, so we picked <b>main ingredients instead</b>.',
  banchan: 'You have side dishes, so <b>just add a main</b>.',
  wilted: 'Use your vegetables first; <b>no extra produce</b> in these picks.',
};

/* 추천 */
function seed(str) {
  var h = 0;
  for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return function () {
    h = (h * 1103515245 + 12345) | 0;
    return ((h >>> 8) & 0xffff) / 0xffff;
  };
}
export function recommend(S) {
  var z = saju(S.y, S.m, S.d),
    r = seed(S.y + '-' + S.m + '-' + S.d + S.nick + S.sun + S.fridge),
    sun = S.sun || 'b',
    fz = S.fridge || 'empty';
  function sc(p) {
    var s = 0;
    if (p[2] === z.el) s += 3;
    if (p[3].indexOf(sun) > -1) s += 4;
    if (fz === 'sauce' && p[4] === 's') s -= 99;
    if (fz === 'wilted' && p[4] === 'v') s -= 99;
    if (fz === 'empty' && p[4] === 's') s -= 3;
    if (fz === 'banchan' && p[4] === 's') s -= 2;
    return s + r() * 0.9;
  }
  var R = P.filter(function (p) {
    return p[1] === 'R';
  })
    .map(function (p) {
      return { p: p, s: sc(p) };
    })
    .sort(function (a, b) {
      return b.s - a.s;
    });
  var K = P.filter(function (p) {
    return p[1] === 'K';
  })
    .map(function (p) {
      return { p: p, s: sc(p) + (p[2] === z.el ? 3 : 0) };
    })
    .sort(function (a, b) {
      return b.s - a.s;
    });
  var n = fz === 'banchan' ? 2 : 3,
    pick = [];
  R.filter(function (x) {
    return x.p[2] === z.el && x.s > -50;
  })
    .slice(0, 2)
    .forEach(function (x) {
      pick.push(x.p);
    });
  R.forEach(function (x) {
    if (pick.length < n && pick.indexOf(x.p) < 0 && x.s > -50) pick.push(x.p);
  });
  return {
    z: z,
    items: pick,
    kit: K[0].p,
    split: fz === 'empty' || sun === 'c' || sun === 'n',
  };
}
