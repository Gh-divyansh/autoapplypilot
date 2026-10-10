import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ApplicationItem, INITIAL_TRACKER_APPLICATIONS } from '@/lib/types/applications';

// Persistent in-memory fallback store
let inMemoryStore: ApplicationItem[] = [...INITIAL_TRACKER_APPLICATIONS];

export async function GET() {
  try {
    const dbApps = await prisma.application.findMany({
      include: {
        jobPosting: true,
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (dbApps && dbApps.length > 0) {
      const formatted: ApplicationItem[] = dbApps.map((a) => {
        let displayStatus: any = a.status;
        // Check if logs indicate OFFER
        const hasOfferLog = a.logs.some((l) => l.step === 'OFFER_EXTENDED' || l.details?.toLowerCase().includes('offer'));
        if (hasOfferLog) {
          displayStatus = 'OFFER';
        }

        return {
          id: a.id,
          jobId: a.jobPostingId,
          title: a.jobPosting.title,
          company: a.jobPosting.company,
          platform: (a.jobPosting.sourceProvider || 'OTHER').toLowerCase(),
          status: displayStatus,
          matchScore: 85,
          salary: undefined,
          location: a.jobPosting.location || 'Remote',
          externalUrl: a.jobPosting.externalUrl,
          appliedAt: a.createdAt ? a.createdAt.toISOString() : undefined,
          updatedAt: a.updatedAt.toISOString(),
          notes: a.generatedCoverLetter || undefined,
          logs: a.logs.map((l) => ({
            id: l.id,
            step: l.step,
            details: l.details,
            createdAt: l.createdAt.toISOString(),
          })),
        };
      });

      return NextResponse.json({ applications: formatted });
    }
  } catch (err) {
    // Graceful fallback to in-memory store
  }

  return NextResponse.json({ applications: inMemoryStore });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, company, platform, status, matchScore, salary, location, externalUrl, notes } = body;

    if (!title || !company) {
      return NextResponse.json({ error: 'Title and company are required' }, { status: 400 });
    }

    const newApp: ApplicationItem = {
      id: `app-${Date.now()}`,
      title: title.trim(),
      company: company.trim(),
      platform: (platform || 'linkedin').toLowerCase(),
      status: status || 'DISCOVERED',
      matchScore: Number(matchScore) || 85,
      salary: salary ? salary.trim() : undefined,
      location: location ? location.trim() : 'Remote',
      externalUrl: externalUrl ? externalUrl.trim() : undefined,
      notes: notes ? notes.trim() : undefined,
      appliedAt: status === 'APPLIED' ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
      logs: [
        {
          id: `log-${Date.now()}`,
          step: 'CREATED',
          details: `Application added manually to tracker (${status || 'DISCOVERED'}).`,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    inMemoryStore.unshift(newApp);

    return NextResponse.json({ success: true, application: newApp }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to create application' }, { status: 500 });
  }
}

