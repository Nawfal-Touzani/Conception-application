import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  TextField,
  Typography,
  Alert,
  Snackbar,
} from '@mui/material';
import { TournamentDetails } from '../../../../types/tournament.types';
import { useAuth } from '../../../../contexts/useAuth';
import * as tournamentService from '../../../../services/tournament/tournament.service';

type Props = {
  tournament: TournamentDetails;
  onBack: () => void;
  onUpdated: (updated: TournamentDetails) => void;
};

function statusLabel(tournament: TournamentDetails): string {
  if (tournament.status === 'PREPARATION') {
    return tournament.isPublic ? 'Inscriptions ouvertes' : 'En préparation';
  }
  if (tournament.status === 'IN_PROGRESS') return 'En cours';
  if (tournament.status === 'FINISHED') return 'Terminé';
  return 'Annulé';
}

const TournamentAdminPage = ({ tournament, onUpdated, onBack }: Props) => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const [name, setName] = useState(tournament.name);
  const [description, setDescription] = useState(tournament.description ?? '');
  const [startDate, setStartDate] = useState(tournament.startDate);
  const [endDate, setEndDate] = useState(tournament.endDate);
  const [registrationDeadline, setRegistrationDeadline] = useState(
    tournament.registrationDeadline,
  );
  const [maxParticipants, setMaxParticipants] = useState(
    tournament.maxParticipants,
  );

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;

  const maxParticipantsError =
    maxParticipants < tournament.currentParticipants
      ? 'Impossible de mettre moins que les équipes déjà inscrites.'
      : !isPowerOfTwo(maxParticipants)
        ? 'Le nombre de teams doit être une puissance de 2.'
        : '';

  const handleUpdate = async () => {
    setErrorMsg(null);
    try {
      const updated = await tournamentService.updateTournament(
        tournament.id,
        {
          name,
          description,
          startDate,
          endDate,
          registrationDeadline,
          maxParticipant: maxParticipants,
        },
        token,
      );
      setSuccessMsg('Tournoi mis à jour avec succès !');
      onUpdated({ ...tournament, ...updated });
    } catch (e: unknown) {
      setErrorMsg(
        e instanceof Error ? e.message : 'Erreur lors de la mise à jour.',
      );
    }
  };

  const handlePublish = async () => {
    setErrorMsg(null);
    try {
      const updated = await tournamentService.publishTournament(
        tournament.id,
        token,
      );
      setSuccessMsg('Tournoi rendu public !');
      onUpdated({ ...tournament, ...updated, isPublic: true });
      onBack();
    } catch (e: unknown) {
      setErrorMsg(
        e instanceof Error ? e.message : 'Erreur lors de la publication.',
      );
    }
  };

  const canPublish =
    tournament.status === 'PREPARATION' && !tournament.isPublic;

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: '#1a2744',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 4,
        px: 4,
        pb: 6,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 800,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: '#fff', fontWeight: 800, fontSize: '1.6rem' }}
        >
          Gestion du tournoi
        </Typography>
        <Chip
          label={statusLabel(tournament)}
          sx={{
            backgroundColor: '#fff',
            color: '#1a2744',
            fontWeight: 700,
            fontSize: '0.85rem',
            borderRadius: '8px',
          }}
        />
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 800,
          backgroundColor: '#243060',
          borderRadius: '16px',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box
            sx={{
              flex: 1,
              minWidth: 260,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography
              sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Information du tournoi
            </Typography>
            <TextField
              fullWidth
              placeholder="Nom du tournoi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              size="small"
              sx={inputSx}
            />
            <TextField
              fullWidth
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              size="small"
              multiline
              rows={2}
              sx={inputSx}
            />
            <Typography
              sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', mt: 1 }}
            >
              Date de début :
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              size="small"
              sx={inputSx}
            />
            <Typography
              sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Date de fin :
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              size="small"
              sx={inputSx}
            />
          </Box>

          <Box
            sx={{
              flex: 1,
              minWidth: 260,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography
              sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Date limite d'inscription :
            </Typography>
            <TextField
              fullWidth
              type="date"
              value={registrationDeadline}
              onChange={(e) => setRegistrationDeadline(e.target.value)}
              size="small"
              sx={inputSx}
            />

            <Typography
              sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Nombre de teams :
            </Typography>
            <TextField
              fullWidth
              type="number"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(Number(e.target.value))}
              size="small"
              error={!!maxParticipantsError}
              helperText={
                maxParticipantsError ||
                `Équipes déjà inscrites : ${tournament.currentParticipants}`
              }
              inputProps={{ min: tournament.currentParticipants, step: 1 }}
              sx={{
                ...inputSx,
                '& .MuiFormHelperText-root': {
                  color: maxParticipantsError
                    ? '#ffb3b3'
                    : 'rgba(255,255,255,0.7)',
                  marginLeft: 0,
                },
              }}
            />

            <Typography
              sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', mt: 2 }}
            >
              Actions
            </Typography>

            {canPublish && (
              <Button
                variant="contained"
                onClick={handlePublish}
                fullWidth
                sx={{
                  backgroundColor: '#e8b84b',
                  color: '#1a2744',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: '#d4a73a' },
                }}
              >
                Rendre public
              </Button>
            )}

            {!canPublish && tournament.status === 'PREPARATION' && (
              <Chip
                label="Déjà public"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)',
                  fontWeight: 600,
                  alignSelf: 'flex-start',
                }}
              />
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={!!maxParticipantsError}
            sx={{
              backgroundColor: '#fff',
              color: '#1a2744',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              borderRadius: '8px',
              px: 5,
              '&:hover': { backgroundColor: '#e8e8e8' },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                color: 'rgba(26,39,68,0.6)',
              },
            }}
          >
            Confirmer les modifications
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={!!successMsg}
        autoHideDuration={3000}
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!errorMsg}
        autoHideDuration={4000}
        onClose={() => setErrorMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorMsg(null)}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#fff',
    borderRadius: '8px',
    fontSize: '0.9rem',
  },
};

export default TournamentAdminPage;
