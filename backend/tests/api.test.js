import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { Project } from '../src/models/Project.js';
import { Task } from '../src/models/Task.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';

describe('TaskFlow API & Business Logic Integration Suite', () => {
  let adminToken = '';
  let devToken = '';
  let adminUser = null;
  let devUser = null;
  let testProjectId = '';
  let testTaskId = '';

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(MONGODB_URI);
    }
  });

  afterAll(async () => {
    // Keep connection clean
  });

  describe('1. Health Check', () => {
    it('GET /api/v1/health should return 200 and healthy status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('TaskFlow API');
    });
  });

  describe('2. Authentication & Security', () => {
    it('POST /api/v1/auth/login should fail with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@ivtex.com', password: 'WrongPassword!' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/v1/auth/login should succeed for Admin and return JWT & user object', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@ivtex.com', password: 'Admin@123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('Admin');
      expect(res.body.data.user.passwordHash).toBeUndefined(); // Never expose passwordHash!
      adminToken = res.body.data.token;
      adminUser = res.body.data.user;
    });

    it('POST /api/v1/auth/login should succeed for Developer', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'john.dev@ivtex.com', password: 'Dev@123' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('Developer');
      devToken = res.body.data.token;
      devUser = res.body.data.user;
    });

    it('GET /api/v1/auth/me should reject requests without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
    });

    it('GET /api/v1/auth/me should succeed with valid Bearer token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('admin@ivtex.com');
    });
  });

  describe('3. Role-Based Access Control (RBAC)', () => {
    it('Developer role cannot create projects (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${devToken}`)
        .send({
          name: 'Unauthorized Project',
          projectKey: 'UNAUTH',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
        });
      expect(res.status).toBe(403);
    });

    it('Admin role can create a project successfully', async () => {
      const uniqueKey = `TST${Math.floor(Math.random() * 9000 + 1000)}`;
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Automated Test Suite Project',
          projectKey: uniqueKey,
          description: 'Project created via automated test pipeline',
          status: 'Active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        });
      expect(res.status).toBe(201);
      expect(res.body.data.projectKey).toBe(uniqueKey);
      testProjectId = res.body.data._id;
    });
  });

  describe('4. Task Business Rules & Validation', () => {
    it('Task assignee must have Developer role (reject if Admin is assigned)', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Invalid Assignment Task',
          project: testProjectId,
          assignee: adminUser._id, // Admin cannot be assignee!
          startDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 86400000).toISOString(),
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Developer role/i);
    });

    it('Deadline cannot precede start date', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 86400000);
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Invalid Dates Task',
          project: testProjectId,
          assignee: devUser._id,
          startDate: now.toISOString(),
          dueDate: past.toISOString(), // Before start!
        });
      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Validation Error|Due date/i);
    });

    it('Admin can create valid task assigned to Developer with default To Do and 0% progress', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Implement Core Feature Tests',
          description: 'Write integration tests covering all RBAC scenarios',
          project: testProjectId,
          assignee: devUser._id,
          priority: 'High',
          status: 'To Do',
          startDate: new Date().toISOString(),
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        });
      expect(res.status).toBe(201);
      expect(res.body.data.progress).toBe(0);
      expect(res.body.data.status).toBe('To Do');
      testTaskId = res.body.data._id;
    });

    it('Updating status to Completed automatically sets progress to 100% (Rule 8)', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${testTaskId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'Completed' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Completed');
      expect(res.body.data.progress).toBe(100);
    });

    it('Updating status to To Do resets progress to 0% (Rule 9)', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${testTaskId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'To Do' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('To Do');
      expect(res.body.data.progress).toBe(0);
    });

    it('Task comment and activity logs are tracked', async () => {
      const commentRes = await request(app)
        .post(`/api/v1/tasks/${testTaskId}/comments`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ comment: 'Automated QA verification comment' });
      expect(commentRes.status).toBe(201);

      const activityRes = await request(app)
        .get(`/api/v1/tasks/${testTaskId}/activity`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(activityRes.status).toBe(200);
      expect(activityRes.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('5. Dashboard Aggregations & Project Completion Percentage', () => {
    it('GET /api/v1/dashboard/summary calculates correct real-time KPIs', async () => {
      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.totalTasks).toBeGreaterThan(0);
      expect(res.body.data.activeProjects).toBeGreaterThanOrEqual(1);
      expect(res.body.data.pendingTasks).toBeDefined();
    });

    it('GET /api/v1/projects calculates dynamic completionPercentage from tasks', async () => {
      const res = await request(app)
        .get('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const project = res.body.data.find((p) => p._id === testProjectId);
      expect(project).toBeDefined();
      expect(typeof project.completionPercentage).toBe('number');
    });
  });
});
