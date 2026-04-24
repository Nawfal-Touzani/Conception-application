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
  // Hook personnalisé qui centralise toute la logique métier liée à l'équipe
  // (état, handlers, données) — évite de polluer le composant avec de la logique
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

  // Garde : on attend que `hasTeam` soit résolu (null = chargement en cours)
  if (hasTeam === null) return null;
  // Garde : si l'utilisateur n'a pas d'équipe, on affiche le formulaire join/create
  // `onTeamCreated` permet de recharger les données une fois l'équipe créée
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
          // Ouvre la Dialog de confirmation de départ via le state remonté ici
          setConfirmOpen={setConfirmOpen}
        />

        {/* Divider vertical pour séparer visuellement les colonnes — flexItem est
            requis pour qu'il s'étire correctement dans un conteneur flex */}
        <Divider
          orientation="vertical"
          flexItem
          sx={{ backgroundColor: 'rgba(255, 255, 255, 0.47)' }}
        />

        <TeamMemberColumn
          members={members}
          team={team}
          // Conditionne l'affichage des actions réservées au responsable (ex: nomination)
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
          // tabIndex / setTabIndex gèrent l'onglet actif (en cours / à venir)
          // en tant que state contrôlé remonté dans useTeam
          tabIndex={tabIndex}
          setTabIndex={setTabIndex}
          tournamentsInProgress={tournamentsInProgress}
          tournamentsUpcoming={tournamentsUpcoming}
        />
      </Box>

      {/* Dialog MUI : modal de confirmation avant de quitter l'équipe
          Rendu dans le DOM uniquement quand `confirmOpen` est true */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Quitter l'équipe</DialogTitle>
        <DialogContent>
          {/* Message conditionnel selon si l'utilisateur est le dernier membre (isSolo)
              — dans ce cas, quitter supprime définitivement l'équipe */}
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
            // Désactive le bouton pendant l'appel async pour éviter les doubles soumissions
            disabled={leaveLoading}
          >
            {/* Feedback visuel inline durant le chargement, sans spinner séparé */}
            {leaveLoading ? 'Chargement…' : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeamPage;
