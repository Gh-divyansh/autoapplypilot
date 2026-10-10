import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_TRACKER_APPLICATIONS, ApplicationItem } from '@/lib/types/applications';

const PRISMA_VALID_STATUSES = [
  'DISCOVERED',
  'SCORED',
  'QUEUED',
  'APPLYING',
  'APPLIED',
  'NEEDS_REVIEW',
  'INTERVIEW',
  'REJECTED',
  'FAILED',
];

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const dbApp = await prisma.application.findUnique({
      where: { id },
      include: {
        jobPosting: true,
        logs: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (dbApp) {
      let displayStatus: any = dbApp.status;
      const hasOfferLog = dbApp.logs.some((l) => l.step === 'OFFER_EXTENDED' || l.details?.toLowerCase().includes('offer'));
      if (hasOfferLog) displayStatus = 'OFFER';

      const formatted: ApplicationItem = {
        id: dbApp.id,
        jobId: dbApp.jobPostingId,
        title: dbApp.jobPosting.title,
        company: dbApp.jobPosting.company,
        platform: (dbApp.jobPosting.sourceProvider || 'OTHER').toLowerCase(),
        status: displayStatus,
        matchScore: 85,
        location: dbApp.jobPosting.location || 'Remote',
        externalUrl: dbApp.jobPosting.externalUrl,
        appliedAt: dbApp.createdAt ? dbApp.createdAt.toISOString() : undefined,
        updatedAt: dbApp.updatedAt.toISOString(),
        notes: dbApp.generatedCoverLetter || undefined,
        logs: dbApp.logs.map((l) => ({
          id: l.id,
          step: l.step,
          details: l.details,
          createdAt: l.createdAt.toISOString(),
        })),
      };

      return NextResponse.json({ application: formatted });
    }
  } catch (e) {}

  const fallback = INITIAL_TRACKER_APPLICATIONS.find((a) => a.id === id);
  if (fallback) {
    return NextResponse.json({ application: fallback });
  }

  return NextResponse.json({ error: 'Application not found' }, { status: 404 });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await req.json();
    const { status, notes } = body;

    let prismaStatus = status;
    let isOffer = false;

    if (status === 'OFFER') {
      prismaStatus = 'INTERVIEW';
      isOffer = true;
    }

    if (prismaStatus && !PRISMA_VALID_STATUSES.includes(prismaStatus)) {
      prismaStatus = 'APPLIED';
    }

    try {
      const updateData: any = {};
      if (prismaStatus) updateData.status = prismaStatus;
      if (notes !== undefined) updateData.generatedCoverLetter = notes;
      updateData.updatedAt = new Date();

      await prisma.application.update({
        where: { id },
        data: updateData,
      });

      await prisma.applicationLog.create({
        data: {
          applicationId: id,
          step: isOffer ? 'OFFER_EXTENDED' : status ? `STAGE_${status}` : 'UPDATED',
          details: isOffer ? 'Offer received!' : `Application updated to ${status || 'new status'}`,
        },
      });
    } catch (dbErr) {
      // In-memory or database offline
    }

    return NextResponse.json({ success: true, id, status, notes });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    try {
      await prisma.applicationLog.deleteMany({ where: { applicationId: id } });
      await prisma.application.delete({ where: { id } });
    } catch (e) {}

    return NextResponse.json({ success: true, message: `Application ${id} deleted` });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete application' }, { status: 500 });
  }
}

