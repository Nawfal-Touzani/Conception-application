import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { MatchBracket } from '../../../../types/match.types';
import * as matchService from '../../../../services/match/match.service';
import { useAuth } from '../../../../contexts/useAuth';

type Props = {
  tournamentId: number;
  onMatchClick?: (matchId: number) => void;
  isResponsible?: boolean;
};

const TournamentBracket: React.FC<Props> = ({
  tournamentId,
  onMatchClick,
  isResponsible = false,
}) => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const [matches, setMatches] = useState<MatchBracket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    matchService
      .getBracketByTournament(tournamentId, token || undefined)
      .then(setMatches)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tournamentId, token]);

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: '#e8b84b' }} />
      </Box>
    );

  if (error)
    return (
      <Typography sx={{ color: '#e74c3c', textAlign: 'center', py: 4 }}>
        {error}
      </Typography>
    );

  if (matches.length === 0)
    return (
      <Typography
        sx={{
          color: 'rgba(255,255,255,0.35)',
          textAlign: 'center',
          py: 4,
          fontStyle: 'italic',
        }}
      >
        Le planning n'a pas encore été publié.
      </Typography>
    );

  const rounds = groupByRound(matches);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '32px',
        overflowX: 'auto',
        pb: 2,
        alignItems: 'stretch',
        minHeight: 200,
      }}
    >
      {rounds.map((roundMatches, rIdx) => (
        <Box
          key={rIdx}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 180,
            gap: 1.5,
          }}
        >
          {/* Label du round */}
          <Typography
            sx={{
              color: '#e8b84b',
              fontWeight: 'bold',
              fontSize: '0.72rem',
              textTransform: 'uppercase',
              letterSpacing: 1,
              mb: 0.5,
            }}
          >
            {roundMatches[0]?.roundLabel ?? `Tour ${rIdx + 1}`}
          </Typography>

          {/* Matchs du round */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: `${Math.pow(2, rIdx) * 48}px`,
              justifyContent: 'center',
              flex: 1,
            }}
          >
            {roundMatches.map((match) => (
              <BracketMatchCard
                key={match.id}
                match={match}
                isResponsible={isResponsible}
                onClick={
                  onMatchClick ? () => onMatchClick(match.id) : undefined
                }
              />
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// Bracket match card
const BracketMatchCard: React.FC<{
  match: MatchBracket;
  onClick?: () => void;
  isResponsible?: boolean;
}> = ({ match, onClick }) => {
  const scorePublic = match.scoreA !== null && match.scoreB !== null;

  const isClickable = !!onClick;

  return (
    <Paper
      elevation={3}
      onClick={isClickable ? onClick : undefined}
      sx={{
        width: 178,
        backgroundColor: '#243060',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        transition: 'all 0.15s',
        cursor: isClickable ? 'pointer' : 'default',
        '&:hover': isClickable
          ? { borderColor: 'rgba(255,255,255,0.3)', backgroundColor: '#2d3c75' }
          : {},
      }}
    >
      <TeamSlot
        name={match.teamA?.name ?? null}
        score={scorePublic ? match.scoreA : null}
        isWinner={match.winnerId === match.teamA?.id}
      />
      <Box sx={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }} />
      <TeamSlot
        name={match.teamB?.name ?? null}
        score={scorePublic ? match.scoreB : null}
        isWinner={match.winnerId === match.teamB?.id}
      />
    </Paper>
  );
};

// ── Team slot ────────────────────────────────────────────────────────

const TeamSlot: React.FC<{
  name: string | null;
  score: number | null;
  isWinner: boolean;
}> = ({ name, score, isWinner }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 1.5,
      py: 0.9,
    }}
  >
    <Typography
      sx={{
        fontSize: '0.88rem',
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        color: isWinner ? '#e8b84b' : name ? '#fff' : 'rgba(255,255,255,0.25)',
        fontWeight: isWinner ? 'bold' : 500,
      }}
    >
      {name ?? 'TBD'}
    </Typography>
    {score !== null && (
      <Typography
        sx={{
          fontSize: '0.88rem',
          fontWeight: 'bold',
          color: isWinner ? '#2ecc71' : '#e74c3c',
          minWidth: 18,
          textAlign: 'right',
        }}
      >
        {score}
      </Typography>
    )}
  </Box>
);

// ── Helper ───────────────────────────────────────────────────────────

function groupByRound(matches: MatchBracket[]): MatchBracket[][] {
  const byRound = new Map<number, MatchBracket[]>();
  for (const m of matches) {
    if (!byRound.has(m.roundNumber)) byRound.set(m.roundNumber, []);
    byRound.get(m.roundNumber)!.push(m);
  }
  return [...byRound.entries()].sort(([a], [b]) => a - b).map(([, ms]) => ms);
}

export default TournamentBracket;
