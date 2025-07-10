import type { NotificationType } from '../types';

interface Props {
  notification: NotificationType;
  onToggleRead: () => void;
}

export default function NotificationItem({ notification, onToggleRead }: Props) {
  return (
    <div
      className={`p-3 mb-2 border rounded ${
        notification.is_read ? 'bg-gray-100' : 'bg-blue-100'
      }`}
    >
      <div className="flex justify-between items-center">
        <div className="text-sm">{notification.message}</div>
        <button
          onClick={onToggleRead}
          className="text-blue-600 text-xs hover:underline"
        >
          Mark as {notification.is_read ? 'Unread' : 'Read'}
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {new Date(notification.created_at).toLocaleString()}
      </div>
    </div>
  );
}
