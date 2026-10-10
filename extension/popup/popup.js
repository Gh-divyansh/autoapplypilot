/**
 * AutoApplyPilot Companion - Popup Logic
 */

document.addEventListener('DOMContentLoaded', async () => {
  const statusIndicator = document.getElementById('statusIndicator');
  const statusText = document.getElementById('statusText');
  const candidateName = document.getElementById('candidateName');
  const candidateTarget = document.getElementById('candidateTarget');
  const chipLocation = document.getElementById('chipLocation');
  const chipCurrency = document.getElementById('chipCurrency');
  const chipNotice = document.getElementById('chipNotice');
  const queueCount = document.getElementById('queueCount');
  const btnSync = document.getElementById('btnSync');
  const btnOpenDashboard = document.getElementById('btnOpenDashboard');
  const autopilotToggle = document.getElementById('autopilotToggle');

  // Ingestion UI elements
  const platformBadge = document.getElementById('platformBadge');
  const visibleJobsText = document.getElementById('visibleJobsText');
  const activePlatformName = document.getElementById('activePlatformName');
  const btnIngestPage = document.getElementById('btnIngestPage');
  const btnIngestText = document.getElementById('btnIngestText');

  let activeScannedJobs = [];

  // Load initial state from storage & scan active tab
  await loadState();
  await checkActiveTabJobs();

  // Check jobs on active tab
  async function checkActiveTabJobs() {
    try {
      const res = await chrome.runtime.sendMessage({ type: 'GET_PAGE_JOBS' });
      if (res && res.success && res.jobs) {
        activeScannedJobs = res.jobs;
        const count = res.jobs.length;
        const plat = res.platform ? res.platform.toUpperCase() : 'DETECTED';

        if (platformBadge) {
          platformBadge.textContent = plat;
          platformBadge.style.background = '#065f46';
          platformBadge.style.color = '#34d399';
        }
        if (activePlatformName) {
          activePlatformName.textContent = `${plat} Tab Active`;
        }

        if (count > 0) {
          if (visibleJobsText) visibleJobsText.textContent = `${count} real jobs ready to sync`;
          if (btnIngestPage) btnIngestPage.disabled = false;
          if (btnIngestText) btnIngestText.textContent = `Sync ${count} Jobs to Pilot Portal`;
        } else {
          if (visibleJobsText) visibleJobsText.textContent = 'No job cards on page';
          if (btnIngestPage) btnIngestPage.disabled = true;
          if (btnIngestText) btnIngestText.textContent = 'No Jobs Detected';
        }
      } else {
        if (platformBadge) {
          platformBadge.textContent = 'Non-Job Tab';
          platformBadge.style.background = '#334155';
          platformBadge.style.color = '#94a3b8';
        }
        if (visibleJobsText) visibleJobsText.textContent = 'Browse LinkedIn, Naukri, or Indeed';
        if (btnIngestPage) btnIngestPage.disabled = true;
      }
    } catch (e) {
      if (platformBadge) platformBadge.textContent = 'Ready';
      if (visibleJobsText) visibleJobsText.textContent = 'Browse jobs to enable sync';
    }
  }

  // Bulk Ingest Button Listener
  if (btnIngestPage) {
    btnIngestPage.addEventListener('click', async () => {
      if (activeScannedJobs.length === 0) return;
      btnIngestPage.disabled = true;
      if (btnIngestText) btnIngestText.textContent = 'Syncing to Portal...';

      try {
        const res = await chrome.runtime.sendMessage({
          type: 'SYNC_JOBS_BATCH',
          jobs: activeScannedJobs,
        });

        if (res && res.success) {
          const syncedCount = res.data?.created !== undefined ? res.data.created : activeScannedJobs.length;
          if (btnIngestText) btnIngestText.textContent = `Synced ${syncedCount} Jobs!`;
          btnIngestPage.style.background = '#047857';
          await loadState();
          setTimeout(() => {
            if (btnIngestText) btnIngestText.textContent = `Sync ${activeScannedJobs.length} Jobs`;
            btnIngestPage.disabled = false;
          }, 3000);
        } else {
          if (btnIngestText) btnIngestText.textContent = 'Sync Failed (Check Portal)';
          setTimeout(() => {
            btnIngestPage.disabled = false;
            if (btnIngestText) btnIngestText.textContent = 'Retry Sync';
          }, 2000);
        }
      } catch (err) {
        if (btnIngestText) btnIngestText.textContent = 'Error contacting portal';
        btnIngestPage.disabled = false;
      }
    });
  }

  // Sync button listener
  btnSync.addEventListener('click', async () => {
    btnSync.disabled = true;
    btnSync.textContent = 'Syncing...';
    try {
      const response = await chrome.runtime.sendMessage({ type: 'SYNC_PROFILE' });
      if (response && response.success) {
        await loadState();
      } else {
        renderOffline();
      }
    } catch (err) {
      renderOffline();
    } finally {
      btnSync.disabled = false;
      btnSync.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:inline-block; vertical-align:middle; margin-right:4px;"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg><span>Sync</span>';
    }
  });

  // Open dashboard listener
  btnOpenDashboard.addEventListener('click', async () => {
    await chrome.tabs.create({ url: 'http://localhost:3000/dashboard' });
  });

  // Toggle listener
  autopilotToggle.addEventListener('change', async (e) => {
    await chrome.storage.local.set({ autopilotEnabled: e.target.checked });
  });

  async function loadState() {
    const data = await chrome.storage.local.get([
      'candidate',
      'connected',
      'activeQueueCount',
      'autopilotEnabled',
    ]);

    if (data.autopilotEnabled !== undefined) {
      autopilotToggle.checked = data.autopilotEnabled;
    }

    if (data.connected && data.candidate) {
      renderOnline(data.candidate, data.activeQueueCount || 0);
    } else {
      // Try to trigger a sync
      try {
        const syncRes = await chrome.runtime.sendMessage({ type: 'SYNC_PROFILE' });
        if (syncRes && syncRes.success && syncRes.data) {
          renderOnline(syncRes.data.candidate, syncRes.data.activeQueueCount || 0);
        } else {
          renderOffline();
        }
      } catch (e) {
        renderOffline();
      }
    }
  }

  function renderOnline(candidate, count) {
    statusIndicator.className = 'status-indicator online';
    statusText.textContent = 'Connected (Port 3000)';

    if (candidate) {
      candidateName.textContent = candidate.name || 'Divyansh Sharma';
      candidateTarget.textContent = `Targeting: ${candidate.targetCountry || 'India'} • Full Stack & Backend`;
      chipLocation.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> ${escapeText(candidate.location || 'India')}`;
      chipCurrency.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg> ${escapeText(candidate.preferredCurrency || 'INR')} (LPA)`;
      chipNotice.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${escapeText(candidate.noticePeriod || '15 Days')}`;
    }

    queueCount.textContent = String(count);
  }

  function escapeText(str) {
    return String(str || '').replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  function renderOffline() {
    statusIndicator.className = 'status-indicator offline';
    statusText.textContent = 'Portal Offline';
    candidateTarget.textContent = 'Launch "npm run dev" to connect with AutoApplyPilot';
  }
});
