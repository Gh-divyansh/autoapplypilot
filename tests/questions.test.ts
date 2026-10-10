import { describe, it, expect } from 'vitest';
import { answerScreeningQuestions } from '../src/lib/ai/questions';

describe('Screening Question Engine', () => {
  it('maps verified facts for standard legal, salary, and notice period questions', async () => {
    const candidate = {
      name: 'John Doe',
      email: 'john@example.com',
      workAuthorization: 'Citizen - Authorized to work without visa sponsorship',
      noticePeriod: '3 weeks',
      expectedSalary: '$140,000 USD',
      skills: ['TypeScript', 'React', 'Node.js'],
      workExperience: [],
      preVerifiedAnswers: {
        'Are you willing to relocate?': 'Yes, for the right opportunity.',
      },
    };

    const questions = [
      { id: '1', question: 'Do you require visa sponsorship now or in the future?' },
      { id: '2', question: 'What is your notice period?' },
      { id: '3', question: 'What is your target salary expectation?' },
      { id: '4', question: 'Are you willing to relocate?' },
    ];

    const answers = await answerScreeningQuestions(questions, candidate);

    expect(answers).toHaveLength(4);

    const q1 = answers.find((a) => a.questionId === '1');
    expect(q1?.answer).toBe('Citizen - Authorized to work without visa sponsorship');
    expect(q1?.confidence).toBe('VERIFIED_FACT');

    const q2 = answers.find((a) => a.questionId === '2');
    expect(q2?.answer).toBe('3 weeks');
    expect(q2?.confidence).toBe('VERIFIED_FACT');

    const q3 = answers.find((a) => a.questionId === '3');
    expect(q3?.answer).toBe('$140,000 USD');

    const q4 = answers.find((a) => a.questionId === '4');
    expect(q4?.answer).toBe('Yes, for the right opportunity.');
    expect(q4?.confidence).toBe('VERIFIED_FACT');
  });

  it('drafts career questions using verified competencies', async () => {
    const candidate = {
      name: 'John Doe',
      email: 'john@example.com',
      skills: ['TypeScript', 'GraphQL', 'Next.js'],
      workExperience: [],
    };

    const questions = [
      { id: '5', question: 'Why are your skills a fit for this engineering role?' },
    ];

    const answers = await answerScreeningQuestions(questions, candidate);
    expect(answers).toHaveLength(1);
    expect(answers[0].confidence).toBe('DRAFTED_BY_AI');
    expect(answers[0].answer).toContain('TypeScript');
  });
});
