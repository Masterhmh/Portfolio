/* ============ HMH OS — logic máy Mac ============ */
"use strict";
const $ = (s, r) => (r || document).querySelector(s);
const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
const isMobile = () => innerWidth <= 760;
const finePointer = matchMedia("(hover:hover) and (pointer:fine)").matches;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- theme: tự động theo máy + đổi tay ---------- */
(function(){
  const root = document.documentElement;
  const saved = localStorage.getItem("hmh-os-theme");
  root.dataset.osTheme = saved || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  $("#mb-theme").addEventListener("click", () => {
    root.dataset.osTheme = root.dataset.osTheme === "dark" ? "light" : "dark";
    localStorage.setItem("hmh-os-theme", root.dataset.osTheme);
  });
})();

/* ---------- hình nền theo chế độ sáng/tối (folder Wallpapers trên GitHub) ---------- */
const WP_SRC = {
  dark:  { main: "https://images.weserv.nl/?url=raw.githubusercontent.com/Masterhmh/Portfolio/main/Wallpapers/Dark.jpg&w=1920&q=80&output=webp",  full: "Wallpapers/Dark.jpg" },
  light: { main: "https://images.weserv.nl/?url=raw.githubusercontent.com/Masterhmh/Portfolio/main/Wallpapers/Light.jpg&w=1920&q=80&output=webp", full: "Wallpapers/Light.jpg" }
};
function wpApply(){
  const wpSel = localStorage.getItem("hmh-os-wp");
  const theme = (wpSel === "dark" || wpSel === "light") ? wpSel :
    (document.documentElement.dataset.osTheme === "light" ? "light" : "dark");
  const src = WP_SRC[theme];
  $$(".wallpaper").forEach(el => {
    if (el.dataset.wp === theme) return;
    el.dataset.wp = theme;
    let layers = $$(".wp-l", el);
    if (!layers.length){
      el.insertAdjacentHTML("beforeend", '<div class="wp-l"></div><div class="wp-l"></div>');
      layers = $$(".wp-l", el);
    }
    const front = layers.find(l => l.classList.contains("on")) || layers[0];
    const back = layers.find(l => l !== front) || layers[1];
    const show = u => { back.style.backgroundImage = 'url("' + u + '")'; back.classList.add("on"); front.classList.remove("on"); };
    const img = new Image();
    img.onload = () => show(src.main);
    img.onerror = () => { const i2 = new Image(); i2.onload = () => show(src.full); i2.onerror = () => show(src.full); i2.src = src.full; };
    img.src = src.main;
  });
}
new MutationObserver(wpApply).observe(document.documentElement, { attributes: true, attributeFilter: ["data-os-theme"] });
wpApply();

/* ---------- dinh dang gio 12h/24h (Cai dat he thong) ---------- */
function fmtHM(d, sec){
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  if (localStorage.getItem("hmh-clock-24h") === "0"){
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return h + ":" + m + (sec ? ":" + s : "") + " " + ap;
  }
  return String(h).padStart(2, "0") + ":" + m + (sec ? ":" + s : "");
}

/* ---------- đồng hồ ---------- */
(function(){
  const DAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const DAYS_S = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
  function tick(){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0"), mm = String(d.getMinutes()).padStart(2, "0"),
          ss = String(d.getSeconds()).padStart(2, "0");
    const lockC = $("#lock-clock"), lockD = $("#lock-date");
    if (lockC) lockC.textContent = fmtHM(d);
    if (lockD) lockD.textContent = DAYS[d.getDay()] + ", " + d.getDate() + " tháng " + (d.getMonth() + 1);
    const mb = $("#mb-clock");
    if (mb) mb.textContent = DAYS_S[d.getDay()] + " " + d.getDate() + " thg " + (d.getMonth() + 1) + "  " + fmtHM(d);
    const ncpC = $("#ncp-clock"), ncpD = $("#ncp-date");
    if (ncpC) ncpC.textContent = fmtHM(d);
    if (ncpD) ncpD.textContent = DAYS[d.getDay()] + ", " + d.getDate() + " tháng " + (d.getMonth() + 1) + " năm " + d.getFullYear();
    const wt = $("#w-time"), wd = $("#w-date");
    if (wt) wt.textContent = fmtHM(d);
    if (wd) wd.textContent = DAYS[d.getDay()] + ", " + d.getDate() + "/" + (d.getMonth() + 1);
    setTimeout(tick, 1000);
  }
  tick();
})();

/* ---------- tiếng khởi động (tổng hợp WebAudio, kiểu chuông Mac) ---------- */
let osMuted = localStorage.getItem("hmh-os-mute") === "1";
const soundBtn = $("#mb-sound");
function syncSoundBtn(){ soundBtn.classList.toggle("off", osMuted); soundBtn.textContent = osMuted ? "✕" : "♪"; }
syncSoundBtn();
soundBtn.addEventListener("click", () => {
  osMuted = !osMuted;
  localStorage.setItem("hmh-os-mute", osMuted ? "1" : "0");
  syncSoundBtn();
  if (!osMuted) playChime();
});
function playChime(){
  if (osMuted) return;
  try{
    const AC = playChime.ac || (playChime.ac = new (window.AudioContext || window.webkitAudioContext)());
    if (AC.state === "suspended") AC.resume();
    const t = AC.currentTime + 0.02;
    const master = AC.createGain();
    master.gain.value = 0.16;
    const lp = AC.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400;
    master.connect(lp); lp.connect(AC.destination);
    // hợp âm chuông khởi động: F# nền + các quãng sáng dần
    [[92.5, .9, 0], [185, .8, 0], [277.2, .55, .01], [369.9, .5, .02], [466.2, .34, .03], [554.4, .22, .05], [739.9, .12, .07]]
    .forEach(([f, v, dl]) => {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = "sine"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t + dl);
      g.gain.exponentialRampToValueAtTime(v, t + dl + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dl + 3.1);
      o.connect(g); g.connect(master);
      o.start(t + dl); o.stop(t + dl + 3.3);
    });
  }catch(e){}
}

/* ---------- boot -> màn hình khóa ---------- */
(function(){
  const boot = $("#os-boot"), bar = $("#boot-bar"), lock = $("#os-lock");
  function toLock(){
    boot.classList.add("done");
    lock.hidden = false;
    setTimeout(() => boot.remove(), 600);
  }
  if (reduced){ bar.style.width = "100%"; setTimeout(toLock, 250); return; }
  let p = 0;
  const iv = setInterval(() => {
    p = Math.min(100, p + 4 + Math.random() * 13);
    bar.style.width = p + "%";
    if (p >= 100){ clearInterval(iv); setTimeout(toLock, 260); }
  }, 130);
  boot.addEventListener("click", () => { clearInterval(iv); bar.style.width = "100%"; setTimeout(toLock, 120); });
})();

