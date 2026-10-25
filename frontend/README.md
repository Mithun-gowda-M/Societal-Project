# 📱 BloodConnect 2026 — Clinical Responsive Frontend & Geonavigation Interface

[![Mobile Responsive](https://img.shields.io/badge/Mobile-100%25%20Responsive-brightgreen.svg)]()
[![Google Maps](https://img.shields.io/badge/Google%20Maps-Roadmap%20%7C%20Satellite%20%7C%20Terrain-4285F4.svg)]()
[![Audio Engine](https://img.shields.io/badge/Web%20Audio-880Hz%20Siren-ff3347.svg)]()

> High-performance, low-latency, mobile-first emergency transfusion interface engineered with vanilla CSS, modern HTML5 semantics, and authentic Google Maps raster tile telematics.

---

## 📱 Mobile Live Access Links

Open these links on your smartphone (iPhone / Android) to experience the live mobile UI:

- 🌐 **Authenticated Cloudflare Mobile Link (Cellular 4G/5G/Wi-Fi):**
  👉 [https://listprice-marshall-nearby-else.trycloudflare.com](https://listprice-marshall-nearby-else.trycloudflare.com)
- 📄 **13-Page Architecture & AI/ML Dossier PDF on Mobile:**
  👉 [https://listprice-marshall-nearby-else.trycloudflare.com/dossier.pdf](https://listprice-marshall-nearby-else.trycloudflare.com/dossier.pdf)
- 📶 **Local Wi-Fi Network Access (Same Network):**
  👉 `http://10.187.113.231:5500`

<p align="center">
  <img src="./mobile-qr.png" alt="Scan QR Code to open on Mobile" width="220" />
  <br />
  <em>Scan this QR code with your phone camera to open BloodConnect instantly</em>
</p>

---

## 🎨 Design Philosophy & Mobile Architecture

1. **Clean White Clinical Theme:**
   - Pure high-contrast clinical white aesthetic (`#FFFFFF` surfaces, `#0F172A` deep typography, `#E11D48` crimson accents).
   - Designed for high-stress emergency environments, bright outdoor hospital triage, and direct sunlight visibility.

2. **Mobile Viewport Optimization:**
   - Full `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">` touch optimization.
   - 48px+ touch targets on all mobile buttons, tab selectors, and input fields.
   - Smooth horizontal scrolling for live emergency ticker, blood bank unit cards, and hospital badges.

3. **🗺️ Native Google Maps Engine:**
   - Built with Leaflet JS loaded with official Google Maps tile subdomains (`mt0.google.com` to `mt3.google.com`).
   - Triple layer switcher on live dispatch HUD:
     - 🗺️ **Roadmap:** High-clarity urban navigation layer (`lyrs=m`).
     - 🛰️ **Satellite:** Hybrid satellite terrain with street overlays (`lyrs=y`).
     - ⛰️ **Terrain:** Topographical elevation contours (`lyrs=p`).
   - Zero watermarks, zero third-party API keys required.

4. **🔊 Web Audio API Dual-Tone Chime:**
   - Synthesizes an authoritative hospital-grade emergency chime using browser-native oscillators (`880 Hz` transitioning to `1174 Hz`).
   - Requires zero external audio MP3 files, eliminating bandwidth latency on 3G/4G connections.

---

## 📂 Frontend Modules & File Map

| File | Route | Functionality |
|:---|:---|:---|
| `index.html` | `/` | **Healthcare Landing Portal:** Live shortage ticker, platform stats, hero triage CTA. |
| `emergency-request.html` | `/emergency` | **Emergency Triage Form:** Auto-fill hospital coordinates, blood group selector, priority tagging. |
| `matching-results.html` | `/matching-results` | **AI Donor Ranking:** Ranked donor list sorted by ETA and Haversine detour distance. |
| `request-tracking.html` | `/live-dispatch` | **Real-Time Transit HUD:** Google Maps GPS telemetry, waypoint maneuvers, AeroLife drone airway toggle. |
| `nearby-donors.html` | `/donors` | **Donor Directory:** Filterable by blood type, area (Koramangala, Indiranagar), and eligibility. |
| `hospitals.html` | `/hospitals` | **Karnataka Trauma Directory:** 24/7 ICU beds, blood bank contacts, and emergency navigation. |
| `bangalore-blood-banks.html` | `/blood-banks` | **Blood Bank Inventory Audit:** Live stock counts by blood group with PIN `2026` modifier. |
| `ai-forecast.html` | `/radar` | **AI Predictive Shortage Radar:** 7-day hospital demand forecast and voluntary camp triggers. |
| `register.html` | `/register` | **Registration Portal:** Aadhaar Verhoeff validation + 6-digit real email OTP gateway. |
| `login.html` | `/login` | **Unified Login:** 1-Click persona pre-fills (Donor, Requester, Hospital, Blood Bank, Admin). |
| `donor-dashboard.html` | `/portal` | **Donor Profile:** Donation history, reward badges, eligibility countdown timer. |
| `patient-dashboard.html` | `/patient` | **Patient Portal:** Active requisitions, donor transit timeline, and feedback. |
| `admin-dashboard.html` | `/admin` | **Command Center:** Real-time dispatch audits, spam quarantine, and gateway logs. |
| `about.html` | `/about` | **Clinical Charter:** Societal problem analysis and ethical guidelines. |
| `reviews.html` | `/reviews` | **Verified Reviews:** Patient and donor feedback system. |

---

## 📱 Mobile Testing Guidelines

1. **Emergency Request Flow:**
   - Tap `/emergency` on your mobile browser.
   - Tap **"Auto-Fill Emergency Scenario"** to populate realistic emergency coordinates.
   - Tap **"Dispatch Autonomous Search"** to trigger the AI triage engine.
2. **Real-Time GPS HUD:**
   - On the Live Dispatch page, toggle between **🗺️ Roadmap**, **🛰️ Satellite**, and **⛰️ Terrain** using the top-right layer switchers.
   - Tap **"Toggle Drone Airway"** to switch to the AeroLife UAV corridor mode (72 km/h, 3.8°C cold monitoring).
3. **Automated Gmail OTP:**
   - Go to `/register`, enter your email and phone, and observe real-time delivery to your inbox from `bloodconnectai@gmail.com`.
