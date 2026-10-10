import { JobProviderAdapter, JobSearchQuery, NormalizedJob } from './types';
import { detectWorkplaceType } from '../workplace-detector';

export class LinkedInAssistedAdapter implements JobProviderAdapter {
  providerId = 'linkedin';

  async fetchJobs(query: JobSearchQuery): Promise<NormalizedJob[]> {
    const jobs: NormalizedJob[] = [];
    const role = query.keywords?.[0] || 'Full Stack Developer';
    const country = query.targetCountry || 'India';
    const location = query.targetLocations?.[0] ? `${query.targetLocations[0]}, ${country}` : country;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4500);

      const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}&start=0`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const html = await res.text();
        const cardRegex = /<li[\s\S]*?<\/li>/gi;
        const cards = html.match(cardRegex) || [];
        const seenIds = new Set<string>();

        for (const card of cards.slice(0, 15)) {
          const urnMatch = card.match(/urn:li:jobPosting:(\d+)/);
          const titleMatch = card.match(/<h3[^>]*class="[^"]*base-search-card__title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i);
          const compMatch = card.match(/<h4[^>]*class="[^"]*base-search-card__subtitle[^"]*"[^>]*>([\s\S]*?)<\/h4>/i);
          const locMatch = card.match(/<span[^>]*class="[^"]*job-search-card__location[^"]*"[^>]*>([\s\S]*?)<\/span>/i);

          if (urnMatch && titleMatch) {
            const externalId = urnMatch[1];
            if (seenIds.has(externalId)) continue;
            seenIds.add(externalId);

            const title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
            const company = compMatch ? compMatch[1].replace(/<[^>]+>/g, '').trim() : 'Hiring Organization';
            const locName = locMatch ? locMatch[1].replace(/<[^>]+>/g, '').trim() : location;
            const workplaceType = detectWorkplaceType({
              title,
              location: locName,
              description: `${title} at ${company} in ${locName}`,
            });

            jobs.push({
              externalId: `li-${externalId}`,
              sourceProvider: this.providerId,
              title,
              company,
              location: locName,
              workplaceType,
              description: `${title} at ${company} in ${locName}. Sourced from live LinkedIn postings.`,
              externalUrl: `https://www.linkedin.com/jobs/view/${externalId}/`,
              salaryRange: null,
              applicationMode: 'ASSISTED',
            });
          }
        }
      }
    } catch (err) {
      // Graceful network or rate limit fallback
    }

    return jobs;
  }

  async submitApplication(): Promise<{ success: boolean; confirmationId?: string; error?: string }> {
    return {
      success: false,
      error: 'Direct automation is disabled for LinkedIn per platform compliance policy. Please use Assisted Mode with your prefilled kit.',
    };
  }
}

export class IndeedAssistedAdapter implements JobProviderAdapter {
  providerId = 'indeed';

  async fetchJobs(_query: JobSearchQuery): Promise<NormalizedJob[]> {
    // Indeed requires candidate browser context or official partner API.
    // Live jobs are dynamically synced when candidate views jobs via the AutoApplyPilot Chrome Extension companion.
    return [];
  }

  async submitApplication(): Promise<{ success: boolean; confirmationId?: string; error?: string }> {
    return {
      success: false,
      error: 'Direct automation is disabled for Indeed without partner API authorization. Please use Assisted Mode.',
    };
  }
}
