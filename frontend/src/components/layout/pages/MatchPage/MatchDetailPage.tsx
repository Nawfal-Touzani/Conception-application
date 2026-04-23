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
  Paper,
} from '@mui/material';
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
        backgroundColor: '#1a2540',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: 4,
        gap: 3,
      }}
    >
      <Typography
        sx={{
          color: '#fff',
          fontWeight: 'bold',
          fontSize: '2.2rem',
          textAlign: 'center',
        }}
      >
        {match.tournamentName}
      </Typography>

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 700,
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            px: 3,
            pt: 2,
            pb: 0.5,
          }}
        >
          {['Date et heure', 'Phase', 'État'].map((label) => (
            <Typography
              key={label}
              sx={{
                fontSize: '0.8rem',
                color: 'rgba(0,0,0,0.45)',
                fontWeight: 500,
                textAlign: 'center',
              }}
            >
              {label}
            </Typography>
          ))}
        </Box>

        <Divider sx={{ mx: 3, borderColor: 'rgba(0,0,0,0.08)' }} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            px: 3,
            py: 1.5,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.92rem',
              color: '#1a2540',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            {formatMatchDateTime(match.dateTime)}
          </Typography>

          <Typography
            sx={{
              fontSize: '0.92rem',
              color: '#1a2540',
              fontWeight: 500,
              textAlign: 'center',
            }}
          >
            {match.roundLabel}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Chip
              label={formatMatchState(match.state)}
              size="small"
              sx={{
                backgroundColor: getStateColor(match.state),
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '0.75rem',
                borderRadius: '6px',
              }}
            />
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: 700,
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 4,
            py: 2.5,
          }}
        >
          <Typography
            sx={{
              fontWeight: 'bold',
              fontSize: '1.15rem',
              color: '#1a2540',
              flex: 1,
            }}
          >
            {match.teamA?.name ?? '?'}
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              minWidth: 140,
              justifyContent: 'center',
            }}
          >
            {scorePublic ? (
              <>
                <Typography
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color:
                      match.winnerId === match.teamA?.id
                        ? '#2ecc71'
                        : '#e67e22',
                  }}
                >
                  {match.scoreA}
                </Typography>

                <Typography
                  sx={{
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    color: '#1a2540',
                    mx: 0.5,
                  }}
                >
                  :
                </Typography>

                <Typography
                  sx={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color:
                      match.winnerId === match.teamB?.id
                        ? '#2ecc71'
                        : '#e67e22',
                  }}
                >
                  {match.scoreB}
                </Typography>
              </>
            ) : (
              <Typography
                sx={{
                  fontSize: '0.85rem',
                  color: 'rgba(0,0,0,0.35)',
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
              fontWeight: 'bold',
              fontSize: '1.15rem',
              color: '#1a2540',
              flex: 1,
              textAlign: 'right',
            }}
          >
            {match.teamB?.name ?? '?'}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

        <Typography
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '1rem',
            color: '#1a2540',
            py: 1.5,
          }}
        >
          Lineups
        </Typography>

        <Box sx={{ display: 'flex', px: 2, pb: 2.5 }}>
          <LineupColumn
            team={match.teamA}
            align="left"
            userTeamId={userTeamId}
          />
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: 'rgba(0,0,0,0.1)', mx: 1 }}
          />
          <LineupColumn
            team={match.teamB}
            align="right"
            userTeamId={userTeamId}
          />
        </Box>
      </Paper>

      {errorMsg && (
        <Alert
          severity="error"
          sx={{ width: '100%', maxWidth: 700, borderRadius: '10px' }}
        >
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert
          severity="success"
          sx={{ width: '100%', maxWidth: 700, borderRadius: '10px' }}
        >
          {successMsg}
        </Alert>
      )}

      {isResponsible && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
            maxWidth: 700,
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

      {showForfeitConfirm && (
        <ConfirmModal
          title="Déclarer forfait ?"
          description="Votre équipe perd automatiquement ce match (0 – 5). Action irréversible."
          confirmLabel="Confirmer le forfait"
          confirmColor="#e74c3c"
          confirmHover="#c0392b"
          loading={loading}
          onCancel={() => setShowForfeitConfirm(false)}
          onConfirm={handleForfeit}
        />
      )}

      {showContestConfirm && (
        <ConfirmModal
          title="Contester le résultat ?"
          description="Vous ne pouvez contester qu'une seule fois. Un administrateur visionnera le match et rendra son verdict. Le résultat restera masqué en attendant."
          confirmLabel="Confirmer la contestation"
          confirmColor="#e67e22"
          confirmHover="#d35400"
          loading={loading}
          onCancel={() => setShowContestConfirm(false)}
          onConfirm={handleContest}
        />
      )}
    </Box>
  );
};

