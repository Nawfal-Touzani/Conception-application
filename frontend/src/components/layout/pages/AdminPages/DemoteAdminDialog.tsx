import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import { MemberDto } from '../../../../types/admin.types';

type Props = {
  demoteTarget: MemberDto | null;
  onClose: () => void;
  onConfirm: () => void;
};

// Modale de confirmation pour révoquer un admin
const DemoteAdminDialog = ({ demoteTarget, onClose, onConfirm }: Props) => (
  <Dialog
    open={!!demoteTarget}
    onClose={onClose}
    PaperProps={{ sx: { borderRadius: '12px' } }}
  >
    <DialogTitle>Révoquer un administrateur</DialogTitle>
    <DialogContent>
      <Typography>
        Es-tu sûr de vouloir révoquer les droits administrateur de{' '}
        <strong>
          {demoteTarget?.tag}#{String(demoteTarget?.id).padStart(3, '0')}
        </strong>{' '}
        ?
      </Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} sx={{ textTransform: 'none' }}>
        Annuler
      </Button>
      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        sx={{ textTransform: 'none' }}
      >
        Confirmer
      </Button>
    </DialogActions>
  </Dialog>
);

export default DemoteAdminDialog;
