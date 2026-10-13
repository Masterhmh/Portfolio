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

/* ---------- đồng hồ ---------- */
(function(){
  const DAYS = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const DAYS_S = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
  function tick(){
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, "0"), mm = String(d.getMinutes()).padStart(2, "0"),
          ss = String(d.getSeconds()).padStart(2, "0");
    const lockC = $("#lock-clock"), lockD = $("#lock-date");
    if (lockC) lockC.textContent = hh + ":" + mm;
    if (lockD) lockD.textContent = DAYS[d.getDay()] + ", " + d.getDate() + " tháng " + (d.getMonth() + 1);
    const mb = $("#mb-clock");
    if (mb) mb.textContent = DAYS_S[d.getDay()] + " " + d.getDate() + " thg " + (d.getMonth() + 1) + "  " + hh + ":" + mm + ":" + ss;
    const wt = $("#w-time"), wd = $("#w-date");
    if (wt) wt.textContent = hh + ":" + mm;
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
    setTimeout(() => { lock.remove(); openWin("welcome"); }, 420);
  }
  lock.addEventListener("click", e => { if (e.target.closest("a")) return; enter(); });
  addEventListener("keydown", e => { if (!lock.hidden && (e.key === "Enter" || e.key === " ")) enter(); });
})();

/* ---------- quản lý cửa sổ ---------- */
const winsEl = $("#wins");
let zTop = 20, cascade = 0;
const WINCONF = {
  welcome:  { title: "Xin chào", w: 580, h: 600 },
  about:    { title: "Hồ sơ — Hoàng Hùng", w: 700, h: 610 },
  skills:   { title: "Kỹ năng", w: 660, h: 640 },
  journey:  { title: "Hành trình", w: 640, h: 580 },
  why:      { title: "Vì sao chọn tôi", w: 880, h: 660 },
  projects: { title: "Dự án", w: 920, h: 640 },
  cv:       { title: "CV — Hoàng Hùng", w: 620, h: 500 },
  contact:  { title: "Liên hệ", w: 520, h: 540 },
  terminal: { title: "Terminal — hmh", w: 640, h: 450 },
  case:     { title: "Dự án", w: 780, h: 660 }
};
const openWins = new Map();

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
  winsEl.appendChild(win);
  openWins.set(id, win);
  focusWin(win);
  requestAnimationFrame(() => requestAnimationFrame(() => win.classList.add("show")));
  if (isMobile()) win.classList.add("max");
  wireWin(win, bar);
  dockDots();
  if (id === "skills") setTimeout(() => $$(".sbar i", body).forEach(b => b.style.width = b.dataset.w + "%"), 220);
  if (id === "projects") initProjects(body);
  if (id === "terminal") initTerm(body);
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
    "vi-sao": "why", "why": "why", "lien-he": "contact", "contact": "contact", "cv": "cv", "chao": "welcome" };
  if (cmd === "clear"){ termOut.innerHTML = ""; return; }
  if (cmd === "help"){
    tPrint("<span class='cyn'>Các lệnh có thể dùng:</span>\n" +
      "  <span class='grn'>whoami</span>   — mình là ai\n" +
      "  <span class='grn'>ls</span>       — xem các thư mục trên máy\n" +
      "  <span class='grn'>open</span> du-an | ho-so | ky-nang | vi-sao | lien-he — mở cửa sổ\n" +
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
                  "/projects/" + dir + "/" + name;
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
function initProjects(body){
  const grid = $("#os-proj-grid", body), empty = $("#os-proj-empty", body),
        errBox = $("#os-proj-error", body), loading = $("#os-proj-loading", body),
        search = $("#finder-search", body);
  const CACHE_KEY = "hh-projects-v2", TTL = 15 * 60 * 1000;
  let allProjects = [];
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    $$(".pcard", grid).forEach(c =>
      c.style.display = c.dataset.name.toLowerCase().includes(q) ? "" : "none");
  });
  function render(projects){
    allProjects = projects;
    grid.innerHTML = "";
    loading.hidden = true;
    projects.forEach(p => {
      const title = p.name.replace(/[-_]+/g, " ");
      const el = document.createElement("button");
      el.className = "pcard"; el.dataset.name = title;
      const img = document.createElement("img");
      img.loading = "lazy"; img.alt = title;
      smartImg(img, p.name, p.imgs[0], 800);
      const pb = document.createElement("div"); pb.className = "pb";
      const h = document.createElement("h4"); h.textContent = title;
      const d = document.createElement("p"); d.textContent = "Bấm để xem chi tiết";
      pb.append(h, d); el.append(img, pb);
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
            sec.append(h, t); pad.insertBefore(sec, gridEl);
          });
        }).catch(() => { msg.textContent = "Dự án đang được cập nhật nội dung chi tiết."; });
      }
      const grid = document.createElement("div");
      grid.className = "case-imgs";
      p.imgs.forEach((im, i) => {
        const img = document.createElement("img");
        img.loading = "lazy"; img.alt = title + " " + (i + 1);
        smartImg(img, p.name, im, 800);
        img.addEventListener("click", () => openLightbox(p, i));
        grid.appendChild(img);
      });
      pad.appendChild(grid);
      body.appendChild(pad);
    }
  });
}

/* ---------- lightbox ---------- */
const lb = $("#os-lightbox"), lbImg = $("#os-lb-img");
let lbProj = null, lbIdx = 0;
function lbShow(){ smartImg(lbImg, lbProj.name, lbProj.imgs[lbIdx], 1600); }
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

/* phím tắt: gõ cmd/ctrl + k mở terminal */
addEventListener("keydown", e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){
    e.preventDefault();
    if (!$("#os-desk").hidden) openWin("terminal");
  }
});
