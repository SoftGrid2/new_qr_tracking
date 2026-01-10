import mongoose from 'mongoose';

const scanLogSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: false }
);

const ScanLog = mongoose.model('ScanLog', scanLogSchema);

export default ScanLog;
