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
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 1200, px: 3, width: '100%' }}>
      <Box sx={{ mb: 9, textAlign: 'center' }}>
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

      <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: 250,
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setFilter(undefined)}
            sx={{
              color: filter === undefined ? '#d8a46b' : 'white',
              borderColor:
                filter === undefined
                  ? '#d8a46b !important'
                  : 'white !important',
              textTransform: 'none',
              fontWeight: 'bold',
              borderWidth: '2px !important',
              '&:hover': {
                borderColor: '#d8a46b !important',
                backgroundColor: 'rgba(216, 164, 107, 0.1)',
              },
            }}
          >
            Toutes
          </Button>
          <Button
            variant="outlined"
            onClick={() => setFilter(false)}
            sx={{
              color: filter === false ? '#d8a46b' : 'white',
              borderColor:
                filter === false ? '#d8a46b !important' : 'white !important',
              textTransform: 'none',
              fontWeight: 'bold',
              borderWidth: '2px !important',
              '&:hover': {
                borderColor: '#d8a46b !important',
                backgroundColor: 'rgba(216, 164, 107, 0.1)',
              },
            }}
          >
            Non lues
          </Button>
          <Button
            variant="outlined"
            onClick={() => setFilter(true)}
            sx={{
              color: filter === true ? '#d8a46b' : 'white',
              borderColor:
                filter === true ? '#d8a46b !important' : 'white !important',
              textTransform: 'none',
              fontWeight: 'bold',
              borderWidth: '2px !important',
              '&:hover': {
                borderColor: '#d8a46b !important',
                backgroundColor: 'rgba(216, 164, 107, 0.1)',
              },
            }}
          >
            Lues
          </Button>
        </Box>

        <Box sx={{ flex: 1 }}>
          {notifications.length === 0 ? (
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                py: 4,
                pl: 20,
                fontStyle: 'italic',
              }}
            >
              Aucune notification
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
