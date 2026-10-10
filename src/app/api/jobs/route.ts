import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveDirectJobUrl } from '@/lib/direct-job-url';
import { detectWorkplaceType } from '@/lib/workplace-detector';


export async function GET() {
  if (process.env.DATABASE_URL) {
    try {
      const dbJobs = await prisma.jobPosting.findMany({
        include: {
          matchScores: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          applications: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
      });

      if (dbJobs.length > 0) {
        const formatted = dbJobs.map((job) => {
          const latestScore = job.matchScores[0];
          const latestApp = job.applications[0];

          const directUrl = resolveDirectJobUrl({
            id: job.id,
            externalId: job.externalId,
            title: job.title,
            company: job.company,
            location: job.location,
            sourceProvider: job.sourceProvider,
            externalUrl: job.externalUrl,
          });

          const workplace =
            (job.workplaceType as any) ||
            detectWorkplaceType({
              title: job.title,
              location: job.location,
              description: job.description,
            });

          return {
            id: job.id,
            title: job.title,
            company: job.company,
            location: job.location || (workplace === 'REMOTE' ? 'Remote' : 'India'),
            workplaceType: workplace,
            sourceProvider: job.sourceProvider,
            score: latestScore?.score || 70,
            mode: job.applicationMode || 'AUTOMATIC',
            status: latestApp?.status || 'SCORED',
            matchedSkills: latestScore?.matchedSkills || ['TypeScript', 'Node.js'],
            missingSkills: latestScore?.missingSkills || [],
            externalUrl: directUrl,
          };
        });

        return NextResponse.json({
          status: 'success',
          source: 'database',
          jobs: formatted,
        });
      }
    } catch (err) {
      // Non-fatal error handling
    }
  }

  return NextResponse.json({
    status: 'success',
    source: 'dynamic',
    jobs: [],
  });
}
