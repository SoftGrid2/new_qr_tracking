import { Router } from 'express';
import {
  getDashboardStats,
  getDailyScans,
  getMonthlyScans,
  getProductWiseScans,
  getAnalytics,
  exportProductData,
} from '../controllers/analytics.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/dashboard', authenticateToken, getDashboardStats);
router.get('/daily', authenticateToken, getDailyScans);
router.get('/monthly', authenticateToken, getMonthlyScans);
router.get('/product-wise', authenticateToken, getProductWiseScans);
router.get('/', authenticateToken, getAnalytics);
router.get('/export-in-excel', authenticateToken, exportProductData);

export default router;
