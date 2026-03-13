import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useAuth } from '../../../contexts/useAuth'; // hook

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Context for authentication

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    try {
      await login({ email, password }, rememberMe); // Call the backend via our Context
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message); // Display the error message from the backend
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
    } finally {
      // Optionally, reset after a failed login attempt
      setPassword('');
    }
  };

  return (
    // Background
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: '#1e2a44',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Card + button centered together */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        display="flex"
        flexDirection="column"
        alignItems="center"
        mt={-10}
      >
        {/* White card */}
        <Paper elevation={10} sx={{ width: 520, borderRadius: '10px', p: 3 }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            color="#1e2a44"
            mb={3}
          >
            Se connecter
          </Typography>

          {/* Display potential errors */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
              {error}
            </Alert>
          )}

          <Box display={'flex'} flexDirection="column" gap={2}>
            <TextField
              label="Adresse email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="filled"
              InputProps={{ disableUnderline: true }}
              sx={{
                '& .MuiFilledInput-root': {
                  backgroundColor: '#1a2744',
                  borderRadius: '10px',
                  color: '#ffffff',
                },
                '& .MuiFilledInput-root:hover': {
                  backgroundColor: '#1a2744',
                },
                '& .MuiFilledInput-root.Mui-focused': {
                  backgroundColor: '#1a2744',
                },
                '& .MuiInputLabel-root': {
                  color: 'grey',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'grey',
                },
              }}
            />

            <TextField
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="filled"
              InputProps={{ disableUnderline: true }}
              sx={{
                '& .MuiFilledInput-root': {
                  backgroundColor: '#1a2744',
                  borderRadius: '10px',
                  color: '#ffffff',
                },
                '& .MuiFilledInput-root:hover': {
                  backgroundColor: '#1a2744',
                },
                '& .MuiFilledInput-root.Mui-focused': {
                  backgroundColor: '#1a2744',
                },
                '& .MuiInputLabel-root': {
                  color: 'grey',
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: 'grey',
                },
              }}
            />

            {/* Remember me */}
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  sx={{
                    color: '#1e2a44',
                    '&.Mui-checked': { color: '#1e2a44' },
                  }}
                />
              }
              label={
                <Typography fontWeight="bold" color="#1a2744">
                  Se souvenir de moi
                </Typography>
              }
            />
          </Box>
        </Paper>

        {/* Isolated login button at the bottom */}
        <Button
          type="submit"
          variant="contained"
          sx={{
            mt: 5,
            backgroundColor: 'white',
            color: '#1e2a44',
            borderRadius: '10px',
            textTransform: 'none', // no uppercase
            fontWeight: 'bold',
            fontSize: '1.3rem',
            px: 3,
          }}
        >
          Se connecter
        </Button>
      </Box>
    </Box>
  );
};

export default LoginPage;
