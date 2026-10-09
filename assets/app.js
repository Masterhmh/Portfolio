/* Hoàng Hùng — Portfolio v3 · app.js (cyberpunk) */
(function(){
"use strict";

/* ---------- cấu hình ---------- */
const GH = { owner: "Masterhmh", repo: "Portfolio", branch: "main", dir: "projects" };
const IMG_RE = /\.(jpe?g|png|webp|gif|avif|bmp)$/i;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- boot ---------- */
(function boot(){
  const boot = document.getElementById("boot"), bar = document.getElementById("bootBar"),
        log = document.getElementById("bootLog");
  if (reduced){ boot.classList.add("done"); return; }
  const steps = ["> tải modules ............ OK", "> kết nối ai-core ........ OK", "> render giao diện ....... OK"];
  let i = 0;
  const t = setInterval(() => {
    if (i < steps.length){
      log.textContent = steps[i];
      bar.style.width = ((i + 1) / steps.length * 100) + "%";
      i++;
    } else {
      clearInterval(t);
      setTimeout(() => boot.classList.add("done"), 250);
    }
  }, 260);
})();

/* ---------- theme: tự động theo hệ thống + nhớ lựa chọn ---------- */
const root = document.documentElement;
const themeBtn = document.getElementById("themeBtn");
(function initTheme(){
  const saved = localStorage.getItem("hh-theme");
  const sysLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  root.dataset.theme = saved || (sysLight ? "light" : "dark");
})();
themeBtn.addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  localStorage.setItem("hh-theme", next);
});
window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", e => {
  if (!localStorage.getItem("hh-theme")) root.dataset.theme = e.matches ? "light" : "dark";
});

/* ---------- đồng hồ hệ thống ---------- */
(function clock(){
  const el = document.getElementById("clock");
  if (!el) return;
  const tick = () => {
    const d = new Date();
    el.textContent = String(d.getHours()).padStart(2,"0") + ":" + String(d.getMinutes()).padStart(2,"0") + ":" + String(d.getSeconds()).padStart(2,"0");
  };
  tick(); setInterval(tick, 1000);
})();

/* ---------- canvas nền: mạng lưới hạt ---------- */
(function bg(){
  if (reduced) return;
  const cv = document.getElementById("bg-canvas"), ctx = cv.getContext("2d");
  let W, H, pts;
  function resize(){
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    const n = Math.min(70, Math.floor(W * H / 26000));
    pts = Array.from({length: n}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*.35, vy: (Math.random()-.5)*.35
    }));
  }
  resize(); addEventListener("resize", resize);
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  (function frame(){
    ctx.clearRect(0, 0, W, H);
    const cyan = css("--cyan") || "#00e5ff";
    for (const p of pts){
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
    }
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++){
      for (let j = i+1; j < pts.length; j++){
        const a = pts[i], b = pts[j], dx = a.x-b.x, dy = a.y-b.y, d = Math.hypot(dx, dy);
        if (d < 130){
          ctx.strokeStyle = cyan; ctx.globalAlpha = (1 - d/130) * .14;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = .5; ctx.fillStyle = cyan;
    for (const p of pts){ ctx.beginPath(); ctx.arc(p.x, p.y, 1.4, 0, 7); ctx.fill(); }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  })();
})();

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

/* ---------- nghiêng 3D nhẹ cho thẻ dự án ---------- */
if (window.matchMedia("(pointer: fine)").matches){
  document.addEventListener("pointermove", () => {});
}
function tilt(card){
  if (!window.matchMedia("(pointer: fine)").matches || reduced) return;
  card.addEventListener("pointermove", e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `perspective(900px) rotateX(${-y*5}deg) rotateY(${x*5}deg) translateY(-5px)`;
  });
  card.addEventListener("pointerleave", () => { card.style.transform = ""; });
}

/* ---------- gõ chữ: role hero ---------- */
(function typedRole(){
  const el = document.getElementById("typedRole");
  if (!el || reduced){ if (el) el.textContent = "brand_designer --fnb --ai"; return; }
  const words = ["designer × builder --fnb", "7_nam -- 3000+_chu_quan", "thuong_hieu -- miniapp -- automation"];
  let w = 0, i = 0, del = false;
  (function tick(){
    const word = words[w];
    el.textContent = word.slice(0, i);
    if (!del && i < word.length){ i++; setTimeout(tick, 55); }
    else if (!del){ del = true; setTimeout(tick, 1600); }
    else if (i > 0){ i--; setTimeout(tick, 28); }
    else { del = false; w = (w + 1) % words.length; setTimeout(tick, 400); }
  })();
})();

/* ---------- terminal AI gõ lệnh ---------- */
const LINES = [
  ['$ <span class="p">ai.build</span>("miniapp-dat-mon")', '<span class="ok">✓</span> Miniapp đặt món cho quán — chạy ngay trên Zalo'],
  ['$ <span class="p">auto.script</span>("dang-bai-moi-sang")', '<span class="ok">✓</span> 30 bài fanpage — tự đăng đúng 7h sáng'],
  ['$ <span class="p">ai.mockup</span>("logo-pho-bo")', '<span class="ok">✓</span> 12 phương án logo — xong trong 10 phút'],
];
const termBody = document.getElementById("termBody");
let li = 0;
function escapeHtml(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;"); }
function typeLine(){
  if (!termBody) return;
  if (reduced){ termBody.innerHTML = LINES.map(l => l[0] + "\n" + l[1]).join("\n"); return; }
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
      div.innerHTML = cmd;
      const o = document.createElement("div");
      o.innerHTML = out;
      termBody.appendChild(o);
      li++;
      setTimeout(() => { if (termBody.children.length > 8) termBody.innerHTML = ""; typeLine(); }, 2100);
    }
  })();
}
const tio = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting){ tio.disconnect(); typeLine(); }
}), { threshold: .4 });
if (termBody) tio.observe(termBody);

/* ---------- năm footer ---------- */
document.getElementById("yr").textContent = new Date().getFullYear();

/* ================================================================
   DỰ ÁN — tự động đọc từ folder `projects/` trên GitHub
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
    card.className = "proj-card panel rv in";
    card.innerHTML = `
      <div class="proj-cover">
        <img src="${p.imgs[0]}" alt="${escapeHtml(p.name)}" loading="lazy">
        <div class="proj-meta"><b>${escapeHtml(p.name)}</b><span class="count">${p.imgs.length} ẢNH</span></div>
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
  mCount.textContent = "// " + p.imgs.length + " ẢNH";
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
