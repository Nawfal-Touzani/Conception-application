import { AppBar, Toolbar, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Notre super hook !

const NavBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // On récupère l'utilisateur et la fonction de déconnexion

  return (
    <AppBar position="static" sx={{ backgroundColor: '#1e1e1e' }}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 'bold' }}
        >
          VINCI ARENA
        </Typography>

        <Button color="inherit" onClick={() => navigate('/')}>
          Accueil
        </Button>

        {/* Si l'utilisateur est connecté, on affiche son Tag et le bouton Logout */}
        {user ? (
          <>
            <Typography variant="body1" sx={{ mx: 2, color: 'primary.main' }}>
              [{user.tag}]
            </Typography>
            <Button
              color="inherit"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Se déconnecter
            </Button>
          </>
        ) : (
          /* Sinon, on affiche les boutons Login / Register */
          <>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Connexion
            </Button>
            <Button color="inherit" onClick={() => navigate('/register')}>
              Inscription
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
