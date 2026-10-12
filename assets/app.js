/* ============ HOÀNG HÙNG // SYS.PORTFOLIO v11 ============ */
"use strict";

/* ---------- theme: sáng/tối tự động + đổi tay ---------- */
(function theme(){
  const root = document.documentElement;
  const btn = document.getElementById("themeBtn");
  const saved = localStorage.getItem("hh-theme");
  root.dataset.theme = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  btn.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("hh-theme", root.dataset.theme);
  });
})();

/* ---------- luôn về đầu trang khi tải lại ---------- */
addEventListener("load", () => setTimeout(() => window.scrollTo(0, 0), 0));

/* ---------- boot sequence: hiệu ứng + âm thanh tech ---------- */
(function(){
  const log = document.getElementById("boot-log");
  const fill = document.getElementById("boot-fill");
  const boot = document.getElementById("boot");
  let AC = null;
  function beep(freq, dur, type, vol, delay){
    try{
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === "suspended") AC.resume();
      const t = AC.currentTime + (delay || 0);
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type || "square";
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.035, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.07));
      o.connect(g); g.connect(AC.destination);
      o.start(t); o.stop(t + (dur || 0.07) + 0.05);
    }catch(e){}
  }
  const lines = [
    "> đang khởi động portfolio.sys ...",
    "> tải mô-đun [████████] xong",
    "> kết nối designer ... xong",
    "> dựng giao diện ... xong",
    "> chào mừng bạn 👋"
  ];
  let i = 0;
  const t = setInterval(() => {
    if (i < lines.length){
      log.textContent = lines[i];
      fill.style.width = ((i + 1) / lines.length * 100) + "%";
      beep(520 + i * 90, 0.06, "square", 0.035);
      i++;
    } else {
      clearInterval(t);
      beep(880, 0.09, "sine", 0.05);
      beep(1318, 0.16, "sine", 0.05, 0.1);
      boot.classList.add("flash");
      setTimeout(() => { boot.classList.remove("flash"); boot.classList.add("done"); }, 220);
    }
  }, 220);
})();

