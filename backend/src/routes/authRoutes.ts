import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
  updateUserProfile,
} from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.route('/me').get(protect, getUserProfile).put(protect, updateUserProfile);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;
