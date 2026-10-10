import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveDirectJobUrl } from '@/lib/direct-job-url';
import { detectWorkplaceType } from '@/lib/workplace-detector';

export interface BatchJobInput {
  externalId?: string;
  sourceProvider: string;
  title: string;
  company: string;
  location?: string;
  workplaceType?: 'REMOTE' | 'HYBRID' | 'ON_SITE';
  description?: string;
  externalUrl: string;
  salaryRange?: string | null;
  applicationMode?: 'AUTOMATIC' | 'ASSISTED';
}

function normalizeWorkplace(
  title: string,
  loc: string = '',
  desc: string = '',
  declared?: 'REMOTE' | 'HYBRID' | 'ON_SITE'
): 'REMOTE' | 'HYBRID' | 'ON_SITE' {
  return detectWorkplaceType({
    title,
    location: loc,
    description: desc,
    workplaceTag: declared,
  });
}

function calculateHeuristicScore(
  title: string,
  desc: string = '',
  skills: string[] = []
): { score: number; matched: string[]; missing: string[] } {
  const text = `${title} ${desc}`.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const s of skills) {
    if (text.includes(s.toLowerCase())) {
      matched.push(s);
    } else {
      missing.push(s);
    }
  }

  // Base score calculated from skill overlap
  const ratio = skills.length > 0 ? matched.length / skills.length : 0.7;
  const score = Math.min(98, Math.max(65, Math.round(55 + ratio * 40)));
  return { score, matched: matched.slice(0, 5), missing: missing.slice(0, 3) };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawJobs: BatchJobInput[] = Array.isArray(body?.jobs) ? body.jobs : [];

    if (rawJobs.length === 0) {
      return NextResponse.json(
        { error: 'No jobs array provided in request body' },
        { status: 400, headers: corsHeaders() }
      );
    }

    let candidateSkills: string[] = ['TypeScript', 'React', 'Next.js', 'Node.js', 'PostgreSQL'];
    if (process.env.DATABASE_URL) {
      try {
        const profile = await prisma.candidateProfile.findFirst();
        if (profile?.extractedSkills && profile.extractedSkills.length > 0) {
          candidateSkills = profile.extractedSkills;
        }
      } catch {}
    }

    let createdCount = 0;
    let updatedCount = 0;
    const processedJobs: any[] = [];

    for (const raw of rawJobs) {
      const title = (raw.title || '').trim();
      const company = (raw.company || '').trim();
      if (!title || !company) continue;

      const provider = (raw.sourceProvider || 'companion').toLowerCase();
      const externalId =
        (raw.externalId || '').trim() ||
        `${provider}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

      const workplace = normalizeWorkplace(title, raw.location, raw.description, raw.workplaceType);
      const directUrl = resolveDirectJobUrl({
        title,
        company,
        location: raw.location,
        sourceProvider: provider,
        externalId,
        externalUrl: raw.externalUrl,
      });

      const { score, matched, missing } = calculateHeuristicScore(
        title,
        raw.description || title,
        candidateSkills
      );

      if (process.env.DATABASE_URL) {
        try {
          const existing = await prisma.jobPosting.findUnique({
            where: {
              sourceProvider_externalId: {
                sourceProvider: provider,
                externalId,
              },
            },
          });

          const saved = await prisma.jobPosting.upsert({
            where: {
              sourceProvider_externalId: {
                sourceProvider: provider,
                externalId,
              },
            },
            update: {
              title,
              company,
              location: raw.location || 'India',
              workplaceType: workplace,
              description: raw.description || `${title} at ${company}. Discovered via AutoApplyPilot Extension.`,
              externalUrl: directUrl,
              salaryRange: raw.salaryRange || null,
              applicationMode: raw.applicationMode || 'ASSISTED',
            },
            create: {
              externalId,
              sourceProvider: provider,
              title,
              company,
              location: raw.location || 'India',
              workplaceType: workplace,
              description: raw.description || `${title} at ${company}. Discovered via AutoApplyPilot Extension.`,
              externalUrl: directUrl,
              salaryRange: raw.salaryRange || null,
              applicationMode: raw.applicationMode || 'ASSISTED',
            },
          });

          if (existing) {
            updatedCount++;
          } else {
            createdCount++;
            const matchLevel = score >= 80 ? 'HIGH_MATCH' : score >= 60 ? 'MEDIUM_MATCH' : 'LOW_MATCH';
            // Create initial match score
            await prisma.jobMatchScore.create({
              data: {
                jobPostingId: saved.id,
                score,
                matchedSkills: matched,
                missingSkills: missing,
                matchLevel,
                reasoning: `Extracted via AutoApplyPilot Ingest Engine from live ${provider} session.`,
              },
            });
          }

          processedJobs.push({
            id: saved.id,
            externalId: saved.externalId,
            title: saved.title,
            company: saved.company,
            score,
          });
        } catch (dbErr) {
          console.error('[SyncBatch] Error upserting job:', dbErr);
        }
      } else {
        createdCount++;
        processedJobs.push({
          externalId,
          title,
          company,
          score,
        });
      }
    }

    return NextResponse.json(
      {
        status: 'success',
        totalReceived: rawJobs.length,
        created: createdCount,
        updated: updatedCount,
        jobs: processedJobs,
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to process batch sync' },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
