import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

router.get('/profile', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ message: `Welcome, user #${req.userId}` });
});

export default router;
