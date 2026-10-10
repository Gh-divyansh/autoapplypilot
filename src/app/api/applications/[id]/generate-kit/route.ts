import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth/auth';
import { generateCoverLetter } from '@/lib/ai/cover-letter';
import { answerScreeningQuestions } from '@/lib/ai/questions';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { jobTitle, company, description, candidateProfile } = body;

    // 1. Fetch authenticated user session and candidate profile
    const sessionUser = await getSessionFromRequest(req);
    let profile = candidateProfile;

    if (!profile && sessionUser?.id && process.env.DATABASE_URL) {
      try {
        profile = await prisma.candidateProfile.findUnique({
          where: { userId: sessionUser.id },
          include: { user: true },
        });
      } catch (e) {}
    }

    if (!profile && process.env.DATABASE_URL) {
      try {
        profile = await prisma.candidateProfile.findFirst({
          include: { user: true },
        });
      } catch (e) {}
    }

    // Resolve formal candidate name with strict priority:
    // 1. Explicit client override
    // 2. Formal Full Name saved in Profile / extracted from CV
    // 3. User account registered name
    // 4. Default 'Candidate'
    const candidateName =
      body?.candidateName?.trim() ||
      profile?.fullName?.trim() ||
      sessionUser?.name?.trim() ||
      profile?.user?.name?.trim() ||
      'Candidate';
    const skills = profile?.extractedSkills || ['TypeScript', 'React', 'Node.js', 'PostgreSQL'];
    const workExp = profile?.workExperience || [];
    const preVerified = profile?.preVerifiedAnswers || {};

    const job = {
      title: jobTitle || 'Software Engineer',
      company: company || 'Hiring Company',
      description: description || 'Software engineering role requiring modern web development expertise.',
    };

    // 2. Generate Cover Letter
    const coverLetterResult = await generateCoverLetter({
      candidateName,
      candidateSkills: skills,
      workExperience: workExp,
      job,
    });

    // 3. Answer standard ATS Screening Questions
    const standardQuestions = [
      { id: 'q1', question: 'Are you legally authorized to work in the country of this role?' },
      { id: 'q2', question: 'What is your current notice period?' },
      { id: 'q3', question: 'What is your target annual salary expectation?' },
      { id: 'q4', question: 'Briefly describe your experience with the primary technologies listed in this role.' },
    ];

    const answeredQuestions = await answerScreeningQuestions(
      standardQuestions,
      {
        name: candidateName,
        email: 'candidate@autoapplypilot.dev',
        skills,
        workExperience: workExp,
        preVerifiedAnswers: preVerified,
      },
      job
    );

    // 4. Save to database if record exists
    try {
      await prisma.application.update({
        where: { id },
        data: {
          generatedCoverLetter: coverLetterResult.coverLetter,
          generatedAnswers: answeredQuestions as any,
        },
      });

      await prisma.applicationLog.create({
        data: {
          applicationId: id,
          step: 'KIT_GENERATED',
          details: `Generated tailored cover letter (${coverLetterResult.wordCount} words) and ${answeredQuestions.length} screening answers.`,
        },
      });
    } catch (dbErr) {
      // In-memory response
    }

    return NextResponse.json({
      status: 'success',
      coverLetter: coverLetterResult.coverLetter,
      keyPointsHighlighted: coverLetterResult.keyPointsHighlighted,
      wordCount: coverLetterResult.wordCount,
      answers: answeredQuestions,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to generate application kit' },
      { status: 500 }
    );
  }
}
