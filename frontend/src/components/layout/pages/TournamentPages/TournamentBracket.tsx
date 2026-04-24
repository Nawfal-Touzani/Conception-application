import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import { MatchBracket } from '../../../../types/match.types';
import * as matchService from '../../../../services/match/match.service';
import { useAuth } from '../../../../contexts/useAuth';

type Props = {
  tournamentId: number;
  onMatchClick?: (matchId: number) => void;
  isResponsible?: boolean;
};

const CARD_HEIGHT = 84;
const CARD_WIDTH = 230;
const ROUND_GAP = 72;
const TOP_OFFSET = 8;
const ROW_GAP = 24;
const SLOT_HEIGHT = CARD_HEIGHT + ROW_GAP;

const TournamentBracket: React.FC<Props> = ({ tournamentId, onMatchClick }) => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const [matches, setMatches] = useState<MatchBracket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    matchService
      .getBracketByTournament(tournamentId, token || undefined)
      .then(setMatches)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [tournamentId, token]);

  const bracket = useMemo(() => buildBracketLayout(matches), [matches]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress sx={{ color: '#ffffff' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography sx={{ color: '#ff6b6b', textAlign: 'center', py: 4 }}>
        {error}
      </Typography>
    );
  }

  if (matches.length === 0) {
    return (
      <Typography
        sx={{
          color: 'rgba(255,255,255,0.45)',
          textAlign: 'center',
          py: 4,
          fontStyle: 'italic',
        }}
      >
        Le planning n&apos;a pas encore été publié.
      </Typography>
    );
  }

  const { rounds, positions, matchById } = bracket;
  const totalWidth = rounds.length * (CARD_WIDTH + ROUND_GAP) - ROUND_GAP;
  const totalHeight =
    Math.max(
      ...matches.map((m) => (positions.get(m.id) ?? 0) + CARD_HEIGHT),
      300,
    ) +
    TOP_OFFSET * 2;

  return (
    <Box
      sx={{
        overflowX: 'auto',
        overflowY: 'hidden',
        pb: 2,
        borderRadius: '10px',
      }}
    >
      <Box sx={{ minWidth: totalWidth }}>
        <Box
          sx={{
            display: 'flex',
            gap: `${ROUND_GAP}px`,
            mb: 2,
          }}
        >
          {rounds.map((roundMatches, rIdx) => (
            <Box key={rIdx} sx={{ width: CARD_WIDTH }}>
              <Typography
                sx={{
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '1.6rem',
                  lineHeight: 1.1,
                  py: 5,
                  textAlign: 'center',
                }}
              >
                {simplifyRoundLabel(roundMatches[0]?.roundLabel, rIdx)}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            position: 'relative',
            width: totalWidth,
            height: totalHeight,
          }}
        >
          <svg
            width={totalWidth}
            height={totalHeight}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            {rounds.map((roundMatches, rIdx) => {
              if (rIdx === rounds.length - 1) return null;

              return roundMatches.map((match) => {
                if (!match.nextMatchId) return null;
                const nextMatch = matchById.get(match.nextMatchId);
                if (!nextMatch) return null;

                const x1 = rIdx * (CARD_WIDTH + ROUND_GAP) + CARD_WIDTH;
                const y1 = (positions.get(match.id) ?? 0) + CARD_HEIGHT / 2;
                const x2 = (rIdx + 1) * (CARD_WIDTH + ROUND_GAP);
                const y2 = (positions.get(nextMatch.id) ?? 0) + CARD_HEIGHT / 2;
                const mx = (x1 + x2) / 2;

                return (
                  <path
                    key={`${match.id}-${nextMatch.id}`}
                    d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="rgba(255,255,255,0.88)"
                    strokeWidth="2"
                    strokeDasharray={match.winnerId ? '0' : '5 4'}
                    strokeLinecap="round"
                  />
                );
              });
            })}
          </svg>

          {rounds.map((roundMatches, rIdx) =>
            roundMatches.map((match) => {
              const x = rIdx * (CARD_WIDTH + ROUND_GAP);
              const y = positions.get(match.id) ?? 0;
              const isFinal = rIdx === rounds.length - 1;

              return (
                <Box
                  key={match.id}
                  sx={{
                    position: 'absolute',
                    left: x,
                    top: y,
                    width: CARD_WIDTH,
                  }}
                >
                  <BracketMatchCard
                    match={match}
                    isFinal={isFinal}
                    onClick={
                      onMatchClick ? () => onMatchClick(match.id) : undefined
                    }
                  />
                </Box>
              );
            }),
          )}
        </Box>
      </Box>
    </Box>
  );
};

const BracketMatchCard: React.FC<{
  match: MatchBracket;
  onClick?: () => void;
  isFinal?: boolean;
}> = ({ match, onClick, isFinal = false }) => {
  const scorePublic = match.scoreA !== null && match.scoreB !== null;
  const isClickable = !!onClick;
  const isForfeit = match.state === 'FORFEIT';

  return (
    <Paper
      elevation={0}
      onClick={isClickable ? onClick : undefined}
      sx={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        backgroundColor: '#1f2c4b',
        borderRadius: '2px',
        border: '2px solid #ffffff',
        overflow: 'hidden',
        transition: 'transform 140ms ease, opacity 140ms ease',
        cursor: isClickable ? 'pointer' : 'default',
        ...(isClickable && {
          '&:hover': {
            transform: 'scale(1.015)',
          },
        }),
      }}
    >
      <TeamSlot
        name={match.teamA?.name ?? null}
        score={scorePublic ? match.scoreA : null}
        isWinner={match.winnerId === match.teamA?.id}
        isLoser={
          scorePublic &&
          !!match.teamA?.id &&
          match.winnerId !== null &&
          match.winnerId !== match.teamA.id
        }
        isForfeit={isForfeit}
        isFinal={isFinal}
      />

      <Box
        sx={{
          height: '2px',
          backgroundColor: '#ffffff',
        }}
      />

      <TeamSlot
        name={match.teamB?.name ?? null}
        score={scorePublic ? match.scoreB : null}
        isWinner={match.winnerId === match.teamB?.id}
        isLoser={
          scorePublic &&
          !!match.teamB?.id &&
          match.winnerId !== null &&
          match.winnerId !== match.teamB.id
        }
        isForfeit={isForfeit}
        isFinal={isFinal}
      />
    </Paper>
  );
};

