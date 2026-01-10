import Product from '../models/Product.js';
import ScanLog from '../models/ScanLog.js';

const PRODUCT_ID_REGEX = /^[0-9]{16}$/;

export const verifyProductScan = async (req, res, next) => {
  try {
    const { pid } = req.query;

    if (!pid || !PRODUCT_ID_REGEX.test(pid)) {
      return res
        .status(400)
        .json({ status: 'invalid', message: 'Invalid product ID' });
    }

    const product = await Product.findOne({ productId: pid });

    if (!product) {
      return res
        .status(404)
        .json({ status: 'invalid', message: '❌ Invalid QR / Scan limit exceeded' });
    }

    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    // Log scan attempt
    await ScanLog.create({
      productId: pid,
      ipAddress,
    });

    // If already invalid or scans exceeded
    if (product.status === 'invalid' || product.scanCount >= product.maxScan) {
      if (product.status !== 'invalid') {
        product.status = 'invalid';
        await product.save();
      }
      return res.json({
        status: 'invalid',
        message: '❌ Invalid QR / Scan limit exceeded',
        productId: product.productId,
        scanCount: product.scanCount,
        maxScan: product.maxScan,
      });
    }

    product.scanCount += 1;

    let message;
    let responseStatus;

    if (product.scanCount < product.maxScan) {
      message = '✅ Product Verified Successfully';
      responseStatus = 'verified';
    } else if (product.scanCount === product.maxScan) {
      message = '⚠️ Last Valid Scan';
      responseStatus = 'last_valid';
      product.status = 'invalid'; // mark invalid after last valid scan
    }

    await product.save();

    res.json({
      status: responseStatus,
      message,
      productId: product.productId,
      scanCount: product.scanCount,
      maxScan: product.maxScan,
    });
  } catch (err) {
    next(err);
  }
};
