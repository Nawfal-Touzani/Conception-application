import { useEffect, useState } from 'react';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { TournamentDetails } from '../../../../types/tournament.types';
import { TeamDto } from '../../../../types/team.types';
import { useAuth } from '../../../../contexts/useAuth';
import * as teamService from '../../../../services/team.service';

type Props = {
  tournament: TournamentDetails;
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatStatus(tournament: TournamentDetails): string {
  if (tournament.status === 'PREPARATION') {
    return tournament.isPublic ? 'Inscriptions ouvertes' : 'En préparation';
  }
  if (tournament.status === 'IN_PROGRESS') return 'En cours';
  if (tournament.status === 'FINISHED') return 'Terminé';
  return 'Annulé';
}

// ── Bracket SVG ──
const TEAM_W = 180;
const TEAM_H = 28;
const TEAM_GAP = 6;
const MATCH_H = TEAM_H * 2 + TEAM_GAP;
const COL_GAP = 60;
const ROW_GAP = 32;

function quartsY(): number[] {
  return [0, 1, 2, 3].map((i) => i * (MATCH_H + ROW_GAP) + MATCH_H / 2);
}

function demisY(): number[] {
  const q = quartsY();
  return [(q[0] + q[1]) / 2, (q[2] + q[3]) / 2];
}

function finaleY(): number {
  const d = demisY();
  return (d[0] + d[1]) / 2;
}

const svgH = 4 * MATCH_H + 3 * ROW_GAP;
const col0X = 0;
const col1X = col0X + TEAM_W + COL_GAP;
const col2X = col1X + TEAM_W + COL_GAP;
const svgW = col2X + TEAM_W;

function MatchBox({
  x,
  y,
  topWinner,
}: {
  x: number;
  y: number;
  topWinner?: boolean;
  label?: string;
}) {
  const topColor = topWinner ? '#27ae60' : '#e74c3c';
  const botColor = topWinner ? '#e74c3c' : '#27ae60';
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={TEAM_W}
        height={TEAM_H}
        fill="#1a2744"
        stroke={topColor}
        strokeWidth={2}
        rx={3}
      />
      <text x={x + 8} y={y + TEAM_H / 2 + 5} fill="#fff" fontSize={12}>
        Nom équipe
      </text>
      <text
        x={x + TEAM_W - 8}
        y={y + TEAM_H / 2 + 5}
        fill="#fff"
        fontSize={12}
        textAnchor="end"
      >
        score
      </text>
      <rect
        x={x}
        y={y + TEAM_H + TEAM_GAP}
        width={TEAM_W}
        height={TEAM_H}
        fill="#1a2744"
        stroke={botColor}
        strokeWidth={2}
        rx={3}
      />
      <text
        x={x + 8}
        y={y + TEAM_H + TEAM_GAP + TEAM_H / 2 + 5}
        fill="#fff"
        fontSize={12}
      >
        Nom équipe
      </text>
      <text
        x={x + TEAM_W - 8}
        y={y + TEAM_H + TEAM_GAP + TEAM_H / 2 + 5}
        fill="#fff"
        fontSize={12}
        textAnchor="end"
      >
        score
      </text>
    </g>
  );
}

