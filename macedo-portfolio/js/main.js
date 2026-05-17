'use strict';

/* ═══════════════════════════════════════════
   MACEDO Digital Solutions — main.js
   ═══════════════════════════════════════════ */

/* ── DOM references ─────────────────────────────── */
const canvas        = document.getElementById('particleCanvas');
const ctx           = canvas.getContext('2d');
const navbar        = document.getElementById('navbar');
const hamburger     = document.getElementById('navHamburger');
const mobileMenu    = document.getElementById('mobileMenu');
const cursorInner   = document.getElementById('cursorInner');
const cursorOuter   = document.getElementById('cursorOuter');
const scrollBar     = document.getElementById('scrollProgress');
const pageLoader    = document.getElementById('pageLoader');
const loaderText    = document.getElementById('loaderText');
const loaderBar     = document.getElementById('loaderBar');
const loaderStatus  = document.getElementById('loaderStatus');
const typewriterEl  = document.getElementById('typewriter');
const badgeTextEl   = document.getElementById('badgeText');
const glitchEl      = document.querySelector('.glitch-text');

/* ── Page Loader ─────────────────────────────────── */
const loaderSteps = [
  { text: 'initializing system...', pct: 15 },
  { text: 'loading assets...', pct: 40 },
  { text: 'compiling experience...', pct: 70 },
  { text: 'rendering interface...', pct: 90 },
  { text: 'ready.', pct: 100 },
];

function runLoader() {
  let step = 0;
  function next() {
    if (step >= loaderSteps.length) {
      setTimeout(() => {
        pageLoader.classList.add('hidden');
        startSiteAnimations();
      }, 300);
      return;
    }
    const { text, pct } = loaderSteps[step++];
    loaderText.textContent = text;
    loaderBar.style.width = pct + '%';
    loaderStatus.textContent = pct + '%';
    setTimeout(next, step === loaderSteps.length ? 400 : 280);
  }
  next();
}

/* ── Particle System ─────────────────────────────── */
let particles = [];
const mouse = { x: null, y: null, radius: 130 };

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}

class Particle {
  constructor() { this.init(); }

  init() {
    this.x      = Math.random() * canvas.width;
    this.y      = Math.random() * canvas.height;
    this.size   = Math.random() * 1.8 + 0.4;
    this.vx     = (Math.random() - 0.5) * 0.35;
    this.vy     = (Math.random() - 0.5) * 0.35;
    this.alpha  = Math.random() * 0.45 + 0.1;
    const palette = [
      'rgba(79,142,247,',
      'rgba(124,90,247,',
      'rgba(0,212,170,',
      'rgba(244,114,182,',
    ];
    this.color = palette[Math.floor(Math.random() * palette.length)];
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    if (mouse.x !== null) {
      const dx   = this.x - mouse.x;
      const dy   = this.y - mouse.y;
      const dist = Math.hypot(dx, dy);
      if (dist < mouse.radius) {
        const f = (mouse.radius - dist) / mouse.radius;
        this.x += (dx / dist) * f * 1.8;
        this.y += (dy / dist) * f * 1.8;
      }
    }

    if (this.x < -10)                  this.x = canvas.width + 10;
    if (this.x > canvas.width + 10)    this.x = -10;
    if (this.y < -10)                  this.y = canvas.height + 10;
    if (this.y > canvas.height + 10)   this.y = -10;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color + this.alpha + ')';
    ctx.fill();
  }
}

function initParticles() {
  const count = Math.min(90, Math.floor((canvas.width * canvas.height) / 13000));
  particles = Array.from({ length: count }, () => new Particle());
}

function drawConnections() {
  const maxDist = 145;
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.hypot(dx, dy);
      if (dist < maxDist) {
        const alpha = (1 - dist / maxDist) * 0.14;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(79,142,247,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}

/* ── Custom Cursor ───────────────────────────────── */
let cursorX = 0, cursorY = 0;
let outerX  = 0, outerY  = 0;

function onMouseMove(e) {
  cursorX  = e.clientX;
  cursorY  = e.clientY;
  mouse.x  = e.clientX;
  mouse.y  = e.clientY;
  cursorInner.style.left = cursorX + 'px';
  cursorInner.style.top  = cursorY + 'px';
}

function animateCursorOuter() {
  outerX += (cursorX - outerX) * 0.11;
  outerY += (cursorY - outerY) * 0.11;
  cursorOuter.style.left = outerX + 'px';
  cursorOuter.style.top  = outerY + 'px';
  requestAnimationFrame(animateCursorOuter);
}

document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

document.querySelectorAll('a, button, [data-tilt]').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

/* ── Scroll progress + Nav ───────────────────────── */
function onScroll() {
  const scrolled = window.scrollY;
  const total    = document.documentElement.scrollHeight - window.innerHeight;
  scrollBar.style.width = (scrolled / total * 100) + '%';

  navbar.classList.toggle('scrolled', scrolled > 40);
  updateActiveSection();
}

/* ── Nav active section ──────────────────────────── */
const navAnchors = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections   = [...document.querySelectorAll('section[id]')];

function updateActiveSection() {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 120) current = s.id;
  });
  navAnchors.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
  });
}

