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
import { useJoinOrCreateTeam } from '../../../../hooks/useJoinOrCreateTeam/useJoinOrCreateTeam';
import { joinOrCreateTeamSx } from '../../../../styles/joinOrCreateTeam.styles';

type Props = {
  onTeamCreated: () => void;
};

const JoinOrCreateTeam = ({ onTeamCreated }: Props) => {
  const {
    filteredTeams,
    search,
    setSearch,
    selectedTeamId,
    setSelectedTeamId,
    teamName,
    setTeamName,
    snack,
    closeSnack,
    createTeam,
    joinTeam,
  } = useJoinOrCreateTeam(onTeamCreated);

  return (
    <Box sx={joinOrCreateTeamSx.root}>
      <Box sx={joinOrCreateTeamSx.layout}>
        {/* ── Left: Rejoindre ── */}
        <Paper elevation={0} sx={joinOrCreateTeamSx.card}>
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
          <Box sx={joinOrCreateTeamSx.divider} />

          <FormControl fullWidth size="small">
            <InputLabel id="team-select-label">
              Sélectionner une équipe
            </InputLabel>
            <Select
              labelId="team-select-label"
              value={selectedTeamId}
              label="Sélectionner une équipe"
              onChange={(e) => setSelectedTeamId(e.target.value as number)}
              sx={joinOrCreateTeamSx.select}
              MenuProps={{
                autoFocus: false,
                PaperProps: { sx: { maxHeight: 320 } },
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
                    sx: joinOrCreateTeamSx.searchInput,
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
              sx={joinOrCreateTeamSx.button}
            >
              Envoyer demande
            </Button>
          </Box>
        </Paper>

        {/* ── Right: Créer ── */}
        <Paper elevation={0} sx={joinOrCreateTeamSx.card}>
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
          <Box sx={joinOrCreateTeamSx.divider} />

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
            sx={joinOrCreateTeamSx.teamNameInput}
          />

          <Box sx={{ textAlign: 'center', mt: 'auto' }}>
            <Button
              variant="contained"
              disabled={!teamName.trim()}
              onClick={createTeam}
              sx={{ ...joinOrCreateTeamSx.button, px: 4 }}
            >
              Créer
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack.severity} onClose={closeSnack}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default JoinOrCreateTeam;
