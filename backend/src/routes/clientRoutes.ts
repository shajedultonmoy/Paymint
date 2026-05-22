import express from 'express';
import {
  getClients,
  createClient,
  getClientById,
  updateClient,
  deleteClient,
} from '../controllers/clientController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getClients).post(protect, createClient);
router
  .route('/:id')
  .get(protect, getClientById)
  .put(protect, updateClient)
  .delete(protect, deleteClient);

export default router;
