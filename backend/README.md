# TrustGuard AI — Backend Service

A security-first, production-ready REST API service for **TrustGuard AI** — an AI-powered security, privacy, and trust assistant.

---

## Stack

* **Runtime:** Node.js (ES Modules)
* **Framework:** Express.js
* **Database:** PostgreSQL (via Supabase)
* **Authentication:** JWT (JSON Web Tokens)
* **Password Hashing:** bcrypt (12 salt rounds)
* **Schema Validation:** Zod
* **Security & Hardening:** Helmet, CORS, express-rate-limit

---

## Directory Structure

```text
backend/
├── database/
│   └── schema.sql                # Supabase PostgreSQL schema & RLS policies
├── src/
│   ├── config/
│   │   ├── env.js                # Environment variable parsing and validation
│   │   └── supabase.js           # Supabase server-side client setup
│   ├── controllers/
│   │   └── auth.controller.js    # Authentication request handlers
│   ├── middleware/
│   │   ├── auth.middleware.js    # JWT Bearer token authentication guard
│   │   ├── error.middleware.js   # Centralized error handler
│   │   ├── rateLimit.middleware.js # Rate limiting (General & Auth)
│   │   └── validate.middleware.js  # Zod schema validation middleware
│   ├── routes/
│   │   ├── auth.routes.js        # /api/auth routes
│   │   └── health.routes.js      # /api/health route
│   ├── schemas/
│   │   └── auth.schema.js        # Zod validation schemas
│   ├── services/
│   │   └── auth.service.js       # Business logic, hashing & user store
│   ├── utils/
│   │   ├── jwt.js                # JWT sign & verify utilities
│   │   └── password.js           # bcrypt password hash & compare
│   ├── app.js                    # Express app configuration & middleware
│   └── server.js                 # HTTP listener & graceful shutdown
├── .env.example                  # Environment configuration template
├── .gitignore                    # Environment & node_modules exclusions
├── package.json
└── README.md
```

---

## Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your configuration values in `.env`:

```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Supabase Credentials (from your Supabase Project Settings -> API)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# JWT Configuration
JWT_SECRET=your-secure-random-jwt-secret-at-least-32-chars
JWT_EXPIRES_IN=7d
```

> **Note:** If `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are not set during early local evaluation, the service automatically runs in local development mode using an in-memory repository.

### 3. Database Migration (Supabase)

Run the SQL migration script located in [`database/schema.sql`](./database/schema.sql) within your Supabase SQL Editor to provision the `users` and `scans` tables with Row Level Security (RLS) enabled.

### 4. Run the Development Server

```bash
npm run dev
```

For production execution:

```bash
npm start
```

### 5. Run the Automated Test Suite

```bash
npm test
```

---

## API Endpoints

### 1. Health Check

Verifies server health and uptime status.

* **Method:** `GET`
* **Path:** `/api/health`
* **Response (200 OK):**

```json
{
  "success": true,
  "service": "TrustGuard API",
  "status": "healthy",
  "timestamp": "2026-09-29T11:40:00.000Z"
}
```

---

### 2. User Registration

Registers a new user account with bcrypt password hashing.

* **Method:** `POST`
* **Path:** `/api/auth/signup`
* **Rate Limit:** 20 attempts / 15 minutes
* **Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

* **Validation Rules:**
  - `email`: Required, valid email format, trimmed, normalized to lowercase.
  - `password`: Required, minimum 8 characters.

* **Success Response (201 Created):**

```json
{
  "success": true,
  "message": "Account created successfully.",
  "user": {
    "id": "e458e0a3-d021-4f3d-8ab1-197e4e1a0691",
    "email": "user@example.com"
  },
  "token": "<jwt_token_string>"
}
```

* **Duplicate Account Response (409 Conflict):**

```json
{
  "success": false,
  "message": "An account with this email already exists."
}
```

---

### 3. User Login

Authenticates user credentials and returns a signed JWT.

* **Method:** `POST`
* **Path:** `/api/auth/login`
* **Rate Limit:** 20 attempts / 15 minutes
* **Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

* **Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Login successful.",
  "user": {
    "id": "e458e0a3-d021-4f3d-8ab1-197e4e1a0691",
    "email": "user@example.com"
  },
  "token": "<jwt_token_string>"
}
```

* **Invalid Credentials Response (401 Unauthorized):**

```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

---

### 4. Authenticated Identity Verification (Protected Test Route)

Returns the authenticated token payload for the current bearer session.

* **Method:** `GET`
* **Path:** `/api/auth/me`
* **Headers:** `Authorization: Bearer <token>`
* **Success Response (200 OK):**

```json
{
  "success": true,
  "message": "Authenticated profile retrieved.",
  "user": {
    "sub": "e458e0a3-d021-4f3d-8ab1-197e4e1a0691",
    "email": "user@example.com",
    "iat": 1790661600,
    "exp": 1791266400
  }
}
```

---

## Security Architecture

1. **Password Security:** Salted bcrypt hashing with cost factor 12. Plaintext passwords are never logged or stored.
2. **Timing & Enumeration Defense:** Generic error messages prevent user enumeration on login attempts.
3. **CORS Isolation:** Cross-Origin Resource Sharing is locked to the configured `FRONTEND_URL` (`http://localhost:5173`).
4. **HTTP Header Hardening:** `helmet` sets standard defensive headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, etc.).
5. **Rate Limiting:** IP-based sliding window rate limiters protect both the general API (100 req/15 min) and authentication endpoints (20 req/15 min).
6. **Data Privacy Considerations:** The database schema is designed with privacy and zero-retention principles. Raw input storage is minimized and decoupled from persistent user logs.
