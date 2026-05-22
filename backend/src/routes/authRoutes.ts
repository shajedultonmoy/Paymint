import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.route('/me').get(protect, getUserProfile);
router.route('/profile').get(protect, getUserProfile);

export default router;
