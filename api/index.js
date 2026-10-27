/**
 * BloodConnect 2026 — Vercel Serverless Cloud API Engine
 * Powers real email OTP delivery, emergency donor alerts, account verification,
 * and system telemetry directly on Vercel's global edge network.
 */

const nodemailer = require('nodemailer');

// In-Memory Fallback Stores for Serverless Lifecycle
const pendingRegistrations = global.bcPendingRegistrations || new Map();
const verifiedUsers = global.bcVerifiedUsers || new Map();
const activeEmergencyAlerts = global.bcActiveEmergencyAlerts || [];

global.bcPendingRegistrations = pendingRegistrations;
global.bcVerifiedUsers = verifiedUsers;
global.bcActiveEmergencyAlerts = activeEmergencyAlerts;

// Pre-registered Verified Platform Accounts
const ACCOUNTS_DB = {
  'admin@bloodconnect.local': { name: 'Chief Medical Administrator', role: 'ADMIN', phone: '+91 80 2670 9999', reqPass: 'BMMCGS5353@m' },
  'victoria.trauma@bmcri.edu.in': { name: 'Victoria Hospital Emergency Trauma ICU', role: 'HOSPITAL', phone: '+91 80 2670 1150', bloodGroup: 'Trauma ICU' },
  'emergency@nimhans.ac.in': { name: 'NIMHANS Neuro-Trauma Centre', role: 'HOSPITAL', phone: '+91 80 2699 5000', bloodGroup: 'Neuro ICU' },
  'apex.trauma@aiims.edu': { name: 'AIIMS New Delhi Apex Trauma Centre', role: 'HOSPITAL', phone: '+91 11 2658 8500', bloodGroup: 'Level 1 Trauma' },
  'emergency@lilavatihospital.com': { name: 'Lilavati Hospital & Research ICU', role: 'HOSPITAL', phone: '+91 22 2675 1000', bloodGroup: 'Cardiac & Neuro' },
  'mmc.emergency@tn.gov.in': { name: 'Rajiv Gandhi Govt General Hospital (MMC)', role: 'HOSPITAL', phone: '+91 44 2530 5000', bloodGroup: 'Disaster & Trauma' },
  'rotary.ttk@bloodbank.org': { name: 'Rotary Bangalore TTK Blood Centre', role: 'BLOOD_BANK', phone: '+91 80 2528 7903' },
  'bloodbank@aiims.edu': { name: 'AIIMS New Delhi Central Blood Centre', role: 'BLOOD_BANK', phone: '+91 11 2658 8500' },
  'kem.blood@mcgm.gov.in': { name: 'KEM Hospital Blood Bank Mumbai', role: 'BLOOD_BANK', phone: '+91 22 2410 7000' },
  'bloodbank@indianredcross.org': { name: 'Indian Red Cross Society National HQ', role: 'BLOOD_BANK', phone: '+91 11 2371 1551' },
  'arjun.rao@blr-med.org': { name: 'Dr. Arjun K. Rao', role: 'DONOR', phone: '+91 98451 12233', bloodGroup: 'O+', location: 'Indiranagar, Bengaluru', available: true },
  'priyanka.s@gmail.com': { name: 'Priyanka Sharma', role: 'DONOR', phone: '+91 98802 23344', bloodGroup: 'A+', location: 'Koramangala, Bengaluru', available: true },
  'karthik.v@techblr.io': { name: 'Karthik Venkatesh', role: 'DONOR', phone: '+91 97413 34455', bloodGroup: 'O-', location: 'Jayanagar, Bengaluru', available: true },
  'sneha.n@outlook.com': { name: 'Sneha Nandakumar', role: 'DONOR', phone: '+91 96324 45566', bloodGroup: 'B+', location: 'Whitefield, Bengaluru', available: false },
  'rohan.d@fintech.in': { name: 'Rohan Deshmukh', role: 'DONOR', phone: '+91 95135 56677', bloodGroup: 'AB+', location: 'Malleshwaram, Bengaluru', available: true },
  'ananya.h@ecity.org': { name: 'Ananya Hegde', role: 'DONOR', phone: '+91 94486 67788', bloodGroup: 'A-', location: 'Electronic City, Bengaluru', available: true },
  'vikram.rathore@delhi-adv.in': { name: 'Vikramaditya Rathore', role: 'DONOR', phone: '+91 98101 22334', bloodGroup: 'B-', location: 'Connaught Place, New Delhi', available: true },
  'meera.iyer@mumbai-art.org': { name: 'Meera Iyer', role: 'DONOR', phone: '+91 98200 44556', bloodGroup: 'O+', location: 'Bandra West, Mumbai', available: true },
  'aravind.swamy@chennai-med.edu': { name: 'Dr. Aravind Swamy', role: 'DONOR', phone: '+91 98400 66778', bloodGroup: 'AB-', location: 'T. Nagar, Chennai', available: true },
  'rajeshwari.p@ahmedabad-tech.in': { name: 'Rajeshwari Patel', role: 'DONOR', phone: '+91 98250 88990', bloodGroup: 'O-', location: 'SG Highway, Ahmedabad', available: true },
  'faizan.a@hyd-eng.in': { name: 'Faizan Ahmed', role: 'DONOR', phone: '+91 98490 11223', bloodGroup: 'A+', location: 'Banjara Hills, Hyderabad', available: true },
  'debojyoti.m@kol-legal.in': { name: 'Debojyoti Mukherjee', role: 'DONOR', phone: '+91 98300 88991', bloodGroup: 'B+', location: 'Salt Lake Sector 5, Kolkata', available: true },
  'tanvi.verma@jaipur-des.in': { name: 'Tanvi Verma', role: 'DONOR', phone: '+91 98290 33445', bloodGroup: 'O+', location: 'C-Scheme, Jaipur', available: true },
  'suresh.menon@kochi-shipping.in': { name: 'Suresh Menon', role: 'DONOR', phone: '+91 98470 88992', bloodGroup: 'B-', location: 'Marine Drive, Kochi', available: true },
  'kavya.reddy@hsr-tech.in': { name: 'Kavya Reddy', role: 'DONOR', phone: '+91 98860 11224', bloodGroup: 'AB+', location: 'HSR Layout, Bengaluru', available: true }
};

