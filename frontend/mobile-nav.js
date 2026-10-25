/**
 * BloodConnect 2026 — Clean Top-Row Navigation & Scroll-Down Services Dropdown Controller
 * 
 * Top Bar (Only 4-5 Essential Items):
 * 1. Home
 * 2. ☰ Services ▾ (Dropdown menu beside Home listing all other features)
 * 3. 🚨 Emergency Request
 * 4. 📞 108 Ambulance
 * 5. 🔑 Login / Register
 */

(function () {
  'use strict';

  function initCleanNav() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    // Check if dropdown already rendered
    let servicesDropdown = navbar.querySelector('#servicesDropdown');
    const navLinks = navbar.querySelector('.nav-links');

    if (navLinks && !servicesDropdown) {
      // Clean up nav-links: keep only Home, Services Dropdown, and Emergency Request
      const currentPath = window.location.pathname;

      navLinks.innerHTML = `
        <a href="/" class="${(currentPath === '/' || currentPath.endsWith('index.html')) ? 'active' : ''}">🏠 Home</a>
        
        <!-- Scroll-Down Menu Button beside Home -->
        <div class="nav-dropdown" id="servicesDropdown">
          <button type="button" class="nav-dropdown-btn" id="servicesDropdownBtn" aria-expanded="false" aria-haspopup="true">
            <span class="dropdown-icon-bars">☰</span>
            <span>Services</span>
            <span class="dropdown-chevron">▾</span>
          </button>
          
          <div class="nav-dropdown-menu" id="servicesDropdownMenu">
            <div class="dropdown-section-label">Emergency & Transfusion</div>
            <a href="/emergency" class="dropdown-item">
              <span class="item-icon">🚨</span>
              <div class="item-text">
                <strong>Emergency Blood Requisition</strong>
                <small>Autonomous AI matching & bedside dispatch</small>
              </div>
            </a>
            <a href="/live-dispatch" class="dropdown-item">
              <span class="item-icon">🛸</span>
              <div class="item-text">
                <strong>Live GPS Transit HUD</strong>
                <small>Google Maps telematics & AeroLife Drone</small>
              </div>
            </a>
            <a href="/hospitals" class="dropdown-item">
              <span class="item-icon">🚑</span>
              <div class="item-text">
                <strong>Karnataka Hospitals & ICUs</strong>
                <small>24/7 Trauma beds & blood bank routing</small>
              </div>
            </a>
            <a href="/blood-banks" class="dropdown-item">
              <span class="item-icon">🩸</span>
              <div class="item-text">
                <strong>Blood Banks & Live Inventory</strong>
                <small>Real-time units audit & PIN modifier</small>
              </div>
            </a>

            <div class="dropdown-divider"></div>
            <div class="dropdown-section-label">Donors & Forecasting</div>
            <a href="/donors" class="dropdown-item">
              <span class="item-icon">🔍</span>
              <div class="item-text">
                <strong>Find Compatible Donors</strong>
                <small>Geofenced donor discovery across Bangalore</small>
              </div>
            </a>
            <a href="/radar" class="dropdown-item">
              <span class="item-icon">📊</span>
              <div class="item-text">
                <strong>AI Shortage Radar</strong>
                <small>7-Day Holt-Winters demand forecasting</small>
              </div>
            </a>

            <div class="dropdown-divider"></div>
            <div class="dropdown-section-label">Account Portals</div>
            <a href="/patient-portal" class="dropdown-item">
              <span class="item-icon">🧑‍🤝‍🧑</span>
              <div class="item-text">
                <strong>Patient Care Portal</strong>
                <small>Active requisitions & transit status</small>
              </div>
            </a>
            <a href="/portal" class="dropdown-item">
              <span class="item-icon">👤</span>
              <div class="item-text">
                <strong>Verified Donor Portal</strong>
                <small>Donation history & cooldown counter</small>
              </div>
            </a>
            <a href="/admin" class="dropdown-item">
              <span class="item-icon">🛠️</span>
              <div class="item-text">
                <strong>Command Center / Admin</strong>
                <small>Audit logs & messaging gateway</small>
              </div>
            </a>
            
            <div class="dropdown-divider"></div>
            <a href="/about" class="dropdown-item">
              <span class="item-icon">ℹ️</span>
              <div class="item-text">
                <strong>Mission & Clinical Charter</strong>
              </div>
            </a>
            <a href="/reviews" class="dropdown-item">
              <span class="item-icon">⭐</span>
              <div class="item-text">
                <strong>Donor & Patient Reviews</strong>
              </div>
            </a>
          </div>
        </div>

        <a href="/emergency" class="nav-item-urgent">🚨 Emergency Request</a>
      `;

      servicesDropdown = navLinks.querySelector('#servicesDropdown');
    }

    // Standardize nav-actions to: Call 108, Login, Register
    const navActions = navbar.querySelector('.nav-actions');
    if (navActions && !navActions.querySelector('#btnHeaderAuth')) {
      navActions.innerHTML = `
        <a href="tel:108" class="btn btn-call btn-sm" style="animation: pulseGlow 2s infinite;">📞 108 Ambulance</a>
        <a href="/login" class="btn btn-secondary btn-sm" id="btnHeaderAuth">🔑 Login</a>
        <a href="/register" class="btn btn-primary btn-sm">🩸 Register</a>
      `;
    }

    // Toggle Dropdown Menu Button beside Home
    if (servicesDropdown) {
      const dropdownBtn = servicesDropdown.querySelector('#servicesDropdownBtn');
      if (dropdownBtn) {
        dropdownBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isOpen = servicesDropdown.classList.toggle('open');
          dropdownBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
      }
    }

    // Close Dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (servicesDropdown && !servicesDropdown.contains(e.target)) {
        servicesDropdown.classList.remove('open');
        const btn = servicesDropdown.querySelector('#servicesDropdownBtn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      }
    });

    // Mobile Hamburger Toggle
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

    // Backdrop for outside clicks on mobile
    let backdrop = document.querySelector('.mobile-nav-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'mobile-nav-backdrop';
      document.body.appendChild(backdrop);
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

    // Keyboard support: Escape closes menu & dropdown
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeNav();
        if (servicesDropdown) servicesDropdown.classList.remove('open');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCleanNav);
  } else {
    initCleanNav();
  }
})();
