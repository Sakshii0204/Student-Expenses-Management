# Unified API Specifications

All endpoints prefix: `/api`
Standard response envelope:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "...",
  "data": {},
  "timestamp": "2026-10-11T12:00:00.000Z"
}
```

---

## 1. Authentication Endpoints (Developer 1)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create student account (`name`, `email`, `password`, `college`, `currency`) |
| POST | `/api/auth/login` | No | Authenticate & issue JWT (`email`, `password`) |
| GET | `/api/auth/me` | Bearer | Retrieve profile for active session |
| POST | `/api/auth/logout` | Bearer | Invalidate session |

---

## 2. Expense Management Endpoints (Developer 2)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/expenses` | Bearer | List student expenses with pagination (query: `search`, `category`, `startDate`, `endDate`, `sort`, `page`, `limit`) |
| GET | `/api/expenses/export/csv` | Bearer | Download RFC 4180 CSV export with formula injection sanitization |
| POST | `/api/expenses` | Bearer | Create expense (`amount`, `category`, `date`, `description`, `paymentMethod`) |
| GET | `/api/expenses/:id` | Bearer | Get single expense details |
| PUT | `/api/expenses/:id` | Bearer | Update expense |
| DELETE | `/api/expenses/:id`| Bearer | Delete expense |

### Expense Pagination Metadata Contract
`GET /api/expenses` response `data.pagination`:
```json
{
  "total": 45,
  "page": 1,
  "limit": 10,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPrevPage": false
}
```

---

## 3. Analytics & Reporting Endpoints (Developer 3)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/analytics/summary` | Bearer | Total spent, transaction count, avg, MoM growth |
| GET | `/api/analytics/by-category` | Bearer | Breakdown with percentage share |
| GET | `/api/analytics/monthly-trend` | Bearer | 6-month historical totals |
| GET | `/api/analytics/recent` | Bearer | Last N recorded transactions (`limit` query param) |

---

## 4. Monthly Budget Endpoints (Phase 3)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/budgets/current` | Bearer | Retrieve target month budget, actual spent, utilization %, and threshold status (`?month=YYYY-MM`) |
| POST | `/api/budgets` | Bearer | Set or update monthly budget (`amount`, `month`) |

---

## 5. System Health
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | No | Service status, MongoDB pool state, mounted route modules |
