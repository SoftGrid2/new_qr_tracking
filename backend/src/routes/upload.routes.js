import { Router } from 'express';
import {
  bulkUploadProducts,
  excelUploadMiddleware,
} from '../controllers/upload.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// POST /api/upload/excel
router.post('/excel', authenticateToken, excelUploadMiddleware, bulkUploadProducts);

export default router;