/* ---------- mở khóa -> desktop ---------- */
(function(){
  const lock = $("#os-lock"), desk = $("#os-desk");
  let entered = false;
  function enter(){
    if (entered || lock.hidden) return;
    entered = true;
    playChime();
    lock.classList.add("bye");
    desk.hidden = false;
    musicAutoStart();
    if (window.HMH_askGeo) window.HMH_askGeo();
    setTimeout(() => { lock.remove(); openWin("welcome"); }, 420);
  }
  lock.addEventListener("click", e => { if (e.target.closest("a")) return; enter(); });
  addEventListener("keydown", e => { if (!lock.hidden && (e.key === "Enter" || e.key === " ")) enter(); });
})();

/* ---------- quản lý cửa sổ ---------- */
const winsEl = $("#wins");
let zTop = 20, cascade = 0;
const WINCONF = {
  welcome:  { title: "Xin chào", w: 580, h: 490 },
  about:    { title: "Hồ sơ — Hoàng Hùng", w: 700, h: 610 },
  skills:   { title: "Kỹ năng", w: 660, h: 640 },
  journey:  { title: "Hành trình", w: 640, h: 580 },
  why:      { title: "Ứng tuyển Coolmate", w: 880, h: 660 },
  projects: { title: "Dự án", w: 920, h: 640 },
  cv:       { title: "CV — Hoàng Hùng", w: 620, h: 500 },
  contact:  { title: "Liên hệ", w: 520, h: 540 },
  terminal: { title: "Terminal — hmh", w: 640, h: 450 },
  trash:    { title: "Thùng rác", w: 440, h: 340 },
  aboutmac: { title: "Giới thiệu về máy này", w: 460, h: 520 },
  settings: { title: "Cài đặt hệ thống", w: 480, h: 430 },
  browser:  { title: "Safari — Xưởng In Mẫu", w: 1120, h: 750 },
  browsercv:{ title: "Safari — CV Hoàng Hùng", w: 1000, h: 780 },
  safari:   { title: "Safari", w: 1120, h: 750 },
  case:     { title: "Dự án", w: 780, h: 660 }
};
const openWins = new Map();
const RECENT_WINS = [];

function dockDots(){
  $$(".dock-app[data-open]").forEach(b =>
    b.classList.toggle("running", openWins.has(b.dataset.open)));
}
function focusWin(win){
  $$(".win", winsEl).forEach(w => w.classList.toggle("active", w === win));
  win.style.zIndex = ++zTop;
}
function openWin(id, opts){
  opts = opts || {};
  if (id !== "aboutmac" && id !== "settings"){
    const ri = RECENT_WINS.indexOf(id);
    if (ri >= 0) RECENT_WINS.splice(ri, 1);
    RECENT_WINS.unshift(id);
    if (RECENT_WINS.length > 5) RECENT_WINS.length = 5;
  }
  if (openWins.has(id)){
    const w = openWins.get(id);
    if (w.hidden){ w.hidden = false; requestAnimationFrame(() => w.classList.remove("minning")); }
    focusWin(w);
    if (id === "terminal") focusTerm(w);
    return w;
  }
  const conf = Object.assign({}, WINCONF[id] || WINCONF.case, opts.conf || {});
  const win = document.createElement("section");
  win.className = "win"; win.dataset.id = id;
  win.setAttribute("role", "dialog"); win.setAttribute("aria-label", conf.title);
  const bar = document.createElement("div");
  bar.className = "win-bar";
  bar.innerHTML = '<div class="tl-lights">' +
    '<button class="c" data-act="close" aria-label="Đóng"></button>' +
    '<button class="m" data-act="min" aria-label="Thu nhỏ"></button>' +
    '<button class="x" data-act="max" aria-label="Phóng to"></button></div>' +
    '<div class="win-title"></div>';
  $(".win-title", bar).textContent = conf.title;
  const body = document.createElement("div");
  body.className = "win-body";
  if (opts.build) opts.build(body);
  else body.appendChild(document.getElementById("src-" + id).content.cloneNode(true));
  win.append(bar, body);
  // kích thước + vị trí
  const W = winsEl.clientWidth, H = winsEl.clientHeight;
  const w = Math.min(conf.w, W - 12), h = Math.min(conf.h, H - 12);
  const off = (cascade++ % 6) * 30;
  win.style.width = w + "px"; win.style.height = h + "px";
  win.style.left = Math.max(6, (W - w) / 2 + off - 40) + "px";
  win.style.top = Math.max(6, (H - h) / 2 + off - 26) + "px";
  if (isMobile() && id === "welcome") win.style.top = (parseInt(win.style.top, 10) + 38) + "px";
  winsEl.appendChild(win);
  openWins.set(id, win);
  focusWin(win);
  if (isMobile() && id !== "welcome") win.classList.add("max");
  wireWin(win, bar);
  dockDots();
  if (id === "skills") setTimeout(() => $$(".sbar i", body).forEach(b => b.style.width = b.dataset.w + "%"), 220);
  if (id === "projects") initProjects(body);
  if (id === "browser" || id === "browsercv" || id === "safari") initBrowser(body);
  if (id === "terminal") initTerm(body);
  if (id === "settings") initSettings(body);
  return win;
}
function closeWin(win){
  win.classList.add("closing");
  setTimeout(() => { win.remove(); openWins.delete(win.dataset.id); dockDots(); }, 170);
}
function minWin(win){
  win.classList.add("minning");
  setTimeout(() => { win.hidden = true; }, 180);
}
function maxWin(win){
  if (win.classList.contains("max")){ win.classList.remove("max"); return; }
  win.classList.add("max");
}
function wireWin(win, bar){
  bar.addEventListener("click", e => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    e.stopPropagation();
    if (b.dataset.act === "close") closeWin(win);
    if (b.dataset.act === "min") minWin(win);
    if (b.dataset.act === "max") maxWin(win);
  });
  bar.addEventListener("dblclick", e => { if (!e.target.closest("[data-act]")) maxWin(win); });
  win.addEventListener("pointerdown", () => focusWin(win));
  // kéo thả
  bar.addEventListener("pointerdown", e => {
    if (e.target.closest("[data-act]") || win.classList.contains("max")) return;
    const r = win.getBoundingClientRect(), wr = winsEl.getBoundingClientRect();
    const dx = e.clientX - r.left, dy = e.clientY - r.top;
    bar.setPointerCapture(e.pointerId);
    function mv(ev){
      let x = ev.clientX - wr.left - dx, y = ev.clientY - wr.top - dy;
      x = Math.min(Math.max(x, -r.width + 120), wr.width - 90);
      y = Math.min(Math.max(y, 0), wr.height - 44);
      win.style.left = x + "px"; win.style.top = y + "px";
    }
    function up(){ bar.removeEventListener("pointermove", mv); bar.removeEventListener("pointerup", up); }
    bar.addEventListener("pointermove", mv);
    bar.addEventListener("pointerup", up);
  });
}

