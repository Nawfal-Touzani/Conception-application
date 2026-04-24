import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
} from '@mui/material';
import { useAuth } from '../../../../contexts/useAuth';
import * as tournamentService from '../../../../services/tournament/tournament.service';
import { useTournamentForm } from '../../../../hooks/useTournamentForm/useTournamentForm';
import { useNavigate } from 'react-router-dom';

const CreateTournamentPage = () => {
  // récup l'utilisateur connecté
  const { user } = useAuth();

  // token pour les appels API
  const token = user?.token ?? '';

  const navigate = useNavigate();

  // hook custom pour gérer le formulaire
  const {
    name,
    setName,
    description,
    setDescription,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    registrationDeadline,
    setRegistrationDeadline,
    maxParticipants,
    setMaxParticipants,
    errors,
    setErrors,
    success,
    setSuccess,
    reset,
    validate,
  } = useTournamentForm();

  // quand on clique sur "Créer"
  const handleSubmit = async () => {
    // reset des messages
    setErrors([]);
    setSuccess(null);

    // vérifie les champs
    if (!validate()) return;

    try {
      // appel API pour créer le tournoi
      const result = await tournamentService.createTournament(
        user!.id,
        {
          name,
          description,
          startDate,
          endDate,
          registrationDeadline,
          maxParticipant: Number(maxParticipants),
        },
        token,
      );
      // message de succès
      setSuccess(`Le tournoi "${name}" a été créé avec succès !`);

      // redirection après 1.5s
      setTimeout(
        () => navigate('/tournaments', { state: { selectedId: result.id } }),
        1500,
      );

      // reset du formulaire
      setName('');
      setDescription('');
      setStartDate('');
      setEndDate('');
      setRegistrationDeadline('');
      setMaxParticipants('');
    } catch (err) {
      // gestion des erreurs
      if (err instanceof Error && err.message.includes('409')) {
        setErrors(['Un tournoi avec ce nom existe déjà.']);
      } else {
        setErrors([err instanceof Error ? err.message : 'Erreur inconnue']);
      }
    }
  };

  // style commun pour les inputs
  const inputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: '#fff',
      borderRadius: '6px',
    },
  };

  // petit composant pour les labels
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
        flexDirection: 'column',
        alignItems: 'center',
        pt: 6,
        px: 2,
      }}
    >
      <Box sx={{ mb: 4, textAlign: 'center', width: '100%', maxWidth: 720 }}>
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            fontWeight: 900,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            '&::before, &::after': {
              content: '""',
              height: '3px',
              flex: 1,
              maxWidth: '50px',
              backgroundColor: 'white',
            },
          }}
        >
          Créer un tournoi
        </Typography>
      </Box>

      <Paper
        sx={{
          width: '100%',
          maxWidth: 720,
          backgroundColor: '#1e2f50',
          borderRadius: '12px',
          p: 4,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        {errors.length > 0 && (
          <Alert
            onClose={() => setErrors([])}
            sx={{ mb: 3, backgroundColor: '#fdecea', color: '#c62828' }}
          >
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
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
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}
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
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}
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
                placeholder="Ex: 8"
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
            onClick={reset}
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
            onClick={handleSubmit}
            variant="contained"
            sx={{
              backgroundColor: '#27ae60',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#1e8449' },
            }}
          >
            Créer le tournoi
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default CreateTournamentPage;
