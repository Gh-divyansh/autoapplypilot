# AutoApplyPilot ✈️

> **Production-grade Autonomous Job Discovery, Match Evaluation & Application Portal** with ATS Integrations (Greenhouse, Lever, Arbeitnow, Adzuna) and In-Browser Chrome Extension Companion (LinkedIn, Naukri, Indeed, Instahyre, Wellfound).

---

## 🌟 Overview

**AutoApplyPilot** is a full-stack, compliance-first job application platform designed to automate and assist the end-to-end recruitment search:

- **100% Real Live Postings**: Zero mock or fabricated listings.
- **Multi-Source Aggregation**:
  - **Live ATS Integrations**: Direct job board APIs for Greenhouse and Lever.
  - **Aggregated Job Boards**: Arbeitnow (Remote) and Adzuna (India).
  - **In-Browser Companion (Chrome Extension)**: Safely ingests and auto-fills applications on LinkedIn, Naukri.com, Indeed, Instahyre, and Wellfound from authenticated browser sessions without risking bot bans.
- **Accurate Workplace Classification**: Intelligent heuristic and NLP engine categorizing opportunities as `REMOTE`, `ON_SITE`, or `HYBRID`.
- **CV & Skill Matching**: Evaluates alignment against candidate CVs, generating heuristic match scores (0–100%), matching skills, and identifying missing requirements.
- **Application CRM & Kanban Pipeline**: Track applications across `DISCOVERED`, `SCORED`, `QUEUED`, `APPLYING`, `APPLIED`, `NEEDS_REVIEW`, and `INTERVIEW`.
- **Autonomous Daemon Scheduler**: Background cron pipeline discovering and scoring roles on customizable intervals.

---

## 🏗️ Architecture & Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions, API Routes)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Database & ORM**: PostgreSQL with [Prisma 5](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with Lucide Icons
- **Companion**: Manifest V3 Chrome Extension (`extension/`)
- **Testing**: [Vitest](https://vitest.dev/) (100+ Unit & Integration Tests)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ or 20+
- PostgreSQL database (or Docker)
- GitHub account

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Gh-divyansh/job-apply-portal.git
cd job-apply-portal

# Install dependencies
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your configuration:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/autoapplypilot?schema=public"
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-api-key"
CRON_SECRET="your-secure-cron-secret"

# Optional: Free Adzuna API credentials for India jobs
ADZUNA_APP_ID="your_adzuna_app_id"
ADZUNA_APP_KEY="your_adzuna_app_key"
```

### 4. Database Setup
```bash
# Push Prisma schema to PostgreSQL
npx prisma db push

# Generate Prisma Client
npx prisma generate
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the portal.

---

## 🧩 Chrome Extension Companion

To ingest and autofill jobs on LinkedIn, Naukri, Indeed, Instahyre, and Wellfound:

1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked** (top-left).
4. Select the `extension/` directory in this repository.
5. Browse any supported job site and click **Sync Visible Jobs to Portal** in the extension popup.

---

## 🧪 Testing & Verification

```bash
# Run test suite (105+ tests)
npm test

# Production build check
npm run build
```

---

## 📜 License
MIT License. Created by Divyanshu Tailor.
