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
import notifLogo from '../../../assets/images/notif-logo.png';
import { NavBarProps } from '../../../types/navbar.types';
import { AccountCircle } from '@mui/icons-material';

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
        {/* Logo */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <img
            src={logo}
            alt="Logo site"
            style={{ height: '40px', cursor: 'pointer' }}
            onClick={() => onNavigate('/')}
          />
        </Box>

        {/* Navigation button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Tournois */}
          <Button
            onClick={() => onNavigate('/tournaments')}
            sx={{
              backgroundColor: isTournamentsPage ? '#d8a46b' : '#1e2a44',
              color: 'white',
              borderRadius: '6px',
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
                borderRadius: '6px',
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
              onClick={() => onNavigate('/admin')}
              sx={{
                backgroundColor: isAdminPage ? '#d8a46b' : '#1e2a44',
                color: 'white',
                borderRadius: '6px',
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
                borderRadius: '6px',
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

        {/* Left contener (Auth / User)*/}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
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

              {/* Profile + Logout */}
              {!isProfilePage ? (
                <Button
                  onClick={() => onNavigate('/members/me')}
                  variant="outlined"
                  sx={{
                    color: '#1e2a44',
                    borderColor: '#1e2a44',
                    borderWidth: '2px',
                    borderRadius: '80px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 1.5,
                    '&:hover': {
                      backgroundColor: '#1e2a44',
                      color: '#fff',
                      borderColor: '#1e2a44',
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 'bold', color: 'inherit' }}
                  >
                    {user.tag}
                  </Typography>

                  <AccountCircle sx={{ fontSize: 32 }} />
                </Button>
              ) : (
                <Button
                  onClick={onLogout}
                  variant="outlined"
                  sx={{
                    borderColor: '#d32f2f',
                    borderWidth: '2px',
                    color: 'black',
                    borderRadius: '6px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    px: 3,
                    '&:hover': {
                      backgroundColor: '#b71c1c',
                    },
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
                  borderRadius: '6px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 4,
                  '&:hover': {
                    backgroundColor: '#dedddd',
                  },
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
                  borderRadius: '6px',
                  border: '1px solid #1e2a44',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  px: 4,
                  '&:hover': {
                    backgroundColor: '#151e32',
                  },
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
