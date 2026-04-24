import React from 'react';
import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { MatchBracket } from '../../../../types/match.types';
import { useTournamentBracket } from '../../../../hooks/useMatch/useTournamentBracket';
import {
  CARD_HEIGHT,
  CARD_WIDTH,
  ROUND_GAP,
  computeBracketHeight,
  computeBracketWidth,
  simplifyRoundLabel,
} from '../../../../utils/match/bracket.utils';
import { tournamentBracketStyles as s } from '../../../../styles/match/tournamentBracket.styles';

type Props = {
  tournamentId: number;
  onMatchClick?: (matchId: number) => void;
  isResponsible?: boolean;
};

type BracketMatchCardProps = {
  match: MatchBracket;
  onClick?: () => void;
  isFinal?: boolean;
};

type TeamSlotProps = {
  name: string | null;
  score: number | null;
  isWinner: boolean;
  isLoser: boolean;
  isForfeit?: boolean;
  isFinal?: boolean;
};

const TournamentBracket: React.FC<Props> = ({ tournamentId, onMatchClick }) => {
  const { matches, bracket, loading, error } =
    useTournamentBracket(tournamentId);

  if (loading) {
    return (
      <Box sx={s.loadingBox}>
        <CircularProgress sx={{ color: '#ffffff' }} />
      </Box>
    );
  }

  if (error) {
    return <Typography sx={s.errorText}>{error}</Typography>;
  }

  if (matches.length === 0) {
    return (
      <Typography sx={s.emptyText}>
        Le planning n&apos;a pas encore ete publie.
      </Typography>
    );
  }

  const { rounds, positions, matchById } = bracket;
  const totalWidth = computeBracketWidth(rounds.length);
  const totalHeight = computeBracketHeight(matches, positions);

  return (
    <Box sx={s.outerScroll}>
      <Box sx={{ minWidth: totalWidth }}>
        {/* ligne des noms de tours en haut du bracket */}
        <Box sx={{ display: 'flex', gap: `${ROUND_GAP}px`, mb: 2 }}>
          {rounds.map((roundMatches, rIdx) => (
            <Box key={rIdx} sx={{ width: CARD_WIDTH }}>
              <Typography sx={s.roundLabel}>
                {simplifyRoundLabel(roundMatches[0]?.roundLabel, rIdx)}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* zone principale: svg pour les lignes + cartes positionnees en absolu */}
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
              // pas de ligne a tracer pour le dernier tour
              if (rIdx === rounds.length - 1) return null;

              return roundMatches.map((match) => {
                if (!match.nextMatchId) return null;
                const nextMatch = matchById.get(match.nextMatchId);
                if (!nextMatch) return null;

                // calcule les points de depart et d'arrivee de la courbe bezier
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
                    // ligne pleine si le match est termine, pointillee sinon
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

const BracketMatchCard: React.FC<BracketMatchCardProps> = ({
  match,
  onClick,
  isFinal = false,
}) => {
  const scorePublic = match.scoreA !== null && match.scoreB !== null;
  const isClickable = !!onClick;
  const isForfeit = match.state === 'FORFEIT';

  return (
    <Paper
      elevation={0}
      onClick={isClickable ? onClick : undefined}
      sx={s.bracketCard(isClickable)}
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

      {/* separateur visuel entre les deux equipes */}
      <Box sx={s.dividerLine} />

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

const TeamSlot: React.FC<TeamSlotProps> = ({
  name,
  score,
  isWinner,
  isLoser,
  isForfeit,
  isFinal = false,
}) => {
  const isTbd = !name;

  return (
    <Box sx={s.teamSlotRow}>
      {/* barre laterale coloree pour indiquer victoire ou defaite */}
      <Box sx={s.teamSlotBar(isWinner, isLoser)} />

      <Box sx={s.teamSlotContent}>
        <Typography noWrap sx={s.teamName(isTbd)}>
          {name ?? 'TBD'}
        </Typography>

        <Box sx={s.scoreBox}>
          {score !== null ? (
            <Typography sx={s.scoreValue(isFinal, isWinner)}>
              {score}
            </Typography>
          ) : isForfeit ? (
            <Typography sx={s.forfeitLabel}>FF</Typography>
          ) : (
            <Typography sx={s.scoreDash}>-</Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TournamentBracket;
