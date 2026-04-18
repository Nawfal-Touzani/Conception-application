import React from 'react';
import { Box, Typography } from '@mui/material';
// BracketSVG.tsx
const TEAM_W = 160;
const TEAM_H = 28;
const TEAM_GAP = 6;
const MATCH_H = TEAM_H * 2 + TEAM_GAP;
const COL_GAP = 60;
const ROW_GAP = 20;

export const BRACKET_TEAM_W = TEAM_W;
export const BRACKET_COL_GAP = COL_GAP;

type Match = { team1: string; team2: string };
type Round = Match[];

/** Noms des rounds selon le nombre total de rounds */
export function getRoundLabel(roundIndex: number, totalRounds: number): string {
  const fromEnd = totalRounds - 1 - roundIndex;
  if (fromEnd === 0) return 'Finale';
  if (fromEnd === 1) return 'Demi-finale';
  if (fromEnd === 2) return 'Quarts';
  if (fromEnd === 3) return '8èmes';
  if (fromEnd === 4) return '16èmes';
  return `Round ${roundIndex + 1}`;
}

/**
 * Construit un bracket vide (tous TBD) selon le nombre d'équipes.
 * Gère les byes pour les puissances de 2 non entières.
 * ex: 11 équipes → 8èmes avec 3 matchs réels + 5 byes, puis quarts etc.
 */
export function buildDefaultBracket(teamCount: number): Round[] {
  // Trouver la prochaine puissance de 2
  let slots = 1;
  while (slots < teamCount) slots *= 2;

  const totalRounds = Math.log2(slots);
  const rounds: Round[] = [];

  // Round 0 : slots/2 matchs, avec des byes pour les équipes en avance
  const firstRoundMatches = slots / 2;
  const byeCount = slots - teamCount; // équipes qui passent direct
  const actualFirstRound = firstRoundMatches - byeCount;

  const r0: Match[] = [];
  for (let i = 0; i < firstRoundMatches; i++) {
    if (i < actualFirstRound) {
      r0.push({ team1: '?', team2: '?' }); // match réel
    } else {
      r0.push({ team1: 'BYE', team2: '' }); // bye — une seule équipe
    }
  }
  rounds.push(r0);

  // Rounds suivants : toujours slots/2^r matchs, tous TBD
  for (let r = 1; r < totalRounds; r++) {
    const matchCount = slots / Math.pow(2, r + 1);
    rounds.push(
      Array.from({ length: matchCount }, () => ({ team1: '?', team2: '?' })),
    );
  }

  return rounds;
}

function calcAllCenters(rounds: Round[]): number[][] {
  if (rounds.length === 0) return [];

  const r0Centers = rounds[0].map(
    (_, i) => i * (MATCH_H + ROW_GAP) + MATCH_H / 2,
  );
  const allCenters: number[][] = [r0Centers];

  for (let r = 1; r < rounds.length; r++) {
    const prev = allCenters[r - 1];
    const currCount = rounds[r].length;
    const curr: number[] = [];
    let pi = 0;

    for (let i = 0; i < currCount; i++) {
      if (pi + 1 < prev.length) {
        // Deux sources → milieu entre les deux
        curr.push((prev[pi] + prev[pi + 1]) / 2);
        pi += 2;
      } else if (pi < prev.length) {
        // Une seule source (match impair ou bye) → même position
        curr.push(prev[pi]);
        pi += 1;
      } else {
        // Bye team injectée (pas de source dans le round précédent)
        // On place après le dernier centre calculé
        const lastCenter = curr[curr.length - 1] ?? 0;
        curr.push(lastCenter + MATCH_H + ROW_GAP);
      }
    }
    allCenters.push(curr);
  }

  return allCenters;
}

function MatchBox({
  x,
  y,
  team1,
  team2,
}: {
  x: number;
  y: number;
  team1: string;
  team2: string;
}) {
  const isBye = team1 === 'BYE';
  const isTBD1 = !team1 || team1 === '?' || team1 === 'BYE';
  const isTBD2 = !team2 || team2 === '?';

  const fill1 = isTBD1 ? '#1a2744' : '#1f3068';
  const fill2 = isTBD2 ? '#1a2744' : '#1f3068';
  const stroke1 = isTBD1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)';
  const stroke2 = isTBD2 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.4)';
  const text1 = isTBD1 ? 'rgba(255,255,255,0.2)' : '#fff';
  const text2 = isTBD2 ? 'rgba(255,255,255,0.2)' : '#fff';
  const label1 = isBye ? '—' : isTBD1 ? 'TBD' : team1;
  const label2 = isTBD2 ? 'TBD' : team2;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={TEAM_W}
        height={TEAM_H}
        fill={fill1}
        stroke={stroke1}
        strokeWidth={1.5}
        rx={3}
      />
      <text
        x={x + 8}
        y={y + TEAM_H / 2 + 5}
        fill={text1}
        fontSize={11}
        fontStyle={isTBD1 ? 'italic' : 'normal'}
      >
        {label1}
      </text>

      <line
        x1={x}
        y1={y + TEAM_H + TEAM_GAP / 2}
        x2={x + TEAM_W}
        y2={y + TEAM_H + TEAM_GAP / 2}
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
      />

      <rect
        x={x}
        y={y + TEAM_H + TEAM_GAP}
        width={TEAM_W}
        height={TEAM_H}
        fill={fill2}
        stroke={stroke2}
        strokeWidth={1.5}
        rx={3}
      />
      <text
        x={x + 8}
        y={y + TEAM_H + TEAM_GAP + TEAM_H / 2 + 5}
        fill={text2}
        fontSize={11}
        fontStyle={isTBD2 ? 'italic' : 'normal'}
      >
        {label2}
      </text>
    </g>
  );
}

