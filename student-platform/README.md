# EduWork — A Learning & Experience Platform for Students

EduWork is a web-based platform that bridges the gap between academic learning and industry expectations. It combines structured learning modules, project-based experience, industry challenges, mentorship, and a digital portfolio into a single system for students, mentors, companies, and administrators.

Built as part of CPT6324 Final Year Project 2 (FYP2) at Multimedia University (MMU), Trimester 2610.

---

## Features

### Student
- Browse and complete structured learning modules with quizzes
- Submit project work and receive mentor feedback
- Browse and submit industry challenges with GitHub repository validation
- Track learning progress and project completion
- Request mentorship and chat with mentors in real time
- Build and publish a public digital portfolio
- Manage independent projects

### Mentor
- Review and respond to mentorship requests
- Review student project submissions and provide feedback
- Communicate with students via real-time messaging

### Company
- Register and manage a company profile
- Post, edit, and manage industry challenges
- Review student challenge submissions and provide feedback
- Communicate with students via real-time messaging

### Administrator
- Approve or reject pending mentor and company accounts
- Create and manage learning modules and content
- Moderate company-posted challenges
- Monitor system activity

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS, Radix UI |
| State Management | Zustand |
| Server State | TanStack Query |
| Backend / Database | Supabase (PostgreSQL + RLS) |
| Authentication | Supabase Auth (Email/Password + Google OAuth) |
| Real-Time | Supabase Realtime |
| File Storage | Supabase Storage |
| Form Validation | react-hook-form, Zod |
| Testing | Vitest, jsdom |
| CI | GitHub Actions |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project (database + auth configured)

### Installation

```bash
git clone https://github.com/your-username/student-platform.git
cd student-platform
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running Locally

```bash
npm run dev
```

### Running Tests

```bash
# Run test suite once
npm run test

# Watch mode
npm run test:watch

# Interactive UI
npm run test:ui
```

### Production Build

```bash
npm run build
```

---

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── auth/         # Auth guards and login components
│   ├── features/     # Feature-specific components (modules, challenges, etc.)
│   ├── layout/       # Sidebar, navbar, mobile menu
│   └── ui/           # Shared Radix UI based components
├── hooks/            # Custom TanStack Query hooks
├── pages/            # Page components (grouped by role)
│   ├── admin/
│   ├── company/
│   └── mentor/
├── services/         # Supabase service functions
├── stores/           # Zustand auth store
├── test/             # Shared test utilities and mocks
└── utils/            # Helper functions
```

---

## Database

The database schema is managed through Supabase. The master setup script is at `supabase-setup.sql`. All tables have Row Level Security (RLS) enabled with role-based policies.

---

## CI/CD

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push:
1. ESLint
2. Vitest (206 tests across 23 files)
3. Production build

Results are reported to the GitHub Actions job summary.

---

## Author

**Haziq Izzuddin Bin Ahmad Tarmidzi**
Student ID: 1211112293
Bachelor of Computer Science (Hons.) in Software Engineering
Multimedia University (MMU)
Supervisor: Dr. Hafiz Adnan Hussain
