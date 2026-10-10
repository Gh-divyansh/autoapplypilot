import { describe, it, expect } from 'vitest';
import {
  classifyRecruiterEmail,
  recruiterEmailClassificationSchema,
} from '../src/lib/email/classifier';

describe('Recruiter Email Classifier Engine', () => {
  it('correctly classifies interview invitation emails', async () => {
    const email = {
      subject: 'Invitation to Interview with Acme Labs',
      from: 'recruiter@acmelabs.com',
      body: 'Hi Candidate, we were impressed with your application and would like to schedule a call with our engineering team.',
    };

    const result = await classifyRecruiterEmail(email);

    expect(result.classification).toBe('INTERVIEW');
    expect(result.companyDetected.toLowerCase()).toContain('acme');
    expect(result.keyActionRequired).toContain('interview');
    expect(result.confidence).toBeGreaterThan(70);

    const parsed = recruiterEmailClassificationSchema.parse(result);
    expect(parsed.classification).toBe('INTERVIEW');
  });

  it('correctly classifies technical assessment invitations', async () => {
    const email = {
      subject: 'Next step: Technical Coding Challenge',
      from: 'jobs@techcorp.io',
      body: 'Please complete this 90-minute take-home coding challenge on HackerRank before Friday.',
    };

    const result = await classifyRecruiterEmail(email);
    expect(result.classification).toBe('TECHNICAL_ASSESSMENT');
    expect(result.keyActionRequired).toContain('deadline');
  });

  it('correctly classifies rejection emails', async () => {
    const email = {
      subject: 'Update on your application with GlobalSoft',
      from: 'careers@globalsoft.com',
      body: 'Unfortunately, we have decided to pursue other candidates whose background more closely matches our needs.',
    };

    const result = await classifyRecruiterEmail(email);
    expect(result.classification).toBe('REJECTION');
  });
});
