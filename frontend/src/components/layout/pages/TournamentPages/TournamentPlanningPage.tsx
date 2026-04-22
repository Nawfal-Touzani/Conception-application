import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useAuth } from '../../../../contexts/useAuth';
import * as tournamentService from '../../../../services/tournament/tournament.service';
import { TournamentDetails } from '../../../../types/tournament.types';

type Props = { tournamentId: number };
type Match = { team1: string; team2: string };
type Round = Match[];
type Phase = 'draft' | 'confirmed' | 'published';
type TeamPos = { roundIdx: number; matchIdx: number; slot: 0 | 1 };

function shuffleArray(array: string[]): string[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildBracket(teams: string[]): Round[] {
  const rounds: Round[] = [];
  let current = shuffleArray(teams);

  // Round 1 : on apparie les équipes, les impairs passent en bye
  const round1: Match[] = [];
  const nextSlots: string[] = [];

  for (let i = 0; i < current.length; i += 2) {
    if (current[i + 1] === undefined) {
      // bye : passe directement au round suivant
      nextSlots.push(current[i]);
    } else {
      round1.push({ team1: current[i], team2: current[i + 1] });
      nextSlots.push('?');
    }
  }
  rounds.push(round1);
  current = nextSlots;

  // Rounds suivants : tout en "?" sauf les byes connus
  while (current.length > 1) {
    const round: Match[] = [];
    const next: string[] = [];

    for (let i = 0; i < current.length; i += 2) {
      if (current[i + 1] === undefined) {
        next.push(current[i]);
      } else {
        round.push({ team1: current[i], team2: current[i + 1] });
        next.push('?');
      }
    }

    if (round.length > 0) rounds.push(round);
    current = next;
  }

  return rounds;
}

function buildFullBracketFromBackend(
  backendMatches: {
    roundNumber: number;
    teamA: string | null;
    teamB: string | null;
  }[],
  _allTeams: string[],
): Round[] {
  const maxRound = Math.max(...backendMatches.map((m) => m.roundNumber));
  const rounds: Round[] = [];

  for (let r = 1; r <= maxRound; r++) {
    const roundMatches = backendMatches
      .filter((m) => m.roundNumber === r)
      .map((m) => ({ team1: m.teamA ?? '?', team2: m.teamB ?? '?' }));
    rounds.push(roundMatches);
  }

  return rounds;
}

const roundLabels = (total: number, idx: number): string => {
  const remaining = total - idx;
  if (remaining === 1) return 'Finale';
  if (remaining === 2) return 'Demi-finales';
  if (remaining === 3) return 'Quarts de finale';
  return `Tour ${idx + 1}`;
};

function getTeamAt(rounds: Round[], pos: TeamPos): string {
  return pos.slot === 0
    ? rounds[pos.roundIdx][pos.matchIdx].team1
    : rounds[pos.roundIdx][pos.matchIdx].team2;
}

function swapTeams(rounds: Round[], a: TeamPos, b: TeamPos): Round[] {
  const next = rounds.map((r) => r.map((m) => ({ ...m })));
  const tA = getTeamAt(next, a);
  const tB = getTeamAt(next, b);
  if (a.slot === 0) next[a.roundIdx][a.matchIdx].team1 = tB;
  else next[a.roundIdx][a.matchIdx].team2 = tB;
  if (b.slot === 0) next[b.roundIdx][b.matchIdx].team1 = tA;
  else next[b.roundIdx][b.matchIdx].team2 = tA;
  return next;
}

function posEqual(a: TeamPos, b: TeamPos): boolean {
  return (
    a.roundIdx === b.roundIdx && a.matchIdx === b.matchIdx && a.slot === b.slot
  );
}

const TournamentPlanningPage = ({ tournamentId }: Props) => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [teams, setTeams] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>('draft');
  const [confirmedRounds, setConfirmedRounds] = useState<Round[]>([]);
  const [selected, setSelected] = useState<TeamPos | null>(null);
  const [message, setMessage] = useState<{
    text: string;
    type: 'success' | 'warn' | '';
  }>({ text: '', type: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPubOverlay, setShowPubOverlay] = useState(false);

  useEffect(() => {
    tournamentService.getTournamentById(token, tournamentId).then((t) => {
      setTournament(t);
      const teamNames = t.registeredTeamNames ?? [];
      setTeams(teamNames);

      fetch(`http://localhost:3000/tournaments/${tournamentId}/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then(
          (
            matches: {
              roundNumber: number;
              teamA: string | null;
              teamB: string | null;
            }[],
          ) => {
            if (matches.length === 0) {
              setRounds(buildBracket(teamNames));
              setPhase('draft');
            } else {
              const full = buildFullBracketFromBackend(matches, teamNames);
              setRounds(full);
              setConfirmedRounds(full);
              setPhase('confirmed');
            }
          },
        )
        .catch(() => {
          setRounds(buildBracket(teamNames));
          setPhase('draft');
        });
    });
  }, [tournamentId, token]);

 const callPlanningApi = async (p: Phase) => {
  const res = await fetch(
    `http://localhost:3000/tournaments/${tournamentId}/planning`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        phase: p,
        rounds: rounds.map((round) => ({         
          matches: round.map((m) => ({
            team1: m.team1,
            team2: m.team2,
          })),
        })),
      }),
    },
  );
  if (!res.ok) throw new Error('API error');
};

  const handleTeamClick = (pos: TeamPos) => {
    if (phase !== 'draft') return;
    const teamName = getTeamAt(rounds, pos);
    if (teamName === '?') return;

    if (!selected) {
      setSelected(pos);
    } else if (posEqual(selected, pos)) {
      setSelected(null);
    } else {
      const bothRound0 = selected.roundIdx === 0 && pos.roundIdx === 0;
      const byeSwap =
        (selected.roundIdx === 1 && pos.roundIdx === 0) ||
        (selected.roundIdx === 0 && pos.roundIdx === 1);
      if (bothRound0 || byeSwap) {
        setRounds(swapTeams(rounds, selected, pos));
      }
      setSelected(null);
    }
  };

  const doConfirm = async () => {
    try {
      await callPlanningApi('confirmed');
      setConfirmedRounds(rounds);
      setSelected(null);
      setPhase('confirmed');
      setMessage({ text: 'Planning confirmé !', type: 'success' });
    } catch {
      setMessage({ text: 'Erreur lors de la confirmation.', type: 'warn' });
    }
  };

  const doReset = () => {
    setRounds(buildBracket(teams));
    setConfirmedRounds([]);
    setSelected(null);
    setPhase('draft');
  };

  const doDraft = () => {
    setRounds(confirmedRounds);
    setPhase('draft');
    setSelected(null);
  };

  const confirmPublish = async () => {
    try {
      await callPlanningApi('published');
      setShowConfirmModal(false);
      setPhase('published');
      setMessage({ text: '', type: '' });
      setTimeout(() => setShowPubOverlay(true), 300);
    } catch {
      setMessage({ text: 'Erreur lors de la publication.', type: 'warn' });
    }
  };

  if (!tournament) {
    return (
      <Box sx={{ color: '#fff', textAlign: 'center', pt: 8 }}>
        Chargement...
      </Box>
    );
  }

  const badge =
    phase === 'published'
      ? {
          label: 'Publié — verrouillé',
          bg: 'rgba(231,76,60,0.2)',
          color: '#e74c3c',
        }
      : phase === 'confirmed'
        ? { label: 'Confirmé', bg: 'rgba(46,204,113,0.2)', color: '#2ecc71' }
        : {
            label: 'Brouillon',
            bg: 'rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.55)',
          };

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
        px: 2,
        pb: 6,
      }}
    >
      <Typography
        sx={{
          color: '#fff',
          fontWeight: 700,
          fontSize: '1.3rem',
          mb: 1,
          textAlign: 'center',
        }}
      >
        Gestion du planning — {tournament.name}
      </Typography>

      <Box
        sx={{
          fontSize: '0.78rem',
          mb: 3,
          px: 2,
          py: '5px',
          borderRadius: '20px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          background: badge.bg,
          color: badge.color,
          transition: 'all 0.3s',
        }}
      >
        {badge.label}
      </Box>

      {rounds.length === 0 ? (
        <Typography sx={{ color: 'rgba(255,255,255,0.6)' }}>
          Aucune équipe inscrite pour générer le bracket.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            alignItems: 'center',
            overflowX: 'auto',
            pb: 1,
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {rounds.map((round, rIdx) => (
            <Box
              key={rIdx}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: 170,
              }}
            >
              <Typography
                sx={{
                  color: '#e8b84b',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  mb: 1.5,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {roundLabels(rounds.length, rIdx)}
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${Math.pow(2, rIdx) * 10}px`,
                }}
              >
                {round.map((match, mIdx) => (
                  <Box
                    key={mIdx}
                    sx={{
                      backgroundColor: '#243060',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.1)',
                      width: 170,
                    }}
                  >
                    {([match.team1, match.team2] as const).map((team, tIdx) => {
                      const pos: TeamPos = {
                        roundIdx: rIdx,
                        matchIdx: mIdx,
                        slot: tIdx as 0 | 1,
                      };
                      const isSelected =
                        selected !== null && posEqual(selected, pos);
                      const isTBD = team === '?';
                      const isByeTeam = rIdx === 1 && !isTBD;
                      const isSwappable =
                        phase === 'draft' &&
                        (rIdx === 0 || isByeTeam) &&
                        !isTBD;
                      return (
                        <Box key={tIdx}>
                          <Box
                            onClick={() => handleTeamClick(pos)}
                            sx={{
                              px: 1.5,
                              py: 0.9,
                              color: isTBD
                                ? 'rgba(255,255,255,0.25)'
                                : isSelected
                                  ? '#e8b84b'
                                  : isByeTeam
                                    ? '#e8b84b'
                                    : '#fff',
                              fontWeight: isSelected || isByeTeam ? 700 : 500,
                              cursor: isSwappable ? 'pointer' : 'default',
                              transition: 'all 0.15s',
                              '&:hover': isSwappable
                                ? { backgroundColor: 'rgba(255,255,255,0.08)' }
                                : {},
                            }}
                          >
                            <Typography
                              sx={{
                                color: isTBD
                                  ? 'rgba(255,255,255,0.25)'
                                  : isSelected
                                    ? '#e8b84b'
                                    : '#fff',
                                fontWeight: isSelected ? 700 : 500,
                              }}
                            >
                              {isTBD ? 'TBD' : team}
                            </Typography>
                          </Box>
                          {tIdx === 0 && (
                            <Box
                              sx={{
                                height: '1px',
                                backgroundColor: 'rgba(255,255,255,0.1)',
                              }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 1.25,
          mt: 3.5,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {phase === 'draft' && (
          <>
            <Button
              variant="contained"
              disabled={rounds.length === 0}
              onClick={doConfirm}
              sx={btnStyle('#2ecc71', '#27ae60')}
            >
              Confirmer le planning
            </Button>
            <Button
              variant="contained"
              onClick={doReset}
              sx={btnStyle('rgba(255,255,255,0.15)', 'rgba(255,255,255,0.25)')}
            >
              Relancer planning
            </Button>
          </>
        )}
        {phase === 'confirmed' && (
          <>
            <Button
              variant="contained"
              onClick={() => setShowConfirmModal(true)}
              sx={btnStyle('#e74c3c', '#c0392b')}
            >
              Publier le planning
            </Button>
            <Button
              variant="contained"
              onClick={doDraft}
              sx={btnStyle('#e67e22', '#ca6f1e')}
            >
              Revenir en brouillon
            </Button>
          </>
        )}
        {phase === 'published' && (
          <Button
            variant="contained"
            disabled
            sx={btnStyle('rgba(255,255,255,0.15)', '')}
          >
            Planning verrouillé
          </Button>
        )}
      </Box>

      {message.text && (
        <Typography
          sx={{
            mt: 1.75,
            fontWeight: 700,
            fontSize: '0.88rem',
            textAlign: 'center',
            color: message.type === 'success' ? '#2ecc71' : '#e8b84b',
          }}
        >
          {message.text}
        </Typography>
      )}

      {showConfirmModal && (
        <Box
          onClick={() => setShowConfirmModal(false)}
          sx={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              background: '#1e2f5a',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '14px',
              p: '28px 32px',
              textAlign: 'center',
              maxWidth: 320,
              width: '90%',
            }}
          >
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.05rem',
                mb: 1.25,
              }}
            >
              Publier le planning ?
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: '0.82rem',
                mb: 2.5,
                lineHeight: 1.5,
              }}
            >
              Une fois publié, le planning sera visible par tous et{' '}
              <Box component="strong" sx={{ color: '#e74c3c' }}>
                ne pourra plus être modifié
              </Box>
              .
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.25, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => setShowConfirmModal(false)}
                sx={btnStyle(
                  'rgba(255,255,255,0.15)',
                  'rgba(255,255,255,0.25)',
                )}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                onClick={confirmPublish}
                sx={btnStyle('#e74c3c', '#c0392b')}
              >
                Oui, publier
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {showPubOverlay && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
          }}
        >
          <Box
            sx={{
              background: '#1a2744',
              border: '2px solid #e74c3c',
              borderRadius: '16px',
              p: '32px 40px',
              textAlign: 'center',
              maxWidth: 320,
            }}
          >
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.15rem',
                mb: 1.25,
              }}
            >
              Planning publié !
            </Typography>
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.55)',
                fontSize: '0.82rem',
                mb: 2.5,
                lineHeight: 1.5,
              }}
            >
              Le planning est maintenant visible par tous. Aucune modification
              n'est possible.
            </Typography>
            <Button
              variant="contained"
              onClick={() => setShowPubOverlay(false)}
              sx={btnStyle('rgba(255,255,255,0.15)', 'rgba(255,255,255,0.25)')}
            >
              Fermer
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const btnStyle = (bg: string, hoverBg: string) => ({
  backgroundColor: bg,
  color: '#fff',
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '0.85rem',
  borderRadius: '8px',
  px: 2.75,
  py: 1.25,
  '&:hover': { backgroundColor: hoverBg, filter: 'brightness(1.1)' },
  '&:active': { transform: 'scale(0.97)' },
  '&:disabled': { opacity: 0.4 },
});

export default TournamentPlanningPage;