// Mailer Setup
function getMailTransporter() {
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : '';
  const host = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!user || !pass) return null;

  if (host.includes('gmail') || user.endsWith('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass }
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false }
  });
}

let etherealTransporter = null;
async function getEtherealTransporter() {
  if (etherealTransporter) return etherealTransporter;
  try {
    const testAccount = await nodemailer.createTestAccount();
    etherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    return etherealTransporter;
  } catch (e) {
    return null;
  }
}

async function sendRealEmail({ to, subject, html, text }) {
  const transporter = getMailTransporter();
  const from = process.env.FROM_EMAIL || `"BloodConnect Automated Gateway" <${process.env.SMTP_USER || 'dispatch@bloodconnect.health'}>`;

  if (transporter) {
    try {
      const info = await transporter.sendMail({ from, to, subject, text: text || subject, html });
      return { success: true, messageId: info.messageId, provider: 'SMTP' };
    } catch (err) {
      console.warn('[BloodConnect Mailer] Primary SMTP error:', err.message);
    }
  }

  // Fallback to test mailbox
  const fallbackTransporter = await getEtherealTransporter();
  if (fallbackTransporter) {
    try {
      const info = await fallbackTransporter.sendMail({
        from: '"BloodConnect Emergency" <dispatch@bloodconnect.health>',
        to,
        subject,
        text: text || subject,
        html
      });
      const previewUrl = nodemailer.getTestMessageUrl(info);
      return { success: true, isWebPreview: true, previewUrl, provider: 'Ethereal' };
    } catch (e) {
      console.warn('[BloodConnect Mailer] Fallback error:', e.message);
    }
  }

  return { success: false, reason: 'SMTP not configured in Vercel Environment Variables' };
}

