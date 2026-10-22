/* ===== 미니홈피풍 픽셀 아이콘 엔진 (20x20, 파스텔 + 갈색 외곽선 + 자동 음영·하이라이트) ===== */
export var CY = (function () {
  var N = 20,
    OUT = '#5B3B33',
    g,
    hl;
  function hex(c) {
    return [
      parseInt(c.slice(1, 3), 16),
      parseInt(c.slice(3, 5), 16),
      parseInt(c.slice(5, 7), 16),
    ];
  }
  function dk(c, f) {
    var a = hex(c);
    return (
      '#' +
      a
        .map(function (v) {
          return (
            '0' + Math.max(0, Math.round(v * (1 - f))).toString(16)
          ).slice(-2);
        })
        .join('')
    );
  }
  function begin() {
    g = [];
    hl = [];
    for (var i = 0; i < N; i++) g.push(new Array(N).fill(null));
  }
  function put(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (y >= 0 && y < N && x >= 0 && x < N) g[y][x] = c;
  }
  function E(cx, cy, rx, ry, c) {
    for (var y = 0; y < N; y++)
      for (var x = 0; x < N; x++) {
        var dx = (x + 0.5 - cx) / rx,
          dy = (y + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) g[y][x] = c;
      }
  }
  function R(x0, y0, w, h, c) {
    for (var y = y0; y < y0 + h; y++)
      for (var x = x0; x < x0 + w; x++) put(x, y, c);
  }
  function P(pts, c) {
    for (var y = 0; y < N; y++)
      for (var x = 0; x < N; x++) {
        var px = x + 0.5,
          py = y + 0.5,
          ins = false;
        for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
          var xi = pts[i][0],
            yi = pts[i][1],
            xj = pts[j][0],
            yj = pts[j][1];
          if (
            yi > py !== yj > py &&
            px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
          )
            ins = !ins;
        }
        if (ins) g[y][x] = c;
      }
  }
  function L(x0, y0, x1, y1, c, t) {
    t = t || 1;
    var n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
    for (var i = 0; i <= n; i++) {
      var x = x0 + ((x1 - x0) * i) / n,
        y = y0 + ((y1 - y0) * i) / n;
      for (var a = 0; a < t; a++)
        for (var b = 0; b < t; b++)
          put(Math.floor(x) + a, Math.floor(y) + b, c);
    }
  }
  function D(x, y, c) {
    put(x, y, c);
  }
  function H(x, y) {
    hl.push([x, y]);
  }
  function finish() {
    var o = g.map(function (r) {
      return r.slice();
    });
    for (var y = 0; y < N; y++)
      for (var x = 0; x < N; x++) {
        var c = g[y][x];
        if (!c || c === OUT) continue;
        var b = y + 1 >= N || g[y + 1][x] !== c,
          r = x + 1 >= N || g[y][x + 1] !== c;
        var bb = y + 1 >= N || !g[y + 1][x],
          rr = x + 1 >= N || !g[y][x + 1];
        if (bb || rr) o[y][x] = dk(c, 0.16);
      }
    var f = o.map(function (r) {
      return r.slice();
    });
    for (var y = 0; y < N; y++)
      for (var x = 0; x < N; x++) {
        if (o[y][x]) continue;
        for (var d = 0; d < 4; d++) {
          var yy = y + [1, -1, 0, 0][d],
            xx = x + [0, 0, 1, -1][d];
          if (
            yy >= 0 &&
            yy < N &&
            xx >= 0 &&
            xx < N &&
            o[yy][xx] &&
            o[yy][xx] !== OUT
          ) {
            f[y][x] = OUT;
            break;
          }
        }
      }
    hl.forEach(function (p) {
      if (f[p[1]] && f[p[1]][p[0]] && f[p[1]][p[0]] !== OUT)
        f[p[1]][p[0]] = '#FFFFFF';
    });
    return f;
  }
  function svg(f) {
    var rects = [];
    for (var y = 0; y < N; y++) {
      var x = 0;
      while (x < N) {
        var c = f[y][x];
        if (!c) {
          x++;
          continue;
        }
        var x0 = x;
        while (x < N && f[y][x] === c) x++;
        rects.push({ x: x0, y: y, width: x - x0, height: 1, fill: c });
      }
    }
    return rects;
  }
  /* 팔레트 */
  var C = {
    red: '#F2665E',
    tom: '#EE4F45',
    pink: '#F7A9B8',
    lpink: '#FBD3DA',
    yel: '#FFD45E',
    lyel: '#FFF0B0',
    cream: '#FFF6DE',
    ora: '#FF9F4A',
    grn: '#6CC25C',
    dgrn: '#3F9447',
    mint: '#BFE8A8',
    brn: '#C98A58',
    dbrn: '#8B5A3C',
    lbrn: '#E8B67E',
    wht: '#FFFFFF',
    gry: '#CDD4DC',
    lgry: '#E9EDF1',
    blu: '#8EC8F2',
    navy: '#4F5E8C',
    pur: '#A77BD0',
    dpur: '#6E4A8E',
    blk: '#4A3A36',
    beige: '#EBD9B4',
    olive: '#9AA84A',
    amber: '#E3A33A',
    sage: '#7FA57A',
  };
  /* 공용 부품 */
  function plate() {
    E(10, 13.5, 9.3, 5.2, C.wht);
    E(10, 13, 7, 3.6, '#F3EFE6');
  }
  function bowl(body, top) {
    P(
      [
        [1.5, 9],
        [18.5, 9],
        [15.5, 18],
        [4.5, 18],
      ],
      body,
    );
    E(10, 9, 8.5, 2.6, top || C.cream);
  }
  function bottle(body, cap, label) {
    R(7, 8, 6, 10, body);
    R(8, 5, 4, 3, body);
    R(8, 2, 4, 3, cap);
    if (label) R(7, 11, 6, 4, label);
    H(8, 9);
    H(8, 10);
  }
  function squeeze(body, cap) {
    E(10, 8, 4.5, 2.5, body);
    R(6, 8, 9, 10, body);
    P(
      [
        [9, 1],
        [11, 1],
        [12, 6],
        [8, 6],
      ],
      cap,
    );
    R(7, 11, 7, 3, C.wht);
    H(7, 9);
    H(7, 10);
  }
  function jar(fill, lid, label) {
    R(4, 7, 12, 11, fill);
    R(3, 4, 14, 3, lid);
    if (label !== 0) R(6, 10, 8, 4, label || C.cream);
    H(5, 8);
    H(5, 9);
  }
  function can(label, mark) {
    R(5, 5, 10, 13, C.gry);
    R(5, 8, 10, 7, label);
    E(10, 5, 5, 1.5, C.lgry);
    if (mark) mark();
  }
  function carton(lab, lab2) {
    R(5, 8, 10, 10, C.wht);
    P(
      [
        [5, 8],
        [10, 3],
        [15, 8],
      ],
      C.wht,
    );
    R(9, 2, 2, 2, C.wht);
    R(5, 11, 10, 4, lab);
    if (lab2) R(5, 15, 10, 1, lab2);
    H(6, 9);
  }
  function pack(col, win) {
    P(
      [
        [3, 4],
        [17, 4],
        [18, 18],
        [2, 18],
      ],
      col,
    );
    R(3, 3, 14, 2, dk(col, 0.2));
    E(10, 11.5, 4.5, 3.5, win || C.cream);
  }
  function tub(fill, lid) {
    R(4, 9, 12, 9, C.wht);
    R(3, 6, 14, 3, lid);
    R(6, 11, 8, 4, fill);
  }
  function tray() {
    R(1, 13, 18, 5, C.lgry);
    R(2, 13, 16, 1, C.gry);
  }
  function steam() {
    D(7, 1, C.gry);
    D(8, 2, C.gry);
    D(7, 3, C.gry);
    D(12, 1, C.gry);
    D(13, 2, C.gry);
    D(12, 3, C.gry);
  }
  function leafy(c1, c2, x, y) {
    E(x, y, 2.4, 3.4, c1);
    L(x, y - 2, x, y + 3, c2);
  }
  function tomato(x, y, r, c) {
    E(x, y, r, r * 0.9, c || C.tom);
    D(Math.round(x), Math.round(y - r * 0.85), C.dgrn);
    D(Math.round(x - 1), Math.round(y - r * 0.8), C.grn);
    D(Math.round(x + 1), Math.round(y - r * 0.8), C.grn);
    H(Math.round(x - r * 0.45), Math.round(y - r * 0.35));
  }
  function noodle(c, y0, y1) {
    for (var x = 4; x <= 15; x += 2) L(x, y0, x + (x % 4 ? 1 : -1), y1, c);
  }
  function pasta(sauce) {
    plate();
    E(10, 11.5, 5.5, 3, C.yel);
    for (var x = 6; x <= 14; x += 2) L(x, 9.5, x + 2, 13, C.lyel);
    if (sauce) E(10, 11, 3, 1.8, sauce);
  }
  /* ===== 아이템 정의: 상품명 → 그리기 ===== */
  var I = {
    '브리오슈 프렌치토스트 키트': function () {
      plate();
      P(
        [
          [4, 10],
          [11, 8],
          [13, 13],
          [6, 15],
        ],
        C.amber,
      );
      R(5, 10, 6, 1, C.lbrn);
      P(
        [
          [9, 9],
          [15, 8],
          [16, 13],
          [10, 14],
        ],
        C.yel,
      );
      R(11, 10, 3, 2, C.lyel);
      D(13, 7, C.dbrn);
      D(13, 8, C.amber);
      H(10, 10);
    },
    '원디쉬 라구 파스타 키트': function () {
      pasta();
      E(10, 10.5, 3.2, 2, '#B5452E');
      D(9, 10, C.dbrn);
      D(11, 11, C.dbrn);
      D(12, 9, C.grn);
      D(13, 9, C.dgrn);
    },
    '주말 와플 브런치 키트': function () {
      plate();
      R(5, 7, 10, 8, C.yel);
      for (var i = 6; i < 15; i += 2) {
        L(i, 7, i, 14, C.amber);
        L(5, i, 14, i, C.amber);
      }
      E(13, 7, 2, 2, C.tom);
      E(6, 7, 2, 1.5, C.wht);
      H(6, 8);
    },
    '새우와 채소 한 접시 키트': function () {
      plate();
      P(
        [
          [5, 12],
          [7, 9],
          [10, 9],
          [9, 11],
          [7, 12],
        ],
        C.ora,
      );
      P(
        [
          [10, 12],
          [12, 9],
          [15, 9],
          [14, 11],
          [12, 12],
        ],
        C.ora,
      );
      E(8, 14, 1.5, 1.3, C.grn);
      E(12, 14, 1.5, 1.3, C.dgrn);
      E(15, 13, 1.3, 1.1, C.grn);
      D(7, 10, C.wht);
      D(12, 10, C.wht);
    },
    '작은 식탁의 크림 케이크': function () {
      R(4, 9, 12, 8, C.wht);
      E(10, 9, 6, 2.2, C.cream);
      R(4, 13, 12, 1, C.pink);
      R(4, 16, 12, 1, C.lbrn);
      tomato(10, 6, 2.2, C.red);
      D(7, 8, C.wht);
      D(13, 8, C.wht);
      H(5, 10);
    },
    '햄을 곁들인 프렌치토스트': function () {
      plate();
      P(
        [
          [4, 9],
          [11, 8],
          [12, 14],
          [5, 15],
        ],
        C.amber,
      );
      R(5, 10, 5, 1, C.lbrn);
      P(
        [
          [10, 10],
          [16, 9],
          [16, 13],
          [11, 14],
        ],
        C.pink,
      );
      L(11, 11, 15, 10, C.lpink);
      H(6, 10);
    },
    '햄·달걀 바게트 브런치': function () {
      P(
        [
          [1, 10],
          [18, 7],
          [19, 10],
          [2, 14],
        ],
        C.lbrn,
      );
      P(
        [
          [2, 12],
          [18, 9],
          [18, 11],
          [3, 14],
        ],
        C.pink,
      );
      E(8, 11, 2, 1.2, C.wht);
      D(8, 11, C.yel);
      E(13, 10, 2, 1.2, C.wht);
      D(13, 10, C.yel);
      L(4, 10, 16, 7, C.amber);
    },
    '리가토니 한 접시 키트': function () {
      plate();
      E(10, 11.5, 6, 3, '#D9483A');
      [
        [6, 10],
        [9, 9],
        [12, 10],
        [8, 12],
        [11, 12],
        [14, 11],
      ].forEach(function (p) {
        R(p[0], p[1], 2, 2, C.yel);
        D(p[0], p[1], C.amber);
      });
      D(10, 8, C.grn);
    },
    '버섯 크림 한 접시 키트': function () {
      plate();
      E(10, 11.5, 6, 3, C.cream);
      [
        [7, 10],
        [11, 10],
        [9, 12],
        [13, 12],
      ].forEach(function (p) {
        E(p[0], p[1], 1.6, 1.1, C.brn);
        D(p[0], p[1] + 1, C.beige);
      });
      D(6, 12, C.grn);
    },
    '피크닉 베이글 샌드위치': function () {
      E(10, 7, 7.5, 3.3, C.brn);
      R(3, 9, 15, 2, C.grn);
      R(3, 11, 15, 2, C.wht);
      E(10, 14, 7.5, 3.3, C.brn);
      D(10, 7, C.dbrn);
      D(10, 14, C.dbrn);
      H(6, 6);
    },
    '에그 샌드위치 키트': function () {
      P(
        [
          [2, 16],
          [18, 16],
          [10, 3],
        ],
        C.cream,
      );
      P(
        [
          [4, 15],
          [16, 15],
          [10, 6],
        ],
        C.yel,
      );
      P(
        [
          [6, 14],
          [14, 14],
          [10, 8],
        ],
        C.lyel,
      );
      D(9, 12, C.wht);
      D(11, 11, C.wht);
    },
    '토마토 치즈 한 접시': function () {
      plate();
      [
        [5, 12],
        [8, 11],
        [11, 12],
        [14, 11],
      ].forEach(function (p, i) {
        E(p[0], p[1], 1.8, 1.8, i % 2 ? C.wht : C.tom);
      });
      D(8, 9, C.grn);
      D(12, 9, C.grn);
      D(13, 9, C.dgrn);
    },
    '청포도 치즈 샐러드': function () {
      bowl(C.wht, C.mint);
      E(6, 8, 1.5, 1.3, '#B8E07A');
      E(9, 7, 1.5, 1.3, '#B8E07A');
      E(12, 8, 1.5, 1.3, '#B8E07A');
      R(13, 6, 2, 2, C.cream);
      R(7, 9, 2, 2, C.cream);
      D(15, 8, C.grn);
      H(6, 7);
    },
    '초록 페스토 샐러드': function () {
      bowl(C.wht, C.grn);
      E(7, 8, 2, 1.4, C.dgrn);
      E(12, 8, 2.2, 1.4, C.mint);
      L(5, 9, 15, 7, '#4C7F2E');
      D(10, 7, C.wht);
    },
    '새우·달걀 브런치 키트': function () {
      plate();
      E(7, 12, 3, 2.2, C.wht);
      E(7, 12, 1.4, 1.2, C.yel);
      P(
        [
          [11, 13],
          [13, 9],
          [16, 9],
          [15, 11],
          [13, 13],
        ],
        C.ora,
      );
      D(14, 10, C.wht);
      H(6, 11);
    },
    '구운 청어알 비빔메밀면': function () {
      bowl(C.navy, '#8B7B6A');
      noodle('#6B5B4A', 8, 10);
      E(10, 7, 2.5, 1.2, C.ora);
      D(9, 6, C.yel);
      D(11, 7, C.yel);
    },
    '멕시칸 타코 샐러드': function () {
      P(
        [
          [2, 8],
          [18, 8],
          [14, 17],
          [6, 17],
        ],
        C.yel,
      );
      E(10, 8, 8, 2.4, C.grn);
      E(7, 7, 1.5, 1.2, C.tom);
      E(12, 7, 1.5, 1.2, C.tom);
      D(10, 6, C.wht);
      L(4, 11, 16, 11, C.amber);
    },
    '토마토 뇨키 키트': function () {
      plate();
      E(10, 11.5, 6, 3, '#D9483A');
      [
        [6, 11],
        [9, 10],
        [12, 11],
        [8, 13],
        [11, 13],
        [14, 12],
      ].forEach(function (p) {
        E(p[0], p[1], 1.3, 1, C.cream);
      });
      D(10, 8, C.grn);
    },
    '노른자 크림 파스타 키트': function () {
      pasta(C.cream);
      E(10, 10.5, 1.8, 1.5, C.ora);
      H(9, 10);
    },
    '갓 구운 바게트 잠봉뵈르': function () {
      P(
        [
          [1, 9],
          [19, 7],
          [19, 11],
          [1, 13],
        ],
        C.lbrn,
      );
      R(2, 10, 17, 1, C.pink);
      R(2, 11, 17, 1, C.yel);
      L(3, 8, 17, 7, C.amber);
      H(4, 9);
    },
    '갓 만든 베이글 아침 세트': function () {
      E(7, 12, 5.5, 4, C.brn);
      E(7, 12, 1.6, 1.2, null);
      R(13, 8, 5, 7, C.wht);
      R(18, 9, 1, 3, C.wht);
      R(14, 9, 3, 2, C.dbrn);
      steam();
      H(4, 10);
    },
    '집에서 굽는 포카치아 키트': function () {
      R(2, 6, 16, 10, C.yel);
      for (var y = 8; y < 15; y += 3)
        for (var x = 4; x < 17; x += 4) D(x + (y % 2), y, C.amber);
      E(6, 9, 1.2, 1, C.dgrn);
      E(13, 12, 1.2, 1, C.dgrn);
      L(9, 8, 11, 10, C.sage);
      H(3, 7);
    },
    '한강 피크닉 도시락 세트': function () {
      P(
        [
          [2, 9],
          [18, 9],
          [16, 18],
          [4, 18],
        ],
        C.brn,
      );
      for (var x = 4; x < 17; x += 3) L(x, 9, x, 17, C.dbrn);
      R(2, 8, 16, 2, C.red);
      for (var x = 3; x < 17; x += 2) D(x, 8, C.wht);
      L(5, 8, 10, 3, C.dbrn);
      L(10, 3, 15, 8, C.dbrn);
    },
    '이탈리아 식품 셀렉션': function () {
      R(2, 10, 16, 8, C.lbrn);
      R(2, 13, 16, 1, C.brn);
      R(5, 3, 3, 8, C.dgrn);
      R(6, 1, 1, 2, C.dgrn);
      R(9, 5, 4, 6, C.tom);
      R(14, 6, 2, 5, C.yel);
      R(15, 4, 1, 2, C.yel);
      H(5, 4);
    },
    /* 원물 */
    '홈메이드 바질페스토 150g': function () {
      jar('#4C8A33', C.brn, 0);
      E(10, 12, 3, 2, '#6FAF4A');
      H(6, 9);
    },
    '직접 만든 발효 베이글 · 2개': function () {
      E(10, 13, 7, 3.5, C.brn);
      E(10, 13, 1.6, 1, null);
      E(10, 7, 7, 3.5, C.lbrn);
      E(10, 7, 1.6, 1, null);
      H(6, 6);
    },
    '한 줌의 바질': function () {
      L(10, 18, 10, 6, C.dgrn);
      [
        [6, 13],
        [14, 12],
        [7, 8],
        [13, 7],
        [10, 4],
      ].forEach(function (p) {
        E(p[0], p[1], 2.6, 1.8, C.grn);
        D(p[0], p[1], C.dgrn);
      });
      H(6, 12);
    },
    '한 끼 토마토': function () {
      tomato(10, 11, 6.5);
    },
    '조금씩 담는 채소 믹스': function () {
      tray();
      E(5, 10, 2.8, 2.6, C.grn);
      R(4, 12, 2, 2, C.dgrn);
      P(
        [
          [9, 13],
          [12, 5],
          [13, 6],
          [11, 13],
        ],
        C.ora,
      );
      E(15, 11, 2.2, 2, C.tom);
      D(14, 10, C.wht);
    },
    '작은 딸기 한 팩': function () {
      R(2, 10, 16, 8, '#E3F0F8');
      R(2, 10, 16, 1, C.blu);
      [
        [6, 9],
        [10, 8],
        [14, 9],
        [8, 12],
        [12, 12],
      ].forEach(function (p) {
        E(p[0], p[1], 2.2, 2, C.red);
        D(p[0], p[1] - 2, C.grn);
        D(p[0] - 1, p[1], C.lyel);
      });
    },
    '컬러 방울토마토': function () {
      tomato(7, 8, 3.2, C.tom);
      tomato(13, 9, 3.2, C.yel);
      tomato(9, 14, 3.2, C.ora);
      tomato(15, 15, 2.6, C.tom);
    },
    '잎채소 소분 믹스': function () {
      E(10, 12, 8, 5.5, C.grn);
      E(7, 10, 4, 3.5, C.mint);
      E(13, 10, 4, 3.5, '#9CD67E');
      L(10, 7, 10, 17, C.mint);
      E(10, 16, 6, 2, C.dgrn);
    },
    '구이용 소고기 소분': function () {
      tray();
      P(
        [
          [3, 7],
          [16, 5],
          [17, 12],
          [4, 14],
        ],
        '#E0565B',
      );
      L(5, 8, 15, 7, C.lpink);
      L(6, 11, 15, 10, C.lpink);
      H(5, 8);
    },
    '고소한 잣 소분': function () {
      E(10, 14, 7, 3.5, C.wht);
      [
        [6, 11],
        [9, 10],
        [12, 11],
        [8, 13],
        [11, 13],
        [14, 12],
      ].forEach(function (p) {
        E(p[0], p[1], 1.2, 1.6, C.cream);
      });
    },
    '요리에 더하는 치즈 소분': function () {
      P(
        [
          [3, 15],
          [17, 15],
          [17, 8],
          [3, 12],
        ],
        C.yel,
      );
      P(
        [
          [3, 12],
          [17, 8],
          [13, 6],
        ],
        C.lyel,
      );
      E(8, 13, 1, 0.8, C.amber);
      E(13, 11, 1.1, 0.9, C.amber);
      H(4, 13);
    },
    '시간을 들인 바게트': function () {
      P(
        [
          [1, 15],
          [16, 2],
          [19, 5],
          [4, 18],
        ],
        C.lbrn,
      );
      [
        [5, 13],
        [9, 9],
        [13, 5],
      ].forEach(function (p) {
        L(p[0], p[1], p[0] + 2, p[1] + 2, C.cream);
      });
      H(3, 14);
    },
    '집에서 굽는 미니빵 생지': function () {
      tray();
      [
        [5, 10],
        [10, 9],
        [15, 10],
        [7, 6],
        [13, 6],
      ].forEach(function (p) {
        E(p[0], p[1], 2.6, 2.2, C.cream);
        H(p[0] - 1, p[1] - 1);
      });
    },
    '우유 소포장': function () {
      carton(C.blu);
    },
    '생크림 소포장': function () {
      carton(C.pink, C.lpink);
    },
    레몬: function () {
      E(10, 11, 7.5, 5.5, C.yel);
      P(
        [
          [2, 11],
          [3.5, 9],
          [3.5, 13],
        ],
        C.yel,
      );
      P(
        [
          [18, 11],
          [16.5, 9],
          [16.5, 13],
        ],
        C.yel,
      );
      E(12, 5, 2.4, 1.2, C.grn);
      H(6, 9);
      H(7, 8);
    },
    '천일염 미니': function () {
      R(6, 6, 8, 12, C.wht);
      E(10, 6, 4, 1.5, C.gry);
      [
        [8, 11],
        [11, 13],
        [9, 15],
        [12, 10],
      ].forEach(function (p) {
        D(p[0], p[1], C.lgry);
      });
      R(6, 9, 8, 1, C.blu);
    },
    '플레인 크래커': function () {
      [
        [3, 4],
        [9, 8],
      ].forEach(function (o) {
        R(o[0], o[1], 9, 8, C.lbrn);
        for (var a = 1; a < 9; a += 3)
          for (var b = 1; b < 8; b += 3) D(o[0] + a, o[1] + b, C.brn);
      });
    },
    짜장라면: function () {
      pack(C.blk, '#2E2420');
      noodle(C.lyel, 9, 13);
      R(5, 15, 10, 1, C.yel);
    },
    '얼큰 우동라면': function () {
      pack(C.red, C.wht);
      noodle(C.lyel, 9, 13);
      D(13, 10, C.tom);
      D(7, 12, C.tom);
    },
    '채끝 스테이크 소분': function () {
      E(10, 11, 8, 6, '#D8474F');
      P(
        [
          [3, 8],
          [8, 5],
          [6, 8],
        ],
        C.cream,
      );
      L(5, 9, 15, 13, '#8B2F35');
      L(6, 12, 13, 15, '#8B2F35');
      H(7, 8);
    },
    '달걀 소포장': function () {
      R(1, 11, 18, 7, C.beige);
      [
        [4, 9],
        [8, 9],
        [12, 9],
        [16, 9],
      ].forEach(function (p) {
        E(p[0], p[1], 1.8, 2.4, C.wht);
        H(p[0] - 1, p[1] - 1);
      });
      R(1, 12, 18, 1, C.lbrn);
    },
    '베이컨 소포장': function () {
      for (var i = 0; i < 3; i++) {
        P(
          [
            [2, 4 + i * 5],
            [18, 3 + i * 5],
            [18, 6 + i * 5],
            [2, 7 + i * 5],
          ],
          C.red,
        );
        L(3, 5 + i * 5, 17, 4 + i * 5, C.lpink);
      }
    },
    '우유식빵 소포장': function () {
      E(10, 7, 7.5, 4, C.lbrn);
      R(2.5, 7, 15, 10, C.lbrn);
      E(10, 8, 6, 3, C.cream);
      R(4, 8, 12, 8, C.cream);
      H(5, 6);
    },
    '우동면 소포장': function () {
      pack('#E9EEF2', C.wht);
      for (var x = 6; x <= 14; x += 2) L(x, 8, x + 1, 15, C.cream);
    },
    '쯔유 미니': function () {
      bottle('#7A4A2C', C.red, C.cream);
    },
    '손질 꽃게': function () {
      E(10, 11, 7, 4.5, C.red);
      E(3, 6, 2, 2, C.red);
      E(17, 6, 2, 2, C.red);
      L(4, 7, 6, 9, C.red);
      L(16, 7, 14, 9, C.red);
      D(8, 9, C.wht);
      D(12, 9, C.wht);
      D(8, 10, C.blk);
      D(12, 10, C.blk);
      for (var x = 4; x < 17; x += 4) L(x, 15, x - 1, 17, C.red);
    },
    크림치즈: function () {
      tub(C.wht, C.blu);
    },
    '블루베리 잼': function () {
      jar(C.dpur, C.red, C.cream);
      E(10, 12, 2, 1.5, C.navy);
    },
    깜빠뉴: function () {
      E(10, 11, 8.5, 6.5, C.brn);
      L(6, 8, 9, 13, C.lbrn);
      L(11, 7, 14, 12, C.lbrn);
      H(5, 8);
      H(6, 7);
    },
    '올리브오일 미니': function () {
      bottle('#9AAE3A', C.dgrn, C.cream);
      E(10, 13, 1.4, 1.2, C.dgrn);
    },
    '신김치 소포장': function () {
      tub(C.red, C.grn);
      E(10, 12, 3, 1.5, '#E45A3C');
      D(8, 11, C.lyel);
    },
    '코인 육수': function () {
      [
        [6, 8],
        [13, 8],
        [9, 13],
      ].forEach(function (p) {
        E(p[0], p[1], 3.4, 3.4, C.amber);
        E(p[0], p[1], 1.6, 1.6, C.lbrn);
        H(p[0] - 1, p[1] - 2);
      });
    },
    '들기름 미니': function () {
      bottle(C.amber, C.dbrn, C.cream);
    },
    쌀국수면: function () {
      R(3, 6, 14, 9, C.wht);
      for (var y = 7; y < 14; y += 2) L(4, y, 16, y, C.lgry);
      R(9, 5, 2, 11, C.red);
    },
    '쌀국수 육수 소스': function () {
      bottle('#C77F3D', C.grn, C.cream);
      D(10, 12, C.tom);
    },
    숙주: function () {
      for (var i = 0; i < 6; i++) {
        var x = 4 + i * 2.2;
        L(x, 17, x + (i % 2 ? 2 : -1), 6, C.cream);
        E(x + (i % 2 ? 2 : -1), 5, 1.2, 1, C.yel);
      }
    },
    고수: function () {
      L(10, 18, 10, 9, C.dgrn);
      L(10, 12, 6, 8, C.dgrn);
      L(10, 12, 14, 7, C.dgrn);
      [
        [5, 7],
        [7, 5],
        [14, 6],
        [12, 4],
        [10, 6],
        [16, 9],
        [4, 10],
      ].forEach(function (p) {
        E(p[0], p[1], 1.4, 1.2, C.grn);
        D(p[0], p[1], C.mint);
      });
    },
    두부: function () {
      P(
        [
          [3, 8],
          [11, 5],
          [17, 8],
          [9, 11],
        ],
        C.wht,
      );
      P(
        [
          [3, 8],
          [9, 11],
          [9, 17],
          [3, 14],
        ],
        C.lgry,
      );
      P(
        [
          [9, 11],
          [17, 8],
          [17, 14],
          [9, 17],
        ],
        '#F4F4F2',
      );
      H(8, 7);
    },
    강황: function () {
      E(10, 14, 7.5, 3.5, C.wht);
      E(10, 12, 5, 3, C.ora);
      E(10, 11, 3, 1.5, C.yel);
    },
    템페: function () {
      R(3, 6, 14, 10, C.beige);
      [
        [5, 8],
        [9, 7],
        [13, 9],
        [7, 12],
        [11, 13],
        [15, 12],
        [6, 15],
      ].forEach(function (p) {
        D(p[0], p[1], C.brn);
      });
      H(4, 7);
    },
    '잠봉 소포장': function () {
      E(8, 9, 6, 5, C.pink);
      E(8, 9, 4, 3, C.lpink);
      E(12, 12, 6, 5, C.pink);
      E(12, 12, 4, 3, C.lpink);
      H(10, 10);
    },
    루꼴라: function () {
      [
        [6, '#3E8A3A'],
        [10, C.dgrn],
        [14, '#4E9A3A'],
      ].forEach(function (p, i) {
        P(
          [
            [p[0] - 1, 18],
            [p[0] + 1, 18],
            [p[0] + 3, 4 + i],
            [p[0] - 3, 4 + i],
          ],
          p[1],
        );
        D(p[0] - 3, 8, null);
        D(p[0] + 3, 11, null);
        L(p[0], 18, p[0], 7, C.mint);
      });
    },
    무화과: function () {
      E(10, 12, 6.5, 6, C.dpur);
      E(10, 5, 1.5, 1.5, C.grn);
      E(13, 13, 3.5, 3.5, C.pink);
      E(13, 13, 1.8, 1.8, '#E86A8A');
      H(7, 9);
    },
    '버터 소포장': function () {
      P(
        [
          [3, 9],
          [11, 6],
          [17, 9],
          [9, 12],
        ],
        C.lyel,
      );
      P(
        [
          [3, 9],
          [9, 12],
          [9, 16],
          [3, 13],
        ],
        C.yel,
      );
      P(
        [
          [9, 12],
          [17, 9],
          [17, 13],
          [9, 16],
        ],
        C.amber,
      );
      R(4, 11, 4, 1, C.wht);
    },
    '메이플 시럽 미니': function () {
      bottle(C.amber, C.dbrn, C.cream);
      D(10, 12, C.red);
      D(9, 13, C.red);
      D(11, 13, C.red);
    },
    '토마토 통조림': function () {
      can(C.red, function () {
        tomato(10, 11, 2.4, C.tom);
      });
    },
    '하리사 미니': function () {
      jar('#B3332B', C.blk, C.cream);
      D(10, 12, C.red);
      D(9, 11, C.red);
    },
    당근: function () {
      P(
        [
          [6, 6],
          [14, 6],
          [11, 18],
          [9, 18],
        ],
        C.ora,
      );
      L(7, 9, 9, 9, '#E07B2A');
      L(10, 12, 12, 12, '#E07B2A');
      L(9, 6, 7, 1, C.grn);
      L(10, 6, 10, 1, C.dgrn);
      L(11, 6, 13, 1, C.grn);
    },
    '홀그레인 머스터드': function () {
      jar(C.yel, C.wht, 0);
      [
        [7, 11],
        [10, 13],
        [12, 10],
        [8, 15],
        [13, 15],
      ].forEach(function (p) {
        D(p[0], p[1], C.amber);
      });
    },
    '소고기 양지 소분': function () {
      tray();
      [
        [5, 9],
        [10, 8],
        [15, 9],
      ].forEach(function (p) {
        R(p[0] - 2, p[1] - 2, 5, 5, '#C8424C');
        L(p[0] - 2, p[1], p[0] + 2, p[1] - 1, C.lpink);
      });
    },
    '양파 소포장': function () {
      E(10, 12, 6.5, 6, '#C88A4A');
      E(10, 12, 4, 4.5, '#E3B07A');
      P(
        [
          [9, 6],
          [11, 6],
          [10, 2],
        ],
        '#C88A4A',
      );
      L(10, 17, 10, 19, C.dbrn);
      H(7, 9);
    },
    양송이: function () {
      E(10, 8, 7.5, 4.5, C.wht);
      E(10, 10, 6, 1.2, C.lgry);
      R(8, 10, 4, 7, C.cream);
      H(6, 6);
    },
    '대파 소포장': function () {
      P(
        [
          [3, 18],
          [6, 18],
          [16, 4],
          [13, 3],
        ],
        C.wht,
      );
      P(
        [
          [10, 10],
          [13, 10],
          [19, 1],
          [16, 0],
        ],
        C.grn,
      );
      P(
        [
          [11, 9],
          [13, 9],
          [16, 2],
        ],
        C.dgrn,
      );
      L(3, 18, 2, 19, C.beige);
    },
    '간장 미니': function () {
      bottle('#3A2A24', C.red, C.wht);
    },
    즉석밥: function () {
      R(3, 8, 14, 9, C.wht);
      E(10, 8, 7, 2, C.lgry);
      E(10, 8, 5.5, 1.4, C.wht);
      D(8, 8, C.cream);
      D(12, 8, C.cream);
      R(3, 12, 14, 2, C.blu);
    },
    '병아리콩 통조림': function () {
      can(C.ora, function () {
        E(8, 11, 1.4, 1.3, C.beige);
        E(11, 10, 1.4, 1.3, C.beige);
        E(12, 13, 1.4, 1.3, C.beige);
      });
    },
    코코넛밀크: function () {
      can(C.wht, function () {
        E(10, 11, 2.8, 2.6, C.dbrn);
        E(10, 11, 1.6, 1.4, C.wht);
      });
    },
    '커리 페이스트': function () {
      jar('#D98B2B', C.dbrn, C.cream);
      E(10, 12, 2, 1.3, C.ora);
    },
    '케첩 미니': function () {
      squeeze(C.tom, C.wht);
    },
    '스리라차 미니': function () {
      squeeze('#E0352B', C.grn);
    },
    '비트 후무스': function () {
      tub('#C23A7A', C.wht);
      D(9, 12, C.lpink);
    },
    단호박: function () {
      E(10, 11, 8, 6.5, '#3F7A3A');
      L(10, 5, 10, 17, '#5E9A4A');
      L(6, 6, 5, 16, '#5E9A4A');
      L(14, 6, 15, 16, '#5E9A4A');
      R(9, 3, 2, 3, C.dbrn);
      H(5, 8);
    },
    밤: function () {
      [
        [6, 9],
        [13, 8],
        [9, 14],
      ].forEach(function (p) {
        E(p[0], p[1], 3.4, 3.4, C.dbrn);
        E(p[0], p[1] + 2, 3, 1.3, C.beige);
        D(p[0], p[1] - 3, C.blk);
        H(p[0] - 1, p[1] - 2);
      });
    },
    '쑥 페이스트': function () {
      jar(C.sage, C.cream, C.cream);
      D(10, 12, C.dgrn);
      D(9, 11, C.grn);
    },
    박력분: function () {
      P(
        [
          [4, 6],
          [16, 6],
          [17, 18],
          [3, 18],
        ],
        C.wht,
      );
      P(
        [
          [4, 6],
          [6, 3],
          [14, 3],
          [16, 6],
        ],
        C.lgry,
      );
      R(5, 10, 10, 4, C.blu);
      D(10, 11, C.wht);
    },
    '국물 라면': function () {
      pack(C.ora, C.wht);
      noodle(C.lyel, 9, 13);
      D(10, 10, C.grn);
    },
    '브리오슈 슬라이스': function () {
      E(10, 7, 7.5, 4, C.amber);
      R(2.5, 7, 15, 10, C.amber);
      E(10, 8, 6, 3, C.lyel);
      R(4, 8, 12, 8, C.lyel);
      H(5, 6);
    },
    '롱 파스타면': function () {
      for (var x = 5; x <= 15; x++) L(x, 2, x - 2, 18, x % 2 ? C.yel : C.lyel);
      R(3, 9, 14, 2, C.blu);
    },
    '라구 소스': function () {
      jar('#9E3B2C', C.yel, C.cream);
      D(10, 12, C.dbrn);
    },
    와플: function () {
      R(3, 4, 14, 13, C.yel);
      for (var i = 5; i < 16; i += 3) {
        L(i, 4, i, 16, C.amber);
        L(3, i, 16, i, C.amber);
      }
      H(4, 5);
    },
    '마스카르포네 크림': function () {
      tub(C.cream, C.lyel);
      D(10, 12, C.wht);
    },
    '손질 새우': function () {
      P(
        [
          [4, 14],
          [6, 7],
          [11, 4],
          [16, 6],
          [13, 8],
          [9, 9],
          [8, 14],
        ],
        C.ora,
      );
      L(7, 8, 12, 6, '#FFC08A');
      D(12, 6, C.blk);
      L(15, 7, 18, 10, C.ora);
    },
    '마늘 조리 소스': function () {
      jar(C.cream, C.wht, 0);
      E(10, 13, 2.6, 2.6, C.wht);
      L(10, 10, 10, 15, C.lgry);
      P(
        [
          [9, 10],
          [11, 10],
          [10, 8],
        ],
        C.wht,
      );
    },
    리가토니면: function () {
      [
        [4, 6],
        [10, 4],
        [6, 11],
        [12, 10],
        [8, 15],
        [14, 15],
      ].forEach(function (p) {
        R(p[0], p[1], 4, 3, C.yel);
        R(p[0], p[1], 1, 3, C.amber);
        L(p[0] + 1, p[1] + 1, p[0] + 3, p[1] + 1, C.lyel);
      });
    },
    '토마토 파스타 소스': function () {
      jar(C.tom, C.dgrn, C.cream);
      tomato(10, 12, 1.8, C.tom);
    },
    '크림 소스 베이스': function () {
      jar(C.cream, C.navy, C.wht);
      D(10, 12, C.beige);
    },
    '마요네즈 소포장': function () {
      squeeze(C.cream, C.red);
    },
    '감자 뇨키': function () {
      [
        [5, 8],
        [10, 6],
        [15, 8],
        [7, 13],
        [12, 12],
        [16, 14],
        [4, 16],
      ].forEach(function (p) {
        E(p[0], p[1], 2.4, 1.8, C.cream);
        L(p[0] - 1, p[1], p[0] + 1, p[1], C.beige);
      });
    },
    '노른자 소스 베이스': function () {
      jar(C.yel, C.wht, C.cream);
      E(10, 12, 1.8, 1.4, C.ora);
    },
    '포카치아 생지': function () {
      E(10, 11, 8.5, 5.5, C.cream);
      [
        [6, 10],
        [10, 9],
        [14, 11],
        [8, 13],
        [12, 13],
      ].forEach(function (p) {
        D(p[0], p[1], C.beige);
      });
      H(5, 8);
    },
    '올리브 토핑': function () {
      E(10, 14, 7.5, 3.5, C.wht);
      [
        [6, 11],
        [10, 10],
        [14, 11],
        [8, 13],
        [12, 13],
      ].forEach(function (p, i) {
        E(p[0], p[1], 1.8, 1.5, i % 2 ? C.blk : C.olive);
        D(p[0], p[1], C.red);
      });
    },
    '닭고기 소포장': function () {
      tray();
      E(10, 9, 7, 4.5, C.lpink);
      E(10, 9, 5, 3, '#FBE4E6');
      H(6, 7);
    },
    '생강 소포장': function () {
      E(7, 12, 4, 3, C.beige);
      E(12, 10, 3.5, 3, C.beige);
      E(15, 13, 2.5, 2, C.beige);
      E(10, 7, 2, 2, C.beige);
      L(5, 12, 9, 12, C.lbrn);
      L(11, 9, 14, 10, C.lbrn);
    },
    사과: function () {
      E(10, 11, 7, 6.5, C.red);
      L(10, 4, 11, 1, C.dbrn);
      E(13, 3, 2.4, 1.2, C.grn);
      H(6, 8);
      H(7, 7);
    },
    '제철 귤': function () {
      E(10, 11, 7, 6, C.ora);
      D(10, 5, C.dgrn);
      E(12, 5, 2, 1, C.grn);
      D(8, 10, '#FFC07A');
      D(12, 13, '#FFC07A');
      H(6, 8);
    },
    '손질 오징어': function () {
      P(
        [
          [10, 1],
          [15, 7],
          [14, 12],
          [6, 12],
          [5, 7],
        ],
        C.wht,
      );
      P(
        [
          [6, 6],
          [3, 9],
          [6, 9],
        ],
        C.wht,
      );
      P(
        [
          [14, 6],
          [17, 9],
          [14, 9],
        ],
        C.wht,
      );
      for (var x = 6; x <= 14; x += 2)
        L(x, 12, x + (x % 4 ? 1 : -1), 18, C.lpink);
      D(8, 10, C.blk);
      D(12, 10, C.blk);
    },
    참치캔: function () {
      E(10, 12, 8, 4.5, C.gry);
      E(10, 10, 8, 3.5, C.lgry);
      R(2, 11, 16, 3, C.blu);
      E(10, 10, 5, 2, '#F4C29A');
      H(5, 9);
    },
    '슬라이스 치즈': function () {
      R(3, 4, 12, 12, C.yel);
      R(6, 7, 12, 12, C.lyel);
      R(6, 7, 12, 1, C.yel);
      H(7, 8);
    },
    과자: function () {
      P(
        [
          [4, 3],
          [16, 3],
          [17, 18],
          [3, 18],
        ],
        C.red,
      );
      R(4, 2, 12, 2, C.yel);
      R(4, 17, 12, 2, C.yel);
      E(10, 10, 4, 3, C.lyel);
      D(9, 10, C.brn);
      D(11, 9, C.brn);
    },
    '케이크 시트': function () {
      E(10, 8, 8, 2.5, C.lyel);
      R(2, 8, 16, 7, C.yel);
      E(10, 15, 8, 2.5, C.amber);
      L(3, 11, 17, 11, C.lyel);
      H(4, 9);
    },
    오이: function () {
      P(
        [
          [3, 16],
          [14, 3],
          [17, 5],
          [6, 18],
        ],
        C.grn,
      );
      [
        [6, 13],
        [9, 10],
        [12, 7],
        [8, 14],
        [13, 9],
      ].forEach(function (p) {
        D(p[0], p[1], C.dgrn);
      });
      L(5, 15, 15, 4, C.mint);
    },
    감자: function () {
      E(10, 11, 8, 6, C.lbrn);
      [
        [6, 9],
        [12, 8],
        [9, 13],
        [14, 13],
      ].forEach(function (p) {
        D(p[0], p[1], C.brn);
      });
      H(5, 8);
    },
  };
  /* 장면·냉장고·오행·띠 */
  var X = {
    'scene:b': function () {
      plate();
      P(
        [
          [4, 11],
          [8, 6],
          [12, 6],
          [16, 11],
          [12, 13],
          [8, 13],
        ],
        C.amber,
      );
      L(8, 7, 9, 12, C.lbrn);
      L(12, 7, 11, 12, C.lbrn);
      H(7, 8);
      E(16, 4, 2.4, 2.4, C.yel);
    },
    'scene:p': function () {
      P(
        [
          [2, 9],
          [18, 9],
          [16, 18],
          [4, 18],
        ],
        C.brn,
      );
      for (var x = 4; x < 17; x += 3) L(x, 9, x, 17, C.dbrn);
      R(2, 8, 16, 2, C.red);
      for (var x = 3; x < 17; x += 2) D(x, 8, C.wht);
      L(5, 8, 10, 3, C.dbrn);
      L(10, 3, 15, 8, C.dbrn);
      E(16, 3, 2.3, 2.3, C.yel);
    },
    'scene:n': function () {
      bowl(C.red, C.lyel);
      noodle(C.yel, 8, 10);
      L(12, 1, 15, 9, C.lbrn);
      L(14, 1, 16, 9, C.lbrn);
      E(4, 3, 2.2, 2.2, C.lyel);
      D(5, 2, null);
      D(5, 3, null);
    },
    'scene:c': function () {
      P(
        [
          [3, 8],
          [17, 8],
          [15, 18],
          [5, 18],
        ],
        C.lbrn,
      );
      for (var y = 10; y < 18; y += 3) L(4, y, 16, y, C.brn);
      P(
        [
          [7, 8],
          [9, 1],
          [10, 2],
          [9, 8],
        ],
        C.ora,
      );
      L(8, 1, 7, 0, C.grn);
      E(13, 6, 2.6, 2.4, C.tom);
      E(5, 6, 2, 2.4, C.grn);
    },
    'fr:empty': function () {
      fr();
      R(12, 8, 2, 4, C.blu);
      D(12, 7, C.wht);
      E(9, 3, 1.6, 1, C.lyel);
    },
    'fr:sauce': function () {
      fr();
      [
        [3, C.tom],
        [6, C.yel],
        [9, C.grn],
        [12, '#3A2A24'],
        [15, C.red],
      ].forEach(function (p) {
        R(p[0], 2, 2, 4, p[1]);
        D(p[0], 1, C.wht);
      });
      [
        [4, C.ora],
        [8, C.wht],
        [12, C.dpur],
      ].forEach(function (p) {
        R(p[0], 8, 3, 3, p[1]);
      });
      R(4, 14, 2, 3, C.red);
      R(8, 14, 2, 3, C.cream);
    },
    'fr:banchan': function () {
      fr();
      [
        [3, 2, C.red],
        [10, 2, C.grn],
        [3, 8, C.yel],
        [10, 8, C.blu],
      ].forEach(function (p) {
        R(p[0], p[1] + 1, 6, 3, C.wht);
        R(p[0], p[1], 6, 1, p[2]);
      });
      R(4, 14, 12, 3, C.wht);
      R(4, 13, 12, 1, C.pur);
    },
    'fr:wilted': function () {
      fr();
      L(4, 17, 5, 13, '#A8B36A');
      L(5, 13, 8, 14, '#A8B36A');
      L(7, 17, 9, 12, C.sage);
      L(9, 12, 12, 13, C.sage);
      E(13, 9, 2.4, 1.6, '#B5BF7A');
      R(4, 3, 2, 2, C.lbrn);
      R(10, 3, 2, 2, C.brn);
      D(15, 3, C.dbrn);
    },
    'el:목': function () {
      L(10, 18, 10, 8, C.dgrn);
      E(7, 8, 3.5, 2.4, C.grn);
      E(13, 6, 3.5, 2.4, C.grn);
      E(10, 4, 2.4, 3, '#8FD36E');
      H(6, 7);
    },
    'el:화': function () {
      P(
        [
          [10, 1],
          [15, 8],
          [16, 13],
          [10, 18],
          [4, 13],
          [5, 8],
          [8, 9],
        ],
        C.tom,
      );
      P(
        [
          [10, 7],
          [13, 12],
          [10, 16],
          [7, 12],
        ],
        C.ora,
      );
      E(10, 13, 1.6, 2, C.yel);
    },
    'el:토': function () {
      P(
        [
          [1, 17],
          [7, 6],
          [11, 11],
          [14, 7],
          [19, 17],
        ],
        C.lbrn,
      );
      P(
        [
          [5, 10],
          [7, 6],
          [9, 9],
        ],
        C.wht,
      );
      L(4, 15, 16, 15, C.brn);
    },
    'el:금': function () {
      E(10, 10, 7.5, 7.5, C.yel);
      E(10, 10, 5, 5, C.lyel);
      R(8, 8, 4, 4, C.amber);
      H(6, 6);
      H(7, 5);
    },
    'el:수': function () {
      P(
        [
          [10, 1],
          [15, 10],
          [14, 15],
          [10, 18],
          [6, 15],
          [5, 10],
        ],
        C.blu,
      );
      E(10, 13, 4, 4, C.blu);
      H(8, 10);
      H(8, 11);
    },
    crystal: function () {
      E(10, 8, 6.5, 6.5, '#CFE8FB');
      E(10, 8, 4, 4, '#E9F5FE');
      R(5, 15, 10, 3, C.pur);
      R(4, 17, 12, 2, C.dpur);
      H(7, 5);
      H(8, 4);
    },
    sparkle: function () {
      L(10, 3, 10, 17, C.yel);
      L(3, 10, 17, 10, C.yel);
      E(10, 10, 2.5, 2.5, C.lyel);
      H(10, 10);
    },
    cheese: function () {
      P(
        [
          [3, 15],
          [17, 15],
          [17, 8],
          [3, 12],
        ],
        C.yel,
      );
      P(
        [
          [3, 12],
          [17, 8],
          [13, 6],
        ],
        C.lyel,
      );
      E(8, 13, 1, 0.8, C.amber);
    },
    kit: function () {
      R(2, 7, 16, 10, C.lbrn);
      R(2, 6, 16, 3, C.brn);
      R(9, 6, 2, 11, C.red);
    },
  };
  function fr() {
    R(1, 0, 18, 20, C.lgry);
    R(2, 1, 16, 18, '#DDEFFA');
    R(2, 7, 16, 1, C.gry);
    R(2, 12, 16, 1, C.gry);
  }
  /* 띠: 미니홈피풍 동물 얼굴 */
  function animal(k) {
    var b,
      cheek = C.lpink;
    var A = {
      쥐: function () {
        b = C.gry;
        E(4, 5, 3.4, 3.4, b);
        E(16, 5, 3.4, 3.4, b);
        E(4, 5, 1.8, 1.8, C.lpink);
        E(16, 5, 1.8, 1.8, C.lpink);
        E(10, 11, 7, 6.5, b);
        D(10, 13, C.pink);
      },
      소: function () {
        b = C.wht;
        R(2, 3, 3, 2, C.lyel);
        R(15, 3, 3, 2, C.lyel);
        E(10, 10, 7.5, 7, b);
        E(6, 7, 2.2, 1.8, C.blk);
        E(10, 15, 4.5, 2.6, C.lpink);
        D(8, 15, C.dbrn);
        D(12, 15, C.dbrn);
      },
      호랑이: function () {
        b = C.ora;
        E(4.5, 4.5, 2.6, 2.6, b);
        E(15.5, 4.5, 2.6, 2.6, b);
        E(10, 11, 7.5, 7, b);
        R(9, 5, 2, 2, C.blk);
        R(6, 6, 1, 2, C.blk);
        R(13, 6, 1, 2, C.blk);
        R(3, 11, 2, 1, C.blk);
        R(15, 11, 2, 1, C.blk);
        E(10, 14.5, 4, 2.4, C.wht);
        D(10, 13, C.pink);
      },
      토끼: function () {
        b = C.wht;
        R(5, 0, 3, 9, b);
        R(12, 0, 3, 9, b);
        R(6, 1, 1, 7, C.lpink);
        R(13, 1, 1, 7, C.lpink);
        E(10, 12, 7, 6.5, b);
        D(10, 14, C.pink);
      },
      용: function () {
        b = C.grn;
        R(4, 1, 2, 5, C.yel);
        R(14, 1, 2, 5, C.yel);
        E(10, 11, 7.5, 7, b);
        E(10, 15, 5, 2.6, C.mint);
        D(8, 15, C.dgrn);
        D(12, 15, C.dgrn);
        R(8, 4, 4, 1, C.mint);
      },
      뱀: function () {
        b = C.grn;
        E(10, 10, 6.5, 5.5, b);
        E(10, 13, 4, 2, C.mint);
        E(10, 18, 8, 2, b);
        L(10, 15, 10, 17, C.red);
        D(9, 18, C.red);
        D(11, 18, C.red);
      },
      말: function () {
        b = C.brn;
        E(5, 3.5, 2, 2.4, b);
        E(15, 3.5, 2, 2.4, b);
        E(10, 10, 6.5, 8, b);
        R(7, 1, 6, 4, C.dbrn);
        E(10, 15.5, 4.5, 2.6, C.lbrn);
        D(8, 16, C.dbrn);
        D(12, 16, C.dbrn);
      },
      양: function () {
        b = C.cream;
        [
          [4, 4],
          [10, 3],
          [16, 4],
          [3, 9],
          [17, 9],
          [4, 14],
          [16, 14],
        ].forEach(function (p) {
          E(p[0], p[1], 3, 3, C.wht);
        });
        E(10, 11, 5.5, 6, b);
        E(10, 6, 5, 2.4, C.wht);
      },
      원숭이: function () {
        b = C.brn;
        E(3, 11, 2.8, 2.8, b);
        E(17, 11, 2.8, 2.8, b);
        E(3, 11, 1.5, 1.5, C.lbrn);
        E(17, 11, 1.5, 1.5, C.lbrn);
        E(10, 10, 7, 7.5, b);
        E(10, 12, 5, 5.2, C.lbrn);
      },
      닭: function () {
        b = C.wht;
        E(8, 3, 1.6, 2, C.red);
        E(10, 2, 1.6, 2.4, C.red);
        E(12, 3, 1.6, 2, C.red);
        E(10, 11, 7, 7, b);
        P(
          [
            [8, 12],
            [12, 12],
            [10, 15],
          ],
          C.yel,
        );
        E(10, 16.5, 1.4, 1.6, C.red);
      },
      개: function () {
        b = C.lbrn;
        E(10, 11, 7, 7, b);
        E(3.5, 9, 2.6, 5, C.brn);
        E(16.5, 9, 2.6, 5, C.brn);
        E(10, 15, 4, 2.6, C.cream);
        D(10, 13, C.blk);
      },
      돼지: function () {
        b = C.pink;
        P(
          [
            [3, 2],
            [7, 4],
            [4, 7],
          ],
          b,
        );
        P(
          [
            [17, 2],
            [13, 4],
            [16, 7],
          ],
          b,
        );
        E(10, 11, 8, 7, b);
        E(10, 14, 3.6, 2.4, C.lpink);
        D(9, 14, C.dbrn);
        D(11, 14, C.dbrn);
      },
    };
    begin();
    (A[k] || A['돼지'])();
    var ey = k === '토끼' ? 11 : k === '말' ? 9 : 10;
    var f = finish();
    [7, 13].forEach(function (x) {
      f[ey][x] = OUT;
      f[ey - 1][x] = OUT;
    });
    [
      [5, ey + 2],
      [15, ey + 2],
      [6, ey + 2],
      [14, ey + 2],
    ].forEach(function (p) {
      if (f[p[1]][p[0]] && f[p[1]][p[0]] !== OUT) f[p[1]][p[0]] = cheek;
    });
    return svg(f);
  }
  function draw(name) {
    begin();
    var fn = I[name] || X[name];
    if (!fn) {
      if (name.indexOf('ani:') === 0) return animal(name.slice(4));
      fn = X.kit;
    }
    fn();
    return svg(finish());
  }
  var cache = {};
  return {
    px: function (n) {
      return cache[n] || (cache[n] = draw(n));
    },
    names: Object.keys(I),
  };
})();
