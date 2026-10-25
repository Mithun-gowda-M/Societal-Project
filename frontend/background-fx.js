/**
 * BloodConnect 2026 — Clean Clinical White Background & Floating Red Blood Cells
 * Renders anatomically styled 3D biconcave erythrocytes (Red Blood Cells) and
 * floating hospital/medical crosses drifting smoothly across a pristine white plasma backdrop.
 */

(function () {
  'use strict';

  let canvas, ctx;
  let particles = [];
  let width, height;
  let mouse = { x: -1000, y: -1000, radius: 150 };
  let pulsePhase = 0;

  // Floating Red Blood Cell (Erythrocyte) & Hospital Cross Particle
  class BioCell {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * (width || window.innerWidth);
      this.y = initial ? Math.random() * (height || window.innerHeight) : (height || window.innerHeight) + 40;
      
      // Type: 80% Red Blood Cells (Erythrocytes), 20% Medical Hospital Crosses
      this.type = Math.random() > 0.22 ? 'RBC' : 'HOSPITAL_CROSS';

      // Dimensions & 3D tumbling physics
      this.radius = Math.random() * 12 + 10; // 10px to 22px realistic size
      this.aspect = Math.random() * 0.4 + 0.6; // 3D tilt factor
      this.tiltAngle = Math.random() * Math.PI * 2;
      this.tiltSpeed = (Math.random() - 0.5) * 0.015;
      this.tumblePhase = Math.random() * Math.PI * 2;
      this.tumbleSpeed = Math.random() * 0.01 + 0.006;

      // Floating drift speed (upward & gentle laminar flow)
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = -(Math.random() * 0.4 + 0.2); // upward drift

      this.alpha = Math.random() * 0.35 + 0.35; // distinct visible presence
      this.scale = Math.random() * 0.4 + 0.8;
      
      // Hospital cross specific
      this.crossColor = Math.random() > 0.4 ? 'rgba(225, 29, 72,' : 'rgba(14, 165, 233,';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.tiltAngle += this.tiltSpeed;
      this.tumblePhase += this.tumbleSpeed;

      // Wrap around edges smoothly
      if (this.x < -60) this.x = width + 60;
      if (this.x > width + 60) this.x = -60;
      if (this.y < -60) this.reset(false);

      // Interactive mouse deflection
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius;
        this.x -= (dx / dist) * force * 3.5;
        this.y -= (dy / dist) * force * 3.5;
      }
    }

    draw() {
      const isLight = document.documentElement.getAttribute('data-theme') !== 'dark';
      
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.tiltAngle);

      // 3D perspective tumbling (squashing vertically to simulate 3D rotation in plasma)
      const currentTilt = Math.abs(Math.cos(this.tumblePhase)) * 0.6 + 0.4;
      ctx.scale(this.scale, this.scale * currentTilt);

      if (this.type === 'RBC') {
        this.drawErythrocyte(isLight);
      } else {
        this.drawHospitalCross(isLight);
      }

      ctx.restore();
    }

    // Anatomical Biconcave Red Blood Cell Rendering
    drawErythrocyte(isLight) {
      const r = this.radius;

      // 1. Soft Cell Shadow for 3D Floating Depth
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(2, 4, r * 1.1, r * 0.9, 0, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? 'rgba(220, 38, 38, 0.08)' : 'rgba(0, 0, 0, 0.35)';
      ctx.fill();
      ctx.restore();

      // 2. Outer Cell Body (Doughnut Rim)
      const outerGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, r * 0.1, 0, 0, r);
      if (isLight) {
        outerGrad.addColorStop(0, `rgba(255, 99, 132, ${this.alpha * 0.95})`);
        outerGrad.addColorStop(0.35, `rgba(239, 68, 68, ${this.alpha})`);
        outerGrad.addColorStop(0.75, `rgba(220, 38, 38, ${this.alpha * 0.95})`);
        outerGrad.addColorStop(1, `rgba(185, 28, 28, ${this.alpha * 0.85})`);
      } else {
        outerGrad.addColorStop(0, `rgba(255, 90, 115, ${this.alpha})`);
        outerGrad.addColorStop(0.4, `rgba(225, 29, 72, ${this.alpha * 0.9})`);
        outerGrad.addColorStop(1, `rgba(159, 18, 57, ${this.alpha * 0.7})`);
      }

      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * this.aspect, 0, 0, Math.PI * 2);
      ctx.fillStyle = outerGrad;
      ctx.fill();

      // 3. Central Biconcave Depressed Dimple (Darker inner valley)
      const dimpleR = r * 0.45;
      const dimpleGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, dimpleR);
      if (isLight) {
        dimpleGrad.addColorStop(0, `rgba(153, 27, 27, ${this.alpha * 0.75})`);
        dimpleGrad.addColorStop(0.7, `rgba(185, 28, 28, ${this.alpha * 0.4})`);
        dimpleGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
      } else {
        dimpleGrad.addColorStop(0, `rgba(136, 19, 55, ${this.alpha * 0.85})`);
        dimpleGrad.addColorStop(1, 'rgba(225, 29, 72, 0)');
      }

      ctx.beginPath();
      ctx.ellipse(0, 0, dimpleR, dimpleR * this.aspect, 0, 0, Math.PI * 2);
      ctx.fillStyle = dimpleGrad;
      ctx.fill();

      // 4. Subtle Specular Reflection (Gleam of blood plasma)
      ctx.beginPath();
      ctx.ellipse(-r * 0.35, -r * 0.25 * this.aspect, r * 0.25, r * 0.12 * this.aspect, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? `rgba(255, 255, 255, ${this.alpha * 0.65})` : `rgba(255, 180, 200, ${this.alpha * 0.45})`;
      ctx.fill();
    }

    // Clean Hospital / Medical Cross Symbol Rendering
    drawHospitalCross(isLight) {
      const armLength = this.radius * 0.9;
      const armThickness = this.radius * 0.36;
      const rad = 2; // rounded edges

      ctx.fillStyle = `${this.crossColor} ${isLight ? this.alpha * 0.7 : this.alpha * 0.55})`;

      // Horizontal Bar
      roundRect(ctx, -armLength, -armThickness / 2, armLength * 2, armThickness, rad);
      ctx.fill();

      // Vertical Bar
      roundRect(ctx, -armThickness / 2, -armLength, armThickness, armLength * 2, rad);
      ctx.fill();
    }
  }

  // Helper for drawing rounded rectangle
  function roundRect(context, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + w, y, x + w, y + h, r);
    context.arcTo(x + w, y + h, x, y + h, r);
    context.arcTo(x, y + h, x, y, r);
    context.arcTo(x, y, x + w, y, r);
    context.closePath();
  }

  function init() {
    canvas = document.createElement('canvas');
    canvas.id = 'bgCanvas';
    document.body.prepend(canvas);
    ctx = canvas.getContext('2d');

    const mesh = document.createElement('div');
    mesh.className = 'bg-mesh';
    document.body.prepend(mesh);

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    // Populate realistic density of cells
    const count = Math.min(Math.floor((width * height) / 24000), 45);
    particles = Array.from({ length: count }, () => new BioCell());

    animate();
    initThemeManager();
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    pulsePhase += 0.03;

    particles.forEach((p) => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  function initThemeManager() {
    // Default to 'light' (white clean medical theme) as requested
    const saved = localStorage.getItem('bloodconnect_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);

    const toggles = document.querySelectorAll('.theme-toggle');
    toggles.forEach(btn => {
      btn.innerHTML = saved === 'dark' ? '☀️ Clean White' : '🌙 Dark Mode';
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('bloodconnect_theme', next);
        toggles.forEach(b => b.innerHTML = next === 'dark' ? '☀️ Clean White' : '🌙 Dark Mode');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      init();
      loadMobileNav();
    });
  } else {
    init();
    loadMobileNav();
  }

  function loadMobileNav() {
    if (!document.querySelector('script[src*="mobile-nav.js"]')) {
      const s = document.createElement('script');
      s.src = 'mobile-nav.js';
      (document.body || document.head).appendChild(s);
    }
  }
})();
