import express from 'express';
import {
  getProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getProducts).post(protect, createProduct);
router
  .route('/:id')
  .get(protect, getProductById)
  .put(protect, updateProduct)
  .delete(protect, deleteProduct);

export default router;
