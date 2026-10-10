import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, markNotificationAsRead, sendNotification } from '@/lib/email/notifier';

export async function GET() {
  const notifs = getNotifications();
  const unreadCount = notifs.filter((n) => !n.read).length;
  return NextResponse.json({
    status: 'success',
    notifications: notifs,
    unreadCount,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.action === 'mark_read' && body.id) {
      const updated = markNotificationAsRead(body.id);
      return NextResponse.json({ status: 'success', updated });
    }

    if (body.action === 'send') {
      const result = await sendNotification({
        to: body.to || 'candidate@autoapplypilot.dev',
        type: body.type || 'HIGH_MATCH',
        title: body.title || 'New Job Alert',
        body: body.body || 'A new position matching your profile was detected.',
        jobDetails: body.jobDetails,
      });
      return NextResponse.json({ status: 'success', ...result });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to process notification request' },
      { status: 500 }
    );
  }
}
