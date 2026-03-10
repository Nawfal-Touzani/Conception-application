import { AppBar, Toolbar, Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // hook
import logo from '../../assets/images/logo.png';
import member from '../../assets/images/member.png';

const NavBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // On récupère l'utilisateur et la fonction de déconnexion

  return (
    <AppBar position="static" sx={{ backgroundColor: '#ffffff', boxShadow: 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo and "Tournois" button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {/* Logo */}
          <img
            src={logo}
            alt="Logo site"
            style={{ height: '40px', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          />

          {/* "Tournois" Button */}
          <Button
            onClick={() => navigate('/tournaments')} // Adjust route later
            sx={{
              backgroundColor: '#1e2a44',
              color: 'white',
              borderRadius: '10px', // Apple-style rounded corners
              textTransform: 'none', // Prevents default uppercase text
              fontWeight: 'bold',
              px: 5, // Horizontal padding
              '&:hover': { backgroundColor: '#151e32' },
            }}
          >
            Tournois
          </Button>

          <Button
            onClick={() => navigate('/team')}
            sx={{
              backgroundColor: '#d8a46b',
              color: 'white',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 'bold',
              px: 5,
              '&:hover': { backgroundColor: '#c38d54' },
            }}
          >
            Mon équipe
          </Button>
        </Box>

        {/* RIGHT SIDE: Auth buttons or User info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              {/* If user is logged in : Only show the tag + image */}
              <Typography
                variant="body1"
                sx={{ color: '#1e2a44', fontWeight: 'bold', px: 3 }}
              >
                {user.tag}
              </Typography>
              <img
                src={member}
                alt="Profile picture"
                style={{ height: '40px', borderRadius: '50%' }}
                onClick={() => navigate('/members/me')}
              />
              <Button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                sx={{
                  backgroundColor: 'white',
                  color: '#1e2a44',
                  border: '2px solid #1e2a44',
                  borderRadius: '50px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 3,
                  '&:hover': { backgroundColor: '#f3f4f6' },
                }}
              >
                Se déconnecter
              </Button>
            </>
          ) : (
            <>
              {/* If user is NOT logged in */}
              <Button
                onClick={() => navigate('/login')}
                sx={{
                  backgroundColor: 'white',
                  color: '#1e2a44',
                  border: '1px solid #1e2a44', // Dark blue border for white button
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 4,
                  '&:hover': { backgroundColor: '#ffffff' },
                }}
              >
                Se connecter
              </Button>

              <Button
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: '#1e2a44',
                  color: 'white',
                  borderRadius: '10px', // No border for this one, as requested
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 5,
                  '&:hover': { backgroundColor: '#151e32' },
                }}
              >
                S'inscrire
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
