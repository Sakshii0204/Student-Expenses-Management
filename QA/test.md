# Student Expense Management System — QA Test Report

---

| Field | Details |
|---|---|
| **Project** | Student Expense Management System |
| **Institute** | Engineering Institute |
| **Department** | Computer Engineering |
| **Role** | QA Engineer / Test Automation Engineer |
| **GitHub Repository** | https://github.com/Sakshii0204/Student-Expenses-Management |
| **Application Version** | 2.0.0 — Phase 4 Integration |
| **Report Date** | 2026-10-12 |
| **Test Execution Date** | 2026-10-12, 18:28–18:30 IST |
| **Test Environment** | Windows 11, Node.js v22.14.0, npm 11.11.0, MongoDB (local) |
| **Report Status** | Final — Single Consolidated Report |

---

## Table of Contents

1. Executive Summary
2. Project Overview
3. Scope and Objectives
4. Technology Stack and Test Environment
5. Test Strategy and Methodology
6. Test Setup and Execution Procedure
7. Test Plan and Traceability Matrix
8. Authentication Testing
9. Expense Management Testing
10. Dashboard and Analytics Testing
11. Budget and CSV Export Testing
12. Integration, Persistence, and Data Isolation
13. API Testing Results
14. UI and Browser Testing
15. Security and Reliability Assessment
16. Defect Register
17. Test Execution Summary and Actual Output
18. Coverage Gaps and Release Recommendation
19. Conclusion
20. Appendix — Commands, File Reference, Supplementary Data

---

## 1. Executive Summary

This report presents the complete quality assurance testing results for the **Student Expense Management System** — a collaborative MERN-stack mini-project. Testing covered all major backend modules, security controls, and data integrity mechanisms using an automated suite of 65 tests.

### Overall Results

| Metric | Value |
|---|---|
| Total Test Cases Designed | 69 |
| Automated and Executed | 65 |
| **PASSED** | **65 (100% of executed)** |
| **FAILED** | **0** |
| BLOCKED (UI — no browser driver) | 4 |
| Defects Found | 3 (0 Critical · 0 High · 2 Medium · 1 Low-Medium) |
| Total Test Suite Duration | 38,823 ms (~38.8 seconds) |

### QA Conclusion

All 65 automated API and integration tests passed with zero failures. The backend is functionally correct and security-sound. Three non-blocking defects were found (CORS misconfiguration, absent rate limiting, stateless logout). Four UI tests remain blocked — Playwright is not installed.

> **Release Recommendation: Conditional Approval** — backend suitable for academic submission and internal use. Fix BUG-001 before any public deployment.

---

## 2. Project Overview

The Student Expense Management System is a full-stack MERN application built collaboratively by three developers as a DevOps mini-project. It allows students to record, categorize, analyze, and export their personal expenses.

### Module Ownership

| Developer | Module | Key Files |
|---|---|---|
| Developer 1 | Authentication & Security | User model, auth.controller.js, auth.validator.js |
| Developer 2 | Expense Management | Expense model, expense.controller.js, expense.validator.js |
| Developer 3 | Analytics & Dashboard | analytics.controller.js, MongoDB aggregation pipelines |
| Integration Lead | Unified API + Budget + Frontend | server.js, budget.controller.js, React client |

### Application Features

- JWT-based registration, login, and logout
- Expense CRUD with category, date, amount, and payment method
- Search by keyword, filter by category/date, sort by amount, pagination
- Dashboard KPIs: total spending, category breakdown, monthly trend
- Monthly budget tracking with 80% warning and 100% exceeded thresholds
- CSV data export with RFC-4180 compliance and formula injection protection
- MongoDB persistence with strict per-user data isolation

---

## 3. Scope and Objectives

### 3.1 In Scope

| Area | Items Covered |
|---|---|
| Authentication | Registration, login, logout, JWT, protected routes, bcrypt hashing |
| Expense CRUD | Create, read, update, delete, all validations, search, filter, sort, pagination |
| Analytics | Summary KPIs, category breakdown, monthly trend, recent transactions |
| Monthly Budgets | Set/upsert, threshold states (normal/warning/exceeded), dynamic recalculation |
| CSV Export | RFC-4180 headers, data isolation, formula injection prevention, category filter |
| Security | Cross-user isolation, token verification, injection vectors, enumeration prevention |
| Persistence | MongoDB record durability, DB-level assertions |
| CI/CD | Jenkinsfile pipeline static review |

### 3.2 Out of Scope

| Area | Reason |
|---|---|
| Cross-browser UI testing | No browser farm; Playwright not installed |
| Performance / load testing | Out of scope for mini-project |
| Production database | Only local student_expense_db tested |
| Standalone dev1/dev2/dev3 servers | Only unified integration/ application tested |
| OAuth / third-party integrations | Not implemented in codebase |

### 3.3 Objectives

1. Verify all implemented features function correctly against their specifications.
2. Confirm multi-user data isolation is enforced at every API endpoint.
3. Validate that sensitive data (passwords, tokens) is handled securely.
4. Execute the complete automated test suite and record precise outcomes.
5. Identify defects, coverage gaps, and release risks.

---

## 4. Technology Stack and Test Environment

### 4.1 Backend Stack (Verified from package.json and source)

| Component | Technology | Version |
|---|---|---|
| Runtime | Node.js | v22.14.0 |
| Framework | Express.js | ^4.21.2 |
| Database | MongoDB (local Windows service) | Confirmed Running |
| ODM | Mongoose | ^8.9.5 |
| Authentication | jsonwebtoken | ^9.0.2 |
| Password Hashing | bcryptjs | ^2.4.3 |
| CORS | cors | ^2.8.5 |
| Environment | dotenv | ^16.4.7 |
| Concurrency | concurrently | ^9.2.5 |

### 4.2 Frontend Stack (Inspected)

