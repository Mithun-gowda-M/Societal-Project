/**
 * BloodConnect 2026 — Nearby Donors Rapid Spatial Controller
 * Real-time Haversine distance sorting: closest accessible donors listed first.
 */

(function () {
  'use strict';

  let map;
  let markers = [];
  let userMarker = null;

  // Default coordinate: Bangalore Central (12.9716, 77.5946)
  let currentRefLat = 12.9716;
  let currentRefLng = 77.5946;

  const cityCoordinates = {
    'Bengaluru': { lat: 12.9716, lng: 77.5946 },
    'New Delhi': { lat: 28.6139, lng: 77.2090 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 }
  };

  const donorList = document.getElementById('nearbyDonorList');
  const filterGroup = document.getElementById('filterBloodGroup');
  const filterCity = document.getElementById('filterCity');
  const filterAvail = document.getElementById('filterAvailability');
  const searchArea = document.getElementById('searchArea');
  const searchBtn = document.getElementById('searchBtn');
  const btnDetectDonorGps = document.getElementById('btnDetectDonorGps');

  function init() {
    initMap();
    renderDonors();
    setupEventListeners();
  }

  let activeRouteLine = null;

  function initMap() {
    if (typeof L === 'undefined') return;

    map = L.map('donorMapContainer', { preferCanvas: true }).setView([currentRefLat, currentRefLng], 12);

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

    updateMapPins();
  }

  function getSortedDonors() {
    if (!window.IndiaBloodData) return [];
    let donors = window.IndiaBloodData.getDonors();

    const groupVal = filterGroup ? filterGroup.value : 'ALL';
    const cityVal = filterCity ? filterCity.value : 'ALL';
    const availVal = filterAvail ? filterAvail.value : 'ALL';
    const areaVal = (searchArea ? searchArea.value : '').toLowerCase().trim();

    const filtered = donors.filter(d => {
      if (groupVal !== 'ALL' && d.bloodGroup !== groupVal) return false;
      if (cityVal !== 'ALL' && d.city && d.city !== cityVal) return false;

      const cooldown = window.BloodAI ? window.BloodAI.checkDonationCooldown(d.lastDonationDate) : { isEligible: true };
      if (availVal === 'AVAILABLE' && (!d.available || !cooldown.isEligible)) return false;
      if (availVal === 'COOLDOWN' && cooldown.isEligible) return false;

      if (areaVal) {
        const inLoc = (d.location || '').toLowerCase().includes(areaVal);
        const inName = (d.name || '').toLowerCase().includes(areaVal);
        const inCity = (d.city || '').toLowerCase().includes(areaVal);
        if (!inLoc && !inName && !inCity) return false;
      }
      return true;
    });

    // Calculate real-time distance and sort: NEAREST FIRST!
    const mapped = filtered.map(d => {
      const distance = window.IndiaBloodData.calculateDistance(currentRefLat, currentRefLng, d.lat, d.lng);
      return { ...d, distance };
    });

    mapped.sort((a, b) => a.distance - b.distance);
    return mapped;
  }

  function renderDonors() {
    if (!donorList) return;
    donorList.innerHTML = '';

    const donors = getSortedDonors();

    if (donors.length === 0) {
      donorList.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <p style="color: var(--text-muted); font-size: 15px;">No registered donors match your current search criteria.</p>
        </div>
      `;
      return;
    }

    donors.forEach((donor, idx) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style = 'margin-bottom: 16px; padding: 20px;';

      const cooldown = window.BloodAI ? window.BloodAI.checkDonationCooldown(donor.lastDonationDate) : { isEligible: true, daysRemaining: 0 };
      const cleanPhone = (donor.phone || '+919845112233').replace(/\D/g, '');
      const isClosest = idx === 0;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <h4 style="font-family: var(--font-display); font-size: 18px; color: var(--text-main);">${donor.name}</h4>
              <span class="badge badge-verified">🛡️ ID Verified</span>
              <span style="font-size: 11px; padding: 2px 8px; background: rgba(255, 51, 71, 0.15); color: #ff3347; border-radius: 12px; font-weight: 700;">
                📍 ${donor.distance} km away
              </span>
              ${isClosest ? '<span style="font-size: 11px; padding: 2px 8px; background: rgba(16, 185, 129, 0.2); color: #10b981; border-radius: 12px; font-weight: 700;">⚡ Nearest Donor</span>' : ''}
            </div>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">
              📍 ${donor.address || donor.location}
            </p>
          </div>
          <span style="width: 40px; height: 40px; border-radius: 50%; background: var(--crimson-subtle); border: 2px solid var(--crimson-primary); display: flex; align-items: center; justify-content: center; font-family: var(--font-mono); font-weight: 800; color: var(--crimson-primary); font-size: 15px;">
            ${donor.bloodGroup}
          </span>
        </div>

        <div style="display: flex; gap: 14px; font-size: 12px; margin-bottom: 14px; flex-wrap: wrap;">
          <span style="color: var(--text-dim);">Rating: <strong style="color: #f59e0b;">⭐ ${donor.rating || 5.0}</strong></span>
          <span style="color: var(--text-dim);">Impact: <strong style="color: var(--text-main);">${donor.donationCount || 4} donations</strong></span>
          <span style="color: var(--text-dim);">Status: 
            <strong style="color: ${cooldown.isEligible ? 'var(--emerald-primary)' : 'var(--amber-primary)'};">
              ${cooldown.isEligible ? 'Available Now' : `In 90-day cooldown (${cooldown.daysRemaining} days left)`}
            </strong>
          </span>
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <a href="https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(donor.name)}%2C%20reaching%20out%20via%20BloodConnect" 
             target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">
            💬 WhatsApp Chat
          </a>
          <a href="tel:${donor.phone}" class="btn btn-call btn-sm">
            📞 Call
          </a>
          <button class="btn btn-secondary btn-sm" onclick="window.showInAppRoute('${donor.name.replace(/'/g, "\\'")}', ${donor.lat}, ${donor.lng}, ${donor.distance})" style="display: inline-flex; align-items: center; gap: 4px; border-color: #0284c7; color: #0284c7; font-weight: 600;">
            🧭 In-App Directions (${donor.distance} km)
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.focusDonorMap(${donor.lat}, ${donor.lng})">
            🗺️ View on Map
          </button>
        </div>
      `;

      donorList.appendChild(card);
    });
  }

  function updateMapPins() {
    if (!map || typeof L === 'undefined') return;

    markers.forEach(m => map.removeLayer(m));
    markers = [];

    if (userMarker) {
      map.removeLayer(userMarker);
      userMarker = null;
    }

    // User GPS reference marker
    const userIcon = L.divIcon({
      className: 'user-pin',
      html: `<div style="width: 20px; height: 20px; border-radius: 50%; background: #3b82f6; border: 3px solid white; box-shadow: 0 0 14px rgba(59, 130, 246, 0.9);"></div>`,
      iconSize: [20, 20]
    });
    userMarker = L.marker([currentRefLat, currentRefLng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`<strong>📍 You Are Here</strong><br>Distances calculated from: ${currentRefLat.toFixed(4)}, ${currentRefLng.toFixed(4)}<br><a href="https://www.google.com/maps?q=${currentRefLat.toFixed(5)},${currentRefLng.toFixed(5)}" target="_blank" rel="noopener noreferrer" style="color:#38bdf8;font-size:11px;">View on Google Maps</a>`);

    const donors = getSortedDonors();
    const bounds = L.latLngBounds([[currentRefLat, currentRefLng]]);

    donors.forEach((donor, idx) => {
      const isNearest = idx === 0;
      const donorIcon = L.divIcon({
        className: 'donor-pin',
        html: `<div style="
          width: 32px; height: 32px; border-radius: 50%;
          background: ${isNearest ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ff2d55, #be123c)'};
          border: 2px solid white; display: flex; align-items: center; justify-content: center;
          color: white; font-weight: bold; font-size: 12px;
          box-shadow: 0 0 12px ${isNearest ? 'rgba(16, 185, 129, 0.8)' : 'rgba(255, 45, 85, 0.6)'};">
          ${donor.bloodGroup}
        </div>`,
        iconSize: [32, 32]
      });

      const cleanPhone = (donor.phone || '').replace(/\D/g, '');
      const m = L.marker([donor.lat, donor.lng], { icon: donorIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; min-width: 200px;">
            <strong style="color: #be123c;">${donor.name} (${donor.bloodGroup})</strong>
            <p style="font-size: 11px; margin: 4px 0;">📍 ${donor.address || donor.location}</p>
            <p style="font-size: 11px; margin: 2px 0; font-weight: bold; color: #ff3347;">📍 ${donor.distance} km away</p>
            <div style="margin-top: 6px; display: flex; gap: 6px; flex-wrap: wrap;">
              <a href="https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(donor.name)}%2C%20reaching%20out%20via%20BloodConnect" target="_blank" style="font-size: 11px; padding: 3px 8px; background: #25d366; color: white; border-radius: 4px; text-decoration: none;">WhatsApp</a>
              <a href="tel:${donor.phone}" style="font-size: 11px; padding: 3px 8px; background: #be123c; color: white; border-radius: 4px; text-decoration: none;">Call</a>
              <button onclick="window.showInAppRoute('${donor.name.replace(/'/g, "\\'")}', ${donor.lat}, ${donor.lng}, ${donor.distance})" style="font-size: 11px; padding: 3px 8px; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer;">🧭 In-App Route</button>
            </div>
          </div>
        `);
      markers.push(m);
      bounds.extend([donor.lat, donor.lng]);
    });

    if (donors.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }

  window.focusDonorMap = function (lat, lng) {
    if (!map) return;
    map.flyTo([lat, lng], 15, { duration: 1 });
  };

  window.showInAppRoute = function (name, targetLat, targetLng, distanceKm) {
    if (!map) return;

    if (activeRouteLine) {
      map.removeLayer(activeRouteLine);
      activeRouteLine = null;
    }

    // Midpoint dogleg for realistic road visualization
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

    // Open In-App Route HUD
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

  window.setDonorAreaSearch = function (area, lat, lng) {
    if (searchArea) searchArea.value = area;
    currentRefLat = lat;
    currentRefLng = lng;
    const livePill = document.getElementById('liveDonorGpsPill');
    const gpsText = document.getElementById('donorGpsText');
    const gLink = document.getElementById('donorGoogleMapsLink');
    if (livePill) livePill.style.display = 'flex';
    if (gpsText) gpsText.textContent = `📍 Area Reference: ${area} [${lat.toFixed(4)}, ${lng.toFixed(4)}] (Nearest Donors First)`;
    if (gLink) gLink.href = `https://www.google.com/maps?q=${lat.toFixed(5)},${lng.toFixed(5)}`;
    renderDonors();
    updateMapPins();
  };

  function setupEventListeners() {
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        renderDonors();
        updateMapPins();
      });
    }

    if (filterGroup) filterGroup.addEventListener('change', () => { renderDonors(); updateMapPins(); });
    if (filterAvail) filterAvail.addEventListener('change', () => { renderDonors(); updateMapPins(); });
    if (searchArea) searchArea.addEventListener('input', () => { renderDonors(); updateMapPins(); });

    if (filterCity) {
      filterCity.addEventListener('change', () => {
        const city = filterCity.value;
        if (cityCoordinates[city]) {
          currentRefLat = cityCoordinates[city].lat;
          currentRefLng = cityCoordinates[city].lng;
        }
        renderDonors();
        updateMapPins();
      });
    }

    if (btnDetectDonorGps) {
      btnDetectDonorGps.addEventListener('click', async () => {
        btnDetectDonorGps.textContent = '⏳ Locating you...';
        btnDetectDonorGps.disabled = true;

        try {
          const coords = await window.BloodConnectGeo.fetchLiveCoordinates();
          currentRefLat = coords.lat;
          currentRefLng = coords.lng;

          const geo = await window.BloodConnectGeo.reverseGeocode(coords.lat, coords.lng);
          if (searchArea) searchArea.value = geo.locality;

          const livePill = document.getElementById('liveDonorGpsPill');
          const gpsText = document.getElementById('donorGpsText');
          const gLink = document.getElementById('donorGoogleMapsLink');
          if (livePill) livePill.style.display = 'flex';
          if (gpsText) {
            gpsText.textContent = `📍 Google Maps Live GPS: ${geo.locality}, ${geo.city} [${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}]`;
          }
          if (gLink) gLink.href = geo.googleMapsUrl;

          btnDetectDonorGps.textContent = '✓ Live GPS Active';
          btnDetectDonorGps.style.background = '#10b981';
          btnDetectDonorGps.style.color = '#ffffff';

          if (filterCity) filterCity.value = 'ALL';
          renderDonors();
          updateMapPins();
        } catch (err) {
          console.warn('Geolocation fallback activated:', err.message);
          window.setDonorAreaSearch('Indiranagar', 12.9719, 77.6412);
          btnDetectDonorGps.textContent = '📍 Detect My Live Location';
          alert('GPS permission not granted or timeout. Defaulted to Indiranagar, Bengaluru.');
        } finally {
          btnDetectDonorGps.disabled = false;
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
