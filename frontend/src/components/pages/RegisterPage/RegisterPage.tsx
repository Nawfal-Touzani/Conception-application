import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';

import { useRegisterForm } from '../../../hooks/useRegisterForm/useRegisterForm';
import TextFieldStyle from '../../ui/TextFieldStyle/TextFieldStyle'; // Reusable styled TextField
import { inputSx, menuPropsSx } from '../../ui/sharedStyles'; // Reusable styles

const RegisterPage: React.FC = () => {
  const {
    specialities,
    avatars,
    email,
    setEmail,
    tag,
    setTag,
    password,
    setPassword,
    specialityId,
    setSpecialityId,
    imageId,
    setImageId,
    error,
    handleSubmit,
  } = useRegisterForm();

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
            sx={{ mb: 3, borderRadius: '10px', width: '100%', maxWidth: 1000 }}
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
            {/* Left card — text inputs */}
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

              {/* Input fields */}
              <TextFieldStyle
                label="Adresse email"
                type="email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
              />

              <TextFieldStyle
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
              />

              <TextFieldStyle
                label="Tag en jeu"
                value={tag}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTag(e.target.value)
                }
              />

              {/* Select cannot use TextFieldStyle — it's a different MUI component */}
              <FormControl variant="filled" fullWidth sx={inputSx}>
                <InputLabel id="speciality-label">Spécialité</InputLabel>
                <Select
                  labelId="speciality-label"
                  value={specialityId}
                  onChange={(e) => setSpecialityId(e.target.value as number)}
                  disableUnderline
                  MenuProps={menuPropsSx}
                >
                  {specialities.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name.charAt(0).toUpperCase() + s.name.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            {/* Right card — avatar picker */}
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
                      '&:hover': { transform: 'scale(1.3)' },
                    }}
                  />
                ))}
              </Box>
            </Paper>
          </Box>

          {/* Submit button */}
          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 5,
              backgroundColor: 'white',
              color: '#1e2a44',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '1.3rem',
              px: 5,
              '&:hover': { backgroundColor: '#f0f0f0' },
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
