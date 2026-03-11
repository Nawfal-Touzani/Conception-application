import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  InputAdornment,
  Snackbar,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../contexts/AuthContext';

// ✅ Matches TeamResponseDto from the backend
type TeamDto = {
  id: number;
  name: string;
  responsibleTag: string | null;
  secondResponsibleTag: string | null;
  creationDate: string | null;
};

type Props = {
  onTeamCreated: () => void;
};

const API = '/api';

const JoinOrCreateTeam = ({ onTeamCreated }: Props) => {
  const { user } = useAuth();

  const authHeaders = { Authorization: `Bearer ${user?.token ?? ''}` };

  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamDto[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [teamName, setTeamName] = useState('');
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: 'success' | 'error';
  }>({ open: false, msg: '', severity: 'success' });

  useEffect(() => {
    if (!user) return;
    fetch(`${API}/teams`, { headers: authHeaders })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTeams(data);
          setFilteredTeams(data);
        }
      })
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredTeams(teams);
    } else {
      setFilteredTeams(
        teams.filter((t) =>
          t.name.toLowerCase().includes(search.toLowerCase()),
        ),
      );
    }
    setSelectedTeamId(null);
  }, [search, teams]);

  const createTeam = async () => {
    if (!teamName.trim()) return;
    try {
      const res = await fetch(`${API}/teams`, {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName }),
      });

      if (res.status === 201) {
        onTeamCreated();
      } else if (res.status === 409) {
        setSnack({
          open: true,
          msg: "Ce nom d'équipe existe déjà.",
          severity: 'error',
        });
      } else if (res.status === 400) {
        setSnack({
          open: true,
          msg: "Nom d'équipe invalide.",
          severity: 'error',
        });
      } else {
        setSnack({
          open: true,
          msg: 'Erreur lors de la création.',
          severity: 'error',
        });
      }
    } catch {
      setSnack({
        open: true,
        msg: 'Impossible de joindre le serveur.',
        severity: 'error',
      });
    }
  };

  const joinTeam = async () => {
    if (selectedTeamId === null) return;
    try {
      const res = await fetch(
        `${API}/teams/${selectedTeamId}/membership-requests`,
        {
          method: 'POST',
          headers: authHeaders,
        },
      );

      if (res.ok || res.status === 201) {
        setSnack({
          open: true,
          msg: 'Demande envoyée avec succès !',
          severity: 'success',
        });
        setSelectedTeamId(null);
      } else {
        setSnack({
          open: true,
          msg: "Erreur lors de l'envoi.",
          severity: 'error',
        });
      }
    } catch {
      setSnack({
        open: true,
        msg: 'Impossible de joindre le serveur.',
        severity: 'error',
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1a2744',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 4,
          width: '100%',
          maxWidth: 860,
          alignItems: 'flex-start',
        }}
      >
        {/* ── Left: Rejoindre ── */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            borderRadius: '12px',
            p: 3.5,
            backgroundColor: '#fff',
            minHeight: 360,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#1a2744',
              mb: 0.5,
              textAlign: 'center',
            }}
          >
            Rejoindre une team
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 3,
              backgroundColor: '#1a2744',
              borderRadius: 2,
              mx: 'auto',
              mb: 2.5,
            }}
          />

          <TextField
            fullWidth
            placeholder="Nom de l'équipe"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ color: '#1a2744' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: '6px', fontSize: '0.9rem' },
            }}
            sx={{ mb: 1 }}
          />

          <Box
            sx={{
              flex: 1,
              backgroundColor: '#1a2744',
              borderRadius: '8px',
              p: 1,
              mb: 2,
              minHeight: 160,
              overflow: 'auto',
            }}
          >
            <List disablePadding>
              {filteredTeams.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="Aucune équipe trouvée"
                    primaryTypographyProps={{
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '0.85rem',
                    }}
                  />
                </ListItem>
              )}
              {filteredTeams.map((team) => (
                <ListItem
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: '6px',
                    px: 1.5,
                    py: 0.6,
                    backgroundColor:
                      selectedTeamId === team.id
                        ? 'rgba(255,255,255,0.2)'
                        : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                    transition: 'background 0.15s',
                  }}
                >
                  <ListItemText
                    primary={team.name}
                    primaryTypographyProps={{
                      color: '#fff',
                      fontSize: '0.9rem',
                      fontWeight: selectedTeamId === team.id ? 600 : 400,
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              disabled={selectedTeamId === null}
              onClick={joinTeam}
              sx={{
                backgroundColor: '#1a2744',
                borderRadius: '6px',
                px: 3,
                py: 1,
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#243358' },
                '&:disabled': { backgroundColor: '#ccc', color: '#888' },
              }}
            >
              Envoyer demande
            </Button>
          </Box>
        </Paper>

        {/* ── Right: Créer ── */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            borderRadius: '12px',
            p: 3.5,
            backgroundColor: '#fff',
            minHeight: 360,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#1a2744',
              mb: 0.5,
              textAlign: 'center',
            }}
          >
            Créer une team
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 3,
              backgroundColor: '#1a2744',
              borderRadius: 2,
              mx: 'auto',
              mb: 3,
            }}
          />

          <Typography
            sx={{
              color: '#1a2744',
              fontWeight: 600,
              mb: 1.5,
              fontSize: '0.95rem',
            }}
          >
            Entrez le nom de votre futur équipe :
          </Typography>

          <TextField
            fullWidth
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createTeam()}
            size="small"
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#e8eaf0',
                borderRadius: '6px',
                '& fieldset': { border: 'none' },
              },
            }}
          />

          <Box sx={{ mt: 'auto', textAlign: 'center' }}>
            <Button
              variant="contained"
              disabled={!teamName.trim()}
              onClick={createTeam}
              sx={{
                backgroundColor: '#1a2744',
                borderRadius: '6px',
                px: 4,
                py: 1,
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#243358' },
                '&:disabled': { backgroundColor: '#ccc', color: '#888' },
              }}
            >
              Créer
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JoinOrCreateTeam;
