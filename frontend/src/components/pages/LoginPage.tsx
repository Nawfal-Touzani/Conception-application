import { useState, SyntheticEvent, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { AuthContextType } from '../../types';
import { AuthContext } from '../../contexts/AuthContext';

const LoginPage = () => {
  const { loginMember }: AuthContextType = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await loginMember({ email, password }, rememberMe);
      navigate('/');
    } catch (err) {
      console.error('LoginPage::error: ', err);
      setErrorMsg('Identifiants incorrects.');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ maxWidth: 400, mx: 'auto', mt: 4, p: 3, boxShadow: 2 }}
    >
      <Typography variant="h4" mb={2}>
        Se connecter
      </Typography>

      {errorMsg && (
        <Typography color="error" mb={2}>
          {errorMsg}
        </Typography>
      )}

      <TextField
        label="Email"
        id="email"
        type="email"
        fullWidth
        margin="normal"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        required
      />
      <TextField
        label="Password"
        id="password"
        type="password"
        fullWidth
        margin="normal"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        required
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
        }
        label="Se souvenir de moi"
      />

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        S'authentifier
      </Button>
    </Box>
  );
};

export default LoginPage;
