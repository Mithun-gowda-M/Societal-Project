/**
 * BloodConnect 2026 — Universal Mobile Navigation & Presentation Controller
 * Manages touch-optimized hamburger drawer, backdrop dismissal, 
 * and on-demand signature intro replays for mobile and projection devices.
 */

(function () {
  'use strict';

  function initMobileNav() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Check if toggle already exists
    let toggleBtn = navbar.querySelector('.mobile-nav-toggle');
    if (!toggleBtn) {
      toggleBtn = document.createElement('button');
      toggleBtn.className = 'mobile-nav-toggle';
      toggleBtn.id = 'mobileNavToggle';
      toggleBtn.setAttribute('aria-label', 'Toggle Navigation Menu');
      toggleBtn.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
      `;
      navbar.appendChild(toggleBtn);
    }

    // Backdrop for outside clicks
    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-nav-backdrop';
      document.body.appendChild(backdrop);
    }

    const navLinks = navbar.querySelector('.nav-links');

    // Populate mobile drawer quick actions if not already present
    if (navLinks && !navLinks.querySelector('.mobile-drawer-actions')) {
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'mobile-drawer-actions';
      actionsDiv.innerHTML = `
        <a href="/emergency" class="btn btn-danger btn-sm" style="background:#e11d48; color:#fff;">🚨 Emergency Requisition</a>
        <a href="tel:108" class="btn btn-call btn-sm" style="background:#38bdf8; color:#082f49;">📞 Call 108 Ambulance</a>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <a href="/login" class="btn btn-secondary btn-sm" style="text-align:center;">🔑 Login</a>
          <a href="/register" class="btn btn-primary btn-sm" style="text-align:center;">🩸 Register</a>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" id="drawerReplayIntroBtn" style="border: 1.5px dashed #e11d48; color: #e11d48; font-weight:700;">
          🎬 Replay Signature Intro
        </button>
      `;
      navLinks.appendChild(actionsDiv);

      const drawerReplayBtn = actionsDiv.querySelector('#drawerReplayIntroBtn');
      if (drawerReplayBtn) {
        drawerReplayBtn.addEventListener('click', () => {
          closeNav();
          if (typeof window.replayCinematicIntro === 'function') {
            window.replayCinematicIntro();
          } else {
            window.location.href = '/?intro=replay';
          }
        });
      }
    }

    function toggleNav() {
      document.body.classList.toggle('mobile-nav-active');
    }

    function closeNav() {
      document.body.classList.remove('mobile-nav-active');
    }

    toggleBtn.addEventListener('click', toggleNav);
    backdrop.addEventListener('click', closeNav);

    // Auto-close menu when tapping any link inside
    if (navLinks) {
      navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          closeNav();
        });
      });
    }

    // Keyboard support: Escape closes menu
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeNav();
    });

    // Add floating replay button on homepage for projection/demo convenience
    const isHome = window.location.pathname === '/' || window.location.pathname === '' || window.location.pathname.endsWith('index.html');
    if (isHome && !document.getElementById('floatingIntroReplayBtn')) {
      const floatBtn = document.createElement('button');
      floatBtn.id = 'floatingIntroReplayBtn';
      floatBtn.className = 'floating-intro-replay-btn';
      floatBtn.title = 'Watch BloodConnect Signature Intro Animation';
      floatBtn.innerHTML = `<span>🎬</span><span>Watch Intro</span>`;
      floatBtn.addEventListener('click', () => {
        if (typeof window.replayCinematicIntro === 'function') {
          window.replayCinematicIntro();
        } else {
          window.location.href = '/?intro=replay';
        }
      });
      document.body.appendChild(floatBtn);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
