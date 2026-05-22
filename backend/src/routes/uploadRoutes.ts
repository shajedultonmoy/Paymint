import express from 'express';
import upload from '../middleware/uploadMiddleware';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/', protect, upload.single('image'), (req, res) => {
  if (req.file) {
    res.send(`/${req.file.path.replace(/\\/g, '/')}`);
  } else {
    res.status(400).send('No file uploaded');
  }
});

export default router;
