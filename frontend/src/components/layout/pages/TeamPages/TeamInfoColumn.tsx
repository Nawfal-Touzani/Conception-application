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

// Sous-composant réutilisable pour afficher une ligne label/valeur
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

      <Paper elevation={0} sx={teamPageSx.infoCard}>
        <InfoRow label="Nom :" value={team?.name ?? '—'} />
        <InfoRow label="Responsable :" value={team?.responsibleTag ?? '—'} />
        <InfoRow
          label="Second responsable :"
          value={team?.secondResponsibleTag ?? '—'}
        />
        <InfoRow
          label="Date de création :"
          value={formatDate(team?.creationDate)}
        />

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
