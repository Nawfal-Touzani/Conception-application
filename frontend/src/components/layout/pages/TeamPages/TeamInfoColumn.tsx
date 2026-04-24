import { Box, Typography, Paper, Button, Alert } from '@mui/material';
import { TeamDto } from '../../../../types/team.types';
import { teamPageSx } from '../../../../styles/team.styles';
import { formatDate } from '../../../../utils/TeamFormat/team.utils';

interface TeamInfoColumnProps {
  team: TeamDto | null;
  leaveError: string | null;
  setLeaveError: (error: string | null) => void;
  setConfirmOpen: (open: boolean) => void;
}

// Sous-composant local réutilisable pour afficher une ligne label/valeur
// Défini en dehors du composant principal pour éviter une re-création à chaque render
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
      <Typography sx={teamPageSx.infoRowLabel}>{label}</Typography>
      <Box sx={teamPageSx.infoRowValue}>
        <Typography sx={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

export const TeamInfoColumn = ({
  team,
  leaveError,
  setLeaveError,
  setConfirmOpen,
}: TeamInfoColumnProps) => {
  return (
    <Box sx={{ width: '30%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={teamPageSx.columnTitle}>
        Ma team
      </Typography>

      {/* `elevation={0}` supprime l'ombre portée par défaut du Paper MUI */}
      <Paper elevation={0} sx={teamPageSx.infoCard}>
        {/* Opérateur `??` (nullish coalescing) : affiche '—' si la valeur est
            null ou undefined — plus précis que `||` qui couvre aussi les falsy */}
        <InfoRow label="Nom :" value={team?.name ?? '—'} />
        <InfoRow label="Responsable :" value={team?.responsibleTag ?? '—'} />
        <InfoRow
          label="Second responsable :"
          value={team?.secondResponsibleTag ?? '—'}
        />
        {/* `team?.creationDate` : optional chaining pour éviter un crash
            si `team` est null au moment du rendu */}
        <InfoRow
          label="Date de création :"
          value={formatDate(team?.creationDate)}
        />

        {/* Affichage conditionnel de l'alerte — `onClose` remet leaveError
            à null pour la faire disparaître */}
        {leaveError && (
          <Alert
            severity="warning"
            onClose={() => setLeaveError(null)}
            sx={{ mt: 2, mb: 1 }}
          >
            {leaveError}
          </Alert>
        )}

        <Box sx={{ mt: 2, display: 'flex' }}>
          {/* Le bouton n'ouvre pas directement une Dialog : il délègue au parent
              via setConfirmOpen, qui contrôle la Dialog depuis TeamPage */}
          <Button
            variant="contained"
            onClick={() => setConfirmOpen(true)}
            sx={teamPageSx.leaveButton}
          >
            Quitter
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};