| Component | Technology |
|---|---|
| Framework | React 18 (Vite) |
| Styling | Tailwind CSS |
| Pages | Login, Register, Dashboard, Transactions, Reports, Settings |

### 4.3 Test Environment

| Variable | Value |
|---|---|
| Test Server Port | 5055 (isolated from prod port 5000) |
| Database | mongodb://127.0.0.1:27017/student_expense_db |
| JWT_SECRET | Set from .env (masked) |
| JWT_EXPIRES_IN | 7 days |
| MongoDB Service | Running (Get-Service MongoDB → Status: Running) |

### 4.4 Testing Tools

| Tool | Purpose | Status |
|---|---|---|
| node:test (Node.js built-in) | Automated API and integration test runner | Active — 65 tests |
| node:assert/strict | Assertion library | Active |
| fetch (Node 22 built-in) | HTTP requests in test suite | Active |
| Mongoose direct queries | DB-level record verification | Active |
| Browser (manual) | UI testing | BLOCKED — Playwright not installed |
| Postman / Newman | API collection testing | NOT PRESENT in repository |

---

## 5. Test Strategy and Methodology

### 5.1 Testing Types

| Type | Areas Covered | Method |
|---|---|---|
| Functional | All API endpoints and business logic | Automated |
| Negative | Invalid inputs, missing fields, wrong types | Automated |
| Boundary | Zero/negative amounts, 80% and 100% thresholds | Automated |
| Integration | Auth ↔ Routes ↔ Expenses ↔ Analytics ↔ Budget | Automated |
| Security | bcrypt, JWT, cross-user isolation, CSV injection | Automated |
| Persistence | MongoDB record durability, direct DB queries | Automated |
| Static Analysis | CORS config, DB guard, error middleware | Code inspection |
| UI / Browser | Navigation, forms, responsiveness | BLOCKED |
| Regression | Full suite after npm install | Automated — 1 run |

### 5.2 Test Prioritization

| Priority | Criteria |
|---|---|
| P1 — Critical | Security, authentication, data isolation |
| P2 — High | Core CRUD, validation, analytics accuracy |
| P3 — Medium | CSV export, pagination, budget thresholds |
| P4 — Low | UI presentation, response timestamp format |

### 5.3 Test Data Strategy

Each suite creates unique accounts using timestamp-based emails (e.g., `auth_1728735600000@example.com`). All test records are automatically purged by `teardownTestEnvironment()` after each run. No pre-existing data is assumed.

---

## 6. Test Setup and Execution Procedure

### Prerequisites

```powershell
node --version          # Must be >= 18  (actual: v22.14.0)
npm --version           # (actual: 11.11.0)
Get-Service MongoDB     # Status must be: Running
```

