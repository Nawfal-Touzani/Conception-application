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
  Tooltip,
  IconButton,
} from '@mui/material';
import { useState } from 'react';

import { Notification } from '../../../../types/notifications.types';
import { Check } from '@mui/icons-material';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (notificationId: number) => void;
  onApprove?: (membershipRequestId: number) => void;
  onRefuse?: (membershipRequestId: number, reason: string) => void;
  onValidateResult?: (matchId: number) => void;
  onContestResult?: (matchId: number) => void;
  onCorrectResult?: (matchId: number, scoreA: number, scoreB: number) => void;
}
// Composant pour afficher UNE notification
const NotificationItem = ({
  notification,
  onMarkAsRead,
  onApprove,
  onRefuse,
  onValidateResult,
  onContestResult,
  onCorrectResult,
}: NotificationItemProps) => {
  // état pour ouvrir la popup de refus
  const [refuseOpen, setRefuseOpen] = useState(false);

  // raison du refus
  const [reason, setReason] = useState('');

  // état popup correction score

  const [correctOpen, setCorrectOpen] = useState(false);

  // permet de savoir si la correction est faite
  const [correctDone, setCorrectDone] = useState(false);

  // scores saisis
  const [scoreA, setScoreA] = useState('');
  const [scoreB, setScoreB] = useState('');

  // état de la demande (acceptée ou refusée)
  const [actionDone, setActionDone] = useState<'approved' | 'refused' | null>(
    notification.requestState === 'ACCEPTED'
      ? 'approved'
      : notification.requestState === 'REFUSED'
        ? 'refused'
        : null,
  );

  // état pour validation ou contestation du résultat
  const [resultAction, setResultAction] = useState<
    'validated' | 'contested' | null
  >(null);

  // handler  confirme un refus
  const handleRefuseConfirm = () => {
    if (notification.membershipRequestId && onRefuse) {
      onRefuse(notification.membershipRequestId, reason);
      setActionDone('refused');
    }
    setRefuseOpen(false);
    setReason('');
  };

  // handler  corrige  un score
  const handleCorrectConfirm = () => {
    const a = parseInt(scoreA);
    const b = parseInt(scoreB);

    // on bloque si valeurs invalides
    if (isNaN(a) || isNaN(b) || a < 0 || b < 0 || a === b) return;

    onCorrectResult?.(notification.matchId!, a, b);
    onMarkAsRead(notification.id);

    setCorrectDone(true);
    setCorrectOpen(false);
  };

  // vérifie le type de notification
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

        {/* ── Correct result ── */}

        {notification.type === 'RESULT_REFUSED' &&
          notification.matchId &&
          !notification.read && (
            <>
              {!correctDone && (
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => setCorrectOpen(true)}
                >
                  Corriger
                </Button>
              )}
              {correctDone && (
                <Chip
                  label="Corrigé ✓"
                  sx={{
                    backgroundColor: '#fff3e0',
                    color: '#e65100',
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
          <Tooltip title="Marquer comme lu">
            <IconButton
              aria-label="Marquer comme lu"
              onClick={() => onMarkAsRead(notification.id)}
              sx={{
                color: '#fff',
                border: '1px solid #fff',
                ml: 1,
                mr: 1.2,
                '&:hover': {
                  borderColor: '#1c6f3e',
                  color: '#1c6f3e',
                },
              }}
            >
              <Check sx={{ fontSize: '15px' }} />
            </IconButton>
          </Tooltip>
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

      <Dialog open={correctOpen} onClose={() => setCorrectOpen(false)}>
        <DialogTitle>Corriger le résultat</DialogTitle>
        <DialogContent sx={{ display: 'flex', gap: 2, pt: 2 }}>
          <TextField
            label="Score équipe A"
            type="number"
            value={scoreA}
            onChange={(e) => setScoreA(e.target.value)}
            inputProps={{ min: 0 }}
          />
          <TextField
            label="Score équipe B"
            type="number"
            value={scoreB}
            onChange={(e) => setScoreB(e.target.value)}
            inputProps={{ min: 0 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCorrectOpen(false)}>Annuler</Button>
          <Button
            onClick={handleCorrectConfirm}
            color="warning"
            variant="contained"
            disabled={
              !scoreA.trim() ||
              !scoreB.trim() ||
              parseInt(scoreA) < 0 ||
              parseInt(scoreB) < 0 ||
              parseInt(scoreA) === parseInt(scoreB)
            }
          >
            Confirmer la correction
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default NotificationItem;
