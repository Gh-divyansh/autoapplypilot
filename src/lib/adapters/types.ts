export type ApplicationMode = 'AUTOMATIC' | 'ASSISTED';

export interface JobSearchQuery {
  keywords: string[];
  location?: string;
  targetCountry?: string;
  targetLocations?: string[];
  preferredWorkplace?: 'REMOTE' | 'ON_SITE' | 'HYBRID' | 'ANY';
  remoteOnly?: boolean;
}

export interface NormalizedJob {
  externalId: string;
  sourceProvider: string;
  title: string;
  company: string;
  location: string | null;
  workplaceType?: 'REMOTE' | 'ON_SITE' | 'HYBRID';
  description: string;
  externalUrl: string;
  salaryRange?: string | null;
  applicationMode: ApplicationMode;
}

export interface JobProviderAdapter {
  providerId: string;
  fetchJobs(query: JobSearchQuery): Promise<NormalizedJob[]>;
  submitApplication?(
    job: NormalizedJob,
    candidate: { name: string; email: string; resumeUrl: string },
    assets: { coverLetter?: string; answers?: Record<string, any> }
  ): Promise<{ success: boolean; confirmationId?: string; error?: string }>;
}
