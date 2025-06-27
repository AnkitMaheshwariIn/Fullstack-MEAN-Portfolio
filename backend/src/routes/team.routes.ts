import express from 'express';
import { validateRequest } from '../middlewares/validateRequest';
import { createTeamSchema, updateTeamSchema } from '../utils/validationSchemas';
import { createTeam, getTeam, updateTeam, deleteTeam, getTeams, getTeamMembers } from '../controllers/team.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

// Public routes
router.get('/', authMiddleware, getTeams);
router.get('/:id', authMiddleware, getTeam);
router.get('/:id/members', authMiddleware, getTeamMembers);

// Admin routes
router.post('/',
  authMiddleware,
  adminMiddleware,
  validateRequest(createTeamSchema),
  createTeam
);

router.put('/:id',
  authMiddleware,
  adminMiddleware,
  validateRequest(updateTeamSchema),
  updateTeam
);

router.delete('/:id',
  authMiddleware,
  adminMiddleware,
  deleteTeam
);

export { router as teamRoutes };
