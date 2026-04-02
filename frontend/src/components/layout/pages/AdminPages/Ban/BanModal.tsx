import {
  Alert,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { MemberDto } from '../../../../../types/admin.types';
import { banFieldStyle } from './BanModal.styles';

interface BanModalProps {
  open: boolean;
  onClose: () => void;
  member: MemberDto | null;
  onConfirm: (reason: string) => Promise<void>;
}

export const BanModal = ({
  open,
  onClose,
  member,
  onConfirm,
}: BanModalProps) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetState = () => {
    setReason('');
    setError(null);
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError('Veuillez indiquer une raison pour le bannissement.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onConfirm(reason);
      onClose();
    } catch (err) {
      setError('Erreur lors du bannissement du membre.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionProps={{ onExited: resetState }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          minWidth: '450px',
          backgroundColor: '#1e2a44',
        },
      }}
    >
      <DialogTitle
        variant="h5"
        sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}
      >
        Bannir le membre
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography sx={{ color: 'white', textAlign: 'center', mb: 1 }}>
            Vous êtes sur le point de bannir <strong>{member?.tag}</strong>.
          </Typography>

          <Collapse in={!!error}>
            <Alert severity="error" sx={{ mb: 1, borderRadius: 2 }}>
              {error}
            </Alert>
          </Collapse>

          <TextField
            label="Raison du bannissement"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            sx={banFieldStyle}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3, px: 3 }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'white',
            backgroundColor: '#810b0b',
            borderRadius: '5px',
            px: 4,
            py: 1,
            fontSize: '1rem',
            '&:hover': { backgroundColor: '#a31212' },
          }}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          sx={{
            bgcolor: '#055b06',
            borderRadius: '5px',
            px: 4,
            py: 1,
            fontSize: '1rem',
            '&:hover': { bgcolor: '#087a09' },
          }}
          onClick={handleConfirm}
        >
          {loading ? 'Traitement...' : 'Confirmer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
