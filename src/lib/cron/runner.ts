import { getAllAdapters } from '@/lib/adapters/registry';
import { prisma } from '@/lib/prisma';
import { scoreJobMatch } from '@/lib/ai/matcher';
import { detectWorkplaceType } from '@/lib/workplace-detector';

export interface PipelineRunResult {
  timestamp: string;
  success: boolean;
  discovery: {
    adaptersRun: string[];
    jobsDiscovered: number;
    jobsUpserted: number;
    jobs: Array<{
      id: string;
      title: string;
      company: string;
      workplaceType?: string;
      provider: string;
    }>;
    errors: string[];
  };
  scoring: {
    jobsScored: number;
    queuedCount: number;
    reviewCount: number;
    scores: Array<{
      jobId: string;
      title: string;
      company: string;
      score: number;
      status: string;
      matchLevel: string;
    }>;
    errors: string[];
  };
  durationMs: number;
}

export interface PipelineRunOptions {
  keywords?: string[];
  maxJobsToScore?: number;
  userId?: string;
  targetCountry?: string;
  targetLocations?: string[];
  preferredWorkplace?: 'REMOTE' | 'ON_SITE' | 'HYBRID' | 'ANY';
}

const DEFAULT_KEYWORDS = ['Engineer', 'Developer', 'Full Stack', 'Frontend', 'Backend'];

const CANONICAL_FALLBACK_PROFILE = {
  skills: [
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'PostgreSQL',
    'Tailwind CSS',
    'Docker',
    'REST APIs',
  ],
  workExperience: [
    {
      title: 'Senior Full Stack Engineer',
      company: 'TechCorp Solutions',
      duration: '2022 - Present',
      highlights: [
        'Architected high-scale web platforms on Next.js, Node.js, and PostgreSQL.',
      ],
    },
  ],
};

/**
 * Executes the autonomous pipeline:
 * 1. Loads candidate preferences (country, locations, roles, workplace mode).
 * 2. Discovers jobs across all compliant ATS and assisted providers matching candidate criteria.
 * 3. Ingests or updates job postings in the database.
 * 4. Evaluates unscored opportunities against verified candidate profiles.
 * 5. Queues high-confidence applications (>=80%) or routes to Needs Review.
 */
