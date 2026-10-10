/**
 * AutoApplyPilot Companion - Background Service Worker (Manifest V3)
 * Handles state synchronization, API communication with AutoApplyPilot portal, and message bus.
 */

const API_BASE_URL = 'http://localhost:3000';

// Handle extension install/startup
chrome.runtime.onInstalled.addListener(async () => {
  console.log('[AutoApplyPilot] Extension Companion initialized.');
  await syncCandidateProfile();
});

// Sync profile data from AutoApplyPilot backend
async function syncCandidateProfile() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/extension/sync`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      await chrome.storage.local.set({
        connected: true,
        lastSync: new Date().toISOString(),
        candidate: data.candidate,
        queuedJobs: data.queuedJobs || [],
        activeQueueCount: data.activeQueueCount || 0,
      });
      return { success: true, data };
    } else {
      await chrome.storage.local.set({ connected: false });
      return { success: false, error: 'Server returned non-200 status' };
    }
  } catch (err) {
    console.warn('[AutoApplyPilot] Portal API unreachable at localhost:3000:', err.message);
    await chrome.storage.local.set({ connected: false });
    return { success: false, error: err.message };
  }
}

// Log an application to AutoApplyPilot backend
async function logCompletedApplication(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/extension/log-application`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const { appliedCount = 0 } = await chrome.storage.local.get('appliedCount');
      await chrome.storage.local.set({ appliedCount: appliedCount + 1 });
      return { success: true };
    }
    return { success: false };
  } catch (err) {
    console.error('[AutoApplyPilot] Failed to log application to backend:', err);
    return { success: false, error: err.message };
  }
}

// Ingest a batch of extracted jobs into AutoApplyPilot backend
async function syncJobsBatch(jobs) {
  try {
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return { success: false, error: 'No jobs to sync' };
    }

    const res = await fetch(`${API_BASE_URL}/api/extension/sync-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobs }),
    });

    if (res.ok) {
      const data = await res.json();
      const current = await chrome.storage.local.get('syncedJobsCount');
      const count = (current.syncedJobsCount || 0) + (data.created || 0);
      await chrome.storage.local.set({
        syncedJobsCount: count,
        lastBatchSync: new Date().toISOString(),
      });
      return { success: true, data };
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, error: errData.error || 'Batch sync failed' };
  } catch (err) {
    console.error('[AutoApplyPilot] Failed to post batch jobs:', err);
    return { success: false, error: err.message };
  }
}

// Runtime message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    switch (message.type) {
      case 'SYNC_PROFILE': {
        const result = await syncCandidateProfile();
        sendResponse(result);
        break;
      }

      case 'SYNC_JOBS_BATCH': {
        const result = await syncJobsBatch(message.jobs);
        sendResponse(result);
        break;
      }

      case 'GET_PAGE_JOBS': {
        try {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (!tab || !tab.id) {
            sendResponse({ success: false, error: 'No active tab found' });
            break;
          }

          const response = await chrome.tabs.sendMessage(tab.id, { type: 'SCAN_CURRENT_PAGE' });
          sendResponse({ success: true, ...response });
        } catch (tabErr) {
          sendResponse({ success: false, error: tabErr.message });
        }
        break;
      }

      case 'GET_CANDIDATE_DATA': {
        let storage = await chrome.storage.local.get(['candidate', 'connected', 'queuedJobs']);
        if (!storage.candidate) {
          const syncResult = await syncCandidateProfile();
          if (syncResult.success) {
            storage = await chrome.storage.local.get(['candidate', 'connected', 'queuedJobs']);
          }
        }
        sendResponse({
          candidate: storage.candidate || null,
          connected: !!storage.connected,
          queuedJobs: storage.queuedJobs || [],
        });
        break;
      }

      case 'LOG_APPLICATION': {
        const result = await logCompletedApplication(message.payload);
        sendResponse(result);
        break;
      }

      default:
        sendResponse({ error: 'Unknown message type' });
    }
  })();

  return true; // Keeps async response channel open
});
