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
} from '@mui/material';
import { PasswordModalProps } from '../../../types/password.type';
import { usePasswordForm } from '../../../hooks/usePassword/usePasswordForm';
import { pswdFieldStyle } from '../../../styles/passwordModal.styles';

export const PasswordModal = ({ open, onClose, token }: PasswordModalProps) => {
  const {
    passwordData,
    error,
    success,
    handleChange,
    handleSubmit,
    resetState,
  } = usePasswordForm(token, onClose);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionProps={{
        onExited: resetState,
      }}
      PaperProps={{
        sx: {
          borderRadius: 4,
          p: 1,
          minWidth: '400px',
          backgroundColor: '#1e2a44',
        },
      }}
    >
      <DialogTitle
        variant="h5"
        sx={{ fontWeight: 'bold', color: 'white', textAlign: 'center' }}
      >
        Modifier le mot de passe
      </DialogTitle>
      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            mt: 1,
          }}
        >
          <Collapse in={!!error}>
            <Alert severity="error" sx={{ mb: 1, borderRadius: 2 }}>
              {error}
            </Alert>
          </Collapse>
          <Collapse in={success}>
            <Alert severity="success" sx={{ mb: 1, borderRadius: 2 }}>
              Mot de passe modifié avec succès !
            </Alert>
          </Collapse>
          <TextField
            label="Ancien mot de passe"
            name="oldPassword"
            type="password"
            fullWidth
            variant="outlined"
            sx={pswdFieldStyle}
            value={passwordData.oldPassword}
            onChange={handleChange}
          />
          <TextField
            label="Nouveau mot de passe"
            name="newPassword"
            type="password"
            fullWidth
            variant="outlined"
            sx={pswdFieldStyle}
            value={passwordData.newPassword}
            onChange={handleChange}
          />
          <TextField
            label="Confirmer le nouveau mot de passe"
            name="confirmPassword"
            type="password"
            fullWidth
            variant="outlined"
            sx={pswdFieldStyle}
            value={passwordData.confirmPassword}
            onChange={handleChange}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 10, pb: 2 }}>
        <Button
          onClick={onClose}
          sx={{
            color: 'white',
            backgroundColor: '#810b0b',
            borderRadius: '5px',
            px: 4,
            py: 1,
            fontSize: '1rem',
          }}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#055b06',
            borderRadius: '5px',
            px: 4,
            py: 1,
            fontSize: '1rem',
          }}
          onClick={handleSubmit}
        >
          Confirmer
        </Button>
      </DialogActions>
    </Dialog>
  );
};
