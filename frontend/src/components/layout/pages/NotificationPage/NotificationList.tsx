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
  onCorrectResult?: (matchId: number, scoreA: number, scoreB: number) => void;
}

const NotificationList = ({
  notifications,
  onMarkAsRead,
  onApprove,
  onRefuse,
  onValidateResult,
  onContestResult,
  onCorrectResult,
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
          onCorrectResult={onCorrectResult}
        />
      ))}
    </List>
  );
};

export default NotificationList;
