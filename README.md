# 🛡️ TrustGuard AI — Intelligent Security, Privacy & Pre-Dispatch Checkpoint

> **The final security checkpoint before you send, paste, or submit sensitive content.**  
> Built with modern React, Node.js/Express, Google Gemini 2.5 Flash, and Supabase PostgreSQL.

---

## 📌 Executive Overview

In the modern AI-assisted workspace, sensitive data leaks happen in seconds. Developers, executives, and professionals routinely copy and paste proprietary code, database credentials, customer PII, banking details, and confidential memos into public LLM prompts, emails, and support tickets.

**TrustGuard AI** acts as an intelligent, transparent security and privacy gateway. It intercepts content before dispatch, running multi-layer deterministic pattern scanning combined with Google Gemini contextual intelligence to:
1. **Detect** sensitive PII, API tokens, passwords, financial records, and social-engineering threats.
2. **Verify** every flagged span verbatim against the original input to eliminate hallucinations.
3. **Score** threat levels transparently on an objective 0–100 risk scale.
4. **Remediate** through automated, reversible redaction with zero data destruction.
5. **Enforce Decisions** empowering users to choose **Use Redacted**, **Send Anyway**, or **Discard**.
6. **Audit** all security checks and user decisions in an immutable, user-isolated audit log.

---

## 🏗️ System Architecture

TrustGuard AI follows a strict **zero-leakage, backend-isolated architecture**:

```text
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│   (Tailwind-styled Modern SaaS, Zero Secrets Exposed)   │
└───────────────────────────┬────────────────────────────┘
                            │ Bearer JWT (HTTPS)
                            ▼
┌────────────────────────────────────────────────────────┐
│               TrustGuard Node.js Backend               │
│     (Express 4, Helmet, Rate-Limiting, Zod Guards)     │
├───────────────────────────┬────────────────────────────┤
│   Deterministic Engine    │    Exact-Span Verifier     │
│   (Regex, Secrets, PII)   │   (Hallucination Barrier)  │
├───────────────────────────┼────────────────────────────┤
│   Redaction Transformer   │   Signal-Based Scorer      │
└─────────────┬─────────────────────────────┬────────────┘
              │ GEMINI_API_KEY              │ Service Role Key
              ▼                             ▼
┌───────────────────────────┐ ┌──────────────────────────┐
│      Google Gemini AI     │ │   Supabase PostgreSQL    │
│    (Contextual Threats,   │ │ (Isolated Users & Scans, │
│    Social Engineering)    │ │   Row Level Security)    │
└───────────────────────────┘ └──────────────────────────┘
```

### 🔒 Security Principles
* **Zero Client-Side Secrets:** Neither the Google Gemini API key nor the Supabase Service Role key is ever accessible to the browser. Only the backend communicates with external providers.
* **Verbatim Exact-Span Verification:** Flags returned by AI must match character-for-character within the raw input text. Unmatched hallucinations are discarded immediately.
* **Data Isolation:** User identity is strictly derived from verified JWT claims (`req.user.id`). User A cannot view, inspect, or modify User B's scans (`404 Not Found`).
* **Privacy-Preserving UI:** Raw sensitive content is masked by default on the Scan Detail screen with deliberate toggle disclosure.

---

## ✨ Key Features

* **Real Multi-Layer Analysis:** Hybrid engine combining fast deterministic regex detection for known credentials (AWS, GitHub, Google, Slack, private keys, credit cards, emails, phones) with Google Gemini AI contextual analysis (social engineering, urgency, impersonation).
* **Objective Risk Scoring:** 0–100 deterministic risk engine mapping to `LOW`, `MEDIUM`, `HIGH`, and `CRITICAL` risk tiers with full score breakdown.
* **Instant Protected Remediation:** Automated redaction replacing sensitive tokens with clean bracket placeholders (e.g. `[EMAIL]`, `[API_TOKEN]`, `[CREDIT_CARD]`) with single-click clipboard copying.
* **Three PRD Decision Actions:**
  * **Use Redacted:** Logs protected usage and copies sanitized content.
  * **Send Anyway:** Requires explicit warning confirmation before marking unredacted dispatch.
  * **Discard:** Flags analysis as discarded while preserving audit trail integrity.
* **User-Specific History & Dashboard:** Real-time metrics calculating Total Checks, High Risk Checks, Protected Checks, and Discarded Checks directly from the authenticated database.

---

## 📁 Repository Structure

