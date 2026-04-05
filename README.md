# Finance Backend Application

A production-ready Finance Management API built with Node.js, Express, Prisma, and PostgreSQL. This application provides robust tools for managing personal or organizational finances with role-based access control and detailed analytics.

## Features

- **User Authentication**: Secure registration and login using JWT and Bcryptjs.
- **Role-Based Access Control (RBAC)**:
  - `ADMIN`: Full access to all records and user management.
  - `ANALYST`: Can manage (CRUD) all financial records.
  - `VIEWER`: Read-only access to records and dashboard.
- **Financial Records**:
  - Full CRUD operations with soft-delete support.
  - Advanced filtering (by type, category, date range).
  - Pagination support.
- **Dashboard Analytics**:
  - **Summary**: Total income, expenses, and net balance.
  - **Category Breakdown**: Case-insensitive grouping with percentage-of-total calculations.
  - **Trends**: Monthly and Weekly trend analysis.
  - **Recent Activity**: Quickly view the latest transactions.
- **Validation**: Strict schema validation using Zod.
- **Error Handling**: Standardized JSON error responses.

## Tech Stack

- **Runtime**: Node.js & TypeScript
- **Framework**: Express.js
- **ORM**: Prisma (v6)
- **Database**: PostgreSQL (via Docker)
- **Testing**: Jest & Supertest
- **Tools**: `tsx` (for fast execution), `bcryptjs` (for cross-platform reliability)

---

## System Architecture

### 1. Request Lifecycle Flow
This flowchart describes how a typical authenticated request (e.g., creating a record) moves through our middleware security pipeline before reaching the business logic.

```mermaid
sequenceDiagram
    participant User
    participant Router
    participant AuthMiddleware
    participant RBACMiddleware
    participant ValidationMiddleware
    participant Controller
    participant Service
    participant Database

    User->>Router: HTTP POST /api/records
    Router->>AuthMiddleware: Verify JWT Token
    alt Invalid/No Token
        AuthMiddleware-->>User: 401 Unauthorized
    else Valid Token
        AuthMiddleware->>RBACMiddleware: Pass Request (req.user)
        alt Inadequate Role (e.g. VIEWER)
            RBACMiddleware-->>User: 403 Forbidden
        else Authorized Role
            RBACMiddleware->>ValidationMiddleware: Validate Request Body (Zod)
            alt Invalid Schema
                ValidationMiddleware-->>User: 400 Bad Request
            else Valid Data
                ValidationMiddleware->>Controller: Call Handler
                Controller->>Service: Call Create Method
                Service->>Database: Prisma Create Operation
                Database-->>Service: Record Saved
                Service-->>Controller: Return Result
                Controller-->>User: 201 Created
            end
        end
    end
```

### 2. Physical Architecture Overview
A high-level view of how our backend components interact.

```mermaid
graph TD
    User((Client/User)) -->|Rest API| Express[Express.js App]
    subgraph Backend Container
        Express -->|JWT| Security[Auth & RBAC Middleware]
        Security -->|Business Logic| Controllers[API Controllers]
        Controllers -->|Data Logic| Services[Service Layer]
        Services -->|Query| Prisma[Prisma ORM Client]
    end
    Prisma -->|TCP/5432| DB[(PostgreSQL Database)]
    DB -.->|Schema Management| Prisma
```

### 3. Role-Based Access Matrix
 A visual representation of permissions across the system.

```mermaid
graph LR
    subgraph Roles
        ADMIN[Admin Account]
        ANALYST[Analyst Account]
        VIEWER[Viewer Account]
    end

    subgraph Actions
        USER_MNG[User Management]
        RECORD_CRUD[Record Create/Edit/Delete]
        RECORD_VIEW[Record View/List]
        DASHBOARD[Dashboard Analytics]
    end

    ADMIN --> USER_MNG
    ADMIN --> RECORD_CRUD
    ADMIN --> RECORD_VIEW
    ADMIN --> DASHBOARD

    ANALYST --> RECORD_CRUD
    ANALYST --> RECORD_VIEW
    ANALYST --> DASHBOARD

    VIEWER --> RECORD_VIEW
    VIEWER --> DASHBOARD
```

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- Docker and Docker Compose

