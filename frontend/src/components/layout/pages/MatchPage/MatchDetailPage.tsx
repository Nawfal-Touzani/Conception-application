import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockIcon from '@mui/icons-material/Lock';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import {
  MatchDetail,
  PlayerSelectionDto,
  TeamMatchDto,
} from '../../../../types/match.types';
import { useMatchDetailPage } from '../../../../hooks/useMatch/useMatchDetailPage';
import {
  formatMatchDateTime,
  formatMatchState,
  getStateColor,
} from '../../../../utils/match/match.utils';
import { getPlayerAvatarUrl } from '../../../../utils/match/match-detail.utils';
import { matchDetailStyles } from '../../../../styles/match/matchDetail.styles';

type Props = {
  match: MatchDetail;
  onBack: () => void;
  isResponsible?: boolean;
  userTeamId?: number | null;
  onNavigateToSelection?: (match: MatchDetail, hasExisting: boolean) => void;
};

type LineupColumnProps = {
  team: TeamMatchDto | null;
  align?: 'left' | 'right';
  userTeamId?: number | null;
};

type PlayerRowProps = {
  player: PlayerSelectionDto;
  reverse: boolean;
};

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

const PlayerRow: React.FC<PlayerRowProps> = ({ player, reverse }) => {
  const navigate = useNavigate();

  // ouvre la page du joueur au clic
  const handleNavigate = () => {
    navigate(`/members/${player.id}`);
  };

  return (
    <Box sx={matchDetailStyles.playerRow(reverse)}>
      <Avatar
        src={getPlayerAvatarUrl(player.imageUrl)}
        onClick={handleNavigate}
        sx={{
          width: 32,
          height: 32,
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
            transition: 'opacity 0.2s',
          },
        }}
      />

      {/* garde le nom compact avec un id formate sur 3 chiffres */}
      <Typography
        onClick={handleNavigate}
        sx={{
          fontSize: '0.9rem',
          fontWeight: 500,
          color: '#1a2540',
          cursor: 'pointer',
        }}
      >
        {player.tag}#{String(player.id).padStart(3, '0')}
      </Typography>
    </Box>
  );
};

const LineupColumn: React.FC<LineupColumnProps> = ({
  team,
  align = 'left',
  userTeamId = null,
}) => {
  if (!team) return <Box sx={{ flex: 1 }} />;

  const isRight = align === 'right';
  const isMyTeam = team.id === userTeamId;
  const hasLineup = !!team.lineup?.length;
  const shouldBlur = team.lineupStatus === 'HIDDEN' && !isMyTeam;

  return (
    <Box sx={matchDetailStyles.lineupColumn(isRight)}>
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
          {/* simule une composition cachee avant le match */}
          {[0, 1, 2, 3].map((item) => (
            <Box
              key={item}
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
          {team.lineup!.map((player) => (
            <PlayerRow key={player.id} player={player} reverse={isRight} />
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

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  description,
  confirmLabel,
  confirmColor,
  confirmHover,
  loading,
  onCancel,
  onConfirm,
}) => {
  return (
    <Box onClick={onCancel} sx={matchDetailStyles.overlay}>
      <Paper
        elevation={10}
        onClick={(event) => event.stopPropagation()}
        sx={matchDetailStyles.modalCard}
      >
        {/* rappelle clairement l'action avant de confirmer */}
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
};

const MatchDetailPage: React.FC<Props> = ({
  match: initialMatch,
  onBack,
  isResponsible = false,
  userTeamId = null,
  onNavigateToSelection,
}) => {
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
    handleContest,
    myTeam,
    scorePublic,
    isPending,
    isScheduled,
    selectionAlreadyExists,
  } = useMatchDetailPage({
    initialMatch,
    userTeamId,
  });

  return (
    <Box sx={matchDetailStyles.pageContainer}>
      <Box sx={matchDetailStyles.backRow}>
        {/* permet de revenir a la vue precedente */}
        <Button
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={matchDetailStyles.backButton}
        >
          Retour
        </Button>
      </Box>

      {/* affiche le nom du tournoi comme titre principal */}
      <Typography sx={matchDetailStyles.pageTitle}>
        {match.tournamentName}
      </Typography>

      <Paper elevation={0} sx={matchDetailStyles.whiteCard}>
        <Box sx={matchDetailStyles.metaHeaderGrid}>
          {['Date et heure', 'Phase', 'Etat'].map((label) => (
            <Typography key={label} sx={matchDetailStyles.metaLabel}>
              {label}
            </Typography>
          ))}
        </Box>

        <Divider sx={{ mx: 3, borderColor: 'rgba(0,0,0,0.08)' }} />

        <Box sx={matchDetailStyles.metaValueGrid}>
          <Typography sx={matchDetailStyles.metaValue}>
            {formatMatchDateTime(match.dateTime)}
          </Typography>

          <Typography sx={matchDetailStyles.metaValue}>
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

      <Paper elevation={4} sx={matchDetailStyles.whiteCard}>
        <Box sx={matchDetailStyles.scoreHeader}>
          <Typography sx={matchDetailStyles.teamNameLeft}>
            {match.teamA?.name ?? '?'}
          </Typography>

          <Box sx={matchDetailStyles.scoreBox}>
            {scorePublic ? (
              <>
                {/* met en avant l'equipe gagnante quand le score est visible */}
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

          <Typography sx={matchDetailStyles.teamNameRight}>
            {match.teamB?.name ?? '?'}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: 'rgba(0,0,0,0.08)' }} />

        <Typography sx={matchDetailStyles.lineupSectionTitle}>
          Lineups
        </Typography>

        <Box sx={matchDetailStyles.lineupWrapper}>
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
        <Alert severity="error" sx={matchDetailStyles.alert}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={matchDetailStyles.alert}>
          {successMsg}
        </Alert>
      )}

      {isResponsible && myTeam && (
        <Box sx={matchDetailStyles.actionWrapper}>
          {isScheduled && onNavigateToSelection && (
            <Button
              variant="contained"
              onClick={() =>
                onNavigateToSelection(match, selectionAlreadyExists)
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
              {selectionAlreadyExists
                ? 'Modifier la composition'
                : 'Selectionner les joueurs'}
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
              Declarer forfait
            </Button>
          )}
        </Box>
      )}

      {showForfeitConfirm && (
        <ConfirmModal
          title="Declarer forfait ?"
          description="Votre equipe perd automatiquement ce match (0 - 5). Action irreversible."
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
          title="Contester le resultat ?"
          description="Vous ne pouvez contester qu'une seule fois. Un administrateur visionnera le match et rendra son verdict. Le resultat restera masque en attendant."
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

export default MatchDetailPage;
