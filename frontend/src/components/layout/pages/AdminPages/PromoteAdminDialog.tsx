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
import { Link } from 'react-router-dom';

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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
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
              sx={{ width: 40, height: 40 }}
            />

            <Typography
              component={Link}
              to={`/members/${member.id}`}
              sx={{
                color: 'white',
                minWidth: 120,
                fontSize: '1.2rem',
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {member.tag}
            </Typography>

            <Typography sx={{ color: '#a1a0a0', fontSize: '1rem', flex: 4 }}>
              {member.speciality.charAt(0).toUpperCase() +
                member.speciality.slice(1)}
            </Typography>

            <Typography
              sx={{
                fontSize: '1rem',
                color: member.isAvailable ? '#4caf50' : '#f44336',
                fontWeight: member.isAvailable ? 'normal' : 'bold',
                minWidth: 120,
              }}
            >
              {member.isAvailable ? 'Disponible' : 'Indisponible'}
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
    <DialogActions
      sx={{
        justifyContent: 'flex-end',
        px: 3,
        pb: 3,
      }}
    >
      <Button
        onClick={onClose}
        variant="contained"
        sx={{
          bgcolor: '#68789a',
          color: '#fff',
          fontWeight: 700,
          px: 3,
          py: 0.8,
          mr: 1.5,
          borderRadius: '8px',
          '&:hover': {
            bgcolor: '#314161',
          },
        }}
      >
        Fermer
      </Button>
    </DialogActions>
  </Dialog>
);

export default PromoteAdminDialog;
