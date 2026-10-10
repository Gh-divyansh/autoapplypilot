import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  findUserByEmail,
  findUserById,
  createUser,
  deleteUserAccount,
  resetDemoUser,
} from '../src/lib/auth/auth';
import { getProfileMemory, setProfileMemory } from '../src/lib/profile-store';
import { DELETE as deleteMe } from '../src/app/api/auth/me/route';

describe('Production Authentication & JWT Engine', () => {
  it('hashes passwords securely and verifies correctly', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await hashPassword(rawPassword);

    expect(hash).toBeDefined();
    expect(hash).not.toBe(rawPassword);

    const isMatch = await verifyPassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword('WrongPassword!', hash);
    expect(isWrongMatch).toBe(false);
  });

  it('signs and verifies JWT session tokens with jose', async () => {
    const user = {
      id: 'test-user-uuid',
      email: 'test@example.com',
      name: 'Test Candidate',
    };

    const token = await createSessionToken(user);
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(20);

    const decoded = await verifySessionToken(token);
    expect(decoded).toBeDefined();
    expect(decoded?.id).toBe(user.id);
    expect(decoded?.email).toBe(user.email);
    expect(decoded?.name).toBe(user.name);
  });

  it('rejects tampered or malformed session tokens', async () => {
    const fakeToken = 'invalid.tampered.token';
    const decoded = await verifySessionToken(fakeToken);
    expect(decoded).toBeNull();
  });

  it('verifies default demo credentials correctly', async () => {
    const user = await findUserByEmail('demo@autoapplypilot.dev');
    expect(user).toBeDefined();
    expect(user?.email).toBe('demo@autoapplypilot.dev');
    if (user?.passwordHash) {
      const match = await verifyPassword('Demo2026!', user.passwordHash);
      expect(match).toBe(true);
    }
  });

  it('creates and deletes a user account completely, evicting profile memory', async () => {
    const testEmail = `delete-test-${Date.now()}@example.com`;
    const created = await createUser({
      email: testEmail,
      name: 'To Be Deleted',
      password: 'TemporaryPass123!',
    });

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();

    // Store candidate profile in memory
    setProfileMemory(created.id, {
      fullName: 'To Be Deleted',
      rawCvText: 'Sample CV',
    });
    expect(getProfileMemory(created.id)).toBeDefined();

    // Verify user can be found by email and id
    const foundByEmail = await findUserByEmail(testEmail);
    expect(foundByEmail).toBeDefined();
    expect(foundByEmail?.id).toBe(created.id);

    const foundById = await findUserById(created.id);
    expect(foundById).toBeDefined();
    expect(foundById?.email).toBe(testEmail);

    // Now delete account
    const wasDeleted = await deleteUserAccount(created.id);
    expect(wasDeleted).toBe(true);

    // Verify user is gone
    const afterDeleteEmail = await findUserByEmail(testEmail);
    expect(afterDeleteEmail).toBeNull();

    const afterDeleteId = await findUserById(created.id);
    expect(afterDeleteId).toBeNull();

    // Verify candidate profile in memory is evicted
    expect(getProfileMemory(created.id)).toBeNull();
  });

  it('resets demo user credentials when resetDemoUser is called', async () => {
    // Delete demo user
    await deleteUserAccount('demo-user-1');
    const demoUserGone = await findUserByEmail('demo@autoapplypilot.dev');
    expect(demoUserGone).toBeNull();

    // Reset demo user
    resetDemoUser();
    const demoRestored = await findUserByEmail('demo@autoapplypilot.dev');
    expect(demoRestored).toBeDefined();
    expect(demoRestored?.email).toBe('demo@autoapplypilot.dev');
  });

  describe('Account Deletion API Safeguards (/api/auth/me)', () => {
    it('returns 401 when no session is present', async () => {
      const req = new Request('http://localhost:3000/api/auth/me', {
        method: 'DELETE',
      });
      const res = await deleteMe(req);
      expect(res.status).toBe(401);
    });

    it('returns 400 when session is valid but no confirmation or password is provided', async () => {
      const token = await createSessionToken({
        id: 'user-to-check',
        email: 'check@example.com',
      });
      const req = new Request('http://localhost:3000/api/auth/me', {
        method: 'DELETE',
        headers: { cookie: `autoapply_session=${token}` },
        body: JSON.stringify({}),
      });
      const res = await deleteMe(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Confirmation required');
    });

    it('returns 400 when confirmation text is not DELETE', async () => {
      const token = await createSessionToken({
        id: 'user-to-check',
        email: 'check@example.com',
      });
      const req = new Request('http://localhost:3000/api/auth/me', {
        method: 'DELETE',
        headers: { cookie: `autoapply_session=${token}` },
        body: JSON.stringify({ confirmation: 'remove' }),
      });
      const res = await deleteMe(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain('Invalid confirmation text');
    });

    it('successfully deletes account when confirmation is DELETE', async () => {
      const user = await createUser({
        email: `api-delete-${Date.now()}@example.com`,
        password: 'Password123!',
      });
      const token = await createSessionToken({
        id: user.id,
        email: user.email,
      });

      const req = new Request('http://localhost:3000/api/auth/me', {
        method: 'DELETE',
        headers: { cookie: `autoapply_session=${token}` },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      });
      const res = await deleteMe(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('success');

      // Verify user was deleted
      const found = await findUserByEmail(user.email);
      expect(found).toBeNull();
    });
  });
});
