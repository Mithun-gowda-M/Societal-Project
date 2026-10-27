/**
 * BloodConnect 2026 — Live Patient-to-Donor Transit & Real-Time Tracking Engine
 * 
 * Includes:
 * 1. Ultra-fast Leaflet map with Google Maps Road, Satellite, and Terrain basemaps.
 * 2. Realistic road waypoint navigation from Hero Donor location to Patient Hospital Bed.
 * 3. Dynamic distance-to-patient countdown, ETA, and turn-by-turn street maneuvers.
 * 4. Dual-mode support (Ground Donor Vehicle vs AeroLife Medical Drone Airway).
 * 5. Deep-linking to Google Maps turn-by-turn GPS navigation.
 */

(function () {
  'use strict';

  let map = null;
  let activeTileLayer = null;
  let vehicleMarker = null;
  let routePolyline = null;
  let simulationInterval = null;
  let isPaused = false;

  // Dynamic Patient Destination (Reads live emergency request from localStorage)
  const storedPatient = localStorage.getItem('requestPatient') || 'Ramesh Sundaram';
  const storedHospital = localStorage.getItem('requestHospital') || 'Victoria Hospital Emergency Trauma ICU';
  const storedHospitalAddr = localStorage.getItem('requestHospitalAddress') || 'Fort Road, near City Market, Kalasipalya, Bengaluru';
  const storedGroup = localStorage.getItem('requestBloodGroup') || 'O-';
  const storedUnits = localStorage.getItem('requestUnits') || '2';
  const patientLat = parseFloat(localStorage.getItem('requestLatitude')) || 12.9625;
  const patientLng = parseFloat(localStorage.getItem('requestLongitude')) || 77.5750;

  // Dynamic Accepted Hero Donor (Reads accepted donor from localStorage or profile)
  const donorName = localStorage.getItem('dispatchDonorName') || 'Dr. Arjun K. Rao';
  const donorLat = parseFloat(localStorage.getItem('dispatchDonorLat')) || 12.9719;
  const donorLng = parseFloat(localStorage.getItem('dispatchDonorLng')) || 77.6412;
  const donorAddress = localStorage.getItem('dispatchDonorAddress') || '100 Feet Rd, Indiranagar, Bengaluru';
  const donorPhone = localStorage.getItem('dispatchDonorPhone') || '+91 98451 12233';

  const PATIENT_LOCATION = {
    lat: patientLat,
    lng: patientLng,
    name: storedHospital,
    patient: storedPatient,
    group: `${storedGroup} (${storedUnits} Units PRBC)`,
    address: storedHospitalAddr
  };

  function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.max(1.5, Number((R * c * 1.28).toFixed(1))); // Road detour factor
  }

  const TOTAL_DISTANCE_KM = calculateDistanceKm(donorLat, donorLng, patientLat, patientLng);

  // Generate realistic turn-by-turn road waypoints between Donor Departure and Hospital
  function buildGroundRoute(start, end) {
    const waypoints = [];
    const count = 8;
    const maneuvers = [
      `Starting emergency journey from ${donorAddress.split(',')[0]}`,
      'Merging onto main urban arterial corridor',
      'Passing central green wave traffic synchronization node',
      'Taking expressway flyover towards emergency medical district',
      'Entering priority hospital emergency transit corridor',
      'Proceeding through underpass signal bypass',
      `Approaching ${end.name} central trauma complex`,
      `Arrived at ${end.name} — Patient Emergency Bedside`
    ];

    for (let i = 0; i < count; i++) {
      const pct = i / (count - 1);
      // Realistic road curve arc
      const arc = Math.sin(pct * Math.PI) * 0.005;
      const lat = start.lat + (end.lat - start.lat) * pct + arc;
      const lng = start.lng + (end.lng - start.lng) * pct;
      waypoints.push({
        lat,
        lng,
        name: i === 0 ? `${donorName} Departure` : (i === count - 1 ? end.name : `Waypoint ${i}`),
        maneuver: maneuvers[i]
      });
    }
    return waypoints;
  }

  // Generate Drone Corridor (Direct airborne vector)
  function buildDroneRoute(start, end) {
    const count = 5;
    const waypoints = [];
    for (let i = 0; i < count; i++) {
      const pct = i / (count - 1);
      waypoints.push({
        lat: start.lat + (end.lat - start.lat) * pct,
        lng: start.lng + (end.lng - start.lng) * pct,
        name: i === 0 ? 'Medical Drone Hub Takeoff' : (i === count - 1 ? `${end.name} Rooftop Helipad` : `Airway Vector ${i}`),
        maneuver: i === 0 ? 'Autonomous VTOL Ascent completed @ 120m AGL' : (i === count - 1 ? 'Touchdown locked on hospital rooftop pad' : 'Cruising in DGCA Green Airway @ 72 km/h')
      });
    }
    return waypoints;
  }

  const GROUND_ROUTE_WAYPOINTS = buildGroundRoute({ lat: donorLat, lng: donorLng }, PATIENT_LOCATION);
  const DRONE_ROUTE_WAYPOINTS = buildDroneRoute({ lat: donorLat, lng: donorLng }, PATIENT_LOCATION);

  let currentMode = 'GROUND'; // Default: Ground donor
  let progress = 0.08; // Starts early along route (8% completed)
  let arrivalTriggered = false;

  const MAP_LAYERS = {
    GOOGLE_ROAD: {
      url: 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attr: '&copy; Google Maps',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    },
    GOOGLE_SAT: {
      url: 'https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attr: '&copy; Google Maps Satellite',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    },
    GOOGLE_TERRAIN: {
      url: 'https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      attr: '&copy; Google Maps Terrain',
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    }
  };

  function initMap() {
    const mapEl = document.getElementById('trackingMapContainer');
    if (!mapEl) return;

    // Fast Map Init & Instant Framing: Centered dynamically between donor and patient
    const midLat = (donorLat + patientLat) / 2;
    const midLng = (donorLng + patientLng) / 2;

    map = L.map('trackingMapContainer', {
      center: [midLat, midLng],
      zoom: 13,
      zoomControl: true,
      preferCanvas: true
    });

    // Default fast Google Maps road layer
    setMapBaseLayer('GOOGLE_ROAD');

    // Anti-glitch layout size recalculation
    window.addEventListener('resize', () => { if (map) map.invalidateSize(); });
    setTimeout(() => { if (map) map.invalidateSize(); }, 100);
    setTimeout(() => { if (map) map.invalidateSize(); }, 350);
    setTimeout(() => { if (map) map.invalidateSize(); }, 1000);

    // 1. Patient Hospital Bed Marker
    const patientIcon = L.divIcon({
      className: 'patient-marker',
      html: `<div style="background: #c1121f; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; border: 3px solid #ffffff; box-shadow: 0 0 25px rgba(193, 18, 31, 0.9);">🏥</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    L.marker([PATIENT_LOCATION.lat, PATIENT_LOCATION.lng], { icon: patientIcon })
      .addTo(map)
      .bindPopup(`
        <strong style="color: #be123c;">${PATIENT_LOCATION.name}</strong><br/>
        Patient: <strong>${PATIENT_LOCATION.patient}</strong><br/>
        Prescribed: <span style="color:#ff3347;font-weight:700;">${PATIENT_LOCATION.group}</span><br/>
        📍 ${PATIENT_LOCATION.address}
      `)
      .openPopup();

    // 2. Draw Route Polyline
    drawRouteLine();

    // 3. Moving Donor Marker
    const initialPos = interpolatePath(getActiveWaypoints(), progress);
    const donorIcon = getVehicleIcon();

    vehicleMarker = L.marker([initialPos.lat, initialPos.lng], { icon: donorIcon })
      .addTo(map)
      .bindPopup(`<strong>${donorName} (Hero Donor)</strong><br/>En route from ${donorAddress.split(',')[0]}`);

    // Fit bounds instantly with zero lag
    map.fitBounds([[donorLat, donorLng], [patientLat, patientLng]], {
      padding: [50, 50],
      maxZoom: 14
    });

    // Populate UI Strip with live details
    const trackPatientEl = document.getElementById('trackPatient');
    if (trackPatientEl) trackPatientEl.textContent = `${PATIENT_LOCATION.patient} (Trauma Bedside)`;

    const trackHospitalEl = document.getElementById('trackHospital');
    if (trackHospitalEl) trackHospitalEl.textContent = `${PATIENT_LOCATION.name} • ${PATIENT_LOCATION.address}`;

    const trackGroupEl = document.getElementById('trackGroup');
    if (trackGroupEl) trackGroupEl.textContent = PATIENT_LOCATION.group;

    const donorCardNameEl = document.getElementById('donorCardName');
    if (donorCardNameEl) donorCardNameEl.textContent = `${donorName} (${storedGroup} Compatible Match)`;

    const cleanDonorPhone = donorPhone.replace(/\D/g, '');
    const callBtn = document.getElementById('btnCallDonor');
    if (callBtn) {
      callBtn.href = `tel:${donorPhone}`;
      callBtn.textContent = `📞 Call ${donorName.split(' ')[0]} (${donorPhone})`;
    }
    const waBtn = document.getElementById('btnWhatsAppDonor');
    if (waBtn) {
      waBtn.href = `https://wa.me/${cleanDonorPhone}?text=Hello%20${encodeURIComponent(donorName)}%2C%20thank%20you%20for%20accepting%20the%20emergency%20requisition%20for%20${encodeURIComponent(storedPatient)}.`;
    }

    startLiveTrackingSimulation();
  }

  function getActiveWaypoints() {
    return currentMode === 'GROUND' ? GROUND_ROUTE_WAYPOINTS : DRONE_ROUTE_WAYPOINTS;
  }

  function getVehicleIcon() {
    if (currentMode === 'GROUND') {
      return L.divIcon({
        className: 'vehicle-marker',
        html: `<div style="background: #10b981; color: #020617; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 22px; border: 3px solid #ffffff; box-shadow: 0 0 25px #10b981;">🚗</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
    } else {
      return L.divIcon({
        className: 'drone-marker',
        html: `<div style="background: #38bdf8; color: #020617; border-radius: 50%; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; font-size: 22px; border: 3px solid #ffffff; box-shadow: 0 0 25px #38bdf8;">🛸</div>`,
        iconSize: [42, 42],
        iconAnchor: [21, 21]
      });
    }
  }

  function drawRouteLine() {
    if (routePolyline && map) map.removeLayer(routePolyline);

    const waypoints = getActiveWaypoints();
    const latlngs = waypoints.map(w => [w.lat, w.lng]);
    const color = currentMode === 'GROUND' ? '#10b981' : '#38bdf8';

    routePolyline = L.polyline(latlngs, {
      color,
      weight: 5,
      dashArray: currentMode === 'DRONE' ? '8, 8' : null,
      opacity: 0.85
    }).addTo(map);
  }

  function interpolatePath(points, pct) {
    if (pct <= 0) return points[0];
    if (pct >= 1) return points[points.length - 1];

    const totalSegments = points.length - 1;
    const scaled = pct * totalSegments;
    const idx = Math.min(Math.floor(scaled), totalSegments - 1);
    const subPct = scaled - idx;

    const p1 = points[idx];
    const p2 = points[idx + 1];

    return {
      lat: p1.lat + (p2.lat - p1.lat) * subPct,
      lng: p1.lng + (p2.lng - p1.lng) * subPct,
      maneuver: p1.maneuver
    };
  }

  function startLiveTrackingSimulation() {
    if (simulationInterval) clearInterval(simulationInterval);

    simulationInterval = setInterval(() => {
      if (isPaused) return;

      // Realistic increment: ~0.008 per second (completes journey in ~2 minutes of live viewing, or loops)
      progress += 0.008;

      if (progress >= 1.0) {
        progress = 1.0;
        onDonorArrived();
      }

      const waypoints = getActiveWaypoints();
      const pos = interpolatePath(waypoints, progress);

      if (vehicleMarker) {
        vehicleMarker.setLatLng([pos.lat, pos.lng]);
      }

      // Calculate Remaining Distance to Patient
      const distRemainingKm = Math.max(0, ((1 - progress) * TOTAL_DISTANCE_KM)).toFixed(1);
      const pctRounded = Math.round(progress * 100);

      // ETA Calculation
      const speedKmh = currentMode === 'GROUND' ? (36 + Math.round(Math.sin(Date.now() / 2000) * 4)) : 72;
      const hoursRemaining = (distRemainingKm / speedKmh);
      const minutesRemaining = Math.max(0, Math.round(hoursRemaining * 60));

      // Update UI elements
      const distEl = document.getElementById('hudDistanceVal');
      if (distEl) distEl.textContent = `${distRemainingKm} km`;

      const etaEl = document.getElementById('hudEtaVal');
      if (etaEl) {
        etaEl.textContent = progress >= 0.98 ? 'Arrived!' : `~${minutesRemaining} mins`;
        etaEl.style.color = progress >= 0.98 ? '#10b981' : '#ff3347';
      }

      const fillEl = document.getElementById('hudProgressFill');
      if (fillEl) fillEl.style.width = `${pctRounded}%`;

      const pctText = document.getElementById('hudPctText');
      if (pctText) pctText.textContent = `${pctRounded}% Traversed`;

      const velText = document.getElementById('hudVelocityText');
      if (velText) velText.textContent = `${speedKmh} km/h`;

      // Active Street Maneuver
      const segIndex = Math.min(Math.floor(progress * (waypoints.length - 1)), waypoints.length - 1);
      const currentWp = waypoints[segIndex];
      const maneuverText = document.getElementById('maneuverText');
      if (maneuverText && currentWp) {
        maneuverText.textContent = currentWp.maneuver;
      }

      // Update Google Maps live navigation deep link with current real-time GPS coordinates
      const gNavBtn = document.getElementById('btnGoogleMapsNav');
      if (gNavBtn) {
        gNavBtn.href = `https://www.google.com/maps/dir/${pos.lat.toFixed(5)},${pos.lng.toFixed(5)}/${PATIENT_LOCATION.lat},${PATIENT_LOCATION.lng}`;
      }
    }, 1000);
  }

  function onDonorArrived() {
    if (arrivalTriggered) return;
    arrivalTriggered = true;

    const badge = document.getElementById('transitStatusBadge');
    if (badge) {
      badge.textContent = '🎉 ARRIVED AT PATIENT ICU — PHLEBOTOMY COMMENCED';
      badge.style.background = '#10b981';
      badge.style.color = '#020617';
    }

    const maneuverText = document.getElementById('maneuverText');
    if (maneuverText) {
      maneuverText.textContent = 'Hero Donor Dr. Arjun Rao has arrived at Victoria Hospital ICU Bay 4. Whole Blood cross-match ready.';
    }

    // Trigger Official Patient Notification
    if (window.OfficialMailer) {
      window.OfficialMailer.sendPatientUpdate({
        patientName: 'Ramesh Sundaram',
        patientPhone: '+91 98450 11150',
        patientEmail: 'family@patient.org',
        hospitalName: 'Victoria Hospital Emergency Trauma',
        bloodGroup: 'O-',
        donorName: 'Dr. Arjun K. Rao (ARRIVED AT PATIENT BED)'
      });
    }

    // Auto-reset loop after 15 seconds for continuous showcase
    setTimeout(() => {
      progress = 0.08;
      arrivalTriggered = false;
      const b = document.getElementById('transitStatusBadge');
      if (b) {
        b.textContent = 'DONOR ACCEPTED & EN ROUTE';
        b.style.background = 'rgba(16, 185, 129, 0.2)';
        b.style.color = '#10b981';
      }
    }, 15000);
  }

  // Public Interface Methods
  window.setMapBaseLayer = function (layerKey) {
    if (!map || !MAP_LAYERS[layerKey]) return;

    if (activeTileLayer) map.removeLayer(activeTileLayer);

    const cfg = MAP_LAYERS[layerKey];
    activeTileLayer = L.tileLayer(cfg.url, {
      attribution: cfg.attr,
      subdomains: cfg.subdomains || ['0', '1', '2', '3'],
      maxZoom: 20
    }).addTo(map);

    setTimeout(() => { if (map) map.invalidateSize(); }, 60);

    // Update active button state
    ['btnLayerGoogleRoad', 'btnLayerGoogleSat', 'btnLayerGoogleTerrain'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.classList.remove('active');
    });

    if (layerKey === 'GOOGLE_ROAD') document.getElementById('btnLayerGoogleRoad')?.classList.add('active');
    if (layerKey === 'GOOGLE_SAT') document.getElementById('btnLayerGoogleSat')?.classList.add('active');
    if (layerKey === 'GOOGLE_TERRAIN') document.getElementById('btnLayerGoogleTerrain')?.classList.add('active');
  };

  window.switchDispatchMode = function (mode) {
    currentMode = mode;
    const btnGround = document.getElementById('btnModeGround');
    const btnDrone = document.getElementById('btnModeDrone');
    const mIcon = document.getElementById('maneuverIcon');
    const mHeader = document.getElementById('maneuverHeader');
    const payloadStatus = document.getElementById('hudPayloadStatus');

    if (mode === 'GROUND') {
      if (btnGround) btnGround.classList.add('active');
      if (btnDrone) btnDrone.classList.remove('active');
      if (mIcon) mIcon.textContent = '🚗';
      if (mHeader) mHeader.textContent = 'Ground Road Navigation';
      if (payloadStatus) payloadStatus.textContent = 'Whole Blood Ready';
    } else {
      if (btnGround) btnGround.classList.remove('active');
      if (btnDrone) btnDrone.classList.add('active');
      if (mIcon) mIcon.textContent = '🛸';
      if (mHeader) mHeader.textContent = 'AeroLife Drone Airway';
      if (payloadStatus) payloadStatus.textContent = '3.8°C Cold Safe';
    }

    drawRouteLine();
    if (vehicleMarker) {
      vehicleMarker.setIcon(getVehicleIcon());
    }
  };

  window.toggleTransitSimulation = function () {
    isPaused = !isPaused;
  };

  document.addEventListener('DOMContentLoaded', () => {
    // Read from localStorage if user arrived from emergency workflow
    const p = localStorage.getItem('requestPatient');
    const h = localStorage.getItem('requestHospital');
    const g = localStorage.getItem('requestBloodGroup');
    const u = localStorage.getItem('requestUnits');

    if (p && document.getElementById('trackPatient')) document.getElementById('trackPatient').textContent = `${p} (Trauma ICU, Bay 4)`;
    if (h && document.getElementById('trackHospital')) document.getElementById('trackHospital').textContent = h;
    if (g && document.getElementById('trackGroup')) document.getElementById('trackGroup').textContent = `${g} (${u || 2} Units PRBC)`;

    initMap();
  });
})();