const TeamSlot: React.FC<{
  name: string | null;
  score: number | null;
  isWinner: boolean;
  isLoser: boolean;
  isForfeit?: boolean;
  isFinal?: boolean;
}> = ({ name, score, isWinner, isLoser, isForfeit, isFinal = false }) => {
  const isTbd = !name;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        height: (CARD_HEIGHT - 2) / 2,
        backgroundColor: '#1f2c4b',
      }}
    >
      <Box
        sx={{
          width: 8,
          backgroundColor: isWinner
            ? '#18c964'
            : isLoser
              ? '#e5484d'
              : 'transparent',
          flexShrink: 0,
        }}
      />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          minWidth: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.86rem',
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: isTbd ? 'rgba(255,255,255,0.38)' : '#ffffff',
          }}
        >
          {name ?? 'TBD'}
        </Typography>

        <Box
          sx={{
            minWidth: 36,
            textAlign: 'right',
            ml: 1,
            flexShrink: 0,
          }}
        >
          {score !== null ? (
            <Typography
              sx={{
                fontSize: '0.95rem',
                fontWeight: 900,
                color: isFinal && isWinner ? '#d6b36a' : '#ffffff',
              }}
            >
              {score}
            </Typography>
          ) : isForfeit ? (
            <Typography
              sx={{
                fontSize: '0.72rem',
                fontWeight: 800,
                color: '#ff6b6b',
              }}
            >
              FF
            </Typography>
          ) : (
            <Typography
              sx={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              -
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

function simplifyRoundLabel(label?: string, roundIndex?: number): string {
  if (!label) {
    return `Tour ${typeof roundIndex === 'number' ? roundIndex + 1 : ''}`;
  }

  const normalized = label.toLowerCase();

  if (normalized.includes('huit')) return 'Huitièmes';
  if (normalized.includes('quart')) return 'Quarts';
  if (normalized.includes('demi')) return 'Demi-finales';
  if (normalized.includes('final')) return 'Finale';

  return label;
}

function buildBracketLayout(matches: MatchBracket[]) {
  const matchById = new Map(matches.map((m) => [m.id, m]));

  const roundsByNumber = new Map<number, MatchBracket[]>();
  for (const match of matches) {
    if (!roundsByNumber.has(match.roundNumber)) {
      roundsByNumber.set(match.roundNumber, []);
    }
    roundsByNumber.get(match.roundNumber)!.push(match);
  }

  const sortedRoundNumbers = [...roundsByNumber.keys()].sort((a, b) => a - b);
  const rounds = sortedRoundNumbers.map((roundNumber) => [
    ...(roundsByNumber.get(roundNumber) ?? []),
  ]);

  const positions = new Map<number, number>();
  const orderScores = new Map<number, number>();

  const firstRound = rounds[0] ?? [];
  firstRound.forEach((match, index) => {
    positions.set(match.id, TOP_OFFSET + index * SLOT_HEIGHT);
    orderScores.set(match.id, index);
  });

  for (let rIdx = 1; rIdx < rounds.length; rIdx++) {
    const prevRound = rounds[rIdx - 1];
    const currentRound = rounds[rIdx];

    const childrenByParent = new Map<number, MatchBracket[]>();

    prevRound.forEach((child) => {
      if (!child.nextMatchId) return;
      const children = childrenByParent.get(child.nextMatchId) ?? [];
      children.push(child);
      childrenByParent.set(child.nextMatchId, children);
    });

    currentRound.sort((a, b) => {
      const aChildren = childrenByParent.get(a.id) ?? [];
      const bChildren = childrenByParent.get(b.id) ?? [];

      const aAvg =
        aChildren.length > 0
          ? average(aChildren.map((child) => orderScores.get(child.id) ?? 0))
          : Number.MAX_SAFE_INTEGER;

      const bAvg =
        bChildren.length > 0
          ? average(bChildren.map((child) => orderScores.get(child.id) ?? 0))
          : Number.MAX_SAFE_INTEGER;

      return aAvg - bAvg || a.id - b.id;
    });

    currentRound.forEach((match, index) => {
      const children = childrenByParent.get(match.id) ?? [];

      if (children.length > 0) {
        const childCenters = children.map(
          (child) => (positions.get(child.id) ?? 0) + CARD_HEIGHT / 2,
        );
        const centerY = average(childCenters);
        positions.set(match.id, centerY - CARD_HEIGHT / 2);
        orderScores.set(
          match.id,
          average(children.map((child) => orderScores.get(child.id) ?? index)),
        );
      } else {
        positions.set(match.id, TOP_OFFSET + index * SLOT_HEIGHT);
        orderScores.set(match.id, index);
      }
    });
  }

  for (let rIdx = 1; rIdx < rounds.length; rIdx++) {
    rounds[rIdx].sort((a, b) => {
      const ay = positions.get(a.id) ?? 0;
      const by = positions.get(b.id) ?? 0;
      return ay - by || a.id - b.id;
    });
  }

  return { rounds, positions, matchById };
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export default TournamentBracket;
