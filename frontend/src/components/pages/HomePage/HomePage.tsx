import React from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import { useAuth } from '../../../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import homeImage from '../../../assets/images/home_logo.png';
import TournamentCard from '../../ui/TournamentCard/TournamentCard';
import { useHomePage } from './useHomePage';

const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tournaments, error } = useHomePage();

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
          {error && <Typography color="#e74c3c">{error}</Typography>}
          {!error && tournaments.length === 0 && (
            <Typography color="rgba(255,255,255,0.5)">
              Aucun tournoi disponible.
            </Typography>
          )}
          {tournaments.map((tournament) => (
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
