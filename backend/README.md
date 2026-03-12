# SkillSync — Backend

Dual-service backend: Node.js/Express main API + Python/FastAPI NLP microservice.

## Architecture

```
[Frontend] → HTTP → [Node.js API :5000] → Internal HTTP → [Python Service :8000]
                            │
                            ▼
                     [PostgreSQL DB]
```

The frontend ONLY communicates with the Node.js API. The Python service is an internal dependency.

---

## Node.js Service (`/node-service`)

### Tech Stack

| Technology   | Version   | Purpose                      |
| ------------ | --------- | ---------------------------- |
| Express.js   | ^5.2      | HTTP framework               |
| Prisma       | ^5.22     | Type-safe ORM                |
| PostgreSQL   | latest    | Relational database          |
| JWT + bcrypt | ^9.0/^6.0 | Auth & password hashing      |
| Zod          | ^4.3      | Request validation           |
| Multer       | ^2.1      | File upload handling         |
| Axios        | ^1.13     | HTTP calls to Python service |
| nodemon      | ^3.1      | Auto-restart dev server      |

### Setup

```bash
cd node-service
npm install

# Create .env file (see Environment Variables below)
cp .env.example .env

# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed sample data
npx prisma db seed

# Start dev server
npm run dev
```

### Environment Variables

```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/skillsync_dev?schema=public"
JWT_SECRET="your-strong-random-secret"
PYTHON_SERVICE_URL=http://localhost:8000
```

### API Endpoints

#### Auth (`/auth`)

| Method | Endpoint        | Description       |
| ------ | --------------- | ----------------- |
| POST   | `/auth/signup`  | Register new user |
| POST   | `/auth/login`   | Login → JWT token |
| DELETE | `/auth/account` | Delete account    |

#### Candidates (`/candidates`)

| Method | Endpoint                      | Description                |
| ------ | ----------------------------- | -------------------------- |
| PUT    | `/candidates/onboarding`      | Save onboarding data       |
| POST   | `/candidates/resume`          | Upload PDF for NLP parsing |
| GET    | `/candidates/me`              | Get profile with skills    |
| PUT    | `/candidates/profile`         | Update profile             |
| GET    | `/candidates/recommendations` | Skill-based suggestions    |

#### Recruiters (`/recruiters`)

| Method | Endpoint                 | Description           |
| ------ | ------------------------ | --------------------- |
| PUT    | `/recruiters/onboarding` | Save company details  |
| GET    | `/recruiters/me`         | Get recruiter profile |
| PUT    | `/recruiters/profile`    | Update company info   |

#### Postings (`/postings`)

| Method | Endpoint        | Description                |
| ------ | --------------- | -------------------------- |
| POST   | `/postings`     | Create posting             |
| GET    | `/postings`     | List (paginated, filtered) |
| GET    | `/postings/:id` | Get single posting         |
| PUT    | `/postings/:id` | Update (owner only)        |
| DELETE | `/postings/:id` | Delete (owner only)        |

#### Scores & Applications

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| POST   | `/scores/check/:postingId` | Calculate match score |
| POST   | `/applications/:postingId` | Apply (score ≥ 80%)   |
| DELETE | `/applications/:postingId` | Withdraw application  |
| GET    | `/applications/mine`       | List applied postings |

#### Rankings & Notifications

| Method | Endpoint                    | Description           |
| ------ | --------------------------- | --------------------- |
| GET    | `/rankings/:postingId`      | Ranked candidate list |
| POST   | `/notifications/notify`     | Send invite           |
| GET    | `/notifications/mine`       | Get notifications     |
| PUT    | `/notifications/:id/accept` | Accept invite         |
| PUT    | `/notifications/:id/reject` | Reject invite         |

### Database Schema (10 Models)

| Model                | Purpose                                                      |
| -------------------- | ------------------------------------------------------------ |
| **User**             | Authentication (email, passwordHash, role)                   |
| **CandidateProfile** | Candidate data (name, phone, projects JSON, experience JSON) |
| **RecruiterProfile** | Company data (companyName, companySize)                      |
| **Skill**            | Candidate skills (skillName, proficiency 1-5)                |
| **Posting**          | Job/project listings (title, type, description, deadline)    |
| **PostingSkill**     | Required skills per posting (skillName, weight 1-5)          |
| **Application**      | Candidate applications (candidateId, postingId, withdrawn)   |
| **MatchScore**       | Cached scores (score, breakdown JSON, gaps JSON, isStale)    |
| **Notification**     | In-app notifications (type: GENERAL/INVITE, actionTaken)     |

### Source Files

```
src/
├── index.js              # Express app, middleware, error handler
├── middleware/auth.js     # JWT verification + role checking
└── routes/
    ├── auth.js            # Signup, Login, Delete
    ├── candidates.js      # Profile, Onboarding, Resume
    ├── recruiters.js      # Company Profile
    ├── postings.js        # CRUD Postings
    ├── scores.js          # Match Score
    ├── applications.js    # Apply, Withdraw
    ├── rankings.js        # Ranked Lists
    ├── notifications.js   # In-App Notify
    └── recommendations.js # Skill Suggestions
```

---

## Python Service (`/python-service`)

### Tech Stack

| Technology               | Purpose                  |
| ------------------------ | ------------------------ |
| FastAPI                  | ASGI web framework       |
| spaCy (`en_core_web_md`) | Named Entity Recognition |
| pdfminer.six             | PDF text extraction      |
| Custom Skill Taxonomy    | 200+ skill mappings      |
| Uvicorn                  | ASGI server              |

### Setup

```bash
cd python-service
python -m venv venv

# Activate: Windows
venv\Scripts\activate
# Activate: macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python -m spacy download en_core_web_md

python main.py
```

### API Endpoints

| Method | Endpoint           | Description                 |
| ------ | ------------------ | --------------------------- |
| GET    | `/health`          | Health check                |
| POST   | `/parse-resume`    | Parse PDF → structured data |
| POST   | `/calculate-score` | Calculate match score       |

### Resume Parsing Pipeline

```
PDF → pdfminer.six → Raw text → Section detection → Personal info (spaCy NER)
                                                   → Skills (200+ known skills)
                                                   → Projects (char-level parser)
                                                   → Experience
```

Key features:

- PUA character handling (`\uf0b7` from Wingdings)
- Character-level bullet splitting
- Continuation line merging
- Skill taxonomy expansion (Flask → Python, React → JavaScript)

### Score Algorithm

```
Score = (Σ candidate_proficiency × skill_weight) / (Σ 5 × skill_weight) × 100
```

Threshold: **80%** for eligibility. Gap guidance provided when below threshold.

### Source Files

```
main.py            # FastAPI routes + parsing logic
skill_taxonomy.py  # 200+ skill-to-parent mappings
requirements.txt   # Python dependencies
```