```text
AI TRUST/
├── .env.example              # Frontend environment configuration template
├── .gitignore                # Root gitignore protecting all secrets & build artifacts
├── index.html                # Application root HTML document
├── package.json              # Frontend npm dependencies and scripts
├── vite.config.js            # Vite build configuration
├── src/                      # React Frontend Source
│   ├── components/           # Modular UI components (Analysis, Risk, Modal, Layout)
│   ├── context/              # AppContext state provider (Auth, Scans, Toasts)
│   ├── data/                 # Isolated marketing landing preview fixtures
│   ├── pages/                # Application routes:
│   │   ├── LandingPage.jsx   # Public product landing page
│   │   ├── LoginPage.jsx     # Authentication signin & registration
│   │   ├── AnalyzePage.jsx   # Core security analysis checkpoint
│   │   ├── ScanDetailsPage.jsx # Database-driven scan detail & action workflow
│   │   ├── HistoryPage.jsx   # User-specific historical audit trail
│   │   └── DashboardPage.jsx # Live risk overview and metrics
│   └── services/
│       └── api.js            # Central API client with JWT bearer injection
│
└── backend/                  # Node.js Express Backend Service
    ├── .env.example          # Backend environment configuration template
    ├── .gitignore            # Backend gitignore protecting secrets & node_modules
    ├── package.json          # Backend npm dependencies and scripts
    ├── database/
    │   └── schema.sql        # Supabase PostgreSQL schema with RLS policies
    └── src/
        ├── app.js            # Express application setup, security middleware, routes
        ├── server.js         # HTTP server entrypoint
        ├── config/           # Environment and Supabase client configuration
        ├── controllers/      # Route controllers (Auth, Analyze, Scans, Health)
        ├── middleware/       # Authentication, Rate Limiting, Validation, Errors
        ├── routes/           # REST endpoints
        ├── services/         # Detection, AI Analyzer, Span Verifier, Scorer, Redaction
        └── utils/            # JWT helpers, password hashing
```

---

## 🚀 Quickstart & Local Setup

### Prerequisites
* **Node.js** v18+ (v20+ recommended)
* **npm** v9+
* A **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))
* A **Supabase Project** (optional for database mode; automatic in-memory fallback included)

---

### 1. Clone the Repository

```bash
git clone https://github.com/pranaykhodade1922-dot/TrustGuard.git
cd TrustGuard
```

---

### 2. Backend Configuration & Setup

Navigate to the `backend` directory and install dependencies:

```bash
cd backend
npm install
```

Create a local `.env` file from the example:

```bash
cp .env.example .env
```

Configure your environment variables in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase Credentials (optional for in-memory mode)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Secret (minimum 32 characters)
JWT_SECRET=your-random-jwt-secret-minimum-32-chars-long

# Google Gemini AI Key (strictly backend-only)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

#### Optional: Apply Supabase Database Schema
To enable persistent PostgreSQL storage with Row Level Security:
1. Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql).
2. Copy and execute the contents of [`backend/database/schema.sql`](backend/database/schema.sql).

Start the backend server:

```bash
npm start
```

The backend starts at `http://localhost:5000` with health probe at `/api/health`.

---

### 3. Frontend Configuration & Setup

In the root directory, install dependencies:

```bash
npm install
```

Create the frontend `.env` file:

```bash
cp .env.example .env
```

Ensure `VITE_API_URL` points to your backend:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the Vite development server:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📡 REST API Reference

All protected endpoints require the HTTP header:
`Authorization: Bearer <token>`

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| `GET` | `/api/health` | No | Service and database connectivity health probe |
| `POST` | `/api/auth/signup` | No | Register new user account with bcrypt password hashing |
| `POST` | `/api/auth/login` | No | Authenticate user credentials and receive JWT |
| `GET` | `/api/auth/me` | Yes | Get authenticated user profile from token |
| `POST` | `/api/analyze` | Yes | Run hybrid security scan (regex + Gemini AI + span verifier) |
| `GET` | `/api/scans` | Yes | List all scans belonging strictly to authenticated user |
| `GET` | `/api/scans/:id` | Yes | Retrieve scan detail with ownership enforcement |
| `PATCH` | `/api/scans/:id/action` | Yes | Update scan decision (`SEND_ANYWAY`, `USE_REDACTED`, `DISCARD`) |

---

## 🧪 Verification & Testing

TrustGuard includes comprehensive automated test suites covering authentication, hybrid AI analysis, ownership isolation, and decision workflows:

```bash
# In the backend directory:
cd backend

# Run comprehensive Phase 3 Ownership & Decision Action Suite
node test-phase3.mjs

# Run Full End-to-End Simulation
node test-e2e-phase3.mjs
```

To validate the frontend build:

```bash
# In the root directory:
npm run build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
