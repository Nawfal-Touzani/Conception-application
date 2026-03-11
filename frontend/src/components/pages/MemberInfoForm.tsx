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
import * as memberService from '../../services/memberService';
import { MemberProfile } from '../../types/member';
import { ProfileInputField } from './ProfileInputField';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export const MemberInfoForm = ({ profile }: { profile: MemberProfile }) => {
  const { user } = useAuth();
  const [openPasswordModal, setOpenPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!user?.token) return;
    setError(null);
    setSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const isSuccess = await memberService.changePassword(
        user.token,
        passwordData,
      );
      if (isSuccess) {
        setSuccess(true);
        setTimeout(() => {
          setOpenPasswordModal(false);
          setSuccess(false);
          setPasswordData({
            oldPassword: '',
            newPassword: '',
            confirmPassword: '',
          });
        }, 2000);
      } else {
        setError('Ancien mot de passe incorrect ou données invalides');
      }
    } catch (err) {
      setError('Erreur de communication avec le serveur');
    }
  };

  const fieldStyle = {
    '& .MuiOutlinedInput-root': {
      color: 'white',
      '& fieldset': { borderColor: '#ffffff' },
      '&:hover fieldset': { borderColor: 'white' },
    },
    '& .MuiInputLabel-root': { color: '#ffffff99' },
  };

  return (
    <Box>
      <ProfileInputField label="Adresse email :" value={profile.email} />

      <ProfileInputField
        label="Mot de passe :"
        value="**********"
        type="password"
        onEditClick={() => setOpenPasswordModal(true)}
      />

      <ProfileInputField label="Tag de jeu :" value={profile.tag} />

      <ProfileInputField label="Spécialité :" value={profile.speciality} />

      <Dialog
        open={openPasswordModal}
        onClose={() => setOpenPasswordModal(false)}
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
            onClick={() => setOpenPasswordModal(false)}
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
    </Box>
  );
};
