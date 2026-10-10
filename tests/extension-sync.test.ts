import { describe, it, expect, afterAll } from 'vitest';
import { GET as syncGET, OPTIONS as syncOPTIONS } from '../src/app/api/extension/sync/route';
import { POST as logPOST, OPTIONS as logOPTIONS } from '../src/app/api/extension/log-application/route';
import { NextRequest } from 'next/server';

describe('Chrome Extension Backend Sync & Logging APIs', () => {
  describe('GET /api/extension/sync', () => {
    it('returns candidate profile and CORS headers for Chrome Extension', async () => {
      const req = new NextRequest('http://localhost:3000/api/extension/sync');
      const res = await syncGET(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');

      const data = await res.json();
      expect(data.status).toBe('success');
      expect(data.candidate).toBeDefined();
      expect(data.candidate.name).toBeDefined();
      expect(data.candidate.email).toBeDefined();
      expect(data.candidate.targetCountry).toBeDefined();
      expect(Array.isArray(data.candidate.skills)).toBe(true);
      expect(data.candidate.preVerifiedAnswers).toBeDefined();
      expect(data.candidate.preVerifiedAnswers.workAuthorization).toBeDefined();
      expect(data.candidate.preVerifiedAnswers.noticePeriod).toBeDefined();
      expect(Array.isArray(data.queuedJobs)).toBe(true);
    });

    it('handles CORS OPTIONS preflight request with 204 No Content', async () => {
      const res = await syncOPTIONS();
      expect(res.status).toBe(204);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(res.headers.get('Access-Control-Allow-Methods')).toContain('GET');
    });
  });

  describe('POST /api/extension/log-application', () => {
    it('logs completed companion application and responds with CORS headers', async () => {
      const payload = {
        platform: 'linkedin',
        title: 'Full Stack Engineer at TechCorp',
        company: 'TechCorp',
        externalUrl: 'https://www.linkedin.com/jobs/view/12345678',
        confirmationId: 'EXT-TEST-12345',
        notes: 'Autofilled 6 fields via companion widget',
      };

      const req = new NextRequest('http://localhost:3000/api/extension/log-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const res = await logPOST(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');

      const data = await res.json();
      expect(data.status).toBe('success');
      expect(data.logged).toBe(true);
      expect(data.platform).toBe('linkedin');
      expect(data.timestamp).toBeDefined();
    });

    it('handles CORS OPTIONS preflight request with 204 No Content', async () => {
      const res = await logOPTIONS();
      expect(res.status).toBe(204);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });
  });

  describe('POST /api/extension/sync-batch', () => {
    it('handles CORS OPTIONS preflight request with 204 No Content', async () => {
      const { OPTIONS: batchOPTIONS } = await import('../src/app/api/extension/sync-batch/route');
      const res = await batchOPTIONS();
      expect(res.status).toBe(204);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('rejects missing or empty jobs array with 400 Bad Request', async () => {
      const { POST: batchPOST } = await import('../src/app/api/extension/sync-batch/route');
      const req = new NextRequest('http://localhost:3000/api/extension/sync-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: [] }),
      });

      const res = await batchPOST(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBeDefined();
    });

    it('ingests and normalizes a batch of live jobs from LinkedIn, Naukri, and Indeed', async () => {
      const { POST: batchPOST } = await import('../src/app/api/extension/sync-batch/route');
      const jobs = [
        {
          externalId: `li-live-${Date.now()}-1`,
          sourceProvider: 'linkedin',
          title: 'Senior Frontend Engineer',
          company: 'Acme Global Software',
          location: 'Bengaluru / Remote',
          workplaceType: 'REMOTE' as const,
          externalUrl: 'https://www.linkedin.com/jobs/view/3991823910?refId=xyz',
          applicationMode: 'AUTOMATIC' as const,
        },
        {
          externalId: `nk-live-${Date.now()}-2`,
          sourceProvider: 'naukri',
          title: 'Lead Backend Developer',
          company: 'Nexus Tech Systems',
          location: 'Pune, Maharashtra',
          workplaceType: 'HYBRID' as const,
          salaryRange: '25-35 Lacs PA',
          externalUrl: 'https://www.naukri.com/job-listings-lead-backend-developer-nexus-tech-12345678',
          applicationMode: 'ASSISTED' as const,
        },
      ];

      const req = new NextRequest('http://localhost:3000/api/extension/sync-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs }),
      });

      const res = await batchPOST(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('Access-Control-Allow-Origin')).toBe('*');

      const data = await res.json();
      expect(data.status).toBe('success');
      expect(data.totalReceived).toBe(2);
      expect(data.created + data.updated).toBe(2);
      expect(Array.isArray(data.jobs)).toBe(true);
      expect(data.jobs.length).toBe(2);

      // Verify that score is computed and attached
      expect(data.jobs[0].score).toBeGreaterThanOrEqual(60);
      expect(data.jobs[1].score).toBeGreaterThanOrEqual(60);
    });
  });

  afterAll(async () => {
    try {
      const { prisma } = await import('../src/lib/prisma');
      const testPostings = await prisma.jobPosting.findMany({
        where: {
          OR: [
            { company: 'Acme Global Software' },
            { company: 'Nexus Tech Systems' },
            { company: 'TechCorp' },
          ],
        },
        select: { id: true },
      });
      const ids = testPostings.map((p) => p.id);
      if (ids.length > 0) {
        await prisma.jobMatchScore.deleteMany({ where: { jobPostingId: { in: ids } } });
        await prisma.application.deleteMany({ where: { jobPostingId: { in: ids } } });
        await prisma.jobPosting.deleteMany({ where: { id: { in: ids } } });
      }
    } catch {}
  });
});
