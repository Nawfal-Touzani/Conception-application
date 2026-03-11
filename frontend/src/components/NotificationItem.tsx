import { ListItem, ListItemText, Typography, Chip } from '@mui/material';
import { Notification } from '../types/notifications.types';
import markRead from '../assets/images/notifImage.p.jpg';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: number) => void;
}

const NotificationItem = ({
  notification,
  onMarkAsRead,
}: NotificationItemProps) => {
  return (
    <ListItem
      sx={{
        bgcolor: notification.read
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(255,255,255,0.12)',
        mb: 2,
        borderRadius: 2,
        py: 2,
        px: 3,
      }}
    >
      <ListItemText
        primary={
          <Typography sx={{ color: 'white', fontWeight: 'bold' }}>
            {notification.message}
          </Typography>
        }
        secondary={
          <Typography
            sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}
          >
            {`${notification.type} — ${new Date(notification.sendDate).toLocaleString()}`}
          </Typography>
        }
      />
      {notification.read && (
        <Chip
          label="Lu"
          sx={{ mr: 1, backgroundColor: 'white', color: '#1e2a44' }}
        />
      )}
      {!notification.read && (
        <img
          src={markRead}
          alt="Marquer comme lu"
          style={{ height: '24px', cursor: 'pointer' }}
          onClick={() => onMarkAsRead(notification.id)}
        />
      )}
    </ListItem>
  );
};

export default NotificationItem;
