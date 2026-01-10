import Product from '../models/Product.js';
import { generateQrPngWithProductId } from '../utils/generateQrWithProductId.js';

const PRODUCT_ID_REGEX = /^[0-9]{16}$/;

export const createProduct = async (req, res, next) => {
  try {
    const { productId, productName } = req.body;

    if (!productId || !productName) {
      return res.status(400).json({ message: 'productId and productName are required' });
    }

    if (!PRODUCT_ID_REGEX.test(productId)) {
      return res.status(400).json({ message: 'productId must be exactly 16 digits' });
    }

    const existing = await Product.findOne({ productId });
    if (existing) {
      return res.status(409).json({ message: 'Product with this ID already exists' });
    }

    const product = await Product.create({
      productId,
      productName,
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const listProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const query = {};
    
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!PRODUCT_ID_REGEX.test(productId)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const downloadQr = async (req, res, next) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const pngBuffer = await generateQrPngWithProductId(product.productId);

    res.setHeader('Content-Type', 'image/png');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=qr_${product.productId}.png`
    );
    res.send(pngBuffer);
  } catch (err) {
    next(err);
  }
};
