import express from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { createDashboardSchema, updateDashboardSchema } from '../utils/validationSchemas';
import { createDashboard, getDashboard, updateDashboard, deleteDashboard, getDashboards } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', authMiddleware, getDashboards);
router.get('/:id', authMiddleware, getDashboard);

// Authenticated routes
router.post('/',
  authMiddleware,
  validateRequest(createDashboardSchema),
  createDashboard
);

router.put('/:id',
  authMiddleware,
  validateRequest(updateDashboardSchema),
  updateDashboard
);

router.delete('/:id',
  authMiddleware,
  deleteDashboard
);

export { router as dashboardRoutes };
