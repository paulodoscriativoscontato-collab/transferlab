/* Réplica animada da janela do Transferlab + demonstrações (topo e "Como funciona") */
(function () {
  "use strict";
  var LINK = "https://exemplo.com/minha-aula-em-4k";
  var QUALS = ["Melhor (até 8K)", "8K 60fps", "4K 60fps", "4K 30fps", "1440p 60fps", "1080p 60fps"];
  var FMTS = ["MP3", "WAV", "FLAC", "M4A", "OPUS", "AAC"];

  function html() {
    var fm = FMTS.map(function (f, i) { return '<span class="' + (i === 0 ? "on" : "") + '">' + f + "</span>"; }).join("");
    return (
      '<div class="app" aria-hidden="true">' +
      '<div class="app-chrome"><div class="t"><img src="assets/logo-64.png" alt="">Transferlab</div><div class="ctl"><span>&#8211;</span><span>&#9633;</span><span>&#10005;</span></div></div>' +
      '<div class="app-body">' +
      '<div class="app-stars"></div><img class="app-logo" src="assets/logo-192.png" alt="">' +
      '<div class="app-title">Transferlab</div><div class="app-sub">Vídeo e áudio na máxima qualidade</div>' +
      '<div class="acard a-links"><span class="lbl">LINKS</span><div class="a-field" data-r="field"></div></div>' +
      '<div class="acard a-opts"><span class="lbl" style="display:none"></span>' +
      '<div class="aseg aseg-modo" style="--n:2;--i:0" data-r="modo"><i class="pill"></i><span class="on">Áudio</span><span>Vídeo</span></div>' +
      '<div class="a-panel" data-r="pAudio"><div class="aseg aseg-fmt" style="--n:6;--i:0" data-r="fmt"><i class="pill"></i>' + fm + '</div>' +
      '<div class="asw on" data-r="swA"><i></i>Embutir capa e informações no arquivo</div></div>' +
      '<div class="a-panel off" data-r="pVideo"><div class="astep"><span>&#8249;</span><b data-r="qual">4K 60fps</b><span>&#8250;</span></div>' +
      '<div class="asw" data-r="swV"><i></i>Converter para H.264 (abre no Premiere / After Effects)</div></div></div>' +
      '<div class="acard a-pasta"><span class="lbl">SALVAR EM</span><div class="a-path">C:\\Users\\voce\\Downloads</div><div class="a-mini">Alterar</div></div>' +
      '<div class="acard a-baixar"><div class="a-go" data-r="go">Baixar</div><div class="a-bar"><i data-r="bar" style="--p:0"></i></div><div class="a-status" data-r="status">Pronto.</div></div>' +
      '<div class="app-ver">v1.0.1</div></div></div>'
    );
  }

  function create(frame) {
    frame.innerHTML = html();
    var app = frame.firstChild, r = {};
    [].forEach.call(app.querySelectorAll("[data-r]"), function (el) { r[el.getAttribute("data-r")] = el; });

    function fit() { frame.style.setProperty("--k", frame.clientWidth / 660); }
    fit();
    if (window.ResizeObserver) new ResizeObserver(fit).observe(frame); else window.addEventListener("resize", fit);

    var st = {};
    function seg(el, i) { el.style.setProperty("--i", i); [].forEach.call(el.querySelectorAll("span"), function (s, k) { s.classList.toggle("on", k === i); }); }

    /* estado: {chars, mode, qual, fmt, press, stage: idle|run|proc|done, pct, speed, eta} */
    function set(s) {
      var n = Math.max(0, Math.min(LINK.length, Math.round(s.chars || 0)));
      if (st.chars !== n || st.caret !== s.caret) {
        st.chars = n; st.caret = s.caret;
        r.field.classList.toggle("has", n > 0);
        r.field.innerHTML = n > 0 ? LINK.slice(0, n) + (s.caret ? '<span class="caret"></span>' : "") : "Cole um ou mais links aqui (um por linha)";
      }
      var video = s.mode === "video";
      if (st.video !== video) { st.video = video; seg(r.modo, video ? 1 : 0); r.pAudio.classList.toggle("off", video); r.pVideo.classList.toggle("off", !video); }
      if (s.qual && st.qual !== s.qual) { st.qual = s.qual; r.qual.textContent = s.qual; }
      if (st.press !== !!s.press) { st.press = !!s.press; r.go.classList.toggle("press", !!s.press); }
      var busy = s.stage === "run" || s.stage === "proc";
      if (st.busy !== busy) { st.busy = busy; r.go.classList.toggle("busy", busy); r.go.textContent = busy ? "Baixando..." : "Baixar"; }
      var pct = Math.max(0, Math.min(100, s.pct || 0));
      if (st.pct !== pct) { st.pct = pct; r.bar.style.setProperty("--p", pct); }
      var text = "Pronto.", cls = "";
      if (s.stage === "run") { text = "Baixando  " + Math.round(pct) + "%   " + (s.speed || "18,4 MiB/s") + "   restam 00:" + ("0" + Math.max(0, Math.round((100 - pct) * 0.18))).slice(-2); cls = "run"; }
      if (s.stage === "proc") { text = "Processando e convertendo..."; cls = "run"; }
      if (s.stage === "done") { text = "Concluído! Salvo em C:\\Users\\voce\\Downloads"; cls = "ok"; }
      if (st.text !== text) { st.text = text; r.status.textContent = text; }
      if (st.cls !== cls) { st.cls = cls; r.status.className = "a-status " + cls; }
    }
    set({});
    return { set: set, el: frame };
  }

  /* ---------- Demonstração em loop (topo da página) ---------- */
  function loopDemo(frame) {
    var a = create(frame), alive = true, visible = true;
    var sleep = function (ms) { return new Promise(function (ok) { setTimeout(ok, ms); }); };
    if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }, { threshold: 0.05 }).observe(frame);
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { a.set({ chars: LINK.length, mode: "video", qual: "4K 60fps", stage: "done", pct: 100 }); return; }

    async function wait(ms) { var t = 0; while (t < ms) { await sleep(40); if (visible) t += 40; } }
    async function run() {
      while (alive) {
        var s = { chars: 0, mode: "audio", qual: "4K 60fps", stage: "idle", pct: 0, caret: true };
        a.set(s); await wait(1400);
        for (var i = 1; i <= LINK.length; i++) { s.chars = i; a.set(s); await wait(34); }
        await wait(700); s.caret = false; s.mode = "video"; a.set(s); await wait(900);
        for (var q = 0; q <= 2; q++) { s.qual = QUALS[q]; a.set(s); await wait(420); }
        await wait(600); s.press = true; a.set(s); await wait(160); s.press = false; s.stage = "run"; a.set(s);
        for (var p = 0; p <= 100; p += 1.6) { s.pct = p; s.speed = (14 + Math.sin(p / 8) * 5).toFixed(1).replace(".", ",") + " MiB/s"; a.set(s); await wait(34); }
        s.pct = 100; s.stage = "proc"; a.set(s); await wait(1300);
        s.stage = "done"; a.set(s); await wait(3600);
      }
    }
    run();
  }

  window.TL = { create: create, LINK: LINK, QUALS: QUALS };
  document.addEventListener("DOMContentLoaded", function () {
    var hero = document.querySelector('[data-app="hero"]');
    if (hero) loopDemo(hero);
    var story = document.querySelector('[data-app="story"]');
    if (story) window.TL.story = create(story);
  });
})();
