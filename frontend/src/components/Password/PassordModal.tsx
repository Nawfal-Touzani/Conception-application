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
import { useState } from 'react';
import * as memberService from '../../services/memberService';

interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
  token: string;
}

const PASSWORD_REGEX =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

const fieldStyle = {
  '& .MuiOutlinedInput-root': {
    color: 'white',
    '& fieldset': { borderColor: '#ffffff' },
    '&:hover fieldset': { borderColor: 'white' },
    '&.Mui-focused fieldset': { borderColor: 'white' },
  },
  '& .MuiInputLabel-root': { color: '#ffffff99' },
  '&.Mui-focused': { color: 'white' },
};

export const PasswordModal = ({ open, onClose, token }: PasswordModalProps) => {
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetState = () => {
    setError(null);
    setSuccess(false);
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    if (
      !passwordData.oldPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setError('Veuillez compléter tous les champs.');
      return;
    }

    if (!PASSWORD_REGEX.test(passwordData.newPassword)) {
      setError(
        'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.',
      );
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if (passwordData.newPassword === passwordData.oldPassword) {
      setError("Le nouveau mot de passe doit être différent de l'actuel.");
      return;
    }

    try {
      const isSuccess = await memberService.changePassword(token, passwordData);
      if (isSuccess) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          resetState();
        }, 2000);
      } else {
        setError("L'ancien mot de passe est incorrect");
      }
    } catch (err) {
      setError('Erreur de communication avec le serveur');
    }
  };

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
            sx={fieldStyle}
            value={passwordData.oldPassword}
            onChange={handleChange}
          />
          <TextField
            label="Nouveau mot de passe"
            name="newPassword"
            type="password"
            fullWidth
            variant="outlined"
            sx={fieldStyle}
            value={passwordData.newPassword}
            onChange={handleChange}
          />
          <TextField
            label="Confirmer le nouveau mot de passe"
            name="confirmPassword"
            type="password"
            fullWidth
            variant="outlined"
            sx={fieldStyle}
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