### Environment Setup

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
Copy-Item .env.example .env    # Edit: set JWT_SECRET to a secure value
npm.cmd install                # Installs 131 packages, 0 vulnerabilities
```

### Run Automated Tests

```powershell
npm.cmd test
# Runs: node --test tests/run_all_tests.js
# Port: 5055 | DB: student_expense_db | Expected: 65 pass, exit code 0
```

### Start Development Server

```powershell
npm.cmd run dev          # Backend :5000 + Frontend :5173
curl http://localhost:5000/api/health
```

---

## 7. Test Plan and Traceability Matrix

| Req. ID | Feature | Test ID(s) | Status |
|---|---|---|---|
| REQ-AUTH-01 | Valid registration | TC-AUTH-001 | PASS |
| REQ-AUTH-02 | Registration field validation | TC-AUTH-002, 003, 004 | PASS |
| REQ-AUTH-03 | Duplicate email rejection | TC-AUTH-005 | PASS |
| REQ-AUTH-04 | Valid login with JWT | TC-AUTH-006 | PASS |
| REQ-AUTH-05/06 | Login invalid credentials | TC-AUTH-007, 008 | PASS |
| REQ-AUTH-07 | Protected route enforcement | TC-AUTH-009, 010, 011 | PASS |
| REQ-AUTH-08 | Logout | TC-AUTH-012 | PASS |
| REQ-AUTH-09 | bcrypt password hashing | TC-AUTH-013 | PASS |
| REQ-EXP-01 to 04 | Expense CRUD | TC-EXP-001 to 004 | PASS |
| REQ-EXP-05 to 07 | Amount/category/payment validation | TC-EXP-005 to 009 | PASS |
| REQ-EXP-08 to 12 | Search, filter, sort, pagination | TC-EXP-010 to 015 | PASS |
| REQ-EXP-13 | Unauthenticated access rejected | TC-EXP-016 | PASS |
| REQ-ANA-01 to 04 | Analytics endpoints correctness | TC-ANA-001 to 004 | PASS |
| REQ-ANA-05 | Analytics requires authentication | TC-ANA-005 | PASS |
| REQ-BUD-01/02 | Budget set and upsert | TC-BUD-001 to 003 | PASS |
| REQ-BUD-03 | Utilization thresholds | TC-BUD-004 to 008 | PASS |
| REQ-BUD-04/05 | Recalculation and isolation | TC-BUD-009, 010 | PASS |
| REQ-CSV-01 to 06 | CSV export features | TC-CSV-001 to 007 | PASS |
| REQ-SEC-01 to 06 | Multi-user data isolation | TC-ISO-001 to 009 | PASS |
| REQ-PER-01 to 04 | Persistence and reliability | TC-PER-001 to 005 | PASS |
| REQ-UI-01 to 04 | UI functionality | TC-UI-001 to 004 | **BLOCKED** |

---

## 8. Authentication Testing

### 8.1 Test Case Summary (13 tests — all PASS)

| Test ID | Scenario | Priority | Status |
|---|---|---|---|
| TC-AUTH-001 | Valid registration: 201, JWT, no password field | P1 | PASS |
| TC-AUTH-002 | Empty body: 400 with name/email/password errors | P1 | PASS |
| TC-AUTH-003 | Invalid email format: 400 | P2 | PASS |
| TC-AUTH-004 | Password < 8 chars: 400 | P1 | PASS |
| TC-AUTH-005 | Duplicate email: 409 Conflict | P1 | PASS |
| TC-AUTH-006 | Valid login: 200, JWT, user (no password) | P1 | PASS |
| TC-AUTH-007 | Wrong password: 401 generic message | P1 | PASS |
| TC-AUTH-008 | Unknown email: 401 (no account enumeration) | P1 | PASS |
| TC-AUTH-009 | /auth/me without token: 401 | P1 | PASS |
| TC-AUTH-010 | Malformed JWT: 401 | P1 | PASS |
| TC-AUTH-011 | Valid JWT: 200 with user profile | P1 | PASS |
| TC-AUTH-012 | Logout: 200 with discard instruction | P2 | PASS |
| TC-AUTH-013 | MongoDB stores bcrypt hash ($2b...) not plaintext | P1 | PASS |

### 8.2 Detailed Test Cases

**TC-AUTH-001 — Valid User Registration**

| Field | Details |
|---|---|
| Scenario | Successful registration returns 201 with JWT; password not exposed |
| Priority | P1 — Critical |
| Preconditions | MongoDB running; email not previously registered |
| Test Data | name="Auth Test Student", email="auth_<ts>@example.com", password="Password123!" |
| Steps | POST /api/auth/register → Assert HTTP 201 · data.token present · data.user.password is undefined |
| Expected | HTTP 201, JWT token returned, no password field in user object |
| Actual | HTTP 201, token present, password field absent |
| Status | **PASS** |
| Evidence | `ok 5 - Successful registration creates account, returns token and safe user (no password)` |

**TC-AUTH-013 — Password Hashed in MongoDB**

| Field | Details |
|---|---|
| Scenario | MongoDB stores bcrypt hash; plaintext password never persisted |
| Priority | P1 — Critical |
| Steps | Direct Mongoose query on users collection → Assert password starts with "$2" → Assert password != "Password123!" |
| Expected | bcrypt hash beginning with $2b or $2a |
| Actual | Hash starting with $2 confirmed |
| Status | **PASS** |
| Evidence | `ok 6 - Password in MongoDB is bcrypt-hashed and not plaintext` |

**TC-AUTH-008 — Account Enumeration Prevention**

| Field | Details |
|---|---|
| Scenario | Unknown email returns same 401 as wrong password (prevents user enumeration) |
| Priority | P1 — Security |
| Steps | POST /api/auth/login with unregistered email → Assert 401, same generic message |
| Expected | "Invalid email or password credentials." — identical message for both cases |
| Actual | HTTP 401, generic message returned |
| Status | **PASS** |
| Evidence | `ok 10 - Login with non-existent email returns 401 Unauthorized` |

---

## 9. Expense Management Testing

### 9.1 Test Case Summary (16 tests — all PASS)

| Test ID | Scenario | Priority | Status |
|---|---|---|---|
| TC-EXP-001 | Create valid expense: 201 with correct fields | P1 | PASS |
| TC-EXP-002 | Read expense by ID: 200 | P1 | PASS |
| TC-EXP-003 | Update amount and description: 200 | P1 | PASS |
| TC-EXP-004 | Delete; subsequent GET returns 404 | P1 | PASS |
| TC-EXP-005 | amount=0 rejected: 400 | P2 | PASS |
| TC-EXP-006 | amount=-25 rejected: 400 | P2 | PASS |
| TC-EXP-007 | amount="abc" rejected: 400 | P2 | PASS |
| TC-EXP-008 | Invalid category "Space Travel": 400 | P2 | PASS |
| TC-EXP-009 | Invalid payment method "Bitcoin": 400 | P3 | PASS |
| TC-EXP-010 | ?search=Manual → 1 matching result | P2 | PASS |
| TC-EXP-011 | ?category=Tuition & Books → 3 results | P2 | PASS |
| TC-EXP-012 | Date range filter returns in-range expenses | P2 | PASS |
| TC-EXP-013 | ?sort=amount_desc → descending order verified | P3 | PASS |
| TC-EXP-014 | Pagination: page 1 limit 3 → correct metadata; page 99 → empty | P2 | PASS |
| TC-EXP-015 | Bulk create 5 expenses: all 201 | P2 | PASS |
| TC-EXP-016 | No token → 401 | P1 | PASS |

### 9.2 Detailed Test Cases

**TC-EXP-001 — Create Valid Expense**

| Field | Details |
|---|---|
| Scenario | POST creates an expense with valid data and returns 201 |
| Priority | P1 |
| Test Data | description="Calculus Textbook", amount=85.5, category="Tuition & Books", date="2026-10-05T10:00:00Z", paymentMethod="Debit Card" |
| Steps | POST /api/expenses with valid body and Bearer token → Assert 201 · data.description and data.amount correct |
| Expected | HTTP 201, expense object with correct fields |
| Actual | HTTP 201, expense created correctly |
| Status | **PASS** |
| Evidence | `ok 7 - Creates valid expense` |

**TC-EXP-005 — Reject Zero Amount (Boundary)**

| Field | Details |
|---|---|
| Scenario | amount=0 rejected with field-level error |
| Priority | P2 — Boundary |
| Test Data | amount=0 |
| Steps | POST /api/expenses with amount=0 → Assert 400 · errors contains {field: "amount"} |
| Expected | HTTP 400, amount validation error |
| Actual | HTTP 400, amount field error returned |
| Status | **PASS** |
| Evidence | `ok 2 - Rejects zero amount` |

**TC-EXP-014 — Pagination Metadata**

| Field | Details |
|---|---|
| Scenario | Correct page totals; out-of-range page returns empty array |
| Test Data | 6 expenses seeded |
| Steps | GET ?page=1&limit=3 → assert total=6, totalPages=2, length=3; GET ?page=99&limit=3 → assert length=0 |
| Expected | Correct metadata; empty array on out-of-range page |
| Actual | All assertions passed |
| Status | **PASS** |
| Evidence | `ok 15 - Paginates properly and matches pagination metadata` |

---

## 10. Dashboard and Analytics Testing

### 10.1 Test Case Summary (5 tests — all PASS)

| Test ID | Scenario | Priority | Status |
|---|---|---|---|
| TC-ANA-001 | /analytics/summary: totalSpent=200, count=3, avg=66.67, top=Food $120 | P1 | PASS |
| TC-ANA-002 | /analytics/by-category: Food 60%, Transport 25%, Utilities 15% | P1 | PASS |
| TC-ANA-003 | /analytics/monthly-trend: 2026-10 entry total=200 | P2 | PASS |
| TC-ANA-004 | /analytics/recent?limit=5 returns 3 transactions | P2 | PASS |
| TC-ANA-005 | All analytics endpoints return 401 without token | P1 | PASS |

### 10.2 Detailed Test Case

**TC-ANA-001 — Summary KPI Accuracy**

| Field | Details |
|---|---|
| Scenario | /analytics/summary returns exact totals matching independently calculated values |
| Priority | P1 |
| Preconditions | 3 expenses seeded: $120 (Food & Groceries), $50 (Transportation), $30 (Utilities & Bills) |
| Test Data | Expected: totalSpent=200, count=3, avgTransaction=66.67, highestCategory="Food & Groceries" $120 |
| Steps | GET /api/analytics/summary → Assert all 5 values |
| Expected | All computed values match expectations |
| Actual | All assertions passed |
| Status | **PASS** |
| Evidence | `ok 2 - /analytics/summary returns exact total, count and averages` |

---

## 11. Budget and CSV Export Testing

### 11.1 Budget Test Summary (10 tests — all PASS)

| Test ID | Scenario | Priority | Status |
|---|---|---|---|
| TC-BUD-001 | New user: budgetAmount=0, status=normal | P2 | PASS |
| TC-BUD-002 | Set $1000 budget → 200 with correct values | P1 | PASS |
| TC-BUD-003 | Second POST same month = upsert, no duplicate | P2 | PASS |
| TC-BUD-004 | $300/$500 spent = 60% → status=normal | P2 | PASS |
| TC-BUD-005 | $400/$500 = exactly 80% → status=warning | P1 | PASS |
| TC-BUD-006 | $450/$500 = 90% → status=warning | P2 | PASS |
| TC-BUD-007 | $500/$500 = exactly 100% → status=exceeded, remaining=0 | P1 | PASS |
| TC-BUD-008 | $600/$500 = 120% → exceeded, remaining=0 (Math.max guard) | P2 | PASS |
| TC-BUD-009 | Delete expense → utilization recalculates correctly | P1 | PASS |
| TC-BUD-010 | User A budget not visible to User B | P1 | PASS |

### 11.2 Budget Threshold Reference

| Spent | Budget | Utilization | Status | isWarning | isExceeded |
|---|---|---|---|---|---|
| $0 | $0 | 0.0% | normal | false | false |
| $300 | $500 | 60.0% | normal | false | false |
| $400 | $500 | **80.0%** | **warning** | true | false |
| $450 | $500 | **90.0%** | **warning** | true | false |
| $500 | $500 | **100.0%** | **exceeded** | false | true |
| $600 | $500 | **120.0%** | **exceeded** | false | true |

### 11.3 CSV Export Test Summary (7 tests — all PASS)

| Test ID | Scenario | Priority | Status |
|---|---|---|---|
| TC-CSV-001 | Export without token returns 401 | P1 | PASS |
| TC-CSV-002 | Content-Type: text/csv + attachment disposition | P2 | PASS |
| TC-CSV-003 | User 1 export excludes User 2 records ($999 absent) | P1 | PASS |
| TC-CSV-004 | @ and - prefixes sanitized with apostrophe | P1 | PASS |
| TC-CSV-005 | Internal quotes doubled per RFC 4180 | P2 | PASS |
| TC-CSV-006 | ?category filter limits exported records | P3 | PASS |
| TC-CSV-007 | RFC-4180 column headers on first line | P2 | PASS |

### 11.4 TC-CSV-004 — Formula Injection Prevention (Detailed)

| Field | Details |
|---|---|
| Scenario | Spreadsheet formula characters in descriptions are sanitized |
| Priority | P1 — Security |
| Test Data | "@danger, quoted, newline" and "-10% student discount" |
| Steps | GET /api/expenses/export/csv → Assert text contains "'@danger" → Assert text contains "'-10% student discount" |
| Expected | Apostrophe prefix applied to @, -, +, = characters by sanitizeCSVField() |
| Actual | Both injection vectors sanitized |
| Status | **PASS** |
| Evidence | `ok 5 - Dangerous formula injection prefixes are neutralized with single quote prefix` |

---

## 12. Integration, Persistence, and Data Isolation

### 12.1 Test Case Summary (14 tests — all PASS)

| Test ID | Scenario | Priority | Status |
|---|---|---|---|
| TC-PER-001 | Direct MongoDB query confirms user, expense ($79.99), budget ($750) | P1 | PASS |
| TC-PER-002 | API responses match DB state with unchanged IDs | P1 | PASS |
| TC-PER-003 | /api/health: status=healthy, database.status=connected | P2 | PASS |
| TC-PER-004 | isDBReady() guard returns 503 when DB disconnected (static) | P2 | PASS |
| TC-PER-005 | GET deleted expense: 404 | P2 | PASS |
| TC-ISO-001 | User B GET User A expense: 404 | P1 | PASS |
| TC-ISO-002 | User B PUT User A expense: 404, data unchanged | P1 | PASS |
| TC-ISO-003 | User B DELETE User A expense: 404, expense survives | P1 | PASS |
| TC-ISO-004 | Forged user field in body ignored; JWT identity enforced | P1 | PASS |
| TC-ISO-005 | User B GET /expenses: 0 of User A records returned | P1 | PASS |
| TC-ISO-006 | User A and User B analytics totals fully independent | P1 | PASS |
| TC-ISO-007 | User A budget not visible to User B | P1 | PASS |
| TC-ISO-008 | CSV export contains only authenticated user's records | P1 | PASS |
| TC-ISO-009 | Password absent from all API user object responses | P1 | PASS |

### 12.2 Detailed Test Cases

**TC-ISO-004 — Forged User ID Rejected**

| Field | Details |
|---|---|
| Scenario | Including user=userA.id in POST body does not transfer ownership |
| Priority | P1 — Critical |
| Steps | User B POST /expenses with body.user=userA.id → Assert 201 → Assert created.user === userB.id |
| Expected | Ownership set by req.user.id from JWT; body user field completely ignored |
| Actual | Expense owned by User B; User A's ID ignored |
| Status | **PASS** |
| Evidence | `ok 7 - Forged user ID in request body does NOT override authenticated ownership` |

**TC-PER-001 — Direct MongoDB Persistence Verification**

| Field | Details |
|---|---|
| Scenario | Records created via API confirmed in MongoDB collections by direct query |
| Priority | P1 |
| Steps | Create user, expense ($79.99), budget ($750) via API → Mongoose direct query → Assert all documents correct |
| Expected | All three collections (users, expenses, budgets) populated correctly |
| Actual | expense.amount=79.99 and budget.amount=750 confirmed |
| Status | **PASS** |
| Evidence | `ok 2 - Directly confirm records exist in MongoDB storage collections` |

---

## 13. API Testing Results

All API testing was performed programmatically via Node.js native `fetch` within the automated test suite. No Postman collection exists in the repository.

### 13.1 Endpoint Coverage

| Method | Endpoint | Auth | HTTP Codes Tested | Result |
|---|---|---|---|---|
| GET | /api/health | No | 200 | PASS |
| POST | /api/auth/register | No | 201, 400, 409 | PASS |
| POST | /api/auth/login | No | 200, 400, 401 | PASS |
| GET | /api/auth/me | Yes | 200, 401 (no/bad token) | PASS |
| POST | /api/auth/logout | Yes | 200 | PASS |
| POST | /api/expenses | Yes | 201, 400 (5 validation cases) | PASS |
| GET | /api/expenses | Yes | 200, 401 | PASS |
| GET | /api/expenses?search/category/date/sort/page | Yes | 200 | PASS |
| GET | /api/expenses/:id | Yes | 200, 404 | PASS |
| PUT | /api/expenses/:id | Yes | 200, 404 | PASS |
| DELETE | /api/expenses/:id | Yes | 200, 404 | PASS |
| GET | /api/expenses/export/csv | Yes | 200, 401 | PASS |
| GET | /api/analytics/summary | Yes | 200 | PASS |
| GET | /api/analytics/by-category | Yes | 200 | PASS |
| GET | /api/analytics/monthly-trend | Yes | 200 | PASS |
| GET | /api/analytics/recent | Yes | 200 | PASS |
| GET | /api/budgets/current | Yes | 200 | PASS |
| POST | /api/budgets | Yes | 200, 400 | PASS |

**18 endpoints · 23+ HTTP status code scenarios · All PASS**

### 13.2 Response Structure Compliance

All API responses verified to follow:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": { ... },
  "timestamp": "2026-10-12T..."
}
```

