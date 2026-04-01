import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Typography,
  Box,
} from '@mui/material';
import { MemberDto } from '../../../../types/admin.types';

interface BanInfoModalProps {
  open: boolean;
  onClose: () => void;
  member: MemberDto | null;
}

export const BanInfoModal = ({ open, onClose, member }: BanInfoModalProps) => {
  const labelStyle = {
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.6)',
    mb: 0.3,
  };

  const valueStyle = {
    fontSize: '1.15rem',
    color: '#ffffff',
    mb: 2,
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          background: '#1a2744',
          color: '#fff',
          borderRadius: '14px',
          minWidth: '420px',
          px: 2,
          py: 1,
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: 500,
          fontSize: '1.35rem',
          textAlign: 'center',
          letterSpacing: '0.5px',
          pb: 1,
        }}
      >
        Détails du bannissement
      </DialogTitle>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.15)', mx: 2 }} />

      <DialogContent sx={{ mt: 2 }}>
        <Box sx={{ mb: 1.5 }}>
          <Typography sx={labelStyle}>Membre</Typography>
          <Typography sx={valueStyle}>{member?.tag}</Typography>
        </Box>

        <Box sx={{ mb: 1.5 }}>
          <Typography sx={labelStyle}>Date du bannissement</Typography>
          <Typography sx={valueStyle}>
            {member?.banDate
              ? new Date(member.banDate).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'numeric',
                  year: 'numeric',
                })
              : 'Inconnue'}
          </Typography>
        </Box>

        <Box>
          <Typography sx={labelStyle}>Raison</Typography>
          <Typography sx={valueStyle}>{member?.banReason}</Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'right', pb: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#951c1e',
            px: 4,
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: '#701b19',
            },
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
