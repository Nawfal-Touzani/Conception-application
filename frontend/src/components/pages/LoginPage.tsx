import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
  Paper,
  Alert,
  Grid,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext'; // Adjust the path if needed

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Retrieve the login function from our Context

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // If fields are empty (although MUI's "required" attribute already blocks some)
    if (!email || !password) {
      return setError('Veuillez remplir tous les champs.');
    }

    try {
      setIsLoading(true);
      // Call the backend via our Context
      await login({ email, password });

      // If login is successful, redirect to the home page
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message); // Displays "Email or password incorrect"
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main Box with the same dark background as registration
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#121212',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        {/* Title above the card */}
        <Typography
          variant="h3"
          component="h1"
          align="center"
          sx={{ color: '#fff', fontWeight: 'bold', mb: 4, letterSpacing: 2 }}
        >
          VINCI ARENA
        </Typography>

        {/* White card containing the form */}
        <Paper elevation={6} sx={{ p: 4, borderRadius: 2 }}>
          <Typography
            variant="h5"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Se connecter
          </Typography>

          {/* Display potential errors */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>

            {/* Links below the button, aligned with a MUI Grid */}
            <Grid container>
              <Grid item xs>
                <Link href="#" variant="body2">
                  Mot de passe oublié ?
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
