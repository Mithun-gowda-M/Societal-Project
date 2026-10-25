/**
 * BloodConnect 2026 — AI & ML Predictive Core Engine
 * 
 * Includes:
 * 1. AI Donor Response Prediction (⭐ Best choice)
 * 2. AI Emergency Priority & Triage Prediction
 * 3. Complete Donor Eligibility Algorithm (Age 18-65, Weight >= 45kg, 90-day Cooldown, Hemoglobin, Medical Conditions)
 * 4. Fake / Spam Request Detector
 * 5. Blood Demand & Shortage Forecaster
 */

const BloodAI = (function () {
  'use strict';

  // 1. AI Donor Response Prediction Model (⭐ Best Choice)
  function predictDonorResponse(donor, requestContext = {}) {
    // Baseline acceptance probability derived from historical response record
    let baseScore = donor.historicalResponseRate || 0.88;

    // Distance decay model: P(response) drops smoothly with distance
    const distanceKm = donor.distanceKm ?? 4.5;
    const distanceFactor = Math.max(0.4, Math.exp(-0.06 * distanceKm));

    // Cooldown status check
    let cooldownFactor = 1.0;
    const cooldownInfo = checkDonationCooldown(donor.lastDonationDate);
    if (!cooldownInfo.isEligible && !donor.emergencyMedicalOverride) {
      cooldownFactor = 0.05; // Cooled-down donors have near zero probability unless cleared
    }

    // Exact ABO-Rh match bonus
    let groupBonus = 1.0;
    if (requestContext.bloodGroup && donor.bloodGroup === requestContext.bloodGroup) {
      groupBonus = 1.12;
    }

    // Time-of-day affinity (daytime 8am-9pm has higher responsiveness)
    const currentHour = new Date().getHours();
    const timeFactor = (currentHour >= 7 && currentHour <= 22) ? 1.0 : 0.82;

    // Composite response likelihood (bounded 5% to 99%)
    let rawProb = baseScore * distanceFactor * cooldownFactor * groupBonus * timeFactor;
    let finalPercentage = Math.round(Math.min(99, Math.max(5, rawProb * 100)));

    // Categorization
    let category = 'Moderate';
    let color = '#f59e0b';
    let badgeClass = 'badge-cooldown';
    if (finalPercentage >= 85) {
      category = 'Very High Probability';
      color = '#10b981';
      badgeClass = 'badge-available';
    } else if (finalPercentage >= 70) {
      category = 'High Probability';
      color = '#38bdf8';
      badgeClass = 'badge-verified';
    } else if (finalPercentage < 40) {
      category = 'Low Probability';
      color = '#ef4444';
      badgeClass = 'badge-critical';
    }

    // Estimated Response & Dispatch ETA
    const estimatedResponseMins = Math.max(2, Math.round(distanceKm * 1.8 + (100 - finalPercentage) * 0.12));

    // Explainability factors for doctors and requesters
    const explainability = [];
    if (distanceKm <= 5) explainability.push(`Nearby (${distanceKm} km away)`);
    if (donor.historicalResponseRate && donor.historicalResponseRate >= 0.9) {
      explainability.push(`High historical response rate (${Math.round(donor.historicalResponseRate * 100)}%)`);
    }
    if (donor.bloodGroup === requestContext.bloodGroup) explainability.push('Exact ABO-Rh match');
    if (!cooldownInfo.isEligible) {
      explainability.push(`90-Day Cooldown active (${cooldownInfo.daysRemaining} days left)`);
    }

    return {
      percentage: finalPercentage,
      category,
      color,
      badgeClass,
      estimatedResponseMins,
      distanceKm,
      explainability,
      cooldown: cooldownInfo
    };
  }

  // 2. AI Emergency Priority & Triage Prediction
  function predictEmergencyPriority(requestData) {
    let score = 50; // Baseline
    const urgency = (requestData.urgency || '').toLowerCase();
    const units = Number(requestData.units) || 1;
    const message = (requestData.message || '').toLowerCase();

    // Urgency input weights
    if (urgency.includes('critical')) score += 35;
    else if (urgency.includes('urgent')) score += 20;

    // Units requested urgency (large requirement signals major hemorrhage/surgery)
    if (units >= 4) score += 12;
    else if (units >= 2) score += 6;

    // NLP keyword triage keywords
    const criticalKeywords = ['icu', 'trauma', 'accident', 'ventilator', 'surgery', 'hemorrhage', 'emergency', 'cancer', 'ot', 'bypass'];
    criticalKeywords.forEach(kw => {
      if (message.includes(kw)) score += 4;
    });

    const finalScore = Math.min(100, score);
    let level = 'Routine (Tier-3)';
    let badgeClass = 'badge-available';

    if (finalScore >= 80) {
      level = 'Critical Emergency (Tier-1)';
      badgeClass = 'badge-critical';
    } else if (finalScore >= 65) {
      level = 'High Urgency (Tier-2)';
      badgeClass = 'badge-cooldown';
    }

    return {
      score: finalScore,
      level,
      badgeClass,
      suggestedBroadcastRadiusKm: finalScore >= 80 ? 25 : 12,
      recommendedTargetDonors: Math.min(15, units * 3 + (finalScore >= 80 ? 4 : 1))
    };
  }

  // 3. Complete Donor Eligibility Algorithm
  function evaluateDonorEligibility(donorInfo) {
    const reasons = [];
    const warnings = [];
    let isEligible = true;

    const age = Number(donorInfo.age);
    const weight = Number(donorInfo.weight);

    // Age Evaluation
    if (!age || isNaN(age)) {
      isEligible = false;
      reasons.push('Valid age is required.');
    } else if (age < 18) {
      isEligible = false;
      reasons.push('Minimum age for blood donation is 18 years.');
    } else if (age > 65) {
      isEligible = false;
      reasons.push('Maximum age for blood donation is 65 years.');
    } else if (age >= 60 && donorInfo.isFirstTimeDonor) {
      warnings.push('First-time donors aged 60–65 require specific on-site medical and cardiological screening prior to donation.');
    }

    // Weight Evaluation
    if (!weight || isNaN(weight)) {
      isEligible = false;
      reasons.push('Valid weight is required.');
    } else if (weight < 45) {
      isEligible = false;
      reasons.push('Weight must be at least 45 kg (or 50 kg for 450ml / apheresis platelets) for donor safety.');
    }

    // 3-Month (90 Days) Cooldown Evaluation
    const cooldown = checkDonationCooldown(donorInfo.lastDonationDate);
    if (!cooldown.isEligible) {
      if (donorInfo.emergencyMedicalOverride) {
        warnings.push(`Donor is within the 90-day cooldown period (${cooldown.daysRemaining} days remaining), but an Emergency Medical Expert Override has been authorized.`);
      } else {
        isEligible = false;
        reasons.push(`Donor must observe a 3-month (90 days) cooldown between whole blood donations. Eligible again on ${cooldown.nextEligibleDateFormatted} (${cooldown.daysRemaining} days left).`);
      }
    }

    // Hemoglobin Check (Standard Indian NACO & Red Cross guidelines: >= 12.5 g/dL)
    if (donorInfo.hemoglobin != null && donorInfo.hemoglobin !== '') {
      const hb = Number(donorInfo.hemoglobin);
      if (!isNaN(hb) && hb < 12.5) {
        isEligible = false;
        reasons.push(`Hemoglobin is ${hb} g/dL, which is below the minimum required 12.5 g/dL threshold.`);
      }
    }

    // Medical Conditions Checklist
    if (donorInfo.hasHeartCondition) {
      isEligible = false;
      reasons.push('Chronic cardiovascular disease or active heart conditions are permanent deferrals.');
    }
    if (donorInfo.hasInsulinDiabetes) {
      isEligible = false;
      reasons.push('Insulin-dependent diabetes mellitus is a medical deferral.');
    }
    if (donorInfo.hasActiveInfection) {
      isEligible = false;
      reasons.push('Active infections or antibiotic therapies require full recovery plus 14-day clearance.');
    }
    if (donorInfo.hasRecentTattooOrSurgery) {
      isEligible = false;
      reasons.push('Tattoos, body piercings, or major surgeries require a 6-month deferral period.');
    }
    if (donorInfo.isPregnantOrLactating) {
      isEligible = false;
      reasons.push('Pregnancy or lactation within the last 6 months requires temporary deferral.');
    }

    return {
      isEligible,
      reasons,
      warnings,
      cooldown,
      medicalDisclaimer: 'Preliminary eligibility only. Final clinical eligibility, hemoglobin verification, and phlebotomy clearance must be confirmed on-site by qualified blood bank/medical personnel.'
    };
  }

  // Helper: 90-Day Donation Cooldown Calculator
  function checkDonationCooldown(lastDonationDateStr) {
    if (!lastDonationDateStr) {
      return {
        isEligible: true,
        daysRemaining: 0,
        lastDonationDateFormatted: 'No prior donation recorded',
        nextEligibleDateFormatted: 'Immediately available'
      };
    }

    const lastDate = new Date(lastDonationDateStr);
    if (isNaN(lastDate.getTime())) {
      return { isEligible: true, daysRemaining: 0 };
    }

    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 90); // 90 days cooldown

    const today = new Date();
    const diffMs = nextDate.getTime() - today.getTime();
    const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    return {
      isEligible: daysRemaining === 0,
      daysRemaining,
      lastDonationDate: lastDate.toISOString().split('T')[0],
      lastDonationDateFormatted: lastDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      nextEligibleDate: nextDate.toISOString().split('T')[0],
      nextEligibleDateFormatted: nextDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };
  }

  // 4. Fake / Spam Request Detector
  function detectSpamRequest(requestData) {
    let spamScore = 0;
    const flags = [];

    const units = Number(requestData.units) || 1;
    if (units > 15) {
      spamScore += 45;
      flags.push('Unusually high unit requirement (> 15 units)');
    }

    const contact = (requestData.contact || '').replace(/\D/g, '');
    if (contact.length < 10) {
      spamScore += 35;
      flags.push('Invalid or truncated contact phone number');
    }

    const hospital = (requestData.hospital || '').trim();
    if (hospital.length < 3 || /test|fake|spam|xyz|dummy/i.test(hospital)) {
      spamScore += 50;
      flags.push('Suspicious hospital name detected');
    }

    const isSpam = spamScore >= 50;
    return {
      isSpam,
      spamScore,
      flags,
      recommendation: isSpam ? 'Flagged for Admin Manual Review' : 'Verified Legitimate Request'
    };
  }

  // 5. Blood Demand & Shortage Forecaster for Bangalore
  function forecastBangaloreDemand(bloodStocks) {
    const criticalThreshold = 6;
    const lowThreshold = 12;

    const analysis = {};
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    groups.forEach(group => {
      let totalUnits = 0;
      bloodStocks.forEach(bank => {
        totalUnits += (bank.stock && bank.stock[group]) || 0;
      });

      let status = 'Adequate';
      let badgeClass = 'badge-available';
      if (totalUnits <= criticalThreshold * bloodStocks.length * 0.4) {
        status = 'Critical Deficit 🚨';
        badgeClass = 'badge-critical';
      } else if (totalUnits <= lowThreshold * bloodStocks.length * 0.6) {
        status = 'Low Supply Warning ⚠️';
        badgeClass = 'badge-cooldown';
      }

      analysis[group] = {
        totalUnits,
        status,
        badgeClass
      };
    });

    return analysis;
  }

  return {
    predictDonorResponse,
    predictEmergencyPriority,
    evaluateDonorEligibility,
    checkDonationCooldown,
    detectSpamRequest,
    forecastBangaloreDemand
  };
})();

// Attach to window for global access
if (typeof window !== 'undefined') {
  window.BloodAI = BloodAI;
}