type Props = { rounds?: Round[]; teamCount?: number };

const BracketSVG = ({ rounds, teamCount }: Props) => {
  // Si pas de rounds réels, construire un bracket vide par défaut
  const displayRounds: Round[] =
    rounds && rounds.length > 0 ? rounds : buildDefaultBracket(teamCount ?? 8);

  const allCenters = calcAllCenters(displayRounds);
  const round0Count = displayRounds[0].length;
  const totalRounds = displayRounds.length;

  const svgH =
    round0Count * MATCH_H + Math.max(0, round0Count - 1) * ROW_GAP + 30;
  const svgW = totalRounds * TEAM_W + (totalRounds - 1) * COL_GAP;

  return (
    <Box>
      {/* Headers dynamiques */}
      <Box sx={{ display: 'flex', mb: 2 }}>
        {displayRounds.map((_, rIdx) => (
          <React.Fragment key={rIdx}>
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.1rem',
                width: TEAM_W,
                textAlign: 'center',
              }}
            >
              {getRoundLabel(rIdx, totalRounds)}
            </Typography>
            {rIdx < totalRounds - 1 && <Box sx={{ width: COL_GAP }} />}
          </React.Fragment>
        ))}
      </Box>

      <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
        {displayRounds.map((round, rIdx) => {
          const colX = rIdx * (TEAM_W + COL_GAP);
          const centers = allCenters[rIdx];

          return (
            <g key={rIdx}>
              {round.map((match, mIdx) => (
                <MatchBox
                  key={mIdx}
                  x={colX}
                  y={centers[mIdx] - MATCH_H / 2}
                  team1={match.team1}
                  team2={match.team2}
                />
              ))}

              {rIdx < totalRounds - 1 &&
                (() => {
                  const nextCenters = allCenters[rIdx + 1];
                  const nextColX = colX + TEAM_W + COL_GAP;
                  const midX = colX + TEAM_W + COL_GAP / 2;
                  const lines: React.ReactNode[] = [];
                  let pi = 0;

                  // Dans la boucle des connecteurs, remplace tout par ça :
                  for (let nIdx = 0; nIdx < nextCenters.length; nIdx++) {
                    const nCY = nextCenters[nIdx];

                    if (pi + 1 < centers.length) {
                      // Deux matchs → connecteur en T normal
                      const cy0 = centers[pi];
                      const cy1 = centers[pi + 1];
                      lines.push(
                        <g
                          key={`conn-${nIdx}`}
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth={1.5}
                          fill="none"
                        >
                          <line
                            x1={colX + TEAM_W}
                            y1={cy0}
                            x2={midX}
                            y2={cy0}
                          />
                          <line
                            x1={colX + TEAM_W}
                            y1={cy1}
                            x2={midX}
                            y2={cy1}
                          />
                          <line x1={midX} y1={cy0} x2={midX} y2={cy1} />
                          <line x1={midX} y1={nCY} x2={nextColX} y2={nCY} />
                        </g>,
                      );
                      pi += 2;
                    } else if (pi < centers.length) {
                      // Un seul match restant → ligne directe vers le quart suivant
                      const cy0 = centers[pi];
                      lines.push(
                        <g
                          key={`conn-${nIdx}`}
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth={1.5}
                          fill="none"
                        >
                          <line
                            x1={colX + TEAM_W}
                            y1={cy0}
                            x2={midX}
                            y2={cy0}
                          />
                          <line x1={midX} y1={cy0} x2={midX} y2={nCY} />
                          <line x1={midX} y1={nCY} x2={nextColX} y2={nCY} />
                        </g>,
                      );
                      pi += 1;
                    }
                  }
                  return lines;
                })()}
            </g>
          );
        })}
      </svg>
    </Box>
  );
};

export default BracketSVG;
