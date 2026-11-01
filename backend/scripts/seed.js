import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../src/models/User.js';
import { Project } from '../src/models/Project.js';
import { Task } from '../src/models/Task.js';
import { TaskComment } from '../src/models/TaskComment.js';
import { TaskActivity } from '../src/models/TaskActivity.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';

export const seedDatabase = async () => {
  try {
    console.log(`Connecting to MongoDB for seeding at: ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);

    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      TaskComment.deleteMany({}),
      TaskActivity.deleteMany({}),
    ]);

    console.log('Creating demo users with hashed passwords...');
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
    const devPasswordHash = await bcrypt.hash('Dev@123', 10);

    const admin = await User.create({
      name: 'Vikram Mehta (Tech Lead)',
      email: 'admin@ivtex.com',
      passwordHash: adminPasswordHash,
      role: 'Admin',
      isActive: true,
    });

    const dev1 = await User.create({
      name: 'John Miller (Senior Frontend)',
      email: 'john.dev@ivtex.com',
      passwordHash: devPasswordHash,
      role: 'Developer',
      isActive: true,
    });

    const dev2 = await User.create({
      name: 'Sarah Connor (Backend Architect)',
      email: 'sarah.dev@ivtex.com',
      passwordHash: devPasswordHash,
      role: 'Developer',
      isActive: true,
    });

    const dev3 = await User.create({
      name: 'Alex Rivera (Full Stack Dev)',
      email: 'alex.dev@ivtex.com',
      passwordHash: devPasswordHash,
      role: 'Developer',
      isActive: true,
    });

    const dev4 = await User.create({
      name: 'Priya Sharma (Mobile & QA Dev)',
      email: 'priya.dev@ivtex.com',
      passwordHash: devPasswordHash,
      role: 'Developer',
      isActive: true,
    });

    const developers = [dev1, dev2, dev3, dev4];
    console.log(`Created 1 Admin and ${developers.length} Developers.`);

    console.log('Creating demo projects...');
    const today = new Date();
    const daysAgo = (n) => new Date(today.getTime() - n * 24 * 60 * 60 * 1000);
    const daysAhead = (n) => new Date(today.getTime() + n * 24 * 60 * 60 * 1000);

    const projectERP = await Project.create({
      name: 'Enterprise Cloud ERP Platform',
      projectKey: 'IVT-ERP',
      description: 'Migration and modern microservices architecture for IVTEX corporate enterprise supply chain and financials.',
      status: 'Active',
      startDate: daysAgo(30),
      endDate: daysAhead(60),
      owner: admin._id,
      members: [dev1._id, dev2._id, dev3._id],
    });

    const projectSEC = await Project.create({
      name: 'FinTech Payment Security Gateway',
      projectKey: 'IVT-SEC',
      description: 'Zero-trust compliant payment processing infrastructure with PCI-DSS 4.0 certification and fraud detection pipelines.',
      status: 'Active',
      startDate: daysAgo(20),
      endDate: daysAhead(45),
      owner: admin._id,
      members: [dev2._id, dev3._id, dev4._id],
    });

    const projectMOB = await Project.create({
      name: 'Mobile Wealth Management App',
      projectKey: 'IVT-MOB',
      description: 'Next-gen cross-platform mobile client for institutional portfolio tracking, automated rebalancing, and instant FX transfer.',
      status: 'Active',
      startDate: daysAgo(15),
      endDate: daysAhead(30),
      owner: admin._id,
      members: [dev1._id, dev4._id],
    });

    const projectAI = await Project.create({
      name: 'Customer Service AI Copilot',
      projectKey: 'IVT-AI',
      description: 'RAG-augmented natural language customer engagement agent integrated with CRM, ticket triage, and conversational search.',
      status: 'Planning',
      startDate: daysAhead(5),
      endDate: daysAhead(90),
      owner: admin._id,
      members: [dev2._id, dev3._id],
    });

    const projectPORT = await Project.create({
      name: 'Corporate Partner Portal Modernization',
      projectKey: 'IVT-PORT',
      description: 'Legacy web portal deprecation and replacement with responsive dashboard, granular RBAC, and automated billing export.',
      status: 'Completed',
      startDate: daysAgo(90),
      endDate: daysAgo(10),
      owner: admin._id,
      members: [dev1._id, dev2._id, dev3._id, dev4._id],
    });

    const projects = [projectERP, projectSEC, projectMOB, projectAI, projectPORT];
    console.log(`Created ${projects.length} Projects.`);

    console.log('Creating demo tasks adhering to all 16 business rules...');

    const taskSeedData = [
      // Project ERP Tasks
      {
        title: 'Design Multi-tenant Database Sharding Strategy',
        description: 'Formulate MongoDB sharding key topology and connection pooling configurations for regional tenant isolation.',
        project: projectERP._id,
        assignee: dev2._id,
        createdBy: admin._id,
        priority: 'High',
        status: 'Completed',
        progress: 100,
        startDate: daysAgo(25),
        dueDate: daysAgo(5),
      },
      {
        title: 'Implement OAuth2 / SSO Authorization Bridge',
        description: 'Integrate corporate Okta/Azure AD SAML and OpenID Connect flows with JWT bearer token verification.',
        project: projectERP._id,
        assignee: dev3._id,
        createdBy: admin._id,
        priority: 'High',
        status: 'In Progress',
        progress: 65,
        startDate: daysAgo(15),
        dueDate: daysAhead(4),
      },
      {
        title: 'Develop Real-time Ledger Audit Streaming',
        description: 'Establish Kafka / Change Stream consumer to guarantee immutable event sourcing for billing changes.',
        project: projectERP._id,
        assignee: dev2._id,
        createdBy: admin._id,
        priority: 'Medium',
        status: 'To Do',
        progress: 0,
        startDate: daysAgo(2),
        dueDate: daysAhead(14),
      },
      {
        title: 'Build Executive KPI Dashboard Components',
        description: 'Construct responsive Material UI charts with custom color palettes and responsive layouts for desktop and tablet.',
        project: projectERP._id,
        assignee: dev1._id,
        createdBy: admin._id,
        priority: 'High',
        status: 'In Progress',
        progress: 40,
        startDate: daysAgo(10),
        dueDate: daysAgo(2), // OVERDUE task!
      },

      // Project SEC Tasks
      {
        title: 'Implement AES-256 Field Level Encryption',
        description: 'Ensure PAN and sensitive cardholder data are encrypted at rest with envelope encryption and HSM key rotation.',
        project: projectSEC._id,
        assignee: dev2._id,
        createdBy: admin._id,
        priority: 'High',
        status: 'Under Review',
        progress: 90,
        startDate: daysAgo(18),
        dueDate: daysAhead(2),
      },
      {
        title: 'Webhook Idempotency and Signature Verification',
        description: 'Prevent replay attacks by validating HMAC-SHA256 headers with 5-minute clock drift tolerance and Redis deduplication.',
        project: projectSEC._id,
        assignee: dev3._id,
        createdBy: admin._id,
        priority: 'Medium',
        status: 'Completed',
        progress: 100,
        startDate: daysAgo(15),
        dueDate: daysAgo(1),
      },
      {
        title: 'Automated Penetration & SAST Scan Integration',
        description: 'Set up SonarQube, Snyk, and OWASP ZAP scanning gates in GitHub Actions release pipelines.',
        project: projectSEC._id,
        assignee: dev4._id,
        createdBy: admin._id,
        priority: 'Medium',
        status: 'To Do',
        progress: 0,
        startDate: daysAgo(5),
        dueDate: daysAhead(10),
      },
      {
        title: 'PCI-DSS Compliance Audit Documentation',
        description: 'Compile compliance architecture diagrams, data flow maps, and access logs for QSA reviewer signoff.',
        project: projectSEC._id,
        assignee: dev2._id,
        createdBy: admin._id,
        priority: 'High',
        status: 'In Progress',
        progress: 25,
        startDate: daysAgo(12),
        dueDate: daysAgo(3), // OVERDUE task!
      },

      // Project MOB Tasks
      {
        title: 'Biometric Authentication & FaceID Enrollment',
        description: 'Create native biometric prompt bridge with fallback PIN encryption stored securely in iOS Keychain / Android Keystore.',
        project: projectMOB._id,
        assignee: dev4._id,
        createdBy: admin._id,
        priority: 'High',
        status: 'In Progress',
        progress: 80,
        startDate: daysAgo(12),
        dueDate: daysAhead(6),
      },
      {
        title: 'Interactive Portfolio Rebalancing Chart',
        description: 'Render interactive asset allocation donuts and historical yield comparisons using Recharts.',
        project: projectMOB._id,
        assignee: dev1._id,
        createdBy: admin._id,
        priority: 'Medium',
        status: 'Under Review',
        progress: 85,
        startDate: daysAgo(8),
        dueDate: daysAhead(3),
      },
      {
        title: 'Push Notification Gateway for Market Movements',
        description: 'Configure Firebase Cloud Messaging and APNs with custom silent alerts and deep-linking into trade tickets.',
        project: projectMOB._id,
        assignee: dev4._id,
        createdBy: admin._id,
        priority: 'Low',
        status: 'To Do',
        progress: 0,
        startDate: daysAgo(1),
        dueDate: daysAhead(18),
      },

      // Project AI Tasks
      {
        title: 'Vector Embedding Pipeline for Knowledge Base',
        description: 'Establish automated ingestion of company handbook, SLA matrices, and technical API docs into vector embeddings.',
        project: projectAI._id,
        assignee: dev3._id,
        createdBy: admin._id,
        priority: 'High',
        status: 'To Do',
        progress: 0,
        startDate: daysAhead(5),
        dueDate: daysAhead(25),
      },

      // Project PORT (Completed Project) Tasks
      {
        title: 'Migrate Legacy User Profiles and Permissions',
        description: 'Extract and transform 15,000 corporate partner credentials and assign updated granular RBAC permissions.',
        project: projectPORT._id,
        assignee: dev3._id,
        createdBy: admin._id,
        priority: 'High',
        status: 'Completed',
        progress: 100,
        startDate: daysAgo(80),
        dueDate: daysAgo(50),
      },
      {
        title: 'Build Partner Billing Statement Export (PDF/CSV)',
        description: 'Generate digitally signed monthly billing summaries and tax invoices on demand.',
        project: projectPORT._id,
        assignee: dev1._id,
        createdBy: admin._id,
        priority: 'Medium',
        status: 'Completed',
        progress: 100,
        startDate: daysAgo(50),
        dueDate: daysAgo(20),
      },
    ];

    const createdTasks = await Task.insertMany(taskSeedData);
    console.log(`Created ${createdTasks.length} Tasks.`);

    console.log('Creating demo comments and activity history...');

    // Add comments to the first few tasks
    await TaskComment.create({
      task: createdTasks[1]._id,
      user: dev3._id,
      comment: 'Okta test tenant is configured and PKCE flow with authorization code grant is verified locally.',
    });

    await TaskComment.create({
      task: createdTasks[1]._id,
      user: admin._id,
      comment: 'Excellent progress. Make sure refresh token rotation is enabled before deploying to staging.',
    });

    await TaskComment.create({
      task: createdTasks[3]._id,
      user: dev1._id,
      comment: 'Initial charts layout ready. Fine-tuning responsive drawer behavior for mobile screen breakpoints.',
    });

    await TaskComment.create({
      task: createdTasks[4]._id,
      user: dev2._id,
      comment: 'KMS customer master key integration complete. Ready for security team code review.',
    });

    // Create activity records
    for (const task of createdTasks) {
      await TaskActivity.create({
        task: task._id,
        actor: task.createdBy,
        action: 'Task Created',
        oldValue: null,
        newValue: `Created with status '${task.status}' and priority '${task.priority}'`,
      });

      if (task.status !== 'To Do') {
        await TaskActivity.create({
          task: task._id,
          actor: task.assignee,
          action: 'Status Changed',
          oldValue: 'To Do',
          newValue: task.status,
        });
      }

      if (task.progress > 0) {
        await TaskActivity.create({
          task: task._id,
          actor: task.assignee,
          action: 'Progress Updated',
          oldValue: '0%',
          newValue: `${task.progress}%`,
        });
      }
    }

    console.log('Seeding completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('----------------------------------------------------');
    console.log('Admin / Team Lead: admin@ivtex.com / Admin@123');
    console.log('Developer 1:       john.dev@ivtex.com / Dev@123');
    console.log('Developer 2:       sarah.dev@ivtex.com / Dev@123');
    console.log('Developer 3:       alex.dev@ivtex.com / Dev@123');
    console.log('Developer 4:       priya.dev@ivtex.com / Dev@123');
    console.log('----------------------------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

// If run directly
seedDatabase();
