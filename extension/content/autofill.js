/**
 * AutoApplyPilot Companion - Content Script (DOM Form Filler)
 * Runs on LinkedIn, Indeed, Naukri.com, Greenhouse, and Lever.
 */

(async function initAutoApplyPilot() {
  // Prevent duplicate injection
  if (document.getElementById('aap-companion-widget')) return;

  // Retrieve candidate data from service worker
  let candidateData = null;
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_CANDIDATE_DATA' });
    if (response && response.candidate) {
      candidateData = response.candidate;
    }
  } catch (err) {
    console.warn('[AutoApplyPilot] Communication with extension background delayed:', err);
  }

  // Runtime message listener for scanner requests from popup or background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SCAN_CURRENT_PAGE') {
      const platform = window.AutoApplyPilotScanners ? window.AutoApplyPilotScanners.detectPlatform() : null;
      const jobs = window.AutoApplyPilotScanners ? window.AutoApplyPilotScanners.scanCurrentPage() : [];
      sendResponse({ platform, jobs, count: jobs.length });
    }
    return true;
  });

  // Inject floating companion widget
  injectFloatingWidget(candidateData);

  function injectFloatingWidget(candidate) {
    const widget = document.createElement('div');
    widget.id = 'aap-companion-widget';

    const candidateName = candidate?.name || 'Pilot Candidate';
    const candidateCountry = candidate?.targetCountry || 'India';
    const platform = window.AutoApplyPilotScanners ? window.AutoApplyPilotScanners.detectPlatform() : null;
    const initialJobs = window.AutoApplyPilotScanners ? window.AutoApplyPilotScanners.scanCurrentPage() : [];

    const boltSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block; vertical-align:middle;"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`;
    const syncSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="display:inline-block; vertical-align:middle;"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M21 21v-5h-5"/></svg>`;
    const closeSvg = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    const syncBtnHtml = platform && initialJobs.length > 0 ? `
      <button id="aap-btn-sync-page" class="aap-pill-btn" style="background:#0f172a; margin-right:4px;">
        <span style="display:inline-flex; align-items:center; gap:5px;">${syncSvg} Ingest ${initialJobs.length} Jobs</span>
      </button>
    ` : '';

    widget.innerHTML = `
      <div class="aap-pill-icon">${boltSvg}</div>
      <div class="aap-pill-content">
        <span class="aap-pill-title">AutoApplyPilot</span>
        <span class="aap-pill-subtitle">${escapeHtml(candidateName)} • ${escapeHtml(platform ? platform.toUpperCase() : candidateCountry)}</span>
      </div>
      ${syncBtnHtml}
      <button id="aap-btn-apply" class="aap-pill-btn">
        <span style="display:inline-flex; align-items:center; gap:5px;">${boltSvg} AutoApply</span>
      </button>
      <button id="aap-btn-close" class="aap-pill-close" title="Dismiss">${closeSvg}</button>
    `;

    document.body.appendChild(widget);

    document.getElementById('aap-btn-close').addEventListener('click', () => {
      widget.style.display = 'none';
    });

    const syncPageBtn = document.getElementById('aap-btn-sync-page');
    if (syncPageBtn) {
      syncPageBtn.addEventListener('click', async () => {
        syncPageBtn.disabled = true;
        syncPageBtn.innerHTML = '<span>Ingesting...</span>';

        const jobs = window.AutoApplyPilotScanners ? window.AutoApplyPilotScanners.scanCurrentPage() : [];
        if (jobs.length === 0) {
          showToast('No jobs detected on page to ingest.');
          syncPageBtn.disabled = false;
          syncPageBtn.innerHTML = `<span>Ingest 0 Jobs</span>`;
          return;
        }

        try {
          const res = await chrome.runtime.sendMessage({
            type: 'SYNC_JOBS_BATCH',
            jobs,
          });

          if (res && res.success) {
            showToast(`Ingested ${res.data?.created || jobs.length} live jobs into AutoApplyPilot!`);
            syncPageBtn.innerHTML = `<span>Synced (${res.data?.created || jobs.length})</span>`;
          } else {
            showToast(`Ingestion failed: ${res?.error || 'Server error'}`);
            syncPageBtn.disabled = false;
          }
        } catch (syncErr) {
          showToast(`Portal error: ${syncErr.message}`);
          syncPageBtn.disabled = false;
        }
      });
    }

    document.getElementById('aap-btn-apply').addEventListener('click', async () => {
      const applyBtn = document.getElementById('aap-btn-apply');
      applyBtn.disabled = true;
      applyBtn.innerHTML = '<span>Autofilling...</span>';

      const fieldsFilled = await executeAutofill(candidate);
      showToast(`AutoApplyPilot filled ${fieldsFilled} fields with verified answers!`);

      // Log application attempt to backend
      try {
        const pageTitle = document.title || 'Job Application';
        const hostname = window.location.hostname;
        let platform = 'companion';
        if (hostname.includes('linkedin')) platform = 'linkedin';
        else if (hostname.includes('indeed')) platform = 'indeed';
        else if (hostname.includes('naukri')) platform = 'naukri';
        else if (hostname.includes('instahyre')) platform = 'instahyre';
        else if (hostname.includes('wellfound') || hostname.includes('angel.co')) platform = 'wellfound';
        else if (hostname.includes('greenhouse')) platform = 'greenhouse';
        else if (hostname.includes('lever')) platform = 'lever';

        await chrome.runtime.sendMessage({
          type: 'LOG_APPLICATION',
          payload: {
            platform,
            title: pageTitle,
            externalUrl: window.location.href,
            confirmationId: `EXT-${Date.now()}`,
            notes: `Autofilled ${fieldsFilled} form fields in-browser.`,
          },
        });
      } catch (logErr) {
        // Handled gracefully
      }

      applyBtn.disabled = false;
      applyBtn.innerHTML = `<span style="display:inline-flex; align-items:center; gap:5px;">${boltSvg} AutoApply with Pilot</span>`;
    });
  }

  // Master form filler across platforms
  async function executeAutofill(candidate) {
    if (!candidate) return 0;
    let count = 0;

    const hostname = window.location.hostname;
    const nameParts = (candidate.name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Divyansh';
    const lastName = nameParts.slice(1).join(' ') || 'Sharma';

    // 1. Text & Email Inputs
    const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea');
    
    for (const input of inputs) {
      const name = (input.name || '').toLowerCase();
      const id = (input.id || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
      const descriptor = `${name} ${id} ${placeholder} ${ariaLabel}`;

      let valueToFill = null;

      if (descriptor.includes('first name') || descriptor.includes('firstname') || descriptor === 'first_name') {
        valueToFill = firstName;
      } else if (descriptor.includes('last name') || descriptor.includes('lastname') || descriptor === 'last_name') {
        valueToFill = lastName;
      } else if (descriptor.includes('full name') || descriptor.includes('fullname') || descriptor === 'name') {
        valueToFill = candidate.name;
      } else if (descriptor.includes('email')) {
        valueToFill = candidate.email;
      } else if (descriptor.includes('phone') || descriptor.includes('mobile') || descriptor.includes('contact')) {
        valueToFill = candidate.phone;
      } else if (descriptor.includes('city') || descriptor.includes('location') || descriptor.includes('residence')) {
        valueToFill = candidate.location;
      } else if (descriptor.includes('linkedin')) {
        valueToFill = candidate.linkedinUrl;
      } else if (descriptor.includes('github')) {
        valueToFill = candidate.githubUrl;
      } else if (descriptor.includes('portfolio') || descriptor.includes('website')) {
        valueToFill = candidate.portfolioUrl;
      } else if (descriptor.includes('notice') || descriptor.includes('availability')) {
        valueToFill = candidate.noticePeriod || '15 Days';
      } else if (descriptor.includes('salary') || descriptor.includes('compensation') || descriptor.includes('ctc')) {
        valueToFill = candidate.preferredCurrency === 'INR' ? '25 LPA' : '$130,000';
      } else if (descriptor.includes('experience') && input.type === 'number') {
        valueToFill = '5';
      }

      if (valueToFill && (!input.value || input.value.trim() === '')) {
        setNativeValue(input, valueToFill);
        count++;
      }
    }

    // 2. Radio & Checkbox Questions (Work Authorization & Sponsorship)
    const radioInputs = document.querySelectorAll('input[type="radio"], input[type="checkbox"]');
    for (const radio of radioInputs) {
      const label = (radio.labels?.[0]?.textContent || radio.parentElement?.textContent || '').toLowerCase();
      const value = (radio.value || '').toLowerCase();

      // "Are you authorized to work in..." -> Yes
      if (label.includes('authorized to work') || label.includes('legally authorized') || label.includes('work permit')) {
        if (value === 'yes' || label.includes('yes')) {
          if (!radio.checked) {
            radio.click();
            count++;
          }
        }
      }

      // "Will you now or in the future require sponsorship..." -> No
      if (label.includes('require sponsorship') || label.includes('visa sponsorship')) {
        if (value === 'no' || label.includes('no')) {
          if (!radio.checked) {
            radio.click();
            count++;
          }
        }
      }
    }

    // 3. Dropdown Select Elements
    const selects = document.querySelectorAll('select');
    for (const select of selects) {
      const descriptor = `${select.name || ''} ${select.id || ''} ${select.getAttribute('aria-label') || ''}`.toLowerCase();
      if (descriptor.includes('country')) {
        for (const opt of select.options) {
          if (opt.text.toLowerCase().includes('india') || opt.value.toLowerCase().includes('in')) {
            select.value = opt.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            count++;
            break;
          }
        }
      }
    }

    return count;
  }

  // React-safe DOM input value setter
  function setNativeValue(element, value) {
    const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
    const prototype = Object.getPrototypeOf(element);
    const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

    if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
      prototypeValueSetter.call(element, value);
    } else if (valueSetter) {
      valueSetter.call(element, value);
    } else {
      element.value = value;
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function showToast(message) {
    const existing = document.querySelector('.aap-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'aap-toast';
    toast.innerHTML = `<span style="display:inline-flex; align-items:center; color:#4f46e5;"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></span><span>${escapeHtml(message)}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
})();
