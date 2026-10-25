# 🩸 BloodConnect 2026 — AI Autonomous Blood Logistics & Transit Network

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-10b981.svg)]()
[![Google Maps](https://img.shields.io/badge/Google%20Maps-Active%20HD-4285F4.svg)]()
[![Automated Gateway](https://img.shields.io/badge/Gmail%20SMTP-Port%20465%20SSL-ea4335.svg)]()
[![Verified Personas](https://img.shields.io/badge/Seed%20Accounts-25%20Profiles-e11d48.svg)]()

> **Engineering Societal Transformation:** An autonomous, closed-loop emergency blood logistics system designed to eliminate "Golden Hour" transfusion fatalities across India by integrating **AI Urgency Triage**, **Predictive Shortage Forecasting**, **Geofenced Google Maps Telematics**, and **Parallel Automated Gmail SMTP Alerting**.

---

## 📑 Technical Documentation & Architectural Dossier
- 📕 **Comprehensive 13-Page PDF Technical Dossier:** [BloodConnect-Comprehensive-Architecture-Dossier.pdf](./BloodConnect-Comprehensive-Architecture-Dossier.pdf)
- 🔑 **Verified 25 Test Accounts & Credentials:** [test-credentials.md](./test-credentials.md)

---

## 🌟 Core System Pillars

### 1. 📧 Automated Real-Time Gmail SMTP Gateway
- **Primary Gateway:** `bloodconnectai@gmail.com` on Port 465 SSL.
- **Sub-30ms Parallel Dispatch:** Dispatches emergency blood requisition alerts simultaneously to all eligible donors via non-blocking Node.js `Promise.all`.
- **Three Automated Workflows:**
  1. **6-Digit Email OTP:** Auto-dispatched upon Step-1 registration with clipboard paste (`Ctrl+V`) distribution.
  2. **Official Welcome & Registration Confirmation:** Auto-dispatched upon OTP verification.
  3. **Critical Patient Emergency Alerts:** Real-time email dispatch + in-app dual-tone Web Audio chime (`880 Hz • 1174 Hz`) & floating high-priority alert modal.

### 2. 🗺️ Native Google Maps Engine (Zero Glitches, Zero Watermarks)
- **Authentic Google Maps Layers:**
  - 🗺️ **Google Roadmap:** `https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`
  - 🛰️ **Google Satellite (Hybrid):** `https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}`
  - ⛰️ **Google Terrain:** `https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}`
- **Subdomain Mirrors:** `mt0.google.com` to `mt3.google.com` for load balancing.
- **Deep-Linking:** Native Google Maps driving navigation (`https://www.google.com/maps/dir/${origin}/${dest}`) without requiring third-party API keys or watermarks.

### 3. 🧠 Artificial Intelligence & Algorithmic Engines
- **AI Urgency NLP Triage (`ai-engine.js`):** NLP tokenization parsing diagnostic notes into **Tier-1 Critical (<30m)**, **Tier-2 Urgent (<2h)**, and **Tier-3 Routine (<12h)**, categorizing components (Whole Blood, PRBC, Platelet Apheresis, FFP).
- **Predictive Shortage Forecasting (`ai-forecast.js`):** Holt-Winters exponential smoothing time-series model forecasting 7-day hospital demand and triggering proactive voluntary donation drives.
- **Geofenced Detour-Factored Matching:** Haversine great-circle calculation multiplied by a 1.28 urban detour tortuosity factor to calculate authentic driving latency across Bengaluru corridors.
- **Aadhaar Anti-Spoofing Computer Vision:** Client-side Verhoeff checksum algorithm validation preventing bot spam.
- **AeroLife Autonomous Drone Airway Corridor:** Simulated 72 km/h DGCA green-airway transit with 3.8°C cold-safe monitoring.

---

## 🚦 Clean Routes Directory (14 Endpoints)

| URL Route | Module & Purpose |
|:---|:---|
| `/` | **Healthcare Triage & Public Portal:** Hero counters, live shortage ticker, and platform overview. |
| `/emergency` | **Emergency Blood Requisition:** Hospital trauma selection, bed reverse-geocoding, and AI donor matching. |
| `/live-dispatch` | **Real-Time Transit Tracking HUD:** Waypoint maneuvers, speedometer, Google Maps basemaps, and Drone mode. |
| `/donors` | **Geofenced Donor Discovery:** Bengaluru neighborhoods (Indiranagar, Koramangala), 90-day cooldown status. |
| `/hospitals` | **Karnataka Hospitals Directory:** Trauma ICU beds, blood bank affiliations, and direct emergency routing. |
| `/blood-banks` | **Blood Bank Inventory Audit:** Live unit counters per blood group with PIN `2026` stock adjustment. |
| `/radar` | **AI Predictive Shortage Radar:** 7-day predictive deficit forecasting across Karnataka districts. |
| `/register` | **Secure Registration:** Aadhaar ID verification + 6-digit email OTP gateway. |
| `/login` | **Unified Login Portal:** 1-Click persona pre-fills (Patient, Donor, Hospital, Bank, Admin). |
| `/portal` | **Patient Trauma Portal:** Active requisitions, donor arrivals, and feedback reviews. |
| `/admin` | **Executive Admin Dashboard:** Audit logs, telematics monitoring, and spam quarantine. |
| `/about` | **Mission & Clinical Protocol:** Societal problem analysis and ethical donor charter. |
| `/reviews` | **Verified Donor Reviews:** Rating system and donor impact stories. |
| `/dossier.pdf` | **Comprehensive Technical PDF:** In-browser viewing and download of the complete 13-page technical report. |

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js 18+ (tested on Node.js 24)
- (Optional) JDK 25+ & Apache Maven 3.9+ for Spring Boot Java backend
- Modern web browser (Chrome, Edge, Firefox, Safari)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Mithun-gowda-M/Societal-Project.git
cd Societal-Project
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Google Gmail credentials in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_google_app_password
FROM_EMAIL="BloodConnect Automated Gateway" <your_email@gmail.com>
```

### 3. Launch Development Server
```bash
node dev-server.js
```
The server will be active at **`http://localhost:5500`**.

---

## 🧪 Automated System Verification
Run the comprehensive 14-route automated test suite:
```bash
node scratch/verify_system.js
```
Output:
```
=== ALL END-TO-END VERIFICATIONS PASSED 100% CLEAN! ===
```

---

## 👤 Author & System Architect
- **Lead Developer & System Architect:** Mithun Gowda M
- **Email:** [mithunking55@gmail.com](mailto:mithunking55@gmail.com)
- **Repository:** [https://github.com/Mithun-gowda-M/Societal-Project](https://github.com/Mithun-gowda-M/Societal-Project)
