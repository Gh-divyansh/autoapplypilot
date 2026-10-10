/**
 * AutoApplyPilot Companion - DOM Job Scanners
 * Extracts live job cards from active search results on LinkedIn, Naukri, Indeed, Instahyre, and Wellfound.
 */

window.AutoApplyPilotScanners = (function () {
  function detectPlatform() {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('linkedin.com')) return 'linkedin';
    if (host.includes('naukri.com')) return 'naukri';
    if (host.includes('indeed.com')) return 'indeed';
    if (host.includes('instahyre.com')) return 'instahyre';
    if (host.includes('wellfound.com') || host.includes('angel.co')) return 'wellfound';
    return null;
  }

  function cleanText(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
  }

  function detectWorkplace(title = '', location = '', desc = '', tag = '') {
    const text = `${title} ${location} ${desc} ${tag}`.toLowerCase();
    if (/\b(?:not\s+remote|no\s+remote|non-remote|on-site\s+only|work\s+from\s+office\s+only)\b/i.test(text)) {
      return 'ON_SITE';
    }
    if (/\b(?:hybrid|part[- ]remote|partially\s+remote)\b/i.test(text)) {
      return 'HYBRID';
    }
    if (/\b(?:on-site|onsite|in-office|office-based|work\s+from\s+office|wfo)\b/i.test(text)) {
      return 'ON_SITE';
    }
    if (
      /\b(?:remote|wfh|work\s+from\s+home|telecommute|virtual|anywhere)\b/i.test(location.toLowerCase()) ||
      /\b(?:remote|wfh|work\s+from\s+home)\b/i.test(title.toLowerCase()) ||
      /\b(?:100%\s+remote|fully\s+remote|work\s+from\s+home)\b/i.test(desc.toLowerCase())
    ) {
      return 'REMOTE';
    }
    return 'ON_SITE';
  }

  // 1. LinkedIn Search Scanner
  function scanLinkedIn() {
    const jobs = [];
    const selectors = [
      '.jobs-search-results-list__list-item',
      '.job-card-container',
      '.scaffold-layout__list-item',
      '.jobs-search-two-pane__job-card-container',
      'li.jobs-search-results__list-item',
    ];

    const cards = document.querySelectorAll(selectors.join(', '));
    const seenIds = new Set();

    cards.forEach((card) => {
      try {
        let externalId =
          card.getAttribute('data-job-id') ||
          card.getAttribute('data-occludable-job-id');

        const titleEl = card.querySelector(
          '.job-card-list__title, .artdeco-entity-lockup__title a, a[data-control-name="job_card_title"], .job-card-container__link'
        );
        const title = cleanText(titleEl ? titleEl.innerText : '');

        const companyEl = card.querySelector(
          '.job-card-container__primary-description, .artdeco-entity-lockup__subtitle, .job-card-container__company-name'
        );
        const company = cleanText(companyEl ? companyEl.innerText : '');

        const locationEl = card.querySelector(
          '.job-card-container__metadata-item, .artdeco-entity-lockup__caption, .job-card-container__metadata-wrapper'
        );
        const location = cleanText(locationEl ? locationEl.innerText : 'Remote');

        let externalUrl = '';
        if (titleEl && titleEl.href) {
          externalUrl = titleEl.href.split('?')[0];
        }

        if (!externalId && externalUrl) {
          const match = externalUrl.match(/currentJobId=(\d+)|view\/(\d+)/);
          if (match) externalId = match[1] || match[2];
        }

        if (!externalId && title && company) {
          externalId = `li-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${company.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        }

        if (externalId && !seenIds.has(externalId) && title && company) {
          seenIds.add(externalId);

          const isEasyApply =
            card.querySelector(
              '.job-card-container__apply-method, [aria-label*="Easy Apply"], [aria-label*="easy apply"], .job-card-list__easy-apply'
            ) !== null;

          const workplaceType = detectWorkplace(title, location, `${title} at ${company}`);

          jobs.push({
            externalId: String(externalId),
            sourceProvider: 'linkedin',
            title,
            company,
            location,
            workplaceType,
            externalUrl: externalUrl || `https://www.linkedin.com/jobs/view/${externalId}/`,
            salaryRange: null,
            applicationMode: isEasyApply ? 'AUTOMATIC' : 'ASSISTED',
            description: `${title} at ${company} in ${location}. Discovered from live LinkedIn session.`,
          });
        }
      } catch (err) {
        // Continue processing other cards
      }
    });

    return jobs;
  }

  // 2. Naukri.com Search Scanner
  function scanNaukri() {
    const jobs = [];
    const cards = document.querySelectorAll(
      'article.jobTuple, .srp-jobtuple-wrapper, .cust-job-tuple, div.srp-jobtuple-wrapper'
    );
    const seenIds = new Set();

    cards.forEach((card) => {
      try {
        let externalId = card.getAttribute('data-job-id');

        const titleEl = card.querySelector('a.title, .title, [class*="title"] a');
        const title = cleanText(titleEl ? titleEl.innerText : '');

        const companyEl = card.querySelector('a.comp-name, .comp-name, .subTitle');
        const company = cleanText(companyEl ? companyEl.innerText : '');

        const locEl = card.querySelector('.loc-wrap, .location, span.loc, [class*="locWdn"]');
        const location = cleanText(locEl ? locEl.innerText : 'India');

        const salEl = card.querySelector('.sal-wrap, .salary, span.sal, [class*="salWdn"]');
        const salaryRange = cleanText(salEl ? salEl.innerText : null);

        const expEl = card.querySelector('.exp-wrap, .experience, span.exp, [class*="expWdn"]');
        const experience = cleanText(expEl ? expEl.innerText : '');

        const descEl = card.querySelector('.job-desc, .ellipsis, .job-description');
        const descSnippet = cleanText(descEl ? descEl.innerText : '');

        let externalUrl = titleEl && titleEl.href ? titleEl.href : '';
        if (externalUrl && externalUrl.includes('?')) {
          externalUrl = externalUrl.split('?')[0];
        }

        if (!externalId && externalUrl) {
          const match = externalUrl.match(/job-listings-.*?(\d{8,})/);
          if (match) externalId = match[1];
        }

        if (!externalId && title && company) {
          externalId = `nk-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${company.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        }

        if (externalId && !seenIds.has(externalId) && title && company) {
          seenIds.add(externalId);

          const locLower = location.toLowerCase();
          let workplace = 'ON_SITE';
          if (locLower.includes('remote') || locLower.includes('wfh')) workplace = 'REMOTE';
          else if (locLower.includes('hybrid')) workplace = 'HYBRID';

          jobs.push({
            externalId: String(externalId),
            sourceProvider: 'naukri',
            title,
            company,
            location,
            workplaceType: workplace,
            externalUrl: externalUrl || window.location.href,
            salaryRange: salaryRange && !salaryRange.includes('Not Disclosed') ? salaryRange : null,
            applicationMode: 'ASSISTED',
            description: `${title} at ${company}. Experience: ${experience}. Location: ${location}. ${descSnippet}`,
          });
        }
      } catch (e) {}
    });

    return jobs;
  }

  // 3. Indeed Search Scanner
  function scanIndeed() {
    const jobs = [];
    const cards = document.querySelectorAll(
      'div.job_seen_beacon, td.resultContent, div.cardOutline, div.slider_item'
    );
    const seenIds = new Set();

    cards.forEach((card) => {
      try {
        const parent = card.closest('[data-jk]') || card;
        let externalId = parent.getAttribute('data-jk');

        const titleEl = card.querySelector(
          'h2.jobTitle span[title], h2.jobTitle a, .jcs-JobTitle'
        );
        const title = cleanText(titleEl ? titleEl.innerText : '');

        const compEl = card.querySelector('[data-testid="company-name"], .companyName');
        const company = cleanText(compEl ? compEl.innerText : '');

        const locEl = card.querySelector('[data-testid="text-location"], .companyLocation');
        const location = cleanText(locEl ? locEl.innerText : 'Remote');

        const salEl = card.querySelector('.metadata.salary-snippet-container, .salary-snippet');
        const salaryRange = cleanText(salEl ? salEl.innerText : null);

        let externalUrl = '';
        if (titleEl && titleEl.closest('a')) {
          externalUrl = titleEl.closest('a').href;
        }

        if (externalId) {
          externalUrl = `https://www.indeed.com/viewjob?jk=${externalId}`;
        }

        if (externalId && !seenIds.has(externalId) && title && company) {
          seenIds.add(externalId);
          const workplaceType = detectWorkplace(title, location, `${title} at ${company}`);

          jobs.push({
            externalId: String(externalId),
            sourceProvider: 'indeed',
            title,
            company,
            location,
            workplaceType,
            externalUrl,
            salaryRange,
            applicationMode: 'ASSISTED',
            description: `${title} at ${company} in ${location}. Sourced from live Indeed search.`,
          });
        }
      } catch (e) {}
    });

    return jobs;
  }

  // 4. Instahyre Scanner
  function scanInstahyre() {
    const jobs = [];
    const cards = document.querySelectorAll(
      '.opportunity-card, .candidate-opportunity-card, .employer-row'
    );
    const seenIds = new Set();

    cards.forEach((card) => {
      try {
        const titleEl = card.querySelector('.opportunity-title, .job-title, h3 a');
        const title = cleanText(titleEl ? titleEl.innerText : '');

        const compEl = card.querySelector('.company-name, .employer-name, h4');
        const company = cleanText(compEl ? compEl.innerText : '');

        const locEl = card.querySelector('.opportunity-location, .locations, .job-location');
        const location = cleanText(locEl ? locEl.innerText : 'India (Remote-Friendly)');

        const salEl = card.querySelector('.salary-range, .compensation, .ctc');
        const salaryRange = cleanText(salEl ? salEl.innerText : null);

        let externalUrl = titleEl && titleEl.href ? titleEl.href : window.location.href;
        let externalId = card.getAttribute('data-id') || `inst-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

        if (title && company && !seenIds.has(externalId)) {
          seenIds.add(externalId);
          const workplaceType = detectWorkplace(title, location, `${title} at ${company}`);
          jobs.push({
            externalId,
            sourceProvider: 'instahyre',
            title,
            company,
            location,
            workplaceType,
            externalUrl,
            salaryRange,
            applicationMode: 'ASSISTED',
            description: `${title} at ${company} in ${location}. Discovered from Instahyre dashboard.`,
          });
        }
      } catch (e) {}
    });

    return jobs;
  }

  // 5. Wellfound (AngelList) Scanner
  function scanWellfound() {
    const jobs = [];
    const cards = document.querySelectorAll(
      '[data-test="JobSearchResult"], div[class*="styles_jobListing__"], div[class*="styles_component__"]'
    );
    const seenIds = new Set();

    cards.forEach((card) => {
      try {
        const titleEl = card.querySelector('a[href*="/jobs/"], [data-test="JobListingTitle"]');
        const title = cleanText(titleEl ? titleEl.innerText : '');

        const compEl = card.querySelector('h2, [data-test="StartupName"]');
        const company = cleanText(compEl ? compEl.innerText : '');

        const locEl = card.querySelector('[data-test="JobLocation"]');
        const location = cleanText(locEl ? locEl.innerText : 'Worldwide Remote');

        const compRangeEl = card.querySelector('[data-test="JobCompensation"]');
        const salaryRange = cleanText(compRangeEl ? compRangeEl.innerText : null);

        let externalUrl = titleEl && titleEl.href ? titleEl.href : window.location.href;
        let externalId = `wf-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

        if (title && company && !seenIds.has(externalId)) {
          seenIds.add(externalId);
          const workplaceType = detectWorkplace(title, location, `${title} at ${company}`);
          jobs.push({
            externalId,
            sourceProvider: 'wellfound',
            title,
            company,
            location,
            workplaceType,
            externalUrl,
            salaryRange,
            applicationMode: 'ASSISTED',
            description: `${title} at ${company}. Discovered on Wellfound startup board.`,
          });
        }
      } catch (e) {}
    });

    return jobs;
  }

  return {
    detectPlatform,
    scanLinkedIn,
    scanNaukri,
    scanIndeed,
    scanInstahyre,
    scanWellfound,
    scanCurrentPage: function () {
      const platform = detectPlatform();
      if (platform === 'linkedin') return scanLinkedIn();
      if (platform === 'naukri') return scanNaukri();
      if (platform === 'indeed') return scanIndeed();
      if (platform === 'instahyre') return scanInstahyre();
      if (platform === 'wellfound') return scanWellfound();
      return [];
    },
  };
})();

