/**
 * BloodConnect 2026 — AI Matching Results Controller
 * Ranks compatible donors by AI Donor Response Prediction,
 * displays 90-day cooldown status, and embeds direct WhatsApp & Call linking.
 */

(function () {
  'use strict';

  const container = document.getElementById('matchListContainer');
  const statusNotice = document.getElementById('matchingStatusNotice');

  const summaryPatient = document.getElementById('summaryPatient');
  const summaryHospital = document.getElementById('summaryHospital');
  const summaryGroup = document.getElementById('summaryGroup');
  const summaryUnits = document.getElementById('summaryUnits');
  const summaryUrgency = document.getElementById('summaryUrgency');

  function init() {
    loadRequestSummary();
    renderMatches();
  }

  function loadRequestSummary() {
    summaryPatient.textContent = localStorage.getItem('requestPatient') || 'Ramesh Sundaram';
    summaryHospital.textContent = localStorage.getItem('requestHospital') || 'Victoria Hospital Emergency Trauma ICU, KR Market';
    summaryGroup.textContent = localStorage.getItem('requestBloodGroup') || 'O+';
    summaryUnits.textContent = localStorage.getItem('requestUnits') || '2';
    summaryUrgency.textContent = localStorage.getItem('requestUrgency') || 'Critical';
  }

  async function renderMatches() {
    const bloodGroup = localStorage.getItem('requestBloodGroup') || 'O+';
    const patientName = localStorage.getItem('requestPatient') || 'Ramesh Sundaram';
    const hospitalName = localStorage.getItem('requestHospital') || 'Victoria Hospital Trauma ICU';
    const hospitalAddress = localStorage.getItem('requestHospitalAddress') || 'Fort Road, near City Market, Kalasipalya, Bengaluru';
    const reqLat = parseFloat(localStorage.getItem('requestLatitude')) || 12.9625;
    const reqLng = parseFloat(localStorage.getItem('requestLongitude')) || 77.5750;

    const summaryAddrEl = document.getElementById('summaryAddress');
    if (summaryAddrEl) summaryAddrEl.textContent = `📍 ${hospitalAddress}`;
    const summaryGLink = document.getElementById('summaryGoogleMapsLink');
    if (summaryGLink) summaryGLink.href = `https://www.google.com/maps?q=${reqLat},${reqLng}`;

    let donors = window.BangaloreBloodData ? window.BangaloreBloodData.getDonors() : [];

    // Filter by immunological compatibility
    const compatibleDonors = donors.filter(d => isBloodGroupCompatible(bloodGroup, d.bloodGroup));

    // Enrich each donor with AI Donor Response Prediction
    const rankedDonors = compatibleDonors.map(donor => {
      // Simulate proximity distance (1.2 to 6.8 km)
      const distance = donor.distanceKm || Number((Math.random() * 4.5 + 1.2).toFixed(1));
      const prediction = window.BloodAI.predictDonorResponse(
        { ...donor, distanceKm: distance },
        { bloodGroup }
      );
      return {
        ...donor,
        distanceKm: distance,
        prediction
      };
    }).sort((a, b) => b.prediction.percentage - a.prediction.percentage);

    if (rankedDonors.length === 0) {
      statusNotice.textContent = `No currently available compatible donors found for ${bloodGroup} in the immediate area. Checking Bangalore Blood Bank central reserves...`;
      container.innerHTML = `
        <div class="card" style="text-align: center; padding: 40px;">
          <p style="font-size: 16px; color: var(--text-muted); margin-bottom: 16px;">
            No individual donors available right now. Proceed to Bangalore Blood Banks to reserve stored units.
          </p>
          <a href="bangalore-blood-banks.html" class="btn btn-primary">
            🏥 View Bangalore Blood Bank Central Reserves
          </a>
        </div>
      `;
      return;
    }

    statusNotice.textContent = `⚡ AI identified ${rankedDonors.length} compatible Bangalore donors. Prioritizing by predicted response speed.`;

    container.innerHTML = '';

    rankedDonors.forEach((donor, idx) => {
      const card = document.createElement('div');
      const isTopPick = idx === 0;
      card.className = `donor-match-card ${isTopPick ? 'top-pick' : ''}`;

      const pred = donor.prediction;
      const cooldown = pred.cooldown;
      const cleanPhone = (donor.phone || '+919845112233').replace(/\D/g, '');
      const waMsg = encodeURIComponent(`Emergency blood request from BloodConnect: Patient ${patientName} urgently requires ${bloodGroup} blood at ${hospitalName}. Please let us know if you can assist.`);

      const explainPills = pred.explainability.map(e => `
        <span style="font-size: 11px; padding: 2px 8px; border-radius: var(--radius-full); background: var(--bg-secondary); border: 1px solid var(--border-glass); color: var(--text-muted);">
          ✓ ${e}
        </span>
      `).join('');

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 14px; margin-bottom: 14px;">
          <div>
            ${isTopPick ? '<span class="badge badge-ai" style="margin-bottom: 6px;">⭐ #1 AI Top Pick for Fastest Arrival</span>' : ''}
            <div style="display: flex; align-items: center; gap: 8px;">
              <h3 style="font-family: var(--font-display); font-size: 20px; color: var(--text-main);">
                ${donor.name}
              </h3>
              <span class="badge badge-verified">🛡️ ID Verified</span>
            </div>
            <p style="font-size: 13px; color: var(--text-muted); margin-top: 2px;">
              📍 ${donor.location} • ~${donor.distanceKm} km from hospital
            </p>
          </div>

          <!-- AI Response Prediction Probability Badge -->
          <div style="text-align: right;">
            <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px;">
              <span style="font-size: 12px; color: var(--text-dim);">Response Probability:</span>
              <span class="badge ${pred.badgeClass}" style="font-size: 15px; font-weight: 800;">
                ${pred.percentage}%
              </span>
            </div>
            <span style="font-size: 11px; color: ${pred.color}; font-weight: 600;">
              ${pred.category} • ETA ~${pred.estimatedResponseMins} min
            </span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; background: var(--bg-secondary); padding: 12px 16px; border-radius: var(--radius-md); border: 1px solid var(--border-glass); font-size: 13px; margin-bottom: 16px;">
          <div>
            <span style="color: var(--text-dim); display: block; font-size: 11px;">Blood Group</span>
            <strong style="font-family: var(--font-mono); font-size: 15px; color: var(--crimson-primary);">${donor.bloodGroup}</strong>
          </div>
          <div>
            <span style="color: var(--text-dim); display: block; font-size: 11px;">90-Day Cooldown</span>
            <strong style="color: ${cooldown.isEligible ? 'var(--emerald-primary)' : 'var(--amber-primary)'};">
              ${cooldown.isEligible ? 'Eligible to Donate' : `${cooldown.daysRemaining} days left`}
            </strong>
          </div>
          <div>
            <span style="color: var(--text-dim); display: block; font-size: 11px;">Donor Rating</span>
            <strong style="color: #f59e0b;">⭐ ${donor.rating || 5.0} (${donor.donationCount || 6} donations)</strong>
          </div>
          <div>
            <span style="color: var(--text-dim); display: block; font-size: 11px;">Historical Speed</span>
            <strong style="color: var(--text-main);">${Math.round((donor.historicalResponseRate || 0.95) * 100)}% Fast Confirm</strong>
          </div>
        </div>

        <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px;">
          ${explainPills}
        </div>

        <!-- Direct Contact Actions (WhatsApp, Call, Official SOS Alert, Live Telematics) -->
        <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
          <a href="https://wa.me/${cleanPhone}?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">
            💬 WhatsApp ${donor.name.split(' ')[0]}
          </a>
          <a href="tel:${donor.phone}" class="btn btn-call btn-sm">
            📞 Call ${donor.phone}
          </a>
          <button class="btn btn-secondary btn-sm" onclick="window.sendEmergencyAlert('${donor.id}', '${donor.name}', '${donor.phone}', '${donor.bloodGroup}')">
            🔔 Dispatch Official SOS (SMS & Email)
          </button>
          <a href="https://www.google.com/maps/dir/${donor.lat || 12.9719},${donor.lng || 77.6412}/${reqLat},${reqLng}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" style="display: inline-flex; align-items: center; gap: 4px; border-color: #4285F4; color: #4285F4;">
            🧭 Google Maps Route
          </a>
          <a href="/live-dispatch" onclick="window.prepareDispatch('${donor.id}', '${donor.name.replace(/'/g, "\\'")}', ${donor.lat || 12.9719}, ${donor.lng || 77.6412}, '${(donor.phone || '').replace(/'/g, "\\'")}', '${(donor.address || donor.location || '').replace(/'/g, "\\'")}')" class="btn btn-primary btn-sm" style="background: linear-gradient(135deg, #c1121f, #ff3347); box-shadow: 0 0 15px rgba(255,51,71,0.4);">
            🛸 Track Live GPS Corridor ➔
          </a>
        </div>
      `;

      container.appendChild(card);
    });
  }

  window.prepareDispatch = function (id, name, lat, lng, phone, addr) {
    localStorage.setItem('activeDispatchAccepted', 'true');
    localStorage.setItem('dispatchDonorName', name);
    localStorage.setItem('dispatchDonorLat', String(lat));
    localStorage.setItem('dispatchDonorLng', String(lng));
    localStorage.setItem('dispatchDonorPhone', phone);
    localStorage.setItem('dispatchDonorAddress', addr);
  };

  window.sendEmergencyAlert = function (id, name, phone, group) {
    const patientName = localStorage.getItem('requestPatient') || 'Ramesh Sundaram';
    const hospitalName = localStorage.getItem('requestHospital') || 'Victoria Hospital Trauma ICU';

    if (window.OfficialMailer) {
      window.OfficialMailer.sendHospitalDispatch({
        hospitalName,
        hospitalEmail: 'victoria.trauma@bmcri.edu.in',
        patientName,
        bloodGroup: group || 'O+',
        units: 2,
        donorName: name,
        donorPhone: phone,
        etaMinutes: 12
      });
      window.OfficialMailer.sendPatientUpdate({
        patientName,
        patientPhone: '+91 98450 11150',
        patientEmail: 'family@patient.org',
        hospitalName,
        bloodGroup: group || 'O+',
        donorName: name
      });
    }
  };

  function isBloodGroupCompatible(recipient, donor) {
    const rules = {
      'O-': ['O-'],
      'O+': ['O-', 'O+'],
      'A-': ['O-', 'A-'],
      'A+': ['O-', 'O+', 'A-', 'A+'],
      'B-': ['O-', 'B-'],
      'B+': ['O-', 'O+', 'B-', 'B+'],
      'AB-': ['O-', 'A-', 'B-', 'AB-'],
      'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
    };
    return (rules[recipient] || []).includes(donor);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
