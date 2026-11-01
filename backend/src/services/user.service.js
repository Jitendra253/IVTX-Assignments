import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export const listUsers = async (query = {}) => {
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.isActive !== undefined) filter.isActive = query.isActive === 'true';
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).sort({ name: 1 });
  return users;
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error(`User with ID ${id} not found`);
    error.statusCode = 404;
    throw error;
  }
  return user;
};

export const createUser = async (data) => {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    const error = new Error(`User with email '${data.email}' already exists`);
    error.statusCode = 409;
    throw error;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(data.password, salt);

  const newUser = await User.create({
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash,
    role: data.role || 'Developer',
    isActive: data.isActive !== undefined ? data.isActive : true,
  });

  return newUser.toJSON();
};

export const updateUser = async (id, data) => {
  const user = await User.findById(id);
  if (!user) {
    const error = new Error(`User with ID ${id} not found`);
    error.statusCode = 404;
    throw error;
  }

  if (data.name) user.name = data.name;
  if (data.email) user.email = data.email.toLowerCase();
  if (data.role) user.role = data.role;
  if (data.isActive !== undefined) user.isActive = data.isActive;

  if (data.password) {
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(data.password, salt);
  }

  await user.save();
  return user.toJSON();
};
