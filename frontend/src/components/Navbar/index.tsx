import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  IconButton,
  Badge,
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // hook
import logo from '../../assets/images/logo.png';
import member from '../../assets/images/member.png';
import { useState } from 'react';
import { getNotifications } from '../../services/notifications.service';
import { useEffect } from 'react';
import notifLogo from '../../assets/images/notif-logo.png';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // On récupère l'utilisateur et la fonction de déconnexion
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count when user is logged in
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCount = async () => {
      const unread = await getNotifications(user.id, user.token, false);
      setUnreadCount(unread.length);
    };

    fetchUnreadCount();
  }, [user, location]);

  const isTeamPage = location.pathname === '/team';
  const isAdminPage = location.pathname === '/admin';

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

          {/* Mon équipe (visible seulement si connecté) */}
          {user && (
            <Button
              onClick={() => navigate('/team')}
              sx={{
                backgroundColor: isTeamPage ? '#d8a46b' : '#1e2a44',
                color: 'white',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 5,
                '&:hover': {
                  backgroundColor: isTeamPage ? '#c38d54' : '#151e32',
                },
              }}
            >
              Mon équipe
            </Button>
          )}

          {user && user.role === 'ADMIN' && (
            <Button
              onClick={() => navigate('/admin')}
              sx={{
                backgroundColor: isAdminPage ? '#d8a46b' : '#1e2a44',
                color: 'white',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 5,
                '&:hover': {
                  backgroundColor: isAdminPage ? '#c38d54' : '#151e32',
                },
              }}
            >
              Administration
            </Button>
          )}
        </Box>

        {/* RIGHT SIDE: Auth buttons or User info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {user ? (
            <>
              {/* If user is logged in : Only show the tag + image */}

              <IconButton
                onClick={() => navigate('/notifications')}
                sx={{ color: '#1e2a44' }}
              >
                <Badge badgeContent={unreadCount} color="error">
                  <img
                    src={notifLogo}
                    alt="Notifications"
                    style={{ height: '24px' }}
                  />
                </Badge>
              </IconButton>

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
