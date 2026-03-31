import { useCallback, useEffect, useState } from 'react';
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
} from '@mui/material';
import JoinOrCreateTeam from './JoinOrCreateTeam';
import { useAuth } from '../../../contexts/useAuth';
import * as teamService from '../../../services/team.service';
import { TeamDto, TeamMember } from '../../../types/team.types';
import { useNavigate } from 'react-router-dom';

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Composant réutilisable pour afficher une ligne label + valeur dans un bloc bleu
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
      <Typography
        sx={{
          minWidth: 270,
          fontWeight: 800,
          color: '#1a2744',
          fontSize: '1.4rem',
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          flex: 1,
          backgroundColor: '#1a2744',
          borderRadius: '6px',
          px: 2,
          py: 1.3,
          textAlign: 'center',
        }}
      >
        <Typography sx={{ color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

const TeamPage = () => {
  const { user } = useAuth(); // on recup le user connecté depuis le contexte globale
  const navigate = useNavigate();
  const token = user?.token ?? ''; // extrait le token en string pour eviter les boucles useEffects

  const [team, setTeam] = useState<TeamDto | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [nominateError, setNominateError] = useState<string | null>(null);
  const [nominateSuccess, setNominateSuccess] = useState<string | null>(null);

  // pour savoir si le membre est le dernier de son ekip
  const isSolo = members.length === 1;

  // Obtenir lequipe et les membres de celle ci dun joueur connecté
  const loadTeamData = useCallback(() => {
    setHasTeam(null); // etat du chargement en cours, affiche rien pendant le fetch

    teamService
      .getMyTeamMembers(token)
      // .then sexecute quand le fetch reussi et memberdata contient le tableau des joueurs
      .then(async (memberData) => {
        setMembers(memberData);
        setHasTeam(true);

        const teamData = await teamService.getMyTeam(token);
        setTeam(teamData);
      })
      // sexecute si le membre n'a pas de team
      .catch(() => setHasTeam(false));
  }, [token]);

  useEffect(() => {
    if (user) loadTeamData();
  }, [user, loadTeamData]);

  // Quitter une equipe
  const handleLeave = async () => {
    setLeaveLoading(true); // desac le bouton confirmer pendant la requete
    try {
      const res = await teamService.leaveTeam(token);

      if (res.status === 409) {
        const body = await res.json();
        setLeaveError(
          body.message || 'Désignez un second responsable avant de quitter.',
        );
        setConfirmOpen(false);
        return;
      }

      if (!res.ok) {
        setLeaveError('Une erreur est survenue.');
        setConfirmOpen(false);
        return;
      }

      setConfirmOpen(false);
      loadTeamData();
    } catch {
      setLeaveError('Erreur réseau.');
    } finally {
      setLeaveLoading(false);
    }
  };

  // Nommer un second responsable
  const handleNominate = async (memberId: number) => {
    if (!team) return;
    setNominateError(null);
    setNominateSuccess(null);

    try {
      const res = await teamService.nominateSecondaryManager(
        token,
        team.id,
        memberId,
      );

      if (!res.ok) {
        setNominateError('Impossible de nommer ce membre.');
        return;
      }

      setNominateSuccess('Second responsable nommé avec succès.');
      loadTeamData();
    } catch {
      setNominateError('Erreur réseau.');
    }
  };

  // Vérifie si l'utilisateur connecté est le responsable
  const isResponsible =
    team?.responsibleTag != null &&
    members.find((m) => m.gameTag === team.responsibleTag) != null &&
    user?.tag === team.responsibleTag;

  if (hasTeam === null) return null;
  if (!hasTeam) return <JoinOrCreateTeam onTeamCreated={loadTeamData} />;

  return (
    <Box
      sx={{
        flexGrow: 1,
        backgroundColor: '#1a2744',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 5,
        px: 2,
      }}
    >
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mb: 4 }}>
        Mon équipe
      </Typography>

      <Box
        sx={{
          display: 'flex',
          gap: 6,
          width: '100%',
          maxWidth: 1000,
          alignItems: 'flex-start',
        }}
      >
        {/* ── Left: Team Info ── */}
        <Paper
          elevation={0}
          sx={{
            flex: '0 0 480px',
            borderRadius: '12px',
            p: 5,
            backgroundColor: '#fff',
          }}
        >
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
              sx={{
                backgroundColor: '#c0392b',
                borderRadius: '10px',
                px: 6,
                py: 1.2,
                fontSize: '1rem',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#a93226' },
              }}
            >
              Quitter
            </Button>
          </Box>
        </Paper>

        {/* ── Right: Members ── */}
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
                  sx={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    px: 3,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 60 }}>
                    <Avatar
                      src={`http://localhost:3000${member.avatarUrl}`}
                      alt={member.gameTag}
                      sx={{ width: 50, height: 50 }}
                    />
                  </ListItemAvatar>

                  {/* Indicateur disponibilité */}
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

                  {/* Bouton Nommer — visible uniquement pour le responsable, sur les autres membres */}
                  {isResponsible && !isCurrentUser && (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation; // pour pas rediriger quand on clique sur nommer
                        handleNominate(member.memberId);
                      }}
                      sx={{
                        ml: 'auto',
                        flexShrink: 0,
                        borderColor: '#1a2744',
                        color: '#1a2744',
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        borderRadius: '6px',
                        '&:hover': {
                          backgroundColor: '#1a2744',
                          color: '#fff',
                        },
                      }}
                    >
                      Nommer
                    </Button>
                  )}
                </ListItem>
              );
            })}
          </List>

          {/* Légende */}
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
