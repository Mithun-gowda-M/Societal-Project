/**
 * BloodConnect 2026 — India National Blood Banks & Live Stock Controller
 * Real-time inventory tracking, staff stock adjustment (+/-), and spatial distance calculation.
 */

(function () {
  'use strict';

  let map;
  let markers = [];
  let currentGroupFilter = 'ALL';
  let activeStaffBankId = null;

  // Default coordinate: Bangalore Central (12.9716, 77.5946)
  let currentRefLat = 12.9716;
  let currentRefLng = 77.5946;

  const cityCoordinates = {
    'Bengaluru': { lat: 12.9716, lng: 77.5946 },
    'Mysuru': { lat: 12.3168, lng: 76.6508 },
    'Mangaluru': { lat: 12.8703, lng: 74.8427 },
    'Udupi': { lat: 13.3525, lng: 74.7865 },
    'Hubballi': { lat: 15.3647, lng: 75.1240 },
    'Belagavi': { lat: 15.8872, lng: 74.5165 },
    'Davanagere': { lat: 14.4644, lng: 75.9218 },
    'Kalaburagi': { lat: 17.3297, lng: 76.8343 },
    'Ballari': { lat: 15.1438, lng: 76.9214 },
    'Shivamogga': { lat: 13.9299, lng: 75.5681 },
    'Tumakuru': { lat: 13.3379, lng: 77.1010 },
    'Hassan': { lat: 13.0033, lng: 76.1004 },
    'New Delhi': { lat: 28.6139, lng: 77.2090 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Pune': { lat: 18.5204, lng: 73.8567 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'Kochi': { lat: 9.9312, lng: 76.2673 },
    'Jaipur': { lat: 26.9124, lng: 75.7873 },
    'Lucknow': { lat: 26.8467, lng: 80.9462 },
    'Chandigarh': { lat: 30.7333, lng: 76.7794 },
    'Bhopal': { lat: 23.2599, lng: 77.4126 },
    'Patna': { lat: 25.5941, lng: 85.1376 },
    'Bhubaneswar': { lat: 20.2961, lng: 85.8245 },
    'Guwahati': { lat: 26.1445, lng: 91.7362 }
  };

  const cardsContainer = document.getElementById('bankCardsContainer');
  const searchInput = document.getElementById('bankSearchInput');
  const citySelect = document.getElementById('bankCitySelect');
  const staffPortal = document.getElementById('staffPortal');
  const activeBankTitle = document.getElementById('activeBankTitle');
  const stockEditorGrid = document.getElementById('stockEditorGrid');
  const staffLoginModal = document.getElementById('staffLoginModal');
  const bankSelect = document.getElementById('bankSelect');
  const staffLoginForm = document.getElementById('staffLoginForm');
  const staffLoginMsg = document.getElementById('staffLoginMsg');

  function init() {
    initMap();
    populateBankSelect();
    renderBanks();
    setupEventListeners();

    // Check if staff bank is already logged in
    const savedStaffBank = localStorage.getItem('bloodconnect_active_staff_bank');
    if (savedStaffBank) {
      openStaffPortal(savedStaffBank);
    }
  }

  let activeRouteLine = null;

  function initMap() {
    if (typeof L === 'undefined') return;

    map = L.map('bangaloreMap', { preferCanvas: true }).setView([currentRefLat, currentRefLng], 12);

    // Official Google Maps Roadmap Basemap (Zero glitching, authentic Google Maps)
    L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
      attribution: '&copy; Google Maps',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 20
    }).addTo(map);

    window.addEventListener('resize', () => { if (map) map.invalidateSize(); });
    setTimeout(() => { if (map) map.invalidateSize(); }, 80);
    setTimeout(() => { if (map) map.invalidateSize(); }, 350);
    setTimeout(() => { if (map) map.invalidateSize(); }, 1000);

    updateMapMarkers();
  }

  function getSortedBanks() {
    const banks = window.IndiaBloodData ? window.IndiaBloodData.getBloodBanks() : [];
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const city = citySelect ? citySelect.value : 'ALL';

    const filtered = banks.filter(bank => {
      if (city !== 'ALL' && bank.city !== city) return false;

      if (query) {
        const inName = bank.name.toLowerCase().includes(query);
        const inZone = (bank.zone || '').toLowerCase().includes(query);
        const inAddress = (bank.address || '').toLowerCase().includes(query);
        const inCity = (bank.city || '').toLowerCase().includes(query);
        if (!inName && !inZone && !inAddress && !inCity) return false;
      }
      return true;
    });

    // Calculate real-time distance and sort: NEAREST FIRST!
    const mapped = filtered.map(b => {
      const distance = window.IndiaBloodData ? window.IndiaBloodData.calculateDistance(currentRefLat, currentRefLng, b.lat, b.lng) : 0;
      return { ...b, distance };
    });

    mapped.sort((a, b) => {
      if (currentGroupFilter !== 'ALL') {
        const unitsA = (a.stock && a.stock[currentGroupFilter]) || 0;
        const unitsB = (b.stock && b.stock[currentGroupFilter]) || 0;
        if (unitsB !== unitsA) return unitsB - unitsA;
      }
      return a.distance - b.distance;
    });

    return mapped;
  }

  function renderBanks() {
    if (!cardsContainer) return;
    cardsContainer.innerHTML = '';

    const sorted = getSortedBanks();

    if (sorted.length === 0) {
      cardsContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <p style="color: var(--text-muted); font-size: 16px;">No blood banks match your search criteria in this region.</p>
        </div>
      `;
      return;
    }

    sorted.forEach((bank, idx) => {
      const card = document.createElement('div');
      card.className = 'bank-card';
      card.id = `card-${bank.id}`;

      // Build stock pills
      const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Platelets', 'Plasma'];
      const stockHtml = groups.map(grp => {
        const units = (bank.stock && bank.stock[grp]) || 0;
        const isTarget = currentGroupFilter === grp;
        let cntClass = units === 0 ? 'zero' : (units < 5 ? 'low' : 'good');
        return `
          <div class="stock-chip ${isTarget ? 'active-highlight' : ''}">
            <div class="grp">${grp}</div>
            <div class="cnt ${cntClass}">${units}</div>
          </div>
        `;
      }).join('');

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <h3 style="font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text-main);">
                ${bank.name}
              </h3>
              <span style="font-size: 11px; padding: 2px 8px; background: rgba(255, 51, 71, 0.15); color: #ff3347; border-radius: 12px; font-weight: 700;">
                📍 ${bank.distance} km away
              </span>
              ${idx === 0 ? '<span class="badge badge-verified" style="background: rgba(16, 185, 129, 0.2); color: #10b981;">⚡ Nearest Centre</span>' : ''}
            </div>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">
              📍 ${bank.zone || bank.city} • ${bank.address}
            </p>
          </div>
          <span class="badge badge-available">24x7 Active</span>
        </div>

        <div style="font-size: 12px; color: var(--text-dim); margin-bottom: 4px;">
          Live Available Stock (Units):
        </div>

        <div class="stock-grid">
          ${stockHtml}
        </div>

        <div class="bank-contacts">
          ${bank.website ? `<a href="${bank.website}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">🌐 Website</a>` : ''}
          <a href="tel:${bank.phone}" class="btn btn-call btn-sm">📞 Call ${bank.phone}</a>
          <a href="https://wa.me/${bank.whatsapp.replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(bank.name)}%2C%20checking%20blood%20stock%20availability%20via%20BloodConnect" 
             target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">💬 WhatsApp</a>
          <button class="btn btn-secondary btn-sm" onclick="window.showInAppRoute('${bank.name.replace(/'/g, "\\'")}', ${bank.lat}, ${bank.lng}, ${bank.distance})" style="display: inline-flex; align-items: center; gap: 4px; border-color: #0284c7; color: #0284c7; font-weight: 600;">
            🧭 In-App Directions (${bank.distance} km)
          </button>
          ${bank.email ? `<a href="mailto:${bank.email}" class="btn btn-secondary btn-sm">✉️ Email</a>` : ''}
          <button class="btn btn-secondary btn-sm" onclick="window.focusBankOnMap(${bank.lat}, ${bank.lng})">🗺️ View on Map</button>
          ${activeStaffBankId ? `<button class="btn btn-secondary btn-sm" onclick="window.openStaffEditorForBank('${bank.id}')" style="border-color: var(--crimson-primary); color: var(--crimson-primary); font-weight: 700;">⚙️ Edit Stock</button>` : ''}
        </div>
      `;

      cardsContainer.appendChild(card);
    });
  }

  function updateMapMarkers() {
    if (!map || typeof L === 'undefined') return;

    markers.forEach(m => map.removeLayer(m));
    markers = [];

    const sorted = getSortedBanks();
    const bounds = L.latLngBounds([[currentRefLat, currentRefLng]]);

    sorted.forEach((bank, idx) => {
      const isNearest = idx === 0;
      let stockDisplay = '';
      if (currentGroupFilter !== 'ALL' && bank.stock) {
        const units = bank.stock[currentGroupFilter] || 0;
        stockDisplay = `<div style="margin-top: 6px; font-weight: bold; color: ${units > 0 ? '#10b981' : '#ff2d55'};">
          ${currentGroupFilter}: ${units} units available
        </div>`;
      }

      const icon = L.divIcon({
        className: 'custom-blood-pin',
        html: `<div style="
          width: 32px; height: 32px; border-radius: 50%;
          background: ${isNearest ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ff2d55, #be123c)'};
          border: 2px solid #ffffff; box-shadow: 0 0 15px ${isNearest ? 'rgba(16, 185, 129, 0.8)' : 'rgba(255, 45, 85, 0.7)'};
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 16px; font-weight: bold;">🩸</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 220px; padding: 4px;">
          <h4 style="margin: 0 0 4px; color: #be123c; font-size: 15px;">${bank.name}</h4>
          <p style="margin: 0 0 4px; font-size: 12px; color: #475569;">${bank.address}</p>
          <p style="margin: 0 0 6px; font-size: 12px; font-weight: 600; color: #ff3347;">📍 ${bank.distance} km away</p>
          <p style="margin: 0 0 6px; font-size: 12px; font-weight: 600;">📞 ${bank.phone}</p>
          ${stockDisplay}
          <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
            ${bank.website ? `<a href="${bank.website}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; padding: 4px 8px; background: #0f172a; color: white; border-radius: 4px; text-decoration: none;">Website</a>` : ''}
            <button onclick="window.showInAppRoute('${bank.name.replace(/'/g, "\\'")}', ${bank.lat}, ${bank.lng}, ${bank.distance})" style="font-size: 11px; padding: 4px 8px; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer;">🧭 In-App Route</button>
          </div>
        </div>
      `;

      const marker = L.marker([bank.lat, bank.lng], { icon })
        .addTo(map)
        .bindPopup(popupHtml);

      markers.push(marker);
      bounds.extend([bank.lat, bank.lng]);
    });

    if (sorted.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }

  window.focusBankOnMap = function (lat, lng) {
    if (!map) return;
    map.flyTo([lat, lng], 15, { duration: 1.2 });
    window.scrollTo({ top: document.querySelector('.map-wrapper').offsetTop - 80, behavior: 'smooth' });
  };

  window.showInAppRoute = function (name, targetLat, targetLng, distanceKm) {
    if (!map) return;

    if (activeRouteLine) {
      map.removeLayer(activeRouteLine);
      activeRouteLine = null;
    }

    const midLat = (currentRefLat + targetLat) / 2 + (targetLng - currentRefLng) * 0.08;
    const midLng = (currentRefLng + targetLng) / 2 - (targetLat - currentRefLat) * 0.08;

    activeRouteLine = L.polyline([
      [currentRefLat, currentRefLng],
      [midLat, midLng],
      [targetLat, targetLng]
    ], {
      color: '#0284c7',
      weight: 5,
      opacity: 0.9,
      dashArray: '8, 8'
    }).addTo(map);

    map.fitBounds([[currentRefLat, currentRefLng], [targetLat, targetLng]], { padding: [60, 60] });

    const drawer = document.getElementById('inAppRouteDrawer');
    if (drawer) {
      document.getElementById('routeTargetName').textContent = name;
      document.getElementById('routeDistanceDisplay').textContent = `${Number(distanceKm).toFixed(1)} km`;
      const estMins = Math.max(3, Math.round(Number(distanceKm) * 2.2));
      document.getElementById('routeEtaDisplay').textContent = `${estMins} mins`;
      document.getElementById('routeExternalGmapsLink').href = `https://www.google.com/maps/dir/${currentRefLat.toFixed(5)},${currentRefLng.toFixed(5)}/${targetLat.toFixed(5)},${targetLng.toFixed(5)}`;
      drawer.style.display = 'block';
    }
  };

  window.closeInAppRoute = function () {
    if (activeRouteLine && map) {
      map.removeLayer(activeRouteLine);
      activeRouteLine = null;
    }
    const drawer = document.getElementById('inAppRouteDrawer');
    if (drawer) drawer.style.display = 'none';
  };

  window.openStaffEditorForBank = function (bankId) {
    openStaffPortal(bankId);
    if (staffPortal) {
      staffPortal.style.display = 'block';
      window.scrollTo({ top: staffPortal.offsetTop - 80, behavior: 'smooth' });
    }
  };

  function populateBankSelect() {
    if (!bankSelect) return;
    const banks = window.IndiaBloodData ? window.IndiaBloodData.getBloodBanks() : [];
    bankSelect.innerHTML = banks.map(b => `<option value="${b.id}">${b.name} (${b.city})</option>`).join('');
  }

  function openStaffPortal(bankId) {
    const banks = window.IndiaBloodData ? window.IndiaBloodData.getBloodBanks() : [];
    const bank = banks.find(b => b.id === bankId);
    if (!bank) return;

    activeStaffBankId = bankId;
    localStorage.setItem('bloodconnect_active_staff_bank', bankId);

    if (activeBankTitle) {
      activeBankTitle.textContent = `Staff Stock Editor — ${bank.name}`;
    }

    renderStockEditorGrid(bank);
    if (staffPortal) staffPortal.style.display = 'block';
    renderBanks();
  }

  function renderStockEditorGrid(bank) {
    if (!stockEditorGrid) return;
    stockEditorGrid.innerHTML = '';

    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Platelets', 'Plasma'];
    groups.forEach(grp => {
      const units = (bank.stock && bank.stock[grp]) || 0;
      const chip = document.createElement('div');
      chip.className = 'stock-editor-chip';
      chip.style = 'background: var(--bg-secondary); border: 1px solid var(--border-glass); border-radius: 8px; padding: 12px; text-align: center;';

      chip.innerHTML = `
        <div style="font-weight: 700; font-size: 14px; margin-bottom: 6px; color: var(--text-main);">${grp}</div>
        <div style="font-size: 22px; font-weight: 800; color: var(--crimson-primary); margin-bottom: 8px;" id="editorUnits-${grp.replace('+', 'pos').replace('-', 'neg')}">
          ${units}
        </div>
        <div style="display: flex; gap: 8px; justify-content: center;">
          <button class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 16px;" onclick="window.modifyStock('${grp}', -1)">−</button>
          <button class="btn btn-primary btn-sm" style="padding: 4px 10px; font-size: 16px;" onclick="window.modifyStock('${grp}', 1)">+</button>
        </div>
      `;
      stockEditorGrid.appendChild(chip);
    });

    // Add Official Restock Dispatch Action Strip
    const actionStrip = document.createElement('div');
    actionStrip.style = 'grid-column: 1 / -1; margin-top: 16px; padding: 14px; background: rgba(0,0,0,0.3); border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.3); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;';
    actionStrip.innerHTML = `
      <div>
        <strong style="color: #f59e0b; font-size: 13px;">🚨 Cold-Chain Logistics & Urgent Requisition Alert</strong>
        <p style="color: var(--text-muted); font-size: 12px; margin: 2px 0 0 0;">Dispatch official DLT SMS & verified email to regional emergency blood distribution hubs.</p>
      </div>
      <button class="btn btn-primary btn-sm" id="btnDispatchRestockAlert" style="background: linear-gradient(135deg, #d97706, #b45309); border: none;">
        📦 Dispatch Official Restock Order
      </button>
    `;
    stockEditorGrid.appendChild(actionStrip);

    document.getElementById('btnDispatchRestockAlert')?.addEventListener('click', () => {
      if (window.OfficialMailer) {
        window.OfficialMailer.sendBloodBankAlert({
          bankName: bank.name,
          bankEmail: bank.email,
          bankPhone: bank.phone,
          bloodGroup: 'O-',
          unitsRequired: 6,
          urgentHospital: 'Victoria Hospital Emergency Trauma Centre'
        });
      }
    });
  }

  window.modifyStock = function (grp, delta) {
    if (!activeStaffBankId) return;
    const updatedBank = window.IndiaBloodData.updateBankStock(activeStaffBankId, grp, delta);
    if (updatedBank) {
      renderStockEditorGrid(updatedBank);
      renderBanks();
      updateMapMarkers();
    }
  };

  function setupEventListeners() {
    // Group filter buttons
    document.querySelectorAll('.group-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.group-filter-btn').forEach(b => {
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        currentGroupFilter = btn.dataset.group;
        renderBanks();
        updateMapMarkers();
      });
    });

    if (citySelect) {
      citySelect.addEventListener('change', () => {
        const city = citySelect.value;
        if (cityCoordinates[city]) {
          currentRefLat = cityCoordinates[city].lat;
          currentRefLng = cityCoordinates[city].lng;
        }
        renderBanks();
        updateMapMarkers();
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderBanks();
        updateMapMarkers();
      });
    }

    window.setBankAreaSearch = function (area, lat, lng) {
      if (searchInput) searchInput.value = area;
      currentRefLat = lat;
      currentRefLng = lng;
      const livePill = document.getElementById('liveBankGpsPill');
      const gpsText = document.getElementById('bankGpsText');
      const gLink = document.getElementById('bankGoogleMapsLink');
      if (livePill) livePill.style.display = 'flex';
      if (gpsText) gpsText.textContent = `📍 Area Reference: ${area} [${lat.toFixed(4)}, ${lng.toFixed(4)}] (Closest Blood Banks First)`;
      if (gLink) gLink.href = `https://www.google.com/maps?q=${lat.toFixed(5)},${lng.toFixed(5)}`;
      renderBanks();
      updateMapMarkers();
    };

    const btnDetectBankGps = document.getElementById('btnDetectBankGps');
    if (btnDetectBankGps) {
      btnDetectBankGps.addEventListener('click', async () => {
        btnDetectBankGps.textContent = '⏳ Locating you...';
        btnDetectBankGps.disabled = true;

        try {
          const coords = await window.BloodConnectGeo.fetchLiveCoordinates();
          currentRefLat = coords.lat;
          currentRefLng = coords.lng;

          const geo = await window.BloodConnectGeo.reverseGeocode(coords.lat, coords.lng);
          if (searchInput) searchInput.value = geo.locality;

          const livePill = document.getElementById('liveBankGpsPill');
          const gpsText = document.getElementById('bankGpsText');
          const gLink = document.getElementById('bankGoogleMapsLink');
          if (livePill) livePill.style.display = 'flex';
          if (gpsText) {
            gpsText.textContent = `📍 Google Maps Live GPS: ${geo.locality}, ${geo.city} [${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}]`;
          }
          if (gLink) gLink.href = geo.googleMapsUrl;

          btnDetectBankGps.textContent = '✓ Live GPS Active';
          btnDetectBankGps.style.background = '#10b981';
          btnDetectBankGps.style.color = '#ffffff';

          if (citySelect) citySelect.value = 'ALL';
          renderBanks();
          updateMapMarkers();
        } catch (err) {
          console.warn('Geolocation fallback activated:', err.message);
          window.setBankAreaSearch('Rotary TTK', 12.9719, 77.6412);
          btnDetectBankGps.textContent = '📍 Detect Live Location';
          alert('GPS permission not granted or timeout. Defaulted to Rotary TTK Blood Centre, Indiranagar.');
        } finally {
          btnDetectBankGps.disabled = false;
        }
      });
    }

    const openStaffLoginBtn = document.getElementById('openStaffLoginBtn');
    if (openStaffLoginBtn && staffLoginModal) {
      openStaffLoginBtn.addEventListener('click', () => {
        staffLoginModal.classList.add('active');
        staffLoginModal.style.display = 'flex';
      });
    }

    const closeStaffModalBtn = document.getElementById('closeStaffModalBtn');
    if (closeStaffModalBtn && staffLoginModal) {
      closeStaffModalBtn.addEventListener('click', () => {
        staffLoginModal.classList.remove('active');
        staffLoginModal.style.display = 'none';
      });
    }

    if (staffLoginModal) {
      staffLoginModal.addEventListener('click', (e) => {
        if (e.target === staffLoginModal) {
          staffLoginModal.classList.remove('active');
          staffLoginModal.style.display = 'none';
        }
      });
    }

    const closeStaffPortalBtn = document.getElementById('closeStaffPortalBtn');
    if (closeStaffPortalBtn && staffPortal) {
      closeStaffPortalBtn.addEventListener('click', () => {
        staffPortal.style.display = 'none';
        activeStaffBankId = null;
        localStorage.removeItem('bloodconnect_active_staff_bank');
        renderBanks();
      });
    }

    if (staffLoginForm) {
      staffLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pinEl = document.getElementById('staffPin') || document.getElementById('staffPasscode') || document.getElementById('staffPinInput');
        const pin = pinEl ? pinEl.value.trim() : '';
        const selectedId = bankSelect ? bankSelect.value : '';

        // Staff PIN check: 2026
        if (pin === '2026') {
          staffLoginModal.classList.remove('active');
          staffLoginModal.style.display = 'none';
          openStaffPortal(selectedId);
        } else {
          if (staffLoginMsg) {
            staffLoginMsg.textContent = 'Invalid Staff PIN. Authorized staff PIN is 2026.';
          }
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
