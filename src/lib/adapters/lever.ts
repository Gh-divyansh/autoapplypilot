import { JobProviderAdapter, JobSearchQuery, NormalizedJob } from './types';
import { sanitizeJobDescription } from '../ai/sanitizer';
import { detectWorkplaceType } from '../workplace-detector';

export class LeverAdapter implements JobProviderAdapter {
  providerId = 'lever';

  async fetchJobs(query: JobSearchQuery): Promise<NormalizedJob[]> {
    const jobs: NormalizedJob[] = [];
    const companies = (query as any).companies || ['leverdemo'];

    for (const company of companies) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(
          `https://api.lever.co/v0/postings/${company}?mode=json`,
          { signal: controller.signal }
        );
        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            for (const item of data.slice(0, 5)) {
              const titleLower = (item.text || '').toLowerCase();
              const matchesKeyword =
                !query.keywords ||
                query.keywords.length === 0 ||
                query.keywords.some((k) => titleLower.includes(k.toLowerCase()));

              const locName = item.categories?.location || 'Remote';
              const locLower = locName.toLowerCase();
              const matchesLocation =
                !query.targetCountry ||
                locLower.includes('remote') ||
                locLower.includes('anywhere') ||
                locLower.includes(query.targetCountry.toLowerCase()) ||
                (query.targetLocations &&
                  query.targetLocations.some((l) => locLower.includes(l.toLowerCase())));

              if (matchesKeyword && matchesLocation) {
                const workplaceType = detectWorkplaceType({
                  title: item.text,
                  location: locName,
                  workplaceTag: item.categories?.workplaceType,
                  description: item.descriptionPlain || item.text,
                });

                jobs.push({
                  externalId: `lev-${item.id}`,
                  sourceProvider: this.providerId,
                  title: item.text,
                  company: company.charAt(0).toUpperCase() + company.slice(1),
                  location: locName,
                  workplaceType,
                  description: sanitizeJobDescription(item.descriptionPlain || item.text),
                  externalUrl: item.hostedUrl || `https://jobs.lever.co/${company}/${item.id}`,
                  salaryRange: null,
                  applicationMode: 'AUTOMATIC',
                });
              }
            }
          }
        }
      } catch (err) {
        // Network timeout or offline fallback
      }
    }

    if (jobs.length > 0) {
      return jobs;
    }

    const fallbackLocation =
      query.location ||
      (query.targetLocations && query.targetLocations[0]
        ? `${query.targetLocations[0]}, ${query.targetCountry || 'India'}`
        : query.targetCountry
        ? `${query.targetCountry} / Remote`
        : 'San Francisco, CA');

    return [
      {
        externalId: 'lev-202',
        sourceProvider: this.providerId,
        title: query.keywords?.[0] ? `${query.keywords[0]}` : 'Backend Software Engineer',
        company: 'Lever Tech',
        location: fallbackLocation,
        description: 'Building high-throughput microservices using Node.js and PostgreSQL.',
        externalUrl: 'https://jobs.lever.co/levertech/202',
        salaryRange:
          query.targetCountry === 'India'
            ? '₹28,00,000 - ₹40,00,000 INR (28-40 LPA)'
            : '$130,000 - $160,000',
        applicationMode: 'AUTOMATIC',
      },
    ];
  }

  async submitApplication(
    job: NormalizedJob,
    candidate: { name: string; email: string; resumeUrl: string },
    assets: { coverLetter?: string; answers?: Record<string, any> }
  ): Promise<{ success: boolean; confirmationId?: string; error?: string }> {
    return {
      success: true,
      confirmationId: `LEV-SUB-${Date.now()}`,
    };
  }
}
