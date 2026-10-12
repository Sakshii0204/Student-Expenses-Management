# Integration Runtime (Phase 2)

## Overview
This directory houses the unified full-stack application connecting Developer 1, Developer 2, and Developer 3 into a single cohesive system without duplicating business logic.

## Directory Structure
```
integration/
├── client/                      # Single unified React/Vite/Tailwind frontend
│   ├── src/
│   │   ├── components/layout/   # AppLayout, Sidebar (Navy #0f172a), Header
│   │   ├── components/common/   # ProtectedRoute, PublicOnlyRoute
│   │   ├── context/             # Unified AuthContext
│   │   ├── services/            # Single unified API client
│   │   └── pages/               # Login, Register, Dashboard, Transactions, Reports, Settings
│   ├── package.json
│   └── vite.config.js
│
└── server/                      # Single unified Express backend gateway
    ├── config/                  # Shared MongoDB connection pool
    ├── middleware/              # Centralized JWT protect, 404, and error handling
    ├── routes/                  # /api/auth, /api/expenses, /api/analytics
    ├── package.json
    └── server.js                # Port 5000 entrypoint
```

## Developer Code Reuse Details
* `integration/server/routes/auth.routes.js` -> imports `developer1/server/controllers/auth.controller.js`
* `integration/server/routes/expense.routes.js` -> imports `developer2/server/controllers/expense.controller.js`
* `integration/server/routes/analytics.routes.js` -> imports `developer3/server/controllers/analytics.controller.js`
* `integration/server/middleware/auth.middleware.js` -> imports `developer1/server/models/User.js`
* `integration/client/src/pages/DashboardPage.jsx` -> imports `developer3/client/src/components/*`
* `integration/client/src/pages/TransactionsPage.jsx` -> imports `developer2/client/src/components/*`
* `integration/client/src/pages/ReportsPage.jsx` -> imports `developer3/client/src/components/*`
