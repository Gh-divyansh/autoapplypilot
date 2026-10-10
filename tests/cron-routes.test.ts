import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET as discoverGET } from '../src/app/api/cron/discover/route';
import { GET as processGET } from '../src/app/api/cron/process/route';

describe('Cron API Routes Authorization & Execution', () => {
  const originalEnv = process.env.CRON_SECRET;

  beforeEach(() => {
    delete process.env.CRON_SECRET;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.CRON_SECRET = originalEnv;
    } else {
      delete process.env.CRON_SECRET;
    }
  });

  describe('GET /api/cron/discover', () => {
    it('returns 401 when CRON_SECRET is set and Authorization header is missing', async () => {
      process.env.CRON_SECRET = 'secret123';
      const req = new Request('http://localhost:3000/api/cron/discover');
      const res = await discoverGET(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns 401 when CRON_SECRET is set and Authorization header is invalid', async () => {
      process.env.CRON_SECRET = 'secret123';
      const req = new Request('http://localhost:3000/api/cron/discover', {
        headers: { authorization: 'Bearer wrongsecret' },
      });
      const res = await discoverGET(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('succeeds when CRON_SECRET is set and valid Authorization header is provided', async () => {
      process.env.CRON_SECRET = 'secret123';
      const req = new Request('http://localhost:3000/api/cron/discover', {
        headers: { authorization: 'Bearer secret123' },
      });
      const res = await discoverGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('success');
      expect(typeof data.discoveredCount).toBe('number');
      expect(data.discoveredCount).toBeGreaterThan(0);
      expect(Array.isArray(data.jobs)).toBe(true);
    }, 30000);

    it('succeeds when CRON_SECRET is set and valid secret query parameter is provided', async () => {
      process.env.CRON_SECRET = 'secret123';
      const req = new Request('http://localhost:3000/api/cron/discover?secret=secret123');
      const res = await discoverGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('success');
      expect(data.discoveredCount).toBeGreaterThan(0);
    }, 30000);

    it('succeeds without Authorization header when CRON_SECRET is not set', async () => {
      delete process.env.CRON_SECRET;
      const req = new Request('http://localhost:3000/api/cron/discover');
      const res = await discoverGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('success');
      expect(data.discoveredCount).toBeGreaterThan(0);
    });
  });

  describe('GET /api/cron/process', () => {
    it('returns 401 when CRON_SECRET is set and Authorization header is missing', async () => {
      process.env.CRON_SECRET = 'secret123';
      const req = new Request('http://localhost:3000/api/cron/process');
      const res = await processGET(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('returns 401 when CRON_SECRET is set and Authorization header is invalid', async () => {
      process.env.CRON_SECRET = 'secret123';
      const req = new Request('http://localhost:3000/api/cron/process', {
        headers: { authorization: 'Bearer wrongsecret' },
      });
      const res = await processGET(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('succeeds when CRON_SECRET is set and valid Authorization header is provided', async () => {
      process.env.CRON_SECRET = 'secret123';
      const req = new Request('http://localhost:3000/api/cron/process', {
        headers: { authorization: 'Bearer secret123' },
      });
      const res = await processGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('success');
      expect(typeof data.processedCount).toBe('number');
      expect(data.message).toBe('Queue processed');
    });

    it('succeeds without Authorization header when CRON_SECRET is not set', async () => {
      delete process.env.CRON_SECRET;
      const req = new Request('http://localhost:3000/api/cron/process');
      const res = await processGET(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('success');
    });
  });
});
