import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { TaskActivity } from '../models/TaskActivity.js';
import { User } from '../models/User.js';

export const getDashboardSummary = async (currentUser) => {
  const now = new Date();

  // Project KPI counts
  const activeProjectsCount = await Project.countDocuments({ status: 'Active' });
  const totalProjectsCount = await Project.countDocuments();

  // Task KPI aggregation
  const [taskStats] = await Task.aggregate([
    {
      $facet: {
        total: [{ $count: 'count' }],
        completed: [{ $match: { status: 'Completed' } }, { $count: 'count' }],
        inProgress: [{ $match: { status: 'In Progress' } }, { $count: 'count' }],
        underReview: [{ $match: { status: 'Under Review' } }, { $count: 'count' }],
        toDo: [{ $match: { status: 'To Do' } }, { $count: 'count' }],
        overdue: [
          {
            $match: {
              status: { $ne: 'Completed' },
              dueDate: { $lt: now },
            },
          },
          { $count: 'count' },
        ],
      },
    },
  ]);

  const totalTasks = taskStats?.total[0]?.count || 0;
  const completedTasks = taskStats?.completed[0]?.count || 0;
  const inProgressTasks = taskStats?.inProgress[0]?.count || 0;
  const underReviewTasks = taskStats?.underReview[0]?.count || 0;
  const toDoTasks = taskStats?.toDo[0]?.count || 0;
  const overdueTasks = taskStats?.overdue[0]?.count || 0;
  // Pending tasks are all non-completed tasks (To Do + In Progress + Under Review)
  const pendingTasks = totalTasks - completedTasks;

  return {
    activeProjects: activeProjectsCount,
    totalProjects: totalProjectsCount,
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    inProgressTasks,
    underReviewTasks,
    toDoTasks,
  };
};

export const getProjectProgressList = async () => {
  const pipeline = [
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'project',
        as: 'tasks',
      },
    },
    {
      $project: {
        name: 1,
        projectKey: 1,
        status: 1,
        startDate: 1,
        endDate: 1,
        totalTasks: { $size: '$tasks' },
        completedTasks: {
          $size: {
            $filter: {
              input: '$tasks',
              as: 't',
              cond: { $eq: ['$$t.status', 'Completed'] },
            },
          },
        },
        inProgressTasks: {
          $size: {
            $filter: {
              input: '$tasks',
              as: 't',
              cond: { $eq: ['$$t.status', 'In Progress'] },
            },
          },
        },
        overdueTasks: {
          $size: {
            $filter: {
              input: '$tasks',
              as: 't',
              cond: {
                $and: [
                  { $ne: ['$$t.status', 'Completed'] },
                  { $lt: ['$$t.dueDate', new Date()] },
                ],
              },
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
                {
                  $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100],
                },
                1,
              ],
            },
          ],
        },
      },
    },
    { $sort: { completionPercentage: -1, name: 1 } },
  ];

  return Project.aggregate(pipeline);
};

export const getTaskDistribution = async () => {
  // Distribution by Status
  const statusDistribution = await Task.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        status: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ]);

  // Distribution by Priority
  const priorityDistribution = await Task.aggregate([
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        priority: '$_id',
        count: 1,
        _id: 0,
      },
    },
  ]);

  return {
    byStatus: statusDistribution,
    byPriority: priorityDistribution,
  };
};

export const getDeveloperWorkload = async () => {
  const pipeline = [
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'assignee',
        as: 'assignedTasks',
      },
    },
    {
      $match: {
        role: 'Developer',
        isActive: true,
      },
    },
    {
      $project: {
        name: 1,
        email: 1,
        totalAssigned: { $size: '$assignedTasks' },
        completed: {
          $size: {
            $filter: {
              input: '$assignedTasks',
              as: 't',
              cond: { $eq: ['$$t.status', 'Completed'] },
            },
          },
        },
        inProgress: {
          $size: {
            $filter: {
              input: '$assignedTasks',
              as: 't',
              cond: { $eq: ['$$t.status', 'In Progress'] },
            },
          },
        },
        underReview: {
          $size: {
            $filter: {
              input: '$assignedTasks',
              as: 't',
              cond: { $eq: ['$$t.status', 'Under Review'] },
            },
          },
        },
        toDo: {
          $size: {
            $filter: {
              input: '$assignedTasks',
              as: 't',
              cond: { $eq: ['$$t.status', 'To Do'] },
            },
          },
        },
        overdue: {
          $size: {
            $filter: {
              input: '$assignedTasks',
              as: 't',
              cond: {
                $and: [
                  { $ne: ['$$t.status', 'Completed'] },
                  { $lt: ['$$t.dueDate', new Date()] },
                ],
              },
            },
          },
        },
      },
    },
    { $sort: { totalAssigned: -1 } },
  ];

  return User.aggregate(pipeline);
};

export const getUpcomingDeadlines = async () => {
  const tasks = await Task.find({
    status: { $ne: 'Completed' },
  })
    .sort({ dueDate: 1 })
    .limit(8)
    .populate('project', 'name projectKey')
    .populate('assignee', 'name email');

  return tasks;
};

export const getRecentlyUpdatedTasks = async () => {
  const tasks = await Task.find()
    .sort({ updatedAt: -1 })
    .limit(6)
    .populate('project', 'name projectKey')
    .populate('assignee', 'name email');

  return tasks;
};

export const getOverdueTaskList = async () => {
  const tasks = await Task.find({
    status: { $ne: 'Completed' },
    dueDate: { $lt: new Date() },
  })
    .sort({ dueDate: 1 })
    .limit(10)
    .populate('project', 'name projectKey')
    .populate('assignee', 'name email');

  return tasks;
};

export const getRecentActivityFeed = async () => {
  const activities = await TaskActivity.find()
    .sort({ createdAt: -1 })
    .limit(15)
    .populate('task', 'title project')
    .populate('actor', 'name email role');

  return activities;
};
