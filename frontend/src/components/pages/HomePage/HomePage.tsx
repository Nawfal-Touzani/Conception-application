import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useAuth } from '../../../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import homeImage from '../../../assets/images/home_logo.png';
import TournamentCard from '../../ui/TournamentCard/TournamentCard';
import { Tournament } from '../../../types/tournament.types';

// Static data matching the real Tournament type — will be replaced by backend fetch later
const TOURNAMENTS_DATA: Tournament[] = [
  {
    id: 1,
    status: 'FINISHED',
    name: 'Winter Cup 2026',
    startDate: '2026-01-05T00:00:00',
    endDate: '2026-01-19T00:00:00',
    maxParticipant: 16,
  },
  {
    id: 2,
    status: 'IN_PROGRESS',
    name: 'Vinci Bounty 2026',
    startDate: '2026-02-16T00:00:00',
    endDate: '2026-02-23T00:00:00',
    maxParticipant: 8,
  },
  {
    id: 3,
    status: 'PREPARATION',
    name: 'Vinci Major 2026',
    startDate: '2026-02-25T00:00:00',
    endDate: '2026-03-01T00:00:00',
    maxParticipant: 16,
  },
];

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: '#1e2a44',
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        p: 4,
      }}
    >
      {/* Welcome section */}
      <Paper
        elevation={10}
        sx={{
          width: 450,
          borderRadius: '10px',
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" color="#1e2a44" mb={3}>
          Bienvenue sur la plateforme de référence des tournois e-sport Vinci
          Arena.
        </Typography>

        <Box
          component="img"
          src={homeImage}
          alt="Vinci Arena Game Image"
          sx={{ width: '100%', borderRadius: '5px', mb: 3 }}
        />

        {user ? (
          <Box>
            <Typography variant="h6" color="#1e2a44">
              Bonjour, {user.tag}.
            </Typography>
            <Typography variant="h6" color="#1e2a44">
              Prêt pour la compétition ?
            </Typography>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={() => navigate('/register')}
            sx={{
              backgroundColor: '#1e2a44',
              color: 'white',
              mt: 1,
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '1.3rem',
              px: 3,
            }}
          >
            Rejoindre la compétition
          </Button>
        )}
      </Paper>

      {/* Tournaments section */}
      <Box display="flex" flexDirection="column" alignItems="center" gap={3}>
        <Typography variant="h3" color="white" fontWeight="bold">
          Tournois
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap" justifyContent="center">
          {TOURNAMENTS_DATA.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </Box>

        <Button
          onClick={() => navigate('/tournaments')}
          variant="contained"
          sx={{
            mt: 1,
            backgroundColor: 'white',
            color: '#1e2a44',
            borderRadius: '10px',
            textTransform: 'none',
            fontWeight: 'bold',
            fontSize: '1.3rem',
            px: 3,
          }}
        >
          En savoir plus
        </Button>
      </Box>
    </Box>
  );
};

export default HomePage;
