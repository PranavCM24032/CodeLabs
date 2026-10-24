# ⚡ CodeLab — Hackathon Management & Evaluation Platform

> **"Every Commit Tells a Story."**  
> A production-grade multi-role platform for hackathon administration, team lifecycle, Git repository inspection, dynamic rubric evaluation, and real-time leaderboards.

---

## ⏱️ 10-Second Architecture TL;DR

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CODELAB                                   │
├────────────────────┬────────────────────┬──────────────────────────────┤
│  PARTICIPANT       │  JUDGE / ADMIN     │  SUPERADMIN                  │
│  • Team Formation  │  • Evaluation Form │  • Event Lifecycle           │
│  • Track Selection │  • Rubric Scoring  │  • Dynamic Rubric Builder    │
│  • Repo Submission │  • Queue Filter    │  • Score Release & Overrides │
│  • SHA Freeze Lock │  • Reports & CSV   │  • User RBAC & Audit Logs    │
└────────────────────┴────────────────────┴──────────────────────────────┘
                         ▲
                         │  (Firebase Auth + Firestore Rules)
                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│  STACK: React 19 • TypeScript • Vite • Tailwind CSS • Express • Vercel  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart (30 Seconds)

### 1. Install & Run Locally
```bash
# Install dependencies
npm install

# Start local server (Runs fullstack Express + Vite on port 3000)
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Available Scripts
| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Express backend (`server.ts`) with tsx runner |
| `npm run build` | Builds Vite production bundle into `/dist` |
| `npm run lint` | Runs TypeScript typechecker (`tsc --noEmit`) |
| `npm run preview`| Previews the production build locally |

---

## 👥 Roles & Pre-Configured Accounts

The system supports strict **Role-Based Access Control (RBAC)** across three tiers:

| Role | Pre-Configured User | Source | Permissions |
| :--- | :--- | :--- | :--- |
| **Superadmin** | `pranavpaunikar.ml24@sbjit.edu.in` | Platform Owner / `staff-users.json` | Full governance, event creation, rubric schema builder, score release gate, user role management |
| **Admin (Judge)**| `auron.sbjitmr@gmail.com` | `data/staff-users.json` | Access judging queue, fill dynamic rubric scores, review repo SHAs, export reports |
| **Participant** | `paunikarpranav58@gmail.com` / New Users | `data/participants.json` / `/register` | Form/join teams (6-char code), claim track, submit Git repo, view released feedback |

> **Note on Access Control**: The app reads allowed roles from `data/staff-users.json` and `data/participants.json` via `/api/auth/check-access`, backed by Firestore security rules.

---

## 📁 Project Directory Map

```text
codelabs/
├── api/                       # Vercel serverless entry point
│   └── index.ts               # Exports Express app from server.ts
├── data/                      # Local role allowlists & seed records
│   ├── staff-users.json       # Superadmins and Judges
│   └── participants.json      # Registered participant list
├── src/
│   ├── components/            # Reusable components
│   │   ├── common/            # Navbar, footer, protected route wrappers
│   │   └── ui/                # Buttons, inputs, modals
│   ├── context/
│   │   └── AuthContext.tsx    # Firebase authentication & session state
│   ├── pages/
│   │   ├── public/            # LandingPage, EventsDirectory, PublicLeaderboard, Login, Register
│   │   ├── participant/       # ParticipantDashboard, ProblemsPage, TeamsPage, SubmissionPage, Results
│   │   ├── admin/             # AdminDashboard, JudgingQueue, EvaluationForm, AdminReports
│   │   └── superadmin/        # SuperadminDashboard, UsersManagement, SchemaBuilder, Scoring, Settings
│   ├── services/
│   │   ├── firestoreService.ts# Typed Firestore CRUD, queries, and listeners
│   │   └── authAllowlist.ts   # Backend role verification hook
│   ├── types/                 # Shared TypeScript interfaces & models
│   ├── App.tsx                # Client-side router & route protection
│   └── main.tsx               # Application root
├── server.ts                  # Express backend (API routes, similarity engine, CSV export)
├── firestore.rules            # Cloud Firestore security rules
├── vercel.json                # Vercel deployment & URL rewrites
└── vite.config.ts             # Vite build configuration
```

---

## 🌐 API Endpoints (`server.ts`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Healthcheck & server metadata |
| `GET` | `/api/auth/allowed-users` | Returns list of configured staff and participants |
| `GET` | `/api/auth/check-access?email=...` | Validates email role permissions before authentication |
| `POST` | `/api/analysis/run-similarity` | 3-gram token Jaccard distance code similarity engine |
| `ALL` | `/api/export/leaderboard-csv` | Generates verified CSV export of leaderboard standings |

---

## ☁️ Deployment (Vercel)

The app is pre-configured for one-click deployment on **Vercel**:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Serverless API**: Handled via `api/index.ts` → `server.ts`
- **Rewrites**: Configured in [`vercel.json`](file:///c:/codelabs/vercel.json) for client-side routing & `/api/*` endpoints.

---

## 🛡️ Security Highlights
1. **Commit Freezing**: Captures and freezes the exact Git commit SHA at submission deadline to prevent post-deadline tampering.
2. **Firestore Security Rules**: Role-based rules enforce that participants cannot edit evaluations or escalate roles.
3. **Audit Trail**: Superadmin overrides and role updates are recorded with immutable SHA log entries.