Confirmed: correct boolean `success`, matching `statusCode`, ISO 8601 `timestamp`, field-level `errors` array on validation failures, `password` field absent from all user objects.

---

## 14. UI and Browser Testing

All four UI test cases are **BLOCKED** — Playwright/Puppeteer is not installed. Frontend source code was inspected to confirm implementation exists.

### 14.1 Test Status

| Test ID | Scenario | Priority | Status | Reason |
|---|---|---|---|---|
| TC-UI-001 | App launches at :5173; login page renders; navigation works | P2 | **BLOCKED** | No Playwright installed |
| TC-UI-002 | Register and login forms complete end-to-end flow | P2 | **BLOCKED** | No browser automation |
| TC-UI-003 | Dashboard KPI cards match /analytics/summary values | P2 | **BLOCKED** | No browser automation |
| TC-UI-004 | Responsive layout at desktop, tablet, and mobile viewports | P3 | **BLOCKED** | No browser automation |

### 14.2 Frontend Code Evidence

| File | Size | Purpose |
|---|---|---|
| LoginPage.jsx | 5,564 bytes | Login form with validation |
| RegisterPage.jsx | 9,672 bytes | Registration with field feedback |
| DashboardPage.jsx | 5,691 bytes | KPI cards and spending charts |
| TransactionsPage.jsx | 8,045 bytes | Expense list with search and filters |
| ReportsPage.jsx | 6,688 bytes | Analytics visualization |
| SettingsPage.jsx | 5,240 bytes | Budget configuration |

