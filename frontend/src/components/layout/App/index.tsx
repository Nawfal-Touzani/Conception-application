import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import NavBar from '../../../hooks/useNavBar/useNavBar';

const App = () => {
  return (
    // Box principale qui occupe toute la hauteur de l'écran
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#1e2a44',
      }}
    >
      {/* La barre de navigation toujours visible en haut de page */}
      <NavBar />

      {/* `Outlet` est un composant React Router qui agit comme un emplacement dynamique :
          il est remplacé par le composant de la route active (LoginPage, RegisterPage, HomePage…)
          selon l'URL courante */}
      <Box
        component="main"
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default App;