const BASE_URL = 'http://localhost:3000';

type LineupColumnProps = {
  team: TeamMatchDto | null;
  align?: 'left' | 'right';
  userTeamId?: number | null;
};

const LineupColumn: React.FC<LineupColumnProps> = ({
  team,
  align = 'left',
  userTeamId = null,
}) => {
  if (!team) return <Box sx={{ flex: 1 }} />;

  const isRight = align === 'right';
  const isMyTeam = team.id === userTeamId;
  const hasLineup = !!team.lineup && team.lineup.length > 0;
  const shouldBlur = team.lineupStatus === 'HIDDEN' && !isMyTeam;

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: isRight ? 'flex-end' : 'flex-start',
        px: 1.5,
      }}
    >
      {team.lineupStatus === 'NOT_SELECTED' && (
        <Typography
          sx={{
            color: 'rgba(0,0,0,0.3)',
            fontSize: '0.85rem',
            fontStyle: 'italic',
          }}
        >
          Composition non soumise
        </Typography>
      )}

      {shouldBlur && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
          {[0, 1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                filter: 'blur(7px)',
                userSelect: 'none',
                flexDirection: isRight ? 'row-reverse' : 'row',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: 'rgba(0,0,0,0.15)',
                }}
              />
              <Box
                sx={{
                  width: 72,
                  height: 13,
                  borderRadius: 4,
                  bgcolor: 'rgba(0,0,0,0.15)',
                }}
              />
            </Box>
          ))}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.5,
              flexDirection: isRight ? 'row-reverse' : 'row',
            }}
          >
            <LockIcon sx={{ fontSize: 13, color: 'rgba(0,0,0,0.3)' }} />
            <Typography
              sx={{
                color: 'rgba(0,0,0,0.3)',
                fontSize: '0.72rem',
                fontStyle: 'italic',
              }}
            >
              Secret jusqu'au match
            </Typography>
          </Box>
        </Box>
      )}

      {!shouldBlur && hasLineup && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
          {team.lineup!.map((p) => (
            <PlayerRow key={p.id} player={p} reverse={isRight} />
          ))}
        </Box>
      )}

      {!shouldBlur && !hasLineup && team.lineupStatus !== 'NOT_SELECTED' && (
        <Typography
          sx={{
            color: 'rgba(0,0,0,0.35)',
            fontSize: '0.8rem',
            fontStyle: 'italic',
            textAlign: isRight ? 'right' : 'left',
          }}
        >
          Composition indisponible
        </Typography>
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
    <Avatar
      src={
        player.imageUrl?.startsWith('/')
          ? `${BASE_URL}${player.imageUrl}`
          : player.imageUrl
      }
      sx={{ width: 32, height: 32 }}
    />
    <Typography sx={{ fontSize: '0.9rem', fontWeight: 500, color: '#1a2540' }}>
      {player.tag}
    </Typography>
  </Box>
);

type ConfirmModalProps = {
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor: string;
  confirmHover: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  description,
  confirmLabel,
  confirmColor,
  confirmHover,
  loading,
  onCancel,
  onConfirm,
}) => (
  <Box
    onClick={onCancel}
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
        borderRadius: '12px',
        p: 4,
        maxWidth: 340,
        width: '90%',
        textAlign: 'center',
        backgroundColor: '#fff',
      }}
    >
      <Typography color="#1a2540" fontWeight="bold" fontSize="1rem" mb={1.5}>
        {title}
      </Typography>
      <Typography
        color="rgba(0,0,0,0.5)"
        fontSize="0.84rem"
        lineHeight={1.55}
        mb={3}
      >
        {description}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          onClick={onCancel}
          sx={{
            backgroundColor: 'rgba(0,0,0,0.08)',
            color: '#1a2540',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 'bold',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.14)',
              boxShadow: 'none',
            },
          }}
        >
          Annuler
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          disabled={loading}
          sx={{
            backgroundColor: confirmColor,
            color: 'white',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: confirmHover },
            '&.Mui-disabled': { opacity: 0.4 },
          }}
        >
          {loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            confirmLabel
          )}
        </Button>
      </Box>
    </Paper>
  </Box>
);

export default MatchDetailPage;