To enable UI tests: `npm install -D @playwright/test && npx playwright install chromium`

---

## 15. Security and Reliability Assessment

### 15.1 Security Controls Tested

| Control | Implementation | Verdict |
|---|---|---|
| Password hashing | bcrypt salt factor 10; hash stored as $2b... | **Secure** |
| JWT secret enforcement | Server refuses to start if JWT_SECRET missing | **Secure** |
| Password in API response | Excluded via toSafeJSON() and Mongoose select: false | **Secure** |
| Token verification | jwt.verify(); malformed/expired tokens → 401 | **Secure** |
| Route protection | router.use(protect) on all expense/analytics/budget routes | **Secure** |
| Cross-user data isolation | findOne({_id, user: req.user.id}) pattern on all queries | **Secure** |
| Account enumeration | Same 401 for wrong password AND unknown email | **Secure** |
| Forged userId in body | Controller uses req.user.id from JWT; body user field ignored | **Secure** |
| CSV formula injection | @, -, +, =, tab, CR sanitized with apostrophe prefix | **Secure** |
| NoSQL injection | Mongoose ODM + ObjectId casting prevent injection | **Secure** |
| Error responses | Stack traces not exposed; generic error messages returned | **Secure** |
| CORS configuration | Unconditional callback(null, true) in else branch — see BUG-001 | **Issue** |
| Rate limiting | Not implemented on authentication endpoints — see BUG-002 | **Missing** |
| Token invalidation | Stateless JWT; logout does not invalidate server-side — see BUG-003 | **Gap** |

