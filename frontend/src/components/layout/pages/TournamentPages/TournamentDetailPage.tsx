import { useEffect, useState } from 'react';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { TournamentDetails } from '../../../../types/tournament.types';
import { useTournamentDetail } from '../../../../hooks/useTournamentDetail/useTournamentDetail';
import BracketSVG from '../../../ui/BracketSVG/BracketSVG';
import {
  formatDate,
  formatStatus,
} from '../../../../utils/TournamentFormat/tournament.utils';
import { useAuth } from '../../../../contexts/useAuth';

type Match = { team1: string; team2: string };
type Round = Match[];

function buildBracketFromMatches(
  matches: {
    roundNumber: number;
    teamA: string | null;
    teamB: string | null;
  }[],
  allTeams: string[],
): Round[] {
  const round1 = matches.filter((m: any) => m.roundNumber === 1);
  if (round1.length === 0) return [];

  const realMatches: Match[] = round1.map((m: any) => ({
    team1: m.teamA,
    team2: m.teamB,
  }));

  // Trouver les bye teams : équipes inscrites mais absentes des matchs
  const teamsInMatches = new Set<string>();
  round1.forEach((m: any) => {
    if (m.teamA) teamsInMatches.add(m.teamA);
    if (m.teamB) teamsInMatches.add(m.teamB);
  });
  const byeTeams = allTeams.filter((t) => !teamsInMatches.has(t));

  const rounds: Round[] = [realMatches];

  // Round suivant : paires de winners + bye teams directement
  const nextRound: Match[] = [];

  for (let i = 0; i + 1 < realMatches.length; i += 2) {
    nextRound.push({ team1: '?', team2: '?' });
  }

  if (realMatches.length % 2 === 1 && byeTeams.length > 0) {
    nextRound.push({ team1: '?', team2: byeTeams.shift()! });
  }

  byeTeams.forEach((bye) => {
    nextRound.push({ team1: bye, team2: '?' });
  });

  if (nextRound.length > 0) rounds.push(nextRound);

  let prev = nextRound;
  while (prev.length > 1) {
    const count = Math.ceil(prev.length / 2);
    const r: Match[] = Array.from({ length: count }, () => ({
      team1: '?',
      team2: '?',
    }));
    rounds.push(r);
    prev = r;
  }
  return rounds;
}

type Props = {
  tournament: TournamentDetails;
  onRegister: () => Promise<void>;
};

