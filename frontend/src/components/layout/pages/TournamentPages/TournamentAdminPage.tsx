import { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { MatchSelectionStatus } from '../../../../types/match.types';
import { getMatchSelectionStatuses } from '../../../../services/match/match.service';

type Props = {
  tournament: TournamentDetails;
  onBack: () => void;
  onUpdated: (updated: TournamentDetails) => void;
  onNavigateToPlanning: (id: number) => void;
};

function statusLabel(tournament: TournamentDetails): string {
  if (tournament.status === 'PREPARATION') {
    return tournament.isPublic ? 'Inscriptions ouvertes' : 'En préparation';
  }
  if (tournament.status === 'UPCOMING') return 'Complet';
  if (tournament.status === 'IN_PROGRESS') return 'En cours';
  if (tournament.status === 'FINISHED') return 'Terminé';
  return 'Annulé';
}

const TournamentAdminPage = ({
  tournament,
  onUpdated,
  onBack,
  onNavigateToPlanning,
}: Props) => {
  const { user } = useAuth();
  const token = user?.token ?? '';
  const navigate = useNavigate();

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

  const isLocked = tournament.isPublic;

  const maxParticipantsError =
    maxParticipants < tournament.currentParticipants
      ? 'Impossible de mettre moins que les équipes déjà inscrites.'
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

  const [planningPublished, setPlanningPublished] = useState(false);
  const [allSelectionsReady, setAllSelectionsReady] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/tournaments/${tournament.id}/matches`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((matches) => {
        setPlanningPublished(matches.length > 0);
      })
      .catch(() => setPlanningPublished(false));

    if (tournament.status === 'IN_PROGRESS') {
      getMatchSelectionStatuses(tournament.id, token)
        .then((statuses: MatchSelectionStatus[]) => {
          const firstRound = statuses.filter((s) => s.roundNumber === 1);
          const ready =
            firstRound.length > 0 &&
            firstRound.every((s) => s.teamAReady && s.teamBReady);
          setAllSelectionsReady(ready);
        })
        .catch(() => setAllSelectionsReady(false));
    }
  }, [tournament.id, tournament.status, token]);

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
          mb: 2,
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

      {isLocked && (
        <Alert severity="info" sx={{ mb: 3, maxWidth: 800, width: '100%' }}>
          Le tournoi est public, les informations ne peuvent plus être
          modifiées.
        </Alert>
      )}

      <Box
        sx={{
          width: '100%',
          maxWidth: 800,
          backgroundColor: '#1e2f50',
          borderRadius: '16px',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
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
              disabled={isLocked}
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
              disabled={isLocked}
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
              disabled={isLocked}
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
              disabled={isLocked}
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
              disabled={isLocked}
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
              disabled={isLocked}
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

            {tournament.status === 'IN_PROGRESS' && (
              <>
                <Button
                  variant="contained"
                  disabled={!allSelectionsReady}
                  onClick={() =>
                    navigate(`/encode/result/${tournament.id}`, {
                      state: { tournamentName: tournament.name },
                    })
                  }
                  fullWidth
                  sx={{
                    backgroundColor: '#2ecc71',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    borderRadius: '8px',
                    '&:hover': { backgroundColor: '#27ae60' },
                    '&.Mui-disabled': {
                      backgroundColor: 'rgba(46,204,113,0.3)',
                      color: 'rgba(255,255,255,0.4)',
                    },
                  }}
                >
                  Encoder les résultats
                </Button>
                {!allSelectionsReady && (
                  <Typography
                    sx={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.8rem',
                      textAlign: 'center',
                    }}
                  >
                    En attente des compositions des deux équipes.
                  </Typography>
                )}
              </>
            )}

            {tournament.status === 'UPCOMING' && !planningPublished && (
              <Button
                variant="contained"
                onClick={() => onNavigateToPlanning(tournament.id)}
                fullWidth
                sx={{
                  backgroundColor: '#3a7bd5',
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: '8px',
                  '&:hover': { backgroundColor: '#2f65b8' },
                }}
              >
                Planifier les matchs
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={!!maxParticipantsError || isLocked}
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
