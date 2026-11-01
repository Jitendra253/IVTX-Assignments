import mongoose from 'mongoose';
import { Task } from '../models/Task.js';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { TaskComment } from '../models/TaskComment.js';
import { TaskActivity } from '../models/TaskActivity.js';

// Helper to record an activity event
const recordActivity = async (taskId, actorId, action, oldValue, newValue) => {
  try {
    await TaskActivity.create({
      task: taskId,
      actor: actorId,
      action,
      oldValue: oldValue ? String(oldValue) : null,
      newValue: newValue ? String(newValue) : null,
    });
  } catch (err) {
    console.error('Failed to record task activity:', err);
  }
};

export const createTask = async (data, creatorId) => {
  // Rule 1: Task must belong to an existing project
  const project = await Project.findById(data.project);
  if (!project) {
    const error = new Error(`Project with ID ${data.project} not found`);
    error.statusCode = 404;
    throw error;
  }

  // Rule 3: Assignee must exist and have the Developer role
  const assignee = await User.findById(data.assignee);
  if (!assignee) {
    const error = new Error(`Assignee with ID ${data.assignee} not found`);
    error.statusCode = 404;
    throw error;
  }
  if (assignee.role !== 'Developer') {
    const error = new Error('Invalid assignee: Only users with the Developer role can be assigned to tasks.');
    error.statusCode = 400;
    throw error;
  }

  // Calculate initial progress based on status
  let progress = data.progress !== undefined ? data.progress : 0;
  if (data.status === 'Completed') {
    progress = 100; // Rule 7 & 8
  } else if (data.status === 'To Do') {
    progress = 0; // Rule 9
  } else if (data.status === 'In Progress') {
    // Rule 10: In Progress tasks must have progress between 1% and 99%
    if (progress <= 0) progress = 10;
    if (progress >= 100) progress = 99;
  }

  const task = await Task.create({
    title: data.title,
    description: data.description || '',
    project: data.project,
    assignee: data.assignee,
    createdBy: creatorId,
    priority: data.priority || 'Medium',
    status: data.status || 'To Do',
    progress,
    startDate: data.startDate,
    dueDate: data.dueDate,
  });

  await recordActivity(task._id, creatorId, 'Task Created', null, `Task created with status '${task.status}'`);

  return task.populate([
    { path: 'project', select: 'name projectKey status' },
    { path: 'assignee', select: 'name email role' },
    { path: 'createdBy', select: 'name email role' },
  ]);
};

