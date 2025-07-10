import { useEffect, useState } from 'react';
import axios from 'axios';
import NotificationItem from '../components/NotificationItem';
import type { NotificationType } from '../types';

export default function NotificationList() {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  const toggleReadStatus = async (id: number, isCurrentlyRead: boolean) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${id}?read=${!isCurrentlyRead}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchNotifications(); // Refresh after toggling
    } catch (err) {
      console.error('Error toggling read status:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Your Notifications</h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        notifications.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onToggleRead={() => toggleReadStatus(n.id, n.is_read)}
          />
        ))
      )}
    </div>
  );
}
