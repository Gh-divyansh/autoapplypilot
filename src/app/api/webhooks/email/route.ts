import { NextRequest, NextResponse } from 'next/server';
import { classifyRecruiterEmail } from '@/lib/email/classifier';
import { sendNotification } from '@/lib/email/notifier';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subject = '', from = '', body: emailBody = '' } = body;

    if (!subject && !emailBody) {
      return NextResponse.json({ error: 'Subject or body required' }, { status: 400 });
    }

    // 1. Run AI classification
    const classification = await classifyRecruiterEmail({
      subject,
      from,
      body: emailBody,
    });

    let matchedApplicationId: string | null = null;
    let newStatus: string | null = null;

    if (classification.classification === 'INTERVIEW') {
      newStatus = 'INTERVIEW';
    } else if (classification.classification === 'REJECTION') {
      newStatus = 'REJECTED';
    } else if (classification.classification === 'TECHNICAL_ASSESSMENT') {
      newStatus = 'NEEDS_REVIEW';
    }

    // 2. Look for matching application in database
    if (process.env.DATABASE_URL && newStatus) {
      try {
        const app = await prisma.application.findFirst({
          where: {
            jobPosting: {
              company: {
                contains: classification.companyDetected,
                mode: 'insensitive',
              },
            },
          },
        });

        if (app) {
          matchedApplicationId = app.id;
          await prisma.application.update({
            where: { id: app.id },
            data: { status: newStatus as any },
          });

          await prisma.applicationLog.create({
            data: {
              applicationId: app.id,
              step: 'EMAIL_CLASSIFIED',
              details: `Incoming email classified as ${classification.classification}: ${classification.summary}`,
            },
          });
        }
      } catch (dbErr) {
        // Fallback
      }
    }

    // 3. Dispatch user notification
    if (classification.classification === 'INTERVIEW') {
      await sendNotification({
        to: 'candidate@autoapplypilot.dev',
        type: 'INTERVIEW_INVITE',
        title: `Interview Invitation: ${classification.companyDetected}`,
        body: `A recruiter from ${classification.companyDetected} has reached out to schedule an interview! Action: ${classification.keyActionRequired}`,
      });
    }

    return NextResponse.json({
      status: 'success',
      classification,
      matchedApplicationId,
      newStatus,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process email webhook' },
      { status: 500 }
    );
  }
}
