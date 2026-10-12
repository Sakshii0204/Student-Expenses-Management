# Developer 3 — Dashboard, Reports and Analytics Module

## Assigned Scope
- Aggregated financial analytics for the student.
- Total lifetime expenditure, current month total, and month-over-month rate.
- Categorical allocation distribution visualization.
- Multi-month trend tracking.
- Recent transactions telemetry.
- Graceful empty dataset states.

## Directory Structure
```
developer3/
├── client/
│   ├── src/
│   │   ├── components/      # KPICards, CategoryPieChart, MonthlyTrendChart, RecentTransactionsTable, TimeframeSelector
│   │   ├── pages/           # AnalyticsDashboardPage
│   │   ├── services/        # analyticsApi.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── config/              # MongoDB connection
│   ├── controllers/         # analytics.controller.js (MongoDB aggregation pipelines)
│   ├── middleware/          # auth.middleware.js, error.middleware.js
│   ├── models/              # Expense.js (Mongoose schema reference)
│   ├── routes/              # analytics.routes.js
│   ├── package.json
│   └── server.js
└── README.md
```

## Running Standalone
1. **Server**:
   ```bash
   cd developer3/server
   npm install
   npm run dev
   ```
2. **Client**:
   ```bash
   cd developer3/client
   npm install
   npm run dev
   ```

## Contract Compliance
- Conforms to `shared/contracts/analytics.contract.js`.
- Queries strictly scoped to `req.user.id` using MongoDB aggregation `$match`.
