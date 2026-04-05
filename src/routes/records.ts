import { Router } from 'express';
import { RecordService } from '../services/RecordService.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody, validateQuery } from '../middleware/validation.js';
import { 
  createRecordSchema, 
  updateRecordSchema, 
  getRecordsQuerySchema 
} from '../types/validation.js';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post(
  '/', 
  requireRole(['ANALYST', 'ADMIN']), 
  validateBody(createRecordSchema), 
  async (req, res) => {
    const record = await RecordService.create(req.user!.id, req.body);
    res.status(201).json({
      data: record,
      message: 'Record created successfully',
    });
  }
);

router.get(
  '/', 
  validateQuery(getRecordsQuerySchema), 
  async (req, res) => {
    const { page, limit, ...filters } = req.query as any;
    const result = await RecordService.list(
      req.user!.id, 
      filters, 
      { page, limit }
    );
    res.json(result);
  }
);

router.get('/:id', async (req, res) => {
  const record = await RecordService.getById(
    req.user!.id, 
    req.params.id, 
    req.user!.role
  );
  res.json({ data: record });
});

router.patch(
  '/:id', 
  requireRole(['ANALYST', 'ADMIN']), 
  validateBody(updateRecordSchema), 
  async (req, res) => {
    const record = await RecordService.update(
      req.user!.id, 
      req.params.id, 
      req.user!.role, 
      req.body
    );
    res.json({
      data: record,
      message: 'Record updated successfully',
    });
  }
);

router.delete(
  '/:id', 
  requireRole(['ANALYST', 'ADMIN']), 
  async (req, res) => {
    const result = await RecordService.delete(
      req.user!.id, 
      req.params.id, 
      req.user!.role
    );
    res.json({
      data: result,
      message: 'Record deleted successfully (soft delete)',
    });
  }
);

export default router;