/* ---------- background: particle network (desktop only) ---------- */
(function(){
  if (innerWidth < 900 || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const c = document.getElementById("bg-canvas");
  const ctx = c.getContext("2d");
  const dark = () => document.documentElement.dataset.theme !== "light";
  let W, H, pts;
  function resize(){
    W = c.width = innerWidth; H = c.height = innerHeight;
    const n = Math.min(80, Math.floor(W * H / 20000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
      r: Math.random() * 1.6 + .4
    }));
  }
  resize(); addEventListener("resize", resize);
  (function tick(){
    ctx.clearRect(0, 0, W, H);
    const col = dark() ? "0,229,255" : "0,136,190";
    ctx.strokeStyle = `rgba(${col},.05)`; ctx.lineWidth = 1;
    const g = 56; ctx.beginPath();
    for (let x = 0; x < W; x += g){ ctx.moveTo(x, 0); ctx.lineTo(x, H); }
    for (let y = 0; y < H; y += g){ ctx.moveTo(0, y); ctx.lineTo(W, y); }
    ctx.stroke();
    for (const p of pts){
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.fillStyle = `rgba(${col},.5)`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7); ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++){
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130){
        ctx.strokeStyle = `rgba(${col},${(1 - d / 130) * .14})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    requestAnimationFrame(tick);
  })();
})();

/* ---------- cursor glow ---------- */
(function(){
  if (matchMedia("(pointer: coarse)").matches) return;
  const g = document.getElementById("cursor-glow");
  addEventListener("mousemove", e => {
    g.style.left = e.clientX + "px";
    g.style.top = e.clientY + "px";
  });
})();

/* ---------- typing: hero-sub (chỉ đổi chiều rộng, không nhảy layout) ---------- */
(function(){
  const el = document.getElementById("typed");
  const words = ["Thiết kế F&B — 7 năm kinh nghiệm", "3.000+ chủ quán đồng hành", "Đọc hiểu code · Vận dụng AI", "Rành mạng & xử lý sự cố máy tính"];
  if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches){
    if (el) el.textContent = words[0];
    return;
  }
  let w = 0, i = 0, del = false;
  (function tick(){
    const word = words[w];
    el.textContent = word.slice(0, i);
    if (!del && i < word.length){ i++; setTimeout(tick, 55); }
    else if (!del){ del = true; setTimeout(tick, 1700); }
    else if (i > 0){ i--; setTimeout(tick, 28); }
    else { del = false; w = (w + 1) % words.length; setTimeout(tick, 450); }
  })();
})();

/* ---------- clock ---------- */
(function(){
  const el = document.getElementById("clock");
  if (!el) return;
  (function t(){
    const d = new Date();
    el.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map(n => String(n).padStart(2, "0")).join(":");
    setTimeout(t, 1000);
  })();
})();

/* ---------- reveal + counters + bars ---------- */
(function(){
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add("on");
    el.querySelectorAll("[data-count]").forEach(runCount);
    el.querySelectorAll(".bar i").forEach(b => b.style.width = b.dataset.w + "%");
    io.unobserve(el);
  }), { threshold: .15 });
  document.querySelectorAll(".rv").forEach(el => io.observe(el));
  function runCount(el){
    if (el.dataset.done) return;
    el.dataset.done = 1;
    const target = +el.dataset.count, t0 = performance.now(), dur = 1400;
    (function step(t){
      const k = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))).toLocaleString("vi-VN");
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
})();

/* ---------- nav active ---------- */
(function(){
  const links = [...document.querySelectorAll(".nav-links a")];
  const secs = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){
      links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    }
  }), { rootMargin: "-40% 0px -55% 0px" });
  secs.forEach(s => io.observe(s));
})();

document.getElementById("yr") && (document.getElementById("yr").textContent = new Date().getFullYear());

/* ---------- nén ảnh: file >400KB tự qua proxy resize, lỗi thì về gốc ---------- */
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

/* ---------- dự án: tự tải từ folder GitHub ---------- */
const GH = { owner: "Masterhmh", repo: "Portfolio", branch: "main", dir: "projects" };
const api = p => `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${p}?ref=${GH.branch}`;
const raw = p => `https://raw.githubusercontent.com/${GH.owner}/${GH.repo}/${GH.branch}/${p}`;
const IMG = /\.(jpe?g|png|webp|gif|svg)$/i;

async function getInfo(dir){
  try{
    const r = await fetch(raw(`${GH.dir}/${encodeURIComponent(dir)}/info.txt`));
    if (!r.ok) return null;
    const m = {};
    (await r.text()).split(/\r?\n/).forEach(line => {
      const mm = line.match(/^(TEN|VAN_DE|GIAI_PHAP|KET_QUA)\s*:\s*(.+)$/);
      if (mm) m[mm[1]] = mm[2].trim();
    });
    return (m.VAN_DE || m.GIAI_PHAP || m.KET_QUA) ? m : null;
  }catch(e){ return null; }
}

async function fetchJson(url){
  const r = await fetch(url);
  if (!r.ok) throw new Error("HTTP " + r.status);
  return r.json();
}

async function loadProjects(){
  const grid = document.getElementById("proj-grid");
  const empty = document.getElementById("proj-empty");
  const errBox = document.getElementById("proj-error");
  const CACHE_KEY = "hh-projects-v2", TTL = 15 * 60 * 1000;

  function card(p, i, rio){
    const title = (p.info && p.info.TEN) || p.name.replace(/[-_]+/g, " ");
    const el = document.createElement("article");
    el.className = "proj rv";
    el.style.setProperty("--d", (i % 3 * 0.08) + "s");
    const top = document.createElement("div");
    top.className = "proj-top";
    const img = document.createElement("img");
    img.loading = "lazy"; img.alt = title;
    smartImg(img, p.name, p.imgs[0], 800);
    const ov = document.createElement("div"); ov.className = "ov";
    top.append(img, ov);
    const body = document.createElement("div");
    body.className = "proj-body";
    const h = document.createElement("h3"); h.textContent = title;
    const d = document.createElement("p");
    d.textContent = (p.info && p.info.VAN_DE) || "Bấm để xem ảnh và chi tiết dự án.";
    const link = document.createElement("span");
    link.className = "proj-link"; link.textContent = p.info ? "mở_chi_tiết ▸" : "xem_ảnh ▸";
    body.append(h, d, link);
    el.append(top, body);
    el.addEventListener("click", () => openModal(p, title));
    grid.appendChild(el);
    rio.observe(el);
    return { el, d, link, h };
  }

  function render(projects){
    grid.innerHTML = "";
    const rio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting){ e.target.classList.add("on"); rio.unobserve(e.target); }
    }), { threshold: .1 });
    const refs = projects.map((p, i) => Object.assign(card(p, i, rio), { p }));
    // tải case study nền: có thì cập nhật thẻ, không thì thôi
    refs.forEach(({ p, d, link, h }) => {
      getInfo(p.name).then(info => {
        if (!info) return;
        p.info = info;
        if (info.TEN) h.textContent = info.TEN;
        if (info.VAN_DE) d.textContent = info.VAN_DE;
        link.textContent = "mở_chi_tiết ▸";
      }).catch(() => {});
    });
  }

  async function fetchFresh(){
    // 1 request duy nhất: toàn bộ cây file qua git trees API
    const t = await fetchJson(`https://api.github.com/repos/${GH.owner}/${GH.repo}/git/trees/${GH.branch}?recursive=1`);
    if (t.truncated) throw new Error("tree truncated");
    const map = {};
    (t.tree || []).forEach(e => {
      if (e.type !== "blob") return;
      const m = e.path.match(/^projects\/([^/]+)\/(.+)$/);
      if (!m || /^[._]/.test(m[1]) || !IMG.test(m[2])) return;
      (map[m[1]] = map[m[1]] || []).push({
        name: m[2], size: e.size || 0,
        url: raw(`projects/${encodeURIComponent(m[1])}/${encodeURIComponent(m[2])}`)
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
    errBox.hidden = true; empty.hidden = true;
    try{
      const fresh = await fetchFresh();
      if (fresh.length){ render(fresh); return; }
      const cached = readCache();
      if (cached) render(cached); else empty.hidden = false;
    }catch(e){
      const cached = readCache();
      if (cached) render(cached); else errBox.hidden = false;
    }
  }

  const retry = document.getElementById("proj-retry");
  if (retry) retry.addEventListener("click", boot);
  boot();
}

/* ---------- modal case study ---------- */
const modal = document.getElementById("modal");
const mTitle = document.getElementById("mTitle");
const mCase = document.getElementById("mCase");
const mBody = document.getElementById("mBody");
function openModal(p, title){
  mTitle.textContent = title;
  mCase.innerHTML = "";
  if (p.info){
    const box = document.createElement("div");
    box.className = "case";
    [["Vấn đề", p.info.VAN_DE], ["Giải pháp", p.info.GIAI_PHAP], ["Kết quả", p.info.KET_QUA]]
      .filter(r => r[1]).forEach(r => {
        const row = document.createElement("div"); row.className = "case-row";
        const k = document.createElement("span"); k.className = "case-k"; k.textContent = r[0];
        const v = document.createElement("span"); v.className = "case-v"; v.textContent = r[1];
        row.append(k, v); box.append(row);
      });
    mCase.append(box);
  }
  mBody.innerHTML = "";
  p.imgs.forEach((im, i) => {
    const img = document.createElement("img");
    smartImg(img, p.name, im, 1600);
    img.loading = "lazy"; img.alt = title + " " + (i + 1);
    img.addEventListener("click", () => openLightbox(p, i));
    mBody.appendChild(img);
  });
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal(){
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
document.getElementById("mClose").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

/* ---------- lightbox ---------- */
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
let lbList = [], lbIdx = 0;
let lbProj = null;
function lbShow(){ const im = lbProj.imgs[lbIdx]; smartImg(lbImg, lbProj.name, im, 1600); }
function openLightbox(p, i){
  lbProj = p; lbIdx = i; lbShow();
  lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
}
function closeLightbox(){ lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); }
function lbGo(d){ lbIdx = (lbIdx + d + lbProj.imgs.length) % lbProj.imgs.length; lbShow(); }
document.getElementById("lbClose").addEventListener("click", closeLightbox);
document.getElementById("lbPrev").addEventListener("click", e => { e.stopPropagation(); lbGo(-1); });
document.getElementById("lbNext").addEventListener("click", e => { e.stopPropagation(); lbGo(1); });
lb.addEventListener("click", e => { if (e.target === lb) closeLightbox(); });
addEventListener("keydown", e => {
  if (e.key === "Escape"){ closeModal(); closeLightbox(); }
  if (lb.classList.contains("open")){
    if (e.key === "ArrowLeft") lbGo(-1);
    if (e.key === "ArrowRight") lbGo(1);
  }
});

loadProjects();

/* ---------- terminal tương tác: gõ lệnh thật (chỉ desktop có chuột) ---------- */
(function(){
  var live = document.getElementById("termLive");
  if (!live) return;
  // điện thoại/màn hình cảm ứng tự tắt — mở bàn phím ảo để gõ lệnh rất bất tiện
  if (!matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  if (matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  var idle = document.getElementById("termIdle");
  var out = document.getElementById("termOut");
  var input = document.getElementById("termIn");
  var hint = document.getElementById("termHint");
  var body = live.closest(".term-body");
  idle.hidden = true; live.hidden = false; hint.hidden = false;

  function esc(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
  function print(html, cls){
    var d = document.createElement("div");
    if (cls) d.className = cls;
    d.innerHTML = html;
    out.appendChild(d);
    body.scrollTop = body.scrollHeight;
  }
  var CMDS = {
    help: function(){
      return '<span class="t-cyan">Các lệnh có thể dùng:</span><br>' +
        '&nbsp;&nbsp;<span class="t-green">whoami</span> — mình là ai<br>' +
        '&nbsp;&nbsp;<span class="t-green">projects</span> — xem các dự án<br>' +
        '&nbsp;&nbsp;<span class="t-green">contact</span> — thông tin liên hệ<br>' +
        '&nbsp;&nbsp;<span class="t-green">cv</span> — mở trang CV<br>' +
        '&nbsp;&nbsp;<span class="t-green">clear</span> — xóa màn hình';
    },
    whoami: function(){
      return 'Hoàng Hùng — designer đồ họa đa mảng × kỹ thuật.<br>10+ năm thực chiến, mạnh nhất F&B (7+ năm), hiện phụ trách mảng 2D tại Namas.';
    },
    projects: function(){
      return 'Kéo xuống mục <span class="t-cyan">DỰ ÁN TIÊU BIỂU</span> để xem các dự án — bấm vào từng dự án để xem ảnh và chi tiết.';
    },
    contact: function(){
      return 'SĐT: <span class="t-amber">0964.843.943</span><br>Email: <span class="t-amber">masterhmh@gmail.com</span><br>Facebook: <span class="t-amber">facebook.com/masterhmh</span>';
    },
    cv: function(){ location.href = "cv.html"; return ""; }
  };
  print('Gõ <span class="t-cyan">help</span> rồi nhấn Enter để bắt đầu.', "t-dim");
  live.addEventListener("click", function(){ input.focus(); });
  input.addEventListener("keydown", function(e){
    if (e.key !== "Enter") return;
    var raw = input.value.trim();
    input.value = "";
    print('<span class="t-green">➜</span> <span class="t-cyan">~</span> ' + esc(raw));
    if (!raw) return;
    var cmd = raw.toLowerCase().split(/\s+/)[0];
    if (cmd === "clear"){ out.innerHTML = ""; return; }
    var fn = CMDS[cmd];
    if (fn){ var r = fn(); if (r) print(r); }
    else print('<span class="t-mag">Không có lệnh "' + esc(raw) + '".</span> Gõ <span class="t-cyan">help</span> để xem các lệnh.');
  });
})();