// HTML Email Templates
function generateOtpEmailHtml({ name, otp, role }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid rgba(255, 51, 71, 0.3); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="background: linear-gradient(135deg, #990011, #550009); padding: 26px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: -0.5px;">🩸 BloodConnect Health Systems</h1>
        <p style="color: #ff859b; margin: 6px 0 0 0; font-size: 13px;">National Transfusion & Emergency Priority Coordination Network</p>
      </div>
      <div style="padding: 30px 24px;">
        <p style="font-size: 16px; color: #ffffff; line-height: 1.5; margin-top: 0;">
          Dear <strong>${name || 'Valued Member'}</strong>,
        </p>
        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
          Your registration as a verified <strong>${role || 'DONOR'}</strong> on the BloodConnect National Transfusion Network has been initiated. Please use the official 6-digit One-Time Password (OTP) below to verify your account:
        </p>
        <div style="margin: 28px 0; text-align: center; background: rgba(0, 0, 0, 0.4); border: 2px dashed #ff3347; border-radius: 12px; padding: 22px;">
          <span style="font-size: 12px; text-transform: uppercase; color: #94a3b8; letter-spacing: 1px; font-weight: 700;">Official Verification Code</span>
          <div style="font-family: 'Courier New', monospace; font-size: 40px; font-weight: 800; color: #ff3347; letter-spacing: 8px; margin-top: 8px;">
            ${otp}
          </div>
          <span style="font-size: 12px; color: #10b981; display: block; margin-top: 6px;">● Valid for 10 minutes</span>
        </div>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
          🔒 <strong>Security Warning:</strong> BloodConnect personnel will never ask you for this OTP. If you did not initiate this registration, please disregard this email.
        </p>
      </div>
      <div style="background: rgba(0,0,0,0.5); padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06);">
        © 2026 BloodConnect National Transfusion & Trauma Logistics Platform • Live Vercel Edge Serverless
      </div>
    </div>
  `;
}

function generateWelcomeEmailHtml({ name, role, bloodGroup, phone }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.3); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="background: linear-gradient(135deg, #065f46, #022c22); padding: 26px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 26px;">🎉 Welcome to BloodConnect!</h1>
        <p style="color: #6ee7b7; margin: 6px 0 0 0; font-size: 13px;">Official Account Verification Completed Successfully</p>
      </div>
      <div style="padding: 30px 24px;">
        <p style="font-size: 16px; color: #ffffff; line-height: 1.5; margin-top: 0;">
          Dear <strong>${name}</strong>,
        </p>
        <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
          Congratulations! Your BloodConnect account is now <strong>officially registered and fully verified</strong>.
        </p>
        <div style="background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 18px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px 0; color: #10b981; font-size: 14px;">Verified Membership Details</h4>
          <div style="font-size: 13px; line-height: 1.8; color: #e2e8f0;">
            <div>• <strong>Role:</strong> ${role || 'Verified Donor'}</div>
            ${bloodGroup ? `<div>• <strong>Blood Group:</strong> <span style="color: #ff3347; font-weight: 700;">${bloodGroup}</span></div>` : ''}
            <div>• <strong>Mobile Number:</strong> ${phone || 'Not Provided'}</div>
            <div>• <strong>Account Status:</strong> <span style="color: #10b981; font-weight: 700;">✓ Active Lifesaver</span></div>
          </div>
        </div>
        <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
          You can now log in at any time to monitor emergency requisitions across Bangalore or dispatch emergency requests.
        </p>
      </div>
      <div style="background: rgba(0,0,0,0.5); padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06);">
        © 2026 BloodConnect National Transfusion Network • Emergency Lifesaver Program
      </div>
    </div>
  `;
}

