import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useAuth } from '../../../contexts/useAuth'; // hook
import { useNavigate } from 'react-router-dom';
import homeImage from '../../../assets/images/home_logo.png';

// Static for now
const TOURNAMENTS_DATA = [
  {
    id: 1,
    status: 'Dernier',
    title: 'Winter Cup 2026',
    dates: '5 jan - 19 jan',
    phaseLabel: 'VAINQUEUR',
    phaseValue: 'Vinci Woluwe',
    teams: '16',
    state: 'Terminé',
  },
  {
    id: 2,
    status: 'À la une',
    title: 'Vinci Bounty 2026',
    dates: '16 fév - 23 fév',
    phaseLabel: 'PHASE',
    phaseValue: 'Quarts de finale',
    teams: '8',
    state: 'En cours',
  },
  {
    id: 3,
    status: 'Prochain',
    title: 'Vinci Major 2026',
    dates: '25 fév - 1 mar',
    phaseLabel: '',
    phaseValue: 'Inscriptions Ouvertes',
    teams: '9/16',
    state: 'Ouvert',
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
              textTransform: 'none', // no uppercase
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
          {/* Cards */}
          {TOURNAMENTS_DATA.map((tournament) => (
            <Paper
              key={tournament.id}
              sx={{
                p: 1,
                borderRadius: '10px',
                width: 200,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {/* Tournament Status section */}
              <Box
                sx={{
                  backgroundColor: '#1e2a44',
                  color: 'white',
                  borderRadius: '8px',
                  py: 1.5,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  {tournament.status}
                </Typography>
              </Box>

              {/* Tournaments details */}
              <Box
                sx={{
                  backgroundColor: '#1e2a44',
                  color: 'white',
                  borderRadius: '8px',
                  p: 2,
                  flexGrow: 1,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h6" fontWeight="bold" fontSize="1.2rem">
                  {tournament.title}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  mb={3}
                  fontSize="0.8rem"
                >
                  {tournament.dates}
                </Typography>

                <Typography variant="caption" display="block" fontWeight="bold">
                  {tournament.phaseLabel}
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight="bold"
                  mb={3}
                  fontSize="1.1rem"
                >
                  {tournament.phaseValue}
                </Typography>

                <Typography variant="caption" display="block">
                  TEAMS
                </Typography>
                <Typography
                  variant="body2"
                  mb={1}
                  fontWeight="bold"
                  fontSize="1rem"
                >
                  {tournament.teams}
                </Typography>
                <Typography variant="caption" display="block" fontWeight="bold">
                  {tournament.state}
                </Typography>
              </Box>
            </Paper>
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
            textTransform: 'none', // no uppercase
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
