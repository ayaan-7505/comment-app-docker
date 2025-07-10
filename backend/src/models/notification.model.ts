import { db } from '../config/db';

interface Notification {
  id: number;
  recipient_id: number;
  comment_id: number;
  message: string;
  is_read: boolean;
  created_at: string; // or `Date` if you're parsing it
}


export const getNotifications = async (userId: number) => {
  const result = await db.query(
    `SELECT * FROM notifications WHERE recipient_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

export const markNotificationAsRead = async (notificationId: number) => {
  await db.query(
    `UPDATE notifications SET is_read = true WHERE id = $1`,
    [notificationId]
  );
};

export const markNotificationAsUnread = async (notificationId: number) => {
  await db.query(
    `UPDATE notifications SET is_read = false WHERE id = $1`,
    [notificationId]
  );
};

export const createNotification = async (
  recipientId: number,
  commentId: number,
  message: string
): Promise<Notification> => {
  const result = await db.query(
    `INSERT INTO notifications (recipient_id, comment_id, message)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [recipientId, commentId, message]
  );
  return result.rows[0];
};



