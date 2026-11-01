# TaskFlow — Enterprise Project & Task Management System
### Candidate Submission: Technical Team Lead – Software Development
**Company:** IVTEX Corporate Solutions Private Limited  
**Duration:** 72-Hour Lead Engineering Assignment  
**Scenario:** 4-Developer Team Delivering in 3 Weeks  

---

## 🌟 Executive Summary

**TaskFlow** is an enterprise-grade, responsive Project & Task Management System built for IVTEX Corporate Solutions. Engineered from the ground up to demonstrate technical leadership, clean modular architecture, and deterministic business logic, TaskFlow enforces role-based access control (RBAC), automatic progress accounting, and real-time dashboard analytics powered by native MongoDB aggregation pipelines.

---

## 🚀 Key Features

- **Role-Based Access Control (RBAC):**
  - **Admin / Team Lead:** Full project CRUD, developer task assignment, priority/deadline setting, team roster management, and workspace-wide analytics.
  - **Developer / Member:** Personalized workstream (`My Tasks`), assigned task status updates, interactive progress slider, and technical commentary.
- **Dynamic Project Completion:**
  - Calculated directly from task states via MongoDB aggregation:
    $$\text{Completion Percentage} = \left(\frac{\text{Completed Tasks}}{\text{Total Tasks}}\right) \times 100$$
  - Projects with no tasks dynamically report 0%. No manual percentage tampering is possible.
- **Strict Business Logic & 16 Rules:**
  - Tasks can only be assigned to users with the `Developer` role.
  - Due dates cannot precede start dates.
  - Setting status to `Completed` automatically synchronizes progress to 100%.
  - Setting status to `To Do` automatically resets progress to 0%.
  - `In Progress` tasks are bounded strictly between 1% and 99%.
  - `Under Review` tasks preserve existing progress until sign-off.
  - Real-time overdue detection for all non-completed tasks past their deadline.
- **Real-Time Executive Dashboard:**
  - 7 KPI metric cards (Active Projects, Total Tasks, Completed, Pending, In Progress, Under Review, Overdue).
  - Recharts data visualizations: Task distribution by status (Donut), Task distribution by priority (Bar), and Developer workload capacity (Stacked Horizontal Bar).
  - Project progress completion table, upcoming deadlines list, overdue alert cards, and real-time activity stream.
- **Collaborative Engineering:**
  - Task comment thread with author avatars and relative timestamps.
  - Immutable audit trail (`TaskActivity`) logging all status shifts, progress increments, and assignee adjustments.
- **Enterprise Design & Polish:**
  - Dark slate navy theme (`#0B0F19`, `#6366F1`, `#06B6D4`) using Material UI v6.
  - Responsive design tested across desktop, tablet, and mobile devices.
  - Skeleton loaders, empty states, and confirmation dialogs for destructive actions.
  - 1-Click quick login buttons for immediate evaluator testing.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, JavaScript ES6+, Material UI (MUI) v6, Emotion, React Router DOM v7, Redux Toolkit (RTK Query), React Redux, Axios, React Hook Form, Zod, Recharts, Day.js |
| **Backend** | Node.js (v24 LTS), Express.js (ES Modules), MongoDB 7/8, Mongoose ODM 8, JWT Authentication, bcryptjs, Zod Request Validation, Helmet, Express Rate Limit, CORS, Morgan |
| **Testing** | Vitest, React Testing Library, Supertest, Jest DOM |
| **DevOps** | Git / GitHub Flow, Environment Configurations, Monorepo Workspace |

---

## 📂 Project Structure

