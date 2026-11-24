/* Transferlab — interações da página */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var vh = window.innerHeight;

  /* ---------- Nav ---------- */
  var nav = $("#nav");

  /* ---------- Revelar ao rolar ---------- */
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); if (e.target.querySelector("[data-count]") || e.target.hasAttribute("data-count")) count(e.target); } });
  }, { threshold: 0.14, rootMargin: "0px 0px -6% 0px" }) : null;
  $$("[data-reveal]").forEach(function (el) { io ? io.observe(el) : el.classList.add("in"); });

  /* ---------- Contadores ---------- */
  function count(root) {
    $$("[data-count]", root).forEach(function (el) {
      var to = +el.dataset.count, t0 = null, dur = 1600;
      if (reduce || to === 0) { el.textContent = to; return; }
      (function step(t) { if (!t0) t0 = t; var p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 4); el.textContent = Math.round(to * e); if (p < 1) requestAnimationFrame(step); })(performance.now());
    });
  }

  /* ---------- Declaração: palavras acendem ---------- */
  var st = $("[data-words]"), words = [];
  if (st) {
    var gset = { "capa": 1, "e": 0, "tags": 1 };
    words = st.textContent.trim().split(/\s+/).map(function (w) { return w; });
    st.innerHTML = words.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
    words = $$(".w", st);
    var mark = ["download", "conversão,", "tags", "capa"];
    words.forEach(function (el) { if (mark.indexOf(el.textContent) > -1) el.classList.add("g"); });
  }
  function updWords() {
    if (!st) return;
    var r = st.getBoundingClientRect();
    var p = clamp((vh * 0.82 - r.top) / (r.height + vh * 0.32), 0, 1);
    var n = Math.round(p * words.length * 1.04);
    words.forEach(function (w, i) { w.classList.toggle("lit", i < n); });
  }

  /* ---------- Hero: inclinação ao rolar + mouse + chips ---------- */
  var stage = $("[data-tilt]"), tilt = stage && $(".tilt-target", stage), mx = 0, my = 0;
  var chips = $$("[data-float]");
  function updTilt() {
    if (!stage || reduce) return;
    var r = stage.getBoundingClientRect();
    var t = clamp((vh - r.top) / (vh * 0.95), 0, 1), e = 1 - Math.pow(1 - t, 3);
    var rx = (1 - e) * 16 + my * -3, ry = mx * 4, sc = 0.9 + 0.1 * e;
    tilt.style.transform = "rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) scale(" + sc.toFixed(3) + ")";
    chips.forEach(function (c, i) { c.style.transform = "translateY(" + ((window.scrollY * 0.07 + 0) * (+c.dataset.float) * (1 + i * 0.25)).toFixed(1) + "px)"; });
  }
  if (stage) {
    stage.addEventListener("pointermove", function (e) { var r = stage.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; updTilt(); });
    stage.addEventListener("pointerleave", function () { mx = my = 0; updTilt(); });
  }

  /* ---------- Como funciona (fixo ao rolar) ---------- */
  var story = $(".story"), steps = $$(".step"), cur = -1;
  function updStory() {
    if (!story || !window.TL || !TL.story) return;
    var r = story.getBoundingClientRect(), total = r.height - vh;
    var p = clamp(-r.top / total, 0, 1);
    var idx = p < 0.3 ? 0 : p < 0.62 ? 1 : 2;
    if (idx !== cur) { cur = idx; steps.forEach(function (s, i) { s.classList.toggle("on", i === idx); }); }
    var L = TL.LINK.length, s;
    if (idx === 0) { s = { chars: (p / 0.3) * L * 1.15, caret: true, mode: "audio", qual: TL.QUALS[2] }; }
    else if (idx === 1) {
      var q = (p - 0.3) / 0.32;
      s = { chars: L, caret: false, mode: q > 0.04 ? "video" : "audio", qual: TL.QUALS[q > 0.7 ? 2 : q > 0.45 ? 1 : q > 0.22 ? 0 : 5] };
    } else {
      var d = (p - 0.62) / 0.38, pct = clamp(d * 1.25, 0, 1) * 100;
      s = { chars: L, caret: false, mode: "video", qual: TL.QUALS[2], press: d < 0.04, stage: pct >= 100 ? (d > 0.95 ? "done" : "proc") : (d < 0.03 ? "idle" : "run"), pct: pct };
      if (pct >= 100 && d <= 0.95) s.stage = "proc";
    }
    TL.story.set(s);
  }

  /* ---------- Bento: brilho que segue o mouse ---------- */
  $$("[data-spot]").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); });
  });

  /* ---------- Botões magnéticos ---------- */
  $$("[data-magnetic]").forEach(function (b) {
    b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.setProperty("--mx", ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + "px"); b.style.setProperty("--my", ((e.clientY - r.top - r.height / 2) * 0.28).toFixed(1) + "px"); });
    b.addEventListener("pointerleave", function () { b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px"); });
  });

  /* ---------- Ondas de áudio ---------- */
  var FMT = {
    mp3:  { name: "MP3",  desc: "O formato universal. Toca em qualquer lugar.", q: "320 kbps", hz: "48 kHz", use: "Ouvir em qualquer aparelho", d: 0.5, f: 1.0 },
    wav:  { name: "WAV",  desc: "Sem compressão. O favorito de quem edita.", q: "PCM 24-bit", hz: "48 kHz", use: "Edição e mixagem", d: 1.0, f: 1.4 },
    flac: { name: "FLAC", desc: "Sem perdas e bem menor que o WAV.", q: "Sem perdas", hz: "48 kHz", use: "Arquivo e audiófilos", d: 0.85, f: 0.8 },
    m4a:  { name: "M4A",  desc: "Aproveita o áudio original, sem recomprimir.", q: "AAC original", hz: "Original", use: "Celulares e podcasts", d: 0.6, f: 1.2 },
    opus: { name: "Opus", desc: "Mais qualidade por megabyte. Sem recompressão.", q: "Original", hz: "48 kHz", use: "Máxima eficiência", d: 0.7, f: 0.6 },
    aac:  { name: "AAC",  desc: "Eficiente e amplamente compatível.", q: "320 kbps", hz: "48 kHz", use: "Dispositivos Apple e Android", d: 0.55, f: 1.1 }
  };
  var waves = $$("canvas[data-wave]").map(function (cv) { return { cv: cv, ctx: cv.getContext("2d"), big: cv.dataset.wave === "big", on: false, w: 0, h: 0 }; });
  var cfg = FMT.mp3;
  function sizeWave(w) { var d = Math.min(window.devicePixelRatio || 1, 2), r = w.cv.getBoundingClientRect(); w.w = r.width; w.h = r.height; w.cv.width = r.width * d; w.cv.height = r.height * d; w.ctx.setTransform(d, 0, 0, d, 0, 0); }
  waves.forEach(function (w) { sizeWave(w); if (io || true) new IntersectionObserver(function (e) { w.on = e[0].isIntersecting; }, { threshold: 0 }).observe(w.cv); });
  window.addEventListener("resize", function () { vh = innerHeight; waves.forEach(sizeWave); placePill(); });
  var smooth = { d: 0.5, f: 1 };
  function drawWave(w, t) {
    var c = w.ctx, W = w.w, H = w.h, gap = w.big ? 7 : 6, bw = w.big ? 5 : 4, n = Math.floor(W / (bw + gap));
    c.clearRect(0, 0, W, H);
    var g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, "#ff3e8e"); g.addColorStop(0.55, "#ff8a2b"); g.addColorStop(1, "#ffc857"); c.fillStyle = g;
    var d = w.big ? smooth.d : 0.8, f = w.big ? smooth.f : 1;
    for (var i = 0; i < n; i++) {
      var x = i * (bw + gap) + gap / 2, k = i / n;
      var a = (Math.sin(k * 9 * f + t * 1.7) * 0.5 + Math.sin(k * 23 * f - t * 2.3) * 0.3 + Math.sin(k * 3 + t * 0.9) * 0.4);
      var env = Math.sin(k * Math.PI) * 0.75 + 0.25;
      var h = Math.max(4, Math.abs(a) * env * H * (0.45 + d * 0.5));
      c.globalAlpha = 0.35 + 0.65 * env;
      var y = (H - h) / 2, r = bw / 2;
      c.beginPath(); c.roundRect ? c.roundRect(x, y, bw, h, r) : c.rect(x, y, bw, h); c.fill();
    }
    c.globalAlpha = 1;
  }

  /* ---------- Formatos (abas) ---------- */
  var tabs = $$(".fmt-tabs [role=tab]"), pill = $(".fmt-pill"), info = $(".fmt-info");
  function placePill() { var a = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0]; if (a && pill) { pill.style.width = a.offsetWidth + "px"; pill.style.transform = "translateX(" + a.offsetLeft + "px)"; } }
  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      tabs.forEach(function (x) { x.setAttribute("aria-selected", x === t ? "true" : "false"); }); placePill();
      var f = FMT[t.dataset.fmt]; cfg = f; info.classList.add("swap");
      setTimeout(function () { $$("[data-f]", info).forEach(function (el) { el.textContent = f[el.dataset.f]; }); info.classList.remove("swap"); }, 220);
    });
  });
  setTimeout(placePill, 60); window.addEventListener("load", placePill);

  /* ---------- FAQ ---------- */
  $$(".acc-q").forEach(function (b) { b.addEventListener("click", function () { b.setAttribute("aria-expanded", b.getAttribute("aria-expanded") === "true" ? "false" : "true"); }); });

  /* ---------- Download: pega versão e link direto da última Release ---------- */
  var REPO = "paulodoscriativoscontato-collab/transferlab";
  fetch("https://api.github.com/repos/" + REPO + "/releases/latest", { headers: { Accept: "application/vnd.github+json" } })
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (j) {
      var a = (j.assets || []).filter(function (x) { return /Setup.*\.exe$/i.test(x.name); })[0]; if (!a) return;
      $$(".get [data-download]").forEach(function (el) { el.href = a.browser_download_url; });
      $$("[data-version]").forEach(function (el) { el.textContent = String(j.tag_name).replace(/^v/, ""); });
      $$("[data-size]").forEach(function (el) { el.textContent = "≈ " + Math.round(a.size / 1048576) + " MB"; });
    }).catch(function () { /* mantém o link para a página de releases */ });

  /* ---------- Loop principal de rolagem ---------- */
  var ticking = false;
  function onScroll() { if (ticking) return; ticking = true; requestAnimationFrame(function () { ticking = false; nav.classList.toggle("scrolled", scrollY > 8); updWords(); updTilt(); updStory(); }); }
  addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll);
  onScroll(); setTimeout(onScroll, 200);

  /* ---------- Loop de animação (ondas) ---------- */
  var t0 = performance.now();
  (function frame(now) {
    var t = (now - t0) / 1000; smooth.d += (cfg.d - smooth.d) * 0.06; smooth.f += (cfg.f - smooth.f) * 0.06;
    waves.forEach(function (w) { if (w.on && !reduce) drawWave(w, t); else if (w.on && !w.drawn) { drawWave(w, 0); w.drawn = true; } });
    requestAnimationFrame(frame);
  })(t0);
})();
