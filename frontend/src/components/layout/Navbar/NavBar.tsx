import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  IconButton,
  Badge,
} from '@mui/material';
import logo from '../../../assets/images/logo.png';
import member from '../../../assets/images/member.png';
import notifLogo from '../../../assets/images/notif-logo.png';
import { NavBarProps } from '../../../types/navbar.types';

const NavBar = ({
  user,
  unreadCount,
  isTournamentsPage,
  isTeamPage,
  isAdminPage,
  isProfilePage,
  isCreateTournamentPage,
  onNavigate,
  onLogout,
}: NavBarProps) => {
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
            onClick={() => onNavigate('/')}
          />

          {/* Tournois */}
          <Button
            onClick={() => onNavigate('/tournaments')}
            sx={{
              backgroundColor: isTournamentsPage ? '#d8a46b' : '#1e2a44',
              color: 'white',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 'bold',
              px: 5,
              '&:hover': {
                backgroundColor: isTournamentsPage ? '#c38d54' : '#151e32',
              },
            }}
          >
            Tournois
          </Button>

          {/* Mon équipe (visible only if logged in) */}
          {user && (
            <Button
              onClick={() => onNavigate('/team')}
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
              onClick={() => onNavigate('/admin')}
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
              onClick={() => onNavigate('/tournament/create')}
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
          {user ? (
            <>
              {/* Notifications logo + counter */}
              <IconButton
                onClick={() => onNavigate('/notifications')}
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
                  onClick={() => onNavigate('/members/me')}
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
                  onClick={onLogout}
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
              {/* Login */}
              <Button
                onClick={() => onNavigate('/login')}
                sx={{
                  backgroundColor: 'white',
                  color: '#1e2a44',
                  border: '1px solid #1e2a44',
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
                onClick={() => onNavigate('/register')}
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
