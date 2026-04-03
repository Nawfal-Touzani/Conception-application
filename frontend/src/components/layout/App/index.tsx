import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import NavBar from '../../../hooks/useNavBar/useNavBar';

const App = () => {
  return (
    // Main Box taking the full height of the screen
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#1e2a44',
      }}
    >
      {/* Our navigation bar will always be visible at the top */}
      <NavBar />

      {/* This is where the React Router magic happens! */}
      {/* Outlet will be replaced by LoginPage, RegisterPage, or HomePage depending on the URL */}
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
