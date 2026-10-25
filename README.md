# 🩸 BloodConnect 2026 — AI Autonomous Blood Logistics & Transit Network

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/badge/Build-Passing-10b981.svg)]()
[![Mobile Responsive](https://img.shields.io/badge/Mobile-100%25%20Responsive-brightgreen.svg)]()
[![Google Maps](https://img.shields.io/badge/Google%20Maps-Active%20HD-4285F4.svg)]()
[![Automated Gateway](https://img.shields.io/badge/Gmail%20SMTP-Port%20465%20SSL-ea4335.svg)]()
[![Verified Personas](https://img.shields.io/badge/Seed%20Accounts-25%20Profiles-e11d48.svg)]()

> **Engineering Societal Transformation:** An autonomous, closed-loop emergency blood logistics system designed to eliminate "Golden Hour" transfusion fatalities across India by integrating **AI Urgency Triage**, **Predictive Shortage Forecasting**, **Geofenced Google Maps Telematics**, and **Parallel Automated Gmail SMTP Alerting**.

---

## 📱 Mobile Live Access Links (Open Directly on Smartphone)

Experience BloodConnect live on your mobile device (iPhone, Android, iPad, or Tablet):

| Access Method | Live URL | Description |
|:---|:---|:---|
| 🌐 **Authenticated Cloudflare Mobile Link** | [https://listprice-marshall-nearby-else.trycloudflare.com](https://listprice-marshall-nearby-else.trycloudflare.com) | **Instant Worldwide Access** (Rock-solid Cloudflare CDN edge, zero disconnects, works over 4G/5G/Wi-Fi). |
| 📕 **13-Page Architecture & AI/ML Dossier PDF** | [https://listprice-marshall-nearby-else.trycloudflare.com/dossier.pdf](https://listprice-marshall-nearby-else.trycloudflare.com/dossier.pdf) | High-definition technical dossier with all mathematical models and system schematics. |
| 📶 **Local Wi-Fi Network Access** | `http://10.187.113.231:5500` | Direct LAN access for devices connected to the same local Wi-Fi router. |

<p align="center">
  <img src="./mobile-qr.png" alt="Scan QR Code to open on Mobile" width="230" />
  <br />
  <strong>📱 Scan with Phone Camera to Open BloodConnect on Mobile Instantly</strong>
</p>

---

## 📑 Technical Documentation & Credentials
- 📕 **Comprehensive 13-Page PDF Technical Dossier:** [BloodConnect-Comprehensive-Architecture-Dossier.pdf](./BloodConnect-Comprehensive-Architecture-Dossier.pdf)
- 🔑 **Verified 25 Test Accounts & Credentials:** [test-credentials.md](./test-credentials.md)
- 📱 **Frontend Architecture Guide:** [frontend/README.md](./frontend/README.md)

---

## 🔄 End-to-End Workflow & Step-by-Step Walkthrough

```mermaid
flowchart TD
    A[Emergency Blood Requisition Initiated] --> B[AI Natural Language Processing Triage]
    B --> C{Urgency Classification}
    C -->|Tier-1 Critical <30m| D[Emergency Siren + Top Priority Dispatch]
    C -->|Tier-2 Urgent <2h| E[Accelerated Transit Protocol]
    C -->|Tier-3 Routine <12h| F[Scheduled Blood Bank Fulfillment]
    D --> G[Geofenced Google Maps Matching with 1.28 Detour Factor]
    G --> H[Parallel Automated Gmail SMTP Dispatch to Donors]
    H --> I[Real-Time GPS HUD & AeroLife UAV Airway Tracking]
    I --> J[Bedside Transfusion Verification & Golden Hour Fulfilled]
```

---

### Step 1: Donor & Requester Onboarding with Real Email OTP
- **Aadhaar Anti-Spoofing:** Client-side Verhoeff checksum algorithm validates 12-digit national IDs without storing plaintext numbers.
- **Automated Gmail OTP:** Entering email triggers an instant 6-digit verification code sent from `bloodconnectai@gmail.com` via Google Gmail SMTP (Port 465 SSL).
- **Official Welcome Email:** Upon OTP verification, a branded welcome email is auto-dispatched with account privileges.

<p align="center">
  <img src="./screenshots/02_registration_complete_portal.png" alt="BloodConnect Registration Portal" width="800" />
</p>

---

### Step 2: Emergency Blood Requisition & AI Urgency Triage
- **Location Reverse-Geocoding:** Automatic extraction of hospital latitude/longitude coordinates across Karnataka.
- **AI NLP Triage:** Classifies requisitions into **Tier-1 Critical (<30m)**, **Tier-2 Urgent (<2h)**, or **Tier-3 Routine (<12h)** based on clinical keywords (*"hemorrhage"*, *"trauma ICU"*, *"severe anemia"*).
- **Component Breakdown:** Categorizes required units into Whole Blood, Packed Red Blood Cells (PRBC), Platelet Apheresis, or Fresh Frozen Plasma (FFP).

<p align="center">
  <img src="./screenshots/03_emergency_request_form.png" alt="Emergency Requisition Form" width="800" />
</p>

---

### Step 3: Google Maps Geofenced Matching & Dual-Tone Chime
- **Haversine Distance Engine:** Calculates great-circle distance multiplied by an authentic **1.28 urban detour tortuosity factor** to reflect Bengaluru traffic corridors (Indiranagar, Koramangala, Whitefield).
- **Dual-Tone Web Audio Siren:** Plays a clinical `880 Hz` to `1174 Hz` frequency transition alert directly in the browser.
- **Ranked Match Results:** Donors sorted by verified availability, blood compatibility matrix, and transit ETA.

<p align="center">
  <img src="./screenshots/03_matching_results.png" alt="AI Donor Matching Results" width="800" />
</p>

---

### Step 4: Parallel Non-Blocking Emergency Email Dispatches
- When an emergency requisition is confirmed, BloodConnect triggers non-blocking parallel email dispatches via Node.js `Promise.all`.
- Emergency alert emails include patient name, blood units required, hospital ICU facility, emergency contact number, and direct deep-links to accept the requisition.

---

### Step 5: Real-Time GPS HUD Transit Tracking & AeroLife Drone Mode
- **Authentic Google Maps Engine:** Switch between 🗺️ **Roadmap**, 🛰️ **Satellite (Hybrid)**, and ⛰️ **Terrain** layers with zero watermarks and zero glitches.
- **Turn-by-Turn Waypoint Telematics:** Displays real-time transit velocity, maneuver instructions, and remaining distance.
- **AeroLife Autonomous Drone Corridor:** Toggleable UAV flight corridor operating at 72 km/h with 3.8°C cold-safe monitoring for traffic-congested routes.

<p align="center">
  <img src="./screenshots/04_live_dispatch_hud.png" alt="Real-Time Transit Tracking HUD" width="800" />
</p>

---

### Step 6: 24/7 Karnataka Hospitals & Blood Banks Stock Editor
- **Hospital Directory:** 24/7 ICU beds, emergency trauma phone numbers, and direct Google Maps navigation routing.
- **Blood Bank Stock Audit:** Real-time inventory cards per blood group (A+, A-, B+, B-, AB+, AB-, O+, O-).
- **Secure Stock Adjustments:** Authorized personnel can update unit counts using secure security PIN `2026`.

<p align="center">
  <img src="./screenshots/05_karnataka_hospitals_directory.png" alt="Karnataka Hospitals Directory" width="800" />
</p>

<p align="center">
  <img src="./screenshots/06_blood_banks_stock_editor.png" alt="Blood Banks Stock Management" width="800" />
</p>

---

### Step 7: AI Predictive Shortage Radar (Forecasting Engine)
- **Holt-Winters Time-Series Model:** Evaluates historical demand trends, seasonal dengue spikes, and festival donation dips.
- **7-Day Outage Projections:** Forecasts supply shortfalls 7 days in advance across 8 Karnataka administrative districts.
- **Autonomous Camp Triggers:** Automatically initiates voluntary donation drives before inventories hit critical thresholds.

---

## 🌟 Core System Pillars & Innovations

| Legacy System Shortcoming | BloodConnect 2026 Technological Breakthrough |
|:---|:---|
| **Broken/Watermarked Maps:** Failed tile keys displaying watermarks. | **Authentic Google Maps Engine:** Direct Google Roadmap, Satellite, and Terrain tile layers (`mt0`–`mt3.google.com`) rendering at 60fps. |
| **Manual Donor Cold-Calling:** Families frantically dial numbers during emergencies. | **Autonomous Parallel Dispatch:** Sub-30ms automated Gmail SMTP notifications + in-app audio chimes dispatched simultaneously. |
| **Unverified Bot Accounts:** Fake phone numbers flood donor registries. | **Aadhaar Verhoeff + 6-Digit Email OTP:** Cryptographic ID validation and real email verification. |
| **Reactive Stock Depletion:** Blood banks realize shortages after trauma spikes occur. | **Predictive Time-Series Radar:** Holt-Winters smoothing forecasts shortages 7 days in advance. |
| **Urban Traffic Paralysis:** Peak Bengaluru traffic delays ambulances by 45+ minutes. | **AeroLife UAV Corridor:** 72 km/h autonomous drone routing with active 3.8°C cold-safe logging. |
| **Disjointed Clinical Telematics:** No unified status tracking for patients. | **Real-Time Dispatch HUD:** Live velocity telemetry, remaining distance, and ETA calculations. |
| **Fragmented Blood Bank Portals:** Each facility operates disconnected spreadsheets. | **Unified Karnataka Inventory:** Centralized real-time stock counters with PIN-protected audit edits. |

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
The server will start at:
- **Local:** `http://localhost:5500`
- **LAN Mobile Access:** `http://10.187.113.231:5500`
- **Worldwide Mobile Cloudflare Tunnel:** `https://listprice-marshall-nearby-else.trycloudflare.com`

---

## 🧪 Automated System Verification
Run the 14-route automated test suite to verify all endpoints, Google Maps layers, and email endpoints:
```bash
node scratch/verify_system.js
```
Expected output:
```
=== ALL END-TO-END VERIFICATIONS PASSED 100% CLEAN! ===
```

---

## 👤 Author & System Architect
- **Lead Developer & System Architect:** Mithun Gowda M
- **Email:** [mithunking55@gmail.com](mailto:mithunking55@gmail.com)
- **Repository:** [https://github.com/Mithun-gowda-M/Societal-Project](https://github.com/Mithun-gowda-M/Societal-Project)
