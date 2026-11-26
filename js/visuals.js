(function () {
  "use strict";

  const BG = "4,6,12";
  const ICE = [79, 179, 255], ICE2 = [170, 232, 255], FIRE = [255, 138, 61], EMBER = [255, 214, 150], WHITE = [236, 241, 250];

  function mix(a, b, t) {
    t = Math.max(0, Math.min(1, t));
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  }
  function rgba(c, a) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; }
  function heat(q) {
    if (q < 0.5) return mix(ICE, ICE2, q / 0.5);
    if (q < 0.75) return mix(ICE2, EMBER, (q - 0.5) / 0.25);
    return mix(EMBER, FIRE, (q - 0.75) / 0.25);
  }

  function fit(canvas) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(2, Math.round(canvas.clientWidth * dpr)), h = Math.max(2, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; return true; }
    return false;
  }

  function runner(canvas, scene) {
    const ctx = canvas.getContext("2d");
    let raf = 0, last = 0, t = 0, on = false;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - (last || now)) / 1000);
      last = now;
      t += dt;
      if (fit(canvas)) scene.reset(ctx, canvas.width, canvas.height);
      scene.draw(ctx, canvas.width, canvas.height, dt, t);
    }
    return {
      start() {
        if (on) return;
        on = true; last = 0;
        fit(canvas);
        scene.reset(ctx, canvas.width, canvas.height);
        raf = requestAnimationFrame(frame);
      },
      stop() { on = false; cancelAnimationFrame(raf); },
      scene
    };
  }

  function cmul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]]; }
  function cdiv(a, b) { const d = b[0] * b[0] + b[1] * b[1]; return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d]; }
  function csqrt(a) {
    const r = Math.hypot(a[0], a[1]);
    const re = Math.sqrt((r + a[0]) / 2), im = Math.sign(a[1] || 1) * Math.sqrt(Math.max(0, (r - a[0]) / 2));
    return [re, im];
  }

  function joukowski(alphaDeg, eps, mu, circFactor) {
    const al = alphaDeg * Math.PI / 180;
    const z0 = [-eps, mu];
    const R = Math.hypot(1 + eps, mu);
    const beta = Math.atan2(mu, 1 + eps);
    const G = 4 * Math.PI * R * Math.sin(al + beta) * circFactor;
    const ea = [Math.cos(al), Math.sin(al)], ema = [Math.cos(al), -Math.sin(al)];
    function zeta(z) {
      const w = cmul(z, z); w[0] -= 4;
      const s = csqrt(w);
      const a = [(z[0] + s[0]) / 2, (z[1] + s[1]) / 2], b = [(z[0] - s[0]) / 2, (z[1] - s[1]) / 2];
      const da = Math.hypot(a[0] - z0[0], a[1] - z0[1]), db = Math.hypot(b[0] - z0[0], b[1] - z0[1]);
      const c = da > db ? a : b;
      return Math.max(da, db) > R * 1.002 ? c : null;
    }
    function vel(z) {
      const zt = zeta(z);
      if (!zt) return null;
      const s = [zt[0] - z0[0], zt[1] - z0[1]];
      const s2 = cmul(s, s);
      let W = [ema[0], ema[1]];
      const t2 = cdiv([R * R * ea[0], R * R * ea[1]], s2);
      W = [W[0] - t2[0], W[1] - t2[1]];
      const t3 = cdiv([0, G / (2 * Math.PI)], s);
      W = [W[0] + t3[0], W[1] + t3[1]];
      const zz = cmul(zt, zt);
      const dz = [1 - zz[0] / (zz[0] * zz[0] + zz[1] * zz[1]), zz[1] / (zz[0] * zz[0] + zz[1] * zz[1])];
      const V = cdiv(W, dz);
      return [V[0], -V[1]];
    }
    const outline = [];
    for (let i = 0; i <= 160; i++) {
      const th = i / 160 * Math.PI * 2;
      const zt = [z0[0] + R * Math.cos(th), z0[1] + R * Math.sin(th)];
      const inv = cdiv([1, 0], zt);
      outline.push([zt[0] + inv[0], zt[1] + inv[1]]);
    }
    return { vel, outline, al };
  }

  function airfoilScene(cfg) {
    const J = joukowski(cfg.alpha, 0.1, cfg.camber, cfg.circ);
    const ca = Math.cos(-J.al), sa = Math.sin(-J.al);
    const rot = (p) => [p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca];
    const unrot = (p) => [p[0] * ca + p[1] * sa, -p[0] * sa + p[1] * ca];
    let P = [], S = 1, cx = 0, cy = 0, vort = [], shedT = 0, shedSign = 1, sensors = [];
    const span = 7.2;
    const N = cfg.n || 900;
    function spawn(p, anywhere) {
      p.x = anywhere ? -span / 2 + Math.random() * span : -span / 2 - Math.random() * 0.3;
      p.y = (Math.random() - 0.5) * span * 0.62;
      p.age = Math.random() * 3; p.px = p.x; p.py = p.y;
    }
    function velocity(x, y, t) {
      const v0 = J.vel(unrot([x, y]));
      if (!v0) return null;
      let v = rot(v0);
      for (const k of vort) {
        const dx = x - k.x, dy = y - k.y, r2 = dx * dx + dy * dy + k.c * k.c;
        v[0] += -k.g * dy / (2 * Math.PI * r2);
        v[1] += k.g * dx / (2 * Math.PI * r2);
      }
      return v;
    }
    const outR = J.outline.map(rot);
    let te = outR[0], le = outR[0];
    for (const p of outR) { if (p[0] > te[0]) te = p; if (p[0] < le[0]) le = p; }
    return {
      reset(ctx, w, h) {
        S = Math.min(w / span, h / (span * 0.62));
        cx = w / 2; cy = h / 2;
        P = []; for (let i = 0; i < N; i++) { const p = {}; spawn(p, true); P.push(p); }
        sensors = [];
        for (let i = 0; i < (cfg.sensors || 0); i++) sensors.push([(Math.random() - 0.45) * span * 0.75, (Math.random() - 0.5) * span * 0.5, Math.random() * 6]);
        ctx.fillStyle = `rgb(${BG})`; ctx.fillRect(0, 0, w, h);
      },
      draw(ctx, w, h, dt, t) {
        ctx.fillStyle = `rgba(${BG},${cfg.fade || 0.12})`;
        ctx.fillRect(0, 0, w, h);
        if (cfg.modes) {
          ctx.lineWidth = Math.max(1, S * 0.01);
          for (let k = 1; k <= 4; k++) {
            ctx.strokeStyle = rgba(ICE, 0.035);
            ctx.beginPath();
            for (let x = 0; x <= w; x += 6) {
              const y = h / 2 + Math.sin(x / w * Math.PI * 2 * k + t * (0.6 + 0.2 * k)) * h * 0.32 / k;
              x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }
        if (cfg.shed) {
          shedT += dt;
          if (shedT > cfg.shed) {
            shedT = 0;
            const src = shedSign > 0 ? te : [le[0] + 0.25, le[1] + 0.15];
            vort.push({ x: src[0] + 0.15, y: src[1] - 0.05, g: shedSign * cfg.gamma, c: 0.18 });
            shedSign *= -1;
          }
          for (const k of vort) { k.x += 0.55 * dt * cfg.speed; k.c += 0.05 * dt; k.y += 0.03 * dt * Math.sign(k.g); }
          vort = vort.filter((k) => k.x < span / 2 + 1);
        }
        const sp = cfg.speed;
        ctx.lineCap = "round";
        for (const p of P) {
          const v = velocity(p.x, p.y, t);
          p.px = p.x; p.py = p.y;
          if (!v) { spawn(p, false); continue; }
          p.x += v[0] * dt * sp; p.y += v[1] * dt * sp; p.age += dt;
          if (p.x > span / 2 || Math.abs(p.y) > span * 0.4 || !isFinite(p.x)) { spawn(p, false); continue; }
          const q = Math.hypot(v[0], v[1]);
          const c = heat((q - 0.4) / 1.6);
          ctx.strokeStyle = rgba(c, 0.85);
          ctx.lineWidth = Math.max(1, S * 0.018);
          ctx.beginPath();
          ctx.moveTo(cx + p.px * S, cy - p.py * S);
          ctx.lineTo(cx + p.x * S, cy - p.y * S);
          ctx.stroke();
        }
        ctx.beginPath();
        outR.forEach((p, i) => (i ? ctx.lineTo(cx + p[0] * S, cy - p[1] * S) : ctx.moveTo(cx + p[0] * S, cy - p[1] * S)));
        ctx.closePath();
        ctx.fillStyle = `rgb(${BG})`;
        ctx.fill();
        ctx.shadowColor = rgba(ICE2, 0.9);
        ctx.shadowBlur = S * 0.12;
        ctx.strokeStyle = rgba(WHITE, 0.95);
        ctx.lineWidth = Math.max(1.2, S * 0.022);
        ctx.stroke();
        ctx.shadowBlur = 0;
        for (const s of sensors) {
          const a = 0.35 + 0.65 * Math.max(0, Math.sin(t * 2 + s[2]));
          ctx.fillStyle = rgba(FIRE, a);
          ctx.beginPath();
          ctx.arc(cx + s[0] * S, cy - s[1] * S, Math.max(1.5, S * 0.03), 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
  }

  function scramjetScene() {
    let W = 1, H = 1, P = [], g = {}, sensors = [];
    const N = 520;
    function geom(w, h) {
      const x0 = 0.04 * w, th = 10 * Math.PI / 180;
      const yb = 0.78 * h, x1 = 0.4 * w;
      const yf = yb - Math.tan(th) * (x1 - x0);
      const yc = yf - 0.26 * h;
      const beta = Math.atan2(yb - yc, 0.34 * w);
      const xl = x0 + (yb - yc) / Math.tan(beta);
      return { x0, th, beta, yb, x1, yf, yc, xl };
    }
    function floorY(x) { return x < g.x0 ? g.yb : x < g.x1 ? g.yb - Math.tan(g.th) * (x - g.x0) : g.yf; }
    function spawn(p, any) {
      p.x = any ? Math.random() * W : -Math.random() * W * 0.05;
      p.y = g.yc - 0.16 * H + Math.random() * (g.yb - g.yc + 0.15 * H);
      p.j = Math.random();
    }
    return {
      reset(ctx, w, h) {
        W = w; H = h; g = geom(w, h);
        P = []; for (let i = 0; i < N; i++) { const p = {}; spawn(p, true); P.push(p); }
        sensors = []; for (let i = 0; i < 10; i++) sensors.push(g.x1 + (i + 0.5) / 10 * (W - g.x1));
        ctx.fillStyle = `rgb(${BG})`; ctx.fillRect(0, 0, w, h);
      },
      draw(ctx, w, h, dt, t) {
        ctx.fillStyle = `rgba(${BG},0.3)`;
        ctx.fillRect(0, 0, w, h);
        const cyc = (t % 8) / 8;
        const L = W - g.xl, hgt = g.yf - g.yc;
        let front;
        if (cyc < 0.5) front = g.xl + L * (0.88 - 0.74 * (cyc / 0.5) ** 1.8);
        else front = g.xl + L * (0.14 + 0.74 * (1 - Math.exp(-(cyc - 0.5) * 7)));
        const jets = cyc > 0.44 && cyc < 0.78;
        const warn = Math.max(0, Math.min(1, (cyc - 0.28) / 0.16)) * (cyc < 0.78 ? 1 : 0);
        const Ls = W * 0.02, s = W * 0.22;
        ctx.lineCap = "round";
        for (const p of P) {
          let vx = 1, vy = 0, q = 0.08, a = 0.85;
          const inside = p.x > g.xl && p.y > g.yc;
          const shockX = g.x0 + (g.yb - p.y) / Math.tan(g.beta);
          if (p.y < g.yc && p.x > g.xl - W * 0.02) a = 0.22;
          if (!inside && p.x > shockX && p.y > g.yc) { vx = Math.cos(g.th); vy = -Math.sin(g.th); q = 0.3; }
          if (p.x > g.x1 && inside) { vx = 0.85; vy = 0; q = 0.38; }
          if (inside && p.x > front) {
            const e = Math.min(1, (p.x - front) / (hgt * 1.5));
            vx = 0.32 + 0.1 * Math.sin(t * 5 + p.j * 9); vy = Math.sin(p.x * 0.04 + t * 7 + p.j * 6) * 0.35 * e; q = 0.72 + 0.28 * e;
          }
          p.x += vx * dt * s; p.y += vy * dt * s;
          const fy = floorY(p.x);
          if (p.y > fy - 2) p.y = fy - 2 - Math.random() * 3;
          if (inside && p.y < g.yc + 2) p.y = g.yc + 2 + Math.random() * 3;
          if (p.x > W + 5) { spawn(p, false); continue; }
          ctx.strokeStyle = rgba(heat(q), a);
          ctx.lineWidth = Math.max(1, H * (q > 0.7 ? 0.006 : 0.004));
          ctx.beginPath(); ctx.moveTo(p.x - vx * Ls, p.y - vy * Ls); ctx.lineTo(p.x, p.y); ctx.stroke();
        }
        const fg = ctx.createLinearGradient(front - hgt * 0.4, 0, front + hgt * 1.6, 0);
        fg.addColorStop(0, rgba(FIRE, 0)); fg.addColorStop(0.25, rgba(FIRE, 0.22 + 0.25 * warn)); fg.addColorStop(1, rgba(FIRE, 0));
        ctx.fillStyle = fg;
        ctx.fillRect(front - hgt * 0.4, g.yc, hgt * 2, hgt);
        ctx.shadowColor = rgba(ICE2, 0.9); ctx.shadowBlur = H * 0.025;
        ctx.strokeStyle = rgba(ICE2, 0.7 + 0.2 * Math.sin(t * 9));
        ctx.lineWidth = Math.max(1.5, H * 0.006);
        ctx.beginPath(); ctx.moveTo(g.x0, g.yb); ctx.lineTo(g.xl, g.yc); ctx.stroke();
        ctx.strokeStyle = rgba(ICE2, 0.35);
        ctx.beginPath(); ctx.moveTo(g.xl, g.yc); ctx.lineTo(g.xl + hgt * 1.4, g.yf); ctx.stroke();
        ctx.shadowColor = rgba(FIRE, 0.9);
        ctx.strokeStyle = rgba(EMBER, 0.9);
        ctx.lineWidth = Math.max(1.5, H * 0.007);
        let x = front;
        for (let k = 0; k < 7 && x < W; k++) {
          const dx = hgt * (0.62 - k * 0.06);
          ctx.globalAlpha = 1 - k * 0.12;
          ctx.beginPath();
          ctx.moveTo(x, g.yc + 3); ctx.quadraticCurveTo(x + dx * 0.35, g.yc + hgt * 0.5, x, g.yf - 3);
          ctx.moveTo(x + dx * 0.2, g.yc + 3); ctx.lineTo(x + dx, g.yf - 3);
          ctx.moveTo(x + dx * 0.2, g.yf - 3); ctx.lineTo(x + dx, g.yc + 3);
          ctx.stroke();
          x += dx * 1.15;
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.strokeStyle = rgba(WHITE, 0.95);
        ctx.lineWidth = Math.max(2, H * 0.008);
        ctx.beginPath(); ctx.moveTo(0, g.yb); ctx.lineTo(g.x0, g.yb); ctx.lineTo(g.x1, g.yf); ctx.lineTo(W, g.yf); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(g.xl - H * 0.1, g.yc - H * 0.05); ctx.lineTo(g.xl, g.yc); ctx.lineTo(W, g.yc); ctx.stroke();
        for (const sx of sensors) {
          ctx.fillStyle = rgba(mix(ICE2, FIRE, warn), 0.55 + 0.45 * warn * (0.5 + 0.5 * Math.sin(t * 22)));
          ctx.fillRect(sx - H * 0.006, g.yc - H * 0.016, H * 0.012, H * 0.016);
        }
        if (jets) {
          for (let i = 0; i < 3; i++) {
            const jx = g.x1 + (W - g.x1) * (0.12 + i * 0.1);
            const r = hgt * (0.55 + 0.1 * Math.sin(t * 30 + i));
            const grd = ctx.createRadialGradient(jx, g.yf, 0, jx, g.yf, r);
            grd.addColorStop(0, rgba(EMBER, 0.9)); grd.addColorStop(0.4, rgba(FIRE, 0.5)); grd.addColorStop(1, rgba(FIRE, 0));
            ctx.fillStyle = grd;
            ctx.beginPath(); ctx.arc(jx, g.yf, r, Math.PI, 2 * Math.PI); ctx.fill();
          }
        }
        const state = jets ? "JETS FIRING" : warn > 0.05 ? "UNSTART WARNING · SENSORS" : "STARTED";
        ctx.font = `${Math.round(H * 0.034)}px "JetBrains Mono", monospace`;
        ctx.fillStyle = rgba(jets || warn > 0.05 ? FIRE : ICE2, 0.95);
        ctx.fillText(state, W * 0.04, H * 0.1);
        ctx.fillStyle = rgba(WHITE, 0.45);
        ctx.fillText("ISOLATOR", g.x1 + (W - g.x1) * 0.62, g.yc - H * 0.035);
        ctx.fillText("RAMP", g.x0 + W * 0.12, g.yb + H * 0.07);
      }
    };
  }

  function suspensionScene(opts) {
    let W = 1, H = 1, s = 0, target = 0, drag = null, s0 = 0, roll = 0, k = 1, gy0 = 1.6;
    const st = { travel: 0, camber: 0 };
    const geo = { Ui: [0.38, -0.78], Li: [0, 0.05], Lu: 1.5, Ll: 1.9, up: 0.95 };
    const R = 0.66;
    function solve(travel) {
      const Li = geo.Li;
      const yL = 0.1 - travel;
      const sy = Math.max(-0.95, Math.min(0.95, (yL - Li[1]) / geo.Ll));
      const Lo = [Li[0] + geo.Ll * Math.sqrt(1 - sy * sy), Li[1] + geo.Ll * sy];
      const d = Math.hypot(Lo[0] - geo.Ui[0], Lo[1] - geo.Ui[1]);
      const a = (geo.Lu * geo.Lu - geo.up * geo.up + d * d) / (2 * d);
      const hh = Math.sqrt(Math.max(0, geo.Lu * geo.Lu - a * a));
      const ex = [(Lo[0] - geo.Ui[0]) / d, (Lo[1] - geo.Ui[1]) / d];
      const pm = [geo.Ui[0] + a * ex[0], geo.Ui[1] + a * ex[1]];
      const c1 = [pm[0] + hh * ex[1], pm[1] - hh * ex[0]], c2 = [pm[0] - hh * ex[1], pm[1] + hh * ex[0]];
      const Uo = c1[1] < c2[1] ? c1 : c2;
      return { Lo, Uo };
    }
    function ground(x, t) {
      return 0.13 * Math.sin(x * 2.1 + t * 2.4) + 0.08 * Math.sin(x * 5.3 + t * 4.1) + 0.05 * Math.sin(x * 9 + t * 7);
    }
    const toW = (p) => [W * 0.1 + p[0] * k, H * 0.53 + p[1] * k];
    const fromW = (x, y) => [(x - W * 0.1) / k, (y - H * 0.53) / k];
    function wheelAt(tr) {
      const r = solve(tr), ux = r.Uo[0] - r.Lo[0], uy = r.Uo[1] - r.Lo[1], ul = Math.hypot(ux, uy);
      return [r.Lo[0] + ux * 0.42 - uy / ul * 0.42, r.Lo[1] + uy * 0.42 + ux / ul * 0.42];
    }
    return {
      state: st,
      pointerDown(x, y) { drag = y; s0 = s; target = s; },
      pointerMove(x, y) { if (drag !== null) target = Math.max(-0.34, Math.min(0.34, s0 + (drag - y) / k)); },
      pointerUp() { drag = null; },
      reset(ctx, w, h) { W = w; H = h; k = Math.min(w / 3.55, h / 2.7); const z = wheelAt(0); gy0 = z[1] + R; },
      draw(ctx, w, h, dt, t) {
        ctx.fillStyle = `rgb(${BG})`;
        ctx.fillRect(0, 0, w, h);
        const wheelX = 2.45;
        const gnd = ground(wheelX, t);
        const want = drag !== null ? target : gnd;
        s += (want - s) * Math.min(1, dt * 10);
        const { Lo, Uo } = solve(s);
        const ux = Uo[0] - Lo[0], uy = Uo[1] - Lo[1], ul = Math.hypot(ux, uy);
        const nx = -uy / ul, ny = ux / ul;
        const C = [Lo[0] + ux * 0.42 + nx * 0.42, Lo[1] + uy * 0.42 + ny * 0.42];
        const camber = Math.atan2(ux, -uy) * 180 / Math.PI;
        st.travel = s; st.camber = camber;
        roll += dt * 3;
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        ctx.strokeStyle = rgba(WHITE, 0.08); ctx.lineWidth = 1;
        for (let gx = 0; gx < w; gx += k * 0.25) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke(); }
        ctx.beginPath();
        for (let x = 0; x <= w; x += 4) {
          const wx = fromW(x, 0)[0];
          const y = toW([0, gy0 - ground(wx, t)])[1];
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(EMBER, 0.45); ctx.lineWidth = Math.max(1, k * 0.012); ctx.stroke();
        const ch = [toW([-0.4, -1.05]), toW([0.12, -1.05]), toW([0.12, 0.35]), toW([-0.4, 0.35])];
        ctx.strokeStyle = rgba(WHITE, 0.25); ctx.lineWidth = Math.max(1, k * 0.012);
        ctx.beginPath(); ch.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ch[0][0], ch[0][1]); ctx.lineTo(ch[2][0], ch[2][1]); ctx.stroke();
        const tw = toW([0.95, -1.15]);
        ctx.beginPath(); ctx.moveTo(ch[1][0], ch[1][1]); ctx.lineTo(tw[0], tw[1]); ctx.lineTo(ch[1][0], ch[1][1] + k * 0.5); ctx.stroke();
        const b1 = toW([0.12, -0.62]), b2 = toW(geo.Ui), b3 = toW([0.12, -0.95]);
        ctx.beginPath(); ctx.moveTo(b3[0], b3[1]); ctx.lineTo(b2[0], b2[1]); ctx.lineTo(b1[0], b1[1]); ctx.stroke();
        const sm = [0.95, -1.15];
        const sa = [geo.Li[0] + (Lo[0] - geo.Li[0]) * 0.72, geo.Li[1] + (Lo[1] - geo.Li[1]) * 0.72];
        const A = toW(sm), B = toW(sa);
        const len = Math.hypot(B[0] - A[0], B[1] - A[1]);
        const ex = [(B[0] - A[0]) / len, (B[1] - A[1]) / len], ey = [-ex[1], ex[0]];
        ctx.strokeStyle = rgba(FIRE, 0.9); ctx.lineWidth = Math.max(1, k * 0.014);
        ctx.beginPath(); ctx.moveTo(A[0], A[1]);
        const coils = 11;
        for (let i = 1; i < coils * 2; i++) {
          const f = 0.15 + 0.7 * i / (coils * 2), sgn = i % 2 ? 1 : -1;
          ctx.lineTo(A[0] + ex[0] * len * f + ey[0] * sgn * k * 0.09, A[1] + ex[1] * len * f + ey[1] * sgn * k * 0.09);
        }
        ctx.lineTo(B[0], B[1]); ctx.stroke();
        ctx.shadowColor = rgba(ICE, 0.9); ctx.shadowBlur = k * 0.08;
        ctx.strokeStyle = rgba(ICE2, 0.95); ctx.lineWidth = Math.max(2, k * 0.035);
        for (const [a, b] of [[geo.Ui, Uo], [geo.Li, Lo]]) {
          const p = toW(a), q = toW(b);
          ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
        }
        ctx.shadowColor = rgba(FIRE, 0.9);
        ctx.strokeStyle = rgba(EMBER, 1);
        const pu = toW(Uo), pl = toW(Lo), pc = toW(C);
        ctx.beginPath(); ctx.moveTo(pu[0], pu[1]); ctx.lineTo(pl[0], pl[1]); ctx.moveTo(pu[0] + (pl[0] - pu[0]) * 0.42, pu[1] + (pl[1] - pu[1]) * 0.42); ctx.lineTo(pc[0], pc[1]); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = rgba(WHITE, 0.85); ctx.lineWidth = Math.max(2, k * 0.05);
        ctx.beginPath(); ctx.arc(pc[0], pc[1], R * k, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = rgba(WHITE, 0.3); ctx.lineWidth = Math.max(1, k * 0.012);
        ctx.beginPath(); ctx.arc(pc[0], pc[1], R * k * 0.55, 0, Math.PI * 2); ctx.stroke();
        for (let i = 0; i < 18; i++) {
          const a = roll + i / 18 * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(pc[0] + Math.cos(a) * R * k * 0.86, pc[1] + Math.sin(a) * R * k * 0.86);
          ctx.lineTo(pc[0] + Math.cos(a) * R * k * 1.0, pc[1] + Math.sin(a) * R * k * 1.0);
          ctx.stroke();
        }
        for (const p of [geo.Ui, geo.Li, Uo, Lo, sm]) {
          const q = toW(p);
          ctx.fillStyle = `rgb(${BG})`; ctx.strokeStyle = rgba(WHITE, 0.9); ctx.lineWidth = Math.max(1, k * 0.012);
          ctx.beginPath(); ctx.arc(q[0], q[1], k * 0.035, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        if (opts && opts.readout) opts.readout(st);
      }
    };
  }

  const SCENES = {
    fno: () => airfoilScene({ alpha: 6, camber: 0.08, circ: 1, speed: 0.9, modes: true, sensors: 34 }),
    pinn: () => airfoilScene({ alpha: 25, camber: 0.04, circ: 0.55, speed: 0.9, shed: 0.45, gamma: 2.8, sensors: 22, fade: 0.1 }),
    scramjet: () => scramjetScene(),
    suspension: (o) => suspensionScene(o)
  };

  window.Viz = {
    create(kind, canvas, opts) { return runner(canvas, SCENES[kind](opts)); },
    kinds: Object.keys(SCENES)
  };
})();
