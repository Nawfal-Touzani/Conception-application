import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import { teamPageSx } from '../../../../styles/team.styles';
import { formatDate } from '../../../../utils/TeamFormat/team.utils';
import { Tournament } from '../../../../types/team.types';

interface TeamTournamentColumnProps {
  tabIndex: number;
  setTabIndex: (index: number) => void;
  tournamentsInProgress: Tournament[];
  tournamentsUpcoming: Tournament[];
}

// colonne d'affcihage des tournois avec 2 onglets
export const TeamTournamentColumn = ({
  tabIndex,
  setTabIndex,
  tournamentsInProgress,
  tournamentsUpcoming,
}: TeamTournamentColumnProps) => {
  return (
    <Box sx={{ width: '30%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={teamPageSx.columnTitle}>
        Tournois
      </Typography>

      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        sx={teamPageSx.tabs}
      >
        <Tab label={`En cours (${tournamentsInProgress.length})`} />
        <Tab label={`À venir (${tournamentsUpcoming.length})`} />
      </Tabs>

      {tabIndex === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {tournamentsInProgress.length === 0 ? (
            <Typography
              sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}
            >
              Aucun tournoi en cours.
            </Typography>
          ) : (
            tournamentsInProgress.map((t) => (
              <Paper key={t.id} elevation={0} sx={teamPageSx.tournamentCard}>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: '#1a2744',
                      fontSize: '0.95rem',
                    }}
                  >
                    {t.name}
                  </Typography>

                  <Typography sx={{ color: '#555', fontSize: '0.8rem' }}>
                    {formatDate(t.startDate)} — {formatDate(t.endDate)}
                  </Typography>
                </Box>
                <Typography
                  sx={{ fontSize: '0.8rem', color: '#27ae60', fontWeight: 700 }}
                >
                  En cours
                </Typography>
              </Paper>
            ))
          )}
        </Box>
      )}

      {tabIndex === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {tournamentsUpcoming.length === 0 ? (
            <Typography
              sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}
            >
              Aucun tournoi à venir.
            </Typography>
          ) : (
            tournamentsUpcoming.map((t) => (
              <Paper key={t.id} elevation={0} sx={teamPageSx.tournamentCard}>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: '#1a2744',
                      fontSize: '0.95rem',
                    }}
                  >
                    {t.name}
                  </Typography>
                  <Typography sx={{ color: '#555', fontSize: '0.8rem' }}>
                    {formatDate(t.startDate)} — {formatDate(t.endDate)}
                  </Typography>
                </Box>
                <Typography
                  sx={{ fontSize: '0.8rem', color: '#1a2744', fontWeight: 700 }}
                >
                  Inscriptions ouvertes
                </Typography>
              </Paper>
            ))
          )}
        </Box>
      )}
    </Box>
  );
};
