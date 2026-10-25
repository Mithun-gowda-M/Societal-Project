/**
 * BloodConnect 2026 — Emergency Hospitals & Ambulance Rapid Telematics Controller
 * High-speed distance calculation, live Leaflet map plotting, and 1-click ambulance calling.
 */

(function () {
  'use strict';

  let map;
  let markers = [];
  let userMarker = null;

  // Default coordinate: Bangalore Central (12.9716, 77.5946)
  let currentRefLat = 12.9716;
  let currentRefLng = 77.5946;
  let userGpsGranted = false;

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
    'Chennai': { lat: 13.0827, lng: 80.2707 },
    'Hyderabad': { lat: 17.3850, lng: 78.4867 },
    'Kolkata': { lat: 22.5726, lng: 88.3639 },
    'Ahmedabad': { lat: 23.0225, lng: 72.5714 }
  };

  const listContainer = document.getElementById('hospitalListContainer');
  const searchInput = document.getElementById('hospSearchInput');
  const citySelect = document.getElementById('hospCitySelect');
  const chkBloodBank = document.getElementById('chkBloodBank');
  const resultsCount = document.getElementById('hospResultsCount');
  const btnDetectGps = document.getElementById('btnDetectGps');

  function init() {
    initMap();
    renderHospitals();
    setupEventListeners();
  }

  let activeRouteLine = null;

  function initMap() {
    if (typeof L === 'undefined') return;

    map = L.map('hospitalMapContainer', { preferCanvas: true }).setView([currentRefLat, currentRefLng], 12);

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

  function getSortedHospitals() {
    if (!window.IndiaBloodData) return [];
    const hospitals = window.IndiaBloodData.getHospitals();

    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();
    const selectedCity = citySelect ? citySelect.value : 'ALL';
    const requireBloodBank = chkBloodBank ? chkBloodBank.checked : false;

    // Filter
    const filtered = hospitals.filter(h => {
      if (selectedCity !== 'ALL' && h.city !== selectedCity) return false;
      if (requireBloodBank && (!h.attachedBloodBank || h.attachedBloodBank === 'None')) return false;

      if (query) {
        const matchName = h.name.toLowerCase().includes(query);
        const matchAddress = h.address.toLowerCase().includes(query);
        const matchSpecialty = (h.specialties || []).some(s => s.toLowerCase().includes(query));
        if (!matchName && !matchAddress && !matchSpecialty) return false;
      }
      return true;
    });

    // Calculate real-time distance and sort: NEAREST FIRST!
    const mapped = filtered.map(h => {
      const distance = window.IndiaBloodData.calculateDistance(currentRefLat, currentRefLng, h.lat, h.lng);
      return { ...h, distance };
    });

    mapped.sort((a, b) => a.distance - b.distance);
    return mapped;
  }

  function renderHospitals() {
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const sorted = getSortedHospitals();
    if (resultsCount) {
      resultsCount.textContent = `${sorted.length} trauma facilities located`;
    }

    if (sorted.length === 0) {
      listContainer.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <p style="color: var(--text-muted); font-size: 15px;">No emergency trauma hospitals match your current filters.</p>
        </div>
      `;
      return;
    }

    sorted.forEach((hosp, idx) => {
      const card = document.createElement('div');
      card.className = 'hospital-card';
      card.id = `hosp-card-${hosp.id}`;

      // Estimated ambulance response time based on distance
      const estTimeMins = Math.max(3, Math.round(hosp.distance * 2.2));

      const specialtiesHtml = (hosp.specialties || []).slice(0, 3).map(spec =>
        `<span style="background: rgba(255,255,255,0.05); border: 1px solid var(--border-glass); padding: 2px 8px; border-radius: 4px; font-size: 11px; color: var(--text-muted);">${spec}</span>`
      ).join('');

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 8px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="distance-badge">
                📍 ${hosp.distance} km away • ~${estTimeMins} min ETA
              </span>
              ${idx === 0 ? '<span class="badge badge-verified" style="background: rgba(16, 185, 129, 0.2); color: #10b981;">⚡ Nearest Facility</span>' : ''}
            </div>
            <h3 style="font-family: var(--font-display); font-size: 18px; color: var(--text-main); margin-top: 6px;">
              ${hosp.name}
            </h3>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">
              📍 ${hosp.address}
            </p>
          </div>
          <span style="font-size: 24px;">🏥</span>
        </div>

        <div style="display: flex; gap: 12px; font-size: 12px; margin: 10px 0; flex-wrap: wrap;">
          <span style="color: #10b981; font-weight: 700;">🟢 ${hosp.icuBedsAvailable} Emergency ICU Beds Free</span>
          <span style="color: var(--crimson-accent); font-weight: 600;">🩸 ${hosp.attachedBloodBank}</span>
        </div>

        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px;">
          ${specialtiesHtml}
        </div>

        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <a href="tel:${hosp.emergencyPhone}" class="btn btn-call btn-sm" style="background: #be123c;">
            📞 Call Emergency (${hosp.emergencyPhone})
          </a>
          <a href="tel:${hosp.ambulancePhone || '108'}" class="btn btn-call btn-sm" style="background: #ff3347;">
            🚑 Call Ambulance
          </a>
          <a href="https://wa.me/${hosp.whatsapp ? hosp.whatsapp.replace(/\D/g, '') : '919845011150'}?text=Emergency%20inquiry%20regarding%20${encodeURIComponent(hosp.name)}" 
             target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">
            💬 WhatsApp
          </a>
          <button class="btn btn-secondary btn-sm" onclick="window.showInAppRoute('${hosp.name.replace(/'/g, "\\'")}', ${hosp.lat}, ${hosp.lng}, ${hosp.distance})" style="display: inline-flex; align-items: center; gap: 4px; border-color: #0284c7; color: #0284c7; font-weight: 600;">
            🧭 In-App Directions (${hosp.distance} km)
          </button>
          <a href="https://www.google.com/maps/dir/${currentRefLat.toFixed(5)},${currentRefLng.toFixed(5)}/${hosp.lat.toFixed(5)},${hosp.lng.toFixed(5)}" 
             target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 4px; border-color: #4285F4; color: #4285F4;">
            Google Maps Navigation
          </a>
          <button class="btn btn-secondary btn-sm" onclick="window.focusHospitalMap(${hosp.lat}, ${hosp.lng})">
            🔍 Locate
          </button>
        </div>
      `;

      listContainer.appendChild(card);
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

    // Add User Current Location Pin
    const userIcon = L.divIcon({
      className: 'user-pin',
      html: `<div style="width: 20px; height: 20px; border-radius: 50%; background: #3b82f6; border: 3px solid white; box-shadow: 0 0 14px rgba(59, 130, 246, 0.9);"></div>`,
      iconSize: [20, 20]
    });
    userMarker = L.marker([currentRefLat, currentRefLng], { icon: userIcon })
      .addTo(map)
      .bindPopup(`<strong>📍 You Are Here</strong><br>Distances calculated from: ${currentRefLat.toFixed(4)}, ${currentRefLng.toFixed(4)}<br><a href="https://www.google.com/maps?q=${currentRefLat.toFixed(5)},${currentRefLng.toFixed(5)}" target="_blank" rel="noopener noreferrer" style="color:#38bdf8;font-size:11px;">View on Google Maps</a>`);

    const sorted = getSortedHospitals();
    const bounds = L.latLngBounds([[currentRefLat, currentRefLng]]);

    sorted.forEach((hosp, idx) => {
      const isNearest = idx === 0;
      const icon = L.divIcon({
        className: 'hosp-map-pin',
        html: `<div style="
          width: 32px; height: 32px; border-radius: 50%;
          background: ${isNearest ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ff3347, #be123c)'};
          border: 2px solid #ffffff; box-shadow: 0 0 14px ${isNearest ? 'rgba(16, 185, 129, 0.8)' : 'rgba(255, 51, 71, 0.7)'};
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 15px; font-weight: bold;">🏥</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const popupHtml = `
        <div style="font-family: sans-serif; min-width: 220px; padding: 4px;">
          <strong style="color: #be123c; font-size: 14px;">${hosp.name}</strong>
          <p style="font-size: 12px; margin: 4px 0 6px; color: #475569;">${hosp.address}</p>
          <div style="margin-bottom: 6px;">
            <span style="font-size: 11px; padding: 2px 6px; background: #e0f2fe; color: #0284c7; border-radius: 4px; font-weight: bold;">
              📍 ${hosp.distance} km away
            </span>
            <span style="font-size: 11px; padding: 2px 6px; background: #dcfce7; color: #16a34a; border-radius: 4px; font-weight: bold;">
              ${hosp.icuBedsAvailable} ICU beds
            </span>
          </div>
          <div style="display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap;">
            <a href="tel:${hosp.emergencyPhone}" style="font-size: 11px; padding: 4px 8px; background: #be123c; color: white; border-radius: 4px; text-decoration: none;">Call Hospital</a>
            <a href="tel:108" style="font-size: 11px; padding: 4px 8px; background: #ff3347; color: white; border-radius: 4px; text-decoration: none;">Ambulance 108</a>
            <a href="https://www.google.com/maps/dir/${currentRefLat.toFixed(5)},${currentRefLng.toFixed(5)}/${hosp.lat.toFixed(5)},${hosp.lng.toFixed(5)}" target="_blank" rel="noopener noreferrer" style="font-size: 11px; padding: 4px 8px; background: #4285F4; color: white; border-radius: 4px; text-decoration: none;">🧭 Google Maps</a>
          </div>
        </div>
      `;

      const m = L.marker([hosp.lat, hosp.lng], { icon })
        .addTo(map)
        .bindPopup(popupHtml);

      markers.push(m);
      bounds.extend([hosp.lat, hosp.lng]);
    });

    if (sorted.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }

  window.focusHospitalMap = function (lat, lng) {
    if (!map) return;
    map.flyTo([lat, lng], 15, { duration: 1 });
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

  window.setHospitalAreaSearch = function (area, lat, lng) {
    if (searchInput) searchInput.value = area;
    currentRefLat = lat;
    currentRefLng = lng;
    userGpsGranted = true;
    const livePill = document.getElementById('liveHospGpsPill');
    const gpsText = document.getElementById('hospGpsText');
    const gLink = document.getElementById('hospGoogleMapsLink');
    if (livePill) livePill.style.display = 'flex';
    if (gpsText) gpsText.textContent = `📍 Area Reference: ${area} [${lat.toFixed(4)}, ${lng.toFixed(4)}] (Trauma Facilities Sorted Closest First)`;
    if (gLink) gLink.href = `https://www.google.com/maps?q=${lat.toFixed(5)},${lng.toFixed(5)}`;
    renderHospitals();
    updateMapPins();
  };

  function setupEventListeners() {
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        renderHospitals();
        updateMapPins();
      });
    }

    if (citySelect) {
      citySelect.addEventListener('change', () => {
        const city = citySelect.value;
        if (cityCoordinates[city]) {
          currentRefLat = cityCoordinates[city].lat;
          currentRefLng = cityCoordinates[city].lng;
        }
        renderHospitals();
        updateMapPins();
      });
    }

    if (chkBloodBank) {
      chkBloodBank.addEventListener('change', () => {
        renderHospitals();
        updateMapPins();
      });
    }

    if (btnDetectGps) {
      btnDetectGps.addEventListener('click', async () => {
        btnDetectGps.textContent = '⏳ Locating you...';
        btnDetectGps.disabled = true;

        try {
          const coords = await window.BloodConnectGeo.fetchLiveCoordinates();
          currentRefLat = coords.lat;
          currentRefLng = coords.lng;
          userGpsGranted = true;

          const geo = await window.BloodConnectGeo.reverseGeocode(coords.lat, coords.lng);
          if (searchInput) searchInput.value = geo.locality;

          const livePill = document.getElementById('liveHospGpsPill');
          const gpsText = document.getElementById('hospGpsText');
          const gLink = document.getElementById('hospGoogleMapsLink');
          if (livePill) livePill.style.display = 'flex';
          if (gpsText) {
            gpsText.textContent = `📍 Google Maps Live GPS: ${geo.locality}, ${geo.city} [${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}]`;
          }
          if (gLink) gLink.href = geo.googleMapsUrl;

          btnDetectGps.textContent = '✓ Live GPS Active';
          btnDetectGps.style.background = '#10b981';
          btnDetectGps.style.color = '#ffffff';

          if (citySelect) citySelect.value = 'ALL';
          renderHospitals();
          updateMapPins();
        } catch (err) {
          console.warn('Geolocation fallback activated:', err.message);
          window.setHospitalAreaSearch('Victoria', 12.9625, 77.5750);
          btnDetectGps.textContent = '📍 Detect My Live GPS Location';
          alert('GPS permission not granted or timeout. Defaulted to Victoria Hospital, KR Market.');
        } finally {
          btnDetectGps.disabled = false;
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
