import { useState } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../../../../contexts/useAuth';
import { useTournaments } from '../../../../hooks/useTournament/useTournaments';
import TournamentListCard from '../../../ui/TournamentCard/TournamentListCard';
import TournamentFilters from '../../../ui/TournamentFilters/TournamentFilters';
import TournamentDetail from './TournamentDetailPage';
import TournamentAdminPage from './TournamentAdminPage';
import TournamentPlanningPage from './../TournamentPages/TournamentPlanningPage';
import { colors } from '../../../../styles/tournament.styles';

const CARD_WIDTH = 320;
const GAP = 24;

const TournamentsPage = () => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  // ✅ NOUVEAU — id du tournoi dont on gère le planning
  const [planningTournamentId, setPlanningTournamentId] = useState<
    number | null
  >(null);

  const {
    isAdmin,
    rows,
    error,
    selectedTournament,
    setSelectedTournament,
    adminTournament,
    setAdminTournament,
    setTournaments,
    handleRegister,
    reset,
    filters,
  } = useTournaments(token);

  if (planningTournamentId !== null) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: colors.primary,
          minHeight: '100vh',
        }}
      >
        <Box sx={{ pt: 1, pl: 1 }}>
          <IconButton
            onClick={() => setPlanningTournamentId(null)}
            sx={{ color: colors.white }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <TournamentPlanningPage tournamentId={planningTournamentId} />
      </Box>
    );
  }

  if (adminTournament) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: colors.primary,
          minHeight: '100vh',
        }}
      >
        <Box sx={{ pt: 1, pl: 1 }}>
          <IconButton
            onClick={() => setAdminTournament(null)}
            sx={{ color: colors.white }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <TournamentAdminPage
          tournament={adminTournament}
          onBack={() => setAdminTournament(null)}
          onUpdated={(updated) => {
            setAdminTournament(updated);
            setTournaments((prev) =>
              prev.map((t) => (t.id === updated.id ? updated : t)),
            );
          }}
          onNavigateToPlanning={(id) => setPlanningTournamentId(id)} // ✅
        />
      </Box>
    );
  }

  if (selectedTournament) {
    return (
      <Box
        sx={{
          flexGrow: 1,
          backgroundColor: colors.primary,
          minHeight: '100vh',
        }}
      >
        <Box sx={{ pt: 1, pl: 1 }}>
          <IconButton
            onClick={() => setSelectedTournament(null)}
            sx={{ color: colors.white }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
        <TournamentDetail
          tournament={selectedTournament}
          onRegister={() => handleRegister(selectedTournament.id)}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: colors.background,
        display: 'flex',
        minHeight: '100vh',
        px: 3,
        py: 4,
        gap: 4,
        alignItems: 'flex-start',
      }}
    >
      <TournamentFilters isAdmin={isAdmin} {...filters} onReset={reset} />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h4"
          sx={{
            color: colors.white,
            fontWeight: 800,
            mb: 4,
            textAlign: 'center',
          }}
        >
          Tournois
        </Typography>
        {error && (
          <Typography sx={{ color: '#e74c3c', mb: 2, textAlign: 'center' }}>
            {error}
          </Typography>
        )}
        {rows.length === 0 && (
          <Typography
            sx={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', mt: 4 }}
          >
            Aucun tournoi trouvé.
          </Typography>
        )}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {rows.map((row, rowIndex) => (
            <Box key={rowIndex}>
              <Box
                sx={{
                  display: 'flex',
                  gap: `${GAP}px`,
                  justifyContent: 'center',
                  alignItems: 'stretch',
                }}
              >
                {row.map((tournament) => (
                  <TournamentListCard
                    key={tournament.id}
                    tournament={tournament}
                    onSelect={() => setSelectedTournament(tournament)}
                  />
                ))}
              </Box>
              {isAdmin && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: `${GAP}px`,
                    mt: 1,
                    justifyContent: 'center',
                  }}
                >
                  {row.map((tournament) => (
                    <Button
                      key={tournament.id}
                      variant="contained"
                      disabled={
                        tournament.status === 'FINISHED' ||
                        tournament.status === 'CANCELLED'
                      }
                      onClick={() => setAdminTournament(tournament)}
                      sx={{
                        width: CARD_WIDTH,
                        flexShrink: 0,
                        backgroundColor: colors.white,
                        color: colors.primary,
                        textTransform: 'none',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        borderRadius: '8px',
                        boxShadow: 'none',
                        '&:hover': { backgroundColor: '#e8e8e8' },
                        '&.Mui-disabled': {
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: 'rgba(255,255,255,0.4)',
                        },
                      }}
                    >
                      Administrer
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default TournamentsPage;
