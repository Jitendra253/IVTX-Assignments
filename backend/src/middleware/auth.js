import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      // Or check secure cookie
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.',
      });
    }

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_ivtex_taskflow_2026_dev_prod';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please log in again.',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact an administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access requires one of the following roles: [${roles.join(', ')}]. Your role is '${req.user.role}'.`,
      });
    }

    next();
  };
};

// Resource-level authorization for tasks
export const canModifyTask = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: `Task with ID ${taskId} not found.`,
      });
    }

    // Admins can modify any task
    if (req.user.role === 'Admin') {
      req.targetTask = task;
      return next();
    }

    // Developers can only modify tasks assigned to them
    if (task.assignee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Developers may only modify tasks assigned directly to them.',
      });
    }

    req.targetTask = task;
    next();
  } catch (error) {
    next(error);
  }
};
