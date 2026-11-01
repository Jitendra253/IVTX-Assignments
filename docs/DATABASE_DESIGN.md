# MongoDB Database Design & Architecture
## TaskFlow — Enterprise Project & Task Management System
**Database:** MongoDB 7.0+ / 8.0+  
**Object Data Modeling (ODM):** Mongoose 8.x  

---

## 1. Architectural Justification: Why MongoDB?

MongoDB was selected as the persistence engine for TaskFlow for several technical and operational reasons:

1. **Document Flexibility with Strict Schema Enforcement:** While MongoDB provides the agility of JSON-like document models, Mongoose layer validation guarantees strict data integrity, type checking, enums, and required fields.
2. **Powerful Aggregation Framework:** The MongoDB Aggregation Pipeline (`$lookup`, `$match`, `$group`, `$facet`, `$project`, `$addFields`, `$cond`) enables multi-dimensional KPI summaries, project completion calculations, and developer workload rollups executed in native C++ on the database engine.
3. **High Write Throughput for Audit Logs:** Frequent concurrent writes (task comments, activity logs, status updates) execute with low latency without table lock contention.
4. **Horizontal Scalability:** Native sharding capabilities allow future multi-tenant growth across geographical regions by partitioning on `project` or `tenantId`.

---

## 2. Embedding vs. Referencing Decision

### Critical Architectural Principle: Avoid Unbounded Arrays
A naive document design might attempt to embed all tasks directly inside each project document:
```json
// ANTI-PATTERN: Unbounded embedded array
{
  "_id": "project_1",
  "name": "Enterprise ERP",
  "tasks": [ ...thousands of tasks... ]
}
```
**Why this anti-pattern was rejected:**
1. **16MB Document Size Limit:** Enterprise projects with thousands of tasks, rich descriptions, and activity histories will eventually breach MongoDB's 16MB BSON document boundary.
2. **Memory & I/O Overhead:** Querying project metadata or updating a single task would require reading, serializing, and rewriting the entire multi-megabyte project document.
3. **Concurrency Conflicts:** Two developers updating different tasks in the same project simultaneously would trigger high write-conflict rates.

**The Solution:**
Tasks, comments, and activities are stored in separate dedicated collections, linked via `ObjectId` references and indexed foreign keys. Projects with thousands of tasks scale smoothly without document bloat.

---

## 3. Data Dictionary & Schemas

### 3.1 Collection: `users`
Stores authenticated users and system actors.

| Field | Type | Required | Unique | Indexed | Description / Validation |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | Yes | Yes | Primary Key |
| `name` | String | Yes | No | No | 2–100 characters, trimmed |
| `email` | String | Yes | Yes | Yes | Lowercase, valid email regex pattern |
| `passwordHash` | String | Yes | No | No | bcrypt hashed password (`select: false`) |
| `role` | String | Yes | No | Yes | Enum: `['Admin', 'Developer']`, default: `'Developer'` |
| `isActive` | Boolean | Yes | No | Yes | Default: `true` |
| `createdAt` | Date | Auto | No | No | Mongoose timestamp |
| `updatedAt` | Date | Auto | No | No | Mongoose timestamp |

### 3.2 Collection: `projects`
Stores high-level engineering initiatives and milestones.

| Field | Type | Required | Unique | Indexed | Description / Validation |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | Yes | Yes | Primary Key |
| `name` | String | Yes | No | No | 3–150 characters, trimmed |
| `projectKey` | String | Yes | Yes | Yes | Uppercase alphanumeric (2–15 chars) |
| `description` | String | No | No | No | Max 2000 characters |
| `status` | String | Yes | No | Yes | Enum: `['Planning', 'Active', 'On Hold', 'Completed']` |
| `startDate` | Date | Yes | No | No | Project start |
| `endDate` | Date | Yes | No | No | End date >= `startDate` |
| `owner` | ObjectId | Yes | No | Yes | Ref: `User` (Admin creator) |
| `members` | Array<ObjectId>| No | No | No | Array of `User` references |
| `createdAt` | Date | Auto | No | Yes | Compound index `{ status: 1, createdAt: -1 }` |
| `updatedAt` | Date | Auto | No | No | Mongoose timestamp |

### 3.3 Collection: `tasks`
Stores individual work units and developer assignments.

