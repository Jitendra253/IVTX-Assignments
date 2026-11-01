import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';

export const createProject = async (data, ownerId) => {
  const existingKey = await Project.findOne({ projectKey: data.projectKey.toUpperCase() });
  if (existingKey) {
    const error = new Error(`Project key '${data.projectKey.toUpperCase()}' is already in use.`);
    error.statusCode = 409;
    throw error;
  }

  const project = await Project.create({
    name: data.name,
    projectKey: data.projectKey.toUpperCase(),
    description: data.description || '',
    status: data.status || 'Planning',
    startDate: data.startDate,
    endDate: data.endDate,
    owner: ownerId,
    members: data.members || [],
  });

  return project.populate([
    { path: 'owner', select: 'name email role' },
    { path: 'members', select: 'name email role' },
  ]);
};

export const listProjects = async (query = {}) => {
  const matchFilter = {};

  if (query.status && query.status !== 'All') {
    matchFilter.status = query.status;
  }

  if (query.search) {
    matchFilter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { projectKey: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }

  // Use aggregation to join tasks and compute statistics dynamically
  const pipeline = [
    { $match: matchFilter },
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'project',
        as: 'taskList',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'ownerDoc',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'members',
        foreignField: '_id',
        as: 'memberDocs',
      },
    },
    {
      $addFields: {
        owner: { $arrayElemAt: ['$ownerDoc', 0] },
        members: '$memberDocs',
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
        pendingTasks: {
          $size: {
            $filter: {
              input: '$taskList',
              as: 't',
              cond: { $ne: ['$$t.status', 'Completed'] },
            },
          },
        },
        overdueTasks: {
          $size: {
            $filter: {
              input: '$taskList',
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
                  $multiply: [
                    { $divide: ['$completedTasks', '$totalTasks'] },
                    100,
                  ],
                },
                1,
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        taskList: 0,
        ownerDoc: 0,
        memberDocs: 0,
        'owner.passwordHash': 0,
        'members.passwordHash': 0,
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  const projects = await Project.aggregate(pipeline);
  return projects;
};

export const getProjectById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const error = new Error('Invalid project ID format');
    error.statusCode = 400;
    throw error;
  }

  const pipeline = [
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: 'tasks',
        localField: '_id',
        foreignField: 'project',
        as: 'taskList',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'owner',
        foreignField: '_id',
        as: 'ownerDoc',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'members',
        foreignField: '_id',
        as: 'memberDocs',
      },
    },
    {
      $addFields: {
        owner: { $arrayElemAt: ['$ownerDoc', 0] },
        members: '$memberDocs',
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
        inProgressTasks: {
          $size: {
            $filter: {
              input: '$taskList',
              as: 't',
              cond: { $eq: ['$$t.status', 'In Progress'] },
            },
          },
        },
        underReviewTasks: {
          $size: {
            $filter: {
              input: '$taskList',
              as: 't',
              cond: { $eq: ['$$t.status', 'Under Review'] },
            },
          },
        },
        toDoTasks: {
          $size: {
            $filter: {
              input: '$taskList',
              as: 't',
              cond: { $eq: ['$$t.status', 'To Do'] },
            },
          },
        },
        overdueTasks: {
          $size: {
            $filter: {
              input: '$taskList',
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
                  $multiply: [
                    { $divide: ['$completedTasks', '$totalTasks'] },
                    100,
                  ],
                },
                1,
              ],
            },
          ],
        },
      },
    },
    {
      $project: {
        taskList: 0,
        ownerDoc: 0,
        memberDocs: 0,
        'owner.passwordHash': 0,
        'members.passwordHash': 0,
      },
    },
  ];

  const results = await Project.aggregate(pipeline);
  if (!results || results.length === 0) {
    const error = new Error(`Project with ID ${id} not found`);
    error.statusCode = 404;
    throw error;
  }

  return results[0];
};

export const updateProject = async (id, data) => {
  const project = await Project.findById(id);
  if (!project) {
    const error = new Error(`Project with ID ${id} not found`);
    error.statusCode = 404;
    throw error;
  }

  if (data.projectKey && data.projectKey.toUpperCase() !== project.projectKey) {
    const exists = await Project.findOne({
      projectKey: data.projectKey.toUpperCase(),
      _id: { $ne: id },
    });
    if (exists) {
      const error = new Error(`Project key '${data.projectKey.toUpperCase()}' is already in use.`);
      error.statusCode = 409;
      throw error;
    }
    project.projectKey = data.projectKey.toUpperCase();
  }

  if (data.name) project.name = data.name;
  if (data.description !== undefined) project.description = data.description;
  if (data.status) project.status = data.status;
  if (data.startDate) project.startDate = data.startDate;
  if (data.endDate) project.endDate = data.endDate;
  if (data.members) project.members = data.members;

  await project.save();
  return getProjectById(id);
};

export const deleteProject = async (id) => {
  const project = await Project.findById(id);
  if (!project) {
    const error = new Error(`Project with ID ${id} not found`);
    error.statusCode = 404;
    throw error;
  }

  // Also clean up tasks, taskcomments, taskactivities belonging to this project
  const tasks = await Task.find({ project: id });
  const taskIds = tasks.map((t) => t._id);

  if (taskIds.length > 0) {
    await Task.deleteMany({ project: id });
  }

  await Project.findByIdAndDelete(id);
  return { message: 'Project and all associated tasks successfully deleted' };
};

export const getProjectTasks = async (projectId, query = {}) => {
  const filter = { project: projectId };
  if (query.status && query.status !== 'All') filter.status = query.status;
  if (query.priority && query.priority !== 'All') filter.priority = query.priority;
  if (query.assignee && query.assignee !== 'All') filter.assignee = query.assignee;

  const tasks = await Task.find(filter)
    .populate('assignee', 'name email role')
    .populate('createdBy', 'name email role')
    .sort({ dueDate: 1 });

  return tasks;
};
