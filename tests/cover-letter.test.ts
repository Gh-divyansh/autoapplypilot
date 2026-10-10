import { describe, it, expect } from 'vitest';
import { generateCoverLetter, coverLetterSchema } from '../src/lib/ai/cover-letter';

describe('Tailored Cover Letter Engine', () => {
  it('generates a factual cover letter with proper structure and length', async () => {
    const input = {
      candidateName: 'Jane Developer',
      candidateSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      workExperience: [
        {
          title: 'Full Stack Engineer',
          company: 'Acme Corp',
          duration: '2021 - Present',
          highlights: ['Built serverless APIs', 'Scaled web applications'],
        },
      ],
      job: {
        title: 'Senior Software Engineer',
        company: 'CloudTech',
        description: 'Seeking a Full Stack Engineer proficient in TypeScript, React, and Node.js.',
      },
    };

    const result = await generateCoverLetter(input);

    expect(result).toBeDefined();
    expect(result.coverLetter).toContain('Jane Developer');
    expect(result.coverLetter).toContain('CloudTech');
    expect(result.wordCount).toBeGreaterThanOrEqual(50);
    expect(result.wordCount).toBeLessThan(350);
    expect(result.keyPointsHighlighted.length).toBeGreaterThan(0);

    const parsed = coverLetterSchema.parse(result);
    expect(parsed.coverLetter).toBe(result.coverLetter);
  });
});