export const listTasks = async (query = {}, currentUser = null) => {
  const filter = {};

  if (query.project && query.project !== 'All') {
    filter.project = query.project;
  }

  if (query.assignee && query.assignee !== 'All') {
    filter.assignee = query.assignee;
  }

  if (query.status && query.status !== 'All') {
    filter.status = query.status;
  }

  if (query.priority && query.priority !== 'All') {
    filter.priority = query.priority;
  }

  if (query.search) {
    filter.title = { $regex: query.search, $options: 'i' };
  }

  if (query.overdue === 'true') {
    filter.status = { $ne: 'Completed' };
    filter.dueDate = { $lt: new Date() };
  }

  const page = parseInt(query.page, 10) || 1;
  const limit = parseInt(query.limit, 10) || 50;
  const skip = (page - 1) * limit;

  // Sorting
  let sort = { dueDate: 1 };
  if (query.sortBy) {
    const order = query.sortOrder === 'desc' ? -1 : 1;
    sort = { [query.sortBy]: order };
  }

  const total = await Task.countDocuments(filter);
  const tasks = await Task.find(filter)
    .populate('project', 'name projectKey status')
    .populate('assignee', 'name email role')
    .populate('createdBy', 'name email role')
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return {
    tasks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getTaskById = async (id) => {
  const task = await Task.findById(id)
    .populate('project', 'name projectKey status startDate endDate owner')
    .populate('assignee', 'name email role')
    .populate('createdBy', 'name email role');

  if (!task) {
    const error = new Error(`Task with ID ${id} not found`);
    error.statusCode = 404;
    throw error;
  }

  return task;
};

export const updateTask = async (id, data, currentUser) => {
  const task = await Task.findById(id);
  if (!task) {
    const error = new Error(`Task with ID ${id} not found`);
    error.statusCode = 404;
    throw error;
  }

  // Check Developer assignment if changing assignee
  if (data.assignee && data.assignee.toString() !== task.assignee.toString()) {
    // Only Admin can reassign tasks
    if (currentUser.role !== 'Admin') {
      const error = new Error('Forbidden: Only Administrators may reassign tasks.');
      error.statusCode = 403;
      throw error;
    }

    const assignee = await User.findById(data.assignee);
    if (!assignee || assignee.role !== 'Developer') {
      const error = new Error('Assignee must be an active user with Developer role');
      error.statusCode = 400;
      throw error;
    }

    await recordActivity(task._id, currentUser._id, 'Assignee Changed', task.assignee, data.assignee);
    task.assignee = data.assignee;
  }

  // Handle Title
  if (data.title && data.title !== task.title) {
    await recordActivity(task._id, currentUser._id, 'Title Changed', task.title, data.title);
    task.title = data.title;
  }

  // Handle Description
  if (data.description !== undefined && data.description !== task.description) {
    task.description = data.description;
  }

  // Handle Priority
  if (data.priority && data.priority !== task.priority) {
    await recordActivity(task._id, currentUser._id, 'Priority Changed', task.priority, data.priority);
    task.priority = data.priority;
  }

  // Handle Dates
  if (data.startDate) task.startDate = data.startDate;
  if (data.dueDate) {
    if (task.dueDate && task.dueDate.toISOString() !== new Date(data.dueDate).toISOString()) {
      await recordActivity(task._id, currentUser._id, 'Due Date Changed', task.dueDate.toISOString().split('T')[0], new Date(data.dueDate).toISOString().split('T')[0]);
    }
    task.dueDate = data.dueDate;
  }

  // Handle Status and Progress combined rules
  const nextStatus = data.status || task.status;
  let nextProgress = data.progress !== undefined ? data.progress : task.progress;

  if (data.status && data.status !== task.status) {
    // Rule 8: Changing status to Completed automatically sets progress to 100%
    if (data.status === 'Completed') {
      nextProgress = 100;
    }
    // Rule 9: Changing status to To Do sets progress to 0%
    else if (data.status === 'To Do') {
      nextProgress = 0;
    }
    // Rule 10: In Progress tasks must have progress between 1% and 99%
    else if (data.status === 'In Progress') {
      if (nextProgress <= 0) nextProgress = 10;
      if (nextProgress >= 100) nextProgress = 99;
    }
    // Rule 11: Under Review tasks retain their current progress

    await recordActivity(task._id, currentUser._id, 'Status Changed', task.status, data.status);
    task.status = data.status;
  }

  if (data.progress !== undefined && data.progress !== task.progress) {
    // Validate status and progress combination (Rule 14)
    if (task.status === 'Completed' && nextProgress !== 100) {
      const error = new Error('Rule Violation: Completed tasks must have 100% progress.');
      error.statusCode = 400;
      throw error;
    }
    if (task.status === 'To Do' && nextProgress !== 0) {
      const error = new Error('Rule Violation: To Do tasks must have 0% progress.');
      error.statusCode = 400;
      throw error;
    }
    if (task.status === 'In Progress' && (nextProgress <= 0 || nextProgress >= 100)) {
      const error = new Error('Rule Violation: In Progress tasks must have progress between 1% and 99%.');
      error.statusCode = 400;
      throw error;
    }

    await recordActivity(task._id, currentUser._id, 'Progress Updated', `${task.progress}%`, `${nextProgress}%`);
    task.progress = nextProgress;
  } else {
    task.progress = nextProgress;
  }

  await task.save();
  return getTaskById(task._id);
};

export const updateTaskStatus = async (id, status, currentUser) => {
  const task = await Task.findById(id);
  if (!task) {
    const error = new Error(`Task with ID ${id} not found`);
    error.statusCode = 404;
    throw error;
  }

  const oldStatus = task.status;
  task.status = status;

  // Rule 8: Changing status to Completed automatically sets progress to 100%
  if (status === 'Completed') {
    task.progress = 100;
  }
  // Rule 9: Changing status to To Do sets progress to 0%
  else if (status === 'To Do') {
    task.progress = 0;
  }
  // Rule 10: In Progress tasks must have progress between 1% and 99%
  else if (status === 'In Progress') {
    if (task.progress <= 0) task.progress = 10;
    if (task.progress >= 100) task.progress = 90;
  }
  // Rule 11: Under Review tasks retain their current progress

  await task.save();
  await recordActivity(task._id, currentUser._id, 'Status Changed', oldStatus, status);

  return getTaskById(task._id);
};

export const updateTaskProgress = async (id, progress, currentUser) => {
  const task = await Task.findById(id);
  if (!task) {
    const error = new Error(`Task with ID ${id} not found`);
    error.statusCode = 404;
    throw error;
  }

  const oldProgress = task.progress;

  // Rule 7 & 8: If progress set to 100%, status becomes Completed
  if (progress === 100) {
    task.status = 'Completed';
    task.progress = 100;
  }
  // Rule 9: If progress set to 0%, status becomes To Do
  else if (progress === 0) {
    task.status = 'To Do';
    task.progress = 0;
  }
  // Rule 10: In Progress tasks must have progress between 1% and 99%
  else {
    if (task.status === 'To Do' || task.status === 'Completed') {
      task.status = 'In Progress';
    }
    task.progress = progress;
  }

  await task.save();
  await recordActivity(task._id, currentUser._id, 'Progress Updated', `${oldProgress}%`, `${task.progress}%`);

  return getTaskById(task._id);
};

export const deleteTask = async (id, currentUser) => {
  if (currentUser.role !== 'Admin') {
    const error = new Error('Forbidden: Only Administrators can delete tasks.');
    error.statusCode = 403;
    throw error;
  }

  const task = await Task.findById(id);
  if (!task) {
    const error = new Error(`Task with ID ${id} not found`);
    error.statusCode = 404;
    throw error;
  }

  await TaskComment.deleteMany({ task: id });
  await TaskActivity.deleteMany({ task: id });
  await Task.findByIdAndDelete(id);

  return { message: 'Task deleted successfully' };
};

export const getTaskComments = async (taskId) => {
  const comments = await TaskComment.find({ task: taskId })
    .populate('user', 'name email role')
    .sort({ createdAt: -1 });

  return comments;
};

export const addTaskComment = async (taskId, userId, commentText) => {
  const task = await Task.findById(taskId);
  if (!task) {
    const error = new Error(`Task with ID ${taskId} not found`);
    error.statusCode = 404;
    throw error;
  }

  const comment = await TaskComment.create({
    task: taskId,
    user: userId,
    comment: commentText,
  });

  await recordActivity(taskId, userId, 'Comment Added', null, commentText.slice(0, 80));

  return comment.populate('user', 'name email role');
};

export const getTaskActivity = async (taskId) => {
  const activities = await TaskActivity.find({ task: taskId })
    .populate('actor', 'name email role')
    .sort({ createdAt: -1 });

  return activities;
};
