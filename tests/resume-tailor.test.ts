import { describe, it, expect } from 'vitest';
import {
  extractJobKeywords,
  categorizeSkills,
  tailorResume,
} from '@/lib/ai/resume-tailor';
import { POST } from '@/app/api/applications/[id]/tailor-resume/route';
import { NextRequest } from 'next/server';

describe('Dynamic ATS Resume Tailoring Engine', () => {
  it('extracts technical keywords accurately from job title and description', () => {
    const title = 'Senior Full Stack Engineer (Next.js & TypeScript)';
    const description = `
      We are looking for an experienced developer with deep knowledge of TypeScript, React, Next.js,
      PostgreSQL, and Docker. Experience with AWS, Redis, and Microservices is a big plus.
    `;

    const keywords = extractJobKeywords(description, title);
    expect(keywords).toContain('TypeScript');
    expect(keywords).toContain('Next.js');
    expect(keywords).toContain('PostgreSQL');
    expect(keywords).toContain('Docker');
    expect(keywords).toContain('Redis');
  });

  it('provides reliable fallback keywords when description contains minimal text', () => {
    const title = 'Frontend Developer';
    const description = 'Great company culture and awesome team.';

    const keywords = extractJobKeywords(description, title);
    expect(keywords.length).toBeGreaterThan(0);
    expect(keywords).toContain('React');
  });

  it('correctly categorizes skills into ATS resume sections', () => {
    const skills = [
      'TypeScript',
      'React',
      'Docker',
      'AWS',
      'PostgreSQL',
      'Redis',
      'System Design',
    ];

    const categorized = categorizeSkills(skills);
    expect(categorized.languagesAndFrameworks).toContain('TypeScript');
    expect(categorized.languagesAndFrameworks).toContain('React');
    expect(categorized.cloudAndInfrastructure).toContain('Docker');
    expect(categorized.cloudAndInfrastructure).toContain('AWS');
    expect(categorized.databasesAndTools).toContain('PostgreSQL');
    expect(categorized.databasesAndTools).toContain('Redis');
    expect(categorized.otherCompetencies).toContain('System Design');
  });

  it('tailors candidate resume data to match target job requirements with ATS scoring', async () => {
    const candidateProfile = {
      fullName: 'Divyansh Sharma',
      email: 'divyansh@example.com',
      phone: '+91 98765 43210',
      currentLocation: 'Jaipur, India',
      extractedSkills: ['TypeScript', 'React', 'Next.js', 'PostgreSQL', 'Docker', 'Git'],
      workExperience: [
        {
          company: 'Acme Corp',
          role: 'Full Stack Engineer',
          period: '2022 - Present',
          highlights: [
            'Built internal tools with Python and Bash scripts.',
            'Scaled TypeScript and Next.js portal with PostgreSQL database handling 50k DAU.',
          ],
        },
      ],
      education: [
        {
          degree: 'B.Tech in Computer Science',
          institution: 'RTU',
          year: '2022',
        },
      ],
    };

    const job = {
      title: 'Senior Next.js Developer',
      company: 'Vercel Ecosystem Partner',
      description: 'Requirements: Strong proficiency in Next.js, TypeScript, PostgreSQL, and performance optimization.',
    };

    const result = await tailorResume({ candidateProfile, job });

    expect(result.candidateInfo.fullName).toBe('Divyansh Sharma');
    expect(result.targetRole).toBe(job.title);
    expect(result.targetCompany).toBe(job.company);
    expect(result.atsScore).toBeGreaterThanOrEqual(60);
    expect(result.atsAnalysis.matchedKeywords).toContain('TypeScript');
    expect(result.atsAnalysis.matchedKeywords).toContain('Next.js');
    expect(result.atsAnalysis.matchedKeywords).toContain('PostgreSQL');

    // Experience bullet points should prioritize the matching Next.js bullet point
    expect(result.experience[0].bulletPoints[0]).toContain('TypeScript and Next.js');
  });

  it('POST /api/applications/[id]/tailor-resume returns structured tailored resume payload', async () => {
    const req = new NextRequest('http://localhost:3000/api/applications/temp/tailor-resume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobTitle: 'Backend Engineer',
        company: 'Cloudflare',
        description: 'Seeking backend engineer proficient in Node.js, TypeScript, PostgreSQL, and Docker.',
        candidateProfile: {
          fullName: 'Divyansh Sharma',
          extractedSkills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
        },
      }),
    });

    const res = await POST(req, { params: { id: 'temp' } });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.tailoredResume).toBeDefined();
    expect(body.tailoredResume.candidateInfo.fullName).toBe('Divyansh Sharma');
    expect(body.tailoredResume.targetCompany).toBe('Cloudflare');
    expect(body.tailoredResume.atsScore).toBeGreaterThanOrEqual(50);
  });
});

