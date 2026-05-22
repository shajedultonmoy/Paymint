import express from 'express';
import { getDashboardSummary } from '../controllers/dashboardController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/summary', protect, getDashboardSummary);

export default router;
