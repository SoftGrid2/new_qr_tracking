import multer from 'multer';
import Product from '../models/Product.js';
import { parseProductExcel } from '../utils/excelReader.js';

const upload = multer({ storage: multer.memoryStorage() });
const PRODUCT_ID_REGEX = /^[0-9]{16}$/;

export const excelUploadMiddleware = upload.single('file');

export const bulkUploadProducts = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Validate file type
    const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      return res.status(400).json({ 
        message: 'Invalid file type. Please upload an Excel file (.xlsx or .xls)' 
      });
    }

    let rows;
    try {
      rows = parseProductExcel(req.file.buffer);
    } catch (parseError) {
      return res.status(400).json({ 
        message: parseError.message || 'Failed to parse Excel file. Please check the file format.' 
      });
    }

    if (!rows || rows.length === 0) {
      return res.status(400).json({ 
        message: 'Excel file is empty or has no valid data rows' 
      });
    }

    let total = rows.length;
    let inserted = 0;
    let skippedInvalid = 0;
    let skippedDuplicate = 0;
    const errors = []; // Track specific errors for debugging

    for (const row of rows) {
      const { productId, productName, rowNumber } = row;

      // Validate productId
      if (!productId || productId.length === 0) {
        skippedInvalid += 1;
        errors.push(`Row ${rowNumber}: Missing product_id`);
        continue;
      }

      // Validate productName
      if (!productName || productName.trim().length === 0) {
        skippedInvalid += 1;
        errors.push(`Row ${rowNumber}: Missing product_name`);
        continue;
      }

      // Validate productId format (must be exactly 16 digits)
      if (!PRODUCT_ID_REGEX.test(productId)) {
        skippedInvalid += 1;
        errors.push(`Row ${rowNumber}: Invalid product_id format (must be exactly 16 digits, got: ${productId.length} digits)`);
        continue;
      }

      // Check for duplicates
      const existing = await Product.findOne({ productId });
      if (existing) {
        skippedDuplicate += 1;
        continue;
      }

      // Create product
      try {
        await Product.create({
          productId,
          productName: productName.trim(),
          scanCount: 0,
          maxScan: 2,
          status: 'active',
        });
        inserted += 1;
      } catch (createError) {
        // Handle duplicate key error (race condition)
        if (createError.code === 11000) {
          skippedDuplicate += 1;
        } else {
          skippedInvalid += 1;
          errors.push(`Row ${rowNumber}: ${createError.message}`);
        }
      }
    }

    res.json({
      totalRows: total,
      inserted,
      skippedInvalid,
      skippedDuplicate,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined, // Return first 10 errors
    });
  } catch (err) {
    console.error('Bulk upload error:', err);
    next(err);
  }
};
