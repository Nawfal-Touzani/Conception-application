import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Alert,
  Autocomplete,
  Divider,
} from '@mui/material';
import { useJoinOrCreateTeam } from '../../../../hooks/useJoinOrCreateTeam/useJoinOrCreateTeam';
import { joinOrCreateTeamSx } from '../../../../styles/joinOrCreateTeam.styles';
import { TeamDto } from '../../../../types/team.types';

type Props = {
  onTeamCreated: () => void;
};

const JoinOrCreateTeam = ({ onTeamCreated }: Props) => {
  const {
    teams,
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
    <Box
      sx={{
        ...joinOrCreateTeamSx.root,
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {/* Title */}
      <Box sx={{ textAlign: 'center', width: '100%', mt: -9 }}>
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            fontWeight: 900,
            textAlign: 'center',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mb: 4,
            '&::before, &::after': {
              content: '""',
              height: '3px',
              width: '50px',
              backgroundColor: 'white',
            },
          }}
        >
          Mon équipe
        </Typography>
      </Box>

      <Box
        sx={{
          ...joinOrCreateTeamSx.layout,
          maxWidth: 1000,
          display: 'flex',
          alignItems: 'stretch',
          position: 'relative',
        }}
      >
        {/* ── Left: Rejoindre ── */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: '#fff', mb: 3, textAlign: 'center' }}
          >
            Rejoindre une team
          </Typography>

          <Paper
            elevation={0}
            sx={{
              ...joinOrCreateTeamSx.card,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={joinOrCreateTeamSx.divider} />

            {/* Error message in the left box */}
            {snack.open && snack.section === 'join' && (
              <Alert severity={snack.severity} onClose={closeSnack}>
                {snack.msg}
              </Alert>
            )}

            <Autocomplete
              fullWidth
              size="small"
              options={teams}
              getOptionLabel={(option: TeamDto) => option.name}
              value={teams.find((t) => t.id === selectedTeamId) || null}
              onChange={(_event, newValue) => {
                closeSnack();
                setSelectedTeamId(newValue ? newValue.id : '');
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Rechercher ou sélectionner une équipe"
                  sx={joinOrCreateTeamSx.select}
                />
              )}
              sx={{ mt: 2 }}
              noOptionsText="Aucune équipe trouvée"
            />

            <Box sx={{ textAlign: 'center', mt: 'auto', pt: 4 }}>
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
        </Box>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 6,
            borderColor: 'rgba(255,255,255,0.2)',
            borderWidth: '1.5px',
          }}
        />

        {/* ── Right: Créer team */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, color: '#fff', mb: 3, textAlign: 'center' }}
          >
            Créer une team
          </Typography>

          <Paper
            elevation={0}
            sx={{
              ...joinOrCreateTeamSx.card,
              width: '100%',
              minHeight: 320,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={joinOrCreateTeamSx.divider} />

            {/* Error message in the right box */}
            {snack.open && snack.section === 'create' && (
              <Alert severity={snack.severity} onClose={closeSnack}>
                {snack.msg}
              </Alert>
            )}

            <Typography
              sx={{
                color: '#1a2744',
                fontWeight: 600,
                fontSize: '0.95rem',
                mt: 2,
              }}
            >
              Entrez le nom de votre future équipe :
            </Typography>

            <TextField
              fullWidth
              value={teamName}
              placeholder="Ex: TEAM_BETA"
              onChange={(e) => {
                closeSnack();
                setTeamName(e.target.value);
              }}
              onKeyDown={(e) => e.key === 'Enter' && createTeam()}
              size="small"
              sx={{ ...joinOrCreateTeamSx.teamNameInput, mt: 1 }}
            />

            <Box sx={{ textAlign: 'center', mt: 'auto', pt: 4 }}>
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
      </Box>
    </Box>
  );
};

export default JoinOrCreateTeam;
