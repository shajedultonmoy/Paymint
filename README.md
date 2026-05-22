# Paymint

Paymint is a 3-tier invoice generator SaaS foundation with a React frontend, Express API backend, MySQL database, Docker local stack, and Terraform AWS infrastructure.

## Architecture

- `frontend/` - React, Vite, Tailwind CSS, Zustand, Axios
- `backend/` - Node.js, Express, JWT auth, bcrypt, Sequelize model layer, MySQL repositories
- `database/` - MySQL schema, seed data, and versioned migrations
- `terraform/` - AWS VPC, EC2 backend host, RDS MySQL, security groups, IAM profile

## Features

- Register, login, logout, JWT protected API routes
- Product CRUD with price, SKU, quantity, description, and image upload
- Client CRUD
- Invoice CRUD with invoice items, tax, discount, totals, status, and PDF download
- Dashboard summary API for revenue, invoices, products, and recent invoices
- Docker Compose local development with MySQL
- Terraform scaffold for AWS EC2 + RDS deployment

## Local Development With Docker

From the project root:

```powershell
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- MySQL: `localhost:3306`

The MySQL container loads:

- `database/schema.sql`
- `database/seed.sql`

Demo login:

- Email: `demo@paymint.test`
- Password: `password123`

## Local Development Without Docker

1. Create the MySQL database:

```sql
SOURCE D:/DEVOPS WORKS/Paymint/database/schema.sql;
SOURCE D:/DEVOPS WORKS/Paymint/database/seed.sql;
```

2. Configure env files:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

3. Update `backend/.env` with your MySQL credentials.

4. Install dependencies:

```powershell
cd backend
npm install
cd ../frontend
npm install
```

5. Run in separate terminals:

```powershell
cd backend
npm run dev
```

```powershell
cd frontend
npm run dev
```

## API

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Dashboard:

- `GET /api/dashboard/summary`

Products:

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

Invoices:

- `GET /api/invoices`
- `POST /api/invoices`
- `GET /api/invoices/:id`
- `PUT /api/invoices/:id`
- `DELETE /api/invoices/:id`
- `GET /api/invoices/:id/pdf`

Clients:

- `GET /api/clients`
- `POST /api/clients`
- `GET /api/clients/:id`
- `PUT /api/clients/:id`
- `DELETE /api/clients/:id`

## Terraform

Terraform files live in `terraform/`.

```powershell
cd terraform
Copy-Item terraform.tfvars.example terraform.tfvars
terraform init
terraform plan
terraform apply
```

Set a real `ami_id`, `admin_cidr`, and strong `db_password` in `terraform.tfvars` before applying.

The Terraform scaffold provisions:

- VPC with public and private subnets
- Internet Gateway and public route table
- EC2 instance for the backend
- RDS MySQL in private subnets
- Security groups for HTTP, HTTPS, SSH, and internal-only MySQL
- IAM role and instance profile for EC2

## Useful Commands

```powershell
npm --prefix backend run typecheck
npm --prefix backend run build
npm --prefix frontend run build
```
