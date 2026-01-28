import mongoose from 'mongoose';

const PRODUCT_ID_LENGTH = 16;

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (v) =>
          typeof v === 'string' &&
          v.length === PRODUCT_ID_LENGTH &&
          /^[0-9]+$/.test(v),
        message: `productId must be a ${PRODUCT_ID_LENGTH}-digit numeric string`,
      },
    },
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    scanCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxScan: {
      type: Number,
      default: 2,
      min: 1,
    },
    status: {
      type: String,
      enum: ['active', 'invalid'],
      default: 'active',
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
