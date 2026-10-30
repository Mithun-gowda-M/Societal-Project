/**
 * BloodConnect 2026 — Executive Admin Dashboard Controller
 * Displays all registered hospitals, donors, patients helped, and AI spam protection queue.
 */

(function () {
  'use strict';

  const metricDonors = document.getElementById('metricDonorsCount');
  const metricBanks = document.getElementById('metricBanksCount');
  const metricHelped = document.getElementById('metricHelpedCount');
  const metricSpam = document.getElementById('metricSpamCount');

  const donorsTbody = document.getElementById('adminDonorsTbody');
  const hospitalsTbody = document.getElementById('adminHospitalsTbody');
  const helpedTbody = document.getElementById('adminHelpedTbody');
  const spamTbody = document.getElementById('adminSpamTbody');

  // Seeded Transfusion Success Logs (Patients Who Got Help)
  const HELPED_PATIENTS = [
    {
      patientName: 'Ramesh Sundaram (ICU Trauma)',
      hospital: 'Victoria Hospital Emergency ICU, KR Market',
      bloodGroup: 'O+',
      units: 2,
      donorName: 'Dr. Arjun K. Rao',
      date: '2026-10-18',
      status: 'Transfusion Completed'
    },
    {
      patientName: 'Kavitha Ramachandran',
      hospital: 'NIMHANS Neuro-Surgery Unit, Dairy Circle',
      bloodGroup: 'O-',
      units: 3,
      donorName: 'Karthik Venkatesh',
      date: '2026-10-12',
      status: 'Transfusion Completed'
    },
    {
      patientName: 'Master Aarav (Oncology Apheresis)',
      hospital: 'Kidwai Memorial Institute of Oncology',
      bloodGroup: 'Platelets (2 units)',
      units: 2,
      donorName: 'Sneha Nandakumar',
      date: '2026-09-20',
      status: 'Transfusion Completed'
    }
  ];

  const SPAM_INCIDENTS = [
    {
      id: 'SPAM-882',
      requester: 'Bot Script (IP 194.26.29.11)',
      units: '40 Units (Spike)',
      score: '96% High Threat',
      flags: 'Non-existent hospital, bulk spam iteration, fake phone format',
      action: 'Permanently Blocked'
    }
  ];

  function checkAdminAuth() {
    const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
    if (!user || user.role !== 'ADMIN') {
      const pass = prompt('🛡️ BloodConnect Executive Admin Authentication\nEnter Admin Access Password:');
      if (pass === 'BMMCGS5353@m') {
        if (typeof saveBloodConnectSession === 'function') {
          saveBloodConnectSession({
            accessToken: 'admin-token-' + Date.now(),
            user: { email: 'admin@bloodconnect.local', role: 'ADMIN', name: 'Chief Medical Administrator' }
          });
        }
      } else {
        alert('❌ Access Denied: Unauthorized admin password. Redirecting to login.');
        window.location.href = 'login.html';
        return false;
      }
    }
    return true;
  }

  function init() {
    if (!checkAdminAuth()) return;
    renderStats();
    renderDonors();
    renderHospitals();
    renderHelped();
    renderSpam();
    setupTabSwitching();

    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearBloodConnectSession();
        window.location.href = 'login.html';
      });
    }
  }

  function renderStats() {
    const donors = window.BangaloreBloodData ? window.BangaloreBloodData.getDonors() : [];
    const banks = window.BangaloreBloodData ? window.BangaloreBloodData.getBloodBanks() : [];

    metricDonors.textContent = donors.length;
    metricBanks.textContent = banks.length;
    metricHelped.textContent = HELPED_PATIENTS.length;
    metricSpam.textContent = SPAM_INCIDENTS.length;
  }

  function renderDonors() {
    if (!donorsTbody) return;
    donorsTbody.innerHTML = '';

    const donors = window.BangaloreBloodData ? window.BangaloreBloodData.getDonors() : [];

    donors.forEach(donor => {
      const tr = document.createElement('tr');
      const cooldown = window.BloodAI.checkDonationCooldown(donor.lastDonationDate);

      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: var(--text-main);">${donor.name}</div>
          <div style="font-size: 12px; color: var(--text-dim);">${donor.email} • ${donor.phone}</div>
        </td>
        <td>
          <span style="font-family: var(--font-mono); font-weight: 800; color: var(--crimson-primary); font-size: 15px;">
            ${donor.bloodGroup}
          </span>
        </td>
        <td>${donor.age || 30} yrs / ${donor.weight || 68} kg</td>
        <td>${donor.location}</td>
        <td>
          <span class="badge badge-verified">
            ${donor.idVerified ? `🛡️ ${donor.aadhaarMasked || 'Aadhaar Verified'}` : 'Pending Scan'}
          </span>
        </td>
        <td>
          <span class="badge ${cooldown.isEligible ? 'badge-available' : 'badge-cooldown'}">
            ${cooldown.isEligible ? 'Eligible' : `${cooldown.daysRemaining}d Cooldown`}
          </span>
        </td>
        <td style="color: #f59e0b; font-weight: 600;">⭐ ${donor.rating || 5.0}</td>
      `;

      donorsTbody.appendChild(tr);
    });
  }

  function renderHospitals() {
    if (!hospitalsTbody) return;
    hospitalsTbody.innerHTML = '';

    const banks = window.BangaloreBloodData ? window.BangaloreBloodData.getBloodBanks() : [];

    banks.forEach(bank => {
      let totalUnits = 0;
      if (bank.stock) {
        Object.values(bank.stock).forEach(cnt => totalUnits += cnt);
      }

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight: 700; color: var(--text-main);">${bank.name}</div>
          <div style="font-size: 12px; color: var(--text-dim);">${bank.address}</div>
        </td>
        <td><span class="badge badge-available">${bank.zone || (bank.city + ', ' + bank.state)}</span></td>
        <td>
          <strong style="font-family: var(--font-display); font-size: 16px; color: var(--emerald-primary);">
            ${totalUnits} Units
          </strong>
        </td>
        <td>${bank.phone}</td>
        <td>
          <a href="${bank.website}" target="_blank" rel="noopener noreferrer" style="color: var(--cyber-blue); font-size: 13px; text-decoration: none;">
            🌐 Open Portal ➔
          </a>
        </td>
        <td>
          <a href="bangalore-blood-banks.html" class="btn btn-secondary btn-sm">Manage Stock</a>
        </td>
      `;

      hospitalsTbody.appendChild(tr);
    });
  }

  function renderHelped() {
    if (!helpedTbody) return;
    helpedTbody.innerHTML = '';

    HELPED_PATIENTS.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: var(--text-main);">${item.patientName}</strong></td>
        <td>${item.hospital}</td>
        <td><span class="badge badge-critical">${item.bloodGroup}</span></td>
        <td><strong>${item.units} Units</strong></td>
        <td><span class="badge badge-verified">🩸 ${item.donorName}</span></td>
        <td>${item.date}</td>
        <td><span class="badge badge-available">✅ ${item.status}</span></td>
      `;
      helpedTbody.appendChild(tr);
    });
  }

  function renderSpam() {
    if (!spamTbody) return;
    spamTbody.innerHTML = '';

    SPAM_INCIDENTS.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-family: var(--font-mono);">${item.id}</td>
        <td>${item.requester}</td>
        <td style="color: var(--crimson-primary); font-weight: 700;">${item.units}</td>
        <td><span class="badge badge-critical">${item.score}</span></td>
        <td style="font-size: 13px; color: var(--text-muted);">${item.flags}</td>
        <td><span class="badge badge-cooldown">${item.action}</span></td>
      `;
      spamTbody.appendChild(tr);
    });
  }

  function setupTabSwitching() {
    const tabs = document.querySelectorAll('.admin-tab-btn');
    const contents = document.querySelectorAll('.admin-tab-content');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        contents.forEach(c => {
          c.classList.add('tab-hidden');
          c.style.display = 'none';
        });

        tab.classList.add('active');
        const targetId = tab.dataset.tab;
        const targetContent = document.getElementById(targetId);
        if (targetContent) {
          targetContent.classList.remove('tab-hidden');
          targetContent.style.display = 'block';
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();