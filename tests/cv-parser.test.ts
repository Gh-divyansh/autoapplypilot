import { describe, it, expect } from 'vitest';
import { cvExtractionSchema } from '../src/lib/ai/cv-parser';

describe('CV Extraction Schema', () => {
  it('should successfully parse valid candidate data', () => {
    const validCVData = {
      skills: ['TypeScript', 'React', 'Node.js', 'GraphQL'],
      experienceYears: 5,
      workExperience: [
        {
          title: 'Senior Software Engineer',
          company: 'Tech Corp',
          duration: '2021 - Present',
          highlights: [
            'Led a team of 4 frontend developers',
            'Migrated core app to Next.js',
          ],
        },
        {
          title: 'Software Engineer',
          company: 'Startup Inc',
          duration: '2019 - 2021',
          highlights: ['Developed REST APIs using Express and Node.js'],
        },
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'University of Technology',
          year: '2019',
        },
      ],
    };

    const parsed = cvExtractionSchema.parse(validCVData);

    expect(parsed).toMatchObject(validCVData);
    expect(parsed.targetCountry).toBe('India');
    expect(parsed.preferredCurrency).toBe('INR');
    expect(parsed.skills).toContain('TypeScript');
    expect(parsed.experienceYears).toBe(5);
    expect(parsed.workExperience).toHaveLength(2);
    expect(parsed.workExperience[0].company).toBe('Tech Corp');
    expect(parsed.workExperience[0].highlights).toHaveLength(2);
    expect(parsed.education).toHaveLength(1);
    expect(parsed.education[0].degree).toBe('Bachelor of Science in Computer Science');
    expect(parsed.education[0].year).toBe('2019');
  });

  it('should fail validation if required fields are missing or invalid', () => {
    const invalidCVData = {
      skills: ['TypeScript'],
      experienceYears: 'five', // invalid type
      workExperience: [],
      education: [],
    };

    expect(() => cvExtractionSchema.parse(invalidCVData)).toThrow();
  });
});
