🎯 Overview
Traditional internship and project allocation systems rely on keyword matching and manual screening — failing to accurately evaluate what candidates can actually do. SkillSync solves this by replacing guesswork with data.

SkillSync is a full-stack web platform that intelligently matches candidates to internships and projects using weighted skill competency scoring, NLP-powered resume parsing, and a fully transparent match breakdown — so candidates always know exactly where they stand and what to improve.

✨ Features
For Candidates
📄 Smart Resume Parsing — Upload a PDF resume; skills, projects, and experience are auto-extracted using spaCy NLP
📊 Match Score — See a percentage score with a full skill-by-skill breakdown for every posting
🎯 Gap Guidance — Get told exactly which skills to learn to become eligible
🏆 Transparent Rankings — See where you rank among all applicants
🔔 Invite Notifications — Accept or reject recruiter invitations in-app
For Recruiters
📝 Post Internships & Projects — Create listings with required skills and custom weights
📈 Ranked Candidate Lists — View candidates sorted by match score automatically
🔔 One-Click Notifications — Send invites to top candidates instantly
✏️ Manage Postings — Edit, update, or delete your listings anytime
👤 Company Profile — Manage your company details and branding
🏗️ Architecture
┌─────────────────────┐
│   React/Vite SPA    │   TypeScript + Tailwind + Shadcn UI
│   (port 8080)       │
└────────┬────────────┘
         │ HTTP REST
         ▼
┌────────────────────────┐
│  Node.js / Express API │   Express 5 + Prisma + Zod
│  (port 5000)           │
│  9 route modules       │
└────────┬───────────────┘
         │ Internal HTTP        ┌───────────────┐
         ▼                      │  PostgreSQL   │
┌────────────────────────┐      │  (10 models)  │
│  Python / FastAPI      │      └───────▲───────┘
│  (port 8000)           │              │
│  Resume parsing + NLP  │          Prisma ORM
│  Score calculation     │
└────────────────────────┘
🔧 Tech Stack
Layer	Technologies
Frontend	React 18, TypeScript, Vite 5, Tailwind CSS, Shadcn UI, React Router, TanStack Query
Backend API	Node.js, Express 5, Prisma 5, PostgreSQL, JWT, bcrypt, Zod 4
NLP Service	Python 3.11, FastAPI, spaCy, pdfminer.six, Custom Skill Taxonomy (200+ skills)
🧮 Match Score Algorithm
Score = (Σ candidate_proficiency × skill_weight) / (Σ 5 × skill_weight) × 100
Required Skill	Weight	Candidate Proficiency	Contribution	Max
Python	5	4	20	25
Django	4	0 (missing)	0	20
SQL	3	3	9	15
Total			29	60
Score = 48% → Below 80% threshold → Gap guidance provided

The system also expands skills using a built-in taxonomy (e.g. React → JavaScript, Flask → Python).

🚀 Getting Started
Prerequisites
Node.js v20+ | Python 3.11+ | PostgreSQL
1. Clone & Setup Database
bash
git clone https://github.com/YOUR_USERNAME/skillsync.git
cd skillsync
sql
CREATE DATABASE skillsync_dev;
2. Node.js API
bash
cd backend/node-service
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npx prisma db push
npx prisma generate
npx prisma db seed
npm run dev        # → http://localhost:5000
3. Python NLP Service
bash
cd backend/python-service
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
python -m spacy download en_core_web_md
python main.py               # → http://localhost:8000
4. Frontend
bash
cd frontend
npm install
echo VITE_API_BASE_URL=http://localhost:5000 > .env
npm run dev                  # → http://localhost:8080
🔑 Sample Credentials
Run npx prisma db seed to populate sample data. Password for all accounts: password123

Role	Email	Name / Company
Candidate	alice@example.com	Alice Johnson
Candidate	bob@example.com	Bob Smith
Candidate	carol@example.com	Carol Williams
Recruiter	recruiter1@techcorp.com	TechCorp
Recruiter	recruiter2@startupai.com	StartupAI
📁 Project Structure
skillsync/
├── frontend/                    # React + Vite SPA
│   ├── src/
│   │   ├── pages/               # 19 pages (public + candidate + recruiter + admin)
│   │   ├── components/          # 10 custom + 49 Shadcn UI components
│   │   ├── contexts/            # Auth context
│   │   └── api/                 # Axios instance with interceptors
│   └── public/
├── backend/
│   ├── node-service/            # Express REST API
│   │   ├── src/
│   │   │   ├── routes/          # 9 route files, 25+ endpoints
│   │   │   ├── middleware/      # JWT auth + rate limiting
│   │   │   └── utils/          # JWT, error handling, Prisma client
│   │   └── prisma/
│   │       ├── schema.prisma    # 10 database models
│   │       └── seed.js          # Sample data seeder
│   └── python-service/          # FastAPI NLP microservice
│       ├── main.py              # Resume parsing + score calculation
│       └── skill_taxonomy.py    # 200+ skill mappings
└── render.yaml                  # One-click Render deployment config
🌐 API Endpoints
Auth
Method	Endpoint	Description
POST	/auth/signup	Register new user
POST	/auth/login	Login → JWT token
DELETE	/auth/account	Delete account
Candidates
Method	Endpoint	Description
POST	/candidates/resume	Upload PDF → NLP parsing
GET	/candidates/me	Get profile + skills
GET	/candidates/recommendations	Skill-based suggestions
Scores & Applications
Method	Endpoint	Description
POST	/scores/check/:postingId	Calculate match score
POST	/applications/:postingId	Apply (score ≥ 80%)
GET	/rankings/:postingId	Ranked candidate list
🤝 Contributing
Fork the repository
Create a feature branch: git checkout -b feature/amazing-feature
Commit your changes: git commit -m 'Add amazing feature'
Push to the branch: git push origin feature/amazing-feature
Open a Pull Request
📄 License
This project is licensed under the MIT License.
