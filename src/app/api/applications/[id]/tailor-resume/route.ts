import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth/auth';
import { getProfileMemory } from '@/lib/profile-store';
import { tailorResume } from '@/lib/ai/resume-tailor';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { jobTitle, company, description, candidateProfile } = body;

    // 1. Fetch user session
    const sessionUser = await getSessionFromRequest(req);
    let profile = candidateProfile;

    // 2. If profile not explicitly provided in body, fetch from database or in-memory store
    if (!profile && sessionUser?.id) {
      if (process.env.DATABASE_URL) {
        try {
          profile = await prisma.candidateProfile.findUnique({
            where: { userId: sessionUser.id },
            include: { user: true },
          });
        } catch (e) {}
      }
      if (!profile) {
        profile = getProfileMemory(sessionUser.id);
      }
    }

    // 3. Fallback to any existing candidate profile in database if still null
    if (!profile && process.env.DATABASE_URL) {
      try {
        profile = await prisma.candidateProfile.findFirst({
          include: { user: true },
        });
      } catch (e) {}
    }

    // 4. If application ID is not 'temp', try to resolve job posting from DB
    let targetJob = {
      title: jobTitle || 'Full Stack Engineer',
      company: company || 'Tech Corporation',
      description: description || 'Software development role focusing on modern web engineering.',
    };

    if (id && id !== 'temp' && (!jobTitle || !company) && process.env.DATABASE_URL) {
      try {
        const appRecord = await prisma.application.findUnique({
          where: { id },
          include: { jobPosting: true },
        });
        if (appRecord?.jobPosting) {
          targetJob = {
            title: appRecord.jobPosting.title,
            company: appRecord.jobPosting.company,
            description: appRecord.jobPosting.description,
          };
        }
      } catch (e) {}
    }

    // Resolve formal candidate identity
    const resolvedProfile = {
      fullName:
        profile?.fullName ||
        sessionUser?.name ||
        profile?.user?.name ||
        'Divyansh Sharma',
      email:
        profile?.user?.email ||
        sessionUser?.email ||
        'divyansh.sharma@autoapplypilot.dev',
      phone: profile?.phone || '+91 98765 43210',
      currentLocation: profile?.currentLocation || 'Jaipur, Rajasthan, India',
      portfolioUrl: profile?.portfolioUrl || 'https://divyansh.dev',
      githubUrl: profile?.githubUrl || 'https://github.com/divyansh',
      linkedinUrl: profile?.linkedinUrl || 'https://linkedin.com/in/divyansh',
      extractedSkills: profile?.extractedSkills || [
        'TypeScript',
        'React',
        'Next.js',
        'Node.js',
        'PostgreSQL',
        'Docker',
        'Git',
        'Tailwind CSS',
        'REST',
        'GraphQL',
      ],
      workExperience: profile?.workExperience,
      education: profile?.education,
      certifications: profile?.certifications,
    };

    // 5. Generate Tailored Resume
    const tailoredResume = await tailorResume({
      candidateProfile: resolvedProfile,
      job: targetJob,
    });

    return NextResponse.json({
      success: true,
      tailoredResume,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to generate tailored ATS resume' },
      { status: 500 }
    );
  }
}