```
taskflow/
├── backend/
│   ├── scripts/
│   │   └── seed.js                    # Database seed script with realistic demo data
│   ├── src/
│   │   ├── config/                    # Mongoose database connection
│   │   ├── controllers/               # Express request/response handlers
│   │   ├── middleware/                # Auth, RBAC, Zod validation, error handler
│   │   ├── models/                    # User, Project, Task, Comment, Activity models
│   │   ├── routes/                    # Modular Express routes (/api/v1/...)
│   │   ├── schemas/                   # Zod request validation schemas
│   │   ├── services/                  # Core domain logic & MongoDB aggregations
│   │   ├── app.js                     # Express app configuration
│   │   └── server.js                  # Server entrypoint listener
│   ├── tests/
│   │   └── api.test.js                # Automated backend integration test suite
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/                # Reusable UI components & layouts
│   │   │   ├── common/                # StatCard, StatusChip, PriorityChip, ProjectProgress
│   │   │   ├── layout/                # Sidebar, Topbar, AppLayout
│   │   │   └── tasks/                 # TaskCommentSection, TaskActivityHistory
│   │   ├── pages/
│   │   │   ├── auth/LoginPage.jsx
│   │   │   ├── dashboard/DashboardPage.jsx
│   │   │   ├── projects/              # ProjectsListPage, ProjectDetailsPage, ProjectFormDialog
│   │   │   ├── tasks/                 # TasksListPage, TaskDetailsPage, TaskFormDialog, MyTasksPage
│   │   │   └── team/TeamMembersPage.jsx
│   │   ├── routes/AppRoutes.jsx
│   │   ├── schemas/                   # Frontend Zod schemas
│   │   ├── services/                  # Axios API services
│   │   ├── store/                     # Redux Toolkit (authSlice, uiSlice)
│   │   ├── theme/theme.js             # Centralized Material UI custom theme
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── docs/
│   ├── SRS.md                         # Software Requirements Specification
│   ├── TECHNICAL_EXECUTION_PLAN.md    # 4-Developer 3-Week Team Execution Plan
│   ├── DATABASE_DESIGN.md             # Schemas, Relationships, Indexes & Aggregations
│   ├── API_DOCUMENTATION.md           # REST API Endpoint Specifications
│   └── ARCHITECTURE.md                # System Architecture & Security Data Flow
│
├── postman/
│   └── TaskFlow.postman_collection.json # Ready-to-import Postman API Collection
├── package.json                       # Monorepo root scripts (npm run dev)
├── .env.example                       # Documented environment variables template
├── .gitignore
└── README.md
```

---

## 🔑 Demo Credentials

The database comes pre-seeded with realistic enterprise users:

| Role | Name | Email | Password | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Admin / Team Lead** | Vikram Mehta | `admin@ivtex.com` | `Admin@123` | Full workspace administration, projects, tasks, team |
| **Developer 1** | John Miller | `john.dev@ivtex.com` | `Dev@123` | Senior Frontend Developer, task updates, comments |
| **Developer 2** | Sarah Connor | `sarah.dev@ivtex.com` | `Dev@123` | Backend Architect, task updates, comments |
| **Developer 3** | Alex Rivera | `alex.dev@ivtex.com` | `Dev@123` | Full Stack Developer, task updates, comments |
| **Developer 4** | Priya Sharma | `priya.dev@ivtex.com` | `Dev@123` | Mobile & QA Developer, task updates, comments |

*Tip: The Login Page includes 1-Click quick fill buttons to instantly populate credentials for any role!*

---

## ⚡ Quickstart Guide

### 1. Prerequisites
- **Node.js:** v18.x or v20.x or v24.x LTS
- **MongoDB:** Local MongoDB instance running on port `27017` OR a MongoDB Atlas cluster URI.

### 2. Environment Configuration
Create `.env` inside `backend/` (or copy `.env.example`):

```bash
# backend/.env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
JWT_SECRET=super_secret_jwt_key_ivtex_taskflow_2026_dev_prod
CLIENT_URL=http://localhost:5173
```

### 3. Install Dependencies
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 4. Seed the Database
Populate realistic enterprise users, projects, tasks, comments, and audit logs:
```bash
cd backend
npm run seed
```

### 5. Run the Application

#### Option A: Run Both Together (Single Command from Root)
From the root workspace folder:
```bash
npm run dev
```
*(This launches both the Backend at `http://localhost:5000` and Frontend at `http://localhost:5173` concurrently with color-coded logs).*

