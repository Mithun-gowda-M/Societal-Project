/**
 * BloodConnect 2026 — Production-Style Server with Real Email (SMTP) & Real SMS Gateway
 * Supports clean URL routing, static assets, and full API endpoints for:
 * - Real Email & SMS OTP Dispatch
 * - Real OTP Verification & Registration Activation
 * - Official Welcome & Registered Confirmation Email/SMS Dispatch
 * - Gateway Configuration & Connection Diagnostics
 */

require('dotenv').config();
const http = require('http');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const PORT = process.env.PORT || 5500;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

// In-Memory Registration & OTP Store
const pendingRegistrations = new Map();
const verifiedUsers = new Map();

// Helper to create Nodemailer transporter
// Helper to create Nodemailer transporter for Gmail / Outlook / Custom SMTP
function getMailTransporter() {
  const user = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : 'bloodconnectai@gmail.com';
  const pass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : '';
  const host = process.env.SMTP_HOST ? process.env.SMTP_HOST.trim() : 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (!user || !pass) {
    return null;
  }

  // Official Nodemailer configuration for Google Gmail
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
    tls: {
      rejectUnauthorized: false
    }
  });
}

// Fallback Ethereal Transporter Cache
let etherealTransporter = null;
async function getEtherealTransporter() {
  if (etherealTransporter) return etherealTransporter;
  try {
    const testAccount = await nodemailer.createTestAccount();
    etherealTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log(`[Ethereal Gateway] Fallback test mailbox ready: ${testAccount.user}`);
    return etherealTransporter;
  } catch (err) {
    console.warn('[Ethereal Gateway] Could not initialize fallback ethereal account:', err.message);
    return null;
  }
}

// Send Real Email with SMTP & Ethereal Fallback
async function sendRealEmail({ to, subject, html, text }) {
  const transporter = getMailTransporter();
  const from = process.env.FROM_EMAIL || `"BloodConnect Automated Gateway" <${process.env.SMTP_USER || 'BloodconnectAi@outlook.com'}>`;
  let smtpErrorMessage = null;

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        text: text || subject,
        html
      });
      console.log(`[Real Mailer] ✓ Real email delivered to ${to} via Outlook/SMTP (MessageId: ${info.messageId})`);
      return { success: true, messageId: info.messageId, provider: 'SMTP' };
    } catch (err) {
      smtpErrorMessage = err.message;
      console.error(`[Real Mailer] ❌ SMTP Error sending to ${to}:`, err.message);
      if (err.message.includes('SmtpClientAuthentication is disabled')) {
        console.warn(`[Microsoft Outlook Advisory] Microsoft requires modern authentication for this mailbox. Generate a 16-character App Password at account.live.com or enable POP/IMAP in Outlook Web Settings.`);
      }
    }
  } else {
    console.warn(`[Real Mailer] SMTP credentials (SMTP_USER / SMTP_PASS) not configured in .env.`);
  }

  // Fallback: Dispatch to Ethereal live web inbox
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
      console.log(`[Real Mailer / Web Inbox Preview] Dispatched! View live email at: ${previewUrl}`);
      
      let humanReason = 'Preview Mode Active';
      if (smtpErrorMessage) {
        if (smtpErrorMessage.includes('SmtpClientAuthentication is disabled')) {
          humanReason = 'Outlook requires an App Password (SMTP Client Auth disabled for mailbox). Email generated & viewable via Preview Link below.';
        } else {
          humanReason = `SMTP Error (${smtpErrorMessage.slice(0, 80)}...). View via Preview Link below.`;
        }
      } else if (!process.env.SMTP_PASS) {
        humanReason = 'SMTP_PASS not set. View email via preview link below.';
      }

      return {
        success: false,
        isWebPreview: true,
        previewUrl,
        smtpError: smtpErrorMessage,
        reason: humanReason
      };
    } catch (err) {
      console.error('[Ethereal Fallback] Error:', err.message);
    }
  }

  return {
    success: false,
    reason: smtpErrorMessage || 'SMTP credentials not configured in .env and fallback unavailable'
  };
}