/* mở cửa sổ từ mọi nút data-open */
document.addEventListener("click", e => {
  const t = e.target.closest("[data-open]");
  if (!t || t.closest(".tl-lights")) return;
  if (t.classList.contains("dicon")){
    if (finePointer && !t.dataset.tapped){ // desktop: chọn trước, bấm đúp mới mở
      $$(".dicon").forEach(d => d.classList.remove("sel"));
      t.classList.add("sel");
      return;
    }
    openWin(t.dataset.open);
    t.classList.remove("sel");
    return;
  }
  openWin(t.dataset.open);
});
document.addEventListener("dblclick", e => {
  const t = e.target.closest(".dicon");
  if (t) openWin(t.dataset.open);
});
/* dự phòng cảm ứng: chạm nhả là mở ngay (một số trình duyệt trong app nuốt sự kiện click) */
let lastTouchOpen = { id: null, t: 0 };
let touchStartPos = null;
document.addEventListener("pointerdown", e => {
  if (e.pointerType === "touch" || e.pointerType === "pen") touchStartPos = { x: e.clientX, y: e.clientY };
}, true);
document.addEventListener("pointerup", e => {
  if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
  if (touchStartPos && Math.hypot(e.clientX - touchStartPos.x, e.clientY - touchStartPos.y) > 12) return; // vừa vuốt cuộn, không phải chạm mở
  const t = e.target.closest("[data-open]");
  if (!t || t.closest(".tl-lights")) return;
  lastTouchOpen = { id: t.dataset.open, t: Date.now() };
  openWin(t.dataset.open);
  if (t.classList.contains("dicon")) t.classList.remove("sel");
});
document.addEventListener("click", e => {
  // click theo sau pointerup cảm ứng cho cùng một cửa sổ thì bỏ qua để khỏi mở 2 lần
  const t = e.target.closest("[data-open]");
  if (t && lastTouchOpen.id === t.dataset.open && Date.now() - lastTouchOpen.t < 700){
    lastTouchOpen = { id: null, t: 0 };
    e.stopImmediatePropagation();
  }
}, true);
$("#os-desk").addEventListener("pointerdown", e => {
  if (!e.target.closest(".dicon")) $$(".dicon").forEach(d => d.classList.remove("sel"));
});

/* ---------- dock: hiệu ứng phóng to khi di chuột ---------- */
(function(){
  if (!finePointer || reduced) return;
  const dock = $("#dock");
  dock.addEventListener("mousemove", e => {
    $$(".dock-app", dock).forEach(app => {
      const ic = $(".ic-wrap", app);
      const r = ic.getBoundingClientRect();
      const d = Math.abs(e.clientX - (r.left + r.width / 2));
      const s = Math.max(1, 1.5 - d / 110);
      ic.style.transform = "scale(" + s.toFixed(3) + ") translateY(" + (-(s - 1) * 16).toFixed(1) + "px)";
    });
  });
  dock.addEventListener("mouseleave", () =>
    $$(".ic-wrap", dock).forEach(ic => ic.style.transform = ""));
  // tooltip
  $$(".dock-app", dock).forEach(app => {
    const tip = document.createElement("span");
    tip.className = "tip"; tip.textContent = app.dataset.name || "";
    app.appendChild(tip);
  });
})();

/* ---------- trình duyệt nội bộ: mở app ngay trong máy ---------- */
const APP_URL = "https://masterhmh.github.io/coolmate/";
function initBrowser(body){
  const frame = $(".br-frame", body), loading = $(".br-loading", body);
  if (!frame) return;
  const wrap = $(".browser", body);
  const url = (wrap && wrap.dataset.url) || "";
  const input = $(".br-input", body);
  const startPage = $(".br-start", body);
  const pretty = (u) => u.replace(/^https?:\/\//, "").replace(/\/$/, "");
  function showStart(){ if (startPage) startPage.hidden = false; }
  function hideStart(){ if (startPage) startPage.hidden = true; }
  const START = "hmh:start";
  let hist = startPage ? [START] : [], hIdx = startPage ? 0 : -1, navFlag = false;
  function showPage(u){
    navFlag = true;
    if (u === START) {
      frame.src = "about:blank";
      if (input) input.value = "";
      loading.classList.add("done");
      showStart();
      return;
    }
    loading.classList.remove("done");
    hideStart();
    frame.src = u;
    if (input) input.value = pretty(u);
  }
  function go(raw){
    let u = (raw || "").trim();
    if (!u) return;
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    if (startPage) { hist = hist.slice(0, hIdx + 1); hist.push(u); hIdx = hist.length - 1; showPage(u); }
    else { navFlag = true; loading.classList.remove("done"); frame.src = u; if (input) input.value = pretty(u); }
  }
  frame.addEventListener("load", () => {
    let ok = false, href = "";
    try {
      href = frame.contentWindow.location.href;
      ok = href !== "about:blank";
      if (ok && input && document.activeElement !== input) input.value = pretty(href);
      if (ok && startPage && !navFlag && href && href !== hist[hIdx]) {
        hist = hist.slice(0, hIdx + 1); hist.push(href); hIdx = hist.length - 1;
      }
    } catch (e) { ok = true; }
    navFlag = false;
    if (ok) { loading.classList.add("done"); hideStart(); }
  });
  if (url) { if (!frame.src) frame.src = url; }
  else showStart();
  if (input) {
    input.addEventListener("focus", () => { if (input.value) input.select(); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); go(input.value); input.blur(); }
    });
  }
  if (startPage) $$("[data-go]", startPage).forEach(b =>
    b.addEventListener("click", () => go(b.dataset.go)));
  const re = $("[data-br='reload']", body);
  if (re) re.addEventListener("click", () => {
    if (startPage && !startPage.hidden) { loading.classList.add("done"); return; }
    loading.classList.remove("done");
    try { frame.contentWindow.location.reload(); }
    catch (e) { go(input && input.value ? input.value : url); }
  });
  const bk = $("[data-br='back']", body);
  if (bk) bk.addEventListener("click", () => {
    if (startPage) { if (hIdx > 0) { hIdx--; showPage(hist[hIdx]); } }
    else { try { frame.contentWindow.history.back(); } catch (e) {} }
  });
  const fw = $("[data-br='forward']", body);
  if (fw) fw.addEventListener("click", () => {
    if (startPage) { if (hIdx < hist.length - 1) { hIdx++; showPage(hist[hIdx]); } }
    else { try { frame.contentWindow.history.forward(); } catch (e) {} }
  });
  const hm = $("[data-br='home']", body);
  if (hm) hm.addEventListener("click", () => {
    if (startPage) { hist = hist.slice(0, hIdx + 1); hist.push(START); hIdx = hist.length - 1; showPage(START); }
  });
}

