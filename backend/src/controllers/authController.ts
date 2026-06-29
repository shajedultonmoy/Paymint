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

import crypto from 'crypto';
import sendEmail from '../utils/sendEmail';

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400);
    throw new Error('Email is required');
  }

  const user = await UserModel.findByEmail(email);
  if (!user) {
    res.status(404);
    throw new Error('There is no user with that email');
  }

  const resetToken = crypto.randomBytes(20).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  const expireDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await UserModel.updateResetToken(user.id, hashedToken, expireDate);

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password/${resetToken}`;
  const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please use the following link to reset your password:\n\n${resetUrl}\n\nThis link will expire in 10 minutes.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Paymint Password Reset Request',
      message,
    });

    res.json({ message: 'Reset link sent to your email' });
  } catch (err: any) {
    await UserModel.updateResetToken(user.id, null, null);
    res.status(500);
    throw new Error(`Email could not be sent: ${err.message}`);
  }
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const resettoken = String(req.params.resettoken);
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  const hashedToken = crypto.createHash('sha256').update(resettoken).digest('hex');
  const user = await UserModel.findByResetToken(hashedToken);

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await UserModel.updatePassword(user.id, hashedPassword);
  await UserModel.updateResetToken(user.id, null, null);

  res.json({ message: 'Password updated successfully' });
});

export const updateUserProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await UserModel.findById(req.user!.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, businessName, phone, avatar, password } = req.body;

  const updatedUser = await UserModel.updateProfile(user.id, {
    name: name || user.name,
    businessName: businessName !== undefined ? businessName : user.businessName,
    phone: phone !== undefined ? phone : user.phone,
    avatar: avatar !== undefined ? avatar : user.avatar,
  });

  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    await UserModel.updatePassword(user.id, hashedPassword);
  }

  if (!updatedUser) {
    res.status(500);
    throw new Error('Failed to update profile');
  }

  res.json(userResponse(updatedUser));
});