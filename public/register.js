/**
 * BloodConnect 2026 — Registration Controller
 * Handles Multi-step Validation, Aadhaar ID Scan Simulator, and Dual Phone/Email OTP Verification.
 */

(function () {
  'use strict';

  let registrationData = {};
  let isAadhaarVerified = false;
  let otpTimerInterval = null;

  // DOM Elements
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const stepNode1 = document.getElementById('stepNode1');
  const stepNode2 = document.getElementById('stepNode2');
  const stepNode3 = document.getElementById('stepNode3');

  const regForm = document.getElementById('registrationForm');
  const userTypeSelect = document.getElementById('userType');
  const donorSection = document.getElementById('donorSpecificSection');
  const step1Error = document.getElementById('step1Error');

  const scanZone = document.getElementById('scanZone');
  const simulateScanBtn = document.getElementById('simulateScanBtn');
  const idFileInput = document.getElementById('idFileInput');
  const ocrResultBox = document.getElementById('ocrResultBox');
  const proceedToOtpBtn = document.getElementById('proceedToOtpBtn');
  const backToStep1Btn = document.getElementById('backToStep1Btn');
  const step2Error = document.getElementById('step2Error');

  const otpTargetDisplay = document.getElementById('otpTargetDisplay');
  const otpEmailDisplay = document.getElementById('otpEmailDisplay');
  const otpCountdown = document.getElementById('otpCountdown');
  const finalizeRegistrationBtn = document.getElementById('finalizeRegistrationBtn');
  const resendOtpBtn = document.getElementById('resendOtpBtn');
  const step3Error = document.getElementById('step3Error');

  // Address & Geolocation Elements
  const btnFetchLiveLocation = document.getElementById('btnFetchLiveLocation');
  const gpsBtnIcon = document.getElementById('gpsBtnIcon');
  const gpsBtnText = document.getElementById('gpsBtnText');
  const streetAddressInput = document.getElementById('streetAddress');
  const locationInput = document.getElementById('location');
  const cityInput = document.getElementById('city');
  const pincodeInput = document.getElementById('pincode');
  const regLatInput = document.getElementById('regLatitude');
  const regLngInput = document.getElementById('regLongitude');
  const addressAutoBadge = document.getElementById('addressAutoBadge');
  const liveGpsStatusPill = document.getElementById('liveGpsStatusPill');
  const gpsCoordsDisplay = document.getElementById('gpsCoordsDisplay');
  const gpsAccuracyDisplay = document.getElementById('gpsAccuracyDisplay');

  // Comprehensive Metro Landmarks for Intelligent Reverse-Geocoding Fallback
  const METRO_LANDMARKS = [
    { name: 'Indiranagar', road: '100 Feet Rd, HAL 2nd Stage', area: 'Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', lat: 12.9719, lng: 77.6412 },
    { name: 'Koramangala', road: '80 Feet Rd, 4th Block', area: 'Koramangala', city: 'Bengaluru', state: 'Karnataka', pincode: '560034', lat: 12.9345, lng: 77.6265 },
    { name: 'Jayanagar', road: '9th Main Rd, 4th Block', area: 'Jayanagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560011', lat: 12.9298, lng: 77.5843 },
    { name: 'Whitefield', road: 'ITPB Main Rd, EPIP Zone', area: 'Whitefield', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', lat: 12.9856, lng: 77.7289 },
    { name: 'Malleshwaram', road: 'Margosa Road, 8th Cross', area: 'Malleshwaram', city: 'Bengaluru', state: 'Karnataka', pincode: '560003', lat: 13.0031, lng: 77.5702 },
    { name: 'KR Market', road: 'Fort Road, Near Victoria Hospital', area: 'Kalasipalya', city: 'Bengaluru', state: 'Karnataka', pincode: '560002', lat: 12.9625, lng: 77.5750 },
    { name: 'Electronic City', road: 'Hosur Main Road, Phase 1', area: 'Electronic City', city: 'Bengaluru', state: 'Karnataka', pincode: '560100', lat: 12.8452, lng: 77.6602 },
    { name: 'MG Road', road: 'Mahatma Gandhi Road, Trinity Circle', area: 'CBD', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', lat: 12.9740, lng: 77.6100 }
  ];

  function findNearestLandmark(lat, lng) {
    let nearest = METRO_LANDMARKS[0];
    let minD = Infinity;
    METRO_LANDMARKS.forEach(lm => {
      const d = Math.hypot(lm.lat - lat, lm.lng - lng);
      if (d < minD) {
        minD = d;
        nearest = lm;
      }
    });
    return nearest;
  }

  const regGoogleMapsLink = document.getElementById('regGoogleMapsLink');

  window.setPresetLocation = function (area, fullAddress, pincode, lat, lng) {
    if (streetAddressInput) streetAddressInput.value = fullAddress;
    if (locationInput) locationInput.value = area;
    if (cityInput) cityInput.value = 'Bengaluru';
    if (pincodeInput) pincodeInput.value = pincode;
    if (regLatInput) regLatInput.value = lat.toFixed(6);
    if (regLngInput) regLngInput.value = lng.toFixed(6);

    if (addressAutoBadge) addressAutoBadge.style.display = 'inline';
    if (liveGpsStatusPill) {
      liveGpsStatusPill.style.display = 'flex';
      if (gpsCoordsDisplay) gpsCoordsDisplay.textContent = `📍 GPS Reference: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)} (${area})`;
      if (gpsAccuracyDisplay) gpsAccuracyDisplay.textContent = 'High-Precision Landmark';
      if (regGoogleMapsLink) {
        regGoogleMapsLink.href = `https://www.google.com/maps?q=${lat.toFixed(5)},${lng.toFixed(5)}`;
      }
    }
  };

  async function fetchLiveLocationAndAutoFillAddress() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please pick a quick area below.');
      return;
    }

    if (gpsBtnIcon) gpsBtnIcon.textContent = '⏳';
    if (gpsBtnText) gpsBtnText.textContent = 'Acquiring GPS Satellite Lock...';
    if (btnFetchLiveLocation) btnFetchLiveLocation.disabled = true;

    try {
      const coords = await window.BloodConnectGeo.fetchLiveCoordinates();
      const lat = coords.lat;
      const lng = coords.lng;
      const acc = coords.accuracy;

      if (regLatInput) regLatInput.value = lat.toFixed(6);
      if (regLngInput) regLngInput.value = lng.toFixed(6);

      if (gpsBtnIcon) gpsBtnIcon.textContent = '🛰️';
      if (gpsBtnText) gpsBtnText.textContent = 'Reverse Geocoding Address...';

      const geo = await window.BloodConnectGeo.reverseGeocode(lat, lng);

      if (streetAddressInput) streetAddressInput.value = geo.fullAddress;
      if (locationInput) locationInput.value = geo.locality;
      if (cityInput) cityInput.value = geo.city;
      if (pincodeInput && geo.pincode) pincodeInput.value = geo.pincode;

      // Show verification badges
      if (addressAutoBadge) addressAutoBadge.style.display = 'inline';
      if (liveGpsStatusPill) {
        liveGpsStatusPill.style.display = 'flex';
        if (gpsCoordsDisplay) gpsCoordsDisplay.textContent = `📍 Google Maps GPS Locked: Lat ${lat.toFixed(4)}, Lng ${lng.toFixed(4)}`;
        if (gpsAccuracyDisplay) gpsAccuracyDisplay.textContent = `Accuracy: ±${acc}m`;
        if (regGoogleMapsLink) regGoogleMapsLink.href = geo.googleMapsUrl;
      }

      if (gpsBtnIcon) gpsBtnIcon.textContent = '✓';
      if (gpsBtnText) gpsBtnText.textContent = 'Live Location & Address Fetched';
      if (btnFetchLiveLocation) {
        btnFetchLiveLocation.disabled = false;
        btnFetchLiveLocation.style.borderColor = '#10b981';
        btnFetchLiveLocation.style.color = '#10b981';
      }
    } catch (err) {
      console.warn('Geolocation fallback activated:', err.message);
      const defaultLandmark = window.BloodConnectGeo ? window.BloodConnectGeo.landmarks[0] : METRO_LANDMARKS[0];
      window.setPresetLocation(defaultLandmark.name, `${defaultLandmark.road}, ${defaultLandmark.area}, ${defaultLandmark.city}`, defaultLandmark.pincode, defaultLandmark.lat, defaultLandmark.lng);

      if (gpsBtnIcon) gpsBtnIcon.textContent = '📍';
      if (gpsBtnText) gpsBtnText.textContent = 'Preset to Bengaluru (Indiranagar)';
      if (btnFetchLiveLocation) btnFetchLiveLocation.disabled = false;
    }
  }

  if (btnFetchLiveLocation) {
    btnFetchLiveLocation.addEventListener('click', fetchLiveLocationAndAutoFillAddress);
  }

  // Toggle donor-specific fields based on user type
  userTypeSelect.addEventListener('change', () => {
    const isDonor = userTypeSelect.value === 'donor';
    donorSection.style.display = isDonor ? 'block' : 'none';
    ['donorAge', 'donorWeight', 'bloodGroup'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.required = isDonor;
    });
  });

  // Step 1: Submit Form
  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    step1Error.textContent = '';

    const pwd = document.getElementById('password').value;
    const confirmPwd = document.getElementById('confirmPassword').value;
    if (pwd !== confirmPwd) {
      step1Error.textContent = 'Passwords do not match.';
      return;
    }

    const isDonor = userTypeSelect.value === 'donor';
    const age = Number(document.getElementById('donorAge').value);
    const weight = Number(document.getElementById('donorWeight').value);

    if (isDonor) {
      // Evaluate Clinical Donor Eligibility
      const evalResult = window.BloodAI.evaluateDonorEligibility({
        age,
        weight,
        lastDonationDate: document.getElementById('lastDonationDate').value,
        hasHeartCondition: !document.getElementById('noHeartDisease').checked,
        hasInsulinDiabetes: !document.getElementById('noInsulin').checked,
        hasActiveInfection: !document.getElementById('noInfections').checked,
        hasRecentTattooOrSurgery: !document.getElementById('noSurgery').checked
      });

      if (!evalResult.isEligible) {
        step1Error.textContent = evalResult.reasons.join(' | ');
        return;
      }
    }

    registrationData = {
      fullName: document.getElementById('fullName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      userType: userTypeSelect.value,
      isDonor,
      age: isDonor ? age : null,
      weight: isDonor ? weight : null,
      bloodGroup: isDonor ? document.getElementById('bloodGroup').value : null,
      address: streetAddressInput ? streetAddressInput.value.trim() : '',
      location: locationInput ? locationInput.value.trim() : 'Bengaluru',
      city: cityInput ? cityInput.value.trim() : 'Bengaluru',
      pincode: pincodeInput ? pincodeInput.value.trim() : '',
      latitude: Number(regLatInput ? regLatInput.value : 12.9716) || 12.9716,
      longitude: Number(regLngInput ? regLngInput.value : 77.5946) || 77.5946,
      lastDonationDate: isDonor ? document.getElementById('lastDonationDate').value : null
    };

    // Transition to Step 2
    step1.style.display = 'none';
    step2.style.display = 'block';
    stepNode1.classList.remove('active');
    stepNode1.classList.add('done');
    stepNode2.classList.add('active');
    window.scrollTo({ top: 120, behavior: 'smooth' });
  });

  // Step 2: Aadhaar ID Scan Simulator
  function triggerOcrScan() {
    scanZone.classList.add('scanning');
    step2Error.textContent = '';
    simulateScanBtn.disabled = true;
    simulateScanBtn.textContent = 'Scanning Document...';

    setTimeout(() => {
      scanZone.classList.remove('scanning');
      simulateScanBtn.disabled = false;
      simulateScanBtn.textContent = '⚡ Re-Scan Document';
      ocrResultBox.style.display = 'block';

      // Masked Aadhaar number generator
      const random4 = Math.floor(1000 + Math.random() * 9000);
      const masked = `XXXX-XXXX-${random4}`;
      document.getElementById('ocrMaskedId').textContent = masked;

      registrationData.idVerified = true;
      registrationData.aadhaarMasked = masked;
      isAadhaarVerified = true;

      proceedToOtpBtn.disabled = false;
      proceedToOtpBtn.classList.remove('btn-secondary');
      proceedToOtpBtn.classList.add('btn-primary');
    }, 2200);
  }

  simulateScanBtn.addEventListener('click', triggerOcrScan);
  idFileInput.addEventListener('change', () => {
    if (idFileInput.files.length > 0) {
      triggerOcrScan();
    }
  });

  backToStep1Btn.addEventListener('click', () => {
    step2.style.display = 'none';
    step1.style.display = 'block';
    stepNode2.classList.remove('active');
    stepNode1.classList.remove('done');
    stepNode1.classList.add('active');
  });

  // Email OTP Boxes & Elements
  const emailOtpBoxes = [1, 2, 3, 4, 5, 6].map(i => document.getElementById(`emailOtp${i}`));
  const emailVerifyBadge = document.getElementById('emailVerifyBadge');
  const resendEmailOtpBtn = document.getElementById('resendEmailOtpBtn');

  let latestDevOtp = null;

  function updateGatewayStatusNotice(res) {
    const deliveryStatusText = document.getElementById('deliveryStatusText');
    const otpDevAssistBtnContainer = document.getElementById('otpDevAssistBtnContainer');
    const previewUrlBanner = document.getElementById('previewUrlBanner');
    const previewUrlLink = document.getElementById('previewUrlLink');

    if (res.devOtp) {
      latestDevOtp = res.devOtp;
      if (otpDevAssistBtnContainer) otpDevAssistBtnContainer.style.display = 'block';
    }

    if (res.emailPreviewUrl) {
      if (previewUrlBanner) previewUrlBanner.style.display = 'flex';
      if (previewUrlLink) previewUrlLink.href = res.emailPreviewUrl;
    } else {
      if (previewUrlBanner) previewUrlBanner.style.display = 'none';
    }

    if (!deliveryStatusText) return;

    let emailHtml = '';
    if (res.emailDispatched) {
      emailHtml = `<div style="color: #10b981; font-weight: 700; margin-bottom: 4px;">🟢 Real Email Dispatched from bloodconnectai@outlook.com</div>
        <div style="color: var(--text-muted); font-size: 12px;">Delivered directly to your inbox <b>${registrationData.email}</b>. Check your Inbox and Spam folder.</div>`;
    } else if (res.emailPreviewUrl) {
      emailHtml = `<div style="color: #0284c7; font-weight: 700; margin-bottom: 4px;">✉️ Live Email Dispatched to Web Mailbox</div>
        <div style="color: var(--text-muted); font-size: 12px;">Click the button below to view the actual email and 6-digit verification code.</div>`;
    } else {
      emailHtml = `<div style="color: #f59e0b; font-weight: 700; margin-bottom: 4px;">⚠️ Verification Code Ready</div>
        <div style="color: var(--text-muted); font-size: 12px;">Use the 1-Click Auto-Fill helper or check your email inbox.</div>`;
    }

    deliveryStatusText.innerHTML = emailHtml;
  }

  const btnAutoFillDevOtp = document.getElementById('btnAutoFillDevOtp');
  if (btnAutoFillDevOtp) {
    btnAutoFillDevOtp.addEventListener('click', () => {
      if (!latestDevOtp) return;
      if (latestDevOtp.emailOtp) {
        const emailArr = latestDevOtp.emailOtp.split('');
        emailOtpBoxes.forEach((b, i) => { if (b && emailArr[i]) b.value = emailArr[i]; });
      }
      btnAutoFillDevOtp.textContent = '✓ Auto-Filled!';
      btnAutoFillDevOtp.style.background = '#10b981';
      btnAutoFillDevOtp.style.color = '#ffffff';
      setTimeout(() => {
        btnAutoFillDevOtp.textContent = '⚡ 1-Click Auto-Fill (Dev Assist)';
        btnAutoFillDevOtp.style.background = 'rgba(245, 158, 11, 0.08)';
        btnAutoFillDevOtp.style.color = '#f59e0b';
      }, 2000);
    });
  }

  // Transition Step 2 -> Step 3
  proceedToOtpBtn.addEventListener('click', async () => {
    if (!isAadhaarVerified) {
      step2Error.textContent = 'Please scan and verify your Aadhaar or Government ID first to prevent fake registrations.';
      return;
    }

    proceedToOtpBtn.disabled = true;
    proceedToOtpBtn.textContent = '⏳ Dispatching Verification Email...';
    step2Error.textContent = '';

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData)
      });

      const res = await response.json();
      if (!response.ok || res.error) {
        throw new Error(res.error || 'Failed to dispatch verification email.');
      }

      step2.style.display = 'none';
      step3.style.display = 'block';
      stepNode2.classList.remove('active');
      stepNode2.classList.add('done');
      stepNode3.classList.add('active');

      if (otpEmailDisplay) otpEmailDisplay.textContent = registrationData.email;

      // Update Gateway Status Notice
      updateGatewayStatusNotice(res);

      // Clear OTP input boxes
      emailOtpBoxes.forEach(b => { if (b) b.value = ''; });
      if (emailOtpBoxes[0]) emailOtpBoxes[0].focus();

      startOtpTimer(res.expiresInSeconds || 600); // 10 minutes
    } catch (err) {
      console.error('Registration dispatch error:', err);
      step2Error.textContent = err.message || 'Error reaching verification gateway. Please try again.';
      proceedToOtpBtn.disabled = false;
      proceedToOtpBtn.textContent = 'Proceed to Email Verification ➔';
    }
  });

  // Setup auto-focus navigation & clipboard paste helper
  function setupBoxNavigation(boxes) {
    boxes.forEach((box, idx) => {
      if (!box) return;
      box.addEventListener('input', () => {
        if (box.value && idx < boxes.length - 1) {
          boxes[idx + 1].focus();
        }
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !box.value && idx > 0) {
          boxes[idx - 1].focus();
        }
      });
      box.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasteData = (e.clipboardData || window.clipboardData).getData('text') || '';
        const digits = pasteData.replace(/\D/g, '').slice(0, boxes.length).split('');
        if (digits.length > 0) {
          digits.forEach((d, i) => {
            if (boxes[i]) boxes[i].value = d;
          });
          const targetIdx = Math.min(digits.length, boxes.length - 1);
          if (boxes[targetIdx]) boxes[targetIdx].focus();
        }
      });
    });
  }

  setupBoxNavigation(emailOtpBoxes);

  // Start OTP Countdown Timer
  function startOtpTimer(seconds) {
    clearInterval(otpTimerInterval);
    let remaining = seconds;
    updateOtpTimerDisplay(remaining);

    otpTimerInterval = setInterval(() => {
      remaining--;
      if (remaining <= 0) {
        clearInterval(otpTimerInterval);
        if (otpCountdown) otpCountdown.textContent = 'EXPIRED';
      } else {
        updateOtpTimerDisplay(remaining);
      }
    }, 1000);
  }

  function updateOtpTimerDisplay(rem) {
    if (!otpCountdown) return;
    const mins = Math.floor(rem / 60);
    const secs = rem % 60;
    otpCountdown.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Finalize Registration (Email OTP Verification)
  finalizeRegistrationBtn.addEventListener('click', async () => {
    const emailCode = emailOtpBoxes.map(b => b ? b.value : '').join('').trim();

    if (emailCode.length < 6) {
      step3Error.style.color = 'var(--crimson-primary)';
      step3Error.textContent = 'Please enter the 6-digit verification code received in your email inbox.';
      if (emailOtpBoxes[0]) emailOtpBoxes[0].focus();
      return;
    }

    finalizeRegistrationBtn.disabled = true;
    finalizeRegistrationBtn.textContent = '⏳ Verifying Code & Activating Account...';
    step3Error.textContent = '';

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registrationData.email,
          emailOtp: emailCode
        })
      });

      const res = await response.json();
      if (!response.ok || !res.success || !res.verified) {
        throw new Error(res.error || res.message || 'Invalid verification code. Please check your email inbox.');
      }

      handleCompleteSuccess(res);
    } catch (err) {
      console.error('Verification failed:', err);
      step3Error.style.color = 'var(--crimson-primary)';
      step3Error.textContent = err.message || 'Invalid verification code. Please check your email.';
      finalizeRegistrationBtn.disabled = false;
      finalizeRegistrationBtn.textContent = '🩸 Verify Email & Complete Registration ➔';
    }
  });

  function handleCompleteSuccess(res) {
    if (emailVerifyBadge) {
      emailVerifyBadge.textContent = '✓ Email Verified';
      emailVerifyBadge.style.background = 'rgba(5, 150, 105, 0.12)';
      emailVerifyBadge.style.color = '#059669';
    }

    step3Error.style.color = '#059669';
    step3Error.innerHTML = '✓ <strong>Verification Complete!</strong> Email confirmed. Official welcome email dispatched from bloodconnectai@outlook.com.';

    saveBloodConnectSession({
      accessToken: res.accessToken || `bc-token-${Date.now()}`,
      user: res.user || registrationData
    });

    if (window.BangaloreBloodData && registrationData.isDonor) {
      window.BangaloreBloodData.saveDonor(res.user || registrationData);
    }

    setTimeout(() => {
      if (registrationData.isDonor) {
        window.location.href = '/portal';
      } else {
        window.location.href = '/patient-portal';
      }
    }, 1500);
  }

  // Resend Email OTP
  if (resendEmailOtpBtn) {
    resendEmailOtpBtn.addEventListener('click', async () => {
      resendEmailOtpBtn.disabled = true;
      resendEmailOtpBtn.textContent = 'Resending Email...';
      try {
        const res = await fetch('/api/auth/resend-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: registrationData.email, channel: 'email' })
        }).then(r => r.json());
        step3Error.style.color = '#059669';
        step3Error.textContent = '✓ ' + (res.message || 'Fresh verification code dispatched to your email inbox.');
        if (res.devOtp) latestDevOtp = res.devOtp;
        updateGatewayStatusNotice(res);
        startOtpTimer(600);
      } catch (e) {
        step3Error.style.color = 'var(--crimson-primary)';
        step3Error.textContent = 'Error resending verification code.';
      } finally {
        resendEmailOtpBtn.disabled = false;
        resendEmailOtpBtn.textContent = '↺ Resend Code to Email';
      }
    });
  }
})();
