/* ============ Hoàng Hùng — Premium Minimal ============ */
"use strict";

/* ---------- theme: sáng/tối tự động + đổi tay ---------- */
(function theme(){
  const root = document.documentElement;
  const btn = document.getElementById("themeBtn");
  const saved = localStorage.getItem("hh-theme");
  root.dataset.theme = saved || "dark";
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
  const grid = document.getElementById("repoList");
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
    const slug = p.name.toLowerCase();
    const el = document.createElement("article");
    el.className = "repo rv";
    el.style.setProperty("--d", (i % 3 * 0.06) + "s");
    const main = document.createElement("div");
    const name = document.createElement("p");
    name.className = "repo-name";
    const acc = document.createElement("span");
    acc.className = "acc"; acc.textContent = "masterhmh / ";
    name.append(acc, document.createTextNode(slug));
    const vis = document.createElement("span");
    vis.className = "repo-visibility"; vis.textContent = "public";
    name.append(vis);
    const desc = document.createElement("p");
    desc.className = "repo-desc";
    desc.textContent = (p.info && p.info.VAN_DE) || "Bấm để xem ảnh và case study.";
    const meta = document.createElement("p");
    meta.className = "repo-meta";
    const nImg = document.createElement("span"); nImg.textContent = p.imgs.length + " ảnh";
    meta.append(nImg);
    if (p.info){
      const tag = document.createElement("span");
      tag.className = "tag"; tag.textContent = "case-study";
      meta.append(tag);
    }
    main.append(name, desc, meta);
    const thumb = document.createElement("div");
    thumb.className = "repo-thumb";
    const img = document.createElement("img");
    img.loading = "lazy"; img.alt = title; img.src = p.imgs[0];
    thumb.appendChild(img);
    const go = document.createElement("span");
    go.className = "repo-go"; go.textContent = "→";
    el.append(main, thumb, go);
    el.addEventListener("click", () => openModal(p, title));
    grid.appendChild(el);
  });
  // reveal cho dự án mới thêm
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting){ e.target.classList.add("on"); io.unobserve(e.target); }
  }), { threshold: .1 });
  grid.querySelectorAll(".repo").forEach(e => io.observe(e));
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

/* ---------- command palette (Ctrl/⌘+K) ---------- */
(function palette(){
  const pal = document.getElementById("palette");
  const input = document.getElementById("palInput");
  const list = document.getElementById("palList");
  if (!pal) return;
  const go = s => document.querySelector(s).scrollIntoView({ behavior: "smooth" });
  const toggleTheme = () => document.getElementById("themeBtn").click();
  const ACTIONS = [
    { t: "đi tới: profile", k: "sec", run: () => go("#profile") },
    { t: "đi tới: năng lực", k: "sec", run: () => go("#services") },
    { t: "đi tới: repos", k: "sec", run: () => go("#projects") },
    { t: "đi tới: deploy", k: "sec", run: () => go("#process") },
    { t: "đi tới: liên hệ", k: "sec", run: () => go("#contact") },
    { t: "đổi chế độ sáng / tối", k: "ui", run: toggleTheme },
    { t: "nhắn tin facebook", k: "link", run: () => open("https://www.facebook.com/masterhmh", "_blank") },
  ];
  let items = ACTIONS, sel = 0;
  function render(){
    list.innerHTML = "";
    items.forEach((a, i) => {
      const li = document.createElement("li");
      if (i === sel) li.className = "sel";
      const t = document.createElement("span"); t.textContent = a.t;
      const k = document.createElement("span"); k.className = "k"; k.textContent = a.k;
      li.append(t, k);
      li.addEventListener("click", () => { close(); a.run(); });
      li.addEventListener("mousemove", () => { sel = i; render(); });
      list.appendChild(li);
    });
  }
  function openPal(){ pal.classList.add("open"); pal.setAttribute("aria-hidden", "false"); input.value = ""; items = ACTIONS; sel = 0; render(); setTimeout(() => input.focus(), 30); }
  function close(){ pal.classList.remove("open"); pal.setAttribute("aria-hidden", "true"); }
  function isOpen(){ return pal.classList.contains("open"); }
  document.getElementById("paletteBtn").addEventListener("click", openPal);
  pal.addEventListener("click", e => { if (e.target === pal) close(); });
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    items = ACTIONS.filter(a => a.t.toLowerCase().includes(q));
    sel = 0; render();
  });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown"){ e.preventDefault(); sel = Math.min(sel + 1, items.length - 1); render(); }
    else if (e.key === "ArrowUp"){ e.preventDefault(); sel = Math.max(sel - 1, 0); render(); }
    else if (e.key === "Enter" && items[sel]){ close(); items[sel].run(); }
  });
  addEventListener("keydown", e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){ e.preventDefault(); isOpen() ? close() : openPal(); }
    else if (e.key === "Escape" && isOpen()) close();
  });
})();
