(function () {
  "use strict";

  const PROJECTS = [
    {
      id: "dns", kind: "research",
      title: "Learned closures for turbulent hydrogen flames",
      tags: "DNS · LES · PeleC · ML", years: "2026 &mdash;",
      eyebrow: "Jul 2026 to present &nbsp;/&nbsp; ME 499 research",
      role: "Computational Combustion and Machine Learning Lab, IIT Gandhinagar &nbsp;·&nbsp; Advisor: Prof. Shubhangi Bansude",
      lede: "A 3-D direct numerical simulation of an igniting hydrogen&ndash;air mixing layer, used as ground truth to learn what a coarse large-eddy-simulation grid cannot resolve: the filtered reaction rate.",
      stats: [["20.2 M", "grid cells, 9 chemical species"], ["25,000", "core-hours on PARAM Ananta"], ["7.5 %", "ignition time vs Ohta et al. (2021)"], ["1 %", "offline heat-release error of the best closure, vs 23 % with none"]],
      points: [
        "Ran the DNS in PeleC, with mass and energy conserved to round-off.",
        "Filtered it to three LES grids and trained reaction-rate closures on the filtered data.",
        "Coupled the closures to PeleC through a C++ hook verified to 10<sup>&minus;4</sup>; inside the solver the flow erases 60&ndash;80 % of the offline error within 2 &micro;s.",
        "This led to solver-in-the-loop training (oracle nudging, DAgger, ensemble Kalman inversion); DAgger cut the misfit by 16 %.",
        "A learned filtered density function, used in a hybrid flamelet table, cuts heat-release error at unseen times by 30 %.",
        "Found and patched two PeleLMeX defects, each confirmed by A/B tests."
      ],
      peek: { video: "assets/dns_orbit.mp4" },
      media: [
        { video: "assets/dns_orbit.mp4", poster: "assets/dns_hero.jpg", cap: "Orbit at peak heat release: OH glow with vortex tubes" },
        { img: "assets/dns_hero.jpg", cap: "OH radical (blue) and vortex tubes (orange), t = 0.364 ms" },
        { img: "assets/dns_vortex.jpg", cap: "Vortex tubes coloured by temperature: cold fuel side blue, hot side orange" },
        { img: "assets/dns_temperature.jpg", cap: "Temperature volume, t = 0.505 ms" },
        { img: "assets/dns_flame_sheet.jpg", cap: "Heat-release surface coloured by OH, with vorticity haze" },
        { img: "assets/dns_oh.jpg", cap: "OH volume, t = 0.436 ms" },
        { img: "assets/dns_T_evolution.jpg", cap: "Mid-plane temperature from ignition to 0.6 ms" },
        { img: "assets/dns_flame_structure.jpg", cap: "Flame structure in mixture-fraction space, coloured by OH" }
      ],
      pubs: [], links: []
    },
    {
      id: "scramjet", kind: "research",
      title: "Reinforcement-learning control of scramjet unstart",
      tags: "RANS · RL · surrogates", years: "2026 &mdash;",
      eyebrow: "Apr 2026 to present &nbsp;/&nbsp; Visiting research student",
      role: "FLAME Lab, Indian Institute of Science, Bengaluru &nbsp;·&nbsp; Advisor: Prof. Konduri Aditya",
      lede: "Teaching a controller to fire wall jets before a scramjet inlet unstarts, the moment its shock system is pushed out and the engine loses its airflow. Because every millisecond of CFD is expensive, the agent learns mostly inside learned world models of the flow.",
      stats: [["7.8&ndash;8.1&times;", "freestream pressure at the outlet: the unstart boundary"], ["10", "wall sensors chosen by co-kurtosis, warning about 0.5 ms ahead"], ["2.8 %", "GRU world-model sensor error 1 ms ahead, half that of DMDc"], ["47", "core-hours per 0.1 ms of CFD"]],
      points: [
        "Modelled the inlet&ndash;isolator in 2-D RANS (OpenFOAM, k&ndash;&omega; SST); the ramp-shock angle is within 0.2 % of oblique-shock theory.",
        "Showed that jets fired early prevent unstart, and posed jet control as an event-triggered Soft Actor-Critic problem.",
        "Picked ten wall sensors by co-kurtosis, a measure of extreme events; they warn of unstart about half a millisecond ahead.",
        "Benchmarked six surrogates (DMDc, DeepONet, Koopman autoencoder, Dreamer, GRU world model); the GRU world model forecasts the sensors 1 ms ahead within 2.8 %.",
        "Working towards: training the agent against an ensemble of these world models, calling CFD only when the members disagree."
      ],
      peek: { video: "assets/scramjet/inlet_velocity.mp4", tag: "OpenFOAM · inlet velocity" },
      media: [
        { video: "assets/scramjet/inlet_velocity.mp4", poster: "assets/scramjet/inlet_poster.jpg", cap: "OpenFOAM simulation of the inlet and isolator: velocity magnitude, 0 to 740 m/s" },
        { img: "assets/scramjet/started_flow.jpg", light: true, cap: "Started inlet: numerical schlieren, pressure field and wall pressure" },
        { img: "assets/scramjet/sensors.jpg", light: true, cap: "The ten wall sensors picked by co-kurtosis, numbered in pick order" },
        { img: "assets/scramjet/wm_forecast.jpg", light: true, cap: "CFD vs GRU world-model forecast around the unstart onset, with error maps against DMDc" },
        { img: "assets/scramjet/lead_error.jpg", light: true, cap: "Forecast error against lead time for six surrogate models, sensors and whole field" },
        { scene: "scramjet", cap: "Illustration: ramp shock, shock train, wall sensors and control jets" }
      ],
      pubs: [
        "<b>SAROD 2026</b>, Bengaluru &mdash; first author, oral presentation",
        "<b>NAPC 2027</b>, IIT Hyderabad &mdash; first author, accepted"
      ],
      links: []
    },
    {
      id: "fno", kind: "research",
      title: "GP-FNO: a geometry- and physics-encoded neural operator",
      tags: "GP-FNO · RANS · airfoils", years: "2026 &mdash;",
      eyebrow: "Jan 2026 to present &nbsp;/&nbsp; Co-first author with A. Sinha",
      role: "IIT Gandhinagar &nbsp;·&nbsp; Advisor: Prof. Shubhangi Bansude",
      lede: "A Fourier neural operator that learns turbulent flow over airfoils from sparse data, with the geometry and the physics built into the network.",
      stats: [["5 %", "of nodes seen per training solution"], ["2.7 %", "surface-pressure error, held-out cases"], ["1.1 %", "lift error"], ["6.2 %", "skin-friction error, never supervised"]],
      points: [
        "Trained on a body-fitted grid from 88 RANS solutions; the training data follow NASA&rsquo;s CFL3D and Ladson&rsquo;s NACA 0012 experiments.",
        "Studied its inductive and learning biases, with physics placed in the network or in the loss; enforcing mass conservation cut overfitting tenfold.",
        "Building no-slip into the network is what lets it locate flow separation.",
        "Of eight architectures, including U-Net and Transolver, it is the cheapest (6.5 GFLOP) and ties the best on surface pressure.",
        "On eight unseen airfoils, checked against OpenFOAM, its median errors are 5.3 % in surface pressure and 3.2 % in lift."
      ],
      peek: { scene: "fno" },
      media: [
        { img: "assets/fno/architecture.jpg", light: true, cap: "GP-FNO: geometry encoding, dual-path Fourier layers and the physics-enhanced loss" },
        { img: "assets/fno/heldout_fields.jpg", light: true, cap: "Held-out case: reference (Fluent) vs GP-FNO, with absolute error" },
        { img: "assets/fno/heldout_surfaces.jpg", light: true, cap: "Surface pressure and skin friction on held-out cases" },
        { img: "assets/fno/new_airfoils.jpg", light: true, cap: "An unseen airfoil, checked against OpenFOAM" },
        { scene: "fno", cap: "Illustration: flow past a cambered airfoil, Fourier modes and sparse sample points" }
      ],
      pubs: [
        "<b>AeSI CFD Symposium 2026</b>, IIT Madras &mdash; oral presentation",
        "<b>TFEC 2027</b>, Dallas &mdash; accepted",
        "<b>Journal manuscript</b> &mdash; to be submitted to Physics of Fluids"
      ],
      links: []
    },
    {
      id: "pinn", kind: "research",
      title: "Physics-informed networks for deep stall",
      tags: "PINN · RANS · sparse data", years: "2025 &mdash; 2026",
      eyebrow: "Aug 2025 to Jan 2026",
      role: "IIT Gandhinagar &nbsp;·&nbsp; With A. Sinha &nbsp;·&nbsp; Advisor: Prof. Shubhangi Bansude",
      lede: "Rebuilding a separated deep-stall flow from 5 % of the field, with the RANS equations and the Spalart&ndash;Allmaras model as the constraint.",
      stats: [["Top 5", "best poster, International AI-CFD Symposium 2026"], ["25&deg;", "NACA 0012 angle of attack"], ["5.8 %", "relative L<sub>2</sub> error in u (5.4 % v, 7.0 % p)"], ["2 %", "lift error"]],
      points: [
        "Built a geometry-aware PINN constrained by RANS with Spalart&ndash;Allmaras.",
        "From 5 % of the field it rebuilds the whole RANS flow, including the separated wake."
      ],
      peek: { scene: "pinn" },
      media: [{ scene: "pinn", cap: "Illustration: deep-stall wake behind an airfoil at 25°, with sparse observations" }],
      pubs: ["<b>International AI-CFD Symposium 2026</b> &mdash; poster, top 5 among master&rsquo;s and PhD presenters"],
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
    const ptr = { x: 0, y: 0, px: 0, py: 0, moved: false, init: false };
    const onMove = (cx, cy) => {
      const r = fluidCanvas.getBoundingClientRect();
      const x = cx / r.width, y = 1 - cy / r.height;
      if (!ptr.init) { ptr.px = x; ptr.py = y; ptr.init = true; }
      ptr.x = x; ptr.y = y; ptr.moved = true;
    };
    window.addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener("touchmove", (e) => { const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY); }, { passive: true });
    window.addEventListener("pointerdown", (e) => {
      const r = fluidCanvas.getBoundingClientRect();
      const x = e.clientX / r.width, y = 1 - e.clientY / r.height;
      for (let i = 0; i < 6; i++) {
        const a = i / 6 * Math.PI * 2;
        fluid.push(x, y, Math.cos(a) * 900, Math.sin(a) * 900, scaled(colorAt(hueT + i), 0.6), 0.12);
      }
    });
    let idle = 0, lastScroll = window.scrollY;
    fluid.onFrame = (dt, now) => {
      hueT += dt * 0.35;
      if (ptr.moved) {
        const dx = (ptr.x - ptr.px) * fluid.opt.force, dy = (ptr.y - ptr.py) * fluid.opt.force;
        if (Math.abs(dx) + Math.abs(dy) > 0.5) fluid.push(ptr.x, ptr.y, dx, dy, scaled(colorAt(hueT * 2.2 + ptr.x * 4.5 + ptr.y * 2.0), 0.24));
        ptr.px = ptr.x; ptr.py = ptr.y; ptr.moved = false; idle = 0;
      } else idle += dt;
      const sc = window.scrollY - lastScroll; lastScroll = window.scrollY;
      if (Math.abs(sc) > 2 && Math.random() < 0.35) {
        const x = Math.random();
        fluid.push(x, sc > 0 ? 0.02 : 0.98, (Math.random() - 0.5) * 300, (sc > 0 ? 1 : -1) * Math.min(1400, Math.abs(sc) * 40), scaled(colorAt(hueT + x * 3), 0.22), 0.18);
      }
      if (!reduce && Math.random() < dt * (idle > 2 ? 1.6 : 0.6)) {
        const x = 0.15 + Math.random() * 0.7;
        fluid.push(x, 0.0, (Math.random() - 0.5) * 500, 700 + Math.random() * 900, scaled(Math.random() < 0.5 ? FIRE : ICE, 0.35 + Math.random() * 0.25), 0.3);
      }
    };
    for (let i = 0; i < 9; i++) {
      const x = 0.1 + Math.random() * 0.8, y = 0.15 + Math.random() * 0.6;
      fluid.push(x, y, (Math.random() - 0.5) * 2200, (Math.random() - 0.3) * 2200, scaled(i % 2 ? FIRE : ICE, 0.7), 0.35);
    }
    document.addEventListener("visibilitychange", () => { fluid.paused = document.hidden; });
  }

  document.documentElement.dataset.fluid = fluid ? "on" : "off";
  if (!fine) {
    const sub = $("#research .sec-sub");
    if (sub) sub.textContent = "Tap a project to open it.";
    const hint = $(".hint");
    if (hint) hint.lastChild.textContent = "The background is a live fluid simulation. Touch to stir it.";
  }
  if (!fluid) { const hint = $(".hint"); if (hint) hint.style.display = "none"; }

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
  const peek = $(".peek"), peekCanvas = $(".peek-canvas"), peekVideo = $(".peek-video"), peekTag = $(".peek-tag");
  let peekRunner = null, peekOn = false;
  const P = { x: 0, y: 0, tx: 0, ty: 0, s: 0.6, ts: 0.6, r: 0, tr: 0 };
  function showPeek(p) {
    if (!fine) return;
    if (peekRunner) { peekRunner.stop(); peekRunner = null; }
    peek.classList.remove("video");
    peekVideo.pause();
    const ctx = peekCanvas.getContext("2d");
    ctx && ctx.clearRect(0, 0, peekCanvas.width, peekCanvas.height);
    if (p.peek.video) {
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
