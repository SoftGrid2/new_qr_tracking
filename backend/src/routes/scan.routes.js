import { Router } from 'express';
import { verifyProductScan } from '../controllers/scan.controller.js';

const router = Router();

// GET /api/scan/verify?pid=1234567812345678
router.get('/verify', verifyProductScan);

export default router;
