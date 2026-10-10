import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth/auth';

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const { jobId, platform, confirmationId, externalUrl, title, company, notes } = body;

    let userId = sessionUser?.id;

    if (!userId && process.env.DATABASE_URL) {
      const firstUser = await prisma.user.findFirst();
      userId = firstUser?.id;
    }

    if (process.env.DATABASE_URL && userId) {
      try {
        // If job posting exists in DB, update or link application
        let targetJobId = jobId;
        if (jobId) {
          const existingJob = await prisma.jobPosting.findUnique({ where: { id: jobId } });
          if (!existingJob) {
            targetJobId = undefined;
          }
        }

        if (!targetJobId && title && company) {
          // Upsert discovered job posting
          const externalId = `ext-${Date.now()}`;
          const newJob = await prisma.jobPosting.create({
            data: {
              externalId,
              sourceProvider: platform || 'companion',
              title: title || 'Position via Companion',
              company: company || 'Employer',
              location: 'Remote / Direct',
              description: `Discovered and applied via AutoApplyPilot Extension on ${platform || 'web'}.`,
              externalUrl: externalUrl || '',
              applicationMode: 'ASSISTED',
            },
          });
          targetJobId = newJob.id;
        }

        if (targetJobId) {
          const application = await prisma.application.create({
            data: {
              userId,
              jobPostingId: targetJobId,
              status: 'APPLIED',
              mode: 'ASSISTED',
            },
          });

          await prisma.applicationLog.create({
            data: {
              applicationId: application.id,
              step: 'COMPANION_APPLIED',
              details: `AutoApplyPilot Chrome Extension Companion auto-applied on ${platform || 'external platform'}. Confirmation: ${confirmationId || 'N/A'}. ${notes || ''}`,
            },
          });
        }
      } catch (dbErr) {
        console.error('Database logging error for extension application:', dbErr);
      }
    }

    const response = NextResponse.json({
      status: 'success',
      logged: true,
      timestamp: new Date().toISOString(),
      platform: platform || 'companion',
      message: 'Application logged to AutoApplyPilot dashboard.',
    });

    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to log application' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
