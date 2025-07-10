import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  fetchNotifications,
  toggleReadStatus,
} from '../controllers/notification.controller';

const router = Router();

router.get('/', authenticate, fetchNotifications);
router.patch('/:id', authenticate, toggleReadStatus);

export default router;
