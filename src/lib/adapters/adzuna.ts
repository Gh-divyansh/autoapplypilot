import { JobProviderAdapter, JobSearchQuery, NormalizedJob } from './types';
import { detectWorkplaceType } from '../workplace-detector';

export class AdzunaAdapter implements JobProviderAdapter {
  providerId = 'adzuna';

  async fetchJobs(query: JobSearchQuery): Promise<NormalizedJob[]> {
    let appId = process.env.ADZUNA_APP_ID;
    let appKey = process.env.ADZUNA_APP_KEY;

    // Check .env dynamically in case server was started before env variables were populated
    if (!appId || !appKey) {
      try {
        const fs = require('fs');
        const path = require('path');
        const envPath = path.resolve(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf-8');
          content.split('\n').forEach((line: string) => {
            const [k, ...v] = line.split('=');
            if (k?.trim() === 'ADZUNA_APP_ID') appId = v.join('=').trim().replace(/^["']|["']$/g, '');
            if (k?.trim() === 'ADZUNA_APP_KEY') appKey = v.join('=').trim().replace(/^["']|["']$/g, '');
          });
        }
      } catch {}
    }

    // Gracefully skip if user has not configured Adzuna API keys yet
    if (!appId || !appKey) {
      return [];
    }

    const jobs: NormalizedJob[] = [];
    const country = query.targetCountry?.toLowerCase() === 'india' ? 'in' : 'in';
    const role = encodeURIComponent(query.keywords?.[0] || 'Full Stack Developer');
    const location = encodeURIComponent(query.targetLocations?.[0] || 'India');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&what=${role}&where=${location}&results_per_page=20&content-type=application/json`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        const results = Array.isArray(data?.results) ? data.results : [];

        for (const item of results) {
          const cleanTitle = (item.title || '').replace(/<\/?[^>]+(>|$)/g, '').trim();
          const cleanDesc = (item.description || '').replace(/<\/?[^>]+(>|$)/g, '').trim();
          const cleanCompany = item.company?.display_name || 'Hiring Company';
          const locName = item.location?.display_name || 'India';
          const workplaceType = detectWorkplaceType({
            title: cleanTitle,
            location: locName,
            description: cleanDesc,
          });

          const salaryRange =
            item.salary_min && item.salary_max
              ? `₹${Math.round(item.salary_min).toLocaleString()} - ₹${Math.round(item.salary_max).toLocaleString()}`
              : null;

          jobs.push({
            externalId: `adz-${item.id}`,
            sourceProvider: this.providerId,
            title: cleanTitle,
            company: cleanCompany,
            location: locName,
            workplaceType,
            description: cleanDesc,
            externalUrl: item.redirect_url,
            salaryRange,
            applicationMode: 'ASSISTED',
          });
        }
      }
    } catch (err) {
      // Graceful timeout or API error
    }

    return jobs;
  }

  async submitApplication(): Promise<{ success: boolean; confirmationId?: string; error?: string }> {
    return {
      success: false,
      error: 'Adzuna postings are applied directly on the employer site or via the Assisted Application Kit.',
    };
  }
}

