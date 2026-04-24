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

      {/* Tabs MUI contrôlé : `value` synchronise l'onglet actif avec le state parent
          `onChange` reçoit (event, newValue) — on ignore l'event avec `_` car seul
          le nouvel index nous intéresse */}
      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        sx={teamPageSx.tabs}
      >
        {/* Le compte est affiché dynamiquement dans le label de chaque onglet */}
        <Tab label={`En cours (${tournamentsInProgress.length})`} />
        <Tab label={`À venir (${tournamentsUpcoming.length})`} />
      </Tabs>

      {/* Rendu conditionnel par onglet : on affiche le panneau uniquement si
          tabIndex correspond — alternative légère à TabPanel */}
      {tabIndex === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {tournamentsInProgress.length === 0 ? (
            <Typography
              sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}
            >
              Aucun tournoi en cours.
            </Typography>
          ) : (
            // `key={t.id}` est obligatoire pour que React identifie chaque élément
            // de la liste et optimise les re-renders
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
                  {/* formatDate : utilitaire qui formate un timestamp/ISO en date lisible */}
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
