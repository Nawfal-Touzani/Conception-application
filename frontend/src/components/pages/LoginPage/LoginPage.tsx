import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import TextFieldStyle from '../../ui/TextFieldStyle/TextFieldStyle'; // Reusable styled TextField
import { useLoginForm } from '../../../hooks/useLoginForm/useLoginForm'; // hook
import { useAuth } from '../../../contexts/useAuth';

const LoginPage: React.FC = () => {
  const { bannedError } = useAuth();

  const {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    error,
    handleSubmit,
  } = useLoginForm();

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

          {/* Forms errors */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
              {error}
            </Alert>
          )}

          {/* Banned account error */}
          {bannedError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
              {bannedError}
            </Alert>
          )}

          <Box display={'flex'} flexDirection="column" gap={2}>
            <TextFieldStyle
              label="Adresse email"
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