### Setup Process

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   Create or modify the `.env` file in the root directory:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/finance_db?schema=public"
   JWT_SECRET="bEstwlfncWNADjpu1WEISLDDw5P33jnz"
   NODE_ENV=development
   ```

3. **Spin up Database Container**:
   ```bash
   docker-compose up -d
   ```

4. **Initialize Database Schema**:
   ```bash
   npm run prisma:migrate
   ```

5. **Seed Sample Data**:
   Pre-configures test accounts (Admin: `admin@finance.com`, Analyst: `analyst@finance.com`, Viewer: `viewer@finance.com`, Password: `password123`) and 100+ sample records.
   ```bash
   npm run seed
   ```

6. **Run Development Server**:
   ```bash
   npm run dev
   ```

---

## API Documentation

### Authentication
#### Register
`POST /api/auth/register`
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123", "fullName": "John Doe"}'
```

#### Login
`POST /api/auth/login`
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@finance.com", "password": "password123"}'
```

---

### User Management (Admin Only)
#### List Users
`GET /api/users`
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/users
```

#### Update User Role/Status
`PATCH /api/users/:id`
```bash
curl -X PATCH http://localhost:3000/api/users/<ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"role": "ANALYST", "status": "ACTIVE"}'
```

---

### Financial Records
#### List/Search Records
`GET /api/records?page=1&limit=10&type=EXPENSE`
```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/api/records"
```

#### Create Record (Analyst/Admin)
`POST /api/records`
```bash
curl -X POST http://localhost:3000/api/records \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 150.00, "type": "EXPENSE", "category": "Food", "date": "2024-03-24"}'
```

---

### Dashboard Analytics
#### Summary
Get overall income/expense totals and net balance.
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/dashboard/summary
```

#### Category Breakdown
Get income/expense breakdown aggregated by category (case-insensitive).
```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/dashboard/by-category
```

#### Monthly Trend
Get monthly income/expense trends for a given time period.
```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/api/dashboard/monthly-trend?months=12"
```

#### Weekly Trend
Get weekly income/expense trends for a given time period.
```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/api/dashboard/weekly-trend?weeks=12"
```

#### Recent Activity
Get the latest financial transactions.
```bash
curl -H "Authorization: Bearer <TOKEN>" "http://localhost:3000/api/dashboard/recent-activity?limit=10"
```

---

## Implementation Details

### Assumptions Made
1. **Soft Delete**: Records are never truly deleted from the DB; they are marked with `deletedAt` to preserve audit trails.
2. **Path Spaces**: The project root contains spaces on the host machine. 
3. **Roles**: We assume a hierarchical permission model where `ADMIN` > `ANALYST` > `VIEWER`.

### Tradeoffs and Decisions
- **Bcryptjs over Bcrypt**: Switched to the pure-JS implementation to avoid native compilation issues on Windows paths containing spaces.
- **Prisma v6 Downgrade**: pinned to version 6 because Prisma v7 introduced a breaking change that removes the `url` property from `schema.prisma` in favor of a separate config file, which was incompatible with the rapid build guide requirements.
- **Lowercase Normalization**: In the Category Breakdown API, all categories are normalized to lowercase before aggregation. This ensures "Salary" and "salary" are combined, prioritizing data accuracy over exact text preservation.
- **Admin Self-Protection**: Admins are programmatically prevented from demoting themselves or deactivating their own accounts via the API to prevent "lockout" scenarios.

## Testing
```bash
npm run test
```
The test suite uses Jest and includes unit tests for core services and integration tests for key endpoints.
