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
import { MemberDto } from '../../../../../types/admin.types';
import { modalPaperSx } from './BanModal.styles';

interface BanInfoModalProps {
  open: boolean;
  onClose: () => void;
  member: MemberDto | null;
}

// Sous composant pour l'affichage d'une ligne d'info
const BanDetailItem = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography
      sx={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', mb: 0.3 }}
    >
      {label}
    </Typography>
    <Typography sx={{ fontSize: '1.15rem', color: '#ffffff', mb: 2 }}>
      {value}
    </Typography>
  </Box>
);

// Fenêtre qui affiche les détails du membre ban
export const BanInfoModal = ({ open, onClose, member }: BanInfoModalProps) => {
  const formattedDate = member?.banDate
    ? new Date(member.banDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      })
    : 'Inconnue';

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: modalPaperSx }}>
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
        <BanDetailItem label="Membre" value={member?.tag} />
        <BanDetailItem label="Date du bannissement" value={formattedDate} />
        <BanDetailItem label="Raison" value={member?.banReason} />
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'right', pb: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#951c1e',
            px: 4,
            borderRadius: '4px',
            '&:hover': { backgroundColor: '#701b19' },
          }}
        >
          Fermer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
