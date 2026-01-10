import Product from '../models/Product.js';
import ScanLog from '../models/ScanLog.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ status: 'active' });
    const invalidProducts = await Product.countDocuments({ status: 'invalid' });
    const totalScans = await ScanLog.countDocuments();

    res.json({
      totalProducts,
      activeProducts,
      invalidProducts,
      totalScans,
    });
  } catch (err) {
    next(err);
  }
};

export const getDailyScans = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const scans = await ScanLog.aggregate([
      {
        $match: {
          scannedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$scannedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json(scans);
  } catch (err) {
    next(err);
  }
};

export const getMonthlyScans = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const scans = await ScanLog.aggregate([
      {
        $match: {
          scannedAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$scannedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json(scans);
  } catch (err) {
    next(err);
  }
};

export const getProductWiseScans = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const scans = await ScanLog.aggregate([
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'productId',
          as: 'product',
        },
      },
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          productId: '$_id',
          productName: '$product.productName',
          scanCount: '$count',
        },
      },
    ]);

    res.json(scans);
  } catch (err) {
    next(err);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let matchQuery = {};
    if (startDate || endDate) {
      matchQuery.scannedAt = {};
      if (startDate) {
        matchQuery.scannedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        matchQuery.scannedAt.$lte = new Date(endDate);
      }
    }

    const dailyScans = await ScanLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$scannedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const weeklyScans = await ScanLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-W%V', date: '$scannedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyScans = await ScanLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$scannedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const productWiseScans = await ScanLog.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$productId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'productId',
          as: 'product',
        },
      },
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          productId: '$_id',
          productName: '$product.productName',
          scanCount: '$count',
        },
      },
    ]);

    res.json({
      dailyScans,
      weeklyScans,
      monthlyScans,
      productWiseScans,
    });
  } catch (err) {
    next(err);
  }
};
