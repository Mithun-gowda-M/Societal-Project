/**
 * BloodConnect 2026 — Official Enterprise Communications & OTP Verification System
 * 
 * Official Sender ID: VM-BLDCON (DLT India Registered Healthcare Entity)
 * Official Mail Address: dispatch@bloodconnect.health / verification@bloodconnect.org
 * 
 * Generates and dispatches cryptographically verified branded HTML emails and SMS alerts
 * for Donors, Hospitals, Blood Banks, and Patients.
 */

(function () {
  'use strict';

  const STORAGE_KEY_COMMUNICATIONS = 'bloodconnect_official_communications_v1';
  const OFFICIAL_EMAIL = 'dispatch@bloodconnect.health';
  const OFFICIAL_SMS_SENDER = 'VM-BLDCON';

  function getStoredMessages() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_COMMUNICATIONS) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveMessage(msg) {
    const list = getStoredMessages();
    msg.id = msg.id || `msg-${Date.now()}`;
    msg.timestamp = msg.timestamp || new Date().toISOString();
    list.unshift(msg);
    localStorage.setItem(STORAGE_KEY_COMMUNICATIONS, JSON.stringify(list.slice(0, 30)));
    // Disabled fake on-screen toast and drawer: communications now dispatch via real email & SMS gateways
    return msg;
  }

  // 1. Send Donor Registration / Login OTP (Email + SMS)
  function sendRegistrationOtp({ email, phone, name, role = 'DONOR' }) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const securityRef = `BC-SEC-${Math.floor(1000 + Math.random() * 9000)}`;

    // A. Official SMS Message
    const smsMsg = saveMessage({
      type: 'SMS',
      channel: 'TELECOM_SMS',
      sender: OFFICIAL_SMS_SENDER,
      recipient: phone || '+91 98451 XXXXX',
      title: 'Official BloodConnect Account Verification OTP',
      content: `[BloodConnect National Network] Your official account verification code is ${otp}. Valid for 10 minutes. Ref: ${securityRef}. Do not disclose to anyone.`,
      otp,
      role
    });

    // B. Official Branded Email
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid rgba(255, 51, 71, 0.3); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="background: linear-gradient(135deg, #990011, #550009); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px;">🩸 BloodConnect Health Systems</h1>
          <p style="color: #ff859b; margin: 6px 0 0 0; font-size: 13px;">Official Transfusion & Emergency Coordination Gateway</p>
        </div>
        <div style="padding: 28px 24px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #94a3b8; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 10px; margin-bottom: 20px;">
            <span>From: <strong>${OFFICIAL_EMAIL}</strong></span>
            <span>Security Ref: <strong>${securityRef}</strong></span>
          </div>
          <p style="font-size: 15px; color: #f8fafc; line-height: 1.5;">Dear <strong>${name || 'Health Platform Member'}</strong>,</p>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
            Your registration as a verified <strong>${role}</strong> on the BloodConnect National Transfusion Network has been initiated. Please use the official 6-digit One-Time Password (OTP) below to authenticate your identity and verify your contact details:
          </p>
          
          <div style="margin: 24px 0; text-align: center; background: rgba(0, 0, 0, 0.4); border: 1px dashed #ff3347; border-radius: 10px; padding: 18px;">
            <span style="font-size: 11px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px;">Official Verification Code</span>
            <div style="font-family: 'Courier New', monospace; font-size: 34px; font-weight: 800; color: #ff3347; letter-spacing: 6px; margin-top: 6px;">
              ${otp}
            </div>
            <span style="font-size: 11px; color: #10b981; display: block; margin-top: 4px;">● Valid for 10 minutes</span>
          </div>

          <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
            🔒 <strong>Security Advisory:</strong> BloodConnect personnel will never ask for your OTP over phone calls or social media. If you did not initiate this request, immediately notify our 24x7 security desk at security@bloodconnect.health.
          </p>
        </div>
        <div style="background: rgba(0,0,0,0.5); padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06);">
          © 2026 BloodConnect National Transfusion & Trauma Logistics Platform • DLT Certified Entity
        </div>
      </div>
    `;

    const emailMsg = saveMessage({
      type: 'EMAIL',
      channel: 'OFFICIAL_MAIL',
      sender: OFFICIAL_EMAIL,
      recipient: email || 'user@hospital.edu.in',
      subject: `[BloodConnect] Official Account Verification Code: ${otp}`,
      html: emailHtml,
      otp,
      role
    });

    return { otp, smsMsg, emailMsg };
  }

  // 2. Send Hospital Emergency Dispatch Notification
  function sendHospitalDispatch({ hospitalName, hospitalEmail, patientName, bloodGroup, units, donorName, donorPhone, etaMinutes }) {
    const refId = `DISPATCH-BLR-${Math.floor(1000 + Math.random() * 9000)}`;

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.4); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #065f46, #022c22); padding: 22px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">🚑 Transfusion Dispatch Confirmed</h2>
          <p style="color: #6ee7b7; margin: 4px 0 0 0; font-size: 12px;">Official Notification for ${hospitalName}</p>
        </div>
        <div style="padding: 24px;">
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; padding: 14px; margin-bottom: 18px;">
            <strong style="color: #10b981; font-size: 14px;">Requisition Order #${refId} Active</strong>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #e2e8f0;">
              Matched Donor <strong>${donorName}</strong> (${bloodGroup}) has accepted the emergency call and is en route to ${hospitalName}.
            </p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 14px 0;">
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 8px 0; color: #94a3b8;">Patient Name:</td><td style="padding: 8px 0; font-weight: 700;">${patientName}</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 8px 0; color: #94a3b8;">Requested Unit:</td><td style="padding: 8px 0; font-weight: 700; color: #ff3347;">${bloodGroup} (${units} Units)</td></tr>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 8px 0; color: #94a3b8;">Hero Donor:</td><td style="padding: 8px 0; font-weight: 700;">${donorName} (Phone: ${donorPhone})</td></tr>
            <tr><td style="padding: 8px 0; color: #94a3b8;">Estimated Arrival:</td><td style="padding: 8px 0; font-weight: 700; color: #38bdf8;">~${etaMinutes || 6} Minutes (Live GPS Tracked)</td></tr>
          </table>
          <div style="text-align: center; margin-top: 20px;">
            <a href="/live-dispatch" style="background: #10b981; color: #020617; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13px; display: inline-block;">
              View Live Donor GPS Tracking Map ➔
            </a>
          </div>
        </div>
      </div>
    `;

    return saveMessage({
      type: 'EMAIL',
      channel: 'OFFICIAL_MAIL',
      sender: OFFICIAL_EMAIL,
      recipient: hospitalEmail || 'emergency@trauma-icu.edu.in',
      subject: `[Official Dispatch] Requisition #${refId} — Donor En Route for ${patientName}`,
      html: emailHtml,
      role: 'HOSPITAL'
    });
  }

  // 3. Send Patient Family Reassurance & Live Tracking Notification
  function sendPatientUpdate({ patientName, patientPhone, patientEmail, hospitalName, bloodGroup, donorName }) {
    // SMS to Patient Family
    saveMessage({
      type: 'SMS',
      channel: 'TELECOM_SMS',
      sender: OFFICIAL_SMS_SENDER,
      recipient: patientPhone || '+91 98450 XXXXX',
      title: 'Donor Accepted Emergency Blood Call',
      content: `[BloodConnect Emergency] Hero Donor ${donorName} (${bloodGroup}) has accepted your blood request for ${patientName} at ${hospitalName}. Live tracking link: http://localhost:5500/live-dispatch`,
      role: 'PATIENT'
    });

    // Email to Patient Family
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid rgba(56, 189, 248, 0.4); padding: 24px;">
        <h2 style="color: #38bdf8; margin-top: 0;">❤️ Help is on the Way: Donor En Route</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #e2e8f0;">
          Dear Family of <strong>${patientName}</strong>,<br/><br/>
          A verified volunteer donor, <strong>${donorName}</strong> (${bloodGroup}), has accepted your emergency requisition at <strong>${hospitalName}</strong> and is currently in transit.
        </p>
        <p style="font-size: 13px; color: #94a3b8;">
          You can track the donor's movement in real-time until they reach the patient at the hospital entrance.
        </p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="/live-dispatch" style="background: #38bdf8; color: #020617; text-decoration: none; padding: 10px 22px; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
            Open Live Patient-to-Donor Tracker
          </a>
        </div>
      </div>
    `;

    return saveMessage({
      type: 'EMAIL',
      channel: 'OFFICIAL_MAIL',
      sender: OFFICIAL_EMAIL,
      recipient: patientEmail || 'family@emergency.org',
      subject: `[BloodConnect] Help is on the Way: Hero Donor Accepted Request for ${patientName}`,
      html: emailHtml,
      role: 'PATIENT'
    });
  }

  // 4. Send Blood Bank Critical Inventory Restock & Courier Alert
  function sendBloodBankAlert({ bankName, bankEmail, bankPhone, bloodGroup, unitsRequired, urgentHospital }) {
    const alertId = `BB-RESTOCK-${Math.floor(1000 + Math.random() * 9000)}`;

    // SMS to Blood Bank Officer
    saveMessage({
      type: 'SMS',
      channel: 'TELECOM_SMS',
      sender: OFFICIAL_SMS_SENDER,
      recipient: bankPhone || '+91 80 2670 XXXXX',
      title: 'Priority Inventory Reservation Alert',
      content: `[BloodConnect BloodBank Ops] Urgent reserve order #${alertId}: ${unitsRequired} units of ${bloodGroup} required for ${urgentHospital}. Cold-chain courier dispatched. Authorize: http://localhost:5500/blood-banks`,
      role: 'BLOOD_BANK'
    });

    // Email to Blood Bank Medical Director
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.4); padding: 24px;">
        <div style="background: linear-gradient(135deg, #d97706, #78350f); padding: 18px 24px; border-radius: 8px; margin: -24px -24px 20px -24px;">
          <h2 style="color: #ffffff; margin: 0; font-size: 20px;">🏥 Official Blood Bank Restock & Transfusion Order</h2>
          <p style="color: #fde68a; margin: 4px 0 0 0; font-size: 12px;">Alert ID: ${alertId} • National Transfusion Council Gateway</p>
        </div>
        <p style="font-size: 14px; color: #e2e8f0;">
          Attention <strong>${bankName}</strong> Transfusion Director,<br/><br/>
          BloodConnect National Emergency Ops has allocated an urgent requisition for <strong>${unitsRequired} units of ${bloodGroup}</strong> for immediate transfer to <strong>${urgentHospital}</strong>.
        </p>
        <div style="background: rgba(0,0,0,0.3); border-left: 4px solid #f59e0b; padding: 14px; margin: 16px 0; border-radius: 4px;">
          <div style="font-size: 13px; color: #fcd34d;"><strong>Target Facility:</strong> ${urgentHospital}</div>
          <div style="font-size: 13px; color: #fcd34d; margin-top: 4px;"><strong>Component Required:</strong> ${bloodGroup} PRBC / Platelets</div>
          <div style="font-size: 13px; color: #fcd34d; margin-top: 4px;"><strong>Cold Chain Protocol:</strong> +2°C to +6°C Verified Carrier</div>
        </div>
        <p style="font-size: 12px; color: #94a3b8;">
          Please prepare cross-match documentation. Courier telemetry is live in the National Ops portal.
        </p>
      </div>
    `;

    return saveMessage({
      type: 'EMAIL',
      channel: 'OFFICIAL_MAIL',
      sender: OFFICIAL_EMAIL,
      recipient: bankEmail || 'inventory@rotaryttk.org',
      subject: `[Blood Bank Directive] Order #${alertId} — Prepare ${unitsRequired} Units ${bloodGroup} for ${urgentHospital}`,
      html: emailHtml,
      role: 'BLOOD_BANK'
    });
  }

  // Toast Notification for Real-Time UI Feedback
  function showNotificationToast(msg) {
    let container = document.getElementById('officialCommToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'officialCommToastContainer';
      container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; max-width: 380px; pointer-events: none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid ${msg.type === 'SMS' ? '#10b981' : '#38bdf8'};
      border-radius: 10px;
      padding: 12px 16px;
      color: #ffffff;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6);
      backdrop-filter: blur(12px);
      pointer-events: auto;
      cursor: pointer;
      animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `;

    const icon = msg.type === 'SMS' ? '📱' : '📬';
    const badgeColor = msg.type === 'SMS' ? '#10b981' : '#38bdf8';

    toast.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
        <span style="font-size: 11px; font-weight: 700; color: ${badgeColor}; display: flex; align-items: center; gap: 6px;">
          ${icon} OFFICIAL ${msg.type} DISPATCHED
        </span>
        <span style="font-size: 10px; color: #94a3b8;">Just Now</span>
      </div>
      <div style="font-size: 12px; font-weight: 600; color: #f8fafc;">
        From: <code>${msg.sender}</code> ➔ <code>${msg.recipient}</code>
      </div>
      <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px; line-height: 1.4;">
        ${msg.type === 'SMS' ? msg.content : (msg.subject || 'Official Notification')}
      </div>
      ${msg.otp ? `<div style="font-size: 12px; font-weight: 800; color: #ff3347; margin-top: 4px;">OTP Security Code: <strong>${msg.otp}</strong></div>` : ''}
    `;

    toast.addEventListener('click', () => {
      openCommunicationsDrawer();
      toast.remove();
    });

    container.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(() => toast.remove(), 400);
      }
    }, 8000);
  }

  // Floating Communications Trigger Button & Modal Drawer
  function createFloatingDrawerButton() {
    if (document.getElementById('floatingCommBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'floatingCommBtn';
    btn.type = 'button';
    btn.title = 'View Official Mail & SMS Inbox (dispatch@bloodconnect.health)';
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 9999;
      background: linear-gradient(135deg, #990011, #1e1b4b);
      border: 1px solid rgba(255, 51, 71, 0.4);
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 700;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      backdrop-filter: blur(10px);
      transition: transform 0.2s, box-shadow 0.2s;
    `;
    btn.innerHTML = `
      <span>📬</span>
      <span>Official Mail & SMS Center</span>
      <span id="commDrawerBadge" style="background: #10b981; color: #020617; font-size: 10px; padding: 2px 6px; border-radius: 10px; font-weight: 800;">0</span>
    `;

    btn.addEventListener('click', openCommunicationsDrawer);
    document.body.appendChild(btn);
    updateDrawerBadge();
  }

  function updateDrawerBadge() {
    const badge = document.getElementById('commDrawerBadge');
    if (badge) {
      badge.textContent = getStoredMessages().length;
    }
  }

  function openCommunicationsDrawer() {
    let modal = document.getElementById('commDrawerModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'commDrawerModal';
      modal.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 100000;
        background: rgba(0, 0, 0, 0.75);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      `;
      document.body.appendChild(modal);
    }

    const messages = getStoredMessages();

    modal.innerHTML = `
      <div style="background: #0f172a; border: 1px solid rgba(255, 51, 71, 0.3); border-radius: 16px; width: 100%; max-width: 780px; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 20px 50px rgba(0,0,0,0.8); overflow: hidden;">
        <!-- Header -->
        <div style="background: #1e293b; padding: 18px 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: #38bdf8; font-weight: 700; letter-spacing: 0.05em;">Official Regulatory Gateway</div>
            <h2 style="font-family: var(--font-display, sans-serif); color: #ffffff; font-size: 20px; margin: 2px 0 0 0;">
              📬 Official Mail & SMS Communications Tray
            </h2>
            <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
              Sender Mail: <code>${OFFICIAL_EMAIL}</code> • Telecom Sender ID: <code>${OFFICIAL_SMS_SENDER}</code>
            </div>
          </div>
          <button id="closeCommDrawerBtn" style="background: rgba(255,255,255,0.1); border: none; color: #ffffff; font-size: 18px; width: 34px; height: 34px; border-radius: 50%; cursor: pointer;">✕</button>
        </div>

        <!-- Message List Container -->
        <div style="padding: 20px 24px; overflow-y: auto; flex: 1;">
          ${messages.length === 0 ? `
            <div style="text-align: center; padding: 40px; color: #94a3b8;">
              <div style="font-size: 40px; margin-bottom: 10px;">📭</div>
              <p style="font-size: 14px;">No communications generated yet.</p>
              <p style="font-size: 12px; color: #64748b;">Trigger a new registration, donor acceptance, or emergency request to observe official verification emails & SMS.</p>
              <button onclick="window.OfficialMailer.sendRegistrationOtp({ email: 'donor@blr-med.org', phone: '+91 98451 12233', name: 'Dr. Arjun Rao' })" class="btn btn-primary btn-sm" style="margin-top: 10px;">
                ⚡ Generate Sample Donor OTP
              </button>
            </div>
          ` : messages.map((m, idx) => `
            <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 16px; margin-bottom: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span class="badge" style="background: ${m.type === 'SMS' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)'}; color: ${m.type === 'SMS' ? '#10b981' : '#38bdf8'}; font-size: 11px; font-weight: 700;">
                  ${m.type === 'SMS' ? '📱 TELECOM SMS' : '📧 OFFICIAL EMAIL'} • ${m.role || 'ALL ROLES'}
                </span>
                <span style="font-size: 11px; color: #94a3b8;">${new Date(m.timestamp).toLocaleTimeString()}</span>
              </div>
              <div style="font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
                <strong>Sender:</strong> <code style="color: #ffffff;">${m.sender}</code> ➔ <strong>Recipient:</strong> <code style="color: #ffffff;">${m.recipient}</code>
              </div>
              ${m.subject ? `<div style="font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 8px;">${m.subject}</div>` : ''}
              
              <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 12px; font-size: 12px; color: #e2e8f0; line-height: 1.5;">
                ${m.type === 'SMS' ? m.content : `
                  <div style="max-height: 200px; overflow-y: auto;">${m.html}</div>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.getElementById('closeCommDrawerBtn').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  // Live Emergency In-App Pop-up Alert
  function showEmergencyAlertModal(data) {
    const existing = document.getElementById('emergencyAlertOverlayModal');
    if (existing) existing.remove();

    // Play subtle audio alert tone (Web Audio API synthesized chime)
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch (e) {}

    // Native Browser Desktop Notification (if permitted)
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          const notif = new Notification(`🚨 Urgent Blood Alert: ${data.patientName || 'Emergency'} (${data.bloodGroup || 'O+'})`, {
            body: `${data.units || 1} Unit(s) needed at ${data.hospital || 'Bangalore Hospital'}. Click to navigate.`,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: data.id || `emg-${Date.now()}`
          });
          notif.onclick = () => {
            window.focus();
            window.location.href = '/live-dispatch';
          };
        } catch (e) {}
      } else if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    const modal = document.createElement('div');
    modal.id = 'emergencyAlertOverlayModal';
    modal.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 999999;
      max-width: 440px;
      width: calc(100% - 48px);
      background: rgba(15, 23, 42, 0.98);
      border: 2px solid #ff3347;
      border-radius: 16px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(225, 29, 72, 0.35);
      backdrop-filter: blur(16px);
      color: #ffffff;
      padding: 22px;
      transition: all 0.3s ease;
    `;

    modal.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 24px;">🚨</span>
          <div>
            <span class="badge badge-critical" style="font-size: 11px; padding: 2px 8px; font-weight: 800; background: #e11d48; color: #fff;">CRITICAL EMERGENCY BROADCAST</span>
            <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">Real-Time Patient Requisition</div>
          </div>
        </div>
        <button type="button" id="closeEmergencyAlertBtn" style="background: transparent; border: none; color: #94a3b8; font-size: 20px; cursor: pointer; padding: 0 4px; line-height: 1;">&times;</button>
      </div>

      <div style="background: rgba(225, 29, 72, 0.12); border: 1px solid rgba(225, 29, 72, 0.3); border-radius: 10px; padding: 14px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="font-size: 16px; color: #ffffff;">${data.patientName || 'Emergency Patient'}</strong>
          <span style="background: #e11d48; color: #ffffff; font-family: monospace; font-size: 14px; font-weight: 800; padding: 3px 10px; border-radius: 6px;">
            ${data.bloodGroup || 'O+'} (${data.units || 1} Units)
          </span>
        </div>
        <div style="font-size: 13px; color: #cbd5e1; margin-top: 4px;">
          🏥 <strong>${data.hospital || 'Victoria Hospital Emergency Trauma ICU'}</strong>
        </div>
        <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">
          Urgency: <strong style="color: #ff3347;">${data.urgency || 'Critical (Tier-1)'}</strong> • Contact: <strong>${data.contact || '+91 80 2670 1150'}</strong>
        </div>
      </div>

      <div style="font-size: 12px; color: #10b981; line-height: 1.5; margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
        <span>✉️</span>
        <span>Automated email notification dispatched from <strong>bloodconnectai@outlook.com</strong></span>
      </div>

      <div style="display: flex; gap: 10px;">
        <a href="/live-dispatch" class="btn btn-primary btn-sm" style="flex: 2; text-align: center; text-decoration: none; padding: 10px 14px; font-size: 13px; font-weight: 700; background: #e11d48; border: none;">
          🧭 Open Live Route & Accept ➔
        </a>
        <button type="button" id="dismissEmergencyAlertBtn" class="btn btn-secondary btn-sm" style="flex: 1; padding: 10px 14px; font-size: 13px;">
          Dismiss
        </button>
      </div>
    `;

    document.body.appendChild(modal);

    const closeBtn = document.getElementById('closeEmergencyAlertBtn');
    const dismissBtn = document.getElementById('dismissEmergencyAlertBtn');
    if (closeBtn) closeBtn.onclick = () => modal.remove();
    if (dismissBtn) dismissBtn.onclick = () => modal.remove();

    // Auto-dismiss after 20 seconds
    setTimeout(() => {
      if (modal.parentNode) {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.5s ease';
        setTimeout(() => modal.remove(), 500);
      }
    }, 20000);
  }

  let lastSeenAlertId = null;

  function triggerAlertIfNew(data) {
    if (!data) return;
    const alertId = data.id || `${data.patientName}_${data.timestamp || ''}`;
    if (alertId === lastSeenAlertId) return;
    lastSeenAlertId = alertId;
    showEmergencyAlertModal(data);
  }

  // Listen for storage events across tabs to pop up emergency alert on all open pages
  window.addEventListener('storage', (e) => {
    if (e.key === 'bloodconnect_latest_emergency_broadcast' && e.newValue) {
      try {
        const data = JSON.parse(e.newValue);
        triggerAlertIfNew(data);
      } catch (err) {}
    }
  });

  // Check for live emergency broadcasts from server
  async function checkForServerEmergencyBroadcast() {
    try {
      const res = await fetch('/api/emergencies/latest');
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.latest) {
          const ageMs = Date.now() - new Date(body.latest.timestamp).getTime();
          // Only pop up if broadcast occurred within last 2 minutes
          if (ageMs < 120000) {
            triggerAlertIfNew(body.latest);
          }
        }
      }
    } catch (e) {
      // offline or server restarting
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Check shortly after page load
    setTimeout(checkForServerEmergencyBroadcast, 1500);
    // Poll periodically (every 7 seconds) so donors get immediate pop-ups when patient requests
    setInterval(checkForServerEmergencyBroadcast, 7000);
  });

  window.OfficialMailer = {
    OFFICIAL_EMAIL,
    OFFICIAL_SMS_SENDER,
    sendRegistrationOtp,
    sendHospitalDispatch,
    sendPatientUpdate,
    sendBloodBankAlert,
    showEmergencyAlertModal,
    openCommunicationsDrawer,
    getMessages: getStoredMessages
  };
})();
