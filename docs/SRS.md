# Software Requirements Specification (SRS)
## TaskFlow — Enterprise Project & Task Management System
**Client Organization:** IVTEX Corporate Solutions Private Limited  
**Role:** Technical Team Lead – Software Development  
**Version:** 1.0.0  
**Status:** Approved & Implemented  

---

## 1. Purpose and Scope
This document specifies the software requirements for **TaskFlow**, an enterprise-grade Project & Task Management System engineered for IVTEX Corporate Solutions Private Limited. TaskFlow provides centralized visibility, milestone tracking, and task lifecycle execution for software engineering teams. It enforces role-based access control (RBAC), strict business progression logic, and real-time dashboard analytics powered directly by MongoDB aggregation pipelines.

---

## 2. System Objectives
1. **Unified Engineering Governance:** Centralize project milestones, tasks, developer workloads, and code review lifecycles.
2. **Deterministic Progress Accounting:** Ensure project completion percentages are computed directly from actual task states rather than arbitrary user-entered values.
3. **Strict Business Rule Compliance:** Guarantee that task statuses, progress increments, and due dates adhere to predetermined corporate standards.
4. **Auditability & Traceability:** Maintain an immutable record of significant task alterations and collaborative commentary.
5. **High Performance & Security:** Implement enterprise security defenses (bcrypt, JWT, Helmet, CORS, Rate Limiting) with sub-second API response times.

---

## 3. User Roles and Permissions

| Feature / Capability | Admin / Team Lead | Developer / Team Member |
| :--- | :---: | :---: |
| **Authentication (Login / Logout / Session)** | ✅ Yes | ✅ Yes |
| **Executive Dashboard & Analytics** | ✅ Yes (Workspace-wide) | ✅ Yes (Personalized & Global) |
| **Create / Edit / Delete Projects** | ✅ Yes | ❌ Read Only |
| **View Projects & Task Breakdown** | ✅ Yes | ✅ Yes |
| **Create Tasks & Assign Developers** | ✅ Yes | ❌ Read Only |
| **Update Task Status & Progress** | ✅ Yes (Any task) | ✅ Yes (Assigned tasks only) |
| **Reassign Tasks to Another Developer** | ✅ Yes | ❌ Unauthorized |
| **Post Task Comments & View Activity** | ✅ Yes | ✅ Yes (Authorized tasks) |
| **Delete Tasks** | ✅ Yes | ❌ Unauthorized |
| **Team Member Management** | ✅ Yes | ❌ Read Only Directory |

---

## 4. Functional Requirements

### 4.1 Authentication & Session Management
- **FR-AUTH-01:** System shall verify credentials using bcrypt (10 rounds salt).
- **FR-AUTH-02:** Successful login shall generate a cryptographically signed JWT token with 7-day expiration.
- **FR-AUTH-03:** Tokens are delivered in both HttpOnly, SameSite cookies and JSON payloads.
- **FR-AUTH-04:** Passwords hashes are never returned across any API endpoint.
- **FR-AUTH-05:** Rate limiter restricts brute-force attempts to a maximum of 20 requests per 15-minute window per IP.

### 4.2 Project Management
- **FR-PROJ-01:** Every project must possess a unique uppercase `projectKey` (2–15 alphanumeric characters).
- **FR-PROJ-02:** Project status transitions: `Planning`, `Active`, `On Hold`, `Completed`.
- **FR-PROJ-03:** End date cannot precede start date.
- **FR-PROJ-04:** Dynamic completion percentage must be computed via:
  $$\text{Completion Percentage} = \left(\frac{\text{Completed Tasks}}{\text{Total Tasks}}\right) \times 100$$
  If total tasks = 0, completion percentage returns 0.0%.

### 4.3 Task Management & Business Rules
The system strictly enforces the **16 core business rules**:
1. Every task must belong to an existing project document in MongoDB.
2. Every task must possess a non-empty title (3–200 characters) and a valid priority (`High`, `Medium`, `Low`).
3. An assignee must exist and have the `Developer` role (Admins cannot be assigned developer tasks).
4. A task due date cannot precede its start date.
5. Developers may modify only tasks assigned directly to them.
6. Only authenticated and authorized users may modify tasks.
7. Completed tasks must have exactly 100% progress.
8. Changing status to `Completed` automatically sets progress to 100%.
9. Changing status to `To Do` automatically resets progress to 0%.
10. `In Progress` tasks must maintain progress between 1% and 99%.
11. `Under Review` tasks retain their current progress until a review decision is rendered.
12. A task is classified as overdue if its due date has elapsed and its status is not `Completed`.
13. Timestamps and dates are standardized to ISO 8601 UTC.
14. Status and progress combinations are validated on the backend via Zod schemas and service-layer guards.
15. Significant field updates (status, progress, assignee, title, dates) are logged to `TaskActivity`.
16. Comments and audit history are restricted to authenticated users.

---

## 5. MongoDB Collections & Relationships

```
+--------------------+            +--------------------+
|       users        | 1        * |      projects      |
|--------------------|<-----------|--------------------|
| _id                |            | _id                |
| name               |            | name               |
| email (unique)     |            | projectKey (unique)|
| passwordHash       |            | owner (ref User)   |
| role [Admin/Dev]   |            | members [ref User] |
+--------------------+            +--------------------+
         ^   ^                              ^
         |   |                              |
         |   | 1                          1 |
         |   |                              |
         |   | *                            *
         |   +-------------------+    +--------------------+
         |                       |    |       tasks        |
         |                       +----|--------------------|
         |                            | _id                |
         |                            | title              |
         |                            | project (ref)      |
         |                            | assignee (ref User)|
         |                            | createdBy (ref User|
         |                            | status, progress   |
         |                            | dueDate, startDate |
         |                            +--------------------+
         |                                      ^
         | 1                                  1 |
         |                                      |
         | *                                  * |
+--------------------+                +--------------------+
|   taskcomments     |                |   taskactivities   |
|--------------------|                |--------------------|
| _id                |                | _id                |
| task (ref Task)    |                | task (ref Task)    |
| user (ref User)    |                | actor (ref User)   |
| comment            |                | action, old/newVal |
+--------------------+                +--------------------+
```

---

## 6. Security & Defensive Architecture
1. **Helmet:** Enforces HTTP security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Content-Security-Policy`).
2. **CORS:** Restricts cross-origin requests to configured trusted origins (`CLIENT_URL`) with cookie support enabled.
3. **Rate Limiting:** Protects `/api/v1/auth/login` from brute-force dictionary attacks.
4. **Data Sanitization:** Strict Zod parsing strips unexpected fields before database queries execute.
5. **Role Guards:** Two-tier protection across frontend component tree and backend middleware.

---

## 7. Responsive UI & Accessibility
- Centralized Material UI v6 theme with dark slate aesthetics, electric violet and cyan accents.
- Responsive breakpoints tested across desktop (1920x1080, 1440x900), tablet (768x1024), and mobile viewports (375x812).
- WCAG compliant color contrast ratios for all chip statuses and button elements.
- Accessible ARIA labels and keyboard focus outlines.

---

## 8. Assumptions & Limitations
- Single workspace deployment (multi-tenancy isolation can be added via tenantId scoping in v2).
- Timezone defaults to ISO 8601 UTC with client-side localization via Day.js.
- Deletion of a project triggers cascade deletion of its child tasks, comments, and activities to avoid orphaned data.
