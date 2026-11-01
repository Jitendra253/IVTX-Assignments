# System Architecture & Technical Specifications
## TaskFlow — Enterprise Project & Task Management System
**Organization:** IVTEX Corporate Solutions Private Limited  
**Role:** Technical Team Lead – Software Development  

---

## 1. High-Level System Architecture

TaskFlow is built on a modern, decoupled three-tier architecture ensuring separation of concerns, scalability, and security:

```
[ Client Browser (Desktop / Tablet / Mobile) ]
                      │
                      │ HTTPS (REST API JSON / Cookies)
                      ▼
┌──────────────────────────────────────────────────────────┐
│              EXPRESS.JS BACKEND RUNTIME (Port 5000)      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Security & Request Pipelines                       │  │
│  │  • Helmet (Security Headers)                       │  │
│  │  • CORS (Trusted Origin Whitelist)                 │  │
│  │  • Rate Limiter (Brute-force Mitigation)           │  │
│  │  • Morgan (Access Logging)                         │  │
│  │  • Cookie Parser & JSON Parser                     │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────▼───────────────────────────┐  │
│  │ Middleware Layer                                   │  │
│  │  • requireAuth (JWT Token Verification)            │  │
│  │  • requireRole (Admin vs Developer RBAC)           │  │
│  │  • canModifyTask (Resource Authorization Guard)    │  │
│  │  • validate (Zod Schema Validation Engine)         │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────▼───────────────────────────┐  │
│  │ Controllers Layer (HTTP Transport & Status Codes)  │  │
│  │  • auth.controller   • project.controller          │  │
│  │  • task.controller   • dashboard.controller        │  │
│  │  • user.controller                                 │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────▼───────────────────────────┐  │
│  │ Service Business Layer (Core Domain Rules)         │  │
│  │  • 16 Task Business Rules Enforcement              │  │
│  │  • MongoDB Dynamic Aggregation Pipelines           │  │
│  │  • TaskActivity Event Emitter                      │  │
│  └────────────────────────┬───────────────────────────┘  │
│                           │                              │
│  ┌────────────────────────▼───────────────────────────┐  │
│  │ Persistence Layer (Mongoose ODM 8.x)               │  │
│  │  • User   • Project   • Task   • Comment • Activity│  │
│  └────────────────────────┬───────────────────────────┘  │
└───────────────────────────┼──────────────────────────────┘
                            │
                            │ Native BSON Protocol (Port 27017)
                            ▼
           [ MongoDB Database Server (Local / Atlas) ]
```

---

## 2. Frontend Component Hierarchy
The frontend is constructed using React 18, Vite, Material UI v6, and Redux Toolkit with RTK Query:

```
[ App.jsx ]
  ├── ThemeProvider (Dark Slate Palette #0B0F19, #6366F1, #06B6D4)
  ├── CssBaseline
  └── ReduxProvider (authSlice, uiSlice, apiSlice)
        └── BrowserRouter
              └── AppRoutes
                    ├── /login ──> LoginPage
                    └── / ──> ProtectedRoute
                                └── AppLayout
                                      ├── Sidebar (Responsive Drawer)
                                      ├── Topbar (User Menu, Quick Actions)
                                      ├── Global Snackbar (Toasts)
                                      └── Page Outlet
                                            ├── /dashboard   ──> DashboardPage (7 KPIs, Recharts)
                                            ├── /projects    ──> ProjectsListPage
                                            ├── /projects/:id──> ProjectDetailsPage
                                            ├── /tasks       ──> TasksListPage (Search, Filters)
                                            ├── /tasks/:id   ──> TaskDetailsPage (Live Stepper)
                                            ├── /my-tasks    ──> MyTasksPage (Workstream)
                                            └── /team        ──> TeamMembersPage
```

---

## 3. Data Flow & Mutation Pipeline

```
1. User Action in UI (e.g. Set Task Status to 'Completed')
   │
2. Redux RTK Query hook executes mutation:
   useUpdateTaskStatusMutation({ id, status: 'Completed' })
   PATCH /api/v1/tasks/:id/status { status: 'Completed' }
   │
3. Express Middleware Stack:
   ├── Helmet & CORS checks pass
   ├── requireAuth verifies JWT signature & user state
   ├── canModifyTask checks if user is Admin OR assigned Developer
   └── validate(updateTaskStatusSchema) validates input payload
   │
4. Task Service processes business logic:
   ├── Automatically sets progress to 100% (Rule 8)
   ├── Records audit event in TaskActivity ('Status Changed', 'To Do', 'Completed')
   └── Saves to MongoDB via Mongoose Task model
   │
5. HTTP 200 JSON returned to client
   │
6. Redux RTK Query cache invalidation (tagTypes: ['Task', 'Tasks', 'Dashboard', 'Projects']):
   ├── Automatically refetches active queries in the store
   └── Redux uiSlice dispatches showSnackbar({ message: 'Status updated', severity: 'success' })
```

---

## 4. Security & Defensive Design

1. **Password Security:** Passwords hashed with `bcryptjs` using a salt work factor of 10. Passwords are never returned in queries (`select: false`).
2. **Session Security:** JWT signed with HS256 algorithm and strong secret. Token delivered in HttpOnly cookies to mitigate XSS exposure, alongside Authorization header support.
3. **Role Enforcement:** Frontend UI conditionally renders controls (`RoleGuard`), but backend API routes strictly enforce permissions independently (`requireRole('Admin')`, `canModifyTask`).
4. **Input Sanitization:** Express body parsers coupled with Zod runtime schemas prevent prototype pollution and unexpected injection vectors.
5. **Denial of Service Mitigation:** Rate limiting restricts brute-force attempts on sensitive authentication endpoints.
