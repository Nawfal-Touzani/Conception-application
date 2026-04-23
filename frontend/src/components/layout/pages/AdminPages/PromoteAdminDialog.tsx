import {
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { MemberDto } from '../../../../types/admin.types';
import { adminSx } from '../../../../styles/admin.styles';

type Props = {
  open: boolean;
  allMembers: MemberDto[];
  onClose: () => void;
  onPromote: (member: MemberDto) => void;
};

const PromoteAdminDialog = ({
  open,
  allMembers,
  onClose,
  onPromote,
}: Props) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{ sx: adminSx.promoteDialogPaper }}
  >
    <DialogTitle sx={adminSx.promoteDialogTitle}>
      Ajouter un administrateur
    </DialogTitle>
    <DialogContent>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {allMembers.length === 0 && (
          <Typography
            sx={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', mt: 2 }}
          >
            Tous les membres sont déjà administrateurs.
          </Typography>
        )}
        {allMembers.map((member) => (
          <Box key={member.email} sx={adminSx.promoteMemberRow}>
            <Avatar
              src={
                member.profileImage
                  ? `http://localhost:3000${member.profileImage}`
                  : undefined
              }
              alt={member.tag}
              sx={{ width: 36, height: 36 }}
            />
            <Typography sx={{ fontWeight: 700, color: '#fff', flex: 1 }}>
              {member.tag}
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.6)',
                fontSize: '0.85rem',
                mr: 1,
              }}
            >
              {member.speciality}
            </Typography>
            <IconButton
              onClick={() => onPromote(member)}
              sx={adminSx.promoteIconButton}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Box>
    </DialogContent>
    <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
      <Button
        onClick={onClose}
        sx={{ color: '#fff', textTransform: 'none', fontWeight: 600 }}
      >
        Fermer
      </Button>
    </DialogActions>
  </Dialog>
);

export default PromoteAdminDialog;