#### Option B: Run in Separate Terminals
**Terminal 1 — Backend API:**
```bash
cd backend
npm run dev
# Server runs at http://localhost:5000
# Health check: http://localhost:5000/api/v1/health
```

**Terminal 2 — Frontend Application:**
```bash
cd frontend
npm run dev
# Vite runs at http://localhost:5173
```

Open **`http://localhost:5173`** in your browser.

---

## 🧪 Testing & Verification

TaskFlow includes comprehensive automated test suites for both frontend and backend.

### Run Backend Integration Tests
Tests authentication, JWT verification, RBAC permissions, the 16 task business rules, overdue calculation, and dynamic aggregation KPIs:
```bash
cd backend
npm test
```
*Result: 16 integration tests passing across all API modules.*

### Run Frontend Component Tests
Tests Material UI chips, progress bars, and KPI metric cards:
```bash
cd frontend
npm test
```
*Result: 4 component unit tests passing.*

### Production Build Verification
Verify production bundle compilation and minification:
```bash
cd frontend
npm run build
```
*Result: Successfully built in ~17 seconds with 0 errors.*

---

## 🌐 Postman Collection
Import `postman/TaskFlow.postman_collection.json` into Postman. It contains pre-configured requests for all endpoints with automated environment token extraction.

---

## 🚢 Deployment Guide

### Option 1: MongoDB Atlas + Render/Railway/Heroku
1. **Provision MongoDB Atlas Database:**
   - Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
   - In "Network Access", add IP `0.0.0.0/0` (or your host IP).
   - Under "Database Access", create a database user.
   - Copy connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority`.
2. **Deploy Backend:**
   - Set environment variables: `PORT=5000`, `NODE_ENV=production`, `MONGODB_URI=<atlas_uri>`, `JWT_SECRET=<secret>`, `CLIENT_URL=https://your-frontend-domain.com`.
   - Start command: `node src/server.js`.
3. **Deploy Frontend:**
   - Build command: `npm run build`.
   - Output directory: `dist`.
   - Environment variable: `VITE_API_BASE_URL=https://your-backend-api.com/api/v1`.

### Option 2: Local Native MongoDB (Default)
Run against your local MongoDB server installed on Windows:
```bash
# Verify MongoDB service is running
Get-Service -Name "*mongo*"

# Run both backend and frontend from root
npm run dev
```

---

## 🔒 Security Summary
- **Password Protection:** Irreversible bcrypt hashing (10 salt rounds).
- **Session Protection:** HS256 JWT tokens transmitted via HttpOnly, SameSite cookies and Authorization headers.
- **Defensive Headers:** Helmet protection against clickjacking, MIME-sniffing, and cross-site scripting.
- **Brute-Force Protection:** Express rate limiting on authentication routes.
- **Data Validation:** Schema-first input validation with Zod runtime guards.

---

## 📋 Definition of Done Checklist

- [x] **Frontend:** React 18, Vite, JavaScript ES6+ (No TypeScript), MUI v6 theme.
- [x] **Backend:** Node.js, Express.js ES modules, REST APIs under `/api/v1`.
- [x] **MongoDB:** Connected, indexed, separate collections, no unbounded embedding.
- [x] **Seed Script:** Hashed passwords, 5 users, 5 projects, 14 tasks, comments, activities.
- [x] **JWT & RBAC:** Admin and Developer permissions enforced on backend.
- [x] **Business Rules:** All 16 rules validated (assignee role, dates, status/progress bounds).
- [x] **Dashboard:** 7 KPI cards, Recharts visualizations, dynamic project progress.
- [x] **Automated Tests:** 16 backend + 4 frontend tests executed and passing.
- [x] **Production Builds:** Vite production build compiles with zero errors.
- [x] **Documentation:** SRS, Execution Plan, Database Design, API Docs, Architecture, README.
- [x] **Postman:** Complete collection ready for import.

---
*Created for IVTEX Corporate Solutions Private Limited — Technical Team Lead Evaluation.*
