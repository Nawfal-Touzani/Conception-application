import { Box, Divider, Paper, Typography } from '@mui/material';
import { TournamentDetails } from '../../../types/tournament.types';

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

// Cohérent avec TournamentsPage : isPublic + status
function formatStatus(tournament: TournamentDetails): string {
  if (tournament.status === 'PREPARATION') {
    return tournament.isPublic ? 'Inscriptions ouvertes' : 'En préparation';
  }
  if (tournament.status === 'IN_PROGRESS') return 'En cours';
  if (tournament.status === 'FINISHED') return 'Terminé';
  return 'Annulé';
}

function MatchTeam({
  name,
  score,
  winner,
}: {
  name: string;
  score: string;
  winner?: boolean;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: `2px solid ${winner ? '#27ae60' : '#e74c3c'}`,
        borderRadius: '3px',
        px: 1.5,
        py: 0.6,
        width: 200,
        backgroundColor: '#1a2744',
      }}
    >
      <Typography sx={{ color: '#fff', fontSize: '0.85rem' }}>
        {name}
      </Typography>
      <Typography sx={{ color: '#fff', fontSize: '0.85rem', ml: 1 }}>
        {score}
      </Typography>
    </Box>
  );
}

function MatchPair({
  top,
  bottom,
}: {
  top: { name: string; score: string; winner?: boolean };
  bottom: { name: string; score: string; winner?: boolean };
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <MatchTeam {...top} />
      <MatchTeam {...bottom} />
    </Box>
  );
}

const MATCH_H = 68;
const ROUND_GAP = 32;

const TournamentDetail = ({ tournament }: Props) => {
  const quartsData = [
    {
      top: { name: 'Nom équipe', score: 'score', winner: true },
      bottom: { name: 'Nom équipe', score: 'score' },
    },
    {
      top: { name: 'Nom équipe', score: 'score', winner: true },
      bottom: { name: 'Nom équipe', score: 'score' },
    },
    {
      top: { name: 'Nom équipe', score: 'score', winner: true },
      bottom: { name: 'Nom équipe', score: 'score' },
    },
    {
      top: { name: 'Nom équipe', score: 'score', winner: true },
      bottom: { name: 'Nom équipe', score: 'score' },
    },
  ];

  const demisData = [
    {
      top: { name: 'Nom équipe', score: 'score', winner: true },
      bottom: { name: 'Nom équipe', score: 'score' },
    },
    {
      top: { name: 'Nom équipe', score: 'score', winner: true },
      bottom: { name: 'Nom équipe', score: 'score' },
    },
  ];

  const finaleData = {
    top: { name: 'Nom équipe', score: 'score', winner: true },
    bottom: { name: 'Nom équipe', score: 'score' },
  };

  const demiOffset = MATCH_H / 2 + ROUND_GAP / 2;
  const finaleOffset = MATCH_H / 2 + ROUND_GAP / 2 + demiOffset;

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
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
            {/* Quarts */}
            <Box>
              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                Quarts
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${ROUND_GAP}px`,
                }}
              >
                {quartsData.map((m, i) => (
                  <MatchPair key={i} {...m} />
                ))}
              </Box>
            </Box>

            {/* Connecteurs quarts → demis */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                mt: `${36 + MATCH_H / 2}px`,
                gap: `${MATCH_H + ROUND_GAP}px`,
              }}
            >
              {[0, 1].map((i) => (
                <Box key={i} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{ width: 30, height: '2px', backgroundColor: '#fff' }}
                    />
                    <Box
                      sx={{
                        width: '2px',
                        height: `${MATCH_H / 2 + ROUND_GAP / 2}px`,
                        backgroundColor: '#fff',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{ width: 30, height: '2px', backgroundColor: '#fff' }}
                    />
                    <Box
                      sx={{ width: 30, height: '2px', backgroundColor: '#fff' }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Demis */}
            <Box>
              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                Demi
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${MATCH_H + ROUND_GAP * 2}px`,
                  mt: `${demiOffset}px`,
                }}
              >
                {demisData.map((m, i) => (
                  <MatchPair key={i} {...m} />
                ))}
              </Box>
            </Box>

            {/* Connecteurs demis → finale */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                mt: `${36 + demiOffset + MATCH_H / 2}px`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{ width: 30, height: '2px', backgroundColor: '#fff' }}
                />
                <Box
                  sx={{
                    width: '2px',
                    height: `${MATCH_H / 2 + ROUND_GAP}px`,
                    backgroundColor: '#fff',
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{ width: 30, height: '2px', backgroundColor: '#fff' }}
                />
              </Box>
            </Box>

            {/* Finale */}
            <Box>
              <Typography
                sx={{
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '1.2rem',
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                Finale
              </Typography>
              <Box sx={{ mt: `${finaleOffset}px` }}>
                <MatchPair {...finaleData} />
              </Box>
            </Box>
          </Box>
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
              <Typography sx={{ color: '#555', fontSize: '0.95rem' }}>
                {tournament.currentParticipants} équipe(s) inscrite(s).
              </Typography>
            )}
          </Paper>

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
              sx={{ fontWeight: 800, color: '#1a2744', fontSize: '1.6rem' }}
            >
              {formatStatus(tournament)}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default TournamentDetail;
