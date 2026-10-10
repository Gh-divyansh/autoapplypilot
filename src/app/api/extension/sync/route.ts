import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth/auth';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionFromRequest(req);
    let profile: any = null;

    if (sessionUser?.id && process.env.DATABASE_URL) {
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

    // Default canonical profile if none in database
    const candidateData = {
      name: profile?.fullName || profile?.user?.name || 'Divyansh Sharma',
      email: profile?.user?.email || 'divyansh.tailort20@gmail.com',
      phone: profile?.phone || '+91 7232881150',
      location: profile?.currentLocation || 'Jaipur, Rajasthan, India',
      targetCountry: profile?.targetCountry || 'India',
      preferredCurrency: profile?.preferredCurrency || 'INR',
      portfolioUrl: profile?.portfolioUrl || 'https://divyanshu-portfolio-eta.vercel.app/',
      githubUrl: profile?.githubUrl || 'https://github.com/Gh-divyansh',
      linkedinUrl: profile?.linkedinUrl || 'https://www.linkedin.com/in/divyanshu-tailor-106570266/',
      skills: profile?.extractedSkills || [
        'TypeScript',
        'React',
        'Next.js',
        'Node.js',
        'PostgreSQL',
        'PHP',
        'Laravel',
        'Docker',
        'MySQL',
      ],
      noticePeriod: profile?.noticePeriod || 'Immediate / 15 Days',
      workAuthorization: profile?.workAuthorization || 'Authorized to work in India / Open to Global Remote',
      preVerifiedAnswers: profile?.preVerifiedAnswers || {
        noticePeriod: '15 Days',
        workAuthorization: 'Yes',
        remotePreference: 'Yes, Remote or Hybrid',
        salaryExpectation: '25-35 LPA',
        yearsOfExperience: '5+ years',
      },
    };

    // Retrieve active queued jobs
    let queuedJobs: any[] = [];
    if (process.env.DATABASE_URL) {
      try {
        queuedJobs = await prisma.jobPosting.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            matchScores: { take: 1 },
          },
        });
      } catch (e) {}
    }

    const response = NextResponse.json({
      status: 'success',
      authenticated: !!sessionUser,
      candidate: candidateData,
      activeQueueCount: queuedJobs.length,
      queuedJobs: queuedJobs.map((j) => ({
        id: j.id,
        externalId: j.externalId,
        title: j.title,
        company: j.company,
        location: j.location,
        url: j.externalUrl,
        provider: j.sourceProvider,
        score: j.matchScores?.[0]?.score || 85,
      })),
    });

    // Enable CORS for Chrome Extension requests
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to sync extension state' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}