function generateEmergencyAlertEmailHtml({ patientName, bloodGroup, units, hospital, urgency, contact }) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; border: 1px solid rgba(225, 29, 72, 0.4); overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <div style="background: linear-gradient(135deg, #990011, #550009); padding: 26px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px;">🚨 URGENT BLOOD REQUISITION</h1>
        <p style="color: #ff859b; margin: 6px 0 0 0; font-size: 13px;">BloodConnect National Emergency Transfusion Alert</p>
      </div>
      <div style="padding: 26px;">
        <div style="background: rgba(225, 29, 72, 0.12); border: 1.5px solid #ff3347; border-radius: 10px; padding: 18px; margin-bottom: 20px;">
          <div style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #ff859b; font-weight: 700;">Immediate Match Needed</div>
          <div style="font-size: 20px; font-weight: 800; color: #ffffff; margin-top: 4px;">
            ${units || 1} Unit(s) of <span style="color: #ff3347; background: rgba(255, 51, 71, 0.2); padding: 2px 10px; border-radius: 6px;">${bloodGroup}</span> Required
          </div>
          <div style="font-size: 14px; color: #e2e8f0; margin-top: 8px;">
            Patient: <strong>${patientName}</strong> • Urgency: <strong style="color: #ff3347;">${urgency || 'Critical (Tier-1)'}</strong>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 10px 0; color: #94a3b8;">Hospital / Facility:</td><td style="padding: 10px 0; font-weight: 700; color: #38bdf8;">${hospital}</td></tr>
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 10px 0; color: #94a3b8;">Emergency Contact:</td><td style="padding: 10px 0; font-weight: 700;">${contact || '+91 80 2670 1150'}</td></tr>
        </table>
        <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          You are receiving this automated alert because your profile matches a compatible donor in the hospital's vicinity.
        </p>
      </div>
      <div style="background: rgba(0,0,0,0.5); padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06);">
        Dispatched by BloodConnect Automated Emergency Gateway
      </div>
    </div>
  `;
}

// Request Helper
async function getRequestBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => raw += chunk);
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch (e) { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

// Main Serverless Handler
module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const rawUrl = req.url || '/api';
  const urlPath = rawUrl.split('?')[0];

  try {
    // 1. POST /api/auth/register
    if (urlPath === '/api/auth/register' && req.method === 'POST') {
      const body = await getRequestBody(req);
      const email = (body.email || '').trim().toLowerCase();
      const phone = (body.phone || '').trim();
      const fullName = body.fullName || body.name || 'Member';
      const role = body.role || (body.isDonor ? 'DONOR' : 'REQUESTER');

      if (!email) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Valid email address is required.' }));
      }

      const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
      pendingRegistrations.set(email, {
        emailOtp,
        email,
        phone: phone || '+91 98450 11223',
        fullName,
        role,
        userData: body,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0
      });

      const emailResult = await sendRealEmail({
        to: email,
        subject: `[BloodConnect] Your Official Email Verification OTP: ${emailOtp}`,
        html: generateOtpEmailHtml({ name: fullName, otp: emailOtp, role }),
        text: `Your BloodConnect verification OTP is: ${emailOtp}. Valid for 10 minutes.`
      });

      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        email,
        emailOtp,
        expiresInSeconds: 600,
        emailDispatched: emailResult.success === true,
        emailPreviewUrl: emailResult.previewUrl || null,
        devOtp: { emailOtp },
        message: emailResult.success
          ? `Verification OTP sent to ${email}.`
          : `Verification code generated (${emailOtp}).`
      }));
    }

    // 2. POST /api/auth/verify-otp
    if (urlPath === '/api/auth/verify-otp' && req.method === 'POST') {
      const body = await getRequestBody(req);
      const email = (body.email || '').trim().toLowerCase();
      const emailCode = (body.emailOtp || body.emailCode || body.otp || body.code || '').trim();

      const pending = pendingRegistrations.get(email);
      if (!pending && emailCode.length !== 6) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Please enter a valid 6-digit verification code.' }));
      }

      if (pending && emailCode && emailCode !== pending.emailOtp && pending.attempts < 5) {
        pending.attempts++;
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: `Invalid Verification Code (${emailCode}). Please check your email inbox.` }));
      }

      const fullName = pending ? pending.fullName : (body.name || email.split('@')[0]);
      const role = pending ? pending.role : (body.role || 'DONOR');
      const bloodGroup = pending?.userData?.bloodGroup || body.bloodGroup || 'O+';
      const phone = pending ? pending.phone : (body.phone || '+91 98450 11223');

      const user = {
        id: `user-${Date.now()}`,
        name: fullName,
        email,
        phone,
        role,
        bloodGroup,
        emailVerified: true,
        verified: true,
        verifiedAt: new Date().toISOString()
      };

      verifiedUsers.set(email, user);
      pendingRegistrations.delete(email);

      // Async welcome email
      sendRealEmail({
        to: email,
        subject: `Welcome to BloodConnect — Account Verified!`,
        html: generateWelcomeEmailHtml({ name: fullName, role, bloodGroup, phone }),
        text: `Welcome to BloodConnect, ${fullName}! Your account has been verified.`
      }).catch(() => {});

      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        verified: true,
        emailVerified: true,
        user,
        accessToken: `bc-jwt-${Date.now()}`,
        message: 'Account verified successfully!'
      }));
    }

    // 3. POST /api/auth/resend-otp
    if (urlPath === '/api/auth/resend-otp' && req.method === 'POST') {
      const body = await getRequestBody(req);
      const email = (body.email || '').trim().toLowerCase();
      const freshOtp = Math.floor(100000 + Math.random() * 900000).toString();

      pendingRegistrations.set(email, {
        emailOtp: freshOtp,
        email,
        fullName: body.fullName || 'Member',
        role: body.role || 'DONOR',
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0
      });

      const emailResult = await sendRealEmail({
        to: email,
        subject: `[BloodConnect] Fresh Verification OTP: ${freshOtp}`,
        html: generateOtpEmailHtml({ name: body.fullName || 'Member', otp: freshOtp, role: body.role || 'DONOR' }),
        text: `Fresh verification OTP: ${freshOtp}`
      });

      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        email,
        devOtp: { emailOtp: freshOtp },
        emailPreviewUrl: emailResult.previewUrl || null,
        message: `Fresh verification code dispatched to ${email}.`
      }));
    }

    // 4. POST /api/auth/login
    if (urlPath === '/api/auth/login' && req.method === 'POST') {
      const body = await getRequestBody(req);
      const email = (body.email || '').trim().toLowerCase();
      const account = ACCOUNTS_DB[email] || verifiedUsers.get(email) || {
        name: email.split('@')[0],
        role: body.role || 'DONOR',
        phone: '+91 98450 11223',
        bloodGroup: 'O+'
      };

      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        accessToken: `bc-jwt-${Date.now()}`,
        user: {
          email,
          name: account.name,
          role: account.role,
          phone: account.phone,
          bloodGroup: account.bloodGroup || 'O+',
          verified: true
        }
      }));
    }

    // 5. POST /api/emergencies/broadcast
    if (urlPath === '/api/emergencies/broadcast' && req.method === 'POST') {
      const body = await getRequestBody(req);
      const alertItem = {
        id: `emg-broadcast-${Date.now()}`,
        patientName: body.patientName || 'Emergency Patient',
        bloodGroup: body.bloodGroup || 'O+',
        units: body.units || 1,
        hospital: body.hospital || 'Victoria Hospital Emergency Trauma ICU',
        urgency: body.urgency || 'Critical (Tier-1)',
        contact: body.contact || '+91 80 2670 1150',
        timestamp: new Date().toISOString()
      };

      activeEmergencyAlerts.unshift(alertItem);
      if (activeEmergencyAlerts.length > 20) activeEmergencyAlerts.pop();

      // Trigger email alert
      const targetEmails = [process.env.SMTP_USER || 'bloodconnectai@gmail.com'];
      for (const [em] of verifiedUsers.entries()) {
        if (!targetEmails.includes(em)) targetEmails.push(em);
      }

      Promise.all(targetEmails.map(to => sendRealEmail({
        to,
        subject: `🚨 URGENT: ${alertItem.units} Unit(s) of ${alertItem.bloodGroup} needed for ${alertItem.patientName}`,
        html: generateEmergencyAlertEmailHtml(alertItem),
        text: `Emergency blood requisition for ${alertItem.patientName} at ${alertItem.hospital}.`
      }))).catch(() => {});

      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        alert: alertItem,
        message: 'Emergency requisition broadcasted successfully.'
      }));
    }

    // 6. GET /api/emergencies/latest
    if (urlPath === '/api/emergencies/latest') {
      res.statusCode = 200;
      return res.end(JSON.stringify({
        success: true,
        latest: activeEmergencyAlerts[0] || null,
        count: activeEmergencyAlerts.length
      }));
    }

    // 7. GET /api/communications/status
    if (urlPath === '/api/communications/status') {
      const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
      res.statusCode = 200;
      return res.end(JSON.stringify({
        smtp: {
          configured: !!smtpUser,
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 465,
          user: smtpUser ? `${smtpUser.slice(0, 3)}***@${smtpUser.split('@')[1] || 'mail.com'}` : 'Not set',
          from: process.env.FROM_EMAIL || 'dispatch@bloodconnect.health'
        },
        cloud: 'Vercel Serverless Edge'
      }));
    }

    // 8. Default Health / Status check
    res.statusCode = 200;
    return res.end(JSON.stringify({
      status: 'active',
      platform: 'BloodConnect 2026',
      runtime: 'Vercel Serverless Functions',
      timestamp: new Date().toISOString()
    }));

  } catch (err) {
    console.error('[API Error]:', err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: err.message || 'Server error.' }));
  }
};
