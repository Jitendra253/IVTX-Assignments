import * as taskService from '../services/task.service.js';

export const getTasks = async (req, res, next) => {
  try {
    const result = await taskService.listTasks(req.query, req.user);
    res.status(200).json({
      success: true,
      data: result.tasks,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.body, req.user._id);
    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body, req.user);
    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await taskService.updateTaskStatus(req.params.id, req.body.status, req.user);
    res.status(200).json({
      success: true,
      message: `Task status updated to ${req.body.status}`,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTaskProgress = async (req, res, next) => {
  try {
    const task = await taskService.updateTaskProgress(req.params.id, req.body.progress, req.user);
    res.status(200).json({
      success: true,
      message: `Task progress updated to ${req.body.progress}%`,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.id, req.user);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskComments = async (req, res, next) => {
  try {
    const comments = await taskService.getTaskComments(req.params.id);
    res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    next(error);
  }
};

export const addTaskComment = async (req, res, next) => {
  try {
    const comment = await taskService.addTaskComment(req.params.id, req.user._id, req.body.comment);
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskActivity = async (req, res, next) => {
  try {
    const activity = await taskService.getTaskActivity(req.params.id);
    res.status(200).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};
