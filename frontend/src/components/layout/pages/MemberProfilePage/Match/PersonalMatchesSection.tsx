import React from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsIcon from '@mui/icons-material/Sports';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { MatchDetail } from '../../../../../types/match.types';
import { usePersonalMatches } from '../../../../../hooks/useMatch/usePersonalMatches';
import {
  formatMatchDateTime,
  getStateColor,
} from '../../../../../utils/match/match.utils';

type Props = {
  token: string;
  onMatchClick: (match: MatchDetail) => void;
};

const PersonalMatchesSection: React.FC<Props> = ({ token, onMatchClick }) => {
  const { upcoming, past, loading, error } = usePersonalMatches(token);

  const lastMatch = past.length > 0 ? past[0] : null;
  const nextMatch = upcoming.length > 0 ? upcoming[0] : null;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: '#e8b84b' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography sx={{ color: '#e74c3c', textAlign: 'center', py: 3 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      {/* ── Dernier match joué ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography sx={s.colLabel}>
          <SportsIcon sx={{ fontSize: 14, mr: 0.5 }} />
          Dernier match
        </Typography>

        {lastMatch ? (
          <MatchCard
            match={lastMatch}
            onClick={() => onMatchClick(lastMatch)}
          />
        ) : (
          <EmptyCard message="Aucun match disputé." />
        )}
      </Box>

      {/* ── Prochain match ── */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography sx={s.colLabel}>
          <HourglassEmptyIcon sx={{ fontSize: 14, mr: 0.5 }} />
          Prochain match
        </Typography>

        {nextMatch ? (
          <MatchCard
            match={nextMatch}
            onClick={() => onMatchClick(nextMatch)}
          />
        ) : (
          <EmptyCard message="Aucun match à venir." />
        )}
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
    <Paper elevation={3} onClick={onClick} sx={s.card}>
      {/* Tournoi + round */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography
          color="rgba(255,255,255,0.4)"
          fontSize="0.72rem"
          noWrap
          sx={{ maxWidth: '60%' }}
        >
          {match.tournamentName}
        </Typography>
        <Typography color="#e8b84b" fontSize="0.72rem" fontWeight="bold">
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
        <Box sx={s.scoreCenter}>
          {scorePublic ? (
            <>
              <Typography
                sx={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: teamAWon ? '#2ecc71' : '#e74c3c',
                  minWidth: 24,
                  textAlign: 'center',
                }}
              >
                {match.scoreA}
              </Typography>
              <Typography
                sx={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.3)' }}
              >
                –
              </Typography>
              <Typography
                sx={{
                  fontSize: '1.4rem',
                  fontWeight: 800,
                  color: teamBWon ? '#2ecc71' : '#e74c3c',
                  minWidth: 24,
                  textAlign: 'center',
                }}
              >
                {match.scoreB}
              </Typography>
            </>
          ) : (
            <Typography
              sx={{
                fontSize: '0.82rem',
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

      {/* Date + dot état */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography color="rgba(255,255,255,0.35)" fontSize="0.72rem">
          {formatMatchDateTime(match.dateTime)}
        </Typography>
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            backgroundColor: getStateColor(match.state),
          }}
        />
      </Box>
    </Paper>
  );
};

// ── Placeholder quand pas de match ───────────────────────────────────

const EmptyCard: React.FC<{ message: string }> = ({ message }) => (
  <Paper elevation={0} sx={s.emptyCard}>
    <Typography
      sx={{
        color: 'rgba(255,255,255,0.25)',
        fontSize: '0.85rem',
        fontStyle: 'italic',
        textAlign: 'center',
      }}
    >
      {message}
    </Typography>
  </Paper>
);

// ── TeamBlock ────────────────────────────────────────────────────────

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
      <EmojiEventsIcon sx={{ fontSize: 13, color: '#e8b84b' }} />
    )}
    <Typography
      sx={{
        fontWeight: isWinner ? 'bold' : 500,
        color: isWinner ? '#e8b84b' : '#fff',
        fontSize: '0.85rem',
      }}
      noWrap
    >
      {name}
    </Typography>
    {isWinner && align === 'right' && (
      <EmojiEventsIcon sx={{ fontSize: 13, color: '#e8b84b' }} />
    )}
  </Box>
);

// ── Styles ───────────────────────────────────────────────────────────

const s = {
  colLabel: {
    display: 'flex',
    alignItems: 'center',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.72rem',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    mb: 0.5,
  },
  card: {
    borderRadius: '10px',
    px: 2,
    py: 1.5,
    backgroundColor: '#243060',
    cursor: 'pointer',
    border: '1px solid rgba(255,255,255,0.06)',
    transition: 'all 0.15s',
    '&:hover': {
      backgroundColor: '#2d3c75',
      borderColor: 'rgba(255,255,255,0.15)',
    },
  },
  scoreCenter: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    minWidth: 70,
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: '10px',
    px: 2,
    py: 3,
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px dashed rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
};

export default PersonalMatchesSection;
