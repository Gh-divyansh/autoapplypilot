import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';
import { deleteUserProfileMemory } from '@/lib/profile-store';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'autoapplypilot-production-secret-token-2026-key'
);

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
}

// Pre-generated bcrypt hash for 'Demo2026!'
const DEMO_PASSWORD_HASH = bcrypt.hashSync('Demo2026!', 10);

// In-memory user store fallback for local development or offline testing
const inMemoryUsers: Map<string, { id: string; email: string; name?: string | null; passwordHash: string }> = new Map([
  [
    'demo@autoapplypilot.dev',
    {
      id: 'demo-user-1',
      email: 'demo@autoapplypilot.dev',
      name: 'Divyansh Demo',
      passwordHash: DEMO_PASSWORD_HASH,
    },
  ],
]);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({ id: user.id, email: user.email, name: user.name })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload.id || !payload.email) return null;
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: payload.name ? String(payload.name) : null,
    };
  } catch (err) {
    return null;
  }
}

export async function findUserByEmail(email: string) {
  const normalized = email.toLowerCase().trim();

  if (process.env.DATABASE_URL) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: normalized },
      });
      if (dbUser) return dbUser;

      // If DB is connected and user is not in DB, only fallback for hardcoded demo
      if (normalized === 'demo@autoapplypilot.dev') {
        return inMemoryUsers.get(normalized) || null;
      }
      return null;
    } catch (e) {
      // DB offline fallback
    }
  }

  return inMemoryUsers.get(normalized) || null;
}

export async function createUser(data: { email: string; name?: string; password: string }) {
  const normalized = data.email.toLowerCase().trim();
  const passwordHash = await hashPassword(data.password);

  if (process.env.DATABASE_URL) {
    try {
      const created = await prisma.user.create({
        data: {
          email: normalized,
          name: data.name,
          passwordHash,
        },
      });

      // Keep in-memory cache synchronized with the real database user ID
      inMemoryUsers.set(normalized, {
        id: created.id,
        email: created.email,
        name: created.name,
        passwordHash: created.passwordHash || passwordHash,
      });

      return created;
    } catch (e) {
      // Fall through to memory fallback
    }
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email: normalized,
    name: data.name || null,
    passwordHash,
  };

  inMemoryUsers.set(normalized, newUser);
  return newUser;
}

export async function getSessionFromRequest(request: Request): Promise<SessionUser | null> {
  // Check Cookie header
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/autoapply_session=([^;]+)/);
  let token = match ? match[1] : null;

  // Check Authorization header fallback
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;
  return verifySessionToken(token);
}

export async function findUserById(id: string) {
  if (process.env.DATABASE_URL) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id },
      });
      if (dbUser) return dbUser;

      if (id === 'demo-user-1') {
        const found = Array.from(inMemoryUsers.values()).find((u) => u.id === id);
        if (found) return found;
      }
      return null;
    } catch (e) {
      // DB offline fallback
    }
  }

  const found = Array.from(inMemoryUsers.values()).find((u) => u.id === id);
  return found || null;
}

export function resetDemoUser(): void {
  inMemoryUsers.set('demo@autoapplypilot.dev', {
    id: 'demo-user-1',
    email: 'demo@autoapplypilot.dev',
    name: 'Divyansh Demo',
    passwordHash: DEMO_PASSWORD_HASH,
  });
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  let deleted = false;

  // 1. Transactional cascade deletion in database
  if (process.env.DATABASE_URL) {
    try {
      const existingDbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      if (existingDbUser) {
        inMemoryUsers.delete(existingDbUser.email.toLowerCase().trim());
      }

      await prisma.$transaction(async (tx) => {
        // Cascade delete candidateProfile
        await tx.candidateProfile.deleteMany({
          where: { userId },
        });

        // Find applications by this user
        const userApps = await tx.application.findMany({
          where: { userId },
          select: { id: true },
        });
        const appIds = userApps.map((a) => a.id);

        // Delete application logs for those applications
        if (appIds.length > 0) {
          await tx.applicationLog.deleteMany({
            where: { applicationId: { in: appIds } },
          });
        }

        // Delete user applications
        await tx.application.deleteMany({
          where: { userId },
        });

        // Delete user record
        await tx.user.deleteMany({
          where: { id: userId },
        });
      });
      deleted = true;
    } catch (e) {
      console.error('Error deleting user account from database:', e);
    }
  }

  // 2. Remove from in-memory user map
  Array.from(inMemoryUsers.entries()).forEach(([email, user]) => {
    if (user.id === userId) {
      inMemoryUsers.delete(email);
      deleted = true;
    }
  });

  // 3. Purge candidate profile from in-memory store
  deleteUserProfileMemory(userId);

  return deleted;
}

