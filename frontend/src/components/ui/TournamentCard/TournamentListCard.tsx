import { Paper, Box, Typography, IconButton } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { TournamentDetails } from '../../../types/tournament.types';

type Props = {
  tournament: TournamentDetails;
  onSelect: () => void;
};

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-BE', {
    day: 'numeric',
    month: 'short',
  });

const formatDateFull = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

function getStateLabel(tournament: TournamentDetails): string {
  if (tournament.status === 'PREPARATION') {
    if (!tournament.isPublic) return 'En préparation';
    const deadlinePassed =
      new Date(tournament.registrationDeadline) < new Date();
    const isFull = tournament.currentParticipants >= tournament.maxParticipants;
    if (deadlinePassed || isFull) return 'En préparation';
    return 'Inscriptions ouvertes';
  }
  if (tournament.status === 'IN_PROGRESS') return 'En cours';
  if (tournament.status === 'FINISHED') return 'Terminé';
  return 'Annulé';
}

export default function TournamentListCard({ tournament, onSelect }: Props) {
  return (
    <Paper
      sx={{
        p: 1,
        borderRadius: '10px',
        width: 320,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Box
        sx={{
          backgroundColor: '#1e2a44',
          color: 'white',
          borderRadius: '8px',
          py: 1.5,
          px: 1,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          {tournament.name}
        </Typography>
      </Box>
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
          alignItems: 'center',
        }}
      >
        <Typography variant="caption" display="block" mb={1} fontSize="0.85rem">
          {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
        </Typography>
        <Typography variant="body1" fontWeight="bold" mb={1} fontSize="1.1rem">
          {getStateLabel(tournament)}
        </Typography>
        <Typography
          variant="caption"
          display="block"
          mb={1}
          fontSize="0.8rem"
          sx={{ color: 'rgba(255,255,255,0.7)' }}
        >
          Clôture le {formatDateFull(tournament.registrationDeadline)}
        </Typography>
        {tournament.description && (
          <Typography
            variant="caption"
            display="block"
            mb={1}
            fontSize="0.85rem"
            sx={{
              color: 'rgba(255,255,255,0.7)',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              wordBreak: 'break-all',
            }}
          >
            {tournament.description}
          </Typography>
        )}
        <Typography variant="caption" display="block">
          TEAMS
        </Typography>
        <Typography variant="body2" fontWeight="bold" fontSize="1rem" mb={1}>
          {tournament.currentParticipants}/{tournament.maxParticipants}
        </Typography>
        <Box sx={{ mt: 'auto', pt: 1 }}>
          <IconButton
            onClick={onSelect}
            sx={{
              color: '#fff',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            }}
          >
            <InfoOutlinedIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
}
