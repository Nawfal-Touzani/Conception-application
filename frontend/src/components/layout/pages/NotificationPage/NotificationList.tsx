import { List } from '@mui/material';

import { Notification } from '../../../../types/notifications.types';
import NotificationItem from './NotificationItem';

interface NotificationListProps {
  notifications: Notification[];
  onMarkAsRead: (notificationId: number) => void;
  onApprove?: (membershipRequestId: number) => void;
  onRefuse?: (membershipRequestId: number, reason: string) => void;
  onValidateResult?: (matchId: number) => void;
  onContestResult?: (matchId: number) => void;
}

const NotificationList = ({
  notifications,
  onMarkAsRead,
  onApprove,
  onRefuse,
  onValidateResult,
  onContestResult,
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
          onValidateResult={onValidateResult}
          onContestResult={onContestResult}
        />
      ))}
    </List>
  );
};

export default NotificationList;