const TournamentDetail = ({ tournament, onRegister }: Props) => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const {
    isResponsible,
    isAlreadyRegistered,
    registrationOpen,
    registerSuccess,
    registerError,
    handleRegister,
  } = useTournamentDetail(tournament, onRegister);

  const [bracketRounds, setBracketRounds] = useState<Round[]>([]);

  useEffect(() => {
    if (tournament.status !== 'IN_PROGRESS' && tournament.status !== 'FINISHED')
      return;

    fetch(`http://localhost:3000/tournaments/${tournament.id}/matches`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((matches: any[]) => {
        if (matches && matches.length > 0) {
          const allTeams = tournament.registeredTeamNames ?? [];
          setBracketRounds(buildBracketFromMatches(matches, allTeams));
        }
      })
      .catch(() => {});
  }, [tournament.id, token]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: '#1a2744',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 0,
        px: 4,
        pb: 5,
      }}
    >
      <Typography
        variant="h4"
        sx={{ color: '#fff', fontWeight: 800, mb: 1, textAlign: 'center' }}
      >
        {tournament.name}
      </Typography>

      {tournament.description && (
        <Typography
          sx={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: '1rem',
            mb: 3,
            textAlign: 'center',
            maxWidth: 700,
          }}
        >
          {tournament.description}
        </Typography>
      )}

      <Box
        sx={{
          display: 'flex',
          gap: 5,
          width: '100%',
          alignItems: 'flex-start',
        }}
      >
        {/* ── Bracket ── */}
        <Box sx={{ flex: 1, overflowX: 'auto' }}>
          <BracketSVG
            rounds={bracketRounds.length > 0 ? bracketRounds : undefined}
            teamCount={tournament.maxParticipants}
          />
        </Box>

        {/* ── Panneau droit ── */}
        <Box
          sx={{
            width: 400,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Paper
            elevation={0}
            sx={{ borderRadius: '12px', p: 3, backgroundColor: '#fff' }}
          >
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  color: '#1a2744',
                  fontSize: '1rem',
                  flex: 1,
                }}
              >
                Début
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: '#1a2744',
                  fontSize: '1rem',
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                Fin
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: '#1a2744',
                  fontSize: '1rem',
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                Teams
              </Typography>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: '#1a2744',
                  fontSize: '1rem',
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                Etat
              </Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.95rem', color: '#333', flex: 1 }}>
                {formatDate(tournament.startDate)}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.95rem',
                  color: '#333',
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                {formatDate(tournament.endDate)}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.95rem',
                  color: '#333',
                  flex: 1,
                  textAlign: 'center',
                }}
              >
                {tournament.maxParticipants}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.95rem',
                  color: '#333',
                  flex: 1,
                  textAlign: 'right',
                }}
              >
                {formatStatus(tournament)}
              </Typography>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{ borderRadius: '12px', p: 3, backgroundColor: '#fff' }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Typography
                sx={{ fontWeight: 700, color: '#1a2744', fontSize: '1.1rem' }}
              >
                Teams participantes
              </Typography>
              <Typography
                sx={{ fontWeight: 700, color: '#1a2744', fontSize: '1rem' }}
              >
                {tournament.currentParticipants} sur{' '}
                {tournament.maxParticipants}
              </Typography>
            </Box>
            <Divider sx={{ mb: 1.5 }} />
            {tournament.currentParticipants === 0 ? (
              <Typography
                sx={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.95rem' }}
              >
                Aucune équipe inscrite pour le moment.
              </Typography>
            ) : (
              <Box
                sx={{
                  maxHeight: 160,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-track': { background: 'transparent' },
                  '&::-webkit-scrollbar-thumb': {
                    background: 'rgba(26,39,68,0.2)',
                    borderRadius: '3px',
                  },
                }}
              >
                {(tournament.registeredTeamNames ?? []).map((name) => (
                  <Box
                    key={name}
                    sx={{
                      px: 1.5,
                      py: 0.6,
                      borderRadius: '6px',
                      backgroundColor: '#f0f2f5',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '0.9rem',
                        color: '#1a2744',
                        fontWeight: 500,
                      }}
                    >
                      {name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>

          {tournament.status === 'FINISHED' && tournament.winnerTeamName && (
            <Paper
              elevation={0}
              sx={{ borderRadius: '12px', p: 3, backgroundColor: '#fff' }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  color: '#1a2744',
                  fontSize: '1.1rem',
                  mb: 0.5,
                }}
              >
                🏆 Gagnant
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Typography
                sx={{ fontWeight: 800, color: '#1a2744', fontSize: '1.4rem' }}
              >
                {tournament.winnerTeamName}
              </Typography>
            </Paper>
          )}

          <Paper
            elevation={0}
            sx={{ borderRadius: '12px', p: 3, backgroundColor: '#fff' }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                color: '#1a2744',
                fontSize: '1.1rem',
                mb: 0.5,
              }}
            >
              Inscriptions
            </Typography>
            <Typography sx={{ color: '#555', fontSize: '0.95rem', mb: 1.5 }}>
              Date limite le {formatDate(tournament.registrationDeadline)}
            </Typography>
            <Divider sx={{ mb: 1.5 }} />
            <Typography
              sx={{
                fontWeight: 800,
                color: '#1a2744',
                fontSize: '1.6rem',
                mb:
                  registrationOpen && isResponsible && !isAlreadyRegistered
                    ? 2
                    : 0,
              }}
            >
              {registrationOpen ? 'Ouvert' : formatStatus(tournament)}
            </Typography>

            {registrationOpen &&
              isResponsible &&
              !isAlreadyRegistered &&
              !registerSuccess &&
              tournament.currentParticipants < tournament.maxParticipants && (
                <Button
                  variant="contained"
                  onClick={handleRegister}
                  fullWidth
                  sx={{
                    backgroundColor: '#1a2744',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    borderRadius: '8px',
                    '&:hover': { backgroundColor: '#243560' },
                  }}
                >
                  S'inscrire
                </Button>
              )}

            {registrationOpen &&
              !isAlreadyRegistered &&
              tournament.currentParticipants >= tournament.maxParticipants && (
                <Typography
                  sx={{ color: '#e74c3c', fontSize: '0.9rem', mt: 1 }}
                >
                  Le tournoi est complet.
                </Typography>
              )}

            {registerSuccess && (
              <Typography
                sx={{
                  color: 'green',
                  fontSize: '0.95rem',
                  mt: 1,
                  fontWeight: 600,
                }}
              >
                Vous vous êtes inscrits avec succès !
              </Typography>
            )}

            {registrationOpen && isAlreadyRegistered && !registerSuccess && (
              <Typography
                sx={{
                  color: '#1a2744',
                  fontSize: '0.95rem',
                  mt: 1,
                  fontWeight: 600,
                }}
              >
                Vous êtes déjà inscrits à ce tournoi.
              </Typography>
            )}

            {registerError && (
              <Typography sx={{ color: '#e74c3c', fontSize: '0.9rem', mt: 1 }}>
                {registerError}
              </Typography>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default TournamentDetail;
