import { Box, Paper, Typography } from '@mui/material';
import { Tournament } from '../../../types/tournament.types';

interface TournamentCardProps {
  tournament: Tournament;
}

// Maps the backend status enum to a human-readable French label
const statusLabel: Record<string, string> = {
  PREPARATION: 'Prochain',
  IN_PROGRESS: 'À la une',
  FINISHED: 'Dernier',
  CANCELLED: 'Annulé',
};

const stateLabel: Record<string, string> = {
  PREPARATION: 'Inscriptions ouvertes',
  IN_PROGRESS: 'En cours',
  FINISHED: 'Terminé',
  CANCELLED: 'Annulé',
};

// Formats a LocalDateTime string from Spring into a readable date (ex: "5 janv.")
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'short',
  });

// Displays a single tournament card — extracted from HomePage to avoid JSX repetition
const TournamentCard = ({ tournament }: TournamentCardProps) => (
  <Paper
    sx={{
      p: 1,
      borderRadius: '10px',
      width: 200,
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
      }}
    >
      <Typography variant="h6" fontWeight="bold" fontSize="1.2rem">
        {tournament.name}
      </Typography>

      <Typography variant="caption" display="block" mb={3} fontSize="0.8rem">
        {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
      </Typography>

      <Typography variant="body1" fontWeight="bold" mb={3} fontSize="1.1rem">
        {stateLabel[tournament.status]}
      </Typography>

      {tournament.maxParticipant != null && (
        <>
          <Typography variant="caption" display="block">
            TEAMS
          </Typography>
          <Typography variant="body2" mb={1} fontWeight="bold" fontSize="1rem">
            {tournament.maxParticipant}
          </Typography>
        </>
      )}
    </Box>
  </Paper>
);

export default TournamentCard;