/* ---------- terminal ---------- */
let termReady = false, termInput = null, termOut = null, termBodyEl = null;function tEsc(s){ return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function tPrint(html, cls){
  const d = document.createElement("div");
  if (cls) d.className = cls;
  d.innerHTML = html;
  termOut.appendChild(d);
  termBodyEl.scrollTop = termBodyEl.scrollHeight;
}
function focusTerm(win){
  const inp = win ? $("#os-term-in", win) : termInput;
  if (inp && finePointer) setTimeout(() => inp.focus(), 60);
}
function initTerm(body){
  termBodyEl = body;
  termOut = $("#os-term-out", body);
  termInput = $("#os-term-in", body);
  tPrint("HMH OS Terminal — gõ <span class='cyn'>help</span> rồi nhấn Enter để xem các lệnh.", "dim");
  $(".term", body).addEventListener("click", () => termInput.focus());
  termInput.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    const raw = termInput.value.trim();
    termInput.value = "";
    tPrint("<span class='grn'>hmh — ~ %</span> " + tEsc(raw));
    if (!raw) return;
    runCmd(raw.toLowerCase());
  });
  focusTerm(body.closest(".win"));
}
function runCmd(raw){
  const parts = raw.split(/\s+/), cmd = parts[0], arg = parts[1] || "";
  const OPENABLE = { "ho-so": "about", "about": "about", "ky-nang": "skills", "skills": "skills",
    "hanh-trinh": "journey", "journey": "journey", "du-an": "projects", "projects": "projects",
    "vi-sao": "why", "ly-do": "why", "ung-tuyen": "why", "why": "why", "lien-he": "contact", "contact": "contact", "cv": "cv", "chao": "welcome" };
  if (cmd === "clear"){ termOut.innerHTML = ""; return; }
  if (cmd === "help"){
    tPrint("<span class='cyn'>Các lệnh có thể dùng:</span>\n" +
      "  <span class='grn'>whoami</span>   — mình là ai\n" +
      "  <span class='grn'>ls</span>       — xem các thư mục trên máy\n" +
      "  <span class='grn'>open</span> du-an | ho-so | ky-nang | ly-do | lien-he — mở cửa sổ\n" +
      "  <span class='grn'>projects</span> — mở thư mục dự án\n" +
      "  <span class='grn'>contact</span>  — thông tin liên hệ\n" +
      "  <span class='grn'>cv</span>       — mở trang CV\n" +
      "  <span class='grn'>date</span>     — giờ hiện tại\n" +
      "  <span class='grn'>clear</span>    — xóa màn hình");
    return;
  }
  if (cmd === "whoami" || cmd === "about"){
    tPrint("Hoàng Hùng — designer đồ họa đa mảng × kỹ thuật.\n10+ năm thực chiến, mạnh nhất F&B (7+ năm), hiện phụ trách mảng 2D tại Namas.");
    return;
  }
  if (cmd === "ls"){
    tPrint("Ho-so/   Ky-nang/   Hanh-trinh/   Du-an/   Vi-sao-chon-toi/   Lien-he/   CV.pdf");
    return;
  }
  if (cmd === "open"){
    const id = OPENABLE[arg];
    if (id){ openWin(id); tPrint("Đang mở cửa sổ..."); }
    else tPrint("<span class='mag'>Chưa rõ mở gì.</span> Thử: open du-an", "");
    return;
  }
  if (cmd === "projects"){ openWin("projects"); tPrint("Đang mở thư mục Dự án..."); return; }
  if (cmd === "contact"){
    tPrint("SĐT: <span class='amb'>0964.843.943</span>\nEmail: <span class='amb'>masterhmh@gmail.com</span>\nFacebook: <span class='amb'>facebook.com/masterhmh</span>");
    return;
  }
  if (cmd === "cv"){ window.open("cv.html", "_blank"); tPrint("Đang mở trang CV ở thẻ mới..."); return; }
  if (cmd === "date"){ tPrint(new Date().toLocaleString("vi-VN")); return; }
  tPrint("<span class='mag'>Không có lệnh \"" + tEsc(raw) + "\".</span> Gõ <span class='cyn'>help</span> để xem các lệnh.");
}

/* ---------- dự án: tự tải từ thư mục GitHub ---------- */
const GH = { owner: "Masterhmh", repo: "Portfolio", branch: "main", dir: "projects" };
const rawUrl = p => "https://raw.githubusercontent.com/" + GH.owner + "/" + GH.repo + "/" + GH.branch + "/" + p;
const IMG_RE = /\.(jpe?g|png|webp|gif|svg)$/i;
function optUrl(dir, name, url, size, w){
  if (size > 400 * 1024){
    const clean = "raw.githubusercontent.com/" + GH.owner + "/" + GH.repo + "/" + GH.branch +
                  "/" + dir + "/" + name;
    return "https://images.weserv.nl/?url=" + encodeURIComponent(clean) + "&w=" + w + "&q=70&output=jpg";
  }
  return url;
}
function smartImg(img, dir, file, w){
  const opt = optUrl(dir, file.name, file.url, file.size, w);
  img.decoding = "async";
  if (opt !== file.url) img.onerror = () => { img.onerror = null; img.src = file.url; };
  img.src = opt;
}
async function getInfo(dir){
  try{
    const r = await fetch(rawUrl(GH.dir + "/" + encodeURIComponent(dir) + "/info.txt"));
    if (!r.ok) return null;
    const m = {};
    (await r.text()).split(/\r?\n/).forEach(line => {
      const mm = line.match(/^(TEN|VAN_DE|GIAI_PHAP|KET_QUA)\s*:\s*(.+)$/);
      if (mm) m[mm[1]] = mm[2].trim();
    });
    return (m.VAN_DE || m.GIAI_PHAP || m.KET_QUA) ? m : null;
  }catch(e){ return null; }
}
let HMH_PROJECTS = [];
function initProjects(body){
  const grid = $("#os-proj-grid", body), empty = $("#os-proj-empty", body),
        errBox = $("#os-proj-error", body), loading = $("#os-proj-loading", body),
        search = $("#finder-search", body);
  const CACHE_KEY = "hh-projects-v2", TTL = 15 * 60 * 1000;
  let allProjects = [];
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    $$(".prow", grid).forEach(c =>
      c.style.display = c.dataset.name.toLowerCase().includes(q) ? "" : "none");
  });
  function render(projects){
    allProjects = projects;
    HMH_PROJECTS = projects;
    grid.innerHTML = "";
    loading.hidden = true;
    projects.forEach(p => {
      const title = p.name.replace(/[-_]+/g, " ");
      const el = document.createElement("button");
      el.className = "prow"; el.dataset.name = title;
      el.innerHTML = '<svg class="prow-ic" viewBox="0 0 64 48"><path class="f-back" d="M4 8 a4 4 0 0 1 4-4 h14 l6 7 h32 a4 4 0 0 1 4 4 v25 a4 4 0 0 1-4 4 H8 a4 4 0 0 1-4-4 Z"/><path class="f-front" d="M2 16 a4 4 0 0 1 4-4 h52 a4 4 0 0 1 4 4 l-4 22 a4 4 0 0 1-4 3 H8 a4 4 0 0 1-4-3 Z"/></svg>';
      const tx = document.createElement("div"); tx.className = "prow-tx";
      const h = document.createElement("h4"); h.textContent = title;
      const d = document.createElement("p"); d.textContent = "Bấm để xem chi tiết và ảnh dự án";
      tx.append(h, d);
      const go = document.createElement("span"); go.className = "prow-go"; go.textContent = "›";
      el.append(tx, go);
      el.addEventListener("click", () => openCase(p, h.textContent));
      grid.appendChild(el);
      getInfo(p.name).then(info => {
        if (!info) return;
        p.info = info;
        if (info.TEN){ h.textContent = info.TEN; el.dataset.name = info.TEN; }
        if (info.VAN_DE) d.textContent = info.VAN_DE;
      }).catch(() => {});
    });
    if (!projects.length) empty.hidden = false;
  }
  async function fetchFresh(){
    const r = await fetch("https://api.github.com/repos/" + GH.owner + "/" + GH.repo + "/git/trees/" + GH.branch + "?recursive=1");
    if (!r.ok) throw new Error("HTTP " + r.status);
    const t = await r.json();
    if (t.truncated) throw new Error("tree truncated");
    const map = {};
    (t.tree || []).forEach(en => {
      if (en.type !== "blob") return;
      const m = en.path.match(/^projects\/([^/]+)\/(.+)$/);
      if (!m || /^[._]/.test(m[1]) || !IMG_RE.test(m[2])) return;
      (map[m[1]] = map[m[1]] || []).push({
        name: m[2], size: en.size || 0,
        url: rawUrl("projects/" + encodeURIComponent(m[1]) + "/" + encodeURIComponent(m[2]))
      });
    });
    const projects = Object.keys(map).map(dir => ({
      name: dir, info: null,
      imgs: map[dir].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
    })).filter(x => x.imgs.length);
    try{ localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), projects })); }catch(e){}
    return projects;
  }
  function readCache(){
    try{
      const c = JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
      if (c && Date.now() - c.t < TTL && c.projects && c.projects.length) return c.projects;
    }catch(e){}
    return null;
  }
  async function boot(){
    errBox.hidden = true; empty.hidden = true; loading.hidden = false;
    try{
      const fresh = await fetchFresh();
      if (fresh.length){ render(fresh); return; }
      const c = readCache();
      if (c) render(c); else { loading.hidden = true; empty.hidden = false; }
    }catch(e){
      const c = readCache();
      if (c) render(c); else { loading.hidden = true; errBox.hidden = false; }
    }
  }
  $("#os-proj-retry", body).addEventListener("click", boot);
  boot();
}

