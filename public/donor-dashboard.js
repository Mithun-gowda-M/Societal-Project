/**
 * BloodConnect 2026 — Donor Dashboard Controller
 * Enforces 3-month (90-day) Cooldown, manages Emergency Response Box,
 * and facilitates WhatsApp & Direct Call coordination.
 */

(function () {
  'use strict';

  let currentDonor = null;
  let activeEmergency = null;

  // DOM Elements
  const donorProfileName = document.getElementById('donorProfileName');
  const donorEmail = document.getElementById('donorEmail');
  const donorBloodGroupBadge = document.getElementById('donorBloodGroupBadge');
  const donorLocation = document.getElementById('donorLocation');
  const donorPhone = document.getElementById('donorPhone');
  const donorAgeWeight = document.getElementById('donorAgeWeight');
  const donorImpactCount = document.getElementById('donorImpactCount');
  const aiReliabilityBadge = document.getElementById('aiReliabilityBadge');
  const availabilityText = document.getElementById('availabilityText');
  const toggleAvailabilityBtn = document.getElementById('toggleAvailabilityBtn');

  const cooldownBanner = document.getElementById('cooldownBanner');
  const cooldownStatusTitle = document.getElementById('cooldownStatusTitle');
  const cooldownDetails = document.getElementById('cooldownDetails');
  const cooldownDaysRemaining = document.getElementById('cooldownDaysRemaining');
  const lastDonationDateText = document.getElementById('lastDonationDateText');
  const nextEligibleDateText = document.getElementById('nextEligibleDateText');
  const toggleMedicalOverrideBtn = document.getElementById('toggleMedicalOverrideBtn');
  const recordDonationTodayBtn = document.getElementById('recordDonationTodayBtn');

  // Response Box Elements
  const donorResponseBox = document.getElementById('donorResponseBox');
  const boxUrgencyBadge = document.getElementById('boxUrgencyBadge');
  const boxSummaryText = document.getElementById('boxSummaryText');
  const boxPatientName = document.getElementById('boxPatientName');
  const boxHospitalName = document.getElementById('boxHospitalName');
  const boxDistance = document.getElementById('boxDistance');
  const boxMatchScore = document.getElementById('boxMatchScore');
  const responseActionButtons = document.getElementById('responseActionButtons');
  const acceptEmergencyBtn = document.getElementById('acceptEmergencyBtn');
  const declineEmergencyBtn = document.getElementById('declineEmergencyBtn');
  const acceptedConnectStrip = document.getElementById('acceptedConnectStrip');
  const donorWhatsAppBtn = document.getElementById('donorWhatsAppBtn');
  const donorCallBtn = document.getElementById('donorCallBtn');
  const logoutButton = document.getElementById('logoutButton');

  async function init() {
    await loadDonorProfile();
    evaluateCooldown();
    loadActiveEmergency();
    setupEventListeners();
  }

  async function loadDonorProfile() {
    try {
      currentDonor = await bloodConnectApi('/api/donors/me');
    } catch (e) {
      currentDonor = getCurrentUser() || {};
    }

    if (!currentDonor || !currentDonor.name) {
      // Default fallback demo donor
      currentDonor = {
        name: 'Dr. Arjun K. Rao',
        email: 'arjun.rao@blr-med.org',
        phone: '+919845112233',
        bloodGroup: 'O+',
        location: 'Indiranagar, Bengaluru',
        age: 32,
        weight: 72,
        donationCount: 14,
        available: true,
        lastDonationDate: '2026-06-10',
        historicalResponseRate: 0.98,
        emergencyMedicalOverride: false
      };
    }

    // Populate UI
    donorProfileName.textContent = currentDonor.name;
    donorEmail.textContent = currentDonor.email;
    donorBloodGroupBadge.textContent = currentDonor.bloodGroup || 'O+';
    donorLocation.textContent = currentDonor.location || 'Bengaluru';
    const addressEl = document.getElementById('donorAddress');
    if (addressEl) {
      addressEl.textContent = currentDonor.address || `${currentDonor.location || '100 Feet Rd, Indiranagar'}, ${currentDonor.city || 'Bengaluru'}`;
    }
    donorPhone.textContent = currentDonor.phone || '+91 98451 12233';
    donorAgeWeight.textContent = `${currentDonor.age || 30} yrs • ${currentDonor.weight || 68} kg`;
    donorImpactCount.textContent = `${currentDonor.donationCount || 1} Donations`;

    updateAvailabilityUI(currentDonor.available);
  }

  function evaluateCooldown() {
    if (!currentDonor) return;

    const cooldown = window.BloodAI.checkDonationCooldown(currentDonor.lastDonationDate);
    lastDonationDateText.textContent = cooldown.lastDonationDateFormatted;
    nextEligibleDateText.textContent = cooldown.nextEligibleDateFormatted;
    cooldownDaysRemaining.textContent = cooldown.daysRemaining;

    if (!cooldown.isEligible) {
      if (currentDonor.emergencyMedicalOverride) {
        cooldownStatusTitle.textContent = '🩺 Medical Expert Emergency Clearance Active';
        cooldownStatusTitle.style.color = 'var(--cyber-blue)';
        cooldownDetails.innerHTML = `Cooldown active (${cooldown.daysRemaining} days left), but authorized medical clearance enables participation for catastrophic triage.`;
        updateAvailabilityUI(true);
      } else {
        cooldownStatusTitle.textContent = '⏱️ 3-Month (90-Day) Donation Cooldown Active';
        cooldownStatusTitle.style.color = 'var(--amber-primary)';
        cooldownDetails.innerHTML = `To ensure healthy red blood cell replenishment, next eligible whole blood donation is on <strong style="color: var(--emerald-primary);">${cooldown.nextEligibleDateFormatted}</strong>.`;
        updateAvailabilityUI(false);
      }
    } else {
      cooldownStatusTitle.textContent = '✅ Fully Eligible to Donate Blood';
      cooldownStatusTitle.style.color = 'var(--emerald-primary)';
      cooldownDetails.innerHTML = `More than 90 days have elapsed since your last donation (${cooldown.lastDonationDateFormatted}). You are clinically eligible!`;
      updateAvailabilityUI(true);
    }
  }

  function updateAvailabilityUI(isAvailable) {
    if (availabilityText) {
      availabilityText.textContent = isAvailable ? 'Available' : 'Unavailable (Cooldown/Rest)';
      availabilityText.style.color = isAvailable ? 'var(--emerald-primary)' : 'var(--amber-primary)';
    }
    if (toggleAvailabilityBtn) {
      toggleAvailabilityBtn.textContent = isAvailable ? 'Mark Unavailable' : 'Mark Available';
    }
  }

  function loadActiveEmergency() {
    let emergencies = window.BangaloreBloodData ? window.BangaloreBloodData.getActiveEmergencies() : [];
    if (!emergencies || emergencies.length === 0) {
      try {
        const stored = JSON.parse(localStorage.getItem('bloodconnect_latest_emergency_broadcast') || 'null');
        if (stored && stored.patientName) {
          emergencies = [stored];
        }
      } catch (e) {}
    }

    if (!emergencies || emergencies.length === 0) {
      donorResponseBox.style.display = 'none';
      return;
    }

    activeEmergency = emergencies[0];
    donorResponseBox.style.display = 'block';

    boxPatientName.textContent = activeEmergency.patientName;
    boxHospitalName.textContent = activeEmergency.hospital;
    boxDistance.textContent = '2.4 km (~7 min)';
    boxMatchScore.textContent = '96% High Fit';

    boxSummaryText.innerHTML = `
      Patient <strong>${activeEmergency.patientName}</strong> urgently requires <strong>${activeEmergency.bloodGroup} (${activeEmergency.units || 1} units)</strong> at <strong>${activeEmergency.hospital}</strong>.
    `;

    // Check if already accepted
    if (activeEmergency.status === 'ACCEPTED' || activeEmergency.acceptedDonor === currentDonor.name) {
      showAcceptedState();
    } else {
      responseActionButtons.style.display = 'flex';
      acceptedConnectStrip.style.display = 'none';
    }
  }

  // Live storage event listener to immediately refresh emergency card when patient requests
  window.addEventListener('storage', (e) => {
    if (e.key === 'bloodconnect_latest_emergency_broadcast') {
      loadActiveEmergency();
    }
  });

  function showAcceptedState() {
    responseActionButtons.style.display = 'none';
    acceptedConnectStrip.style.display = 'block';

    const reqContact = (activeEmergency.contact || '+919845011150').replace(/\D/g, '');
    const msg = encodeURIComponent(`Hello, I am ${currentDonor.name} (${currentDonor.bloodGroup} Donor). I have accepted your emergency blood request on BloodConnect for ${activeEmergency.patientName} at ${activeEmergency.hospital}. I am preparing to travel.`);

    donorWhatsAppBtn.href = `https://wa.me/${reqContact}?text=${msg}`;
    donorCallBtn.href = `tel:${activeEmergency.contact || '+919845011150'}`;
  }

  function setupEventListeners() {
    // Accept Emergency
    if (acceptEmergencyBtn) {
      acceptEmergencyBtn.addEventListener('click', () => {
        acceptEmergencyBtn.disabled = true;
        acceptEmergencyBtn.textContent = 'Connecting...';

        setTimeout(() => {
          if (activeEmergency && window.BangaloreBloodData) {
            window.BangaloreBloodData.updateEmergency(activeEmergency.id, {
              status: 'ACCEPTED',
              acceptedDonor: currentDonor.name,
              donorPhone: currentDonor.phone
            });
          }

          localStorage.setItem('activeDispatchAccepted', 'true');
          localStorage.setItem('dispatchDonorName', currentDonor.name);
          localStorage.setItem('dispatchDonorLat', String(currentDonor.lat || 12.9719));
          localStorage.setItem('dispatchDonorLng', String(currentDonor.lng || 77.6412));
          localStorage.setItem('dispatchDonorAddress', currentDonor.address || '100 Feet Rd, Indiranagar, Bengaluru');
          localStorage.setItem('dispatchDonorPhone', currentDonor.phone || '+91 98451 12233');

          if (activeEmergency) {
            localStorage.setItem('requestPatient', activeEmergency.patientName || 'Ramesh Sundaram');
            localStorage.setItem('requestHospital', activeEmergency.hospital || 'Victoria Hospital Trauma ICU');
            localStorage.setItem('requestBloodGroup', activeEmergency.bloodGroup || currentDonor.bloodGroup);
            localStorage.setItem('requestUnits', String(activeEmergency.units || 2));
            if (activeEmergency.latitude) localStorage.setItem('requestLatitude', String(activeEmergency.latitude));
            if (activeEmergency.longitude) localStorage.setItem('requestLongitude', String(activeEmergency.longitude));
            if (activeEmergency.address) localStorage.setItem('requestHospitalAddress', activeEmergency.address);
          }

          showAcceptedState();

          // Dispatch Official Verified Enterprise Communications
          if (window.OfficialMailer && activeEmergency) {
            window.OfficialMailer.sendHospitalDispatch({
              hospitalName: activeEmergency.hospital || 'Victoria Hospital Trauma ICU',
              hospitalEmail: 'victoria.trauma@bmcri.edu.in',
              patientName: activeEmergency.patientName || 'Ramesh Sundaram',
              bloodGroup: activeEmergency.bloodGroup || currentDonor.bloodGroup,
              units: activeEmergency.units || 2,
              donorName: currentDonor.name,
              donorPhone: currentDonor.phone,
              etaMinutes: 14
            });

            window.OfficialMailer.sendPatientUpdate({
              patientName: activeEmergency.patientName || 'Ramesh Sundaram',
              patientPhone: activeEmergency.contact || '+91 98450 11150',
              patientEmail: 'family@patient.org',
              hospitalName: activeEmergency.hospital || 'Victoria Hospital Emergency Trauma',
              bloodGroup: activeEmergency.bloodGroup || currentDonor.bloodGroup,
              donorName: currentDonor.name
            });
          }

          // Add notification simulation
          const notifContainer = document.getElementById('notificationLogContainer');
          if (notifContainer) {
            const el = document.createElement('div');
            el.style = 'background: rgba(16, 185, 129, 0.15); border-radius: 12px; padding: 14px; border: 1px solid rgba(16, 185, 129, 0.4); margin-bottom: 12px;';
            el.innerHTML = `
              <div style="display: flex; justify-content: space-between; font-size: 12px; color: #10b981; margin-bottom: 4px;">
                <span>✅ Emergency Accepted</span>
                <span>Just now</span>
              </div>
              <p style="font-size: 13px; color: var(--text-main);">
                Hospital phlebotomy team notified. Official DLT SMS & verified email dispatched. Live GPS corridor ready.
              </p>
            `;
            notifContainer.prepend(el);
          }
        }, 800);
      });
    }

    // Decline Emergency
    if (declineEmergencyBtn) {
      declineEmergencyBtn.addEventListener('click', () => {
        donorResponseBox.style.display = 'none';
      });
    }

    // Toggle Medical Expert Override
    if (toggleMedicalOverrideBtn) {
      toggleMedicalOverrideBtn.addEventListener('click', () => {
        const pass = prompt('Enter Authorized Medical Officer License PIN to override 90-day cooldown (Demo PIN: 2026):', '2026');
        if (pass === '2026') {
          currentDonor.emergencyMedicalOverride = !currentDonor.emergencyMedicalOverride;
          evaluateCooldown();
          alert('Emergency Medical Clearance updated by authorized physician.');
        } else if (pass !== null) {
          alert('Invalid Medical License PIN.');
        }
      });
    }

    // Record Donation Today
    if (recordDonationTodayBtn) {
      recordDonationTodayBtn.addEventListener('click', () => {
        const todayStr = new Date().toISOString().split('T')[0];
        currentDonor.lastDonationDate = todayStr;
        currentDonor.emergencyMedicalOverride = false;
        currentDonor.donationCount = (currentDonor.donationCount || 0) + 1;
        donorImpactCount.textContent = `${currentDonor.donationCount} Donations`;
        evaluateCooldown();
        alert(`Blood donation successfully recorded for today (${todayStr})! You have been placed on a 3-month (90-day) recovery period.`);
      });
    }

    // Toggle Availability
    if (toggleAvailabilityBtn) {
      toggleAvailabilityBtn.addEventListener('click', () => {
        currentDonor.available = !currentDonor.available;
        updateAvailabilityUI(currentDonor.available);
      });
    }

    // Fetch & Update Live GPS Residential Address
    const btnUpdateDonorLiveLocation = document.getElementById('btnUpdateDonorLiveLocation');
    const donorGoogleMapsLink = document.getElementById('donorGoogleMapsLink');
    if (btnUpdateDonorLiveLocation) {
      btnUpdateDonorLiveLocation.addEventListener('click', async () => {
        btnUpdateDonorLiveLocation.textContent = '⏳ Acquiring GPS Satellite Lock...';
        btnUpdateDonorLiveLocation.disabled = true;

        try {
          const coords = await window.BloodConnectGeo.fetchLiveCoordinates();
          const geo = await window.BloodConnectGeo.reverseGeocode(coords.lat, coords.lng);

          currentDonor.address = geo.fullAddress;
          currentDonor.location = geo.locality;
          currentDonor.city = geo.city;
          currentDonor.lat = coords.lat;
          currentDonor.lng = coords.lng;

          const addressEl = document.getElementById('donorAddress');
          if (addressEl) addressEl.textContent = geo.fullAddress;
          if (donorLocation) donorLocation.textContent = `${geo.locality}, ${geo.city}`;
          if (donorGoogleMapsLink) donorGoogleMapsLink.href = geo.googleMapsUrl;

          // Sync to local data store
          if (window.BangaloreBloodData && window.BangaloreBloodData.saveDonor) {
            window.BangaloreBloodData.saveDonor(currentDonor);
          }

          // Update active emergency distance and Google Maps navigation link
          const hospLink = document.getElementById('boxHospitalGoogleMapsLink');
          if (hospLink) {
            hospLink.href = `https://www.google.com/maps/dir/${coords.lat.toFixed(5)},${coords.lng.toFixed(5)}/12.9625,77.5750`;
          }

          btnUpdateDonorLiveLocation.textContent = '✓ Live GPS Address Synchronized';
          btnUpdateDonorLiveLocation.style.borderColor = '#10b981';
          btnUpdateDonorLiveLocation.style.color = '#10b981';
          alert(`Residential address successfully updated via GPS to:\n${geo.fullAddress}\n[${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}]`);
        } catch (err) {
          console.warn('Donor location fetch fallback:', err.message);
          const defaultLandmark = window.BloodConnectGeo ? window.BloodConnectGeo.landmarks[1] : { name: 'Indiranagar', fullAddress: '100 Feet Rd, Indiranagar, Bengaluru' };
          currentDonor.address = defaultLandmark.road ? `${defaultLandmark.road}, ${defaultLandmark.area}, ${defaultLandmark.city}` : defaultLandmark.fullAddress;
          currentDonor.location = defaultLandmark.name;
          const addressEl = document.getElementById('donorAddress');
          if (addressEl) addressEl.textContent = currentDonor.address;
          btnUpdateDonorLiveLocation.textContent = '📍 Address Preset to Indiranagar';
        } finally {
          btnUpdateDonorLiveLocation.disabled = false;
        }
      });
    }

    // Logout
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        clearBloodConnectSession();
        window.location.href = 'login.html';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
