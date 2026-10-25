/**
 * AI Blood Shortage Radar & Clinical Transfusion Matrix Logic
 * BloodConnect 2026
 */

(function () {
  let selectedComponent = 'RBC';
  let selectedPatientGroup = 'O-';

  const ALL_GROUPS = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  // RBC Compatibility: Who can donate RBCs to whom?
  // Key = Recipient, Values = Compatible Donors
  const RBC_COMPATIBILITY = {
    'O-': ['O-'],
    'O+': ['O-', 'O+'],
    'A-': ['O-', 'A-'],
    'A+': ['O-', 'O+', 'A-', 'A+'],
    'B-': ['O-', 'B-'],
    'B+': ['O-', 'O+', 'B-', 'B+'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
  };

  // Plasma Compatibility (Reverse! AB is Universal Plasma Donor, O is Universal Recipient)
  // Key = Recipient, Values = Compatible Donors
  const PLASMA_COMPATIBILITY = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A-', 'A+', 'AB-', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B-', 'B+', 'AB-', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB-', 'AB+']
  };

  // Platelet Compatibility (Rh compatibility prioritized)
  const PLATELET_COMPATIBILITY = {
    'O-': ['O-', 'A-', 'B-', 'AB-'],
    'O+': ['O+', 'O-', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'O-', 'AB-'],
    'A+': ['A+', 'A-', 'O+', 'AB+'],
    'B-': ['B-', 'O-', 'AB-'],
    'B+': ['B+', 'B-', 'O+', 'AB+'],
    'AB-': ['AB-', 'A-', 'B-', 'O-'],
    'AB+': ['AB+', 'AB-', 'A+', 'B+', 'O+']
  };

  function renderForecastCards() {
    const container = document.getElementById('forecastCardsContainer');
    if (!container) return;

    const data = IndiaBloodData.getDemandForecast();
    if (!data || !data.riskLevels) return;

    container.innerHTML = '';

    Object.entries(data.riskLevels).forEach(([grp, item]) => {
      const card = document.createElement('div');
      const isCritical = item.status === 'CRITICAL_DEFICIT';
      const isModerate = item.status === 'MODERATE_RISK';
      const cardClass = isCritical ? 'critical' : (isModerate ? 'moderate' : 'stable');

      card.className = `forecast-card ${cardClass}`;

      const pct = Math.min(100, Math.round((item.currentStock / item.projectedDemand) * 100));
      const fillColor = isCritical ? '#ff3347' : (isModerate ? '#f59e0b' : '#10b981');
      const statusBadge = isCritical ?
        '<span class="badge badge-critical" style="font-size: 11px;">CRITICAL DEFICIT</span>' :
        (isModerate ?
          '<span class="badge" style="background: rgba(245, 158, 11, 0.2); color: #f59e0b; font-size: 11px;">MODERATE RISK</span>' :
          '<span class="badge badge-verified" style="font-size: 11px;">STABLE BUFFER</span>');

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h3 style="font-family: var(--font-display); font-size: 26px; color: #ffffff; margin: 0;">${grp}</h3>
            <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${item.urgency}</div>
          </div>
          ${statusBadge}
        </div>

        <div class="stock-meter">
          <div class="stock-fill" style="width: ${pct}%; background: ${fillColor};"></div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-top: 6px;">
          <span style="color: var(--text-dim);">Reserve: <strong style="color: #ffffff;">${item.currentStock} units</strong></span>
          <span style="color: var(--text-dim);">Projected 7d: <strong style="color: #ffffff;">${item.projectedDemand} units</strong></span>
        </div>

        <div style="margin-top: 14px; font-size: 11px; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.06); padding-top: 8px;">
          Trend: <span style="color: ${isCritical ? '#ff3347' : '#94a3b8'}; font-weight: 600;">${item.trend}</span>
        </div>

        ${isCritical ? `
          <button class="btn btn-primary btn-sm" style="width: 100%; margin-top: 12px; justify-content: center; font-size: 11px; padding: 6px;" onclick="triggerRecruitmentDrive('${grp}')">
            ⚡ Automated Drive Callout
          </button>
        ` : ''}
      `;

      container.appendChild(card);
    });
  }

  function updateCompatibilityMatrix() {
    const container = document.getElementById('compatMatrixGrid');
    if (!container) return;

    let compatMap = RBC_COMPATIBILITY;
    if (selectedComponent === 'PLASMA') compatMap = PLASMA_COMPATIBILITY;
    if (selectedComponent === 'PLATELETS') compatMap = PLATELET_COMPATIBILITY;

    const allowedDonors = compatMap[selectedPatientGroup] || [];
    container.innerHTML = '';

    ALL_GROUPS.forEach(donorGrp => {
      const isMatch = allowedDonors.includes(donorGrp);
      const node = document.createElement('div');
      node.className = `compat-node ${isMatch ? 'match' : 'no-match'}`;

      node.innerHTML = `
        <div style="font-family: var(--font-display); font-size: 22px; font-weight: 700;">${donorGrp}</div>
        <div style="font-size: 11px; margin-top: 4px; font-weight: 600;">
          ${isMatch ? '✓ SAFE COMPATIBLE' : '✕ INCOMPATIBLE'}
        </div>
      `;

      container.appendChild(node);
    });

    // Update specs box
    const matrix = IndiaBloodData.getCompatibilityMatrix();
    const spec = matrix ? matrix[selectedPatientGroup] : null;

    const lbl = document.getElementById('lblSelectedPatient');
    if (lbl) lbl.textContent = `${selectedPatientGroup} Patient`;

    const specTitle = document.getElementById('specTitle');
    const specAntigens = document.getElementById('specAntigens');
    const specAntibodies = document.getElementById('specAntibodies');
    const specDirective = document.getElementById('specDirective');
    const specNote = document.getElementById('specNote');

    if (spec) {
      if (specTitle) specTitle.textContent = `${selectedPatientGroup} Clinical Immunogenetics Profile`;
      if (specAntigens) specAntigens.textContent = spec.antigens;
      if (specAntibodies) specAntibodies.textContent = spec.antibodies;
      if (specDirective) {
        if (selectedComponent === 'RBC') {
          specDirective.textContent = `Can receive red cells from: ${spec.rbcCanReceiveFrom.join(', ')}`;
        } else if (selectedComponent === 'PLASMA') {
          specDirective.textContent = `Can receive plasma from: ${spec.plasmaCanReceiveFrom.join(', ')}`;
        } else {
          specDirective.textContent = `Compatible platelets: ${allowedDonors.join(', ')}`;
        }
      }
      if (specNote) specNote.textContent = spec.clinicalNote;
    }
  }

  window.selectComponent = function (comp) {
    selectedComponent = comp;
    ['btnCompRBC', 'btnCompPlasma', 'btnCompPlatelets'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.classList.remove('active');
    });

    if (comp === 'RBC') document.getElementById('btnCompRBC')?.classList.add('active');
    if (comp === 'PLASMA') document.getElementById('btnCompPlasma')?.classList.add('active');
    if (comp === 'PLATELETS') document.getElementById('btnCompPlatelets')?.classList.add('active');

    updateCompatibilityMatrix();
  };

  window.selectPatientGroup = function (grp) {
    selectedPatientGroup = grp;
    const btns = document.querySelectorAll('#patientGroupPills .pill-btn');
    btns.forEach(b => {
      if (b.textContent.includes(grp)) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });

    updateCompatibilityMatrix();
  };

  window.triggerRecruitmentDrive = function (grp) {
    if (window.OfficialMailer) {
      window.OfficialMailer.sendBloodBankAlert({
        bankName: 'Rotary Bangalore TTK Blood Centre',
        bankEmail: 'rotary.ttk@bloodbank.org',
        bankPhone: '+91 80 2528 7903',
        bloodGroup: grp,
        unitsRequired: 8,
        urgentHospital: 'Bangalore Metropolitan Critical Care Grid'
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    renderForecastCards();
    updateCompatibilityMatrix();
  });
})();