function BracketSVG() {
  const qCY = quartsY();
  const dCY = demisY();
  const fCY = finaleY();
  const qBoxY = qCY.map((cy) => cy - MATCH_H / 2);
  const dBoxY = dCY.map((cy) => cy - MATCH_H / 2);
  const fBoxY = fCY - MATCH_H / 2;
  const connectorQD = [
    { q0: 0, q1: 1, d: 0 },
    { q0: 2, q1: 3, d: 1 },
  ];

  return (
    <svg width={svgW} height={svgH} style={{ overflow: 'visible' }}>
      {qBoxY.map((y, i) => (
        <MatchBox key={i} x={col0X} y={y} topWinner={true} />
      ))}
      {connectorQD.map(({ q0, q1, d }) => {
        const midX = col0X + TEAM_W + COL_GAP / 2;
        return (
          <g key={d} stroke="#fff" strokeWidth={2} fill="none">
            <line x1={col0X + TEAM_W} y1={qCY[q0]} x2={midX} y2={qCY[q0]} />
            <line x1={col0X + TEAM_W} y1={qCY[q1]} x2={midX} y2={qCY[q1]} />
            <line x1={midX} y1={qCY[q0]} x2={midX} y2={qCY[q1]} />
            <line x1={midX} y1={dCY[d]} x2={col1X} y2={dCY[d]} />
          </g>
        );
      })}
      {dBoxY.map((y, i) => (
        <MatchBox key={i} x={col1X} y={y} topWinner={true} />
      ))}
      <g stroke="#fff" strokeWidth={2} fill="none">
        <line
          x1={col1X + TEAM_W}
          y1={dCY[0]}
          x2={col1X + TEAM_W + COL_GAP / 2}
          y2={dCY[0]}
        />
        <line
          x1={col1X + TEAM_W}
          y1={dCY[1]}
          x2={col1X + TEAM_W + COL_GAP / 2}
          y2={dCY[1]}
        />
        <line
          x1={col1X + TEAM_W + COL_GAP / 2}
          y1={dCY[0]}
          x2={col1X + TEAM_W + COL_GAP / 2}
          y2={dCY[1]}
        />
        <line x1={col1X + TEAM_W + COL_GAP / 2} y1={fCY} x2={col2X} y2={fCY} />
      </g>
      <MatchBox x={col2X} y={fBoxY} topWinner={true} />
    </svg>
  );
}

const TournamentDetail = ({ tournament }: Props) => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const [myTeam, setMyTeam] = useState<TeamDto | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    teamService
      .getMyTeam(token)
      .then((team) => setMyTeam(team))
      .catch(() => setMyTeam(null));
  }, [token]);

  const isResponsible =
    myTeam !== null &&
    (myTeam.responsibleTag === user?.tag ||
      myTeam.secondResponsibleTag === user?.tag);

  const registrationOpen =
    tournament.status === 'PREPARATION' && tournament.isPublic;

  const handleRegister = async () => {
    if (!myTeam) return;
    setRegisterError(null);
    try {
      const response = await fetch(
        `/api/tournaments/${tournament.id}/teams/${myTeam.id}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) {
        const text = await response.text();
        try {
          const json = JSON.parse(text);
          setRegisterError(json.message || "Erreur lors de l'inscription.");
        } catch {
          setRegisterError(text || "Erreur lors de l'inscription.");
        }
      } else {
        setRegisterSuccess(true);
      }
    } catch {
      setRegisterError("Erreur lors de l'inscription.");
    }
  };

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
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 3 }}>
        {tournament.name}
      </Typography>

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
          <Box sx={{ display: 'flex', mb: 2 }}>
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.2rem',
                width: TEAM_W,
                textAlign: 'center',
              }}
            >
              Quarts
            </Typography>
            <Box sx={{ width: COL_GAP }} />
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.2rem',
                width: TEAM_W,
                textAlign: 'center',
              }}
            >
              Demi
            </Typography>
            <Box sx={{ width: COL_GAP }} />
            <Typography
              sx={{
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.2rem',
                width: TEAM_W,
                textAlign: 'center',
              }}
            >
              Finale
            </Typography>
          </Box>
          <BracketSVG />
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
          {/* Date / Teams / Statut */}
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
                Date
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
                Statut
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

          {/* Teams participantes */}
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

          {/* Gagnant */}
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

          {/* Inscriptions */}
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
                mb: registrationOpen && isResponsible ? 2 : 0,
              }}
            >
              {registrationOpen ? 'Ouvert' : formatStatus(tournament)}
            </Typography>

            {registrationOpen && isResponsible && !registerSuccess && (
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

            {registerSuccess && (
              <Typography sx={{ color: 'green', fontSize: '0.9rem', mt: 1 }}>
                Inscription réussie !
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
