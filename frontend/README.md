# SkillSync — Frontend

React + TypeScript web application for the SkillSync platform.

## Tech Stack

| Technology            | Version  | Purpose                     |
| --------------------- | -------- | --------------------------- |
| React                 | ^18.3    | UI framework                |
| TypeScript            | ^5.8     | Type safety                 |
| Vite                  | ^5.4     | Build tool & dev server     |
| Tailwind CSS          | ^3.4     | Utility-first styling       |
| Shadcn UI (Radix)     | latest   | 49 accessible UI components |
| React Router DOM      | ^6.30    | Client-side routing         |
| TanStack React Query  | ^5.83    | Server state & caching      |
| Axios                 | ^1.13    | HTTP client                 |
| Sonner                | ^1.7     | Toast notifications         |
| Recharts              | ^2.15    | Data visualization          |
| Zod + React Hook Form | ^3.25/^7 | Form validation             |
| Lucide React          | ^0.462   | Icon library                |
| date-fns              | ^3.6     | Date utilities              |

## Setup

```bash
npm install

# Create .env file
echo VITE_API_BASE_URL=http://localhost:5000 > .env

# Start dev server
npm run dev
```

Runs on `http://localhost:8080` by default.

## Environment Variables

| Variable            | Description     | Example                 |
| ------------------- | --------------- | ----------------------- |
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:5000` |

> Only variables prefixed with `VITE_` are exposed to the browser (Vite convention).

## Routes

### Public Routes

| Route     | Component | Description                   |
| --------- | --------- | ----------------------------- |
| `/`       | Landing   | Introduction & hero page      |
| `/signup` | Signup    | Registration with role select |
| `/login`  | Login     | Authentication                |

### Candidate Routes (Protected)

| Route                   | Component            | Description                              |
| ----------------------- | -------------------- | ---------------------------------------- |
| `/onboarding/candidate` | CandidateOnboarding  | Multi-step profile setup + resume upload |
| `/dashboard/candidate`  | CandidateDashboard   | Recommendations home                     |
| `/internships`          | CandidateInternships | Browse internships                       |
| `/projects`             | CandidateProjects    | Browse projects                          |
| `/internships/:id`      | InternshipDetail     | Detail + eligibility check + ranking     |
| `/projects/:id`         | ProjectDetail        | Detail + eligibility check + ranking     |
| `/applied`              | Applied              | Applied postings list                    |
| `/profile/candidate`    | CandidateProfile     | View/edit profile + resume re-upload     |

### Recruiter Routes (Protected)

| Route                        | Component           | Description                 |
| ---------------------------- | ------------------- | --------------------------- |
| `/onboarding/recruiter`      | RecruiterOnboarding | Company details setup       |
| `/dashboard/recruiter`       | RecruiterDashboard  | Posted listings overview    |
| `/post/internship`           | PostInternship      | Create new internship       |
| `/post/project`              | PostProject         | Create new project          |
| `/recruiter/internships/:id` | ManageInternship    | Manage internship posting   |
| `/recruiter/projects/:id`    | ManageProject       | Manage project posting      |
| `/profile/recruiter`         | RecruiterProfile    | View/edit recruiter profile |

## Project Structure

```
src/
├── api/axios.ts                 # Axios instance with auth interceptor
├── components/
│   ├── ui/                      # 49 Shadcn UI primitives
│   ├── ConfirmationModal.tsx    # Delete/action confirmation
│   ├── DashboardLayout.tsx      # Sidebar + main content wrapper
│   ├── FilterBar.tsx            # Search + filter controls
│   ├── Logo.tsx                 # SkillSync logo
│   ├── MatchScoreRing.tsx       # SVG circular score visualization
│   ├── NavLink.tsx              # Active-aware sidebar link
│   ├── NotificationDropdown.tsx # Bell icon + notification list
│   ├── Pagination.tsx           # Page controls
│   └── ProtectedRoute.tsx       # Auth + role guard
├── contexts/AuthContext.tsx     # Global auth state
├── pages/
│   ├── Landing.tsx              # Public landing page
│   ├── Login.tsx / Signup.tsx   # Auth pages
│   ├── candidate/              # 8 candidate pages
│   └── recruiter/              # 7 recruiter pages
└── App.tsx                      # All route definitions
```

## NPM Scripts

| Script    | Command        | Description              |
| --------- | -------------- | ------------------------ |
| `dev`     | `vite`         | Start dev server         |
| `build`   | `vite build`   | Production build         |
| `preview` | `vite preview` | Preview production build |
| `lint`    | `eslint .`     | Run linter               |
| `test`    | `vitest run`   | Run tests                |
