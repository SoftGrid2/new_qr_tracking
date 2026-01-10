import { Router } from 'express';
import {
  createProduct,
  listProducts,
  getProductById,
  downloadQr,
} from '../controllers/product.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Protected routes - require authentication
router.post('/', authenticateToken, createProduct);
router.get('/', authenticateToken, listProducts);
router.get('/:productId', authenticateToken, getProductById);
router.get('/:productId/qr', downloadQr); // Public route for QR download

export default router;
