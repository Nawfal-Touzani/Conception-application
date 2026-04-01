import { List } from '@mui/material';
import { Notification } from '../../../types/notifications.types';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: number) => void;
  onApprove?: (membershipRequestId: number) => void;
  onRefuse?: (membershipRequestId: number, reason: string) => void;
}

const NotificationList = ({
  notifications,
  onMarkAsRead,
  onApprove,
  onRefuse,
}: NotificationListProps) => {
  return (
    <List>
      {notifications.map((notif) => (
        <NotificationItem
          key={notif.id}
          notification={notif}
          onMarkAsRead={onMarkAsRead}
          onApprove={onApprove}
          onRefuse={onRefuse}
        />
      ))}
    </List>
  );
};

export default NotificationList;
