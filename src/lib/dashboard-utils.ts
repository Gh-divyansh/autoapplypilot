import { JobCardProps } from '@/components/JobCard';

export const INITIAL_JOBS: JobCardProps[] = [];


export function detectJobPlatform(
  job: Partial<JobCardProps>
): 'greenhouse' | 'lever' | 'linkedin' | 'indeed' | 'naukri' | 'instahyre' | 'wellfound' | 'arbeitnow' | 'adzuna' | 'other' {
  if (job.sourceProvider) {
    const sp = job.sourceProvider.toLowerCase();
    if (sp.includes('greenhouse')) return 'greenhouse';
    if (sp.includes('lever')) return 'lever';
    if (sp.includes('linkedin')) return 'linkedin';
    if (sp.includes('indeed')) return 'indeed';
    if (sp.includes('naukri')) return 'naukri';
    if (sp.includes('instahyre')) return 'instahyre';
    if (sp.includes('wellfound')) return 'wellfound';
    if (sp.includes('arbeitnow')) return 'arbeitnow';
    if (sp.includes('adzuna')) return 'adzuna';
  }
  const url = (job.externalUrl || '').toLowerCase();
  const id = (job.id || '').toLowerCase();
  if (url.includes('greenhouse.io') || id.startsWith('gh-')) return 'greenhouse';
  if (url.includes('lever.co') || id.startsWith('lev-')) return 'lever';
  if (url.includes('linkedin.com') || id.startsWith('li-')) return 'linkedin';
  if (url.includes('indeed.com') || id.startsWith('ind-')) return 'indeed';
  if (url.includes('naukri.com') || id.startsWith('nk-')) return 'naukri';
  if (url.includes('instahyre.com') || id.startsWith('inst-')) return 'instahyre';
  if (url.includes('wellfound.com') || id.startsWith('wf-')) return 'wellfound';
  if (url.includes('arbeitnow.com') || id.startsWith('an-')) return 'arbeitnow';
  if (url.includes('adzuna.com') || id.startsWith('adz-')) return 'adzuna';
  return 'other';
}