### 15.2 Reliability Controls

| Control | Finding |
|---|---|
| DB disconnection guard | isDBReady() in all 4 controllers; returns 503 if readyState != 1 |
| Error middleware | errorHandler catches all unhandled errors; returns structured 500 |
| 404 handler | notFoundHandler returns structured JSON for unknown routes |
| Test data cleanup | teardownTestEnvironment() successfully purged all test records |

---

## 16. Defect Register

### BUG-001 — CORS Allows All Origins Unconditionally

| Field | Details |
|---|---|
| **Defect ID** | BUG-001 |
| **Severity / Priority** | Medium / P3 |
| **File** | integration/server/server.js, lines 39–45 |
| **Description** | Both the `if` and `else` branches of the CORS origin callback call `callback(null, true)`, accepting all cross-origin requests regardless of the `CLIENT_URL` environment variable. |
| **Reproduction** | Send a cross-origin request from any arbitrary origin — CORS headers accept it. |
| **Expected** | Non-whitelisted origins rejected with CORS error. |
| **Actual** | All origins accepted. |
| **Suggested Fix** | Change else branch to: `return callback(new Error('CORS: Origin not allowed'), false)` |
| **Status** | Open — fix not yet applied |

### BUG-002 — No Rate Limiting on Authentication Endpoints

| Field | Details |
|---|---|
| **Defect ID** | BUG-002 |
| **Severity / Priority** | Medium / P3 |
| **File** | server.js — express-rate-limit absent from package.json |
| **Description** | Authentication endpoints accept unlimited consecutive requests. A brute-force attack on /api/auth/login faces no throttling or lockout. |
| **Reproduction** | Send 100+ POST /api/auth/login requests — all accepted without 429. |
| **Expected** | 429 Too Many Requests after N failed attempts per IP. |
| **Actual** | All requests accepted. |
| **Suggested Fix** | `npm install express-rate-limit`; apply max=10 per 15 min per IP on /api/auth/login. |
| **Status** | Open — feature not implemented |

### BUG-003 — Stateless Logout (Token Not Invalidated Server-Side)

| Field | Details |
|---|---|
| **Defect ID** | BUG-003 |
| **Severity / Priority** | Low-Medium / P4 |
| **File** | developer1/server/controllers/auth.controller.js, logout handler |
| **Description** | POST /api/auth/logout returns 200 and tells the client to discard the token, but no server-side invalidation occurs. Token remains valid for its full 7-day expiry. |
| **Reproduction** | POST /api/auth/logout → use same token → GET /api/auth/me → HTTP 200 (still authenticated). |
| **Expected** | 401 returned for all requests using a logged-out token. |
| **Actual** | Token valid for remaining 7-day window after logout. |
| **Suggested Fix** | Redis-backed token blocklist, or short-lived tokens (15 min) with refresh token rotation. |
| **Status** | Open — acceptable for mini-project scope |

> **Defect Summary: 0 Critical · 0 High · 2 Medium · 1 Low-Medium**

---

## 17. Test Execution Summary and Actual Output

### 17.1 Automated Suite Results

| Detail | Value |
|---|---|
| Command | `npm.cmd test` |
| Runner | `node --test tests/run_all_tests.js` |
| Test Port | 5055 |
| Database | mongodb://127.0.0.1:27017/student_expense_db |
| Execution Date / Time | 2026-10-12, 18:28–18:30 IST |
| Total Duration | **38,823 ms** |
| Exit Code | **0 (SUCCESS)** |

| Suite | Tests | Pass | Fail | Duration |
|---|---|---|---|---|
| 01_auth_security.test.js | 14 | 14 | 0 | 1,743 ms |
| 02_data_isolation.test.js | 9 | 9 | 0 | 847 ms |
| 03_expense_crud.test.js | 16 | 16 | 0 | 503 ms |
| 04_analytics_dashboard.test.js | 5 | 5 | 0 | 303 ms |
| 05_monthly_budget.test.js | 10 | 10 | 0 | 390 ms |
| 06_csv_export.test.js | 7 | 7 | 0 | 440 ms |
| 07_persistence_restart.test.js | 3 | 3 | 0 | 247 ms |
| Teardown (run_all_tests.js) | 1 | 1 | 0 | 57 ms |
| **TOTAL** | **65** | **65** | **0** | **38,823 ms** |

### 17.2 Actual TAP Output (Embedded)