export async function runAutonomousPipeline(
  options?: PipelineRunOptions
): Promise<PipelineRunResult> {
  const startTime = Date.now();
  let keywords = options?.keywords || DEFAULT_KEYWORDS;
  const maxJobsToScore = options?.maxJobsToScore || 10;
  let targetCountry = options?.targetCountry;
  let targetLocations = options?.targetLocations;
  let preferredWorkplace = options?.preferredWorkplace;
  let excludedCompanies: string[] = [];
  let candidateSkills = CANONICAL_FALLBACK_PROFILE.skills;
  let candidateExperience = CANONICAL_FALLBACK_PROFILE.workExperience;
  let userId: string | null = options?.userId || null;

  // Retrieve candidate profile from database to drive search parameters
  if (process.env.DATABASE_URL) {
    try {
      const dbProfile = userId
        ? await prisma.candidateProfile.findUnique({ where: { userId } })
        : await prisma.candidateProfile.findFirst({ include: { user: true } });

      if (dbProfile) {
        if (!options?.keywords && dbProfile.targetJobTitles && dbProfile.targetJobTitles.length > 0) {
          keywords = dbProfile.targetJobTitles;
        }
        if (!targetCountry && dbProfile.targetCountry) {
          targetCountry = dbProfile.targetCountry;
        }
        if (!targetLocations && dbProfile.targetCities && dbProfile.targetCities.length > 0) {
          targetLocations = dbProfile.targetCities;
        }
        if (!preferredWorkplace && dbProfile.preferredWorkplace) {
          preferredWorkplace = dbProfile.preferredWorkplace as any;
        }
        if (dbProfile.excludedCompanies && dbProfile.excludedCompanies.length > 0) {
          excludedCompanies = dbProfile.excludedCompanies;
        }
        if (dbProfile.extractedSkills && dbProfile.extractedSkills.length > 0) {
          candidateSkills = dbProfile.extractedSkills;
        }
        if (dbProfile.workExperience) {
          candidateExperience = dbProfile.workExperience as any;
        }
        if (!userId) {
          userId = dbProfile.userId;
        }
      }
    } catch (profileErr) {
      // Fallback gracefully
    }
  }

  // Ensure default target country is India if none specified
  if (!targetCountry) {
    targetCountry = 'India';
  }

  const result: PipelineRunResult = {
    timestamp: new Date().toISOString(),
    success: true,
    discovery: {
      adaptersRun: [],
      jobsDiscovered: 0,
      jobsUpserted: 0,
      jobs: [],
      errors: [],
    },
    scoring: {
      jobsScored: 0,
      queuedCount: 0,
      reviewCount: 0,
      scores: [],
      errors: [],
    },
    durationMs: 0,
  };

  // 1. Discovery Phase
  const adapters = getAllAdapters();
  const allDiscoveredJobs: any[] = [];

  for (const adapter of adapters) {
    result.discovery.adaptersRun.push(adapter.providerId);
    try {
      const jobs = await adapter.fetchJobs({
        keywords,
        targetCountry,
        targetLocations,
        preferredWorkplace,
      });
      for (const job of jobs) {
        allDiscoveredJobs.push(job);
        result.discovery.jobs.push({
          id: job.externalId,
          title: job.title,
          company: job.company,
          workplaceType: job.workplaceType,
          provider: job.sourceProvider,
        });

        if (process.env.DATABASE_URL) {
          try {
            const detectedWorkplace =
              job.workplaceType ||
              detectWorkplaceType({
                title: job.title,
                location: job.location,
                description: job.description,
              });

            await prisma.jobPosting.upsert({
              where: {
                sourceProvider_externalId: {
                  sourceProvider: job.sourceProvider,
                  externalId: job.externalId,
                },
              },
              update: {
                title: job.title,
                company: job.company,
                location: job.location,
                workplaceType: detectedWorkplace,
                description: job.description,
                externalUrl: job.externalUrl,
                salaryRange: job.salaryRange,
                applicationMode: job.applicationMode as any,
              },
              create: {
                externalId: job.externalId,
                sourceProvider: job.sourceProvider,
                title: job.title,
                company: job.company,
                location: job.location,
                workplaceType: detectedWorkplace,
                description: job.description,
                externalUrl: job.externalUrl,
                salaryRange: job.salaryRange,
                applicationMode: job.applicationMode as any,
              },
            });
            result.discovery.jobsUpserted++;
          } catch (dbErr: any) {
            // Non-fatal fallback for uninitialized database
          }
        }
      }
    } catch (err: any) {
      result.discovery.errors.push(`Adapter ${adapter.providerId}: ${err?.message || 'Failed'}`);
    }
  }

  result.discovery.jobsDiscovered = allDiscoveredJobs.length;

  // 2. Scoring & Queue Processing Phase
  try {
    let candidateSkills = CANONICAL_FALLBACK_PROFILE.skills;
    let candidateExperience = CANONICAL_FALLBACK_PROFILE.workExperience;
    let userId: string | null = null;

    if (process.env.DATABASE_URL) {
      try {
        const dbProfile = await prisma.candidateProfile.findFirst({
          include: { user: true },
        });
        if (dbProfile) {
          candidateSkills = dbProfile.extractedSkills;
          candidateExperience = dbProfile.workExperience as any;
          userId = dbProfile.userId;
        }
      } catch (profileErr) {
        // Fallback to canonical profile
      }
    }

    // Determine jobs to score: unscored in DB, or discovered jobs in memory
    let jobsToScore: Array<{
      id: string;
      title: string;
      company: string;
      location?: string | null;
      description: string;
      applicationMode: 'AUTOMATIC' | 'ASSISTED';
    }> = [];

    if (process.env.DATABASE_URL) {
      try {
        const unscored = await prisma.jobPosting.findMany({
          where: {
            matchScores: {
              none: {},
            },
          },
          take: maxJobsToScore,
        });

        if (unscored.length > 0) {
          jobsToScore = unscored.map((j) => ({
            id: j.id,
            title: j.title,
            company: j.company,
            location: j.location,
            description: j.description,
            applicationMode: j.applicationMode as any,
          }));
        }
      } catch (err) {
        // Fallback to discovered
      }
    }

    if (jobsToScore.length === 0) {
      jobsToScore = allDiscoveredJobs.slice(0, maxJobsToScore).map((j, idx) => ({
        id: j.externalId || `job-${idx}`,
        title: j.title,
        company: j.company,
        location: j.location,
        description: j.description,
        applicationMode: j.applicationMode || 'AUTOMATIC',
      }));
    }

    for (const job of jobsToScore) {
      try {
        const matchResult = await scoreJobMatch(
          candidateSkills,
          candidateExperience,
          job.description,
          {
            targetRoles: keywords,
            excludedCompanies,
            targetCountry,
            preferredWorkplace,
          },
          {
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
          }
        );

        const status =
          matchResult.score >= 80
            ? 'QUEUED'
            : matchResult.score >= 60
            ? 'NEEDS_REVIEW'
            : 'SCORED';

        if (status === 'QUEUED') result.scoring.queuedCount++;
        if (status === 'NEEDS_REVIEW') result.scoring.reviewCount++;

        result.scoring.scores.push({
          jobId: job.id,
          title: job.title,
          company: job.company,
          score: matchResult.score,
          status,
          matchLevel: matchResult.matchLevel,
        });

        result.scoring.jobsScored++;

        if (process.env.DATABASE_URL && userId) {
          try {
            await prisma.jobMatchScore.create({
              data: {
                jobPostingId: job.id,
                score: matchResult.score,
                reasoning: matchResult.reasoning,
                matchedSkills: matchResult.matchedSkills,
                missingSkills: matchResult.missingSkills,
                matchLevel: matchResult.matchLevel as any,
              },
            });

            const application = await prisma.application.create({
              data: {
                userId,
                jobPostingId: job.id,
                status: status as any,
                mode: job.applicationMode,
              },
            });

            await prisma.applicationLog.create({
              data: {
                applicationId: application.id,
                step: 'PIPELINE_SCORED',
                details: `Autonomous pipeline scored ${matchResult.score}%. Transitioned to ${status}.`,
              },
            });
          } catch (scoreDbErr) {
            // Handled gracefully
          }
        }
      } catch (scoreErr: any) {
        result.scoring.errors.push(`Score failed for ${job.title}: ${scoreErr?.message}`);
      }
    }
  } catch (pipelineErr: any) {
    result.scoring.errors.push(`Scoring phase error: ${pipelineErr?.message}`);
    result.success = false;
  }

  result.durationMs = Date.now() - startTime;
  return result;
}

