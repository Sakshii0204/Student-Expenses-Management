# Student Expense Management System — Integrated Production Verification

> **Master Development Phase: Phase 4 Completed (Manual Verification, Automated Testing & Handover)**  
> **Team Lead**: Sakshi | **Stack**: MongoDB, Express.js, React.js, Node.js (MERN)

---

## 1. Integrated Architecture

The Student Expense Management System consolidates Developer 1 (Auth), Developer 2 (Expenses), and Developer 3 (Analytics & Budgets) into a unified, secure MERN-stack application backed by authoritative local MongoDB persistence.

```
StudentExpenseManagement/
├── integration/                  # UNIFIED RUNTIME APPLICATION
│   ├── client/                  # Single React/Vite/Tailwind Application
│   │   ├── src/
│   │   │   ├── components/      # Common UI, Tables, Modals, Filters, Charts
│   │   │   ├── context/         # AuthContext (JWT session lifecycle)
│   │   │   ├── services/        # Resilient API Client (bounded GET retries)
│   │   │   └── pages/           # Login, Register, Dashboard, Transactions, Analytics, Settings
│   │   └── package.json
│   └── server/                  # Single Express API Gateway
│       ├── config/              # Shared MongoDB Connection Pool
│       ├── controllers/         # budget.controller.js
│       ├── middleware/          # Centralized JWT Auth, Error Handlers
│       ├── models/              # Budget.js
│       ├── routes/              # /api/auth, /api/expenses, /api/analytics, /api/budgets
│       └── server.js            # Unified Server Entrypoint (Port 5000)
│
├── developer1/                   # Developer 1 Contribution: Authentication & Security
│   ├── client/                  # Auth reference UI
│   └── server/                  # User Model, Auth Controllers (bcrypt, JWT)
│
├── developer2/                   # Developer 2 Contribution: Expense Core Management
│   ├── client/                  # Expense Tables, Modals, Filters, Summary widgets
│   └── server/                  # Expense Model, CRUD + Pagination + CSV export
│
├── developer3/                   # Developer 3 Contribution: Dashboard, Reports & Analytics
│   ├── client/                  # KPI Cards, Donut Allocation, Monthly Trend Charts
│   └── server/                  # Aggregation Pipelines & Reporting logic
│
├── shared/                       # Cross-Module Architecture & Formal Contracts
│   ├── contracts/               # Response Envelope, Auth, Expense, Analytics & Budget Contracts
│   └── documentation/           # Architecture, API Specifications, Integration Plan
│
├── tests/                        # Phase 4 Automated Integration Test Suites (65 tests)
│   ├── 01_auth_security.test.js
│   ├── 02_data_isolation.test.js
│   ├── 03_expense_crud.test.js
│   ├── 04_analytics_dashboard.test.js
│   ├── 05_monthly_budget.test.js
│   ├── 06_csv_export.test.js
│   ├── 07_persistence_restart.test.js
│   ├── test_helper.js
│   └── run_all_tests.js
│
├── package.json                  # Root orchestration, unified dependencies & scripts
├── .gitignore                    # Global git ignore rules (protects .env & node_modules)
├── .env.example                  # Environment configuration template
└── README.md                     # Master documentation
```

---

## 2. Verified Features & Quality Assurance

### 1. Authoritative MongoDB Persistence
* Controllers across Auth, Expenses, Analytics, and Budgets verify active database state via single connection pool (`mongoose.connection.readyState === 1`).
* Disconnection produces HTTP `503 Service Unavailable` with descriptive errors; in-memory fallback mock bypasses are rejected.
* All queries and mutations strictly enforce student data isolation using authenticated `req.user.id`.

### 2. Multi-User Isolation & Security
* User A cannot access, update, delete, or export User B's records by forging identifiers.
* Password hashing verified via `bcryptjs` (passwords stored as `$2...` salt hashes, never plaintext).
* Protected endpoints enforce JWT Bearer tokens; tokens and password hashes are never returned in public payload responses.

### 3. Server-Side Expense CRUD, Search & Pagination
* Complete CRUD operations verified for expenses (`amount`, `category`, `date`, `description`, `paymentMethod`).
* Multi-field filtering (category, date range) and case-insensitive description search executed before pagination.
* Pagination metadata includes: `total`, `page`, `limit`, `totalPages`, `hasNextPage`, `hasPrevPage`.

### 4. CSV Expense Export Protection
* `GET /api/expenses/export/csv` exports authenticated user's records formatted to RFC 4180.
* Protection against spreadsheet formula injection: cells beginning with `=`, `+`, `-`, `@`, `\t`, `\r` are sanitized with apostrophe prefix.
* Quotes, commas, and multiline values are escaped cleanly.

### 5. Monthly Budgets & Threshold Warning Alerts
* Upserts budget per user and month (`YYYY-MM`).
* Real-time utilization calculation from actual current-month persisted expenses:
  * Utilization = `(spent / budget) * 100`
  * Remaining = `Math.max(0, budget - spent)`
* Visual thresholds:
  * **Normal State** (< 80%)
  * **Warning State** (≥ 80% to < 100%)
  * **Exceeded State** (≥ 100%)

---

## 3. Verified Development & Testing Commands

Open PowerShell in `e:\student-expences-managment`:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Run Automated Tests (Phase 4 Master Suite)
```powershell
npm.cmd test
```
* Runs all 65 automated tests across 7 suites against local MongoDB `student_expense_db`.
* Uses isolated test accounts and automatically purges test records on completion.

### Start Integrated Full-Stack Application
```powershell
npm.cmd run dev
```
* **Frontend**: `http://localhost:5173`
* **Backend**: `http://localhost:5000`
* **Health Endpoint**: `http://localhost:5000/api/health`

### Build Frontend Production Bundle
```powershell
npm.cmd run build:client
```
* Compiles optimized Vite production bundle in `integration/client/dist/`.

---

## 4. Environment Configuration

Copy `.env.example` to `.env` in the project root:
```powershell
Copy-Item .env.example .env
```

Required variables:
* `PORT=5000`
* `MONGODB_URI=mongodb://127.0.0.1:27017/student_expense_db`
* `JWT_SECRET=your_secure_secret_key`
* `CLIENT_URL=http://localhost:5173`
* `VITE_API_BASE_URL=http://localhost:5000/api`

---

## 5. Troubleshooting Guide

| Issue | Root Cause | Solution |
|---|---|---|
| `503 Authoritative database is not connected` | Duplicate Mongoose package installed in subdirectory or MongoDB service stopped | Ensure only root `node_modules` holds Mongoose. Run `net start MongoDB` if local service is stopped. |
| `PSSecurityException` | PowerShell script restriction on `npm.ps1` | Run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` or execute `npm.cmd`. |
| Port 5000 in use | Lingering Node backend daemon | Run: `Get-NetTCPConnection -LocalPort 5000 \| ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }` |
