import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Collapse,
  Alert,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import * as memberService from '../../services/memberService';

export const UnavailabilitySection = () => {
  const { user } = useAuth();
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleConfirm = async () => {
    if (!user?.token) return;
    setError(null);
    setSuccess(false);

    if (!dates.startDate || !dates.endDate) {
      setError('Veuillez sélectionner les deux dates.');
      return;
    }

    if (dates.startDate < dates.endDate) {
      setError('La date de début ne peut pas être dans le passé');
      return;
    }

    if (dates.endDate < dates.startDate) {
      setError('La date de fin doit être postérieure à la date de début.');
      return;
    }

    const isSuccess = await memberService.addUnavailability(
      user.token,
      dates.startDate,
      dates.endDate,
    );

    if (isSuccess) {
      setSuccess(true);
      setDates({ startDate: '', endDate: '' });
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError('Erreur : Dates invalides');
    }
  };

  return (
    <Box sx={{ mt: 4, mb: 2, p: 2, borderTop: '2px solid #1e2a44' }}>
      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>
        Définir une indisponibilité :
      </Typography>

      <Collapse in={!!error || success}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Indisponibilité enregistrée !
          </Alert>
        )}
      </Collapse>

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={3} display="flex" justifyContent="center">
          <CalendarMonthIcon sx={{ fontSize: 60, color: '#333' }} />
        </Grid>

        <Grid item xs={9}>
          <Box
            sx={{ bgcolor: '#1e2a44', p: 2, borderRadius: 2, color: 'white' }}
          >
            <Box
              sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1.5 }}
            >
              <Typography sx={{ minWidth: 40, fontWeight: 'bold' }}>
                Du :
              </Typography>
              <TextField
                type="date"
                size="small"
                fullWidth
                value={dates.startDate}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
                onChange={(e) =>
                  setDates({ ...dates, startDate: e.target.value })
                }
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Typography sx={{ minWidth: 40, fontWeight: 'bold' }}>
                Au :
              </Typography>
              <TextField
                type="date"
                size="small"
                fullWidth
                value={dates.endDate}
                sx={{ bgcolor: 'white', borderRadius: 1 }}
                onChange={(e) =>
                  setDates({ ...dates, endDate: e.target.value })
                }
              />
            </Box>

            <Box textAlign="center" mt={2}>
              <Button
                variant="contained"
                size="small"
                onClick={handleConfirm}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  bgcolor: 'white',
                  color: '#1e2a44',
                  fontWeight: 'bold',
                  textTransform: 'none',
                }}
              >
                Confirmer
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
