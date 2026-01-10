import Product from '../models/Product.js';
import { generateQrPngWithProductId } from '../utils/generateQrWithProductId.js';
import archiver from 'archiver';

export const bulkDownloadQr = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    let products;
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      products = await Product.find({ productId: { $in: productIds } });
    } else {
      products = await Product.find();
    }

    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=qr_codes_${Date.now()}.zip`
    );

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    for (const product of products) {
      const qrBuffer = await generateQrPngWithProductId(product.productId);
      archive.append(qrBuffer, { name: `QR_${product.productId}.png` });
    }

    await archive.finalize();
  } catch (err) {
    next(err);
  }
};

export const bulkImportQr = async (req, res, next) => {
  try {
    // This is a placeholder for bulk QR import
    // Implementation would require:
    // 1. Extract ZIP file
    // 2. Parse filenames to extract productIds
    // 3. Validate productIds exist
    // 4. Store/update QR images if needed
    
    res.json({ message: 'Bulk QR import feature - to be implemented' });
  } catch (err) {
    next(err);
  }
};
