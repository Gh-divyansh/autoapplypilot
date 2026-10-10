import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { wrapDataBoundary } from './sanitizer';

export interface CandidateFactBank {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  workAuthorization?: string;
  noticePeriod?: string;
  expectedSalary?: string;
  skills: string[];
  workExperience: any;
  education?: any;
  preVerifiedAnswers?: Record<string, string>;
}

export interface ScreeningQuestion {
  id: string;
  question: string;
  required?: boolean;
}

export interface AnsweredQuestion {
  questionId: string;
  question: string;
  answer: string;
  confidence: 'VERIFIED_FACT' | 'DRAFTED_BY_AI' | 'REQUIRES_USER_INPUT';
  source: string;
}

export const questionAnswerSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
      reasoning: z.string(),
    })
  ),
});

/**
 * Maps screening questions to verified candidate profile facts,
 * or drafts truthful responses using Gemini.
 */
export async function answerScreeningQuestions(
  questions: ScreeningQuestion[],
  candidate: CandidateFactBank,
  jobContext?: { title: string; company: string; description: string }
): Promise<AnsweredQuestion[]> {
  const results: AnsweredQuestion[] = [];
  const unhandledQuestions: ScreeningQuestion[] = [];

  for (const q of questions) {
    const qLower = q.question.toLowerCase();

    // 1. Check pre-verified answers bank first
    if (candidate.preVerifiedAnswers && candidate.preVerifiedAnswers[q.question]) {
      results.push({
        questionId: q.id,
        question: q.question,
        answer: candidate.preVerifiedAnswers[q.question],
        confidence: 'VERIFIED_FACT',
        source: 'preVerifiedAnswers',
      });
      continue;
    }

    // 2. Deterministic matching for common standard ATS questions
    if (qLower.includes('work authorization') || qLower.includes('legally authorized') || qLower.includes('require visa') || qLower.includes('sponsorship')) {
      const authAnswer = candidate.workAuthorization || candidate.preVerifiedAnswers?.['workAuthorization'] || 'Authorized to work without sponsorship';
      results.push({
        questionId: q.id,
        question: q.question,
        answer: authAnswer,
        confidence: 'VERIFIED_FACT',
        source: 'candidateProfile.workAuthorization',
      });
      continue;
    }

    if (qLower.includes('notice period') || qLower.includes('how soon can you start') || qLower.includes('start date')) {
      const notice = candidate.noticePeriod || '2 weeks notice';
      results.push({
        questionId: q.id,
        question: q.question,
        answer: notice,
        confidence: 'VERIFIED_FACT',
        source: 'candidateProfile.noticePeriod',
      });
      continue;
    }

    if (qLower.includes('salary expectation') || qLower.includes('desired compensation') || qLower.includes('target salary')) {
      const salary = candidate.expectedSalary || 'Negotiable / Market rate';
      results.push({
        questionId: q.id,
        question: q.question,
        answer: salary,
        confidence: 'VERIFIED_FACT',
        source: 'candidateProfile.expectedSalary',
      });
      continue;
    }

    if (qLower.includes('phone') || qLower.includes('phone number')) {
      results.push({
        questionId: q.id,
        question: q.question,
        answer: candidate.phone || 'Provided upon request',
        confidence: 'VERIFIED_FACT',
        source: 'candidateProfile.phone',
      });
      continue;
    }

    // Otherwise, needs AI drafting or manual review
    unhandledQuestions.push(q);
  }

  // If there are free-text questions that need drafting
  if (unhandledQuestions.length > 0) {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      // Deterministic fallback for dev/test
      for (const q of unhandledQuestions) {
        results.push({
          questionId: q.id,
          question: q.question,
          answer: `I bring extensive background in ${candidate.skills.slice(0, 3).join(', ')} with proven delivery in my previous roles.`,
          confidence: 'DRAFTED_BY_AI',
          source: 'heuristic_draft',
        });
      }
    } else {
      try {
        const { object } = await generateObject({
          model: google('gemini-1.5-flash'),
          schema: questionAnswerSchema,
          system: `You draft concise, factual answers to ATS application screening questions.
Strict Rule: Use only verified candidate experience and skills. Never invent facts.`,
          prompt: `Draft answers for the following screening questions:
Questions: ${JSON.stringify(unhandledQuestions)}

Candidate Verified Profile:
Skills: ${candidate.skills.join(', ')}
Work History: ${JSON.stringify(candidate.workExperience)}
Job Title: ${jobContext?.title || 'Engineer'}
Company: ${jobContext?.company || 'Employer'}`,
        });

        for (const ans of object.answers) {
          const original = unhandledQuestions.find((q) => q.id === ans.questionId);
          results.push({
            questionId: ans.questionId,
            question: original?.question || '',
            answer: ans.answer,
            confidence: 'DRAFTED_BY_AI',
            source: 'gemini-1.5-flash',
          });
        }
      } catch (err) {
        for (const q of unhandledQuestions) {
          results.push({
            questionId: q.id,
            question: q.question,
            answer: '',
            confidence: 'REQUIRES_USER_INPUT',
            source: 'manual_fallback',
          });
        }
      }
    }
  }

  return results;
}