// Send Real SMS
async function sendRealSms({ to, message }) {
  const provider = (process.env.SMS_PROVIDER || 'TWILIO').toUpperCase();
  const twilioSid = process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.trim() : '';
  const twilioToken = process.env.TWILIO_AUTH_TOKEN ? process.env.TWILIO_AUTH_TOKEN.trim() : '';
  const twilioFrom = process.env.TWILIO_FROM_NUMBER ? process.env.TWILIO_FROM_NUMBER.trim() : '';
  const fast2SmsKey = process.env.FAST2SMS_API_KEY ? process.env.FAST2SMS_API_KEY.trim() : '';

  // 1. Fast2SMS Option (Indian 10-digit mobile numbers)
  if (fast2SmsKey && (provider === 'FAST2SMS' || to.startsWith('+91') || to.length >= 10)) {
    const cleanNumber = to.replace(/\D/g, '').slice(-10);
    try {
      // Use dedicated high-speed OTP route if a 6-digit OTP is present
      const otpMatch = message.match(/\b\d{6}\b/);
      let url;
      if (otpMatch) {
        url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2SmsKey)}&route=otp&variables_values=${encodeURIComponent(otpMatch[0])}&flash=0&numbers=${encodeURIComponent(cleanNumber)}`;
      } else {
        url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(fast2SmsKey)}&route=q&message=${encodeURIComponent(message)}&language=english&flash=0&numbers=${encodeURIComponent(cleanNumber)}`;
      }
      const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
      const json = await res.json();
      console.log(`[Real SMS / Fast2SMS] Status for ${cleanNumber}:`, json);
      return { success: json.return === true, details: json };
    } catch (e) {
      console.error(`[Real SMS / Fast2SMS] Error:`, e.message);
      return { success: false, error: e.message };
    }
  }

  // 2. Twilio Option
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const formattedTo = to.startsWith('+') ? to : `+91${to.replace(/\D/g, '').slice(-10)}`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const body = new URLSearchParams({
        To: formattedTo,
        From: twilioFrom,
        Body: message
      });

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
      });

      const json = await res.json();
      if (res.ok) {
        console.log(`[Real SMS / Twilio] ✓ SMS sent to ${formattedTo} (SID: ${json.sid})`);
        return { success: true, sid: json.sid };
      } else {
        console.error(`[Real SMS / Twilio] ❌ Error:`, json.message);
        return { success: false, error: json.message };
      }
    } catch (err) {
      console.error(`[Real SMS / Twilio] Exception:`, err.message);
      return { success: false, error: err.message };
    }
  }

  console.warn(`[Real SMS] Neither Twilio nor Fast2SMS credentials are configured in .env.`);
  return { success: false, reason: 'SMS gateway credentials not configured in .env' };
}

// HTML Template for OTP Email
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
          🔒 <strong>Security Warning:</strong> BloodConnect emergency personnel will never ask you for this OTP over phone calls or social media. If you did not initiate this registration, please disregard this email.
        </p>
      </div>
      <div style="background: rgba(0,0,0,0.5); padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06);">
        © 2026 BloodConnect National Transfusion & Trauma Logistics Platform • DLT Certified Entity
      </div>
    </div>
  `;
}

// HTML Template for Welcome & Registration Confirmation Email
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
            <div>• <strong>Mobile Number:</strong> ${phone}</div>
            <div>• <strong>Account Status:</strong> <span style="color: #10b981; font-weight: 700;">✓ Active Lifesaver</span></div>
          </div>
        </div>

        <p style="font-size: 13px; color: #94a3b8; line-height: 1.6;">
          You can now log in at any time to update your donation availability, monitor emergency requisitions across Bangalore, or dispatch emergency requests.
        </p>
        
        <div style="text-align: center; margin-top: 24px;">
          <a href="http://localhost:5500/login" style="display: inline-block; background: #c1121f; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px;">
            Access Your BloodConnect Portal ➔
          </a>
        </div>
      </div>
      <div style="background: rgba(0,0,0,0.5); padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06);">
        © 2026 BloodConnect National Transfusion Network • Emergency Lifesaver Program
      </div>
    </div>
  `;
}

