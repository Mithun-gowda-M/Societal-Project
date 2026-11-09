# BloodConnect — Official Google Forms & Survey Instruments

**Course:** Societal Project (`1BSOP308`) — 2025 Scheme  
**Institution:** BMS Institute of Technology and Management, Bengaluru  
**Department:** Artificial Intelligence & Machine Learning  
**Project Guide:** Dr. Sampath Kumar Y R, Assistant Professor  
**Lead Contributor (Documentation & Surveys):** Rakshitha R (`26UG1BYAI414-T`)  
**Team Members:** Mithun Gowda M (`26UG1BYAI401-T`), Ranjeetha (`26UG1BYAI410-T`), Rakshitha R (`26UG1BYAI414-T`), Nikhil V (`26UG1BYAI416-T`)  

---

## 📋 Overview of Official Intake & Survey Forms

BloodConnect uses three specialized Google Forms for empirical research data collection, emergency requisition intake, and voluntary donor onboarding. All responses are treated in strict accordance with academic ethics and data privacy principles.

| Sl. | Form Title | Objective & Scope | Live Link |
| :- | :--- | :--- | :--- |
| **1** | **Blood Donation Awareness Survey** | Empirical study on blood donation hurdles, awareness, and public perception of AI-assisted donor matching in Bengaluru. | [Open Awareness Survey](https://docs.google.com/forms/d/e/1FAIpQLSemhhcQcn5Fq0G9zXpFwHgSS1GbuRren1gF7GpvrcvJUnHttg/viewform?usp=preview) |
| **2** | **Emergency Blood Request** | Structured intake portal capturing critical patient transfusion requirements (ABO/Rh group, units, hospital ICU location). | [Open Emergency Request](https://docs.google.com/forms/d/e/1FAIpQLScBcu_BYdWpkzRn7JDdgkELi7BlIJS62aumEXwjDFP2ANFqgA/viewform?usp=preview) |
| **3** | **Blood Donor Registration** | Standby voluntary donor onboarding capturing blood group, locality, PIN code, and last-donation cooldown eligibility. | [Open Donor Registration](https://docs.google.com/forms/d/e/1FAIpQLSfqPTcEvUwOYqpPauZ1qtAdnjc96KebUrf3fGEhHYCM49W0ZA/viewform?usp=preview) |

---

## 1. Blood Donation Awareness Survey

* **Live URL:** [https://docs.google.com/forms/d/e/1FAIpQLSemhhcQcn5Fq0G9zXpFwHgSS1GbuRren1gF7GpvrcvJUnHttg/viewform?usp=preview](https://docs.google.com/forms/d/e/1FAIpQLSemhhcQcn5Fq0G9zXpFwHgSS1GbuRren1gF7GpvrcvJUnHttg/viewform?usp=preview)
* **Target Audience:** Citizens of Bengaluru / Karnataka, college students, healthcare workers, voluntary blood donors, and patients' families.
* **Academic Purpose:** Collects empirical field data on the difficulty of finding compatible blood during the "Golden Hour", evaluating community willingness to use an AI-assisted proximity matching platform.

### Form Structure & Questions (17 Items)

1. **Full Name** (Respondent identification)
2. **Email Address** (Communication / verification)
3. **Age Group** (Demographic profiling)
4. **Blood Group** (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`, or *Unknown*)
5. **How difficult is it to find blood donors during emergencies?** (Likert Scale: Very Easy to Extremely Difficult)
6. **Would you use an AI-powered platform to find potential blood donors?** (Yes / No / Maybe)
7. **What additional features would you like BloodConnect to include?** (Open-ended suggestions)
8. **Have you donated blood before?** (Conditional branch: Donors vs. Non-Donors)

#### Sub-Section A: Donation Experience (For Past Donors)
- **8a.** How many times have you donated blood?
- **8b.** When was your last blood donation? (Cooldown assessment)
- **8c.** How long did it take to find a donor when you or someone you knew needed blood?
- **8d.** Would you be willing to register as a standby donor on BloodConnect?

#### Sub-Section B: Donation Barriers & Willingness (For Non-Donors)
- **8a.** What is the primary reason you have not donated blood yet? (Fear of needles, lack of opportunity, medical eligibility doubts, etc.)
- **8b.** Are you willing to donate blood in the future?
- **8c.** If BloodConnect provided a simple eligibility checklist and notified you only when a verified nearby emergency occurred, would you donate?

---

## 2. Emergency Blood Request Form

* **Live URL:** [https://docs.google.com/forms/d/e/1FAIpQLScBcu_BYdWpkzRn7JDdgkELi7BlIJS62aumEXwjDFP2ANFqgA/viewform?usp=preview](https://docs.google.com/forms/d/e/1FAIpQLScBcu_BYdWpkzRn7JDdgkELi7BlIJS62aumEXwjDFP2ANFqgA/viewform?usp=preview)
* **Target Audience:** Attending medical officers, hospital blood bank coordinators, patient kin, and trauma ward staff.
* **Operational Purpose:** Ingests emergency requisition parameters directly into the BloodConnect triage pipeline to activate proximity-ranked donor dispatch.

### Form Structure & Questions (15 Items)

1. **Requester's Full Name**
2. **Contact Email**
3. **Contact Number** (Primary point of contact)
4. **Required Blood Group** (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`)
5. **Required Blood Component** (Whole Blood, Packed Red Blood Cells - PRBC, Fresh Frozen Plasma - FFP, Apheresis Platelets)
6. **Number of Units Required**
7. **Hospital Name** (e.g., Victoria Hospital, Bowring & Lady Curzon, Manipal Hospital)
8. **Hospital City** (Bengaluru)
9. **Hospital Locality / Area** (KR Market, Indiranagar, Jayanagar, etc.)
10. **Hospital PIN Code** (Used for spatial geocoding and Haversine distance ranking)
11. **Urgency Level** (Tier-1 Immediate Critical <1 hr, Urgent <4 hrs, Scheduled Transfusion)
12. **Required Date and Time**
13. **Is the request verified by a hospital or blood bank?** (Medical validation flag)
14. **Additional Clinical Information (Optional)** (Ward/ICU bed number, special instructions)

---

## 3. Blood Donor Registration Form

* **Live URL:** [https://docs.google.com/forms/d/e/1FAIpQLSfqPTcEvUwOYqpPauZ1qtAdnjc96KebUrf3fGEhHYCM49W0ZA/viewform?usp=preview](https://docs.google.com/forms/d/e/1FAIpQLSfqPTcEvUwOYqpPauZ1qtAdnjc96KebUrf3fGEhHYCM49W0ZA/viewform?usp=preview)
* **Target Audience:** Voluntary blood donors residing in the Bengaluru metropolitan area.
* **Operational Purpose:** Enrolls standby voluntary donors into the database, keeping track of 90-day clinical recovery intervals to prevent premature donation requests.

### Form Structure & Questions (17 Items)

1. **Full Name**
2. **Email Address**
3. **Age Group** (Confirms age >= 18 as per National Blood Transfusion Council norms)
4. **Blood Group** (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`)
5. **City** (Bengaluru)
6. **Locality / Area**
7. **PIN Code** (Used for proximity scoring)
8. **Have you donated blood before?**
9. **Last blood donation date (if applicable)** (Enforces 90-day cooldown interval)
10. **Are you currently willing and available to donate blood if eligible?**
11. **Current Donor Availability** (Immediate, Weekends, Emergencies Only)
12. **Would you like to receive emergency blood donation requests?**
13. **Would you like to receive notifications when a compatible blood request occurs near your location?**
14. **Preferred Contact Method** (WhatsApp, Phone Call, SMS, Email)
15. **Additional Information (Optional)**

---

## 🔒 Data Privacy & Academic Governance

1. **Confidentiality:** Contact details collected through these forms are kept strictly confidential and used solely for academic demonstration and verified emergency matching.
2. **No Public PII Exposure:** Live public interfaces mask telephone numbers and email addresses to protect voluntary donor privacy.
3. **Compliance:** Form designs adhere to the guidelines set by the National Blood Transfusion Council (NBTC), the Directorate General of Health Services (DGHS), and the BMSIT&M Department of AIML.
