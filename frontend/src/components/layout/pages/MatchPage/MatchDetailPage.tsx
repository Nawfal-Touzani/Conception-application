import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Button,
  Alert,
  Avatar,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import {
  MatchDetail,
  TeamMatchDto,
  PlayerSelectionDto,
} from '../../../../types/match.types';
import { useMatchDetail } from '../../../../hooks/useMatch/useMatchDetail';
import { useAuth } from '../../../../contexts/useAuth';
import {
  formatMatchDateTime,
  formatMatchState,
  getStateColor,
} from '../../../../utils/match/match.utils';

type Props = {
  match: MatchDetail;
  onBack: () => void;
  isResponsible?: boolean;
  userTeamId?: number | null;
  onNavigateToSelection?: (match: MatchDetail, hasExisting: boolean) => void;
};

const MatchDetailPage: React.FC<Props> = ({
  match: initialMatch,
  onBack,
  isResponsible = false,
  userTeamId = null,
  onNavigateToSelection,
}) => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const {
    match,
    loading,
    errorMsg,
    successMsg,
    showForfeitConfirm,
    showContestConfirm,
    setShowForfeitConfirm,
    setShowContestConfirm,
    handleForfeit,
    handleValidate,
    handleContest,
  } = useMatchDetail(initialMatch, token);

  const scorePublic = match.scoreA !== null && match.scoreB !== null;
  const isPending = match.resultStatus === 'PENDING';
  const isScheduled = match.state === 'SCHEDULED';

  const myTeam =
    userTeamId != null
      ? match.teamA?.id === userTeamId
        ? match.teamA
        : match.teamB?.id === userTeamId
          ? match.teamB
          : null
      : null;
  const hasExistingSelection = myTeam?.lineupStatus !== 'NOT_SELECTED';

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: '#1e2a44',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4,
        gap: 3,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          width: '100%',
          maxWidth: 600,
        }}
      >
        <IconButton onClick={onBack} sx={{ color: '#fff', p: 0.5 }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography color="rgba(255,255,255,0.5)" fontSize="0.82rem">
            {match.tournamentName}
          </Typography>
          <Typography color="white" fontWeight="bold" fontSize="1.2rem">
            {match.roundLabel}
          </Typography>
          <Typography
            color="rgba(255,255,255,0.45)"
            fontSize="0.87rem"
            mt={0.5}
          >
            {formatMatchDateTime(match.dateTime)}
          </Typography>
        </Box>
        <Chip
          label={formatMatchState(match.state)}
          sx={{
            backgroundColor: getStateColor(match.state),
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '0.8rem',
            borderRadius: '8px',
          }}
        />
      </Box>

      {/* Score banner */}
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: 600,
          borderRadius: '10px',
          backgroundColor: '#243060',
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography
          sx={{
            flex: 1,
            fontWeight: 'bold',
            fontSize: '1.05rem',
            textAlign: 'right',
            color: '#fff',
          }}
        >
          {match.teamA?.name ?? '?'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minWidth: 150,
            justifyContent: 'center',
          }}
        >
          {scorePublic ? (
            <>
              <Typography
                sx={{
                  fontSize: '2.6rem',
                  fontWeight: 800,
                  color:
                    match.winnerId === match.teamA?.id ? '#2ecc71' : '#e74c3c',
                  minWidth: 48,
                  textAlign: 'center',
                }}
              >
                {match.scoreA}
              </Typography>
              <Typography
                sx={{ fontSize: '2rem', color: 'rgba(255,255,255,0.35)' }}
              >
                –
              </Typography>
              <Typography
                sx={{
                  fontSize: '2.6rem',
                  fontWeight: 800,
                  color:
                    match.winnerId === match.teamB?.id ? '#2ecc71' : '#e74c3c',
                  minWidth: 48,
                  textAlign: 'center',
                }}
              >
                {match.scoreB}
              </Typography>
            </>
          ) : (
            <Typography
              sx={{
                fontSize: '0.85rem',
                color: 'rgba(255,255,255,0.35)',
                fontStyle: 'italic',
                textAlign: 'center',
              }}
            >
              {isPending ? 'En attente de validation' : 'VS'}
            </Typography>
          )}
        </Box>

        <Typography
          sx={{
            flex: 1,
            fontWeight: 'bold',
            fontSize: '1.05rem',
            color: '#fff',
          }}
        >
          {match.teamB?.name ?? '?'}
        </Typography>
      </Paper>

      {/* Lineups */}
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: 600,
          borderRadius: '10px',
          backgroundColor: '#243060',
          p: 2,
          display: 'flex',
          gap: 0,
        }}
      >
        <LineupColumn team={match.teamA} />
        <Divider
          orientation="vertical"
          flexItem
          sx={{ borderColor: 'rgba(255,255,255,0.08)' }}
        />
        <LineupColumn team={match.teamB} align="right" />
      </Paper>

      {/* Feedback */}
      {errorMsg && (
        <Alert
          severity="error"
          sx={{ width: '100%', maxWidth: 600, borderRadius: '10px' }}
        >
          {errorMsg}
        </Alert>
      )}
      {successMsg && (
        <Alert
          severity="success"
          sx={{ width: '100%', maxWidth: 600, borderRadius: '10px' }}
        >
          {successMsg}
        </Alert>
      )}

      {/* Responsible actions */}
      {isResponsible && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            maxWidth: 600,
          }}
        >
          {isScheduled && onNavigateToSelection && (
            <Button
              variant="contained"
              onClick={() =>
                onNavigateToSelection(match, !!hasExistingSelection)
              }
              sx={{
                backgroundColor: '#3a7bd5',
                color: 'white',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                '&:hover': { backgroundColor: '#2f65b8' },
              }}
            >
              {hasExistingSelection
                ? 'Modifier la composition'
                : 'Sélectionner les joueurs'}
            </Button>
          )}

          {isScheduled && (
            <Button
              variant="contained"
              onClick={() => setShowForfeitConfirm(true)}
              disabled={loading}
              sx={{
                backgroundColor: '#e74c3c',
                color: 'white',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '1rem',
                '&:hover': { backgroundColor: '#c0392b' },
                '&.Mui-disabled': { opacity: 0.4 },
              }}
            >
              Déclarer forfait
            </Button>
          )}

          {isPending && (
            <>
              <Button
                variant="contained"
                onClick={handleValidate}
                disabled={loading}
                sx={{
                  backgroundColor: '#2ecc71',
                  color: 'white',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  '&:hover': { backgroundColor: '#27ae60' },
                  '&.Mui-disabled': { opacity: 0.4 },
                }}
              >
                {loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  'Valider le résultat'
                )}
              </Button>
              <Button
                variant="outlined"
                onClick={() => setShowContestConfirm(true)}
                disabled={loading}
                sx={{
                  borderColor: '#e74c3c',
                  color: '#e74c3c',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: 'rgba(231,76,60,0.08)',
                    borderColor: '#e74c3c',
                  },
                  '&.Mui-disabled': { opacity: 0.4 },
                }}
              >
                Contester
              </Button>
            </>
          )}
        </Box>
      )}

      {/* Modal forfait */}
      {showForfeitConfirm && (
        <Box
          onClick={() => setShowForfeitConfirm(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <Paper
            elevation={10}
            onClick={(e) => e.stopPropagation()}
            sx={{
              borderRadius: '10px',
              p: 4,
              maxWidth: 340,
              width: '90%',
              textAlign: 'center',
              backgroundColor: '#1e2f5a',
            }}
          >
            <Typography
              color="white"
              fontWeight="bold"
              fontSize="1rem"
              mb={1.5}
            >
              Déclarer forfait ?
            </Typography>
            <Typography
              color="rgba(255,255,255,0.55)"
              fontSize="0.84rem"
              lineHeight={1.55}
              mb={3}
            >
              Votre équipe perd automatiquement ce match (0 – 5). Action
              irréversible.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => setShowForfeitConfirm(false)}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: 'white',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                }}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                onClick={handleForfeit}
                disabled={loading}
                sx={{
                  backgroundColor: '#e74c3c',
                  color: 'white',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#c0392b' },
                  '&.Mui-disabled': { opacity: 0.4 },
                }}
              >
                {loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  'Confirmer le forfait'
                )}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Modal contestation */}
      {showContestConfirm && (
        <Box
          onClick={() => setShowContestConfirm(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <Paper
            elevation={10}
            onClick={(e) => e.stopPropagation()}
            sx={{
              borderRadius: '10px',
              p: 4,
              maxWidth: 340,
              width: '90%',
              textAlign: 'center',
              backgroundColor: '#1e2f5a',
            }}
          >
            <Typography
              color="white"
              fontWeight="bold"
              fontSize="1rem"
              mb={1.5}
            >
              Contester le résultat ?
            </Typography>
            <Typography
              color="rgba(255,255,255,0.55)"
              fontSize="0.84rem"
              lineHeight={1.55}
              mb={3}
            >
              Vous ne pouvez contester qu'une seule fois. Un administrateur
              visionnera le match et rendra son verdict. Le résultat restera
              masqué en attendant.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => setShowContestConfirm(false)}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  color: 'white',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' },
                }}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                onClick={handleContest}
                disabled={loading}
                sx={{
                  backgroundColor: '#e67e22',
                  color: 'white',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#d35400' },
                  '&.Mui-disabled': { opacity: 0.4 },
                }}
              >
                {loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  'Confirmer la contestation'
                )}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

