import express from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { createReportSchema, updateReportSchema } from '../utils/validationSchemas';
import { createReport, getReport, updateReport, deleteReport, getReports, exportReport } from '../controllers/report.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', authMiddleware, getReports);
router.get('/:id', authMiddleware, getReport);

// Authenticated routes
router.post('/',
  authMiddleware,
  validateRequest(createReportSchema),
  createReport
);

router.put('/:id',
  authMiddleware,
  validateRequest(updateReportSchema),
  updateReport
);

router.delete('/:id',
  authMiddleware,
  deleteReport
);

// Export routes
router.get('/:id/export', authMiddleware, exportReport);

export { router as reportRoutes };
