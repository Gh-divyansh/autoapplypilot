import { describe, it, expect, vi } from 'vitest';
import { GET as getApplications, POST as createApplication } from '../src/app/api/applications/route';
import { GET as getSingleApp, PATCH as updateApp, DELETE as deleteApp } from '../src/app/api/applications/[id]/route';
import { INITIAL_TRACKER_APPLICATIONS, ApplicationItem } from '../src/lib/types/applications';

describe('Applications CRM & Kanban Pipeline Endpoints', () => {
  it('exports valid mock tracker applications with required CRM schema', () => {
    expect(INITIAL_TRACKER_APPLICATIONS.length).toBeGreaterThan(0);
    const first = INITIAL_TRACKER_APPLICATIONS[0];
    expect(first).toHaveProperty('id');
    expect(first).toHaveProperty('title');
    expect(first).toHaveProperty('company');
    expect(first).toHaveProperty('status');
    expect(first).toHaveProperty('logs');
    expect(Array.isArray(first.logs)).toBe(true);
  });

  it('GET /api/applications returns applications list', async () => {
    const response = await getApplications();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('applications');
    expect(Array.isArray(data.applications)).toBe(true);
    expect(data.applications.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/applications validates title and company', async () => {
    const invalidReq = new Request('http://localhost:3000/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '' }),
    });

    const res = await createApplication(invalidReq);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeDefined();
  });

  it('POST /api/applications creates new application in tracker', async () => {
    const newJobPayload = {
      title: 'Principal Distributed Systems Engineer',
      company: 'Datadog',
      platform: 'greenhouse',
      status: 'QUEUED',
      matchScore: 93,
      salary: '₹55 - ₹70 LPA',
      location: 'Remote',
      notes: 'Direct referral through senior architect',
    };

    const req = new Request('http://localhost:3000/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newJobPayload),
    });

    const res = await createApplication(req);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.application.title).toBe(newJobPayload.title);
    expect(data.application.company).toBe(newJobPayload.company);
    expect(data.application.status).toBe('QUEUED');
    expect(data.application.logs.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/applications/[id] returns 404 for unknown application', async () => {
    const req = new Request('http://localhost:3000/api/applications/non-existent-id');
    const res = await getSingleApp(req, { params: { id: 'non-existent-id' } });
    expect(res.status).toBe(404);
  });

  it('GET /api/applications/[id] returns application for valid mock id', async () => {
    const req = new Request('http://localhost:3000/api/applications/app-1');
    const res = await getSingleApp(req, { params: { id: 'app-1' } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.application.id).toBe('app-1');
    expect(data.application.company).toBe('Cloudflare');
  });

  it('PATCH /api/applications/[id] updates status safely', async () => {
    const req = new Request('http://localhost:3000/api/applications/app-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'INTERVIEW', notes: 'Scheduled round 1' }),
    });

    const res = await updateApp(req, { params: { id: 'app-1' } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.status).toBe('INTERVIEW');
  });

  it('DELETE /api/applications/[id] responds with success confirmation', async () => {
    const req = new Request('http://localhost:3000/api/applications/app-999', {
      method: 'DELETE',
    });

    const res = await deleteApp(req, { params: { id: 'app-999' } });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
  });
});