// Sous-composants
type LineupColumnProps = {
  team: TeamMatchDto | null;
  align?: 'left' | 'right';
};

const LineupColumn: React.FC<LineupColumnProps> = ({
  team,
  align = 'left',
}) => {
  if (!team) return <Box sx={{ flex: 1 }} />;
  const isRight = align === 'right';

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isRight ? 'flex-end' : 'flex-start',
        px: 2,
      }}
    >
      <Typography
        sx={{
          color: 'rgba(255,255,255,0.45)',
          fontSize: '0.72rem',
          textTransform: 'uppercase',
          letterSpacing: 1,
          mb: 1,
        }}
      >
        {team.name}
      </Typography>

      {team.lineupStatus === 'NOT_SELECTED' && (
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: '0.88rem',
            fontStyle: 'italic',
          }}
        >
          Composition non soumise
        </Typography>
      )}

      {team.lineupStatus === 'HIDDEN' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          {[0, 1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                filter: 'blur(7px)',
                userSelect: 'none',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.25)',
                }}
              />
              <Box
                sx={{
                  width: 72,
                  height: 13,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.25)',
                }}
              />
            </Box>
          ))}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
          >
            <LockIcon sx={{ fontSize: 13, color: 'rgba(255,255,255,0.35)' }} />
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.72rem',
                fontStyle: 'italic',
              }}
            >
              Secret jusqu'au match
            </Typography>
          </Box>
        </Box>
      )}

      {team.lineupStatus === 'VISIBLE' && team.lineup && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          {team.lineup.map((p) => (
            <PlayerRow key={p.id} player={p} reverse={isRight} />
          ))}
        </Box>
      )}
    </Box>
  );
};

const PlayerRow: React.FC<{ player: PlayerSelectionDto; reverse: boolean }> = ({
  player,
  reverse,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: reverse ? 'row-reverse' : 'row',
      alignItems: 'center',
      gap: 1,
    }}
  >
    <Avatar src={player.imageUrl} sx={{ width: 30, height: 30 }} />
    <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: '#fff' }}>
      {player.tag}
    </Typography>
  </Box>
);

export default MatchDetailPage;
