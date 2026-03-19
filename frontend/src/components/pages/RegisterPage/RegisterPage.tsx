import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import { useAuth } from '../../../contexts/useAuth';

import { Speciality } from '../../../types/speciality.types';
import { ProfileImage } from '../../../types/image.types';
import * as specialityService from '../../../services/speciality/speciality.service';
import * as imageService from '../../../services/image/image.service';

// reusable styles for all input fields
const inputSx = {
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
  '& .MuiSelect-icon': {
    color: 'white',
  },
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [specialities, setSpecialities] = useState<Speciality[]>([]);
  const [avatars, setAvatars] = useState<ProfileImage[]>([]);

  const [email, setEmail] = useState('');
  const [tag, setTag] = useState('');
  const [password, setPassword] = useState('');
  const [specialityId, setSpecialityId] = useState<number | ''>('');
  const [imageId, setImageId] = useState<number | ''>('');

  const [error, setError] = useState<string | null>(null);

  // fetch images & specialities
  // why not in a separate service?
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [specsData, imagesData] = await Promise.all([
          specialityService.getAll(),
          imageService.getAll(),
        ]);

        setSpecialities(specsData);
        setAvatars(imagesData);
      } catch (err) {
        setError('Impossible de charger les spécialités et les avatars.');
      }
    };

    fetchFormData();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email || !tag || !password || specialityId === '' || imageId === '') {
      return setError('Veuillez remplir tous les champs et choisir un avatar.');
    }

    try {
      await register({
        email,
        password,
        tag,
        imageId: Number(imageId),
        specialityId: Number(specialityId),
      });
      navigate('/login');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inattendue s'est produite.");
      }
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: '#1e2a44',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Box display="flex" flexDirection="column" alignItems="center">
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: '10px',
              width: '100%',
              maxWidth: 1000,
            }}
          >
            {error}
          </Alert>
        )}

        {/* Global */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          {/* 2 cards aligned */}
          <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            gap={4}
            alignItems="flex-start"
          >
            {/* Left card */}
            <Paper
              elevation={10}
              sx={{
                width: 450,
                borderRadius: '10px',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                fontWeight="bold"
                color="#1e2a44"
              >
                S'inscrire
              </Typography>

              <TextField
                label="Adresse email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="filled"
                InputProps={{ disableUnderline: true }}
                sx={inputSx}
              />

              <TextField
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="filled"
                InputProps={{ disableUnderline: true }}
                sx={inputSx}
              />

              <TextField
                label="Tag en jeu"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                variant="filled"
                InputProps={{ disableUnderline: true }}
                sx={inputSx}
              />

              <FormControl variant="filled" fullWidth sx={inputSx}>
                <InputLabel id="speciality-label">Spécialité</InputLabel>
                <Select
                  labelId="speciality-label"
                  value={specialityId}
                  onChange={(e) => setSpecialityId(e.target.value as number)}
                  disableUnderline
                  MenuProps={{
                    anchorOrigin: {
                      vertical: 'bottom',
                      horizontal: 'left',
                    },
                    transformOrigin: {
                      vertical: 'top',
                      horizontal: 'left',
                    },

                    PaperProps: {
                      sx: {
                        maxHeight: 150, // limit the size for scrolling
                        backgroundColor: '#1a2744',
                        color: 'white',
                        '& .MuiMenuItem-root:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                        '& .Mui-selected': {
                          backgroundColor:
                            'rgba(255, 255, 255, 0.2) !important',
                        },
                      },
                    },
                  }}
                >
                  {specialities.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name.charAt(0).toUpperCase() + s.name.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            {/* Right card */}
            <Paper
              elevation={10}
              sx={{
                width: 450,
                borderRadius: '10px',
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <Typography
                variant="h4"
                component="h1"
                fontWeight="bold"
                color="#1e2a44"
              >
                Choisir un avatar
              </Typography>

              {/* Avatars */}
              <Box
                display="flex"
                flexWrap="wrap"
                gap={2}
                justifyContent="center"
              >
                {avatars.map((avatar) => (
                  <Box
                    key={avatar.id}
                    component="img"
                    src={`http://localhost:3000${avatar.url}`}
                    alt={`Avatar ${avatar.id}`}
                    onClick={() => setImageId(avatar.id)}
                    sx={{
                      width: 60,
                      height: 60,
                      objectFit: 'contain',
                      boxSizing: 'border-box',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border:
                        imageId === avatar.id
                          ? '3px solid #d32f2f'
                          : '1px solid black',
                      transition: 'all 0.1s ease-in-out',
                      '&:hover': {
                        transform: 'scale(1.3)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>

          {/* Register button */}
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
              px: 5,
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
            }}
          >
            S'inscrire
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default RegisterPage;
