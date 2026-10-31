const bar = document.getElementById('readingBar');
const backTop = document.getElementById('backTop');
window.addEventListener('scroll', () => {
  const st = window.scrollY;
  const dh = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (st / dh * 100) + '%';
  backTop.classList.toggle('visible', st > 380);
}, { passive: true });

const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('open');
  sidebarToggle.classList.add('open');
}
function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('open');
  sidebarToggle.classList.remove('open');
}
sidebarToggle.addEventListener('click', () => sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
sidebarOverlay.addEventListener('click', closeSidebar);
sidebar.querySelectorAll('a').forEach(a => a.addEventListener('click', closeSidebar));

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.sidebar-nav a[data-section]');
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle('active', a.dataset.section === e.target.id));
    }
  });
}, { rootMargin: '-22% 0px -68% 0px' });
sections.forEach(s => sectionObs.observe(s));

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.05 });
document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

const redmiVals = [-6, -4, -2, 0, 0, 0, -1, -3, -4];
function buildEqViz(containerId, vals) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const max = 8;
  vals.forEach(v => {
    const wrap = document.createElement('div');
    wrap.className = 'eq-bar-wrap';
    const b = document.createElement('div');
    const pct = Math.abs(v) / max * 100;
    b.className = 'eq-b ' + (v > 0 ? 'pos' : v < 0 ? 'neg' : 'zero');
    b.style.height = (v === 0 ? 2 : pct * 0.9) + '%';
    b.title = (v >= 0 ? '+' : '') + v + 'dB';
    wrap.appendChild(b);
    el.appendChild(wrap);
  });
}
buildEqViz('heroEq', redmiVals);
buildEqViz('redmiEqBars', redmiVals);
