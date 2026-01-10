import { Router } from 'express';
import { bulkDownloadQr, bulkImportQr } from '../controllers/qr.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/bulk-download', authenticateToken, bulkDownloadQr);
router.post('/bulk-import', authenticateToken, bulkImportQr);

export default router;