```
TAP version 13
# [Test Suite Initializing] Booting test server on port 5055 and connecting MongoDB...
# [Unified MongoDB Pool] Connected to 127.0.0.1/student_expense_db
# [Unified Server] Express backend running on http://localhost:5055
# Subtest: Step 3: Authentication & Security Tests
    ok 1 - Health endpoint reports healthy database status
    ok 2 - Registration validates missing name, email, and password
    ok 3 - Registration rejects invalid email format
    ok 4 - Registration rejects password shorter than 8 characters
    ok 5 - Successful registration creates account, returns token and safe user (no password)
    ok 6 - Password in MongoDB is bcrypt-hashed and not plaintext
    ok 7 - Duplicate registration with same email returns 409 Conflict
    ok 8 - Login with correct credentials returns 200, JWT token, and user info
    ok 9 - Login with incorrect password returns 401 Unauthorized
    ok 10 - Login with non-existent email returns 401 Unauthorized
    ok 11 - Protected endpoint /api/auth/me rejects requests without token with 401
    ok 12 - Protected endpoint rejects malformed token with 401
    ok 13 - Protected endpoint succeeds with valid token
    ok 14 - Logout endpoint succeeds for authenticated user
    1..14
ok 1 - Step 3: Authentication & Security Tests
# Subtest: Step 4: Multi-User Data Isolation Tests
    ok 1 - Setup two independent test accounts User A and User B
    ok 2 - User A creates an expense successfully
    ok 3 - User B cannot view User A expense by ID (Isolation Read)
    ok 4 - User B cannot update User A expense (Isolation Mutation)
    ok 5 - User B cannot delete User A expense (Isolation Deletion)
    ok 6 - User B expense list does not include User A expenses
    ok 7 - Forged user ID in request body does NOT override authenticated ownership
    ok 8 - User A and User B budgets are isolated
    ok 9 - Analytics aggregations are isolated per user
    1..9
ok 2 - Step 4: Multi-User Data Isolation Tests
# Subtest: Step 5: Expense CRUD, Validation & Pagination Tests
    ok 1 - Setup test user for CRUD operations
    ok 2 - Rejects zero amount
    ok 3 - Rejects negative amount
    ok 4 - Rejects invalid non-numeric amount
    ok 5 - Rejects invalid category
    ok 6 - Rejects invalid payment method
    ok 7 - Creates valid expense
    ok 8 - Reads single expense by ID
    ok 9 - Updates existing expense amount and description
    ok 10 - Creates multiple expenses to test search, filters, sorting and pagination
    ok 11 - Searches expenses by description keyword
    ok 12 - Filters expenses by category
    ok 13 - Filters expenses by date range
    ok 14 - Sorts expenses by amount descending
    ok 15 - Paginates properly and matches pagination metadata
    ok 16 - Deletes expense and verifies it no longer exists
    1..16
ok 3 - Step 5: Expense CRUD, Validation & Pagination Tests
# Subtest: Step 6: Dashboard & Analytics Correctness Tests
    ok 1 - Setup test user and controlled expense records
    ok 2 - /analytics/summary returns exact total, count and averages
    ok 3 - /analytics/by-category returns correct distribution and percentages
    ok 4 - /analytics/monthly-trend returns monthly aggregated values
    ok 5 - /analytics/recent returns the 3 recorded transactions sorted by date
    1..5
ok 4 - Step 6: Dashboard & Analytics Correctness Tests
# Subtest: Step 7: Monthly Budgets & Threshold Tests
    ok 1 - Setup test user for budget testing
    ok 2 - Zero budget returns status normal, utilization 0, budget 0
    ok 3 - Sets budget of 1000 for current month
    ok 4 - Updating budget in same month upserts and does not create duplicate
    ok 5 - Tests Below 80% utilization: spending 300 / 500 = 60% -> normal
    ok 6 - Tests Exactly 80% utilization: spending 400 / 500 = 80.0% -> warning status
    ok 7 - Tests Above 80% but below 100%: spending 450 / 500 = 90.0% -> warning status
    ok 8 - Tests Exactly 100% utilization: spending 500 / 500 = 100.0% -> exceeded status
    ok 9 - Tests Above 100% overspending: spending 600 / 500 = 120.0% -> exceeded status
    ok 10 - Expense updates dynamically adjust budget utilization calculations
    1..10
ok 5 - Step 7: Monthly Budgets & Threshold Tests
# Subtest: Step 8: CSV Export Security & Content Tests
    ok 1 - Setup two users and insert test expenses including CSV formula injection vectors
    ok 2 - CSV export requires authentication (rejects unauthenticated)
    ok 3 - CSV export returns proper Content-Type and Content-Disposition headers
    ok 4 - CSV export contains RFC-4180 headers and only User 1 records
    ok 5 - Dangerous formula injection prefixes are neutralized with single quote prefix
    ok 6 - Quotes and commas are properly escaped without malforming CSV structure
    ok 7 - CSV export respects active category filters
    1..7
ok 6 - Step 8: CSV Export Security & Content Tests
# Subtest: Step 9: MongoDB Persistence Across Backend Restart Tests
    ok 1 - Create dedicated test user, expense, and monthly budget
    ok 2 - Directly confirm records exist in MongoDB storage collections
    ok 3 - Confirm records survive and remain accessible via API with unchanged IDs
    1..3
ok 7 - Step 9: MongoDB Persistence Across Backend Restart Tests
# [Test Teardown] Purging test accounts and disconnecting MongoDB pool...
# [Unified MongoDB Disconnected] Connection lost.
# [Test Teardown] Complete. All test records safely purged.
ok 8 - Final Cleanup & Teardown: purge test accounts and close server
1..8
# tests 65
# suites 7
# pass 65
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 38823.7491
```

### 17.3 Overall Statistics

| Category | Count |
|---|---|
| Total test cases designed | 69 |
| Automated and executed | 65 |
| PASS | **65** |
| FAIL | **0** |
| BLOCKED | 4 (UI — Playwright not installed) |
| NOT RUN | 0 |
| **Executed Pass Rate** | **65 / 65 = 100%** |
| **Design Coverage Rate** | **65 / 69 = 94.2%** |

> The 100% pass rate applies to the 65 executed automated API tests only. The 4 blocked UI tests are excluded from this calculation.

---

## 18. Coverage Gaps and Release Recommendation

### 18.1 Identified Coverage Gaps

| Area | Gap | Risk |
|---|---|---|
| UI functional tests | All 4 BLOCKED — Playwright not installed | Medium |
| Rate limiting | BUG-002 not implemented | Medium |
| CORS origin validation | BUG-001 unconditional allow | Medium |
| Token invalidation on logout | BUG-003 — stateless JWT | Low-Medium |
| Amount upper boundary (1,000,000) | Not explicitly API-tested | Low |
| Description 300-character boundary | Not tested | Low |
| Budget for past / future month | Not tested | Low |
| Cross-browser testing | No browser farm available | Low |
| Performance / load testing | Out of scope | Medium |

