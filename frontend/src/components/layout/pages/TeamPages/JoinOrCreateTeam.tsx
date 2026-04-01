import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ListSubheader,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useAuth } from '../../../../contexts/useAuth';
import * as teamService from '../../../../services/team.service';
import { TeamDto } from '../../../../types/team.types';

type Props = {
  onTeamCreated: () => void;
};

const JoinOrCreateTeam = ({ onTeamCreated }: Props) => {
  const { user } = useAuth();

  //  Fix: extraire le token en variable primitive stable
  // Un objet authHeaders recréé à chaque render causerait une boucle infinie
  // si mis en dépendance de useEffect. On utilise le token (string) à la place.
  const token = user?.token ?? '';

  const [teams, setTeams] = useState<TeamDto[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<TeamDto[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
  const [teamName, setTeamName] = useState('');
  const [snack, setSnack] = useState<{
    open: boolean;
    msg: string;
    severity: 'success' | 'error';
  }>({ open: false, msg: '', severity: 'success' });

  //  Fix: dépendance sur `token` (string) et non sur `authHeaders` (objet recréé à chaque render)
  useEffect(() => {
    if (!token) return;
    teamService
      .getTeams(token)
      .then((data) => {
        if (Array.isArray(data)) {
          setTeams(data);
          setFilteredTeams(data);
        }
      })
      .catch(() => {});
  }, [token]);

  // Filtre la liste affichée a chaque fois que la recherche change
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
    setSelectedTeamId('');
  }, [search, teams]);

  // Creer une equipe
  const createTeam = async () => {
    if (!teamName.trim()) return;
    try {
      const res = await teamService.createTeam(token, teamName);

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

  // Rejoindre une equipe
  const joinTeam = async () => {
    if (selectedTeamId === '') return;
    try {
      const res = await teamService.sendJoinRequest(token, selectedTeamId);

      if (res.ok || res.status === 201) {
        setSnack({
          open: true,
          msg: 'Demande envoyée avec succès !',
          severity: 'success',
        });
        setSelectedTeamId('');
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
        flexGrow: 1,
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
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
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
              mt: -1,
            }}
          />

          {/* Liste déroulante avec recherche intégrée */}
          <FormControl fullWidth size="small">
            <InputLabel id="team-select-label">
              Sélectionner une équipe
            </InputLabel>
            <Select
              labelId="team-select-label"
              value={selectedTeamId}
              label="Sélectionner une équipe"
              onChange={(e) => setSelectedTeamId(e.target.value as number)}
              sx={{ borderRadius: '6px', fontSize: '0.9rem' }}
              MenuProps={{
                autoFocus: false,
                PaperProps: {
                  sx: { maxHeight: 320 },
                },
              }}
            >
              <ListSubheader sx={{ p: 1, lineHeight: 'normal' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  autoFocus
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon
                          sx={{ fontSize: '1rem', color: '#1a2744' }}
                        />
                      </InputAdornment>
                    ),
                    sx: { fontSize: '0.85rem', borderRadius: '6px' },
                  }}
                />
              </ListSubheader>
              {filteredTeams.length === 0 ? (
                <MenuItem disabled value="">
                  <Typography
                    sx={{ color: 'rgba(0,0,0,0.4)', fontSize: '0.85rem' }}
                  >
                    Aucune équipe trouvée
                  </Typography>
                </MenuItem>
              ) : (
                filteredTeams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="contained"
              disabled={selectedTeamId === ''}
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
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
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
              mt: -1,
            }}
          />

          <Typography
            sx={{ color: '#1a2744', fontWeight: 600, fontSize: '0.95rem' }}
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
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#e8eaf0',
                borderRadius: '6px',
                '& fieldset': { border: 'none' },
              },
            }}
          />

          <Box sx={{ textAlign: 'center', mt: 'auto' }}>
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
