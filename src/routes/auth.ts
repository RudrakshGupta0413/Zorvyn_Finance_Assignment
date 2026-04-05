import { Router } from 'express';
import { AuthService } from '../services/AuthService.js';
import { loginSchema, registerSchema } from '../types/validation.js';
import { validateBody } from '../middleware/validation.js';

const router = Router();

router.post('/register', validateBody(registerSchema), async (req, res) => {
  const user = await AuthService.register(req.body);
  res.status(201).json({
    data: user,
    message: 'User registered successfully',
  });
});

router.post('/login', validateBody(loginSchema), async (req, res) => {
  const result = await AuthService.login(req.body);
  res.json({
    data: result,
    message: 'Login successful',
  });
});

export default router;