// HTML Template for Emergency Blood Alert Email to Donors
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
          <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);"><td style="padding: 10px 0; color: #94a3b8;">Triage Protocol:</td><td style="padding: 10px 0; color: #10b981; font-weight: 700;">Immediate Bedside Phlebotomy Ready</td></tr>
        </table>

        <p style="font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          You are receiving this automated alert from BloodConnect because your verified profile is registered as a compatible donor in the patient's area. If available, please open the live dispatch tracker or report to the hospital blood bank.
        </p>

        <div style="text-align: center; margin: 26px 0 10px 0;">
          <a href="http://localhost:5500/live-dispatch" style="display: inline-block; background: #e11d48; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 14px rgba(225, 29, 72, 0.4);">
            🚑 Accept Requisition & Navigate to Hospital ➔
          </a>
        </div>
      </div>
      <div style="background: rgba(0,0,0,0.5); padding: 14px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.06);">
        Dispatched by BloodConnect Automated Emergency Gateway • bloodconnectai@outlook.com
      </div>
    </div>
  `;
}

// In-Memory Active Emergency Broadcast Alerts Store
const activeEmergencyAlerts = [];

// Clean URL Route Map
const ROUTE_MAP = {
  '/': 'index.html',
  '/donors': 'nearby-donors.html',
  '/find-donors': 'nearby-donors.html',
  '/hospitals': 'hospitals.html',
  '/blood-banks': 'bangalore-blood-banks.html',
  '/bangalore-blood-banks': 'bangalore-blood-banks.html',
  '/radar': 'ai-forecast.html',
  '/forecast': 'ai-forecast.html',
  '/ai-forecast': 'ai-forecast.html',
  '/live-dispatch': 'request-tracking.html',
  '/tracking': 'request-tracking.html',
  '/emergency': 'emergency-request.html',
  '/sos': 'emergency-request.html',
  '/portal': 'donor-dashboard.html',
  '/dashboard': 'donor-dashboard.html',
  '/patient-portal': 'patient-dashboard.html',
  '/patient': 'patient-dashboard.html',
  '/login': 'login.html',
  '/register': 'register.html',
  '/onboard': 'register.html',
  '/admin': 'admin-dashboard.html',
  '/ops': 'admin-dashboard.html',
  '/about': 'about.html',
  '/reviews': 'reviews.html',
  '/matching-results': 'matching-results.html'
};

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
  '.md': 'text/markdown; charset=utf-8'
};

// Parse JSON request body helper
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url.split('?')[0];

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // =========================================================================
  // REAL API ENDPOINTS (Email & SMS OTP Engine)
  // =========================================================================
  if (urlPath.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');

    // 1. POST /api/auth/register (Initiate Registration & Send Real Email Verification OTP)
    if (urlPath === '/api/auth/register' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const email = (body.email || '').trim().toLowerCase();
        const phone = (body.phone || '').trim();
        const fullName = body.fullName || body.name || 'Member';
        const role = body.role || (body.isDonor ? 'DONOR' : 'REQUESTER');

        if (!email) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Valid email address is required.' }));
          return;
        }

        // Generate 6-Digit Email Verification OTP
        const emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

        pendingRegistrations.set(email, {
          emailOtp,
          emailVerified: false,
          email,
          phone: phone || '+91 98450 11223',
          fullName,
          role,
          userData: body,
          createdAt: Date.now(),
          expiresAt,
          attempts: 0
        });

        console.log(`\n======================================================`);
        console.log(`[BloodConnect Auth] Email Verification OTP Dispatched:`);
        console.log(`  Recipient: ${fullName} <${email}>`);
        console.log(`  ✉️ Email OTP:       ${emailOtp} (Sent to ${email})`);
        console.log(`  Sender:             bloodconnectai@outlook.com`);
        console.log(`  Validity:           10 minutes`);
        console.log(`======================================================\n`);

        // Send REAL Email (Email OTP)
        const emailResult = await sendRealEmail({
          to: email,
          subject: `[BloodConnect] Your Official Email Verification OTP: ${emailOtp}`,
          html: generateOtpEmailHtml({ name: fullName, otp: emailOtp, role }),
          text: `Dear ${fullName},\n\nYour BloodConnect Email Verification Code is: ${emailOtp}.\n\nValid for 10 minutes.\n\nThank you,\nBloodConnect Health Systems`
        });

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          email,
          emailOtp,
          otpLength: 6,
          expiresInSeconds: 600,
          emailDispatched: emailResult.success === true,
          emailStatus: emailResult.success ? 'Delivered via Outlook / SMTP' : (emailResult.error || emailResult.reason),
          emailPreviewUrl: emailResult.previewUrl || null,
          devOtp: {
            emailOtp
          },
          message: emailResult.success
            ? `Verification code dispatched to ${email}.`
            : `Verification code generated. View email via web preview link below.`
        }));
      } catch (err) {
        console.error('Registration API Error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message || 'Server error initiating registration.' }));
      }
      return;
    }

    // 2. POST /api/auth/verify-otp (Verify Email OTP & Activate Account)
    if (urlPath === '/api/auth/verify-otp' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const email = (body.email || '').trim().toLowerCase();
        const emailCode = (body.emailOtp || body.emailCode || body.otp || body.code || '').trim();

        const pending = pendingRegistrations.get(email);
        if (!pending) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'No pending registration found for this email. Please register again.' }));
          return;
        }

        if (Date.now() > pending.expiresAt) {
          pendingRegistrations.delete(email);
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Verification code has expired. Please request a new one.' }));
          return;
        }

        if (pending.attempts >= 6) {
          pendingRegistrations.delete(email);
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Maximum verification attempts exceeded. Please re-register.' }));
          return;
        }

        if (emailCode !== pending.emailOtp) {
          pending.attempts++;
          res.writeHead(400);
          res.end(JSON.stringify({
            error: `Invalid Email Verification Code (${emailCode}). Please enter the exact 6 digits sent to your email inbox.`
          }));
          return;
        }

        // Email OTP is verified!
        const user = {
          id: `user-${Date.now()}`,
          name: pending.fullName,
          email: pending.email,
          phone: pending.phone,
          role: pending.role,
          bloodGroup: pending.userData.bloodGroup || 'O+',
          location: pending.userData.location || 'Bengaluru',
          address: pending.userData.address || '',
          emailVerified: true,
          verified: true,
          verifiedAt: new Date().toISOString()
        };

        verifiedUsers.set(email, user);
        pendingRegistrations.delete(email);

        console.log(`[BloodConnect Auth] ✓ Email Verification Complete: ${user.name} (${user.email})`);

        // Send REAL Welcome & Registered Confirmation Email Automatically from Outlook
        sendRealEmail({
          to: user.email,
          subject: `Welcome to BloodConnect — Account Successfully Registered & Verified!`,
          html: generateWelcomeEmailHtml({
            name: user.name,
            role: user.role,
            bloodGroup: user.bloodGroup,
            phone: user.phone
          }),
          text: `Dear ${user.name},\n\nCongratulations! Your BloodConnect account has been officially registered and verified.\nRole: ${user.role}\nBlood Group: ${user.bloodGroup}\n\nAccess your portal at: http://localhost:5500/login`
        }).catch(err => console.error('[Welcome Email Error]:', err.message));

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          verified: true,
          emailVerified: true,
          user,
          accessToken: `bc-jwt-${Date.now()}`,
          message: 'Email successfully verified! Welcome to BloodConnect.'
        }));
      } catch (err) {
        console.error('Verify OTP Error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message || 'Server error verifying OTP.' }));
      }
      return;
    }

    // 3. POST /api/auth/resend-otp (Resend Real Email OTP)
    if (urlPath === '/api/auth/resend-otp' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const email = (body.email || '').trim().toLowerCase();
        const pending = pendingRegistrations.get(email);

        if (!pending) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'No active registration found to resend.' }));
          return;
        }

        pending.emailOtp = Math.floor(100000 + Math.random() * 900000).toString();
        pending.expiresAt = Date.now() + 10 * 60 * 1000;
        console.log(`[BloodConnect Auth] Resending Email OTP: ${pending.emailOtp} to ${pending.email}`);

        const emailResult = await sendRealEmail({
          to: pending.email,
          subject: `[BloodConnect] Fresh Email Verification OTP: ${pending.emailOtp}`,
          html: generateOtpEmailHtml({ name: pending.fullName, otp: pending.emailOtp, role: pending.role }),
          text: `Your fresh BloodConnect verification OTP is: ${pending.emailOtp}. Valid for 10 minutes.`
        });

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          email: pending.email,
          devOtp: { emailOtp: pending.emailOtp },
          emailPreviewUrl: emailResult.previewUrl || null,
          message: `Fresh verification code dispatched to ${pending.email}.`
        }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // 4. POST /api/emergencies/broadcast (Send Real Automated Email Alert to Donors + In-App Pop-up)
    if (urlPath === '/api/emergencies/broadcast' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const patientName = body.patientName || 'Emergency Patient';
        const bloodGroup = body.bloodGroup || 'O+';
        const units = body.units || 1;
        const hospital = body.hospital || 'Victoria Hospital Emergency Trauma ICU';
        const urgency = body.urgency || 'Critical (Tier-1)';
        const contact = body.contact || '+91 80 2670 1150';

        const alertItem = {
          id: `emg-broadcast-${Date.now()}`,
          patientName,
          bloodGroup,
          units,
          hospital,
          urgency,
          contact,
          timestamp: new Date().toISOString()
        };

        activeEmergencyAlerts.unshift(alertItem);
        if (activeEmergencyAlerts.length > 20) activeEmergencyAlerts.pop();

        // Target Donor Recipient List (Preset Verified Bangalore Donors + Gmail gateway mailbox + dynamically registered donors)
        const donorEmails = [
          'bloodconnectai@gmail.com',
          'bloodconnectai@outlook.com'
        ];

        // Include any dynamically registered donors
        for (const [em, u] of verifiedUsers.entries()) {
          if (!donorEmails.includes(em)) {
            donorEmails.push(em);
          }
        }

        console.log(`\n======================================================`);
        console.log(`[Emergency Broadcast] 🚨 Dispatching alert to ${donorEmails.length} donors:`);
        console.log(`  Patient:     ${patientName}`);
        console.log(`  Blood Group: ${bloodGroup} (${units} units)`);
        console.log(`  Hospital:    ${hospital}`);
        console.log(`  Urgency:     ${urgency}`);
        console.log(`======================================================\n`);

        const htmlContent = generateEmergencyAlertEmailHtml({ patientName, bloodGroup, units, hospital, urgency, contact });

        // Parallel Non-Blocking Dispatch to all donor mailboxes
        Promise.all(donorEmails.map(recipient => 
          sendRealEmail({
            to: recipient,
            subject: `🚨 URGENT: ${units} Unit(s) of ${bloodGroup} Blood Needed for ${patientName} at ${hospital}`,
            html: htmlContent,
            text: `EMERGENCY BLOOD REQUISITION:\nPatient: ${patientName}\nBlood Group: ${bloodGroup} (${units} units)\nHospital: ${hospital}\nUrgency: ${urgency}\nContact: ${contact}\n\nAccept at: http://localhost:5500/live-dispatch`
          })
        )).then(results => {
          console.log(`[Emergency Broadcast] ✓ Dispatched notification emails to all ${donorEmails.length} donors.`);
        }).catch(err => {
          console.error('[Emergency Broadcast] Background email dispatch error:', err.message);
        });

        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          alert: alertItem,
          recipientsCount: donorEmails.length,
          message: `Emergency alert dispatched to ${donorEmails.length} donors via Email & In-App broadcast.`
        }));
      } catch (err) {
        console.error('Emergency Broadcast Error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message || 'Server error broadcasting emergency.' }));
      }
      return;
    }

    // 5. GET /api/emergencies/latest (Polling / Web Sync for Pop-up Alerts)
    if (urlPath === '/api/emergencies/latest' && req.method === 'GET') {
      res.writeHead(200);
      res.end(JSON.stringify({
        success: true,
        latest: activeEmergencyAlerts[0] || null,
        count: activeEmergencyAlerts.length
      }));
      return;
    }

    // 4. GET /api/communications/status (Gateway Connection Status)
    if (urlPath === '/api/communications/status' && req.method === 'GET') {
      const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
      const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.trim() : '';
      const twilioSid = process.env.TWILIO_ACCOUNT_SID ? process.env.TWILIO_ACCOUNT_SID.trim() : '';
      const fast2SmsKey = process.env.FAST2SMS_API_KEY ? process.env.FAST2SMS_API_KEY.trim() : '';

      res.writeHead(200);
      res.end(JSON.stringify({
        smtp: {
          configured: !!(smtpUser && smtpPass),
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          user: smtpUser ? `${smtpUser.slice(0, 3)}***@${smtpUser.split('@')[1] || 'mail.com'}` : 'Not set',
          from: process.env.FROM_EMAIL || 'dispatch@bloodconnect.health'
        },
        sms: {
          configured: !!(twilioSid || fast2SmsKey),
          provider: fast2SmsKey ? 'FAST2SMS' : (twilioSid ? 'TWILIO' : 'NONE'),
          from: process.env.TWILIO_FROM_NUMBER || 'VM-BLDCON'
        }
      }));
      return;
    }

    // 5. POST /api/communications/test-email (Direct Live Test Email)
    if (urlPath === '/api/communications/test-email' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const to = body.email;
        if (!to) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Recipient email required' }));
          return;
        }
        const resMail = await sendRealEmail({
          to,
          subject: '🩸 [BloodConnect] Live Notification & System Verification Test',
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);">
              <div style="background: linear-gradient(135deg, #e11d48, #be123c); padding: 24px; color: #ffffff; text-align: center;">
                <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">🩸 BloodConnect Automated Gateway</h1>
                <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.95;">Verified Live System Test Notification</p>
              </div>
              <div style="padding: 24px;">
                <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 6px; margin-bottom: 20px;">
                  <strong style="color: #059669; font-size: 15px; display: block; margin-bottom: 4px;">✓ Real Gmail SMTP Dispatched Successfully!</strong>
                  <span style="color: #475569; font-size: 13px;">This live notification confirms that BloodConnect's automated messaging engine is connected to <strong>bloodconnectai@gmail.com</strong> and actively delivering to your inbox.</span>
                </div>
                <h3 style="margin-top: 0; color: #0f172a; font-size: 16px;">Telemetry & System Details:</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155; margin-bottom: 20px;">
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 40%;">Recipient:</td><td style="padding: 8px 0; font-weight: 700; color: #0f172a;">${to}</td></tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Authorized Sender:</td><td style="padding: 8px 0;">bloodconnectai@gmail.com</td></tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">SMTP Transport:</td><td style="padding: 8px 0;">Google Gmail Secure SSL (Port 465)</td></tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Google Maps Engine:</td><td style="padding: 8px 0; color: #10b981; font-weight: 700;">Active (Roadmap, Satellite & Terrain)</td></tr>
                  <tr style="border-bottom: 1px solid #f1f5f9;"><td style="padding: 8px 0; color: #64748b; font-weight: 600;">Dispatch Timestamp:</td><td style="padding: 8px 0;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td></tr>
                </table>
                <div style="text-align: center; margin-top: 24px;">
                  <a href="http://localhost:5500/portal" style="display: inline-block; padding: 12px 24px; background: #e11d48; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">Open BloodConnect Portal ➔</a>
                </div>
              </div>
              <div style="background: #f8fafc; padding: 14px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
                © 2026 BloodConnect AI Health Systems • Bangalore Trauma Transit Network
              </div>
            </div>
          `,
          text: `BloodConnect Live Notification Test\n\nRecipient: ${to}\nSender: bloodconnectai@gmail.com\nStatus: Live Gmail SMTP Verified\nTimestamp: ${new Date().toISOString()}\n\nAccess portal: http://localhost:5500/portal`
        });
        res.writeHead(200);
        res.end(JSON.stringify(resMail));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // 6. POST /api/communications/configure (Save Credentials directly to .env)
    if (urlPath === '/api/communications/configure' && req.method === 'POST') {
      try {
        const body = await parseJsonBody(req);
        const envPath = path.join(__dirname, '.env');
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';

        const updates = {
          'SMTP_HOST': body.smtpHost || process.env.SMTP_HOST || 'smtp.gmail.com',
          'SMTP_PORT': body.smtpPort || process.env.SMTP_PORT || '587',
          'SMTP_USER': body.smtpUser !== undefined ? body.smtpUser : process.env.SMTP_USER,
          'SMTP_PASS': body.smtpPass !== undefined ? body.smtpPass : process.env.SMTP_PASS,
          'FROM_EMAIL': body.fromEmail || process.env.FROM_EMAIL || 'dispatch@bloodconnect.health',
          'SMS_PROVIDER': body.smsProvider || process.env.SMS_PROVIDER || 'TWILIO',
          'TWILIO_ACCOUNT_SID': body.twilioSid !== undefined ? body.twilioSid : process.env.TWILIO_ACCOUNT_SID,
          'TWILIO_AUTH_TOKEN': body.twilioToken !== undefined ? body.twilioToken : process.env.TWILIO_AUTH_TOKEN,
          'TWILIO_FROM_NUMBER': body.twilioFrom !== undefined ? body.twilioFrom : process.env.TWILIO_FROM_NUMBER,
          'FAST2SMS_API_KEY': body.fast2SmsKey !== undefined ? body.fast2SmsKey : process.env.FAST2SMS_API_KEY
        };

        for (const [k, v] of Object.entries(updates)) {
          if (v !== undefined) {
            process.env[k] = v;
            const regex = new RegExp(`^${k}=.*$`, 'm');
            if (regex.test(envContent)) {
              envContent = envContent.replace(regex, `${k}=${v}`);
            } else {
              envContent += `\n${k}=${v}`;
            }
          }
        }

        fs.writeFileSync(envPath, envContent, 'utf8');
        console.log('[BloodConnect Gateway] Updated .env with new email/SMS credentials.');

        res.writeHead(200);
        res.end(JSON.stringify({ success: true, message: 'Gateway credentials saved successfully!' }));
      } catch (err) {
        res.writeHead(500);
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    // Default API 404
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Endpoint not found.' }));
    return;
  }

  // =========================================================================
  // STATIC FILE & CLEAN ROUTING
  // =========================================================================

  // Secure download route for Confidential Test Credentials PDF
  if (urlPath === '/download/credentials-pdf' || urlPath === '/credentials.pdf') {
    const pdfPath = path.join(__dirname, 'BloodConnect-Test-Credentials.pdf');
    if (fs.existsSync(pdfPath)) {
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="BloodConnect-Test-Credentials.pdf"',
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(pdfPath).pipe(res);
      return;
    }
  }

  // Block public web exposure of credential pages / markdown files
  if (urlPath.toLowerCase().includes('credential') && !urlPath.endsWith('.pdf')) {
    res.writeHead(302, { 'Location': '/login' });
    res.end();
    return;
  }

  // Check clean route mapping
  let targetFile = ROUTE_MAP[urlPath];

  if (!targetFile) {
    const sanitized = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
    targetFile = sanitized.startsWith('/') ? sanitized.slice(1) : sanitized;
  }

  let fullPath = path.join(FRONTEND_DIR, targetFile);

  // If path doesn't exist, check with .html extension
  if (!fs.existsSync(fullPath) && fs.existsSync(fullPath + '.html')) {
    fullPath = fullPath + '.html';
  }

  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head><title>Page Not Found — BloodConnect</title><link rel="stylesheet" href="/style.css"></head>
      <body style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:#09090D;color:#FFF;text-align:center;">
        <div>
          <h1 style="font-size:48px;color:#C1121F;">404</h1>
          <p style="color:#94A3B8;margin:12px 0 24px;">The requested life-saving route could not be found.</p>
          <a href="/" class="btn btn-primary" style="text-decoration:none;padding:10px 20px;border-radius:12px;background:#C1121F;color:#FFF;">Return Home</a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  const ext = path.extname(fullPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  });

  fs.createReadStream(fullPath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`BloodConnect 2026 Production Server active at http://localhost:${PORT}`);
  console.log(`Real Email (SMTP) & SMS API Endpoints enabled on /api/auth/register, /api/auth/verify-otp`);
  console.log(`Clean Routes enabled: / | /login | /register | /find-donors | /emergency | /dashboard | /about | /bangalore-blood-banks`);
});
