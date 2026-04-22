import { useEffect, useState } from 'react';
import { useAuth } from '../../../../contexts/useAuth';
import {
  getNotifications,
  markAsRead,
} from '../../../../services/notifications.service';
import {
  approveRequest,
  refuseRequest,
} from '../../../../services/membership-request.service';

import {
  validateResult,
  contestResult,
} from '../../../../services/match/encode-result';
import { Notification } from '../../../../types/notifications.types';

import NotificationList from './NotificationList';

import { Box, Typography, Button } from '@mui/material';

const NotificationPage = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      const data = await getNotifications(user.id, user.token, filter);
      setNotifications(data);
    };
    fetchNotifications();
  }, [user, filter]);

  const handleMarkAsRead = async (notificationId: number) => {
    if (!user) return;
    const updated = await markAsRead(user.id, notificationId, user.token);
    setNotifications((prev) =>
      prev.map((n) => (n.id === updated.id ? updated : n)),
    );
  };

  const handleApprove = async (membershipRequestId: number) => {
    if (!user) return;
    await approveRequest(membershipRequestId, user.token);
    // Refresh the list after action
    const data = await getNotifications(user.id, user.token, filter);
    setNotifications(data);
  };

  const handleRefuse = async (membershipRequestId: number, reason: string) => {
    if (!user) return;
    await refuseRequest(membershipRequestId, reason, user.token);
    // Refresh the list after action
    const data = await getNotifications(user.id, user.token, filter);
    setNotifications(data);
  };

  const handleValidateResult = async (matchId: number) => {
    if (!user) return;
    await validateResult(matchId, user.token);
    const data = await getNotifications(user.id, user.token, filter);
    setNotifications(data);
  };

  const handleContestResult = async (matchId: number) => {
    if (!user) return;
    await contestResult(matchId, user.token);
    const data = await getNotifications(user.id, user.token, filter);
    setNotifications(data);
  };

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 1200, px: 3 }}>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            fontWeight: 900,
            textAlign: 'center',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            '&::before, &::after': {
              content: '""',
              height: '3px',
              width: '50px',
              backgroundColor: 'white',
            },
          }}
        >
          Mes notifications
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 4 }}>
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

        <Box sx={{ flex: 1 }}>
          {notifications.length === 0 ? (
            <Typography sx={{ color: 'white' }}>
              Aucune notification.
            </Typography>
          ) : (
            <NotificationList
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onApprove={handleApprove}
              onRefuse={handleRefuse}
              onValidateResult={handleValidateResult}
              onContestResult={handleContestResult}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default NotificationPage;
