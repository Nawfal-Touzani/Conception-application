import { Box, Paper, Typography } from '@mui/material';
import { TournamentCard } from '../../../types/tournament.types';
import {
  statusLabel,
  formatDate,
  getInfoLabel,
  getInfoValue,
  getStateLabel,
  getTeamsValue,
} from '../../../utils/TournamentCard/TournamentCard.utils';

const TournamentCardProps = ({ tournament }: TournamentCard) => (
  <Paper
    sx={{
      p: 1,
      borderRadius: '10px',
      width: 280,
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
    }}
  >
    {/* Status badge */}
    <Box
      sx={{
        backgroundColor: '#1e2a44',
        color: 'white',
        borderRadius: '8px',
        py: 1.5,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" fontWeight="bold">
        {statusLabel[tournament.status]}
      </Typography>
    </Box>

    {/* Tournament details */}
    <Box
      sx={{
        backgroundColor: '#1e2a44',
        color: 'white',
        borderRadius: '8px',
        p: 2,
        flexGrow: 1,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 260,
      }}
    >
      <Typography variant="h6" fontWeight="bold" fontSize="1.2rem">
        {tournament.name}
      </Typography>

      <Typography variant="caption" display="block" mb={2} fontSize="0.8rem">
        {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
      </Typography>

      <Typography variant="caption" display="block" fontSize="0.6rem">
        {getInfoLabel(tournament)}
      </Typography>

      <Typography variant="body1" fontWeight="bold" mb={2} fontSize="1.3rem">
        {getInfoValue(tournament)}
      </Typography>

      <Box sx={{ mt: 'auto' }}>
        <Typography variant="caption" display="block" fontSize="0.6rem">
          TEAMS
        </Typography>

        <Typography variant="body2" mb={2} fontWeight="bold" fontSize="1rem">
          {getTeamsValue(tournament)}
        </Typography>

        <Typography variant="body1" fontWeight="bold" fontSize="1.1rem">
          {getStateLabel(tournament)}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

export default TournamentCardProps;
