import mongoose from 'mongoose';

const taskActivitySchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Activity must reference a task'],
      index: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Activity must have an actor'],
      index: true,
    },
    action: {
      type: String,
      required: [true, 'Activity action is required'],
      trim: true,
    },
    oldValue: {
      type: String,
      default: null,
    },
    newValue: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

taskActivitySchema.index({ task: 1, createdAt: -1 });

export const TaskActivity = mongoose.model('TaskActivity', taskActivitySchema);
