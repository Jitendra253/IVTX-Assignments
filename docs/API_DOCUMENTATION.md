# REST API Specification
## TaskFlow — Enterprise Project & Task Management System
**Base URL:** `http://localhost:5000/api/v1`  
**Authentication Scheme:** `Bearer <JWT_TOKEN>` in `Authorization` Header OR Secure `HttpOnly` Cookie  

---

## 1. Response Standard

All API endpoints return a predictable JSON payload:

### Successful Response
```json
{
  "success": true,
  "message": "Operation description (optional)",
  "data": { ... },
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 15,
    "totalPages": 4
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Invalid email address format" }
  ]
}
```

---

## 2. API Endpoints Catalog

### 2.1 Health Check
- `GET /health`
  - **Auth:** None (Public)
  - **Response 200:**
    ```json
    {
      "status": "healthy",
      "timestamp": "2026-10-29T12:00:00.000Z",
      "uptime": 142.5,
      "service": "TaskFlow API",
      "version": "1.0.0"
    }
    ```

---

### 2.2 Authentication & Session (`/auth`)

#### `POST /auth/login`
- **Rate Limit:** 20 requests per 15 minutes per IP.
- **Body:**
  ```json
  { "email": "admin@ivtex.com", "password": "Admin@123" }
  ```
- **Response 200:** Returns user object, signed JWT token, and sets HttpOnly cookie.

#### `POST /auth/logout`
- **Auth:** Bearer Token / Cookie.
- **Response 200:** Clears session cookie and returns success message.

#### `GET /auth/me`
- **Auth:** Bearer Token / Cookie.
- **Response 200:** Returns profile of the currently authenticated user.

---

### 2.3 Dashboard & Analytics (`/dashboard`)

#### `GET /dashboard/summary`
- **Auth:** Required (Admin or Developer).
- **Response 200:**
  ```json
  {
    "success": true,
    "data": {
      "activeProjects": 3,
      "totalProjects": 5,
      "totalTasks": 14,
      "completedTasks": 4,
      "pendingTasks": 10,
      "overdueTasks": 2,
      "inProgressTasks": 4,
      "underReviewTasks": 2,
      "toDoTasks": 4
    }
  }
  ```

#### `GET /dashboard/project-progress`
- Returns array of projects with dynamically computed `completionPercentage`, `totalTasks`, `completedTasks`, and `overdueTasks`.

#### `GET /dashboard/task-distribution`
- Returns aggregations grouped by status (`byStatus`) and priority (`byPriority`).

#### `GET /dashboard/developer-workload`
- Returns developer capacity: `totalAssigned`, `completed`, `inProgress`, `underReview`, `toDo`, `overdue`.

#### `GET /dashboard/upcoming-deadlines`
- Returns next 8 incomplete tasks sorted ascending by due date.

#### `GET /dashboard/overdue-tasks`
- Returns incomplete tasks where `dueDate < now`.

#### `GET /dashboard/recent-activity`
- Returns latest 15 audit events from `taskactivities`.

---

### 2.4 Projects (`/projects`)

#### `GET /projects`
- **Query Params:** `status` (`Planning`, `Active`, `On Hold`, `Completed`, `All`), `search` (text search).
- **Response 200:** List of projects with dynamic task completion metrics.

#### `POST /projects`
- **Auth:** Admin only (403 for Developers).
- **Body:**
  ```json
  {
    "name": "FinTech Payment Gateway",
    "projectKey": "IVT-PAY",
    "description": "Zero-trust payment pipeline",
    "status": "Active",
    "startDate": "2026-10-01",
    "endDate": "2026-12-31",
    "members": ["6720f1a2..."]
  }
  ```
- **Response 201:** Created project document.

#### `GET /projects/:id`
- Returns detailed project document with full owner, members, and task metrics.

#### `PATCH /projects/:id`
- **Auth:** Admin only. Updates project metadata.

#### `DELETE /projects/:id`
- **Auth:** Admin only. Cascades deletion to child tasks, comments, and activities.

#### `GET /projects/:id/tasks`
- Returns tasks assigned to this project.

---

### 2.5 Tasks (`/tasks`)

#### `GET /tasks`
- **Query Params:** `project`, `assignee`, `status`, `priority`, `search`, `overdue` (`true`), `page`, `limit`.
- **Response 200:** Paginated task list with populated project and assignee details.

#### `POST /tasks`
- **Auth:** Admin only.
- **Validation:** Assignee must have `Developer` role; due date >= start date.
- **Business Rule Defaults:** If status is `Completed`, progress is automatically set to 100%. If `To Do`, progress is set to 0%.

#### `GET /tasks/:id`
- Returns single task with populated references.

#### `PATCH /tasks/:id`
- **Auth:** Admin OR Developer assigned to this task (`canModifyTask`).
- **Body:** Any task fields to update.
- **Audit:** Automatically records changes to `taskactivities`.

#### `PATCH /tasks/:id/status`
- **Auth:** Admin OR assigned Developer.
- **Body:** `{ "status": "Completed" }`
- **Rule Action:** Sets progress to 100% on Completed; 0% on To Do.

#### `PATCH /tasks/:id/progress`
- **Auth:** Admin OR assigned Developer.
- **Body:** `{ "progress": 85 }`
- **Rule Action:** Auto-sets status to `Completed` if progress is 100%; `To Do` if progress is 0%.

#### `DELETE /tasks/:id`
- **Auth:** Admin only.

#### `GET /tasks/:id/comments` & `POST /tasks/:id/comments`
- Retrieve or add comments to a task.

#### `GET /tasks/:id/activity`
- Retrieve full audit trail for a task.

---

### 2.6 Users (`/users`)

#### `GET /users`
- Returns list of team members (filtered by `role` or `isActive`).

#### `POST /users`
- **Auth:** Admin only. Creates new team member with hashed password.

#### `PATCH /users/:id` & `PATCH /users/:id/status`
- **Auth:** Admin only. Updates user profile or activates/deactivates accounts.
