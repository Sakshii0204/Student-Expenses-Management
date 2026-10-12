# Developer 2 — Expense Management Module

## Assigned Scope
- Full CRUD API and interfaces for Student Expenses.
- Expense model fields: `amount`, `category`, `date`, `description`, `paymentMethod`, `timestamps`.
- Multi-tenant tenant boundary: Expenses strictly scoped to `req.user.id`.
- Real-time client filter toolbar (Category, Search query, Date window, Sort order).
- Add & Edit modal form with validation feedback.
- Delete confirmation modal dialog.

## Directory Structure
```
developer2/
├── client/
│   ├── src/
│   │   ├── components/      # ExpenseTable, ExpenseFormModal, DeleteConfirmModal, ExpenseFilters, ExpenseSummaryCards
│   │   ├── pages/           # ExpenseManagementPage
│   │   ├── services/        # expenseApi.js (bearer token integration)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── config/              # MongoDB connection
│   ├── controllers/         # expense.controller.js (CRUD + memory fallback)
│   ├── middleware/          # auth.middleware.js (JWT protect), error.middleware.js
│   ├── models/              # Expense.js (Mongoose schema)
│   ├── routes/              # expense.routes.js
│   ├── validators/          # expense.validator.js
│   ├── package.json
│   └── server.js
└── README.md
```

## Running Standalone
1. **Server**:
   ```bash
   cd developer2/server
   npm install
   npm run dev
   ```
2. **Client**:
   ```bash
   cd developer2/client
   npm install
   npm run dev
   ```

## Contract Compliance
- Implements `shared/contracts/expense.contract.js` validation boundaries and category enums.
- Strictly authenticates via JWT Bearer token conforming to Developer 1 conventions.
