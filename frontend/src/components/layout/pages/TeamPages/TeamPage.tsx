import {
  Box,
  Typography,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  Tab,
  Tabs,
} from '@mui/material';
import JoinOrCreateTeam from './JoinOrCreateTeam';
import { useTeam } from '../../../../hooks/useTeam/useTeam';
import { formatDate } from '../../../../utils/TeamFormat/team.utils';
import { teamPageSx } from '../../../../styles/team.styles';
import { useNavigate } from 'react-router-dom';

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

const TeamPage = () => {
  const navigate = useNavigate();
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
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            fontWeight: 900,
            textAlign: 'center',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
            gap: 2,
            '&::before, &::after': {
              content: '""',
              height: '3px',
              width: '50px',
              backgroundColor: 'white',
            },
          }}
        >
          Mon équipe
        </Typography>
      </Box>

      <Box sx={teamPageSx.layout}>
        {/* ── Colonne 1 : Infos équipe ── */}
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

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => setConfirmOpen(true)}
              sx={teamPageSx.leaveButton}
            >
              Quitter
            </Button>
          </Box>
        </Paper>

        {/* ── Colonne 2 : Membres ── */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{ color: '#fff', fontWeight: 700, mb: 2, textAlign: 'center' }}
          >
            Membres de l'équipe
          </Typography>
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.85rem',
              mb: 1.5,
            }}
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
              const isCurrentUser = member.gameTag === team?.responsibleTag;
              return (
                <ListItem
                  key={member.gameTag}
                  onClick={() => navigate(`/members/${member.memberId}`)}
                  sx={teamPageSx.memberItem}
                >
                  <ListItemAvatar sx={{ minWidth: 60 }}>
                    <Avatar
                      src={`http://localhost:3000${member.avatarUrl}`}
                      alt={member.gameTag}
                      sx={{ width: 50, height: 50 }}
                    />
                  </ListItemAvatar>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: member.isAvailable
                        ? '#27ae60'
                        : '#e74c3c',
                      flexShrink: 0,
                    }}
                  />
                  <ListItemText
                    primary={member.gameTag}
                    primaryTypographyProps={{
                      fontSize: '1.2rem',
                      fontWeight: 500,
                      color: '#1a2744',
                    }}
                  />
                  {isResponsible && !isCurrentUser && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNominate(member.memberId);
                      }}
                      sx={teamPageSx.nominateButton}
                    >
                      Nommer
                    </Button>
                  )}
                </ListItem>
              );
            })}
          </List>

          <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#27ae60',
                }}
              />
              <Typography
                sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}
              >
                Disponible
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: '#e74c3c',
                }}
              />
              <Typography
                sx={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem' }}
              >
                Indisponible
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── Colonne 3 : Tournois ── */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            sx={{ color: '#fff', fontWeight: 700, mb: 2, textAlign: 'center' }}
          >
            Tournois
          </Typography>

          <Tabs
            value={tabIndex}
            onChange={(_, v) => setTabIndex(v)}
            sx={teamPageSx.tabs}
          >
            <Tab label={`En cours (${tournamentsInProgress.length})`} />
            <Tab label={`À venir (${tournamentsUpcoming.length})`} />
          </Tabs>

          {tabIndex === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {tournamentsInProgress.length === 0 ? (
                <Typography
                  sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}
                >
                  Aucun tournoi en cours.
                </Typography>
              ) : (
                tournamentsInProgress.map((t) => (
                  <Paper
                    key={t.id}
                    elevation={0}
                    sx={teamPageSx.tournamentCard}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: '#1a2744',
                          fontSize: '0.95rem',
                        }}
                      >
                        {t.name}
                      </Typography>
                      <Typography sx={{ color: '#555', fontSize: '0.8rem' }}>
                        {formatDate(t.startDate)} — {formatDate(t.endDate)}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        color: '#27ae60',
                        fontWeight: 700,
                      }}
                    >
                      En cours
                    </Typography>
                  </Paper>
                ))
              )}
            </Box>
          )}

          {tabIndex === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {tournamentsUpcoming.length === 0 ? (
                <Typography
                  sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}
                >
                  Aucun tournoi à venir.
                </Typography>
              ) : (
                tournamentsUpcoming.map((t) => (
                  <Paper
                    key={t.id}
                    elevation={0}
                    sx={teamPageSx.tournamentCard}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: '#1a2744',
                          fontSize: '0.95rem',
                        }}
                      >
                        {t.name}
                      </Typography>
                      <Typography sx={{ color: '#555', fontSize: '0.8rem' }}>
                        {formatDate(t.startDate)} — {formatDate(t.endDate)}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        fontSize: '0.8rem',
                        color: '#1a2744',
                        fontWeight: 700,
                      }}
                    >
                      Inscriptions ouvertes
                    </Typography>
                  </Paper>
                ))
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* ── Confirm Leave Dialog ── */}
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
