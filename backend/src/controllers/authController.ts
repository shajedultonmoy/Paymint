import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import { UserModel } from '../models/userModel';
import generateToken from '../utils/generateToken';
import { AuthRequest } from '../middleware/authMiddleware';
import { DEMO_EMAIL, DEMO_PASSWORD } from '../config/demoUser';

const userResponse = (user: any) => ({
  _id: user.id,
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  businessName: user.businessName,
  phone: user.phone,
  avatar: user.avatar,
  token: generateToken(String(user.id)),
});

export const authUser = asyncHandler(async (req: Request, res: Response) => {
  const { password } = req.body;
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await UserModel.findByEmail(email);
  let passwordsMatch = user?.password ? await bcrypt.compare(password, user.password) : false;

  if (
    user &&
    !passwordsMatch &&
    process.env.NODE_ENV !== 'production' &&
    email === DEMO_EMAIL &&
    password === DEMO_PASSWORD
  ) {
    const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);
    await UserModel.updatePassword(user.id, hashedPassword);
    passwordsMatch = true;
  }

  if (!user || !passwordsMatch) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  res.json(userResponse(user));
});

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, password } = req.body;
  const email = String(req.body.email || '').trim().toLowerCase();

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  const userExists = await UserModel.findByEmail(email);
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email, password: hashedPassword });

  res.status(201).json(userResponse(user));
});

export const getUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user?.id) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const user = await UserModel.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    _id: user.id,
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    businessName: user.businessName,
    phone: user.phone,
    avatar: user.avatar,
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Forgot password feature is under development' });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Reset password feature is under development' });
});