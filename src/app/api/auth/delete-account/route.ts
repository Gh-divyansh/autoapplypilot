import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, deleteUserAccount, findUserByEmail, verifyPassword } from '@/lib/auth/auth';
import { deleteUserProfileMemory } from '@/lib/profile-store';

async function handleDelete(req: Request | NextRequest) {
  try {
    const user = await getSessionFromRequest(req);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: No active session found' },
        { status: 401 }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is empty or malformed
    }

    const hasDeleteConfirmation =
      typeof body?.confirmation === 'string' &&
      body.confirmation.trim().toUpperCase() === 'DELETE';
    const hasPassword =
      typeof body?.password === 'string' && body.password.length > 0;

    if (body?.confirmation && !hasDeleteConfirmation) {
      return NextResponse.json(
        { error: 'Invalid confirmation text. Must be "DELETE"' },
        { status: 400 }
      );
    }

    // Destructive safeguard: Require either explicit "DELETE" or password verification
    if (!hasDeleteConfirmation && !hasPassword) {
      return NextResponse.json(
        { error: 'Confirmation required: type "DELETE" or provide account password to confirm deletion' },
        { status: 400 }
      );
    }

    if (hasPassword) {
      const existingUser = await findUserByEmail(user.email);
      if (existingUser?.passwordHash) {
        const isMatch = await verifyPassword(body.password, existingUser.passwordHash);
        if (!isMatch) {
          return NextResponse.json(
            { error: 'Incorrect password verification' },
            { status: 403 }
          );
        }
      }
    }

    const wasDeleted = await deleteUserAccount(user.id);
    deleteUserProfileMemory(user.id);

    if (!wasDeleted) {
      return NextResponse.json(
        { error: 'Failed to delete user account data from system' },
        { status: 500 }
      );
    }

    const response = NextResponse.json({
      status: 'success',
      message: 'Account, candidate profile, and all application history permanently deleted',
    });

    response.cookies.set({
      name: 'autoapply_session',
      value: '',
      path: '/',
      maxAge: 0,
      httpOnly: true,
      expires: new Date(0),
    });
    response.cookies.delete('autoapply_session');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request | NextRequest) {
  return handleDelete(req);
}

export async function DELETE(req: Request | NextRequest) {
  return handleDelete(req);
}