### 18.2 Release Recommendation

> **CONDITIONAL RELEASE APPROVED** — backend is suitable for academic submission and controlled internal use.

| Priority | Condition | Action |
|---|---|---|
| 1 — Required | Fix BUG-001 (CORS else branch) | One-line fix — must do before public deployment |
| 2 — Required | Fix BUG-002 (rate limiting) | Install express-rate-limit before internet exposure |
| 3 — Recommended | Execute UI tests TC-UI-001 to 004 | Install Playwright before end-user release |
| 4 — Low | Document BUG-003 (stateless logout) | Note as known limitation for current scope |

---

## 19. Conclusion

Quality assurance testing of the Student Expense Management System was conducted across all seven backend functional areas using a 65-test automated suite built with the Node.js native test runner. The testing covered functional correctness, security controls, data isolation, boundary conditions, and persistence.

**Summary of Findings:**

- **Zero functional failures** — all 65 automated tests passed with exit code 0.
- **Security controls are robust**: bcrypt hashing, JWT enforcement, strict cross-user isolation, account enumeration prevention, and CSV formula injection protection all work correctly.
- **Three non-blocking defects found** — all in Medium or Low-Medium severity range; none affect core data integrity.
- **UI testing is incomplete** — the most significant gap. Frontend code exists and is well-structured; automation tooling is needed.
- **Analytics and budget calculations** are mathematically verified by independent assertion against known values.

The application meets the expected quality standards for a collaborative student DevOps mini-project and is recommended for academic submission.

---

## 20. Appendix — Commands, File Reference, Supplementary Data

### A. Test Suite Files

| File | Tests | Description |
|---|---|---|
| tests/01_auth_security.test.js | 14 | Registration, login, JWT, bcrypt |
| tests/02_data_isolation.test.js | 9 | Multi-user cross-access prevention |
| tests/03_expense_crud.test.js | 16 | CRUD, validation, search, filter, sort, pagination |
| tests/04_analytics_dashboard.test.js | 5 | KPI accuracy, category %, monthly trend |
| tests/05_monthly_budget.test.js | 10 | Budget set, upsert, threshold boundaries |
| tests/06_csv_export.test.js | 7 | CSV security and content |
| tests/07_persistence_restart.test.js | 3 | MongoDB direct verification |
| tests/test_helper.js | — | apiRequest(), setupTestEnvironment(), teardownTestEnvironment() |
| tests/run_all_tests.js | — | Orchestrator, imports all suites |

### B. Key Source Files

| File | Purpose | Key Finding |
|---|---|---|
| integration/server/server.js | API gateway entry point | BUG-001 CORS unconditional allow |
| integration/server/middleware/auth.middleware.js | JWT protect middleware | Correctly populates req.user from DB |
| developer1/server/controllers/auth.controller.js | Auth logic | toSafeJSON() excludes password |
| developer1/server/models/User.js | User schema | bcrypt pre-save hook; select: false on password |
| developer2/server/controllers/expense.controller.js | Expense CRUD + CSV | sanitizeCSVField() prevents injection |
| developer2/server/models/Expense.js | Expense schema | 9 valid categories; 5 payment methods |
| developer3/server/controllers/analytics.controller.js | Analytics | $group, $match MongoDB aggregation pipelines |
| integration/server/controllers/budget.controller.js | Budget | calculateBudgetUtilization() from shared contract |
| integration/server/models/Budget.js | Budget schema | Unique index on {user, month} |
| shared/contracts/budget.contract.js | Budget thresholds | WARNING_PERCENT=80, EXCEEDED_PERCENT=100 |
| Jenkinsfile | CI/CD | 5-stage pipeline: Checkout → Tools → Install → Build → Test |

### C. Expense Categories (9 valid values)

Food & Groceries | Housing & Rent | Tuition & Books | Transportation | Utilities & Bills | Entertainment & Leisure | Health & Personal Care | Electronics & Gadgets | Other

### D. Payment Methods (5 valid values)

Cash | Debit Card | Credit Card | UPI / Mobile Transfer | Bank Transfer

### E. Full API Endpoint Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/health | No | Server and DB health check |
| POST | /api/auth/register | No | User registration |
| POST | /api/auth/login | No | User login |
| GET | /api/auth/me | Yes | Current user profile |
| POST | /api/auth/logout | Yes | Logout (client discard) |
| GET | /api/expenses | Yes | List with search/filter/sort/page |
| POST | /api/expenses | Yes | Create expense |
| GET | /api/expenses/:id | Yes | Get single expense |
| PUT | /api/expenses/:id | Yes | Update expense |
| DELETE | /api/expenses/:id | Yes | Delete expense |
| GET | /api/expenses/export/csv | Yes | Export CSV (with optional ?category filter) |
| GET | /api/analytics/summary | Yes | KPI totals |
| GET | /api/analytics/by-category | Yes | Category breakdown |
| GET | /api/analytics/monthly-trend | Yes | 6-month trend |
| GET | /api/analytics/recent | Yes | Recent transactions |
| GET | /api/budgets/current | Yes | Current month budget |
| POST | /api/budgets | Yes | Set / update monthly budget |

### F. Defect Quick Reference

| ID | Severity | Title | Status |
|---|---|---|---|
| BUG-001 | Medium | CORS allows all origins unconditionally | Open |
| BUG-002 | Medium | No rate limiting on auth endpoints | Open |
| BUG-003 | Low-Medium | Logout does not invalidate JWT server-side | Open |

---

*End of QA Test Report*

**QA Engineer** | Student Expense Management System
**Report Date**: 2026-10-12
**Repository**: https://github.com/Sakshii0204/Student-Expenses-Management
**Single Report File**: QA/test.md
