import { describe, it, expect } from 'vitest';
import {
  sendNotification,
  getNotifications,
  markNotificationAsRead,
  renderEmailHtml,
} from '../src/lib/email/notifier';

describe('Transactional Email & Notification Service', () => {
  it('renders responsive HTML email template with job details and match score badge', () => {
    const payload = {
      to: 'candidate@example.com',
      type: 'HIGH_MATCH' as const,
      title: 'High-Fit Match: Cloudflare Systems Engineer (95%)',
      body: 'Cloudflare posted an engineer role matching your profile.',
      jobDetails: {
        title: 'Systems Engineer',
        company: 'Cloudflare',
        score: 95,
        url: 'https://boards.greenhouse.io/cloudflare',
      },
    };

    const html = renderEmailHtml(payload);
    expect(html).toContain('Systems Engineer');
    expect(html).toContain('Cloudflare');
    expect(html).toContain('95% Match');
    expect(html).toContain('AutoApplyPilot Notification');
  });

  it('records notifications in feed and marks them as read', async () => {
    const result = await sendNotification({
      to: 'user@example.com',
      type: 'INTERVIEW_INVITE',
      title: 'Interview scheduled with TechCorp',
      body: 'Recruiter confirmed interview.',
    });

    expect(result.success).toBe(true);
    expect(result.notificationId).toBeDefined();

    const notifs = getNotifications();
    const created = notifs.find((n) => n.id === result.notificationId);
    expect(created).toBeDefined();
    expect(created?.read).toBe(false);

    const markResult = markNotificationAsRead(result.notificationId);
    expect(markResult).toBe(true);
    expect(created?.read).toBe(true);
  });
});
