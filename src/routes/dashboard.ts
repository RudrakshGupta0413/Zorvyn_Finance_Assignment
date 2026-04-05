import { Router } from 'express';
import { DashboardService } from '../services/DashboardService.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/summary', async (req, res) => {
  const summary = await DashboardService.getSummary(req.user!.id);
  res.json({ data: summary });
});

router.get('/by-category', async (req, res) => {
  const breakdown = await DashboardService.getCategoryBreakdown(req.user!.id);
  res.json({ data: breakdown });
});

router.get('/monthly-trend', async (req, res) => {
  const months = req.query.months ? parseInt(req.query.months as string) : 12;
  const trend = await DashboardService.getMonthlyTrend(req.user!.id, months);
  res.json({ data: trend });
});

router.get('/weekly-trend', async (req, res) => {
  const weeks = req.query.weeks ? parseInt(req.query.weeks as string) : 12;
  const trend = await DashboardService.getWeeklyTrend(req.user!.id, weeks);
  res.json({ data: trend });
});

router.get('/recent-activity', async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
  const activity = await DashboardService.getRecentActivity(req.user!.id, limit);
  res.json({ data: activity });
});

export default router;