/* ---------- cửa sổ case study ---------- */
function openCase(p, title){
  if (openWins.has("case")){
    const w = openWins.get("case");
    closeWin(w);
    setTimeout(() => openCase(p, title), 180);
    return;
  }
  openWin("case", {
    conf: { title: title },
    build(body){
      let caseAnchor = null;
      const pad = document.createElement("div");
      pad.className = "c-pad";
      if (p.info){
        [["Vấn đề", p.info.VAN_DE], ["Giải pháp", p.info.GIAI_PHAP], ["Kết quả", p.info.KET_QUA]]
        .filter(r => r[1]).forEach(r => {
          const sec = document.createElement("div"); sec.className = "case-sec";
          const h = document.createElement("h5"); h.textContent = r[0].toUpperCase();
          const t = document.createElement("p"); t.textContent = r[1];
          sec.append(h, t); pad.appendChild(sec);
        });
      } else {
        const msg = document.createElement("p");
        msg.textContent = "Đang tải chi tiết dự án...";
        msg.className = "w-tip";
        pad.appendChild(msg);
        getInfo(p.name).then(info => {
          if (!info){ msg.textContent = "Dự án đang được cập nhật nội dung chi tiết."; return; }
          p.info = info;
          msg.remove();
          const gridEl = $(".case-imgs", pad);
          [["Vấn đề", info.VAN_DE], ["Giải pháp", info.GIAI_PHAP], ["Kết quả", info.KET_QUA]]
          .filter(r => r[1]).forEach(r => {
            const sec = document.createElement("div"); sec.className = "case-sec";
            const h = document.createElement("h5"); h.textContent = r[0].toUpperCase();
            const t = document.createElement("p"); t.textContent = r[1];
            sec.append(h, t); pad.insertBefore(sec, caseAnchor || gridEl);
          });
        }).catch(() => { msg.textContent = "Dự án đang được cập nhật nội dung chi tiết."; });
      }
      const grid = document.createElement("div");
      grid.className = "case-imgs";
      p.imgs.forEach((im, i) => {
        const img = document.createElement("img");
        img.loading = "lazy"; img.alt = title + " " + (i + 1);
        smartImg(img, "projects/" + p.name, im, 800);
        img.addEventListener("click", () => openLightbox(p, i));
        grid.appendChild(img);
      });
      pad.appendChild(grid);
      if (p.name === "Bot Quản Lý Chi Tiêu"){
        const botBtn = document.createElement("a");
        botBtn.className = "wbtn primary";
        botBtn.href = "https://t.me/hmh_finance_bot";
        botBtn.target = "_blank"; botBtn.rel = "noopener";
        botBtn.textContent = "MỞ BOT TRÊN TELEGRAM ▸";
        botBtn.style.display = "inline-block";
        botBtn.style.margin = "4px 0 18px";
        pad.insertBefore(botBtn, grid);
        caseAnchor = botBtn;
      } else {
        caseAnchor = grid;
      }
      body.appendChild(pad);
    }
  });
}

/* ---------- lightbox ---------- */
const lb = $("#os-lightbox"), lbImg = $("#os-lb-img");
let lbProj = null, lbIdx = 0;
function lbShow(){ smartImg(lbImg, lbProj.dirPath || ("projects/" + lbProj.name), lbProj.imgs[lbIdx], 1600); }
function openLightbox(p, i){ lbProj = p; lbIdx = i; lbShow(); lb.hidden = false; }
function closeLightbox(){ lb.hidden = true; }
function lbGo(d){ lbIdx = (lbIdx + d + lbProj.imgs.length) % lbProj.imgs.length; lbShow(); }
$("#os-lb-x").addEventListener("click", closeLightbox);
$("#os-lb-prev").addEventListener("click", () => lbGo(-1));
$("#os-lb-next").addEventListener("click", () => lbGo(1));
lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
addEventListener("keydown", e => {
  if (!lb.hidden){
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") lbGo(-1);
    if (e.key === "ArrowRight") lbGo(1);
  }
});

/* ---------- anh AI Coolmate trong cua so Ung tuyen ---------- */
const CM_SIZES = [339525,3969891,3973266,3852240,2383870,2541552,2606327];
const CM_PROJ = { name: "Coolmate", dirPath: "Coolmate",
  imgs: CM_SIZES.map((s, i) => ({ name: i + ".png", url: "Coolmate/" + i + ".png", size: s })) };
document.addEventListener("click", e => {
  const t = e.target.closest(".cm-img");
  if (t) openLightbox(CM_PROJ, +t.dataset.i);
});

