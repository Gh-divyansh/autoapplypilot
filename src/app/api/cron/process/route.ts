import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scoreJobMatch } from '@/lib/ai/matcher';
import { getSessionFromRequest } from '@/lib/auth/auth';

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

    // 3. Localhost development environment check
    const isDevAuthorized = !isTest && process.env.NODE_ENV === 'development';

    if (!isSecretAuthorized && !isUserAuthorized && !isDevAuthorized) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  let processedCount = 0;

  if (process.env.DATABASE_URL) {
    try {
      const profile = await prisma.candidateProfile.findFirst({
        include: { user: true },
      });

      if (profile) {
        const jobs = await prisma.jobPosting.findMany({
          where: {
            matchScores: {
              none: {},
            },
          },
          take: 5,
        });

        for (const job of jobs) {
          const matchResult = await scoreJobMatch(
            profile.extractedSkills,
            profile.workExperience,
            job.description,
            {
              targetRoles: profile.targetJobTitles,
              targetCountry: profile.targetCountry || undefined,
              preferredWorkplace: profile.preferredWorkplace as any,
              excludedCompanies: profile.excludedCompanies,
              remoteOnly: profile.preferredWorkplace === 'REMOTE' || (profile.preVerifiedAnswers as any)?.remotePreference === 'Remote Only',
            },
            {
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
            }
          );

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

          const initialStatus = matchResult.score >= 70 ? 'QUEUED' : 'SCORED';
          const application = await prisma.application.create({
            data: {
              userId: profile.userId,
              jobPostingId: job.id,
              status: initialStatus as any,
              mode: job.applicationMode,
            },
          });

          await prisma.applicationLog.create({
            data: {
              applicationId: application.id,
              step: 'AI_SCORED',
              details: `Scored ${matchResult.score}%. Recommendation ${matchResult.matchLevel}.`,
            },
          });

          processedCount++;
        }
      }
    } catch (err) {
      // Fallback
    }
  }

  return NextResponse.json({
    status: 'success',
    processedCount,
    message: 'Queue processed',
  });
}
