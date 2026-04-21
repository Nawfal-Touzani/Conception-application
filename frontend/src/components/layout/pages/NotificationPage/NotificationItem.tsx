import {
  ListItem,
  ListItemText,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { useState } from 'react';

import { Notification } from '../../../../types/notifications.types';
import markRead from '../../../../assets/images/notifImage.p.jpg';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: number) => void;
  onApprove?: (membershipRequestId: number) => void;
  onRefuse?: (membershipRequestId: number, reason: string) => void;
  onValidateResult?: (matchId: number) => void;
  onContestResult?: (matchId: number) => void;
}

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onApprove,
  onRefuse,
  onValidateResult,
  onContestResult,
}: NotificationItemProps) => {
  const [refuseOpen, setRefuseOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [actionDone, setActionDone] = useState<'approved' | 'refused' | null>(
    notification.requestState === 'ACCEPTED'
      ? 'approved'
      : notification.requestState === 'REFUSED'
        ? 'refused'
        : null,
  );

  const [resultAction, setResultAction] = useState<
    'validated' | 'contested' | null
  >(null);

  const handleRefuseConfirm = () => {
    if (notification.membershipRequestId && onRefuse) {
      onRefuse(notification.membershipRequestId, reason);
      setActionDone('refused');
    }
    setRefuseOpen(false);
    setReason('');
  };

  const isMembershipRequest =
    notification.type === 'MEMBERSHIP_REQUEST' &&
    notification.membershipRequestId;

  const isResultConfirmation =
    notification.type === 'RESULT_CONFIRMATION' && !notification.read;

  return (
    <>
      <ListItem
        sx={{
          bgcolor: notification.read
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(255,255,255,0.12)',
          mb: 2,
          borderRadius: 2,
          py: 2,
          px: 3,
          flexWrap: 'wrap',
          gap: 1,
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

        {/* ── Membership request ── */}
        {isMembershipRequest && (
          <>
            {actionDone === null && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => {
                    if (notification.membershipRequestId) {
                      onApprove?.(notification.membershipRequestId);
                      setActionDone('approved');
                    }
                  }}
                >
                  Accepter
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => setRefuseOpen(true)}
                >
                  Refuser
                </Button>
              </>
            )}
            {actionDone === 'approved' && (
              <Chip
                label="Accepté ✓"
                sx={{
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  fontWeight: 600,
                }}
              />
            )}
            {actionDone === 'refused' && (
              <Chip
                label="Refusé ✗"
                sx={{
                  backgroundColor: '#fce4ec',
                  color: '#b71c1c',
                  fontWeight: 600,
                }}
              />
            )}
          </>
        )}

        {/* ── Result confirmation ── */}

        {isResultConfirmation && (
          <>
            {resultAction === null && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => {
                    onValidateResult?.(notification.matchId!);
                    onMarkAsRead(notification.id);
                    setResultAction('validated');
                  }}
                >
                  Valider
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => {
                    onContestResult?.(notification.matchId!);
                    onMarkAsRead(notification.id);
                    setResultAction('contested');
                  }}
                >
                  Contester
                </Button>
              </>
            )}
            {resultAction === 'validated' && (
              <Chip
                label="Validé ✓"
                sx={{
                  backgroundColor: '#e8f5e9',
                  color: '#2e7d32',
                  fontWeight: 600,
                }}
              />
            )}
            {resultAction === 'contested' && (
              <Chip
                label="Contesté ✗"
                sx={{
                  backgroundColor: '#fce4ec',
                  color: '#b71c1c',
                  fontWeight: 600,
                }}
              />
            )}
          </>
        )}
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
      <Dialog open={refuseOpen} onClose={() => setRefuseOpen(false)}>
        <DialogTitle>Motif du refus</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Motif"
            fullWidth
            multiline
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefuseOpen(false)}>Annuler</Button>
          <Button
            onClick={handleRefuseConfirm}
            color="error"
            variant="contained"
            disabled={!reason.trim()}
          >
            Confirmer le refus
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationItem;
