export interface ApplicationLogItem {
  id: string;
  step: string;
  details: string;
  createdAt: string;
}

export type ApplicationCRMStatus =
  | 'DISCOVERED'
  | 'QUEUED'
  | 'APPLIED'
  | 'NEEDS_REVIEW'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'FAILED';

export interface ApplicationItem {
  id: string;
  jobId?: string;
  title: string;
  company: string;
  platform: string;
  status: ApplicationCRMStatus;
  matchScore: number;
  salary?: string;
  location?: string;
  externalUrl?: string;
  appliedAt?: string;
  updatedAt?: string;
  notes?: string;
  logs: ApplicationLogItem[];
}

export const INITIAL_TRACKER_APPLICATIONS: ApplicationItem[] = [
  {
    id: 'app-1',
    title: 'Senior Systems Engineer — Distributed Cloud',
    company: 'Cloudflare',
    platform: 'greenhouse',
    status: 'APPLIED',
    matchScore: 94,
    salary: '₹35 - ₹48 LPA',
    location: 'Remote (India)',
    externalUrl: 'https://boards.greenhouse.io/cloudflare',
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    notes: 'Submitted via Direct ATS integration with tailored cover letter and profile kit.',
    logs: [
      {
        id: 'log-1',
        step: 'SUBMITTED',
        details: 'Submitted via Direct ATS integration.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
    ],
  },
  {
    id: 'app-2',
    title: 'Staff Full-Stack Engineer',
    company: 'Lever Tech',
    platform: 'lever',
    status: 'INTERVIEW',
    matchScore: 91,
    salary: '₹38 - ₹52 LPA',
    location: 'Bengaluru / Hybrid',
    externalUrl: 'https://jobs.lever.co/levertech',
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    notes: 'Recruiter phone screen completed; technical assessment scheduled for Thursday.',
    logs: [
      {
        id: 'log-2',
        step: 'INTERVIEW_SCHEDULED',
        details: 'Recruiter phone screen completed.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
      },
    ],
  },
  {
    id: 'app-3',
    title: 'Backend Platform Engineer',
    company: 'Razorpay',
    platform: 'greenhouse',
    status: 'NEEDS_REVIEW',
    matchScore: 88,
    salary: '₹28 - ₹38 LPA',
    location: 'Bengaluru / Remote',
    externalUrl: 'https://boards.greenhouse.io/razorpay',
    appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    notes: 'Received screening assessment link. Due in 48 hours.',
    logs: [
      {
        id: 'log-3',
        step: 'ASSESSMENT_RECEIVED',
        details: 'Screening test link sent to inbox.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      },
    ],
  },
  {
    id: 'app-4',
    title: 'Lead Software Architect',
    company: 'Postman',
    platform: 'lever',
    status: 'QUEUED',
    matchScore: 89,
    salary: '₹42 - ₹55 LPA',
    location: 'Remote (Worldwide)',
    externalUrl: 'https://jobs.lever.co/postman',
    appliedAt: undefined,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    notes: 'Queued for autonomous dispatch tonight.',
    logs: [
      {
        id: 'log-4',
        step: 'QUEUED',
        details: 'Role passed deterministic fit criteria (89% match).',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      },
    ],
  },
  {
    id: 'app-5',
    title: 'Senior Distributed Systems Engineer',
    company: 'Atlassian',
    platform: 'linkedin',
    status: 'DISCOVERED',
    matchScore: 85,
    salary: '₹36 - ₹46 LPA',
    location: 'Remote (India)',
    externalUrl: 'https://www.linkedin.com/jobs/view/123456',
    appliedAt: undefined,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    notes: 'High match found in daily crawl. Verified skills: TypeScript, Node.js, distributed databases.',
    logs: [
      {
        id: 'log-5',
        step: 'DISCOVERED',
        details: 'Matched via LinkedIn pipeline.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
    ],
  },
];

