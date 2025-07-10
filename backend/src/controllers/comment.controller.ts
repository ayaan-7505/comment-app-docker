import { Request, Response } from 'express';
import {
  createComment,
  getAllComments,
} from '../models/comment.model';
import { db } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';
import { createNotification } from '../models/notification.model';
import { getCommentById } from '../models/comment.model';


export const postComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { content, parentId } = req.body;
  const userId = req.userId;

  if (!content) {
    res.status(400).json({ error: 'Content is required' });
    return;
  }

  try {
    const comment = await createComment(userId!, content, parentId);

    // ✅ Only after saving comment, check for parent comment to notify
    if (parentId) {
      const parentComment = await getCommentById(parentId);
      if (parentComment && parentComment.userId !== userId) {
        const message = `Someone replied to your comment: "${content.slice(0, 50)}..."`;
        await createNotification(parentComment.userId, comment.id, message);
      }
    }

    res.status(201).json(comment); // ✅ send after notification creation
    return;
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: 'Server error' });
    return;
  }
};


export const fetchComments = async (_req: Request, res: Response): Promise<void> => {
  try {
    const comments = await getAllComments();
    res.status(200).json(comments);
    return;
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Server error' });
    return;
  }
};

export const updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const commentId = parseInt(req.params.id);
  const { content } = req.body;
  const userId = req.userId;

  try {
    const result = await db.query('SELECT * FROM comments WHERE id = $1', [commentId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    const comment = result.rows[0];

    // Only author can edit
    if (comment.user_id !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Check time difference
    const createdAt = new Date(comment.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (diffMinutes > 15) {
      res.status(403).json({ error: 'Edit window expired (15 minutes)' });
      return;
    }

    const updated = await db.query(
      'UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [content, commentId]
    );

    res.status(200).json(updated.rows[0]);
    return;
  } catch (err) {
    console.error('Error updating comment:', err);
    res.status(500).json({ error: 'Server error' });
    return;
  }
};



export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const commentId = parseInt(req.params.id);
  const userId = req.userId;

  

  try {
    const result = await db.query('SELECT * FROM comments WHERE id = $1', [commentId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    const comment = result.rows[0];

    if (comment.user_id !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    if (comment.is_deleted) {
      res.status(400).json({ error: 'Comment already deleted' });
      return;
    }
    console.log("DELETE request for comment ID:", commentId);
    console.log("Comment status:", comment.is_deleted);
    // Check time difference
    const createdAt = new Date(comment.created_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

    if (diffMinutes > 15) {
      res.status(403).json({ error: 'Delete window expired (15 minutes)' });
      return;
    }
    
    await db.query(
      'UPDATE comments SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [commentId]
    );

    res.status(200).json({ message: 'Comment deleted. You can undo within 15 minutes.' });
    return;
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Server error' });
    return;
  }
};




export const restoreComment = async (req: AuthRequest, res: Response): Promise<void> => {
  const commentId = parseInt(req.params.id);
  const userId = req.userId;

  try {
    const result = await db.query('SELECT * FROM comments WHERE id = $1', [commentId]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }

    const comment = result.rows[0];

    if (comment.user_id !== userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    if (!comment.is_deleted) {
      res.status(400).json({ error: 'Comment is not deleted' });
      return;
    }

    const deletedAt = new Date(comment.updated_at);
    const now = new Date();
    const diffMinutes = (now.getTime() - deletedAt.getTime()) / (1000 * 60);

    if (diffMinutes > 15) {
      res.status(403).json({ error: 'Restore window expired (15 minutes)' });
      return;
    }

    await db.query(
      'UPDATE comments SET is_deleted = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [commentId]
    );

    res.status(200).json({ message: 'Comment restored successfully' });
    return;
  } catch (err) {
    console.error('Error restoring comment:', err);
    res.status(500).json({ error: 'Server error' });
    return;
  }
};
