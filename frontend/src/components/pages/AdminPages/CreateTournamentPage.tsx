import { useState } from 'react';
import { useAuth } from '../../../contexts/useAuth';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import * as tournamentService from '../../../services/tournament/tournament.service';

const CreateTournamentPage = () => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationDeadline, setRegistrationDeadline] = useState('');
  const [maxParticipants, setMaxParticipants] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setRegistrationDeadline('');
    setMaxParticipants('');
    setError(null);
    setSuccess(null);
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (
      !name ||
      !description ||
      !startDate ||
      !endDate ||
      !registrationDeadline ||
      maxParticipants === ''
    ) {
      setError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    setLoading(true);
    console.log({
      startDate,
      endDate,
      registrationDeadline,
    });
    try {
      await tournamentService.createTournament(
        user!.id,
        {
          name,
          description,
          startDate: startDate,
          endDate: endDate,
          registrationDeadline: registrationDeadline,
          maxParticipant: Number(maxParticipants),
        },
        token,
      );
      setSuccess('Tournoi créé avec succès !');
      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#fff',
      borderRadius: '6px',
    },
  };

  const Label = ({ text }: { text: string }) => (
    <Typography
      sx={{ color: '#c8d8e8', fontSize: '0.85rem', fontWeight: 600, mb: 0.5 }}
    >
      {text}
    </Typography>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1a2744',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        pt: 6,
        px: 2,
      }}
    >
      <Paper
        sx={{
          width: '100%',
          maxWidth: 720,
          backgroundColor: '#1e2f50',
          borderRadius: '12px',
          p: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: '#fff', fontWeight: 700, textAlign: 'center', mb: 4 }}
        >
          Créer un tournoi
        </Typography>

        {error && (
          <Alert
            onClose={() => setError(null)}
            sx={{ mb: 3, backgroundColor: '#fdecea', color: '#c62828' }}
          >
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            onClose={() => setSuccess(null)}
            sx={{ mb: 3, backgroundColor: '#e8f5e9', color: '#2e7d32' }}
          >
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Colonne gauche */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <Box>
              <Label text="Nom du tournoi :" />
              <TextField
                placeholder="Nom du tournoi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                sx={inputSx}
              />
            </Box>

            <Box>
              <Label text="Description :" />
              <TextField
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={4}
                fullWidth
                sx={inputSx}
              />
            </Box>

            <Box>
              <Label text="Date de début :" />
              <TextField
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
                sx={inputSx}
              />
            </Box>
          </Box>

          {/* Colonne droite */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <Box>
              <Label text="Date de fin :" />
              <TextField
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
                sx={inputSx}
              />
            </Box>

            <Box>
              <Label text="Date limite d'inscription :" />
              <TextField
                type="date"
                value={registrationDeadline}
                onChange={(e) => setRegistrationDeadline(e.target.value)}
                fullWidth
                sx={inputSx}
              />
            </Box>

            <Box>
              <Label text="Nombre maximum d'équipes :" />
              <TextField
                placeholder="Doit être une puissance de deux"
                type="number"
                value={maxParticipants}
                onChange={(e) =>
                  setMaxParticipants(
                    e.target.value === '' ? '' : Number(e.target.value),
                  )
                }
                fullWidth
                sx={inputSx}
              />
            </Box>
          </Box>
        </Box>

        <Box
          sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}
        >
          <Button
            onClick={handleReset}
            variant="contained"
            sx={{
              backgroundColor: '#c0392b',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#a93226' },
            }}
          >
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              backgroundColor: '#27ae60',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#1e8449' },
            }}
          >
            {loading ? 'Création...' : 'Créer le tournoi'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateTournamentPage;