/* ---------- widget phat nhac (chi ban may tinh) ---------- */
const musAu = new Audio();
musAu.preload = "auto";
musAu.volume = 0.1;
const MUS = { list: [], order: [], pos: -1, ready: false };
const MUS_PLAY_SVG = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8c0 .8.9 1.3 1.6.9l10-6.4a1.1 1.1 0 0 0 0-1.8l-10-6.4c-.7-.4-1.6.1-1.6.9z"/></svg>';
const MUS_PAUSE_SVG = '<svg viewBox="0 0 24 24"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z"/></svg>';
function musFmt(s){ s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
function musUI(){
  const t = $("#mus-title"), p = $("#mus-play"), box = $("#w-music");
  if (!t || !p || !box) return;
  if (!MUS.list.length){ t.textContent = "Chưa có bài nhạc nào"; return; }
  const cur = MUS.pos >= 0 ? MUS.list[MUS.order[MUS.pos]] : null;
  t.textContent = cur ? cur.name : "Nhạc nền";
  p.innerHTML = musAu.paused ? MUS_PLAY_SVG : MUS_PAUSE_SVG;
  box.classList.toggle("playing", !musAu.paused && MUS.pos >= 0);
}
function musPlayPos(pos){
  if (!MUS.list.length) return;
  MUS.pos = ((pos % MUS.order.length) + MUS.order.length) % MUS.order.length;
  musAu.src = MUS.list[MUS.order[MUS.pos]].url;
  musAu.play().catch(() => {});
  musUI();
}
function musicAutoStart(){ if (localStorage.getItem("hmh-music-auto") === "0") return; if (MUS.ready && MUS.list.length && MUS.pos < 0) musPlayPos(0); }
async function musInit(){
  if (!$("#w-music")) return;
  try{
    const r = await fetch("https://api.github.com/repos/" + GH.owner + "/" + GH.repo + "/git/trees/" + GH.branch + "?recursive=1");
    const d = await r.json();
    MUS.list = (d.tree || []).filter(x => x.type === "blob" && /^music\/[^/]+\.(mp3|ogg|m4a)$/i.test(x.path))
      .map(x => ({ name: x.path.split("/").pop().replace(/\.(mp3|ogg|m4a)$/i, "").replace(/[-_]+/g, " ").trim(), url: x.path.split("/").map(encodeURIComponent).join("/") }));
    MUS.order = MUS.list.map((_, i) => i);
    for (let i = MUS.order.length - 1; i > 0; i--){ const k = Math.floor(Math.random() * (i + 1)); const tmp = MUS.order[i]; MUS.order[i] = MUS.order[k]; MUS.order[k] = tmp; }
  }catch(e){}
  MUS.ready = true;
  $("#mus-prev").addEventListener("click", () => musPlayPos(MUS.pos - 1));
  $("#mus-next").addEventListener("click", () => musPlayPos(MUS.pos + 1));
  $("#mus-play").addEventListener("click", () => {
    if (!MUS.list.length) return;
    if (MUS.pos < 0) musPlayPos(0);
    else if (musAu.paused) musAu.play().catch(() => {}); else musAu.pause();
  });
  const vol = $("#mus-vol");
  if (vol) vol.addEventListener("input", () => { musAu.volume = vol.value / 100; });
  const seek = $("#mus-seek");
  seek.addEventListener("input", () => { if (musAu.duration) musAu.currentTime = seek.value / 1000 * musAu.duration; });
  musAu.addEventListener("timeupdate", () => {
    const c = $("#mus-cur"); if (c) c.textContent = musFmt(musAu.currentTime);
    if (musAu.duration) seek.value = Math.round(musAu.currentTime / musAu.duration * 1000);
  });
  musAu.addEventListener("loadedmetadata", () => { const dEl = $("#mus-dur"); if (dEl) dEl.textContent = musFmt(musAu.duration); });
  musAu.addEventListener("play", musUI);
  musAu.addEventListener("pause", musUI);
  musAu.addEventListener("ended", () => musPlayPos(MUS.pos + 1));
  musUI();
}
musInit();


/* ---------- menu qua tao (goc trai thanh menu) ---------- */
const amMenu = $("#apple-menu"), amBtn = $("#mb-apple-btn");
function amClose(){ if (amMenu) amMenu.hidden = true; if (amBtn) amBtn.classList.remove("open"); }
function amRenderRecent(){
  const box = $("#am-recent");
  if (!box) return;
  box.innerHTML = "";
  if (!RECENT_WINS.length){
    box.innerHTML = '<div class="am-empty">Chưa có ứng dụng nào</div>';
    return;
  }
  RECENT_WINS.forEach(id => {
    const b = document.createElement("button");
    b.className = "am-item";
    b.textContent = (WINCONF[id] || {}).title || id;
    b.addEventListener("click", () => { amClose(); openWin(id); });
    box.appendChild(b);
  });
}
function showRelock(){
  const rl = $("#os-relock");
  if (!rl) return;
  relockTick();
  rl.hidden = false;
  rl.classList.remove("bye");
  wpApply();
}
function hideRelock(){
  const rl = $("#os-relock");
  if (!rl || rl.hidden) return;
  rl.classList.add("bye");
  setTimeout(() => { rl.hidden = true; rl.classList.remove("bye"); }, 780);
}
const RE_DAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
function relockTick(){
  const c = $("#relock-clock"), dEl = $("#relock-date");
  if (!c || !dEl) return;
  const d = new Date();
  c.textContent = fmtHM(d);
  dEl.textContent = RE_DAYS[d.getDay()] + ", " + d.getDate() + " tháng " + (d.getMonth() + 1);
}
setInterval(relockTick, 5000);
if ($("#os-relock")) $("#os-relock").addEventListener("click", hideRelock);
if (amBtn && amMenu){
  amBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (amMenu.hidden){ amRenderRecent(); amMenu.hidden = false; amBtn.classList.add("open"); }
    else amClose();
  });
  document.addEventListener("pointerdown", e => { if (!e.target.closest("#apple-menu") && !e.target.closest("#mb-apple-btn")) amClose(); });
  addEventListener("keydown", e => { if (e.key === "Escape") amClose(); });
  amMenu.addEventListener("click", e => {
    const item = e.target.closest("[data-am]");
    if (!item) return;
    const act = item.dataset.am;
    amClose();
    if (act === "aboutmac") openWin("aboutmac");
    else if (act === "settings") openWin("settings");
    else if (act === "forcequit") [...openWins.values()].forEach(w => closeWin(w));
    else if (act === "lock") showRelock();
    else if (act === "sleep"){
      const dim = $("#os-dim");
      dim.hidden = false;
      requestAnimationFrame(() => dim.classList.add("on"));
      setTimeout(() => { showRelock(); dim.classList.remove("on"); setTimeout(() => { dim.hidden = true; }, 400); }, 1300);
    }
    else if (act === "restart") location.reload();
    else if (act === "shutdown"){ try{ musAu.pause(); }catch(e){} $("#os-off").hidden = false; }
  });
}
if ($("#os-off")) $("#os-off").addEventListener("click", () => location.reload());

