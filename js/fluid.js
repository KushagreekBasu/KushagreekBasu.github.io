(function () {
  "use strict";

  const VS = `#version 300 es
  precision highp float;
  in vec2 aPos;
  uniform vec2 texel;
  out vec2 vUv, vL, vR, vT, vB;
  void main () {
    vUv = aPos * 0.5 + 0.5;
    vL = vUv - vec2(texel.x, 0.0);
    vR = vUv + vec2(texel.x, 0.0);
    vT = vUv + vec2(0.0, texel.y);
    vB = vUv - vec2(0.0, texel.y);
    gl_Position = vec4(aPos, 0.0, 1.0);
  }`;

  const HEAD = `#version 300 es
  precision highp float;
  precision highp sampler2D;
  in vec2 vUv, vL, vR, vT, vB;
  out vec4 o;
  `;

  const FS = {
    splat: HEAD + `
      uniform sampler2D uTarget;
      uniform float aspect, radius;
      uniform vec3 color;
      uniform vec2 point;
      void main () {
        vec2 p = vUv - point;
        p.x *= aspect;
        vec3 s = exp(-dot(p, p) / radius) * color;
        o = vec4(texture(uTarget, vUv).xyz + s, 1.0);
      }`,
    advect: HEAD + `
      uniform sampler2D uVelocity, uSource;
      uniform vec2 velTexel;
      uniform float dt, dissipation;
      void main () {
        vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * velTexel;
        o = texture(uSource, coord) / (1.0 + dissipation * dt);
      }`,
    divergence: HEAD + `
      uniform sampler2D uVelocity;
      void main () {
        float L = texture(uVelocity, vL).x;
        float R = texture(uVelocity, vR).x;
        float T = texture(uVelocity, vT).y;
        float B = texture(uVelocity, vB).y;
        vec2 C = texture(uVelocity, vUv).xy;
        if (vL.x < 0.0) L = -C.x;
        if (vR.x > 1.0) R = -C.x;
        if (vT.y > 1.0) T = -C.y;
        if (vB.y < 0.0) B = -C.y;
        o = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
      }`,
    curl: HEAD + `
      uniform sampler2D uVelocity;
      void main () {
        float L = texture(uVelocity, vL).y;
        float R = texture(uVelocity, vR).y;
        float T = texture(uVelocity, vT).x;
        float B = texture(uVelocity, vB).x;
        o = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
      }`,
    vorticity: HEAD + `
      uniform sampler2D uVelocity, uCurl;
      uniform float curl, dt;
      void main () {
        float L = texture(uCurl, vL).x;
        float R = texture(uCurl, vR).x;
        float T = texture(uCurl, vT).x;
        float B = texture(uCurl, vB).x;
        float C = texture(uCurl, vUv).x;
        vec2 f = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        f /= length(f) + 0.0001;
        f *= curl * C;
        f.y *= -1.0;
        vec2 v = texture(uVelocity, vUv).xy + f * dt;
        o = vec4(clamp(v, -1000.0, 1000.0), 0.0, 1.0);
      }`,
    pressure: HEAD + `
      uniform sampler2D uPressure, uDivergence;
      void main () {
        float L = texture(uPressure, vL).x;
        float R = texture(uPressure, vR).x;
        float T = texture(uPressure, vT).x;
        float B = texture(uPressure, vB).x;
        float d = texture(uDivergence, vUv).x;
        o = vec4((L + R + B + T - d) * 0.25, 0.0, 0.0, 1.0);
      }`,
    gradient: HEAD + `
      uniform sampler2D uPressure, uVelocity;
      void main () {
        float L = texture(uPressure, vL).x;
        float R = texture(uPressure, vR).x;
        float T = texture(uPressure, vT).x;
        float B = texture(uPressure, vB).x;
        vec2 v = texture(uVelocity, vUv).xy - vec2(R - L, T - B);
        o = vec4(v, 0.0, 1.0);
      }`,
    scale: HEAD + `
      uniform sampler2D uTex;
      uniform float value;
      void main () { o = value * texture(uTex, vUv); }`,
    display: HEAD + `
      uniform sampler2D uDye;
      uniform vec2 dyeTexel;
      uniform vec3 bg;
      uniform float gain;
      void main () {
        vec3 c = texture(uDye, vUv).rgb;
        float l = max(c.r, max(c.g, c.b));
        float dx = length(texture(uDye, vUv + vec2(dyeTexel.x, 0.0)).rgb) - length(texture(uDye, vUv - vec2(dyeTexel.x, 0.0)).rgb);
        float dy = length(texture(uDye, vUv + vec2(0.0, dyeTexel.y)).rgb) - length(texture(uDye, vUv - vec2(0.0, dyeTexel.y)).rgb);
        vec3 n = normalize(vec3(dx, dy, 0.35));
        float shade = clamp(dot(n, normalize(vec3(-0.4, 0.6, 1.0))) + 0.25, 0.55, 1.15);
        vec3 col = (1.0 - exp(-c * gain)) * shade;
        col += vec3(1.0, 0.85, 0.7) * smoothstep(0.9, 2.4, l) * 0.25;
        vec2 q = vUv - 0.5;
        float vig = 1.0 - dot(q, q) * 0.9;
        o = vec4(bg + col * vig, 1.0);
      }`
  };

  function Fluid(canvas, opt) {
    opt = Object.assign({
      simRes: 128, dyeRes: 1024, densityDiss: 1.15, velocityDiss: 0.25, pressure: 0.8,
      iterations: 20, curl: 28, radius: 0.22, force: 5200, gain: 1.25, bg: [0.016, 0.022, 0.043]
    }, opt || {});
    const gl = canvas.getContext("webgl2", { alpha: false, depth: false, stencil: false, antialias: false, powerPreference: "high-performance" });
    if (!gl || !gl.getExtension("EXT_color_buffer_float")) { this.ok = false; return; }
    gl.getExtension("OES_texture_float_linear");
    this.ok = true;
    this.gl = gl;
    this.canvas = canvas;
    this.opt = opt;
    this.paused = false;
    this.pointers = [];
    this.queue = [];

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VS);
    this.prog = {};
    for (const k in FS) {
      const p = gl.createProgram();
      gl.attachShader(p, vs);
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, FS[k]));
      gl.bindAttribLocation(p, 0, "aPos");
      gl.linkProgram(p);
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const name = gl.getActiveUniform(p, i).name;
        u[name] = gl.getUniformLocation(p, name);
      }
      this.prog[k] = { p, u };
    }
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    this.resize(true);
    this.last = performance.now();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  Fluid.prototype.res = function (r) {
    const gl = this.gl;
    let a = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (a < 1) a = 1 / a;
    const mn = Math.round(r), mx = Math.round(r * a);
    return gl.drawingBufferWidth > gl.drawingBufferHeight ? [mx, mn] : [mn, mx];
  };

  Fluid.prototype.fbo = function (w, h, ifmt, fmt, type, filter) {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, w, h, 0, fmt, type, null);
    const f = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, f);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    gl.viewport(0, 0, w, h);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return { t, f, w, h, tx: [1 / w, 1 / h], attach(id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, t); return id; } };
  };

  Fluid.prototype.double = function (w, h, ifmt, fmt, type, filter) {
    const a = this.fbo(w, h, ifmt, fmt, type, filter), b = this.fbo(w, h, ifmt, fmt, type, filter);
    return { read: a, write: b, w, h, tx: a.tx, swap() { const t = this.read; this.read = this.write; this.write = t; } };
  };

  Fluid.prototype.resize = function (force) {
    const gl = this.gl;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.floor(this.canvas.clientWidth * dpr), h = Math.floor(this.canvas.clientHeight * dpr);
    if (!force && w === this.canvas.width && h === this.canvas.height) return;
    this.canvas.width = w;
    this.canvas.height = h;
    const H = gl.HALF_FLOAT, L = gl.LINEAR;
    const [sw, sh] = this.res(this.opt.simRes);
    const [dw, dh] = this.res(this.opt.dyeRes);
    this.dye = this.double(dw, dh, gl.RGBA16F, gl.RGBA, H, L);
    this.vel = this.double(sw, sh, gl.RG16F, gl.RG, H, L);
    this.div = this.fbo(sw, sh, gl.R16F, gl.RED, H, gl.NEAREST);
    this.curlF = this.fbo(sw, sh, gl.R16F, gl.RED, H, gl.NEAREST);
    this.pres = this.double(sw, sh, gl.R16F, gl.RED, H, gl.NEAREST);
  };

  Fluid.prototype.blit = function (target) {
    const gl = this.gl;
    if (target) {
      gl.viewport(0, 0, target.w, target.h);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.f);
    } else {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  Fluid.prototype.use = function (name) {
    const P = this.prog[name];
    this.gl.useProgram(P.p);
    return P.u;
  };

  Fluid.prototype.splat = function (x, y, dx, dy, color, radius) {
    const gl = this.gl;
    let u = this.use("splat");
    gl.uniform2f(u.texel, this.vel.tx[0], this.vel.tx[1]);
    gl.uniform1i(u.uTarget, this.vel.read.attach(0));
    gl.uniform1f(u.aspect, this.canvas.width / this.canvas.height);
    gl.uniform2f(u.point, x, y);
    gl.uniform3f(u.color, dx, dy, 0);
    const r = (radius || this.opt.radius) / 100 * Math.max(1, this.canvas.width / this.canvas.height);
    gl.uniform1f(u.radius, r);
    this.blit(this.vel.write);
    this.vel.swap();
    gl.uniform1i(u.uTarget, this.dye.read.attach(0));
    gl.uniform3f(u.color, color[0], color[1], color[2]);
    this.blit(this.dye.write);
    this.dye.swap();
  };

  Fluid.prototype.step = function (dt) {
    const gl = this.gl, o = this.opt, v = this.vel;
    let u = this.use("curl");
    gl.uniform2f(u.texel, v.tx[0], v.tx[1]);
    gl.uniform1i(u.uVelocity, v.read.attach(0));
    this.blit(this.curlF);

    u = this.use("vorticity");
    gl.uniform2f(u.texel, v.tx[0], v.tx[1]);
    gl.uniform1i(u.uVelocity, v.read.attach(0));
    gl.uniform1i(u.uCurl, this.curlF.attach(1));
    gl.uniform1f(u.curl, o.curl);
    gl.uniform1f(u.dt, dt);
    this.blit(v.write);
    v.swap();

    u = this.use("divergence");
    gl.uniform2f(u.texel, v.tx[0], v.tx[1]);
    gl.uniform1i(u.uVelocity, v.read.attach(0));
    this.blit(this.div);

    u = this.use("scale");
    gl.uniform1i(u.uTex, this.pres.read.attach(0));
    gl.uniform1f(u.value, o.pressure);
    this.blit(this.pres.write);
    this.pres.swap();

    u = this.use("pressure");
    gl.uniform2f(u.texel, v.tx[0], v.tx[1]);
    gl.uniform1i(u.uDivergence, this.div.attach(0));
    for (let i = 0; i < o.iterations; i++) {
      gl.uniform1i(u.uPressure, this.pres.read.attach(1));
      this.blit(this.pres.write);
      this.pres.swap();
    }

    u = this.use("gradient");
    gl.uniform2f(u.texel, v.tx[0], v.tx[1]);
    gl.uniform1i(u.uPressure, this.pres.read.attach(0));
    gl.uniform1i(u.uVelocity, v.read.attach(1));
    this.blit(v.write);
    v.swap();

    u = this.use("advect");
    gl.uniform2f(u.texel, v.tx[0], v.tx[1]);
    gl.uniform2f(u.velTexel, v.tx[0], v.tx[1]);
    gl.uniform1i(u.uVelocity, v.read.attach(0));
    gl.uniform1i(u.uSource, v.read.attach(0));
    gl.uniform1f(u.dt, dt);
    gl.uniform1f(u.dissipation, o.velocityDiss);
    this.blit(v.write);
    v.swap();

    gl.uniform1i(u.uVelocity, v.read.attach(0));
    gl.uniform1i(u.uSource, this.dye.read.attach(1));
    gl.uniform1f(u.dissipation, o.densityDiss);
    this.blit(this.dye.write);
    this.dye.swap();
  };

  Fluid.prototype.render = function () {
    const gl = this.gl;
    const u = this.use("display");
    gl.uniform2f(u.texel, this.dye.tx[0], this.dye.tx[1]);
    gl.uniform2f(u.dyeTexel, this.dye.tx[0], this.dye.tx[1]);
    gl.uniform1i(u.uDye, this.dye.read.attach(0));
    gl.uniform3f(u.bg, this.opt.bg[0], this.opt.bg[1], this.opt.bg[2]);
    gl.uniform1f(u.gain, this.opt.gain);
    this.blit(null);
  };

  Fluid.prototype.loop = function (now) {
    requestAnimationFrame(this.loop);
    if (this.paused) { this.last = now; return; }
    const dt = Math.min((now - this.last) / 1000, 1 / 30);
    this.last = now;
    this.resize(false);
    while (this.queue.length) {
      const s = this.queue.shift();
      this.splat(s.x, s.y, s.dx, s.dy, s.c, s.r);
    }
    if (this.onFrame) this.onFrame(dt, now);
    this.step(dt);
    this.render();
  };

  Fluid.prototype.push = function (x, y, dx, dy, c, r) {
    this.queue.push({ x, y, dx, dy, c, r });
  };

  window.Fluid = Fluid;
})();
