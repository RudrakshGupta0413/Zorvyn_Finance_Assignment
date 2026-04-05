import express from 'express';
import cors from 'cors';
import 'express-async-errors';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import recordRoutes from './routes/records.js';
import dashboardRoutes from './routes/dashboard.js';
import userRoutes from './routes/users.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Finance Backend API' });
});

// Error handling
app.use(errorHandler);

export default app;
