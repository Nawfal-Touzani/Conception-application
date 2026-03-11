import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getNotifications,
  markAsRead,
} from '../../services/notifications.service';
import { Notification } from '../../types/notifications.types';
import NotificationList from '../NotificationList';
import { Box, Typography, Button } from '@mui/material';

const NotifiationPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<boolean | undefined>(undefined);

  // Fetch notifications when the page loads or filter changes
  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      const data = await getNotifications(user.id, user.token, filter);
      setNotifications(data);
    };
    fetchNotifications();
  }, [user, filter]);

  // Mark a notification as read
  const handleMarkAsRead = async (notificationId: number) => {
    if (!user) return;

    const updated = await markAsRead(user.id, notificationId, user.token);
    setNotifications((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n)),
    );
  };

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 1200, px: 3 }}>
      <Typography variant="h4" mb={3} sx={{ color: 'white' }}>
        Mes notifications
      </Typography>

      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Filter buttons on the left */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            minWidth: 200,
          }}
        >
          <Button
            variant={filter === undefined ? 'contained' : 'outlined'}
            onClick={() => setFilter(undefined)}
          >
            Toutes
          </Button>
          <Button
            variant={filter === false ? 'contained' : 'outlined'}
            onClick={() => setFilter(false)}
          >
            Non lues
          </Button>
          <Button
            variant={filter === true ? 'contained' : 'outlined'}
            onClick={() => setFilter(true)}
          >
            Lues
          </Button>
        </Box>

        {/* Notifications list on the right */}
        <Box sx={{ flex: 1 }}>
          {notifications.length === 0 ? (
            <Typography sx={{ color: 'white' }}>
              Aucune notification.
            </Typography>
          ) : (
            <NotificationList
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default NotifiationPage;
