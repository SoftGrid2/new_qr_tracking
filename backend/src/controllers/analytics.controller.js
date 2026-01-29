import Product from '../models/Product.js';
import ScanLog from '../models/ScanLog.js';
import xlsx from 'xlsx';

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

export const exportProductData = async (req, res, next) => {
  try {
    const dataForExcel = await Product.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'scanlogs',
          let: { pid: '$productId' },
          pipeline: [
            { $match: { $expr: { $eq: ['$productId', '$$pid'] } } },
            { $sort: { scannedAt: 1 } },
          ],
          as: 'scans',
        },
      },
      {
        $project: {
          _id: 0,
          productId: '$productId',
          productName: '$productName',
          scanCount: '$scanCount',
          maxScan: '$maxScan',
          status: '$status',
          createdAt: '$createdAt',
          scan1: { $ifNull: [{ $arrayElemAt: ['$scans.scannedAt', 0] }, ''] },
          scan2: { $ifNull: [{ $arrayElemAt: ['$scans.scannedAt', 1] }, ''] },
        },
      },
    ]);

    if (dataForExcel.length === 0) {
      return res.status(404).json({ message: 'No products to export.' });
    }

    const worksheet = xlsx.utils.json_to_sheet(dataForExcel);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');

    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=product_scan_data_${Date.now()}.xlsx`
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.send(buffer);
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
