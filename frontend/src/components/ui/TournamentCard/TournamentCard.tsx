import { Box, Paper, Typography } from '@mui/material';
import { TournamentDetails } from '../../../types/tournament.types';

interface TournamentCardProps {
  tournament: TournamentDetails;
}

// Maps the backend status enum to a human-readable French label
const statusLabel: Record<string, string> = {
  PREPARATION: 'Prochain',
  IN_PROGRESS: 'À la une',
  FINISHED: 'Dernier',
  CANCELLED: 'Annulé',
};

// Formats a LocalDateTime string from Spring into a readable date (ex: "5 janv.")
const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'short',
  });

// Differents display possible for a tournament card
const getInfoLabel = (tournament: TournamentDetails): string => {
  if (tournament.status === 'FINISHED') {
    return 'VAINQUEUR';
  }

  if (tournament.status === 'IN_PROGRESS') {
    return 'PHASE';
  }

  if (tournament.status === 'PREPARATION') {
    return 'INSCRIPTIONS';
  }

  return '';
};

const getStateLabel = (tournament: TournamentDetails): string => {
  if (tournament.status === 'PREPARATION') {
    return tournament.isPublic ? 'Ouvert' : 'Fermé';
  }

  if (tournament.status === 'IN_PROGRESS') {
    return 'En cours';
  }

  if (tournament.status === 'FINISHED') {
    return 'Terminé';
  }

  return 'Annulé';
};

const getInfoValue = (tournament: TournamentDetails): string => {
  if (tournament.status === 'FINISHED') {
    return tournament.winnerTeamName ?? 'Non défini';
  }

  if (tournament.status === 'IN_PROGRESS') {
    return 'Inconnue';
  }

  if (tournament.status === 'PREPARATION') {
    return tournament.isPublic ? 'Ouvertes' : 'Fermées';
  }

  return 'Annulé';
};

const getTeamsValue = (tournament: TournamentDetails): string => {
  if (tournament.status === 'PREPARATION') {
    return `${tournament.currentParticipants}/${tournament.maxParticipants}`;
  }

  return `${tournament.currentParticipants}`;
};

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

      <Typography variant="caption" display="block" mb={2} fontSize="0.8rem">
        {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
      </Typography>

      <Typography variant="caption" display="block" fontSize="0.6rem">
        {getInfoLabel(tournament)}
      </Typography>

      <Typography variant="body1" fontWeight="bold" mb={2} fontSize="1.3rem">
        {getInfoValue(tournament)}
      </Typography>

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
  </Paper>
);

export default TournamentCard;
