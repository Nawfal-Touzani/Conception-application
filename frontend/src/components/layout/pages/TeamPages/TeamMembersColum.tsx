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
  // Hook React Router qui permet la navigation programmatique vers une autre route
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

      {/* Affichage conditionnel de l'Alert d'erreur — `onClose` remet l'erreur
          à null pour faire disparaître l'alerte */}
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

      {/* `disablePadding` supprime le padding par défaut de la List MUI */}
      <List
        disablePadding
        sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        {members.map((member) => {
          // Vérifie si ce membre est le responsable actuel de l'équipe
          // pour conditionner l'affichage du bouton "Nommer"
          const isCurrentUser = member.gameTag === team?.responsibleTag;

          return (
            // `key` sur le gameTag (identifiant unique) plutôt que l'index
            // pour éviter les bugs de reconciliation React sur les listes mutables
            <ListItem key={member.gameTag} sx={teamPageSx.memberItem}>
              <ListItemAvatar sx={{ minWidth: 60 }}>
                <Avatar
                  // Concaténation de l'URL du serveur local avec le chemin relatif de l'avatar
                  src={`http://localhost:3000${member.avatarUrl}`}
                  alt={member.gameTag}
                  // Navigation vers le profil du membre au clic sur l'avatar
                  onClick={() => navigate(`/members/${member.memberId}`)}
                  sx={{ width: 50, height: 50, cursor: 'pointer' }}
                />
              </ListItemAvatar>

              <ListItemText
                // `padStart(3, '0')` formate l'id en 3 chiffres minimum (ex: 7 → "007")
                primary={`${member.gameTag}#${String(member.memberId).padStart(3, '0')}`}
                onClick={() => navigate(`/members/${member.memberId}`)}
                sx={teamPageSx.gameTag}
                // `primaryTypographyProps` permet de styler directement le Typography
                // interne généré par ListItemText sans wrapper supplémentaire
                primaryTypographyProps={{
                  fontSize: '1.2rem',
                  fontWeight: 500,
                  color: '#1a2744',
                }}
              />

              <Typography
                sx={{
                  fontSize: '0.8rem',
                  // Style dynamique selon la disponibilité du membre
                  color: member.isAvailable ? '#4caf50' : '#f44336',
                  fontWeight: member.isAvailable ? 'normal' : 'bold',
                  minWidth: 110,
                }}
              >
                {member.isAvailable ? 'Disponible' : 'Indisponible'}
              </Typography>

              {/* Logique d'affichage conditionnelle à 3 cas :
                  1. Membre est responsable ou second responsable → icône Grade (étoile)
                  2. L'utilisateur connecté est responsable ET ce membre n'est pas lui-même
                     → bouton "Nommer" pour le promouvoir
                  3. Sinon → rien */}
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
                      // `stopPropagation` empêche le clic de remonter au ListItem
                      // et de déclencher la navigation vers le profil
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
