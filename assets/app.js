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

/* ---------- boot sequence ---------- */
(function(){
  const log = document.getElementById("boot-log");
  const fill = document.getElementById("boot-fill");
  const boot = document.getElementById("boot");
  const lines = [
    "> initializing portfolio.sys ...",
    "> loading modules [████████] OK",
    "> connecting designer uplink ... OK",
    "> rendering interface ... OK",
    "> welcome, guest 👋"
  ];
  let i = 0;
  const t = setInterval(() => {
    if (i < lines.length){
      log.textContent = lines[i];
      fill.style.width = ((i + 1) / lines.length * 100) + "%";
      i++;
    } else {
      clearInterval(t);
      setTimeout(() => boot.classList.add("done"), 350);
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
  const words = ["Designer F&B — 7 năm kinh nghiệm", "3.000+ chủ quán đồng hành", "Biết code · Vận dụng AI"];
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

/* ---------- dự án: tự tải từ folder GitHub ---------- */
const GH = { owner: "Masterhmh", repo: "Portfolio", branch: "main", dir: "projects" };
const api = p => `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${p}?ref=${GH.branch}`;
const raw = p => `https://raw.githubusercontent.com/${GH.owner}/${GH.repo}/${GH.branch}/${p}`;
const IMG = /\.(jpe?g|png|webp|gif)$/i;

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

async function loadProjects(){
  const grid = document.getElementById("proj-grid");
  const empty = document.getElementById("proj-empty");
  let dirs = [];
  try{
    const r = await fetch(api(GH.dir));
    if (!r.ok) throw 0;
    dirs = (await r.json()).filter(d => d.type === "dir" && !/^[._]/.test(d.name));
  }catch(e){ empty.hidden = false; return; }
  if (!dirs.length){ empty.hidden = false; return; }

  const jobs = dirs.map(async d => {
    let files = [];
    try{
      const r = await fetch(api(`${GH.dir}/${encodeURIComponent(d.name)}`));
      if (r.ok) files = (await r.json()).filter(f => f.type === "file" && IMG.test(f.name));
    }catch(e){}
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    const imgs = files.map(f => raw(`${GH.dir}/${encodeURIComponent(d.name)}/${encodeURIComponent(f.name)}`));
    return { name: d.name, imgs, info: await getInfo(d.name) };
  });
  const projects = (await Promise.all(jobs)).filter(p => p.imgs.length);
  if (!projects.length){ empty.hidden = false; return; }

  const rio = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add("on"); rio.unobserve(e.target); }
  }), { threshold: .1 });

  projects.forEach((p, i) => {
    const title = (p.info && p.info.TEN) || p.name.replace(/[-_]+/g, " ");
    const el = document.createElement("article");
    el.className = "proj rv";
    el.style.setProperty("--d", (i % 3 * 0.08) + "s");
    const top = document.createElement("div");
    top.className = "proj-top";
    const img = document.createElement("img");
    img.loading = "lazy"; img.alt = title; img.src = p.imgs[0];
    const ov = document.createElement("div"); ov.className = "ov";
    const tag = document.createElement("span"); tag.className = "p-tag"; tag.textContent = "[dự_án]";
    top.append(img, ov, tag);
    const body = document.createElement("div");
    body.className = "proj-body";
    const h = document.createElement("h3"); h.textContent = title;
    const d = document.createElement("p");
    d.textContent = (p.info && p.info.VAN_DE) || "Bấm để xem ảnh và case study.";
    const tech = document.createElement("div");
    tech.className = "proj-tech";
    (p.info ? ["case-study"] : ["gallery"]).forEach(t => {
      const s = document.createElement("span"); s.textContent = t; tech.append(s);
    });
    const link = document.createElement("span");
    link.className = "proj-link"; link.textContent = p.info ? "mở_case_study ▸" : "xem_ảnh ▸";
    body.append(h, d, tech, link);
    el.append(top, body);
    el.addEventListener("click", () => openModal(p, title));
    grid.appendChild(el);
    rio.observe(el);
  });
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
  p.imgs.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src; img.loading = "lazy"; img.alt = title + " " + (i + 1);
    img.addEventListener("click", () => openLightbox(p.imgs, i));
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
function openLightbox(list, i){
  lbList = list; lbIdx = i; lbImg.src = list[i];
  lb.classList.add("open"); lb.setAttribute("aria-hidden", "false");
}
function closeLightbox(){ lb.classList.remove("open"); lb.setAttribute("aria-hidden", "true"); }
function lbGo(d){ lbIdx = (lbIdx + d + lbList.length) % lbList.length; lbImg.src = lbList[lbIdx]; }
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
