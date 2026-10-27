/**
 * BloodConnect 2026 — Signature Cinematic Opening Animation Controller
 * 
 * Scene 1: The Dark Awakening (Particles + EKG Waveform)
 * Scene 2: The Liquid Blood Drop (Fluid descent, physics splash, morphing ruby emblem)
 * Scene 3: The BloodConnect Reveal (Wordmark, red energy line, tagline)
 * Scene 4: Seamless Transition into Website & Navbar Docking
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'bloodconnect_cinematic_intro_v2';
  let isRunning = false;
  let animFrameId = null;
  let introContainer = null;

  function shouldPlayIntro() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('intro') === 'replay' || urlParams.get('intro') === '1' || urlParams.get('intro') === 'true') {
      return true;
    }
    // Only auto-play on root / homepage
    const p = window.location.pathname;
    const isHome = p === '/' || p === '' || p.endsWith('index.html');
    if (!isHome) return false;

    // Check session storage
    return !sessionStorage.getItem(STORAGE_KEY);
  }

  function createIntroElements() {
    introContainer = document.createElement('div');
    introContainer.id = 'cinematicOverlay';
    introContainer.setAttribute('role', 'dialog');
    introContainer.setAttribute('aria-label', 'BloodConnect Signature Intro');

    introContainer.innerHTML = `
      <canvas class="cinematic-bg-canvas" id="introCanvas"></canvas>
      <div class="cinematic-vignette"></div>

      <button class="skip-intro-btn" id="skipIntroBtn" title="Press Escape to skip">
        Skip Intro <kbd>Esc</kbd>
      </button>

      <div class="cinematic-stage">
        <!-- Scene 1: EKG Heartbeat Waveform -->
        <div class="ekg-container" id="introEkg">
          <svg viewBox="0 0 720 90" width="100%" height="100%">
            <path class="ekg-path" 
                  d="M 0 45 L 260 45 L 285 45 L 300 20 L 315 75 L 330 35 L 345 55 L 360 45 L 720 45" 
                  fill="none" stroke="#FF3347" stroke-width="2.5" stroke-linecap="round" />
          </svg>
        </div>

        <!-- Scene 2: Liquid Blood Drop -->
        <div class="liquid-drop-wrapper" id="introDropWrapper">
          <svg class="liquid-drop-svg" viewBox="0 0 100 120" id="introDropSvg">
            <defs>
              <radialGradient id="introRuby" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stop-color="#FF5C6C" />
                <stop offset="40%" stop-color="#C1121F" />
                <stop offset="85%" stop-color="#780000" />
                <stop offset="100%" stop-color="#3A0005" />
              </radialGradient>
              <linearGradient id="introSpecular" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95" />
                <stop offset="35%" stop-color="#FF859B" stop-opacity="0.4" />
                <stop offset="100%" stop-color="#FF3347" stop-opacity="0" />
              </linearGradient>
              <filter id="introGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            <!-- Organic Fluid Droplet / Morphing Path -->
            <path id="introDropPath" 
                  d="M 50 12 
                     C 50 12, 18 46, 18 72 
                     C 18 90, 32 104, 50 104 
                     C 68 104, 82 90, 82 72 
                     C 82 46, 50 12, 50 12 Z" 
                  fill="url(#introRuby)" 
                  filter="url(#introGlow)" />

            <!-- Specular Curved Highlight -->
            <path id="introHighlightPath"
                  d="M 50 20 
                     C 46 28, 28 50, 28 70 
                     C 28 80, 34 88, 42 92
                     C 36 88, 33 80, 33 70
                     C 33 55, 47 28, 50 20 Z" 
                  fill="url(#introSpecular)" />

            <!-- 3D Glint Spot -->
            <circle cx="42" cy="52" r="3.5" fill="#FFFFFF" opacity="0.9" id="introGlint" />
          </svg>

          <!-- Controlled Splash Ripple Rings -->
          <div class="splash-ripple" id="introRipple1"></div>
          <div class="splash-ripple" id="introRipple2" style="animation-delay: 0.15s;"></div>
        </div>

        <!-- Scene 3: Brand Reveal -->
        <div class="brand-reveal-container" id="introBrand">
          <div class="wordmark">
            <span class="part-blood">Blood</span><span class="part-connect">Connect</span>
          </div>
          <div class="energy-line-container">
            <div class="energy-line-fill" id="introEnergyLine"></div>
          </div>
          <div class="tagline-text" id="introTagline">
            <span>Every Drop Connects a Life.</span>
            <span class="heart-beat-icon">♥</span>
          </div>
        </div>
      </div>
    `;

    document.body.prepend(introContainer);
  }

  // Atmospheric 3D Floating Particle Background
  function initParticleCanvas() {
    const canvas = document.getElementById('introCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      if (!introContainer) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 0.8 + 0.2, // Depth factor
      radius: Math.random() * 2.8 + 1.2,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.5 - 0.1, // Floating upwards gently
      color: Math.random() > 0.3 ? '#C1121F' : '#FF4D5E',
      alpha: Math.random() * 0.5 + 0.2
    }));

    function renderParticles() {
      if (!isRunning) return;
      ctx.clearRect(0, 0, width, height);

      // Radial Deep Burgundy Ambient Glow
      const ambient = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, width * 0.65
      );
      ambient.addColorStop(0, 'rgba(193, 18, 31, 0.15)');
      ambient.addColorStop(0.6, 'rgba(22, 5, 8, 0.5)');
      ambient.addColorStop(1, 'rgba(9, 9, 13, 0.95)');
      ctx.fillStyle = ambient;
      ctx.fillRect(0, 0, width, height);

      // Render 3D Floating Dust & Micro-Droplets
      particles.forEach(p => {
        p.x += p.vx * p.z;
        p.y += p.vy * p.z;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * p.z;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * p.z, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      animFrameId = requestAnimationFrame(renderParticles);
    }

    renderParticles();
  }

  // Play Full Cinematic Choreography
  function playCinematicSequence() {
    isRunning = true;
    createIntroElements();
    initParticleCanvas();

    const wrapper = document.getElementById('introDropWrapper');
    const ekg = document.getElementById('introEkg');
    const ripple1 = document.getElementById('introRipple1');
    const ripple2 = document.getElementById('introRipple2');
    const brand = document.getElementById('introBrand');
    const energyLine = document.getElementById('introEnergyLine');
    const tagline = document.getElementById('introTagline');
    const skipBtn = document.getElementById('skipIntroBtn');

    // Initial state: Drop suspended above screen in dark void
    wrapper.style.transform = 'translateY(-240px) scale(0.6)';
    wrapper.style.opacity = '0';

    // SCENE 1: The Dark Awakening (0.0s - 0.9s)
    setTimeout(() => {
      if (!isRunning) return;
      ekg.classList.add('active');
    }, 200);

    // SCENE 2: The Liquid Blood Drop Descent (0.9s - 1.9s)
    setTimeout(() => {
      if (!isRunning) return;
      wrapper.style.transition = 'transform 1.05s cubic-bezier(0.25, 0.1, 0.25, 1), opacity 0.5s ease';
      wrapper.style.opacity = '1';
      wrapper.style.transform = 'translateY(0px) scale(1)';
    }, 850);

    function playProceduralHeartbeat(volume = 0.15) {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(65, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.18);

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      } catch (e) {
        // Safe silent fail if autoplay restricted
      }
    }

    // Liquid Impact, Ripple & Splash (1.9s)
    setTimeout(() => {
      if (!isRunning) return;
      playProceduralHeartbeat(0.12);
      ripple1.classList.add('active');
      ripple2.classList.add('active');

      // Controlled fluid bounce/squash
      wrapper.style.transition = 'transform 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      wrapper.style.transform = 'scale(1.15, 0.88)';
      setTimeout(() => {
        if (!isRunning) return;
        wrapper.style.transform = 'scale(1, 1)';
      }, 250);
    }, 1850);

    // SCENE 3: The BloodConnect Reveal & Heartbeat Pulse (2.2s - 3.2s)
    setTimeout(() => {
      if (!isRunning) return;
      playProceduralHeartbeat(0.18);
      // Single synchronized systolic heartbeat pulse
      wrapper.style.transform = 'scale(1.12)';
      setTimeout(() => {
        if (!isRunning) return;
        wrapper.style.transform = 'scale(1)';
      }, 180);

      brand.classList.add('visible');
      energyLine.classList.add('active');
      tagline.classList.add('visible');
    }, 2200);

    // SCENE 4: Transition into the website & Navbar docking (3.3s - 4.0s)
    setTimeout(() => {
      if (!isRunning) return;
      completeIntro();
    }, 3400);

    // Skip handler
    skipBtn.addEventListener('click', completeIntro);
    window.addEventListener('keydown', onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      completeIntro();
    }
  }

  function completeIntro() {
    if (!isRunning) return;
    isRunning = false;
    window.removeEventListener('keydown', onKeyDown);

    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
    }

    sessionStorage.setItem(STORAGE_KEY, 'true');

    if (introContainer) {
      introContainer.classList.add('exit');
      setTimeout(() => {
        if (introContainer && introContainer.parentNode) {
          introContainer.parentNode.removeChild(introContainer);
        }
      }, 850);
    }

    // Trigger hero entrance reveals on homepage
    document.body.classList.add('intro-complete');
    window.dispatchEvent(new CustomEvent('bloodconnectIntroComplete'));
  }

  // Global Replay Method
  window.replayCinematicIntro = function () {
    sessionStorage.removeItem(STORAGE_KEY);
    playCinematicSequence();
  };

  // Launch on page load if appropriate
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (shouldPlayIntro()) playCinematicSequence();
    });
  } else {
    if (shouldPlayIntro()) playCinematicSequence();
  }
})();
