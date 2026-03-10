import { Container, Typography, Box } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const HomePage = () => {
  const { user } = useAuth(); // Retrieve the logged-in user

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 10, textAlign: 'center', color: 'white' }}>
        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
          Bienvenue sur VINCI ARENA
        </Typography>
        {user ? (
          <Typography variant="h5" color="primary.main">
            Prêt pour le prochain tournoi, {user.tag} ?
          </Typography>
        ) : (
          <Typography variant="h5" color="text.secondary">
            Connectez-vous ou inscrivez-vous pour rejoindre la compétition.
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default HomePage;
