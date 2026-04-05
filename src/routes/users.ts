import { Router } from 'express';
import { UserService } from '../services/UserService.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validation.js';
import { updateUserSchema } from '../types/validation.js';

const router = Router();

// Apply protection to all routes
router.use(authMiddleware);
router.use(requireRole(['ADMIN']));

// List all users
router.get('/', async (req, res) => {
  const users = await UserService.listUsers();
  res.json({ data: users });
});

// Update user (promote/demote/activate/deactivate)
router.patch('/:id', validateBody(updateUserSchema), async (req, res) => {
  const user = await UserService.updateUser(req.user!.id, req.params.id, req.body);
  res.json({
    data: user,
    message: 'User updated successfully',
  });
});

export default router;
