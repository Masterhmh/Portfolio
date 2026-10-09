/* ============ Hoàng Hùng — Premium Minimal ============ */
"use strict";

/* ---------- theme: sáng/tối tự động + đổi tay ---------- */
(function theme(){
  const root = document.documentElement;
  const btn = document.getElementById("themeBtn");
  const saved = localStorage.getItem("hh-theme");
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = saved || (prefersDark ? "dark" : "light");
  btn.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("hh-theme", root.dataset.theme);
  });
})();

/* ---------- reveal on scroll (chỉ fade, không đẩy layout) ---------- */
(function reveal(){
  const els = document.querySelectorAll(".rv");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches){
    els.forEach(e => e.classList.add("on"));
    return;
  }
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add("on"); io.unobserve(e.target); }
  }), { threshold: .12 });
  els.forEach(e => io.observe(e));
})();

/* ---------- năm footer ---------- */
document.getElementById("yr").textContent = new Date().getFullYear();

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
  const grid = document.getElementById("projList");
  const empty = document.getElementById("projEmpty");
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

  projects.forEach((p, i) => {
    const title = (p.info && p.info.TEN) || p.name.replace(/[-_]+/g, " ");
    const idx = String(i + 1).padStart(2, "0");
    const el = document.createElement("article");
    el.className = "feat rv";
    el.style.setProperty("--d", (i % 2 * 0.08) + "s");
    const media = document.createElement("div");
    media.className = "feat-media";
    const img = document.createElement("img");
    img.loading = "lazy"; img.alt = title; img.src = p.imgs[0];
    media.appendChild(img);
    const body = document.createElement("div");
    body.className = "feat-body";
    const k = document.createElement("p");
    k.className = "feat-idx"; k.textContent = "[ dự án " + idx + " ]";
    const h = document.createElement("h3"); h.textContent = title;
    body.append(k, h);
    if (p.info && p.info.VAN_DE){
      const ex = document.createElement("p");
      ex.className = "feat-ex"; ex.textContent = p.info.VAN_DE;
      body.append(ex);
    }
    const link = document.createElement("p");
    link.className = "feat-link";
    link.textContent = p.info ? "Mở case study →" : "Xem ảnh →";
    body.append(link);
    el.append(media, body);
    el.addEventListener("click", () => openModal(p, title));
    grid.appendChild(el);
  });
  // reveal cho dự án mới thêm
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add("on"); io.unobserve(e.target); }
  }), { threshold: .1 });
  grid.querySelectorAll(".feat").forEach(e => io.observe(e));
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
    const rows = [["Vấn đề", p.info.VAN_DE], ["Giải pháp", p.info.GIAI_PHAP], ["Kết quả", p.info.KET_QUA]];
    const box = document.createElement("div");
    box.className = "case";
    rows.filter(r => r[1]).forEach(r => {
      const row = document.createElement("div");
      row.className = "case-row";
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
  lbList = list; lbIdx = i;
  lbImg.src = list[i];
  lb.classList.add("open");
  lb.setAttribute("aria-hidden", "false");
}
function closeLightbox(){
  lb.classList.remove("open");
  lb.setAttribute("aria-hidden", "true");
}
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
