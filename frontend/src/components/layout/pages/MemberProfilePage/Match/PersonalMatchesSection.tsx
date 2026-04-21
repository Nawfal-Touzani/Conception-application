import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { MatchDetail } from '../../../../../types/match.types';
import {
  usePersonalMatches,
  MatchView,
} from '../../../../../hooks/useMatch/usePersonalMatches';
import {
  formatMatchDateTime,
  getStateColor,
} from '../../../../../utils/match/match.utils';

type Props = {
  token: string;
  onMatchClick: (match: MatchDetail) => void;
};

const PersonalMatchesSection: React.FC<Props> = ({ token, onMatchClick }) => {
  const { upcoming, past, loading, error, activeView, setActiveView } =
    usePersonalMatches(token);

  const displayed = activeView === 'upcoming' ? upcoming : past;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Tabs */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {(['upcoming', 'past'] as MatchView[]).map((view) => (
          <Button
            key={view}
            variant={activeView === view ? 'contained' : 'text'}
            onClick={() => setActiveView(view)}
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '0.88rem',
              borderRadius: '8px',
              px: 2,
              py: 0.75,
              backgroundColor: activeView === view ? '#e8b84b' : 'transparent',
              color: activeView === view ? '#1a2744' : 'rgba(255,255,255,0.5)',
              '&:hover': {
                backgroundColor:
                  activeView === view ? '#d4a73a' : 'rgba(255,255,255,0.08)',
              },
            }}
          >
            {view === 'upcoming' ? 'Matchs à venir' : 'Matchs disputés'}
          </Button>
        ))}
      </Box>

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#e8b84b' }} />
        </Box>
      )}

      {/* Erreur */}
      {error && (
        <Typography sx={{ color: '#e74c3c', textAlign: 'center', py: 3 }}>
          {error}
        </Typography>
      )}

      {/* Liste vide */}
      {!loading && displayed.length === 0 && (
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.35)',
            textAlign: 'center',
            py: 4,
            fontStyle: 'italic',
          }}
        >
          {activeView === 'upcoming'
            ? 'Aucun match à venir.'
            : 'Aucun match disputé.'}
        </Typography>
      )}

      {/* Liste des matchs */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        {displayed.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            onClick={() => onMatchClick(match)}
          />
        ))}
      </Box>
    </Box>
  );
};

// ── Match card ───────────────────────────────────────────────────────

const MatchCard: React.FC<{ match: MatchDetail; onClick: () => void }> = ({
  match,
  onClick,
}) => {
  const scorePublic = match.scoreA !== null && match.scoreB !== null;
  const teamAWon = match.winnerId === match.teamA?.id;
  const teamBWon = match.winnerId === match.teamB?.id;

  return (
    <Paper
      elevation={3}
      onClick={onClick}
      sx={{
        borderRadius: '10px',
        px: 2.5,
        py: 2,
        backgroundColor: '#243060',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.15s',
        '&:hover': {
          backgroundColor: '#2d3c75',
          borderColor: 'rgba(255,255,255,0.15)',
        },
      }}
    >
      {/* Tournoi + round */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography color="rgba(255,255,255,0.4)" fontSize="0.75rem">
          {match.tournamentName}
        </Typography>
        <Typography color="#e8b84b" fontSize="0.75rem" fontWeight="bold">
          {match.roundLabel}
        </Typography>
      </Box>

      {/* Équipes + score */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <TeamBlock
          name={match.teamA?.name ?? '?'}
          isWinner={teamAWon}
          align="left"
        />
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            minWidth: 90,
            justifyContent: 'center',
          }}
        >
          {scorePublic ? (
            <>
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: teamAWon ? '#2ecc71' : '#e74c3c',
                  minWidth: 28,
                  textAlign: 'center',
                }}
              >
                {match.scoreA}
              </Typography>
              <Typography
                sx={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.3)' }}
              >
                –
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: teamBWon ? '#2ecc71' : '#e74c3c',
                  minWidth: 28,
                  textAlign: 'center',
                }}
              >
                {match.scoreB}
              </Typography>
            </>
          ) : (
            <Typography
              sx={{
                fontSize: '0.9rem',
                color: 'rgba(255,255,255,0.3)',
                fontStyle: 'italic',
              }}
            >
              VS
            </Typography>
          )}
        </Box>
        <TeamBlock
          name={match.teamB?.name ?? '?'}
          isWinner={teamBWon}
          align="right"
        />
      </Box>

      {/* Date + point d'état */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography color="rgba(255,255,255,0.35)" fontSize="0.75rem">
          {formatMatchDateTime(match.dateTime)}
        </Typography>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: getStateColor(match.state),
          }}
        />
      </Box>
    </Paper>
  );
};

// ── Sous-composants ──────────────────────────────────────────────────

const TeamBlock: React.FC<{
  name: string;
  isWinner: boolean;
  align: 'left' | 'right';
}> = ({ name, isWinner, align }) => (
  <Box
    sx={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      gap: 0.5,
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
    }}
  >
    {isWinner && align === 'left' && (
      <EmojiEventsIcon sx={{ fontSize: 14, color: '#e8b84b' }} />
    )}
    <Typography
      sx={{
        fontWeight: isWinner ? 'bold' : 500,
        color: isWinner ? '#e8b84b' : '#fff',
        fontSize: '0.92rem',
      }}
    >
      {name}
    </Typography>
    {isWinner && align === 'right' && (
      <EmojiEventsIcon sx={{ fontSize: 14, color: '#e8b84b' }} />
    )}
  </Box>
);

export default PersonalMatchesSection;
