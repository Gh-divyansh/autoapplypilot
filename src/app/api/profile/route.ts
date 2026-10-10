import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseCV } from '@/lib/ai/cv-parser';
import { getSessionFromRequest } from '@/lib/auth/auth';

import { getProfileMemory, setProfileMemory } from '@/lib/profile-store';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionFromRequest(req);

    if (sessionUser) {
      if (process.env.DATABASE_URL) {
        try {
          const profile = await prisma.candidateProfile.findUnique({
            where: { userId: sessionUser.id },
            include: { user: true },
          });

          return NextResponse.json({
            profile: profile || null,
            authenticated: true,
            user: sessionUser,
          });
        } catch (dbErr) {
          // Fall through to in-memory store
        }
      }

      const memProfile = getProfileMemory(sessionUser.id);
      return NextResponse.json({
        profile: memProfile,
        authenticated: true,
        user: sessionUser,
      });
    }

    return NextResponse.json({
      profile: null,
      authenticated: false,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch candidate profile', profile: null },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionFromRequest(req);
    const body = await req.json();

    const {
      rawCvText,
      fullName,
      phone,
      currentLocation,
      portfolioUrl,
      githubUrl,
      linkedinUrl,
      targetCountry,
      targetCities,
      targetJobTitles,
      preferredWorkplace,
      preferredCurrency,
      compensationFormat,
      expectedSalary,
      minSalaryFloor,
      openToEquity,
      employmentTypes,
      noticePeriod,
      noticePeriodBuyout,
      workAuthorization,
      timezonePreference,
      relocationPreference,
      seniorityLevel,
      excludedCompanies,
      skills,
      workExperience,
      education,
      certifications,
      preVerifiedAnswers,
    } = body;

    let extractedData: any = {};
    if (rawCvText && (!skills || skills.length === 0)) {
      extractedData = await parseCV(rawCvText);
    }

    const targetUserId = sessionUser?.id || 'guest-session';

    const profileData = {
      userId: targetUserId,
      rawCvText: rawCvText || '',
      fullName: fullName ?? extractedData.fullName ?? '',
      phone: phone ?? extractedData.phone ?? '',
      currentLocation: currentLocation ?? extractedData.currentLocation ?? 'Jaipur, Rajasthan, India',
      portfolioUrl: portfolioUrl ?? extractedData.portfolioUrl ?? '',
      githubUrl: githubUrl ?? extractedData.githubUrl ?? '',
      linkedinUrl: linkedinUrl ?? extractedData.linkedinUrl ?? '',
      targetCountry: targetCountry ?? extractedData.targetCountry ?? 'India',
      targetCities: targetCities || ['Jaipur', 'Remote'],
      targetJobTitles: targetJobTitles || extractedData.targetJobTitles || ['Full Stack Developer'],
      preferredWorkplace: preferredWorkplace || 'REMOTE',
      preferredCurrency: preferredCurrency || extractedData.preferredCurrency || 'INR',
      compensationFormat: compensationFormat || extractedData.compensationFormat || 'LPA',
      expectedSalary: expectedSalary || extractedData.expectedSalary || '18 LPA',
      minSalaryFloor: minSalaryFloor || '12 LPA',
      openToEquity: openToEquity !== undefined ? openToEquity : true,
      employmentTypes: employmentTypes || ['Full-time'],
      noticePeriod: noticePeriod || '30 days',
      noticePeriodBuyout: noticePeriodBuyout || false,
      workAuthorization: workAuthorization || 'Citizen of India / Authorized to work without sponsorship',
      timezonePreference: timezonePreference || 'IST',
      relocationPreference: relocationPreference || 'NO_RELOCATION',
      seniorityLevel: seniorityLevel || 'SENIOR',
      excludedCompanies: excludedCompanies || [],
      extractedSkills: skills || extractedData.skills || [],
      workExperience: workExperience || extractedData.workExperience || [],
      education: education || extractedData.education || [],
      certifications: certifications || extractedData.certifications || [],
      preVerifiedAnswers: preVerifiedAnswers || {},
    };

    setProfileMemory(targetUserId, profileData);

    // Save to PostgreSQL if connected and authenticated
    if (process.env.DATABASE_URL && sessionUser) {
      try {
        const dbProfile = await prisma.candidateProfile.upsert({
          where: { userId: sessionUser.id },
          update: {
            rawCvText: profileData.rawCvText,
            fullName: profileData.fullName,
            phone: profileData.phone,
            currentLocation: profileData.currentLocation,
            portfolioUrl: profileData.portfolioUrl,
            githubUrl: profileData.githubUrl,
            linkedinUrl: profileData.linkedinUrl,
            targetCountry: profileData.targetCountry,
            targetCities: profileData.targetCities,
            targetJobTitles: profileData.targetJobTitles,
            preferredWorkplace: profileData.preferredWorkplace,
            preferredCurrency: profileData.preferredCurrency,
            compensationFormat: profileData.compensationFormat,
            expectedSalary: profileData.expectedSalary,
            minSalaryFloor: profileData.minSalaryFloor,
            openToEquity: profileData.openToEquity,
            employmentTypes: profileData.employmentTypes,
            noticePeriod: profileData.noticePeriod,
            noticePeriodBuyout: profileData.noticePeriodBuyout,
            workAuthorization: profileData.workAuthorization,
            timezonePreference: profileData.timezonePreference,
            relocationPreference: profileData.relocationPreference,
            seniorityLevel: profileData.seniorityLevel,
            excludedCompanies: profileData.excludedCompanies,
            extractedSkills: profileData.extractedSkills,
            workExperience: profileData.workExperience as any,
            education: profileData.education as any,
            certifications: profileData.certifications as any,
            preVerifiedAnswers: profileData.preVerifiedAnswers as any,
          },
          create: {
            userId: sessionUser.id,
            rawCvText: profileData.rawCvText,
            fullName: profileData.fullName,
            phone: profileData.phone,
            currentLocation: profileData.currentLocation,
            portfolioUrl: profileData.portfolioUrl,
            githubUrl: profileData.githubUrl,
            linkedinUrl: profileData.linkedinUrl,
            targetCountry: profileData.targetCountry,
            targetCities: profileData.targetCities,
            targetJobTitles: profileData.targetJobTitles,
            preferredWorkplace: profileData.preferredWorkplace,
            preferredCurrency: profileData.preferredCurrency,
            compensationFormat: profileData.compensationFormat,
            expectedSalary: profileData.expectedSalary,
            minSalaryFloor: profileData.minSalaryFloor,
            openToEquity: profileData.openToEquity,
            employmentTypes: profileData.employmentTypes,
            noticePeriod: profileData.noticePeriod,
            noticePeriodBuyout: profileData.noticePeriodBuyout,
            workAuthorization: profileData.workAuthorization,
            timezonePreference: profileData.timezonePreference,
            relocationPreference: profileData.relocationPreference,
            seniorityLevel: profileData.seniorityLevel,
            excludedCompanies: profileData.excludedCompanies,
            extractedSkills: profileData.extractedSkills,
            workExperience: profileData.workExperience as any,
            education: profileData.education as any,
            certifications: profileData.certifications as any,
            preVerifiedAnswers: profileData.preVerifiedAnswers as any,
          },
        });

        return NextResponse.json({
          status: 'success',
          profile: dbProfile,
          extracted: extractedData,
        });
      } catch (dbErr) {
        // Fallback for offline mode
      }
    }

    return NextResponse.json({
      status: 'success',
      profile: profileData,
      extracted: extractedData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update candidate profile' },
      { status: 500 }
    );
  }
}

