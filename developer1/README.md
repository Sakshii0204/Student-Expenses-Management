# Developer 1 — Authentication and Security Module

## Assigned Scope
- Student registration & secure authentication.
- Password hashing with salt (bcryptjs).
- JWT generation & verification middleware.
- Input validation and sanitization.
- Protected route handling on client and server.

## Directory Structure
```
developer1/
├── client/
│   ├── src/
│   │   ├── components/      # Navbar, ProtectedRoute
│   │   ├── context/         # AuthContext with token & user management
│   │   ├── pages/           # Login, Register, Profile
│   │   ├── services/        # API client with Bearer headers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── config/              # MongoDB connection
│   ├── controllers/         # auth.controller (register, login, me, logout)
│   ├── middleware/          # auth.middleware (JWT protect), error.middleware
│   ├── models/              # User.js (Mongoose schema)
│   ├── routes/              # auth.routes.js
│   ├── validators/          # auth.validator.js
│   ├── package.json
│   └── server.js
└── README.md
```

## Running Standalone
1. **Server**:
   ```bash
   cd developer1/server
   npm install
   npm run dev
   ```
2. **Client**:
   ```bash
   cd developer1/client
   npm install
   npm run dev
   ```

## Contract Compliance
- Issues JWT containing `{ id, email, name, role }`.
- Follows uniform response format in `shared/contracts/api-response.contract.js`.
