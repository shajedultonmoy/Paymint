# Paymint

Paymint is a 3-tier invoice generator SaaS app with a React frontend, Express API backend, and MySQL database schema.

## Structure

- `frontend/` - React, Vite, Tailwind CSS, Zustand, Axios
- `backend/` - Node.js, Express, JWT auth, MySQL repositories
- `database/` - MySQL schema and seed data

## Setup

1. Create the database from the project root:
   ```sql
   SOURCE database/schema.sql;
   SOURCE database/seed.sql;
   ```
2. Copy environment files and set local values:
   ```powershell
   Copy-Item backend/.env.example backend/.env
   Copy-Item frontend/.env.example frontend/.env
   ```
   The frontend uses the Vite dev proxy by default, so browser requests to `/api` and `/uploads` are forwarded to `http://localhost:5000`.
3. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
4. Run the backend and frontend in separate terminals:
   ```bash
   cd backend && npm run dev
   cd ../frontend && npm run dev
   ```

Backend: `http://localhost:5000`  
Frontend: `http://localhost:5173`

Demo login from `database/seed.sql`:

- Email: `demo@paymint.test`
- Password: `password123`
