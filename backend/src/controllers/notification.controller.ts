import { Request, Response } from 'express';
import {
  getNotifications,
  markNotificationAsRead,
  markNotificationAsUnread,
} from '../models/notification.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const fetchNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const notifications = await getNotifications(userId);
    res.status(200).json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

export const toggleReadStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { read } = req.query; // read=true or false

    if (read === 'true') {
      await markNotificationAsRead(Number(id));
    } else {
      await markNotificationAsUnread(Number(id));
    }

    res.status(200).json({ message: 'Notification updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
};
