import { useState } from 'react';
import { Box, Button, Divider, Paper, Typography } from '@mui/material';
import { TournamentDetails } from '../../../../types/tournament.types';
import { useTournamentDetail } from '../../../../hooks/useTournamentDetail/useTournamentDetail';
import {
  formatDate,
  formatStatus,
} from '../../../../utils/TournamentFormat/tournament.utils';
import TournamentBracket from './TournamentBracket';
import MatchDetailPage from '../MatchPage/MatchDetailPage';
import MatchSelectionPage from '../MatchPage/MatchSelectionPage';
import { getMatchById } from '../../../../services/match/match.service';
import { MatchDetail } from '../../../../types/match.types';
import { useAuth } from '../../../../contexts/useAuth';

type Props = {
  tournament: TournamentDetails;
  onRegister: () => Promise<void>;
};

const TournamentDetail = ({ tournament, onRegister }: Props) => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const {
    myTeam,
    isResponsible,
    isAlreadyRegistered,
    registrationOpen,
    registerSuccess,
    registerError,
    handleRegister,
  } = useTournamentDetail(tournament, onRegister);

  const userTeamId = myTeam?.id ?? null;

  const [view, setView] = useState<'detail' | 'matchDetail' | 'matchSelection'>(
    'detail',
  );
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null);
  const [hasExistingSelection, setHasExistingSelection] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(false);

  const handleMatchClick = async (matchId: number) => {
    setLoadingMatch(true);
    try {
      const match = await getMatchById(matchId, token);
      setSelectedMatch(match);
      setView('matchDetail');
    } catch {
      // silencieux
    } finally {
      setLoadingMatch(false);
    }
  };

  if (view === 'matchDetail' && selectedMatch) {
    return (
      <MatchDetailPage
        match={selectedMatch}
        onBack={() => setView('detail')}
        isResponsible={isResponsible}
        userTeamId={userTeamId}
        onNavigateToSelection={(m, hasExisting) => {
          setSelectedMatch(m);
          setHasExistingSelection(hasExisting);
          setView('matchSelection');
        }}
      />
    );
  }

  if (view === 'matchSelection' && selectedMatch) {
    return (
      <MatchSelectionPage
        match={selectedMatch}
        hasExistingSelection={hasExistingSelection}
        onBack={(updated) => {
          if (updated) setSelectedMatch(updated);
          setView('matchDetail');
        }}
      />
    );
  }

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
          {loadingMatch && (
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.5)',
                textAlign: 'center',
                mb: 2,
              }}
            >
              Chargement du match...
            </Typography>
          )}
          <TournamentBracket
            tournamentId={tournament.id}
            onMatchClick={handleMatchClick}
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
                État
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
