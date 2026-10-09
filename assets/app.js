/* Hoàng Hùng — Portfolio · app.js */
(function(){
"use strict";

/* ---------- cấu hình ---------- */
const GH = { owner: "Masterhmh", repo: "Portfolio", branch: "main", dir: "projects" };
const IMG_RE = /\.(jpe?g|png|webp|gif|avif|bmp)$/i;

/* ---------- theme: tự động theo hệ thống + nhớ lựa chọn ---------- */
const root = document.documentElement;
const themeBtn = document.getElementById("themeBtn");
function initTheme(){
  const saved = localStorage.getItem("hh-theme");
  const sysLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  root.dataset.theme = saved || (sysLight ? "light" : "dark");
}
themeBtn.addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  localStorage.setItem("hh-theme", next);
});
window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", e => {
  if (!localStorage.getItem("hh-theme")) root.dataset.theme = e.matches ? "light" : "dark";
});
initTheme();

/* ---------- reveal on scroll ---------- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .12 });
document.querySelectorAll(".rv").forEach(el => io.observe(el));

/* ---------- đếm số ---------- */
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  cio.unobserve(e.target);
  const el = e.target, target = +el.dataset.count, t0 = performance.now(), dur = 1400;
  (function tick(t){
    const p = Math.min((t - t0) / dur, 1), ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * ease).toLocaleString("vi-VN");
    if (p < 1) requestAnimationFrame(tick);
  })(t0);
}), { threshold: .5 });
document.querySelectorAll("[data-count]").forEach(el => cio.observe(el));

/* ---------- nghiêng 3D nhẹ cho thẻ dự án (bỏ qua mobile) ---------- */
const fine = window.matchMedia("(pointer: fine)").matches;
function tilt(card){
  if (!fine) return;
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(900px) rotateX(${-y*6}deg) rotateY(${x*6}deg) translateY(-6px)`;
  });
  card.addEventListener("pointerleave", () => { card.style.transform = ""; });
}

/* ---------- terminal gõ chữ ---------- */
const LINES = [
  ['$ <span class="p">ai.build</span>("miniapp-dat-mon")', '<span class="ok">✓</span> Miniapp đặt món cho quán — chạy ngay trên Zalo'],
  ['$ <span class="p">auto.script</span>("dang-bai-moi-sang")', '<span class="ok">✓</span> 30 bài fanpage — tự đăng đúng 7h sáng'],
  ['$ <span class="p">ai.mockup</span>("logo-pho-bo")', '<span class="ok">✓</span> 12 phương án logo — xong trong 10 phút'],
];
const termBody = document.getElementById("termBody");
let li = 0;
function typeLine(){
  if (!termBody || window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    if (termBody) termBody.innerHTML = LINES.map(l => l[0] + "\n" + l[1]).join("\n");
    return;
  }
  const [cmd, out] = LINES[li % LINES.length];
  const cmdText = cmd.replace(/<[^>]+>/g, "");
  const div = document.createElement("div");
  termBody.appendChild(div);
  let i = 0;
  (function type(){
    if (i <= cmdText.length){
      div.innerHTML = escapeHtml(cmdText.slice(0, i)) + '<span class="caret"></span>';
      i++; setTimeout(type, 34);
    } else {
      div.innerHTML = cmd; // hiện lại bản có màu
      const o = document.createElement("div");
      o.innerHTML = out;
      termBody.appendChild(o);
      li++;
      setTimeout(() => { if (termBody.children.length > 8) termBody.innerHTML = ""; typeLine(); }, 2100);
    }
  })();
}
function escapeHtml(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
const tio = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ tio.disconnect(); typeLine(); }
}), { threshold: .4 });
if (termBody) tio.observe(termBody);

/* ---------- năm footer ---------- */
document.getElementById("yr").textContent = new Date().getFullYear();

/* ================================================================
   DỰ ÁN — tự động đọc từ folder `projects/` trên GitHub
   Quy ước:  projects/Ten-Du-An/1.jpg, 2.jpg, 3.png ...
   - Tên folder = tên dự án · ảnh số 1 = ảnh bìa · tự sắp theo số
   ================================================================ */
const grid = document.getElementById("projGrid");
const emptyBox = document.getElementById("projEmpty");
const modal = document.getElementById("modal");
const mTitle = document.getElementById("mTitle");
const mCount = document.getElementById("mCount");
const mBody = document.getElementById("mBody");

const api = p => `https://api.github.com/repos/${GH.owner}/${GH.repo}/contents/${p}`;
const raw = p => `https://raw.githubusercontent.com/${GH.owner}/${GH.repo}/${GH.branch}/${p}`;
const numOf = n => { const m = String(n).match(/(\d+)/); return m ? parseInt(m[1], 10) : 1e9; };

async function ghJson(path){
  const r = await fetch(api(path));
  if (!r.ok) throw new Error("gh:" + r.status);
  return r.json();
}

async function loadProjects(){
  // skeleton khi đang tải
  grid.innerHTML = '<div class="skel"></div><div class="skel"></div><div class="skel"></div>';
  try {
    const items = await ghJson(GH.dir);
    const dirs = (Array.isArray(items) ? items : [])
      .filter(x => x.type === "dir" && !x.name.startsWith(".") && !x.name.startsWith("_"));
    if (!dirs.length) return showEmpty();
    const jobs = dirs.map(async d => {
      try {
        const files = await ghJson(`${GH.dir}/${d.name}`);
        const imgs = (Array.isArray(files) ? files : [])
          .filter(f => f.type === "file" && IMG_RE.test(f.name))
          .sort((a, b) => numOf(a.name) - numOf(b.name) || a.name.localeCompare(b.name));
        if (!imgs.length) return null;
        return { name: d.name, imgs: imgs.map(f => raw(`${GH.dir}/${encodeURIComponent(d.name)}/${encodeURIComponent(f.name)}`)) };
      } catch { return null; }
    });
    const projects = (await Promise.all(jobs)).filter(Boolean);
    if (!projects.length) return showEmpty();
    renderProjects(projects);
  } catch { showEmpty(); }
}

function renderProjects(projects){
  grid.innerHTML = "";
  projects.forEach(p => {
    const card = document.createElement("article");
    card.className = "proj-card glass rv in";
    card.innerHTML = `
      <div class="proj-cover">
        <img src="${p.imgs[0]}" alt="${escapeHtml(p.name)}" loading="lazy">
        <div class="proj-meta"><h3>${escapeHtml(p.name)}</h3><span class="count">${p.imgs.length} ảnh</span></div>
      </div>`;
    card.addEventListener("click", () => openModal(p));
    tilt(card);
    grid.appendChild(card);
  });
}

function showEmpty(){
  grid.innerHTML = "";
  emptyBox.hidden = false;
  emptyBox.classList.add("in");
}

function openModal(p){
  mTitle.textContent = p.name;
  mCount.textContent = p.imgs.length + " ảnh";
  mBody.innerHTML = "";
  p.imgs.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src; img.loading = "lazy"; img.alt = `${p.name} — ảnh ${i + 1}`;
    mBody.appendChild(img);
  });
  modal.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeModal(){
  modal.hidden = true;
  document.body.style.overflow = "";
}
document.getElementById("mClose").addEventListener("click", closeModal);
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeModal(); });

loadProjects();
})();
