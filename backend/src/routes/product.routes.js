import { Router } from 'express';
import {
  createProduct,
  listProducts,
  getProductById,
  downloadQr,
  updateProductStatus,
  deleteProduct,
} from '../controllers/product.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// Protected routes - require authentication
router.post('/', authenticateToken, createProduct);
router.get('/', authenticateToken, listProducts);
// More specific routes first to avoid matching conflicts
router.get('/:productId/qr', downloadQr); // Public route for QR download
router.patch('/:productId/status', authenticateToken, updateProductStatus);
router.delete('/:productId', authenticateToken, deleteProduct);
router.get('/:productId', authenticateToken, getProductById);

export default router;
