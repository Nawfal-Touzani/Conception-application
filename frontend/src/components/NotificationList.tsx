import { List } from '@mui/material';
import { Notification } from '../types/notifications.types';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: number) => void;
}

const NotificationList = ({
  notifications,
  onMarkAsRead,
}: NotificationListProps) => {
  return (
    <List>
      {notifications.map((notif) => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </List>
  );
};

export default NotificationList;