/* ── Mobile Nav ──────────────────────────────────── */
hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open', !isOpen);
  hamburger.setAttribute('aria-expanded', String(!isOpen));
  document.body.style.overflow = isOpen ? '' : 'hidden';
});

mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

/* ── Smooth scroll ───────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ── Typewriter ──────────────────────────────────── */
const phrases = [
  'combining engineering precision',
  'with product-level thinking.',
  'creating digital experiences.',
  'building with intention.',
  'designing with purpose.',
];
let phraseIdx = 0;
let charIdx   = 0;
let deleting  = false;

function typeStep() {
  const phrase = phrases[phraseIdx];
  if (deleting) {
    charIdx--;
    typewriterEl.textContent = phrase.slice(0, charIdx);
    if (charIdx === 0) {
      deleting  = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(typeStep, 500);
      return;
    }
    setTimeout(typeStep, 38);
  } else {
    charIdx++;
    typewriterEl.textContent = phrase.slice(0, charIdx);
    if (charIdx === phrase.length) {
      deleting = true;
      setTimeout(typeStep, 2200);
      return;
    }
    setTimeout(typeStep, 68);
  }
}

/* ── Badge text rotation ─────────────────────────── */
const badgeMessages = [
  'Available for new projects',
  'Open to collaborations',
  'Building digital experiences',
  "Let's create something great",
];
let badgeIdx = 0;
badgeTextEl.style.transition = 'opacity 0.3s';

function rotateBadge() {
  badgeTextEl.style.opacity = '0';
  setTimeout(() => {
    badgeIdx = (badgeIdx + 1) % badgeMessages.length;
    badgeTextEl.textContent = badgeMessages[badgeIdx];
    badgeTextEl.style.opacity = '1';
  }, 300);
}

/* ── Glitch trigger ──────────────────────────────── */
function triggerGlitch() {
  if (!glitchEl) return;
  glitchEl.classList.add('glitching');
  setTimeout(() => glitchEl.classList.remove('glitching'), 400);
  setTimeout(triggerGlitch, 4500 + Math.random() * 6000);
}

/* ── Counter animation ───────────────────────────── */
function animateCounter(el) {
  const target   = parseInt(el.dataset.count, 10);
  const duration = 1400;
  const step     = target / (duration / 16);
  let current    = 0;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = Math.floor(current) + '+';
    if (current >= target) clearInterval(timer);
  }, 16);
}

/* ── Intersection Observer ───────────────────────── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    if (el.classList.contains('fade-in')) {
      el.classList.add('visible');
      el.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.width;
        setTimeout(() => bar.classList.add('animated'), 1450);
      });
    }

    if (el.dataset.count) animateCounter(el);

    observer.unobserve(el);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));

/* ── 3D card tilt ────────────────────────────────── */
document.querySelectorAll('[data-tilt]').forEach(card => {
  let tiltActive = false;

  card.addEventListener('mousemove', e => {
    tiltActive = true;
    const rect  = card.getBoundingClientRect();
    const cx    = rect.left + rect.width / 2;
    const cy    = rect.top  + rect.height / 2;
    const dx    = (e.clientX - cx) / (rect.width  / 2);
    const dy    = (e.clientY - cy) / (rect.height / 2);
    const rotX  = -dy * 7;
    const rotY  =  dx * 7;
    card.style.transform    = `translateY(-5px) perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    card.style.transition   = 'box-shadow 0.3s, border-color 0.3s, background 0.3s';
  });

  card.addEventListener('mouseleave', () => {
    tiltActive = false;
    card.style.transform  = '';
    card.style.transition = 'all 0.5s cubic-bezier(0.4,0,0.2,1)';
    setTimeout(() => { if (!tiltActive) card.style.transition = ''; }, 500);
  });
});

/* ── Start all animations after loader ───────────── */
function startSiteAnimations() {
  typeStep();
  setTimeout(triggerGlitch, 2500);
  setInterval(rotateBadge, 3800);
}

/* ── Init ────────────────────────────────────────── */
resizeCanvas();
initParticles();
animateParticles();
animateCursorOuter();

window.addEventListener('resize', () => {
  resizeCanvas();
  initParticles();
}, { passive: true });

window.addEventListener('scroll', onScroll, { passive: true });

window.addEventListener('load', () => {
  setTimeout(runLoader, 100);
});
