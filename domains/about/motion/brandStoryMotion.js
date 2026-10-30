/** Original demo-day projection math; lifecycle and DOM access scoped to React. */
export function mountBrandStory(root) {
  const cleanups = [];
  const frames = new Set();
  let disposed = false;
  const getById = (id) => root.querySelector(`[id="${id}"]`);
  const requestAnimationFrame = (callback) => {
    if (disposed) return 0;
    const id = window.requestAnimationFrame((time) => {
      frames.delete(id);
      if (!disposed) callback(time);
    });
    frames.add(id);
    return id;
  };
  const cancelAnimationFrame = (id) => {
    window.cancelAnimationFrame(id);
    frames.delete(id);
  };
  const listen = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    cleanups.push(() => target.removeEventListener(event, handler, options));
  };
  const observeChanges = (target, handler) => {
    const observer = new MutationObserver(handler);
    observer.observe(target, { attributes: true, attributeFilter: ['class'] });
    cleanups.push(() => observer.disconnect());
  };
  const cards = getById('f3cards');
  if (cards) cards.replaceChildren();
  root.querySelectorAll('.seen').forEach((el) => el.classList.remove('seen'));
  const BUR = '#591921',
    HOT = '#A0242E';
  /* f3d: 국내 이커머스 vs Little Portions — 순수 JS 원근 투영 3D 퍼널 */
  (function () {
    let sc = getById('f3d');
    if (!sc) return;
    let sv = getById('f3svg'),
      wrap = getById('f3cards'),
      slide = sc.closest('.slide');
    let C = [
      [-18, 0, 5],
      [-12, 0, 6.4],
      [-6, 0, 4.4],
      [0, 0, 6.2],
      [6, 0, 4.4],
      [12, 0, 6.2],
      [17, 0, 5],
    ];
    let L = [
      [-18, 0, -4.6],
      [-11, 0, -4.9],
      [-4, 0, -4.3],
      [2, 0, -4.7],
      [5.5, 0, -4.6],
    ];
    let cs = [
      ['Promotions', 'Arrive through discounts and ads'],
      ['Search', 'Decide what to buy first'],
      ['Product list', 'Compare similar products'],
      ['Product details', 'Check pack sizes and prices'],
      ['Options', 'Choose a pack size'],
      ['Cart', 'Add more to your cart'],
      ['Minimums', 'Meet the free-delivery threshold'],
      ['Payment', 'Enter delivery and payment details'],
    ];
    let us = [
      ['Discover', 'Meals and food stories'],
      ['Taste quiz', 'Three visual questions'],
      ['Food picks', 'Ingredients + meal kits'],
      ['Product details', 'Price per portion and group progress'],
      ['Join a group', 'Join and track progress'],
    ];
    let N = [];
    cs.forEach(function (c, i) {
      N.push({
        lane: C,
        t: 0.06 + i * 0.125,
        cls: 'cp' + (i === 5 || i === 6 ? ' gate' : ''),
        ix: '0' + (i + 1),
        b: c[0],
        d: c[1],
        g: i === 5 || i === 6,
      });
    });
    us.forEach(function (c, i) {
      N.push({
        lane: L,
        t: [0.04, 0.28, 0.52, 0.76, 1][i],
        cls: i === 4 ? 'goal' : 'us',
        ix: i === 4 ? 'GOAL' : '0' + (i + 1),
        b: c[0],
        d: c[1],
      });
    });
    function lerpPath(P, t) {
      let seg = P.length - 1,
        u = Math.min(0.9999, Math.max(0, t)) * seg,
        i = Math.floor(u),
        f = u - i;
      let p0 = P[Math.max(0, i - 1)],
        p1 = P[i],
        p2 = P[i + 1],
        p3 = P[Math.min(seg, i + 2)];
      return [0, 1, 2].map(function (k) {
        let a = p1[k],
          b = p2[k],
          m1 = (p2[k] - p0[k]) / 2,
          m2 = (p3[k] - p1[k]) / 2,
          f2 = f * f,
          f3 = f2 * f;
        return (
          (2 * f3 - 3 * f2 + 1) * a +
          (f3 - 2 * f2 + f) * m1 +
          (-2 * f3 + 3 * f2) * b +
          (f3 - f2) * m2
        );
      });
    }
    N.forEach(function (n) {
      n.p = lerpPath(n.lane, n.t);
    });
    let cards = N.map(function (n) {
      let el = document.createElement('div');
      el.className = 'cd ' + n.cls;
      el.innerHTML =
        '<div class="c" tabindex="0"><span class="ix">' +
        n.ix +
        '</span><b>' +
        n.b +
        '</b><div class="tip">' +
        n.d +
        (n.g ? '<em>Drop-off point (UX hypothesis, not measured)</em>' : '') +
        '</div></div>';
      wrap.appendChild(el);
      return el;
    });
    let RM =
      window.matchMedia &&
      matchMedia('(prefers-reduced-motion: reduce)').matches;
    let t0 = performance.now(),
      active = false,
      raf = 0,
      W = 0,
      H = 0,
      F = 1,
      OX = 0,
      OY = 0;
    function cam(p, th) {
      let c = Math.cos(th),
        s = Math.sin(th),
        x = p[0] * c - p[2] * s,
        z = p[0] * s + p[2] * c,
        y = p[1];
      let yy = y - 14,
        zz = z + 32,
        ph = 0.44,
        cp = Math.cos(ph),
        sp = Math.sin(ph);
      return [x, yy * cp + zz * sp, -yy * sp + zz * cp];
    }
    function fit(th) {
      let pts = C.concat(L).concat([
        [-18, 0, 9.5],
        [17, 0, 9],
        [-18, 0, -6],
        [8, 0, -6],
      ]);
      let a = 1e9,
        b = -1e9,
        c = 1e9,
        d = -1e9;
      pts.forEach(function (p) {
        let v = cam(p, th),
          x = v[0] / v[2],
          y = -v[1] / v[2];
        a = Math.min(a, x);
        b = Math.max(b, x);
        c = Math.min(c, y);
        d = Math.max(d, y);
      });
      let px = W * 0.04,
        pt = H * 0.16,
        pb = H * 0.04;
      F = Math.min((W - 2 * px) / (b - a), (H - pt - pb) / (d - c));
      OX = px - a * F + (W - 2 * px - (b - a) * F) / 2;
      OY = pt - c * F;
    }
    function P(p, th) {
      let v = cam(p, th);
      return {
        x: OX + (F * v[0]) / v[2],
        y: OY - (F * v[1]) / v[2],
        z: v[2],
        s: 1 / v[2],
      };
    }
    function f1(q) {
      return q.x.toFixed(1) + ',' + q.y.toFixed(1);
    }
    function ribbon(Pth, th, upto, w, fill, side, dash) {
      let n = 56,
        Lp = [],
        Rp = [],
        Rd = [];
      for (let i = 0; i <= n; i++) {
        let t = (i / n) * upto,
          c = lerpPath(Pth, t),
          c2 = lerpPath(Pth, Math.min(1, t + 0.01)),
          dx = c2[0] - c[0],
          dz = c2[2] - c[2],
          len = Math.hypot(dx, dz) || 1,
          nx = ((-dz / len) * w) / 2,
          nz = ((dx / len) * w) / 2;
        Lp.push(P([c[0] + nx, c[1], c[2] + nz], th));
        Rp.push(P([c[0] - nx, c[1], c[2] - nz], th));
        Rd.push(P([c[0] - nx, c[1] - 0.5, c[2] - nz], th));
      }
      return (
        '<path d="M' +
        Rp.map(f1).join('L') +
        'L' +
        Rd.slice().reverse().map(f1).join('L') +
        'Z" fill="' +
        side +
        '"/><path d="M' +
        Lp.map(f1).join('L') +
        'L' +
        Rp.slice().reverse().map(f1).join('L') +
        'Z" fill="' +
        fill +
        '"/><path d="M' +
        Lp.map(function (q, i) {
          let r = Rp[i];
          return (
            ((q.x + r.x) / 2).toFixed(1) + ',' + ((q.y + r.y) / 2).toFixed(1)
          );
        }).join('L') +
        '" fill="none" stroke="' +
        dash +
        '" stroke-width="1.5" stroke-dasharray="6 7" opacity=".8"/>'
      );
    }
    function frame(now) {
      W = sc.clientWidth;
      H = sc.clientHeight;
      if (!W || !H) {
        if (active) raf = requestAnimationFrame(frame);
        return;
      }
      sv.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      let el = (now - t0) / 1000,
        intro = RM ? 1 : Math.min(1, el / 2.8),
        ease = 1 - Math.pow(1 - intro, 3),
        th = RM ? 0.2 : 0.2 + 0.045 * Math.sin(el * 0.35);
      fit(0.2);
      let g = '',
        fs = Math.max(11, W * 0.0112);
      for (let gx = -18; gx <= 18; gx += 3) {
        let a = P([gx, -0.6, -8], th),
          b = P([gx, -0.6, 8.5], th);
        g +=
          '<line x1="' +
          a.x +
          '" y1="' +
          a.y +
          '" x2="' +
          b.x +
          '" y2="' +
          b.y +
          '" stroke="#D8CBA8" opacity=".55"/>';
      }
      for (let gz = -8; gz <= 8.5; gz += 2.75) {
        let a2 = P([-18, -0.6, gz], th),
          b2 = P([18, -0.6, gz], th);
        g +=
          '<line x1="' +
          a2.x +
          '" y1="' +
          a2.y +
          '" x2="' +
          b2.x +
          '" y2="' +
          b2.y +
          '" stroke="#D8CBA8" opacity=".55"/>';
      }
      g += ribbon(
        C,
        th,
        ease,
        1.6,
        'rgba(156,139,106,.85)',
        '#6E5F45',
        '#FBF8EF',
      );
      g += ribbon(
        L,
        th,
        Math.min(1, ease * 1.25),
        1.9,
        'rgba(89,25,33,.92)',
        '#3A0F15',
        '#F6D98C',
      );
      let gp = P(L[L.length - 1], th),
        gr = P([L[L.length - 1][0] + 2.2, 0, L[L.length - 1][2]], th),
        rr = Math.abs(gr.x - gp.x);
      g +=
        '<ellipse cx="' +
        gp.x +
        '" cy="' +
        gp.y +
        '" rx="' +
        rr * (0.9 + 0.06 * Math.sin(el * 2.2)) +
        '" ry="' +
        rr * 0.36 +
        '" fill="rgba(160,36,46,.2)" stroke="' +
        HOT +
        '" stroke-width="2" opacity="' +
        ease +
        '"/>';
      if (intro > 0.3) {
        // 경쟁사 흐름: 일부는 관문에서 떨어짐(가설)
        for (let i = 0; i < 12; i++) {
          let u = RM ? (i + 0.5) / 12 : (el * 0.06 + i / 12) % 1,
            drop = i % 3 === 0 ? N[5].t : i % 3 === 1 ? N[6].t : 2,
            pos,
            op = 1;
          if (u > drop) {
            let c0 = lerpPath(C, drop),
              k = (u - drop) * 14;
            pos = [
              c0[0] + k * 0.8,
              c0[1] + 0.25 - k * k * 1.6,
              c0[2] + k * 1.2,
            ];
            op = Math.max(0, 1 - k * 1.4);
          } else {
            let c = lerpPath(C, u);
            pos = [c[0], c[1] + 0.25, c[2]];
            op = u > 0.95 ? (1 - u) / 0.05 : Math.min(1, u / 0.04);
          }
          if (op <= 0) continue;
          let p = P(pos, th),
            r = Math.max(2, p.s * F * 0.2);
          g +=
            '<circle cx="' +
            p.x.toFixed(1) +
            '" cy="' +
            p.y.toFixed(1) +
            '" r="' +
            r.toFixed(1) +
            '" fill="#FBF8EF" stroke="#6E5F45" stroke-width="1" opacity="' +
            op.toFixed(2) +
            '"/>';
        }
        // 우리 흐름: 전부 소분 신청에 도착
        for (let j = 0; j < 9; j++) {
          let v = RM ? (j + 0.5) / 9 : (el * 0.11 + j / 9) % 1,
            cc = lerpPath(L, v),
            q = P([cc[0], cc[1] + 0.25, cc[2]], th),
            r2 = Math.max(2.2, q.s * F * 0.24),
            o2 = v > 0.94 ? (1 - v) / 0.06 : Math.min(1, v / 0.04);
          g +=
            '<circle cx="' +
            q.x.toFixed(1) +
            '" cy="' +
            q.y.toFixed(1) +
            '" r="' +
            (r2 * 1.9).toFixed(1) +
            '" fill="#F6D98C" opacity="' +
            (0.28 * o2).toFixed(2) +
            '"/><circle cx="' +
            q.x.toFixed(1) +
            '" cy="' +
            q.y.toFixed(1) +
            '" r="' +
            r2.toFixed(1) +
            '" fill="#F6D98C" stroke="#591921" stroke-width="1" opacity="' +
            o2.toFixed(2) +
            '"/>';
        }
      }
      function pill(pt, txt, bg, fg, dy, k) {
        let F2 = fs * k,
          w = 0;
        for (let q = 0; q < txt.length; q++)
          w += /[가-힣]/.test(txt[q]) ? F2 * 1.02 : F2 * 0.6;
        w += F2 * 1.6;
        let h = F2 * 1.9,
          x = pt.x,
          y = pt.y + dy;
        return (
          '<g opacity="' +
          Math.min(1, ease * 1.5).toFixed(2) +
          '"><rect x="' +
          x +
          '" y="' +
          y +
          '" width="' +
          w +
          '" height="' +
          h +
          '" rx="' +
          h / 2 +
          '" fill="' +
          bg +
          '"/><text x="' +
          (x + w / 2) +
          '" y="' +
          (y + h * 0.68) +
          '" text-anchor="middle" font-size="' +
          F2 +
          '" font-weight="900" fill="' +
          fg +
          '">' +
          txt +
          '</text></g>'
        );
      }
      g += pill(
        P([-17.2, -0.5, 3.2], th),
        'Typical ecommerce',
        '#8C7B5A',
        '#FBF8EF',
        fs * 0.5,
        1.15,
      );
      g += pill(
        P([-18.4, -0.5, -5.6], th),
        'Little Portions',
        '#A0242E',
        '#FFFFFF',
        fs * 0.6,
        1.45,
      );
      sv.innerHTML = g;
      N.forEach(function (n, i) {
        let p = P(n.p, th),
          e = cards[i],
          k = Math.max(0.8, Math.min(1.1, (p.s * F) / (W * 0.032)));
        e.style.transform =
          'translate(' +
          p.x.toFixed(1) +
          'px,' +
          (p.y - 6).toFixed(1) +
          'px) translate(-50%,-100%) scale(' +
          k.toFixed(3) +
          ')';
        e.style.zIndex = String(Math.round(1000 - p.z * 10));
        e.classList.toggle('lo', p.y < H * 0.42);
        e.classList.toggle(
          'on',
          ease >= Math.min(0.97, (n.lane === L ? n.t / 1.25 : n.t) * 0.92),
        );
      });
      if (active && !RM) raf = requestAnimationFrame(frame);
    }
    function start() {
      cancelAnimationFrame(raf);
      t0 = performance.now();
      cards.forEach(function (c) {
        c.classList.remove('on');
      });
      raf = requestAnimationFrame(frame);
    }
    // Replay is scoped to this page button.
    listen(getById('f3rp'), 'click', function (e) {
      e.stopPropagation();
      start();
    });
    listen(sc, 'click', function (e) {
      if (!e.target.closest('.cd')) start();
    });
    function check() {
      let bounds = sc.getBoundingClientRect();
      let on = bounds.bottom > 0 && bounds.top < window.innerHeight;
      if (on && !active) {
        active = true;
        start();
      } else if (!on && active) {
        active = false;
        cancelAnimationFrame(raf);
      }
    }
    observeChanges(slide, check);
    listen(window, 'resize', function () {
      if (active || RM) requestAnimationFrame(frame);
    });
    listen(window, 'scroll', check, { passive: true });
    check();
  })();

  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('seen');
          observer.unobserve(entry.target);
          if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
            entry.target.querySelectorAll('[data-count]').forEach((el) => {
              const text = el.firstChild;
              if (!text || text.nodeType !== 3) return;
              const target = Number(el.dataset.count);
              const decimals = String(target).includes('.') ? 1 : 0;
              const start = performance.now();
              const tick = (now) => {
                const p = Math.min(1, (now - start) / 1200);
                text.nodeValue = (target * (1 - Math.pow(1 - p, 3))).toFixed(
                  decimals,
                );
                if (p < 1) requestAnimationFrame(tick);
              };
              requestAnimationFrame(tick);
            });
          }
        }
      }),
    { threshold: 0.15 },
  );
  root.querySelectorAll('.storySection').forEach((el) => observer.observe(el));

  return () => {
    disposed = true;
    frames.forEach((id) => window.cancelAnimationFrame(id));
    frames.clear();
    observer.disconnect();
    cleanups.forEach((cleanup) => cleanup());
    if (cards) cards.replaceChildren();
  };
}