/* ---------- cua so Cai dat he thong ---------- */
function initSettings(body){
  const root = document.documentElement;
  const mark = (boxId, val) => $$("#" + boxId + " button", body).forEach(b => b.classList.toggle("on", b.dataset.v === val));
  const curTheme = () => root.dataset.osTheme === "light" ? "light" : "dark";
  const curWp = () => localStorage.getItem("hmh-os-wp") || "auto";
  mark("set-theme", curTheme());
  mark("set-wp", curWp());
  $("#set-theme", body).addEventListener("click", e => {
    const b = e.target.closest("button[data-v]"); if (!b) return;
    root.dataset.osTheme = b.dataset.v;
    localStorage.setItem("hmh-os-theme", b.dataset.v);
    mark("set-theme", b.dataset.v);
  });
  $("#set-wp", body).addEventListener("click", e => {
    const b = e.target.closest("button[data-v]"); if (!b) return;
    if (b.dataset.v === "auto") localStorage.removeItem("hmh-os-wp");
    else localStorage.setItem("hmh-os-wp", b.dataset.v);
    wpApply();
    mark("set-wp", b.dataset.v);
  });
  const curClock = () => localStorage.getItem("hmh-clock-24h") === "0" ? "12" : "24";
  mark("set-clock", curClock());
  $("#set-clock", body).addEventListener("click", e => {
    const b = e.target.closest("button[data-v]"); if (!b) return;
    if (b.dataset.v === "12") localStorage.setItem("hmh-clock-24h", "0");
    else localStorage.removeItem("hmh-clock-24h");
    mark("set-clock", b.dataset.v);
  });
  const mus = $("#set-music", body);
  mus.checked = localStorage.getItem("hmh-music-auto") !== "0";
  mus.addEventListener("change", () => localStorage.setItem("hmh-music-auto", mus.checked ? "1" : "0"));
}


/* ---------- Spotlight: tim ung dung va du an ---------- */
const SPOT_APPS = [
  ["welcome", "Xin chào"], ["about", "Hồ sơ — Hoàng Hùng"], ["skills", "Kỹ năng"],
  ["journey", "Hành trình"], ["why", "Ứng tuyển Coolmate"], ["projects", "Dự án"],
  ["cv", "CV — Hoàng Hùng"], ["contact", "Liên hệ"], ["terminal", "Terminal"],
  ["settings", "Cài đặt hệ thống"], ["aboutmac", "Giới thiệu về máy này"], ["trash", "Thùng rác"]
];
const spotEl = $("#spotlight"), spotIn = $("#spot-input"), spotList = $("#spot-list");
let spotItems = [], spotSel = 0;
function spotNorm(s){ return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); }
function spotSources(){
  const out = SPOT_APPS.map(([id, name]) => ({ name, kind: "Ứng dụng", act: () => openWin(id) }));
  (HMH_PROJECTS || []).forEach(p => {
    const title = (p.info && p.info.TEN) || p.name.replace(/[-_]+/g, " ");
    out.push({ name: title, kind: "Dự án", act: () => openCase(p, title) });
  });
  return out;
}
function spotRender(q){
  const nq = spotNorm(q.trim());
  spotItems = spotSources().filter(x => !nq || spotNorm(x.name).includes(nq)).slice(0, 9);
  spotSel = 0;
  spotList.innerHTML = "";
  if (!spotItems.length){
    spotList.innerHTML = '<div class="spot-empty">Không tìm thấy kết quả nào.</div>';
    return;
  }
  spotItems.forEach((x, i) => {
    const b = document.createElement("button");
    b.className = "spot-item" + (i === spotSel ? " sel" : "");
    const nm = document.createElement("span"); nm.textContent = x.name;
    const kd = document.createElement("small"); kd.textContent = x.kind;
    b.append(nm, kd);
    b.addEventListener("click", () => { spotClose(); x.act(); });
    spotList.appendChild(b);
  });
}
function spotMark(){
  $$(".spot-item", spotList).forEach((el, i) => el.classList.toggle("sel", i === spotSel));
}
function spotOpen(){
  if (!spotEl) return;
  spotEl.hidden = false;
  spotIn.value = "";
  spotRender("");
  setTimeout(() => spotIn.focus(), 30);
}
function spotClose(){ if (spotEl) spotEl.hidden = true; }
if (spotEl){
  spotIn.addEventListener("input", () => spotRender(spotIn.value));
  spotIn.addEventListener("keydown", e => {
    if (e.key === "ArrowDown"){ e.preventDefault(); spotSel = Math.min(spotSel + 1, spotItems.length - 1); spotMark(); }
    else if (e.key === "ArrowUp"){ e.preventDefault(); spotSel = Math.max(spotSel - 1, 0); spotMark(); }
    else if (e.key === "Enter"){ const x = spotItems[spotSel]; if (x){ spotClose(); x.act(); } }
    else if (e.key === "Escape") spotClose();
  });
  spotEl.addEventListener("pointerdown", e => { if (e.target === spotEl) spotClose(); });
}
if ($("#mb-spot")) $("#mb-spot").addEventListener("click", spotOpen);

/* ---------- lịch tháng (dung chung widget va bang ngay gio) ---------- */
function buildCalHTML(){
  const now = new Date(), y = now.getFullYear(), m = now.getMonth(), today = now.getDate();
  const first = (new Date(y, m, 1).getDay() + 6) % 7; // thứ Hai = 0
  const days = new Date(y, m + 1, 0).getDate();
  const prevDays = new Date(y, m, 0).getDate();
  let cells = "";
  ["T2", "T3", "T4", "T5", "T6", "T7", "CN"].forEach(d => cells += "<i>" + d + "</i>");
  for (let i = 0; i < first; i++) cells += "<b class='dim'>" + (prevDays - first + 1 + i) + "</b>";
  for (let d = 1; d <= days; d++) cells += "<b class='" + (d === today ? "today" : "") + "'>" + d + "</b>";
  const tail = (7 - (first + days) % 7) % 7;
  for (let d = 1; d <= tail; d++) cells += "<b class='dim'>" + d + "</b>";
  return "<div class='cal-head'><b>Tháng " + (m + 1) + " " + y + "</b><span>Hôm nay: " + today + "/" + (m + 1) + "</span></div>" +
    "<div class='cal-grid'>" + cells + "</div>";
}
(function(){
  const el = $("#w-cal");
  if (el) el.innerHTML = buildCalHTML();
})();

/* ---------- bang ngay gio (bam vao ngay gio tren thanh menu) ---------- */
const ncPanel = $("#nc-panel"), mbClockBtn = $("#mb-clock");
function ncClose(){ if (ncPanel) ncPanel.hidden = true; }
if (mbClockBtn && ncPanel){
  mbClockBtn.addEventListener("click", e => {
    e.stopPropagation();
    if (ncPanel.hidden){ $("#ncp-cal").innerHTML = buildCalHTML(); ncPanel.hidden = false; }
    else ncClose();
  });
  document.addEventListener("pointerdown", e => { if (!e.target.closest("#nc-panel") && !e.target.closest("#mb-clock")) ncClose(); });
  addEventListener("keydown", e => { if (e.key === "Escape") ncClose(); });
}

