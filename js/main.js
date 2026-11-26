(function () {
  "use strict";

  const PROJECTS = [
    {
      id: "dns", kind: "research",
      title: "Learned closures for turbulent hydrogen flames",
      tags: "DNS · LES · PeleC · ML", years: "2026 &mdash;",
      eyebrow: "Jul 2026 to present &nbsp;/&nbsp; ME 499 research",
      role: "Computational Combustion and Machine Learning Lab, IIT Gandhinagar &nbsp;·&nbsp; Advisor: Prof. Shubhangi Bansude",
      lede: "Hydrogen flames are thin, fast and tangled up in turbulence, so simulating every detail takes a supercomputer for days. Practical simulations use a coarser grid (large-eddy simulation, LES) that cannot see the smallest eddies or the flame front itself, so they must estimate how fast fuel burns inside each grid cell. I ran a direct numerical simulation (DNS) of an igniting hydrogen&ndash;air mixing layer in PeleC, filtered it down to LES resolution, and use it to teach machine-learned closures for the filtered reaction rate, trained offline, with the solver in the loop, and through learned filtered density functions. The goal is simple: a cheap simulation that burns the way the real flame does.",
      stats: [], points: [],
      peek: { video: "assets/dns_orbit.mp4" },
      media: [
        { video: "assets/dns_orbit.mp4", poster: "assets/dns_hero.jpg", cap: "PeleC DNS at peak heat release: OH glow with vortex tubes" },
        { img: "assets/dns_hero.jpg", cap: "OH radical (blue) and vortex tubes (orange) at peak heat release" },
        { img: "assets/dns_vortex.jpg", cap: "Vortex tubes coloured by temperature: cold fuel side blue, hot side orange" },
        { img: "assets/dns_flame_sheet.jpg", cap: "Heat-release surface coloured by OH, with vorticity haze" },
        { img: "assets/dns_oh.jpg", cap: "OH volume as the layer burns" },
        { img: "assets/les/dns_filtered_coarse.jpg", light: true, cap: "DNS, the filtered DNS an LES should reproduce, and a coarse run with no closure" },
        { img: "assets/les/closure_fields.jpg", light: true, cap: "Temperature from coarse runs with different closures, against the filtered-DNS target" },
        { img: "assets/les/heat_release.jpg", light: true, cap: "Heat release over time: filtered DNS against coarse runs restarted from it" }
      ],
      pubs: [], links: []
    },
    {
      id: "scramjet", kind: "research",
      title: "Reinforcement-learning control of scramjet unstart",
      tags: "RANS · RL · surrogates", years: "2026 &mdash;",
      eyebrow: "Apr 2026 to present &nbsp;/&nbsp; Visiting research student",
      role: "FLAME Lab, Indian Institute of Science, Bengaluru &nbsp;·&nbsp; Advisor: Prof. Konduri Aditya",
      lede: "A scramjet breathes air at several times the speed of sound. If the pressure inside rises too far, its shock waves are pushed out of the intake and the engine &ldquo;unstarts&rdquo;, choking its own airflow. We are teaching a controller to fire small wall jets in time to stop this. The flow is computed with RANS simulations in OpenFOAM; a few wall pressure sensors, placed using co-kurtosis, give early warning; and learned world models (GRU, Koopman and Dreamer-style surrogates) forecast how the flow will evolve, so that a reinforcement-learning agent (Soft Actor-Critic) can practise cheaply and call the expensive CFD only when the models are unsure.",
      stats: [], points: [],
      peek: { img: "assets/scramjet/x51a_waverider.jpg", tag: "X-51A Waverider · scramjet-powered" },
      media: [
        { img: "assets/scramjet/x51a_waverider.jpg", cap: "X-51A Waverider, a scramjet-powered vehicle (artist's concept, U.S. Air Force, public domain)" },
        { video: "assets/scramjet/inlet_velocity.mp4", poster: "assets/scramjet/inlet_poster.jpg", cap: "OpenFOAM simulation of the inlet and isolator: velocity magnitude" },
        { img: "assets/scramjet/started_flow.jpg", light: true, cap: "Started inlet: numerical schlieren, pressure field and wall pressure" },
        { img: "assets/scramjet/wm_forecast.jpg", light: true, cap: "CFD against the GRU world-model forecast around the unstart, with error maps" },
        { img: "assets/scramjet/lead_error.jpg", light: true, cap: "Forecast error against lead time for the surrogate models" },
        { scene: "scramjet", cap: "Illustration: ramp shock, shock train, wall sensors and control jets" }
      ],
      pubs: [],
      links: []
    },
    {
      id: "fno", kind: "research",
      title: "GP-FNO: a geometry- and physics-encoded neural operator",
      tags: "GP-FNO · RANS · airfoils", years: "2026 &mdash;",
      eyebrow: "Jan 2026 to present &nbsp;/&nbsp; Co-first author with A. Sinha",
      role: "IIT Gandhinagar &nbsp;·&nbsp; Advisor: Prof. Shubhangi Bansude",
      lede: "Simulating air flowing over a wing is accurate but slow, which makes trying out many shapes tedious. We train a neural operator, a network that learns whole flow fields rather than single numbers, to predict turbulent (RANS) flow around airfoils from only a sparse scatter of data points. The airfoil&rsquo;s geometry is encoded into the input, and physics such as mass conservation and the no-slip wall is built into the network and its loss, so the model captures surface pressure, skin friction and the recirculation bubble behind a stalling wing, including on shapes it has never seen.",
      stats: [], points: [],
      peek: { img: "assets/fno/recirculation_thumb.jpg", tag: "GP-FNO · recirculation bubble" },
      media: [
        { img: "assets/fno/recirculation_streamlines.jpg", light: true, cap: "Recirculation bubbles behind stalling airfoils: Fluent against GP-FNO, with streamlines" },
        { img: "assets/fno/heldout_surfaces.jpg", light: true, cap: "Surface pressure and skin friction on held-out cases" },
        { img: "assets/fno/new_airfoils.jpg", light: true, cap: "An unseen airfoil, checked against OpenFOAM" },
        { scene: "fno", cap: "Illustration: flow past a cambered airfoil, Fourier modes and sparse sample points" }
      ],
      pubs: [],
      links: []
    },
    {
      id: "pinn", kind: "research",
      title: "Physics-informed networks for deep stall",
      tags: "PINN · RANS · sparse data", years: "2025 &mdash; 2026",
      eyebrow: "Aug 2025 to Jan 2026",
      role: "IIT Gandhinagar &nbsp;·&nbsp; With A. Sinha &nbsp;·&nbsp; Advisor: Prof. Shubhangi Bansude",
      lede: "When a wing tilts too steeply it stalls: the air peels away from its surface and leaves a large, unsteady wake that is hard to measure everywhere. A physics-informed neural network (PINN) can fill in the whole flow from a handful of measurements, because besides matching the data it must also obey the governing equations, here the Reynolds-averaged Navier&ndash;Stokes (RANS) equations with the Spalart&ndash;Allmaras turbulence model. We built a geometry-aware PINN that reconstructs the separated flow around a NACA 0012 airfoil in deep stall from sparse data.",
      stats: [], points: [],
      peek: { img: "assets/pinn_deep_stall.jpg", tag: "Deep stall · NACA 0012" },
      media: [
        { img: "assets/pinn_deep_stall.jpg", cap: "Illustration of deep stall: the separated, turbulent wake behind a NACA 0012 airfoil" },
        { img: "assets/pinn_fields.jpg", light: true, cap: "PINN prediction against the RANS reference: velocity and pressure fields" },
        { scene: "pinn", cap: "Illustration: deep-stall wake behind an airfoil, with sparse observations" }
      ],
      pubs: [],
      links: [["Poster", "https://drive.google.com/drive/folders/1l2I8d9l82uNp2jDTn-PUjFvqcvj9woEW?usp=sharing"]]
    }
  ];

  const GALLERY = [
    { img: "assets/moksha/team_ebaja2026.jpg", cap: "The team at eBAJA SAEINDIA 2026" },
    { img: "assets/moksha/frame_assembly.jpg", cap: "Spaceframe and suspension during assembly" },
    { img: "assets/moksha/car_ebaja2026.jpg", cap: "The 2026 vehicle at eBAJA SAEINDIA" },
    { img: "assets/moksha/welding.jpg", cap: "Welding the spaceframe" }
  ];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------------- fluid background ---------------- */
  const fluidCanvas = $("#fluid");
  let fluid = null;
  try {
    fluid = new window.Fluid(fluidCanvas, { dyeRes: fine ? 1024 : 512, simRes: fine ? 128 : 96 });
    if (!fluid.ok) fluid = null;
  } catch (e) { fluid = null; }

  const FIRE = [1.0, 0.42, 0.12], ICE = [0.16, 0.52, 1.0], EMB = [1.0, 0.72, 0.35], VIO = [0.62, 0.3, 1.0];
  let hueT = 0;
  function colorAt(t) {
    const k = (Math.sin(t) + 1) / 2;
    const a = k < 0.5 ? FIRE : ICE, b = k < 0.5 ? EMB : VIO;
    const m = Math.abs(Math.sin(t * 1.7));
    return [a[0] * (1 - m * 0.3) + b[0] * m * 0.3, a[1] * (1 - m * 0.3) + b[1] * m * 0.3, a[2] * (1 - m * 0.3) + b[2] * m * 0.3];
  }
  function scaled(c, s) { return [c[0] * s, c[1] * s, c[2] * s]; }

  if (fluid) {
    const narrow = window.innerWidth < 700;
    const k = narrow ? 0.4 : 1;
    const rate = (reduce ? 0.35 : 1.3) * (narrow ? 0.6 : 1);
    const rad = narrow ? 0.12 : 0.3;
    fluid.onFrame = (dt) => {
      hueT += dt * 0.35;
      if (Math.random() < dt * rate) {
        const x = 0.12 + Math.random() * 0.76;
        fluid.push(x, 0.0, (Math.random() - 0.5) * 500, 700 + Math.random() * 900, scaled(Math.random() < 0.5 ? FIRE : ICE, (0.35 + Math.random() * 0.25) * k), rad);
      }
      if (Math.random() < dt * rate * 0.25) {
        const left = Math.random() < 0.5, y = 0.2 + Math.random() * 0.6;
        fluid.push(left ? 0.0 : 1.0, y, (left ? 1 : -1) * (600 + Math.random() * 700), (Math.random() - 0.3) * 400, scaled(colorAt(hueT + y * 3), 0.3 * k), rad * 0.85);
      }
    };
    const n0 = narrow ? 4 : 9;
    for (let i = 0; i < n0; i++) {
      const x = 0.1 + Math.random() * 0.8, y = 0.15 + Math.random() * 0.6;
      fluid.push(x, y, (Math.random() - 0.5) * 2200, (Math.random() - 0.3) * 2200, scaled(i % 2 ? FIRE : ICE, 0.7 * k), narrow ? 0.14 : 0.35);
    }
    document.addEventListener("visibilitychange", () => { fluid.paused = document.hidden; });
  }

  document.documentElement.dataset.fluid = fluid ? "on" : "off";

  /* ---------------- cursor ---------------- */
  const cur = $(".cursor"), dot = $(".cursor-dot"), ring = $(".cursor-ring"), label = $(".cursor-label");
  const M = { x: -100, y: -100, rx: -100, ry: -100 };
  window.addEventListener("pointermove", (e) => { M.x = e.clientX; M.y = e.clientY; }, { passive: true });
  function setCursor(mode, text) {
    cur.classList.remove("hover", "view", "drag");
    if (mode) cur.classList.add(mode);
    label.textContent = text || "";
  }
  document.addEventListener("pointerover", (e) => {
    const t = e.target;
    if (t.closest(".row button")) setCursor("view", "Open");
    else if (t.closest(".gallery button")) setCursor("view", "View");
    else if (t.closest("a, button")) setCursor("hover");
    else setCursor(null);
  });

  /* ---------------- magnetic buttons ---------------- */
  if (fine && !reduce) {
    $$(".magnet").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
      el.style.transition = "transform 0.5s cubic-bezier(0.22,1,0.36,1)";
    });
  }

  /* ---------------- research rows ---------------- */
  const rows = $("#rows");
  PROJECTS.filter((p) => p.kind === "research").forEach((p, i) => {
    const li = document.createElement("li");
    li.className = "row reveal";
    li.dataset.id = p.id;
    li.innerHTML = `<button type="button" aria-label="Open project: ${p.title}"><span class="idx">0${i + 1}</span><span class="rt">${p.title}</span><span class="tags">${p.tags}</span><span class="yr">${p.years}</span></button>`;
    rows.appendChild(li);
  });

  /* ---------------- peek preview ---------------- */
  const peek = $(".peek"), peekCanvas = $(".peek-canvas"), peekVideo = $(".peek-video"), peekImg = $(".peek-img"), peekTag = $(".peek-tag");
  let peekRunner = null, peekOn = false;
  const P = { x: 0, y: 0, tx: 0, ty: 0, s: 0.6, ts: 0.6, r: 0, tr: 0 };
  function showPeek(p) {
    if (!fine) return;
    if (peekRunner) { peekRunner.stop(); peekRunner = null; }
    peek.classList.remove("video", "image");
    peekVideo.pause();
    const ctx = peekCanvas.getContext("2d");
    ctx && ctx.clearRect(0, 0, peekCanvas.width, peekCanvas.height);
    if (p.peek.img) {
      if (peekImg.getAttribute("src") !== p.peek.img) peekImg.src = p.peek.img;
      peek.classList.add("image");
    } else if (p.peek.video) {
      if (peekVideo.getAttribute("src") !== p.peek.video) peekVideo.src = p.peek.video;
      peekVideo.play().catch(() => {});
      peek.classList.add("video");
    } else if (p.peek.scene) {
      peekRunner = window.Viz.create(p.peek.scene, peekCanvas);
      peekRunner.start();
    }
    peekTag.textContent = p.peek.tag || (p.peek.video ? "PeleC DNS · OH and vortex tubes" : "Live illustration");
    peek.classList.add("on");
    peekOn = true;
    P.ts = 1;
  }
  function hidePeek() {
    peek.classList.remove("on");
    peekOn = false;
    P.ts = 0.6;
    setTimeout(() => { if (!peekOn) { if (peekRunner) { peekRunner.stop(); peekRunner = null; } peekVideo.pause(); } }, 400);
  }
  $$(".row").forEach((li) => {
    const p = PROJECTS.find((q) => q.id === li.dataset.id);
    li.addEventListener("pointerenter", () => {
      $$(".row").forEach((r) => r.classList.remove("active"));
      li.classList.add("active");
      rows.classList.add("hovering");
      showPeek(p);
    });
    li.addEventListener("pointerleave", () => { li.classList.remove("active"); rows.classList.remove("hovering"); hidePeek(); });
    li.querySelector("button").addEventListener("click", (e) => openCase(p.id, e.clientX, e.clientY));
  });

  function tick() {
    requestAnimationFrame(tick);
    M.rx += (M.x - M.rx) * 0.18; M.ry += (M.y - M.ry) * 0.18;
    dot.style.transform = `translate3d(${M.x}px, ${M.y}px, 0)`;
    ring.style.transform = `translate3d(${M.rx}px, ${M.ry}px, 0)`;
    if (fine) {
      const w = peek.offsetWidth, h = peek.offsetHeight;
      const pad = Math.max(20, Math.min(72, window.innerWidth * 0.05));
      P.tx = window.innerWidth - pad - w - 10 + (M.x - window.innerWidth / 2) * 0.06;
      P.ty = M.y - h / 2;
      const vx = P.tx - P.x;
      P.x += vx * 0.12; P.y += (P.ty - P.y) * 0.12; P.s += (P.ts - P.s) * 0.12;
      P.tr += ((Math.max(-8, Math.min(8, vx * 0.04))) - P.tr) * 0.1;
      peek.style.transform = `translate3d(${P.x}px, ${P.y}px, 0) scale(${P.s}) rotate(${P.tr}deg)`;
    }
  }
  requestAnimationFrame(tick);

  /* ---------------- moksha gallery + lightbox ---------------- */
  const gal = $("#gallery"), lb = $(".lb"), lbImg = $(".lb-img"), lbCap = $(".lb-cap");
  let lbIdx = 0;
  GALLERY.forEach((g, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `g${i + 1} reveal`;
    b.setAttribute("aria-label", `View photo: ${g.cap}`);
    b.innerHTML = `<img src="${g.img}" alt="${g.cap}" loading="lazy"><span>${g.cap}</span>`;
    b.addEventListener("click", () => openLb(i));
    gal.appendChild(b);
  });
  function showLb(i) {
    lbIdx = (i + GALLERY.length) % GALLERY.length;
    lbImg.style.opacity = 0;
    setTimeout(() => { lbImg.src = GALLERY[lbIdx].img; lbImg.alt = GALLERY[lbIdx].cap; lbCap.textContent = `${lbIdx + 1} / ${GALLERY.length}  ·  ${GALLERY[lbIdx].cap}`; lbImg.style.opacity = 1; }, lb.classList.contains("open") ? 180 : 0);
  }
  function openLb(i) {
    showLb(i);
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    setTimeout(() => $(".lb-close").focus({ preventScroll: true }), 200);
  }
  function closeLb() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
  }
  $(".lb-close").addEventListener("click", closeLb);
  $(".lb-prev").addEventListener("click", () => showLb(lbIdx - 1));
  $(".lb-next").addEventListener("click", () => showLb(lbIdx + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") showLb(lbIdx + 1);
    if (e.key === "ArrowLeft") showLb(lbIdx - 1);
  });

  /* ---------------- case overlay ---------------- */
  const caseEl = $(".case"), stage = $(".stage"), stCanvas = $(".stage-canvas"), stVideo = $(".stage-video"), stImg = $(".stage-img"), stCap = $(".stage-cap");
  let current = -1, stageRunner = null;
  function setStage(m) {
    if (stageRunner) { stageRunner.stop(); stageRunner = null; }
    stVideo.pause();
    [stCanvas, stVideo, stImg].forEach((el) => el.classList.remove("show"));
    if (m.video) {
      if (stVideo.getAttribute("src") !== m.video) { stVideo.src = m.video; stVideo.poster = m.poster || ""; }
      stVideo.play().catch(() => {});
      stVideo.classList.add("show");
    } else if (m.scene) {
      stageRunner = window.Viz.create(m.scene, stCanvas);
      stageRunner.start();
      stCanvas.classList.add("show");
    } else {
      stImg.src = m.img; stImg.alt = m.cap;
      stImg.classList.add("show");
    }
    stage.classList.toggle("light", !!m.light);
    stCap.textContent = m.cap;
  }
  function fill(p, startIdx) {
    $(".case-count").textContent = `${String(PROJECTS.indexOf(p) + 1).padStart(2, "0")} / ${String(PROJECTS.length).padStart(2, "0")}  ·  Research`;
    $(".case-eyebrow").innerHTML = p.eyebrow;
    $(".case-title").innerHTML = p.title;
    $(".case-role").innerHTML = p.role;
    $(".case-lede").innerHTML = p.lede;
    $(".case-stats").innerHTML = p.stats.map((s) => `<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join("");
    $(".case-points").innerHTML = p.points.map((x) => `<li>${x}</li>`).join("");
    $(".case-pubs").innerHTML = p.pubs.map((x) => `<p>${x}</p>`).join("");
    $(".case-links").innerHTML = p.links.map((l) => `<a class="pill" href="${l[1]}" target="_blank" rel="noopener">${l[0]} <i>&nearr;</i></a>`).join("");
    const th = $(".thumbs");
    th.innerHTML = "";
    if (p.media.length > 1) {
      p.media.forEach((m, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", m.cap);
        b.innerHTML = m.img ? `<img src="${m.img}" alt="">` : m.poster ? `<img src="${m.poster}" alt="">` : `<span class="live">LIVE</span>`;
        if (!m.img && !m.poster) b.classList.add("live");
        b.addEventListener("click", () => { $$(".thumbs button").forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); setStage(m); });
        th.appendChild(b);
      });
    }
    const k = Math.min(startIdx || 0, p.media.length - 1);
    if (th.children[k]) th.children[k].classList.add("sel");
    setStage(p.media[k]);
    $(".case-body").scrollTop = 0;
  }
  function openCase(id, x, y, startIdx) {
    current = PROJECTS.findIndex((p) => p.id === id);
    caseEl.style.setProperty("--cx", (x || window.innerWidth / 2) + "px");
    caseEl.style.setProperty("--cy", (y || window.innerHeight / 2) + "px");
    fill(PROJECTS[current], startIdx);
    caseEl.classList.add("open");
    caseEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("locked");
    hidePeek();
    if (fluid) fluid.paused = true;
    setTimeout(() => $(".case-close").focus({ preventScroll: true }), 300);
  }
  function closeCase() {
    caseEl.classList.remove("open");
    caseEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("locked");
    if (stageRunner) { stageRunner.stop(); stageRunner = null; }
    stVideo.pause();
    if (fluid) fluid.paused = false;
  }
  function step(d) {
    if (current < 0) return;
    current = (current + d + PROJECTS.length) % PROJECTS.length;
    const info = $(".case-info");
    info.style.opacity = 0;
    setTimeout(() => { fill(PROJECTS[current]); info.style.opacity = 1; }, 220);
  }
  $(".case-info").style.transition = "opacity 0.3s";
  $(".case-close").addEventListener("click", closeCase);
  $(".case-prev").addEventListener("click", () => step(-1));
  $(".case-next").addEventListener("click", () => step(1));
  document.addEventListener("keydown", (e) => {
    if (!caseEl.classList.contains("open")) return;
    if (e.key === "Escape") closeCase();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  /* ---------------- reveal ---------------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 5) * 70}ms`; io.observe(el); });
  requestAnimationFrame(() => document.documentElement.classList.add("loaded"));
  setTimeout(() => $$(".hero .reveal").forEach((el) => el.classList.add("in")), 500);
  function fromHash() {
    const m = location.hash.match(/^#p\/([a-z]+)/);
    if (m && PROJECTS.some((p) => p.id === m[1])) openCase(m[1]);
  }
  window.addEventListener("hashchange", fromHash);
  fromHash();
  window.__portfolio = { openCase, closeCase, PROJECTS };
})();
