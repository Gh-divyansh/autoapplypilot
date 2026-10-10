import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/cv/pdf-extractor';
import { parseCV } from '@/lib/ai/cv-parser';
import { prisma } from '@/lib/prisma';
import { getSessionFromRequest } from '@/lib/auth/auth';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Invalid file format. Please upload a PDF document (.pdf)' },
        { status: 400 }
      );
    }

    // Convert file to Node buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Extract raw text from PDF
    const pdfResult = await extractTextFromPDF(buffer);

    if (!pdfResult.text || pdfResult.text.length < 20) {
      return NextResponse.json(
        { error: 'Could not extract readable text from PDF. Please ensure it is not a scanned image.' },
        { status: 422 }
      );
    }

    // 2. Pass extracted text to Gemini AI structured parser
    const extractedData = await parseCV(pdfResult.text);

    // 3. Associate with authenticated user if present
    const sessionUser = await getSessionFromRequest(req);

    if (process.env.DATABASE_URL) {
      try {
        const userId = sessionUser?.id;
        if (userId) {
          await prisma.candidateProfile.upsert({
            where: { userId },
            update: {
              rawCvText: pdfResult.text,
              fullName: extractedData.fullName,
              phone: extractedData.phone,
              currentLocation: extractedData.currentLocation,
              portfolioUrl: extractedData.portfolioUrl,
              githubUrl: extractedData.githubUrl,
              linkedinUrl: extractedData.linkedinUrl,
              targetJobTitles: extractedData.targetJobTitles,
              targetCountry: extractedData.targetCountry || 'India',
              preferredCurrency: extractedData.preferredCurrency || 'INR',
              compensationFormat: extractedData.compensationFormat || 'LPA',
              expectedSalary: extractedData.expectedSalary || '18 LPA',
              extractedSkills: extractedData.skills,
              workExperience: extractedData.workExperience as any,
              education: extractedData.education as any,
              certifications: extractedData.certifications as any,
            },
            create: {
              userId,
              rawCvText: pdfResult.text,
              fullName: extractedData.fullName,
              phone: extractedData.phone,
              currentLocation: extractedData.currentLocation,
              portfolioUrl: extractedData.portfolioUrl,
              githubUrl: extractedData.githubUrl,
              linkedinUrl: extractedData.linkedinUrl,
              targetJobTitles: extractedData.targetJobTitles,
              targetCountry: extractedData.targetCountry || 'India',
              preferredCurrency: extractedData.preferredCurrency || 'INR',
              compensationFormat: extractedData.compensationFormat || 'LPA',
              expectedSalary: extractedData.expectedSalary || '18 LPA',
              extractedSkills: extractedData.skills,
              workExperience: extractedData.workExperience as any,
              education: extractedData.education as any,
              certifications: extractedData.certifications as any,
            },
          });
        }
      } catch (dbErr) {
        // Fallback for offline mode
      }
    }

    return NextResponse.json({
      status: 'success',
      fileName: file.name,
      pageCount: pdfResult.numpages,
      rawCvText: pdfResult.text,
      extracted: extractedData,
      profile: extractedData,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process PDF CV upload' },
      { status: 500 }
    );
  }
}

