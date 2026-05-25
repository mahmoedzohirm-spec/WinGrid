import express, { Request, Response } from 'express';
import { ReportingService, OrdersReportParams, PaymentsReportParams } from '../services/reporting';
import { authMiddleware } from '../middleware/auth';
import { adminOnlyMiddleware } from '../middleware/adminOnly';

const router = express.Router();

// تطبيق middleware المصادقة على جميع مسارات التقارير
router.use(authMiddleware);
router.use(adminOnlyMiddleware);

/**
 * GET /api/reports/orders
 * الحصول على تقرير الطلبات مع إحصائيات
 * Query params: fromDate, toDate, status
 */
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const params: OrdersReportParams = {
      fromDate: req.query.fromDate as string,
      toDate: req.query.toDate as string,
      status: req.query.status as any,
    };

    const report = await ReportingService.getOrdersReport(params);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate orders report',
      details: error.message,
    });
  }
});

/**
 * GET /api/reports/payments
 * الحصول على تقرير المدفوعات
 * Query params: fromDate, toDate, status, method
 */
router.get('/payments', async (req: Request, res: Response) => {
  try {
    const params: PaymentsReportParams = {
      fromDate: req.query.fromDate as string,
      toDate: req.query.toDate as string,
      status: req.query.status as any,
      method: req.query.method as string,
    };

    const report = await ReportingService.getPaymentsReport(params);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate payments report',
      details: error.message,
    });
  }
});

/**
 * GET /api/reports/winners
 * الحصول على تقرير الفائزين بالسحب
 */
router.get('/winners', async (req: Request, res: Response) => {
  try {
    const report = await ReportingService.getWinnersReport();
    res.json(report);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate winners report',
      details: error.message,
    });
  }
});

/**
 * GET /api/reports/users
 * الحصول على تقرير نشاط المستخدمين
 */
router.get('/users', async (req: Request, res: Response) => {
  try {
    const report = await ReportingService.getUsersActivityReport();
    res.json(report);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate users report',
      details: error.message,
    });
  }
});

/**
 * GET /api/reports/comprehensive
 * الحصول على تقرير شامل يجمع جميع البيانات
 */
router.get('/comprehensive', async (req: Request, res: Response) => {
  try {
    const report = await ReportingService.getComprehensiveReport();
    res.json(report);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to generate comprehensive report',
      details: error.message,
    });
  }
});

/**
 * GET /api/reports/orders/export/csv
 * تصدير تقرير الطلبات إلى CSV
 */
router.get('/orders/export/csv', async (req: Request, res: Response) => {
  try {
    const params: OrdersReportParams = {
      fromDate: req.query.fromDate as string,
      toDate: req.query.toDate as string,
      status: req.query.status as any,
    };

    const report = await ReportingService.getOrdersReport(params);

    if (!report.success) {
      return res.status(400).json(report);
    }

    const csv = ReportingService.generateCSVFromOrders(report.orders);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=orders-report.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to export orders report',
      details: error.message,
    });
  }
});

export default router;
