import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Task title must be at least 3 characters'],
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must belong to a project'],
      index: true,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must have an assigned developer'],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task creator is required'],
      index: true,
    },
    priority: {
      type: String,
      enum: {
        values: ['High', 'Medium', 'Low'],
        message: '{VALUE} is not a valid priority. Allowed: High, Medium, Low',
      },
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ['To Do', 'In Progress', 'Under Review', 'Completed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'To Do',
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, 'Progress cannot be less than 0'],
      max: [100, 'Progress cannot exceed 100'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      validate: {
        validator: function (val) {
          return !this.startDate || val >= this.startDate;
        },
        message: 'Due date cannot precede start date',
      },
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property to check if task is overdue
taskSchema.virtual('isOverdue').get(function () {
  if (this.status === 'Completed') return false;
  return Boolean(this.dueDate && new Date() > new Date(this.dueDate));
});

// Compound indexes for optimal dashboard and filter querying
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ status: 1, dueDate: 1 });
taskSchema.index({ priority: 1, dueDate: 1 });

export const Task = mongoose.model('Task', taskSchema);
