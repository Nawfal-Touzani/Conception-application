import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  Grid,
  Checkbox,
  FormControlLabel,
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

    // If fields are empty
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

  // Custom style for our rounded blue inputs
  const roundedBlueInputStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px', // Rounded rectangle
      '& fieldset': {
        borderColor: '#1e2a44',
        borderWidth: '2px',
      },
      '&:hover fieldset': {
        borderColor: '#1e2a44',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1e2a44',
      },
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#1e2a44',
    },
  };

  return (
    // Main Box with the dark blue background
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1e2a44',
        padding: 2,
      }}
    >
      <Container maxWidth="xs">
        {/* White card containing the form */}
        <Paper elevation={6} sx={{ p: 4, borderRadius: '20px' }}>
          {/* Title aligned to the left and larger */}
          <Typography
            variant="h4"
            component="h1"
            align="left"
            gutterBottom
            sx={{ fontWeight: 'bold', color: '#1e2a44', mb: 3 }}
          >
            Se connecter
          </Typography>

          {/* Display potential errors */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
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
              sx={roundedBlueInputStyle}
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
              sx={roundedBlueInputStyle}
            />

            {/* Remember me and Forgot password on the same line */}
            <Grid
              container
              alignItems="center"
              justifyContent="space-between"
              sx={{ mt: 1, mb: 3 }}
            >
              <Grid item>
                <FormControlLabel
                  control={
                    <Checkbox
                      value="remember"
                      color="primary"
                      sx={{
                        color: '#1e2a44',
                        '&.Mui-checked': { color: '#1e2a44' },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: '#1e2a44' }}>
                      Se souvenir de moi
                    </Typography>
                  }
                />
              </Grid>
            </Grid>

            {/* Isolated login button at the bottom */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1.1rem',
                backgroundColor: '#1e2a44',
                color: 'white',
                borderRadius: '50px', // Apple-style round button
                textTransform: 'none',
                '&:hover': { backgroundColor: '#151e32' },
              }}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
