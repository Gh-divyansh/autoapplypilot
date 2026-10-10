import { describe, it, expect } from 'vitest';
import { detectWorkplaceType } from '../src/lib/workplace-detector';

describe('Workplace Type Detection Engine', () => {
  it('correctly classifies explicit Remote positions', () => {
    expect(
      detectWorkplaceType({
        title: 'Senior Full Stack Engineer (Remote)',
        location: 'India',
        description: 'Building modern web applications.',
      })
    ).toBe('REMOTE');

    expect(
      detectWorkplaceType({
        title: 'Backend Developer',
        location: 'Remote - India',
        description: 'Collaborate with global team.',
      })
    ).toBe('REMOTE');

    expect(
      detectWorkplaceType({
        title: 'Frontend Engineer',
        location: 'Worldwide Remote',
        description: 'Work from anywhere.',
      })
    ).toBe('REMOTE');

    expect(
      detectWorkplaceType({
        title: 'Full Stack Engineer',
        location: 'Bengaluru / Remote',
        description: 'We are remote-first company.',
      })
    ).toBe('REMOTE');

    expect(
      detectWorkplaceType({
        title: 'Software Engineer',
        location: 'Anywhere',
        description: 'Permanent work from home.',
      })
    ).toBe('REMOTE');
  });

  it('correctly classifies explicit On-Site positions in cities', () => {
    expect(
      detectWorkplaceType({
        title: 'Engineer-Engineering',
        location: 'Bangalore, Karnataka',
        description: 'Perform site manufacturing and engineering.',
      })
    ).toBe('ON_SITE');

    expect(
      detectWorkplaceType({
        title: 'Sr. Engineer - NPI & Engineering',
        location: 'Maddur, Mandya',
        description: 'Supervise daily floor operations.',
      })
    ).toBe('ON_SITE');

    expect(
      detectWorkplaceType({
        title: 'Identity and Access Management Engineer',
        location: 'Thane, Maharashtra',
        description: 'Corporate headquarters IT team.',
      })
    ).toBe('ON_SITE');

    expect(
      detectWorkplaceType({
        title: 'Full Stack Developer',
        location: 'Kanpur, Uttar Pradesh, India',
        description: 'Work in our development center.',
      })
    ).toBe('ON_SITE');

    expect(
      detectWorkplaceType({
        title: 'Senior Full Stack Developer',
        location: 'Hyderabad, Telangana',
        description: 'Lead engineering in our HITEC City office.',
      })
    ).toBe('ON_SITE');
  });

  it('correctly classifies Hybrid positions', () => {
    expect(
      detectWorkplaceType({
        title: 'Backend Software Architect',
        location: 'San Francisco, CA (Hybrid)',
        description: 'Flexible hybrid team model.',
      })
    ).toBe('HYBRID');

    expect(
      detectWorkplaceType({
        title: 'Software Engineer (Hybrid)',
        location: 'Pune, Maharashtra',
        description: '3 days in office, 2 days remote.',
      })
    ).toBe('HYBRID');

    expect(
      detectWorkplaceType({
        title: 'DevOps Engineer',
        location: 'Bengaluru',
        description: 'We follow a hybrid work model with 2 days a week in office.',
      })
    ).toBe('HYBRID');

    expect(
      detectWorkplaceType({
        title: 'Full Stack Engineer',
        location: 'Delhi',
        workplaceTag: 'Hybrid',
      })
    ).toBe('HYBRID');
  });

  it('prioritizes remote negation over false positive keyword matching', () => {
    expect(
      detectWorkplaceType({
        title: 'Site Reliability Engineer',
        location: 'Bengaluru, Karnataka',
        description: 'This is not a remote position. Candidates must work from office.',
      })
    ).toBe('ON_SITE');

    expect(
      detectWorkplaceType({
        title: 'Systems Engineer',
        location: 'Remote',
        description: 'No remote allowed. On-site only in Mumbai.',
      })
    ).toBe('ON_SITE');

    expect(
      detectWorkplaceType({
        title: 'Hardware Engineer',
        location: 'Pune',
        description: 'Will coordinate with our remote teams in USA, but this role is strictly on-site.',
      })
    ).toBe('ON_SITE');
  });

  it('avoids false positives from "remote teams" or "remote control"', () => {
    expect(
      detectWorkplaceType({
        title: 'Embedded Firmware Developer',
        location: 'Bengaluru, Karnataka',
        description: 'Experience with remote sensing and remote debugging devices.',
      })
    ).toBe('ON_SITE');
  });
});