| Field | Type | Required | Unique | Indexed | Description / Validation |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | Yes | Yes | Primary Key |
| `title` | String | Yes | No | Yes | 3–200 characters, trimmed |
| `description` | String | No | No | No | Max 5000 characters |
| `project` | ObjectId | Yes | No | Yes | Ref: `Project` |
| `assignee` | ObjectId | Yes | No | Yes | Ref: `User` (Role must be `'Developer'`) |
| `createdBy` | ObjectId | Yes | No | Yes | Ref: `User` |
| `priority` | String | Yes | No | Yes | Enum: `['High', 'Medium', 'Low']` |
| `status` | String | Yes | No | Yes | Enum: `['To Do', 'In Progress', 'Under Review', 'Completed']` |
| `progress` | Number | Yes | No | No | 0 to 100 (Bounded by business rules) |
| `startDate` | Date | Yes | No | No | Task start |
| `dueDate` | Date | Yes | No | Yes | Due date >= `startDate` |
| `createdAt` | Date | Auto | No | No | Mongoose timestamp |
| `updatedAt` | Date | Auto | No | Yes | Indexed for recency queries |

### 3.4 Collection: `taskcomments`
Stores collaborative discussions and technical notes.

| Field | Type | Required | Unique | Indexed | Description / Validation |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | Yes | Yes | Primary Key |
| `task` | ObjectId | Yes | No | Yes | Ref: `Task` |
| `user` | ObjectId | Yes | No | No | Ref: `User` |
| `comment` | String | Yes | No | No | 1–3000 characters |
| `createdAt` | Date | Auto | No | Yes | Compound index `{ task: 1, createdAt: -1 }` |

### 3.5 Collection: `taskactivities`
Audit log recording every significant modification made to tasks.

| Field | Type | Required | Unique | Indexed | Description / Validation |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `_id` | ObjectId | Yes | Yes | Yes | Primary Key |
| `task` | ObjectId | Yes | No | Yes | Ref: `Task` |
| `actor` | ObjectId | Yes | No | No | Ref: `User` |
| `action` | String | Yes | No | No | e.g. `'Status Changed'`, `'Progress Updated'` |
| `oldValue` | String | No | No | No | Value before mutation |
| `newValue` | String | No | No | No | Value after mutation |
| `createdAt` | Date | Auto | No | Yes | Compound index `{ task: 1, createdAt: -1 }` |

---

## 4. Indexing Strategy

TaskFlow implements strategic compound and single-field indexes to ensure all dashboard aggregations, searches, and filters complete in sub-10ms:

```javascript
// User indexes
users.createIndex({ email: 1 }, { unique: true });
users.createIndex({ role: 1 });
users.createIndex({ isActive: 1 });

// Project indexes
projects.createIndex({ projectKey: 1 }, { unique: true });
projects.createIndex({ status: 1, createdAt: -1 });
projects.createIndex({ owner: 1 });

// Task compound indexes for high-frequency queries
tasks.createIndex({ project: 1, status: 1 });
tasks.createIndex({ assignee: 1, status: 1 });
tasks.createIndex({ status: 1, dueDate: 1 });
tasks.createIndex({ priority: 1, dueDate: 1 });
tasks.createIndex({ title: "text" });

// Comment & Activity history indexes
taskcomments.createIndex({ task: 1, createdAt: -1 });
taskactivities.createIndex({ task: 1, createdAt: -1 });
```

---

## 5. Dynamic Aggregation Pipelines

### Project Completion Percentage Pipeline
Project completion is never stored as a stagnant field; it is computed dynamically by joining the `tasks` collection:

```javascript
[
  { $match: { _id: projectId } },
  {
    $lookup: {
      from: 'tasks',
      localField: '_id',
      foreignField: 'project',
      as: 'taskList',
    },
  },
  {
    $addFields: {
      totalTasks: { $size: '$taskList' },
      completedTasks: {
        $size: {
          $filter: {
            input: '$taskList',
            as: 't',
            cond: { $eq: ['$$t.status', 'Completed'] },
          },
        },
      },
    },
  },
  {
    $addFields: {
      completionPercentage: {
        $cond: [
          { $eq: ['$totalTasks', 0] },
          0,
          {
            $round: [
              { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
              1,
            ],
          },
        ],
      },
    },
  },
]
```
This guarantees 100% data consistency without synchronization lag or race conditions.