/* ---------- widget thời tiết (dữ liệu thật, Open-Meteo) ---------- */
(function(){
  const WMO = { 0: ["Trời quang", "☀️"], 1: ["Ít mây", "🌤️"], 2: ["Nhiều mây", "⛅"], 3: ["Âm u", "☁️"],
    45: ["Sương mù", "🌫️"], 48: ["Sương mù", "🌫️"], 51: ["Mưa phùn nhẹ", "🌦️"], 53: ["Mưa phùn", "🌦️"],
    55: ["Mưa phùn", "🌦️"], 61: ["Mưa nhẹ", "🌧️"], 63: ["Mưa vừa", "🌧️"], 65: ["Mưa to", "🌧️"],
    71: ["Tuyết nhẹ", "🌨️"], 73: ["Có tuyết", "🌨️"], 75: ["Tuyết dày", "🌨️"], 80: ["Mưa rào nhẹ", "🌦️"],
    81: ["Mưa rào", "🌧️"], 82: ["Mưa rào lớn", "⛈️"], 95: ["Có dông", "⛈️"], 96: ["Dông, mưa đá", "⛈️"], 99: ["Dông, mưa đá", "⛈️"] };
  let lastPos = { lat: 21.0285, lon: 105.8542, label: "Hà Nội" };
  async function loadWeather(){
    const { lat, lon, label } = lastPos;
    try{
      const u = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon +
        "&current=temperature_2m,weather_code,is_day" +
        "&hourly=temperature_2m,weather_code&forecast_days=2" +
        "&daily=temperature_2m_max,temperature_2m_min&timezone=auto";
      const r = await fetch(u);
      if (!r.ok) throw new Error("wx");
      const j = await r.json();
      const cur = j.current, info = WMO[cur.weather_code] || ["—", "⛅"];
      $("#ww-icon").textContent = info[1];
      $("#ww-temp").textContent = Math.round(cur.temperature_2m) + "°";
      $("#ww-cond").textContent = info[0];
      $("#ww-loc").textContent = label;
      $("#ww-hl").innerHTML = "H:" + Math.round(j.daily.temperature_2m_max[0]) + "°<br>L:" + Math.round(j.daily.temperature_2m_min[0]) + "°";
      const code = cur.weather_code;
      const grp = code <= 1 ? (cur.is_day ? "clear" : "clear-night") :
        (code === 71 || code === 73 || code === 75) ? "snow" :
        (code >= 95) ? "storm" :
        (code >= 51) ? "rain" : "cloudy";
      $("#w-wx").dataset.wx = grp;
      const times = j.hourly.time, temps = j.hourly.temperature_2m, codes = j.hourly.weather_code;
      const nowD = new Date();
      let hi = times.findIndex(t => { const tt = new Date(t); return tt.getHours() === nowD.getHours() && tt.getDate() === nowD.getDate(); });
      if (hi < 0) hi = 0;
      let hh = "";
      for (let k = 0; k < 8 && hi + k < times.length; k++){
        const t = new Date(times[hi + k]);
        const wmi = WMO[codes[hi + k]] || ["—", "⛅"];
        let lab;
        if (localStorage.getItem("hmh-clock-24h") === "0"){
          lab = (t.getHours() % 12 || 12) + (t.getHours() >= 12 ? " PM" : " AM");
        } else lab = t.getHours() + "h";
        hh += '<div class="wx-h"><span>' + (k === 0 ? "Bây giờ" : lab) + '</span><i>' + wmi[1] + '</i><b>' + Math.round(temps[hi + k]) + '°</b></div>';
      }
      $("#ww-hours").innerHTML = hh;
    }catch(e){
      $("#ww-cond").textContent = "Chưa tải được thời tiết";
    }
  }
  loadWeather();
  setInterval(loadWeather, 30 * 60 * 1000);
  function ipFallback(){
    fetch("https://ipapi.co/json/").then(r => r.json()).then(j => {
      if (j && j.latitude && j.longitude){
        lastPos = { lat: (+j.latitude).toFixed(4), lon: (+j.longitude).toFixed(4), label: j.city || lastPos.label };
        loadWeather();
      }
    }).catch(() => {});
  }
  function askGeo(){
    if (!navigator.geolocation){ ipFallback(); return; }
    navigator.geolocation.getCurrentPosition(async pos => {
      lastPos = { lat: pos.coords.latitude.toFixed(4), lon: pos.coords.longitude.toFixed(4), label: "Vị trí của bạn" };
      try{
        const r = await fetch("https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" +
          lastPos.lat + "&longitude=" + lastPos.lon + "&localityLanguage=vi");
        const j = await r.json();
        const name = j.city || j.locality || j.principalSubdivision;
        if (name) lastPos.label = name;
      }catch(e){}
      loadWeather();
    }, () => ipFallback(), { timeout: 7000, maximumAge: 600000 });
  }
  window.HMH_askGeo = askGeo;
  askGeo();
})();

/* phím tắt: cmd/ctrl + k mở Spotlight */
addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){
    e.preventDefault();
    if (!$("#os-desk").hidden) spotOpen();
  }
});

/* CV ban OS goi mo thu muc Du an (nut "Xem day du tai portfolio" trong cv-os.html) */
window.addEventListener("message", function (e) {
  if (e.data && e.data.hmhOS === "open-projects") openWin("projects");
});

/* ---------- thu muc rieng Bot Quan Ly Chi Tieu tren desktop ---------- */
async function openBotCase(){
  const DIR = "Bot Quản Lý Chi Tiêu";
  try{
    let projects = null;
    try{
      const c = JSON.parse(localStorage.getItem("hh-projects-v2") || "null");
      if (c && Date.now() - c.t < 15 * 60 * 1000 && c.projects && c.projects.length) projects = c.projects;
    }catch(e){}
    if (!projects){
      const r = await fetch("https://api.github.com/repos/" + GH.owner + "/" + GH.repo + "/git/trees/" + GH.branch + "?recursive=1");
      if (!r.ok) return;
      const t = await r.json();
      const map = {};
      (t.tree || []).forEach(en => {
        if (en.type !== "blob") return;
        const m = en.path.match(/^projects\/([^/]+)\/(.+)$/);
        if (!m || /^[._]/.test(m[1]) || !IMG_RE.test(m[2])) return;
        (map[m[1]] = map[m[1]] || []).push({ name: m[2], size: en.size || 0,
          url: rawUrl("projects/" + encodeURIComponent(m[1]) + "/" + encodeURIComponent(m[2])) });
      });
      projects = Object.keys(map).map(dir => ({ name: dir, info: null,
        imgs: map[dir].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })) })).filter(x => x.imgs.length);
    }
    const p = projects.find(x => x.name === DIR);
    if (!p) return;
    if (!p.info) p.info = await getInfo(DIR);
    openCase(p, (p.info && p.info.TEN) || DIR);
  }catch(e){}
}
$$("[data-botcase]").forEach(b => {
  let last = 0;
  const tap = () => { const n = Date.now(); if (n - last < 700) return; last = n; openBotCase(); };
  b.addEventListener("click", tap);
  b.addEventListener("pointerup", tap);
});

/* Sap xep thu muc tren man hinh theo bang chu cai (bo dau khi so sanh) */
(function(){
  const nav = document.getElementById("desk-icons");
  if (!nav) return;
  const key = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
  [...nav.querySelectorAll(".dicon")].sort((a, b) =>
    key(a.querySelector("span").textContent).localeCompare(key(b.querySelector("span").textContent))
  ).forEach(el => nav.appendChild(el));
})();

/* Khoa vuot doc lop ngoai tren dien thoai: chi cho cuon trong cua so, dock va cac vung cuon rieng */
document.addEventListener("touchmove", function(e){
  if (!e.target.closest(".win-body, .win-bar, #dock, .wx-hours, #spotlight, input, textarea, select")) e.preventDefault();
}, { passive: false });
