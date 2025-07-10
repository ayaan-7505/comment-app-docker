import { Router } from 'express';
import { postComment, fetchComments, updateComment, deleteComment, restoreComment } from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, postComment);
router.get('/', fetchComments);
router.patch('/:id', authenticate, updateComment);
router.delete('/:id', authenticate, deleteComment);
router.post('/:id/restore', authenticate, restoreComment);



export default router;
