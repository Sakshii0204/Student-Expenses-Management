# Student Expense Management System — Shared Architecture

## 1. System Overview
The Student Expense Management System is architected on the MERN stack (MongoDB, Express.js, React, Node.js).
To facilitate modular collaborative development across 3 developers while preserving zero merge conflicts:
- **Developer 1**: Authentication, Security, and Student User Management.
- **Developer 2**: Expense Core Management (CRUD, validations, filtering, queries).
- **Developer 3**: Financial Dashboard, Aggregations, Analytics, and Visual Reports.

## 2. Cross-Module Ownership & Boundaries
```
+-------------------------------------------------------+
|                    Client Layer                       |
|   [Dev 1: Auth]  |  [Dev 2: Expenses]  |  [Dev 3: BI] |
+-------------------------------------------------------+
                           |
+-------------------------------------------------------+
|                    Express API                        |
|  /api/auth/*     |  /api/expenses/*    | /api/analytics|
+-------------------------------------------------------+
                           |
+-------------------------------------------------------+
|               Shared Auth Middleware                  |
|          Validates JWT Bearer, populates req.user     |
+-------------------------------------------------------+
                           |
+-------------------------------------------------------+
|              MongoDB (Mongoose Schemas)               |
|            User Schema  <--1:N--> Expense Schema       |
+-------------------------------------------------------+
```

## 3. Database Ownership
- **User Collection**: Owned and defined by Developer 1 (`developer1/server/models/User.js`).
- **Expense Collection**: Owned and defined by Developer 2 (`developer2/server/models/Expense.js`).
- **Aggregations & Analytics**: Developer 3 executes MongoDB aggregation pipelines referencing `Expense` indexed by `user` and `date`.

## 4. Multi-Tenant User Isolation
Every expense record is tied to a student's `_id`. Queries must always filter by `{ user: req.user._id }` ensuring zero cross-tenant data leakage.
