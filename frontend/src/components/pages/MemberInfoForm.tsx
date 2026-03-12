import {
  Alert,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import * as memberService from '../../services/memberService';
import { MemberProfile } from '../../types/member';
import { ProfileInputField } from './ProfileInputField';
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as specialityService from '../../services/speciality.service';
import { Speciality } from '../../types/speciality.types';

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
  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [selectedSpecId, setSelectedSpecId] = useState<number | ''>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!user?.token) return;
    setError(null);
    setSuccess(false);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if (passwordData.newPassword === passwordData.oldPassword) {
      setError("Le nouveau mot de passe doit être différent de l'actuel.");
      return;
    }

    if (passwordData.newPassword.length < 7) {
      setError('Le nouveau mot de passe doit contenir au moins 7 caractères.');
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
        setError("L'ancien mot de passe est incorrect");
      }
    } catch (err) {
      setError('Erreur de communication avec le serveur');
    }
  };

  useEffect(() => {
    specialityService
      .getAll()
      .then((data) => {
        setSpecialities(data);
        const currentSpec = data.find(
          (s) => s.name.toLowerCase() === profile.speciality.toLowerCase(),
        );
        if (currentSpec) setSelectedSpecId(currentSpec.id);
      })
      .catch(() => setError('Impossible de charger les spécialités.'));
  }, [profile.speciality]);

  const handleSpecialityChange = async (newId: number) => {
    if (!user?.token) return;

    const newSpec = specialities.find((s) => s.id === newId);
    if (!newSpec) return;
    setSelectedSpecId(newId);

    try {
      await memberService.updateMyProfile(user.token, {
        speciality: newSpec.name,
      });

      window.location.reload();
    } catch (err) {
      setError('Erreur lors du changement de spécialité');
    }
  };

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

  const resetModal = () => {
    setError(null);
    setSuccess(false);
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <ProfileInputField label="Adresse email :" value={profile.email} />

      <ProfileInputField
        label="Mot de passe :"
        value="**********"
        type="password"
        onEditClick={() => setOpenPasswordModal(true)}
      />

      <ProfileInputField label="Tag de jeu :" value={profile.tag} />

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          width: '100%',
          mb: 1,
          ml: 2,
        }}
      >
        <Typography sx={{ fontWeight: 'bold', minWidth: '160px' }}>
          Spécialité :
        </Typography>

        <FormControl variant="outlined" sx={{ ...fieldStyle, ml: 8 }}>
          <Select
            value={selectedSpecId}
            onChange={(e) => handleSpecialityChange(e.target.value as number)}
            sx={{
              width: '430px',
              height: '40px',
              backgroundColor: '#1e2a44',
              borderRadius: '4px',
              color: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& .MuiSelect-select': {
                paddingRight: '32px !important',
                textAlign: 'center',
                fontWeight: 'bold',
              },
              '& .MuiSelect-icon': { color: 'white', right: '10px' },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#1a2744',
                  color: 'white',
                  '& .MuiMenuItem-root': { justifyContent: 'center' },
                },
              },
            }}
          >
            {specialities.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.name.charAt(0).toUpperCase() + s.name.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Dialog
        open={openPasswordModal}
        onClose={() => {
          setOpenPasswordModal(false);
          resetModal();
        }}
        TransitionProps={{
          onExited: resetModal,
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
