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
import { useAuth } from '../../contexts/useAuth'; // hook
import logo from '../../assets/images/logo.png';
import member from '../../assets/images/member.png';
import { useState, useEffect } from 'react';
import { getNotifications } from '../../services/notifications.service';
import notifLogo from '../../assets/images/notif-logo.png';

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth(); // Get user info and logout function from context
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count when user is logged in
  // Why not fetch it in the notifications page ? Because we want to update the count in real time when the user receives a new notification, without having to refresh the page
  // Why not separate the fetch logic in a different file
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
  const isProfilePage = location.pathname === '/members/me';
  const isCreateTournamentPage = location.pathname === '/tournament/create';

  return (
    <AppBar position="static" sx={{ backgroundColor: '#ffffff', boxShadow: 1 }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo and buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {/* Logo */}
          <img
            src={logo}
            alt="Logo site"
            style={{ height: '40px', cursor: 'pointer' }}
            onClick={() => navigate('/')}
          />

          {/* "Tournois" Button (Commented for now) */}
          {/*
          <Button
            onClick={() => navigate('/tournaments')} // Adjust route later
            sx={{
              backgroundColor: '#1e2a44',
              color: 'white',
              borderRadius: '10px',
              textTransform: 'none', // Prevents default uppercase text
              fontWeight: 'bold',
              px: 5,
              '&:hover': { backgroundColor: '#151e32' },
            }}
          >
            Tournois
          </Button>
          */}

          {/* Mon équipe (visible only if logged in) */}
          {user && (
            <Button
              onClick={() => navigate('/team')}
              sx={{
                backgroundColor: isTeamPage ? '#e2ab73' : '#1e2a44',
                color: 'white',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 5,
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

          {user && user.role === 'ADMIN' && (
            <Button
              onClick={() => navigate('/tournament/create')}
              sx={{
                backgroundColor: isCreateTournamentPage ? '#d8a46b' : '#1e2a44',
                color: 'white',
                borderRadius: '10px',
                textTransform: 'none',
                fontWeight: 'bold',
                px: 5,
                '&:hover': {
                  backgroundColor: isCreateTournamentPage
                    ? '#c38d54'
                    : '#151e32',
                },
              }}
            >
              Créer un tournoi
            </Button>
          )}
        </Box>

        {/* Auth buttons or User info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* If user is logged in : Only show the tag + image */}
          {user ? (
            <>
              {/* Notifications logo + counter */}
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

              {/* Tag */}
              <Typography
                variant="body1"
                sx={{ color: '#1e2a44', fontWeight: 'bold', px: 3 }}
              >
                {user.tag}
              </Typography>

              {/* Profile (only if not on profile page) */}
              {!isProfilePage && (
                <Box
                  onClick={() => navigate('/members/me')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: '#1e2a44',
                    },
                  }}
                >
                  <img
                    src={member}
                    alt="Profile picture"
                    style={{
                      height: '40px',
                      width: '40px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </Box>
              )}

              {/* Log out (only if on profile page) */}
              {isProfilePage && (
                <Button
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  sx={{
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    px: 4,
                  }}
                >
                  Se déconnecter
                </Button>
              )}
            </>
          ) : (
            <>
              {/* If user is NOT logged in */}
              {/* Login */}
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
                }}
              >
                Se connecter
              </Button>

              {/* Register */}
              <Button
                onClick={() => navigate('/register')}
                sx={{
                  backgroundColor: '#1e2a44',
                  color: 'white',
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 5,
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
