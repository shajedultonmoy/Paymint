import asyncHandler from 'express-async-handler';
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { DashboardModel } from '../models/dashboardModel';

export const getDashboardSummary = asyncHandler(async (req: AuthRequest, res: Response) => {
  const summary = await DashboardModel.getSummary(req.user!.id);
  res.json(summary);
});
