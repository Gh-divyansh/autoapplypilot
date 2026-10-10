import { NextResponse } from 'next/server';
import { getAllAdapters } from '@/lib/adapters/registry';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth/auth';
import { detectWorkplaceType } from '@/lib/workplace-detector';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cronSecret = process.env.CRON_SECRET;
  const isTest = process.env.NODE_ENV === 'test';

  if (cronSecret) {
    const authHeader = request.headers.get('authorization');
    const querySecret = searchParams.get('secret') || searchParams.get('key') || searchParams.get('cron_secret');

    // 1. Bearer token or URL secret check
    const isSecretAuthorized = authHeader === `Bearer ${cronSecret}` || querySecret === cronSecret;

    // 2. Logged-in web user session check
    let isUserAuthorized = false;
    if (!isTest) {
      try {
        const session = await getSessionFromRequest(request);
        if (session) isUserAuthorized = true;
      } catch {}
    }

    // 3. Localhost development environment or local host check
    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');
    const isDevAuthorized = !isTest && (process.env.NODE_ENV === 'development' || isLocalhost);

    if (!isSecretAuthorized && !isUserAuthorized && !isDevAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // Retrieve candidate preferences from URL query or database
  let keywords = searchParams.get('roles')?.split(',').map(s => s.trim()).filter(Boolean) || ['Engineer', 'Developer', 'Full Stack'];
  let targetCountry = searchParams.get('country') || 'India';
  let targetLocations: string[] = [];
  let preferredWorkplace: 'REMOTE' | 'ON_SITE' | 'HYBRID' | 'ANY' = 'ANY';

  if (process.env.DATABASE_URL) {
    try {
      const profile = await prisma.candidateProfile.findFirst();
      if (profile) {
        if (!searchParams.get('roles') && profile.targetJobTitles && profile.targetJobTitles.length > 0) {
          keywords = profile.targetJobTitles;
        }
        if (!searchParams.get('country') && profile.targetCountry) {
          targetCountry = profile.targetCountry;
        }
        if (profile.targetCities && profile.targetCities.length > 0) {
          targetLocations = profile.targetCities;
        }
        if (profile.preferredWorkplace) {
          preferredWorkplace = profile.preferredWorkplace as any;
        }
      }
    } catch {
      // Continue with defaults
    }
  }

  const adapters = getAllAdapters();
  const allDiscoveredJobs: any[] = [];
  let upsertedCount = 0;

  for (const adapter of adapters) {
    try {
      const jobs = await adapter.fetchJobs({
        keywords,
        targetCountry,
        targetLocations,
        preferredWorkplace,
      });
      for (const job of jobs) {
        allDiscoveredJobs.push(job);

        // Attempt upsert into database if connected
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
            upsertedCount++;
          } catch (dbErr) {
            // Graceful fallback
          }
        }
      }
    } catch (err) {
      // Continue to next adapter
    }
  }

  return NextResponse.json({
    status: 'success',
    discoveredCount: allDiscoveredJobs.length,
    upsertedCount,
    jobs: allDiscoveredJobs,
  });
}
