import {
  Box,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import JoinOrCreateTeam from './JoinOrCreateTeam';
import { useTeam } from '../../../../hooks/useTeam/useTeam';
import { teamPageSx } from '../../../../styles/team.styles';
import { TeamInfoColumn } from './TeamInfoColumn';
import { TeamMemberColumn } from './TeamMembersColum';
import { TeamTournamentColumn } from './TeamTournamentsColumn';

const TeamPage = () => {
  const {
    team,
    members,
    hasTeam,
    isSolo,
    isResponsible,
    confirmOpen,
    setConfirmOpen,
    leaveLoading,
    leaveError,
    setLeaveError,
    nominateError,
    setNominateError,
    nominateSuccess,
    setNominateSuccess,
    tournamentsInProgress,
    tournamentsUpcoming,
    tabIndex,
    setTabIndex,
    loadTeamData,
    handleLeave,
    handleNominate,
  } = useTeam();

  if (hasTeam === null) return null;
  if (!hasTeam) return <JoinOrCreateTeam onTeamCreated={loadTeamData} />;

  return (
    <Box sx={teamPageSx.root}>
      <Box sx={{ mb: 5, textAlign: 'center' }}>
        <Typography variant="h4" sx={teamPageSx.mainTitle}>
          Mon équipe
        </Typography>
      </Box>

      <Box
        sx={{ display: 'flex', alignItems: 'flex-start', width: '90%', gap: 5 }}
      >
        <TeamInfoColumn
          team={team}
          leaveError={leaveError}
          setLeaveError={setLeaveError}
          setConfirmOpen={setConfirmOpen}
        />

        <Divider
          orientation="vertical"
          flexItem
          sx={{ backgroundColor: 'rgba(255, 255, 255, 0.47)' }}
        />

        <TeamMemberColumn
          members={members}
          team={team}
          isResponsible={isResponsible}
          nominateError={nominateError}
          setNominateError={setNominateError}
          nominateSuccess={nominateSuccess}
          setNominateSuccess={setNominateSuccess}
          handleNominate={handleNominate}
        />

        <Divider
          orientation="vertical"
          flexItem
          sx={{ backgroundColor: 'rgba(255, 255, 255, 0.47)' }}
        />

        <TeamTournamentColumn
          tabIndex={tabIndex}
          setTabIndex={setTabIndex}
          tournamentsInProgress={tournamentsInProgress}
          tournamentsUpcoming={tournamentsUpcoming}
        />
      </Box>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Quitter l'équipe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isSolo
              ? `Tu es le dernier membre. Quitter supprimera définitivement l'équipe "${team?.name}".`
              : `Es-tu sûr de vouloir quitter l'équipe "${team?.name}" ?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Annuler</Button>
          <Button
            onClick={handleLeave}
            color="error"
            variant="contained"
            disabled={leaveLoading}
          >
            {leaveLoading ? 'Chargement…' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamPage;
