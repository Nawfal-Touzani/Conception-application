import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Button,
  Alert,
} from '@mui/material';
import { Grade } from '@mui/icons-material';
import { TeamDto, TeamMember } from '../../../../types/team.types';
import { teamPageSx } from '../../../../styles/team.styles';
import { useNavigate } from 'react-router-dom';

interface TeamMemberColumnProps {
  members: TeamMember[];
  team: TeamDto | null;
  isResponsible: boolean;
  nominateError: string | null;
  setNominateError: (error: string | null) => void;
  nominateSuccess: string | null;
  setNominateSuccess: (msg: string | null) => void;
  handleNominate: (memberId: number) => void;
}

export const TeamMemberColumn = ({
  members,
  team,
  isResponsible,
  nominateError,
  setNominateError,
  nominateSuccess,
  setNominateSuccess,
  handleNominate,
}: TeamMemberColumnProps) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ width: '40%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={teamPageSx.columnTitle}>
        Membres de l'équipe
      </Typography>

      <Typography
        sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', mb: 1.5 }}
      >
        Tous ({members.length})
      </Typography>

      {nominateError && (
        <Alert
          severity="error"
          onClose={() => setNominateError(null)}
          sx={{ mb: 1.5 }}
        >
          {nominateError}
        </Alert>
      )}

      {nominateSuccess && (
        <Alert
          severity="success"
          onClose={() => setNominateSuccess(null)}
          sx={{ mb: 1.5 }}
        >
          {nominateSuccess}
        </Alert>
      )}

      <List
        disablePadding
        sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        {members.map((member) => {
          // Vérifie si membre est responsable pour savoir si afficher le bouton "nommer"
          const isCurrentUser = member.gameTag === team?.responsibleTag;

          return (
            <ListItem key={member.gameTag} sx={teamPageSx.memberItem}>
              <ListItemAvatar sx={{ minWidth: 60 }}>
                <Avatar
                  src={`http://localhost:3000${member.avatarUrl}`}
                  alt={member.gameTag}
                  onClick={() => navigate(`/members/${member.memberId}`)}
                  sx={{ width: 50, height: 50, cursor: 'pointer' }}
                />
              </ListItemAvatar>

              <ListItemText
                primary={`${member.gameTag}#${String(member.memberId).padStart(3, '0')}`}
                onClick={() => navigate(`/members/${member.memberId}`)}
                sx={teamPageSx.gameTag}
                primaryTypographyProps={{
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  color: '#1a2744',
                }}
              />

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  color: member.isAvailable ? '#4caf50' : '#f44336',
                  fontWeight: member.isAvailable ? 'normal' : 'bold',
                  minWidth: 110,
                }}
              >
                {member.isAvailable ? 'Disponible' : 'Indisponible'}
              </Typography>

              {/* Logique d'affichage soit du bouton nommer, soit de l'étoile si membre déja responsable */}
              {member.gameTag === team?.responsibleTag ||
              member.gameTag === team?.secondResponsibleTag ? (
                <Grade sx={{ ml: 4, mr: 3, color: '#d7a46d' }} />
              ) : (
                isResponsible &&
                !isCurrentUser && (
                  <Button
                    aria-label="Nommer"
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                      // empêche le clic de remonter au ListItem
                      e.stopPropagation();
                      handleNominate(member.memberId);
                    }}
                    sx={teamPageSx.nominateButton}
                  >
                    Nommer
                  </Button>
                )
              )}
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
};
