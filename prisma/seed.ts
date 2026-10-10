import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AutoApplyPilot database seed...');

  // 1. Create Canonical Candidate User
  const passwordHash = await bcrypt.hash('PilotCandidate2026!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'candidate@autoapplypilot.dev' },
    update: {
      name: 'Divyanshu Tailor',
      passwordHash,
    },
    create: {
      email: 'candidate@autoapplypilot.dev',
      name: 'Divyanshu Tailor',
      passwordHash,
    },
  });

  console.log(`👤 User created: ${user.email} (${user.id})`);

  // 2. Create Candidate Profile & Fact Bank
  const profile = await prisma.candidateProfile.upsert({
    where: { userId: user.id },
    update: {
      rawCvText: `Divyanshu Tailor - Senior Full Stack Engineer
Summary: 5+ years experience building cloud-scale web architectures, serverless microservices, and AI integrations using TypeScript, React, Next.js, Node.js, and PostgreSQL.`,
      extractedSkills: [
        'TypeScript',
        'React',
        'Next.js',
        'Node.js',
        'PostgreSQL',
        'Tailwind CSS',
        'Docker',
        'GraphQL',
        'Microservices',
        'REST APIs',
      ],
      workExperience: [
        {
          title: 'Senior Full Stack Engineer',
          company: 'TechCorp Solutions',
          duration: '2022 - Present',
          highlights: [
            'Architected edge microservices processing 5M+ daily requests on TypeScript and PostgreSQL.',
            'Engineered compliant Next.js web applications with 99+ Lighthouse performance scores.',
          ],
        },
        {
          title: 'Software Engineer',
          company: 'Innovate Labs',
          duration: '2020 - 2022',
          highlights: [
            'Built RESTful APIs and distributed data pipelines using Node.js and PostgreSQL.',
            'Collaborated with product teams to ship weekly releases with zero downtime.',
          ],
        },
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'State University of Technology',
          year: '2020',
        },
      ],
      preVerifiedAnswers: {
        workAuthorization: 'Citizen / Authorized to work without sponsorship',
        noticePeriod: '2 weeks',
        expectedSalary: '$140,000 / year',
        remotePreference: 'Remote Preferred / Open to Hybrid',
      },
    },
    create: {
      userId: user.id,
      rawCvText: `Divyanshu Tailor - Senior Full Stack Engineer
Summary: 5+ years experience building cloud-scale web architectures, serverless microservices, and AI integrations using TypeScript, React, Next.js, Node.js, and PostgreSQL.`,
      extractedSkills: [
        'TypeScript',
        'React',
        'Next.js',
        'Node.js',
        'PostgreSQL',
        'Tailwind CSS',
        'Docker',
        'GraphQL',
        'Microservices',
        'REST APIs',
      ],
      workExperience: [
        {
          title: 'Senior Full Stack Engineer',
          company: 'TechCorp Solutions',
          duration: '2022 - Present',
          highlights: [
            'Architected edge microservices processing 5M+ daily requests on TypeScript and PostgreSQL.',
            'Engineered compliant Next.js web applications with 99+ Lighthouse performance scores.',
          ],
        },
        {
          title: 'Software Engineer',
          company: 'Innovate Labs',
          duration: '2020 - 2022',
          highlights: [
            'Built RESTful APIs and distributed data pipelines using Node.js and PostgreSQL.',
            'Collaborated with product teams to ship weekly releases with zero downtime.',
          ],
        },
      ],
      education: [
        {
          degree: 'Bachelor of Science in Computer Science',
          institution: 'State University of Technology',
          year: '2020',
        },
      ],
      preVerifiedAnswers: {
        workAuthorization: 'Citizen / Authorized to work without sponsorship',
        noticePeriod: '2 weeks',
        expectedSalary: '$140,000 / year',
        remotePreference: 'Remote Preferred / Open to Hybrid',
      },
    },
  });

  console.log(`📄 Candidate profile created with ${profile.extractedSkills.length} verified skills.`);

  // 3. Seed Realistic Job Postings
  const jobsData = [
    {
      externalId: 'gh-cloudflare-101',
      sourceProvider: 'greenhouse',
      title: 'Senior Systems Engineer — Edge Compute',
      company: 'Cloudflare',
      location: 'Remote (Worldwide)',
      workplaceType: 'REMOTE',
      description: 'Building global edge infrastructure using TypeScript, React, Node.js, and PostgreSQL.',
      externalUrl: 'https://boards.greenhouse.io/cloudflare/jobs/101',
      salaryRange: '$140,000 - $170,000',
      applicationMode: 'AUTOMATIC' as const,
      score: 94,
      matchedSkills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Microservices'],
      missingSkills: ['Rust'],
      initialStatus: 'APPLIED' as const,
    },
    {
      externalId: 'gh-stripe-202',
      sourceProvider: 'greenhouse',
      title: 'Staff Platform API Engineer',
      company: 'Stripe',
      location: 'Remote / Seattle, WA',
      workplaceType: 'REMOTE',
      description: 'Designing developer-first payment APIs with TypeScript, Node.js, Docker, and distributed systems.',
      externalUrl: 'https://boards.greenhouse.io/stripe/jobs/202',
      salaryRange: '$165,000 - $200,000',
      applicationMode: 'AUTOMATIC' as const,
      score: 92,
      matchedSkills: ['TypeScript', 'REST APIs', 'PostgreSQL', 'Docker'],
      missingSkills: ['Ruby'],
      initialStatus: 'INTERVIEW' as const,
    },
    {
      externalId: 'lev-leverdemo-303',
      sourceProvider: 'lever',
      title: 'Backend Software Architect',
      company: 'Lever Tech',
      location: 'San Francisco, CA (Hybrid)',
      workplaceType: 'HYBRID',
      description: 'Building high-throughput microservices using Node.js, PostgreSQL, and Docker.',
      externalUrl: 'https://jobs.lever.co/leverdemo/303',
      salaryRange: '$150,000 - $185,000',
      applicationMode: 'AUTOMATIC' as const,
      score: 88,
      matchedSkills: ['Node.js', 'PostgreSQL', 'Docker', 'REST APIs'],
      missingSkills: ['Kubernetes'],
      initialStatus: 'APPLIED' as const,
    },
    {
      externalId: 'gh-figma-404',
      sourceProvider: 'greenhouse',
      title: 'Principal Frontend Systems Engineer',
      company: 'Figma',
      location: 'San Francisco, CA (Hybrid)',
      workplaceType: 'HYBRID',
      description: 'Scaling collaborative design surfaces with React, TypeScript, and WebGL.',
      externalUrl: 'https://boards.greenhouse.io/figma/jobs/404',
      salaryRange: '$170,000 - $210,000',
      applicationMode: 'AUTOMATIC' as const,
      score: 86,
      matchedSkills: ['TypeScript', 'React', 'Tailwind CSS'],
      missingSkills: ['WebGL', 'Wasm'],
      initialStatus: 'QUEUED' as const,
    },
    {
      externalId: 'li-designcraft-505',
      sourceProvider: 'linkedin',
      title: 'Lead Frontend Architect',
      company: 'DesignCraft Labs',
      location: 'Remote',
      workplaceType: 'REMOTE',
      description: 'Architecting next-generation creative tooling on Next.js and Tailwind CSS.',
      externalUrl: 'https://www.linkedin.com/jobs/view/3892041285',
      salaryRange: '$135,000 - $160,000',
      applicationMode: 'ASSISTED' as const,
      score: 79,
      matchedSkills: ['React', 'Next.js', 'Tailwind CSS'],
      missingSkills: ['Micro-frontends'],
      initialStatus: 'NEEDS_REVIEW' as const,
    },
    {
      externalId: 'ind-firstbank-606',
      sourceProvider: 'indeed',
      title: 'In-House Core Banking Engineer',
      company: 'First Financial Systems',
      location: 'New York, NY (HQ Office)',
      workplaceType: 'ON_SITE',
      description: 'Building secure on-premises banking transaction engines.',
      externalUrl: 'https://www.indeed.com/viewjob?jk=1a89b04fc921e54a',
      salaryRange: '$130,000 - $155,000',
      applicationMode: 'ASSISTED' as const,
      score: 75,
      matchedSkills: ['PostgreSQL', 'Node.js', 'REST APIs'],
      missingSkills: ['Java', 'PCI-DSS'],
      initialStatus: 'SCORED' as const,
    },
    {
      externalId: 'ind-datacenter-707',
      sourceProvider: 'indeed',
      title: 'On-Premises Infrastructure Lead',
      company: 'Datacenter Logistics Inc',
      location: 'Dallas, TX (On-site)',
      workplaceType: 'ON_SITE',
      description: 'Managing physical server clusters, networking hardware, and Linux kernels.',
      externalUrl: 'https://www.indeed.com/viewjob?jk=2b91c05da132f65b',
      salaryRange: '$110,000 - $135,000',
      applicationMode: 'ASSISTED' as const,
      score: 64,
      matchedSkills: ['Docker'],
      missingSkills: ['Hardware', 'BGP', 'Cisco'],
      initialStatus: 'DISCOVERED' as const,
    },
  ];

  for (const job of jobsData) {
    const jobRecord = await prisma.jobPosting.upsert({
      where: {
        sourceProvider_externalId: {
          sourceProvider: job.sourceProvider,
          externalId: job.externalId,
        },
      },
      update: {
        title: job.title,
        company: job.company,
        location: job.location,
        workplaceType: job.workplaceType,
        description: job.description,
        externalUrl: job.externalUrl,
        salaryRange: job.salaryRange,
        applicationMode: job.applicationMode,
      },
      create: {
        externalId: job.externalId,
        sourceProvider: job.sourceProvider,
        title: job.title,
        company: job.company,
        location: job.location,
        workplaceType: job.workplaceType,
        description: job.description,
        externalUrl: job.externalUrl,
        salaryRange: job.salaryRange,
        applicationMode: job.applicationMode,
      },
    });

    // Create Match Score
    await prisma.jobMatchScore.create({
      data: {
        jobPostingId: jobRecord.id,
        score: job.score,
        reasoning: `Strong alignment with verified candidate profile competencies. Match score calculated at ${job.score}%.`,
        matchedSkills: job.matchedSkills,
        missingSkills: job.missingSkills,
        matchLevel: job.score >= 80 ? 'HIGH_MATCH' : job.score >= 60 ? 'MEDIUM_MATCH' : 'LOW_MATCH',
      },
    });

    // Create Application
    const app = await prisma.application.create({
      data: {
        userId: user.id,
        jobPostingId: jobRecord.id,
        status: job.initialStatus,
        mode: job.applicationMode,
        generatedCoverLetter: `Dear Hiring Team at ${job.company},\n\nI am excited to apply for the ${job.title} role. With extensive verified experience across ${job.matchedSkills.join(', ')}, I look forward to discussing how my skills contribute to ${job.company}'s goals.\n\nSincerely,\nDivyanshu Tailor`,
      },
    });

    await prisma.applicationLog.create({
      data: {
        applicationId: app.id,
        step: 'SEED_INITIALIZATION',
        details: `Application initialized in status ${job.initialStatus} with match score ${job.score}%.`,
      },
    });

    console.log(`💼 Seeded job: ${job.company} - ${job.title} (${job.initialStatus})`);
  }

  console.log('✅ AutoApplyPilot database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

