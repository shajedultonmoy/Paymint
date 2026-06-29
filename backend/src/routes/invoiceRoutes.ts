import express from 'express';
import {
  getInvoices,
  createInvoice,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  downloadInvoicePdf,
  sendInvoiceEmail,
} from '../controllers/invoiceController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getInvoices).post(protect, createInvoice);
router.route('/:id/pdf').get(protect, downloadInvoicePdf);
router.route('/:id/send').post(protect, sendInvoiceEmail);
router
  .route('/:id')
  .get(protect, getInvoiceById)
  .put(protect, updateInvoice)
  .delete(protect, deleteInvoice);

export default router;
