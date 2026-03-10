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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tag, setTag] = useState('');

  // Foreign keys (imageId and specialityId), initialized as empty string for MUI Select,
  // but converted to Number on submit.
  const [imageId, setImageId] = useState<number | ''>('');
  const [specialityId, setSpecialityId] = useState<number | ''>('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // Basic front-end validation
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (imageId === '' || specialityId === '') {
      return setError('Please select an image and a speciality.');
    }

    // Call the backend via our Context
    try {
      setIsLoading(true);
      await register({
        email,
        password,
        tag,
        imageId: Number(imageId),
        specialityId: Number(specialityId),
      });

      // Redirect to login on success
      navigate('/login');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Main box with dark background
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
            S'inscrire
          </Typography>

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
              label="Email address"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="tag"
              label="Username (Tag)"
              name="tag"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
            />

            {/* Speciality selector */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="speciality-label">Spécialité</InputLabel>
              <Select
                labelId="speciality-label"
                id="speciality"
                value={specialityId}
                label="Speciality"
                onChange={(e) => setSpecialityId(e.target.value as number)}
              >
                {/* TODO: fetch real specialities from backend, hardcoded for now */}
                <MenuItem value={1}>Architecte</MenuItem>
                <MenuItem value={2}>Test2</MenuItem>
              </Select>
            </FormControl>

            {/* Profile image selector */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="image-label">Avatar</InputLabel>
              <Select
                labelId="image-label"
                id="image"
                value={imageId}
                label="Profile picture"
                onChange={(e) => setImageId(e.target.value as number)}
              >
                {/* TODO: fetch real images from backend, hardcoded for now */}
                <MenuItem value={1}>Avatar 1</MenuItem>
                <MenuItem value={2}>Avatar 2</MenuItem>
              </Select>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold' }}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage;
