import { useEffect, useState } from 'react';
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
} from '@mui/material';
import JoinOrCreateTeam from './JoinOrCreateTeam';
import { useAuth } from '../../contexts/AuthContext';

type Member = {
  tag: string;
  imageId: number;
};

// ✅ Matches TeamResponseDto from the backend
type TeamDto = {
  id: number;
  name: string;
  responsibleTag: string | null;
  secondResponsibleTag: string | null;
  creationDate: string | null;
};

const API = '/api';

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-BE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 2 }}>
      <Typography
        sx={{
          minWidth: 160,
          fontWeight: 600,
          color: '#1a2744',
          fontSize: '0.95rem',
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
          py: 0.8,
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{ color: '#fff', fontSize: '0.95rem', fontWeight: 500 }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

const TeamPage = () => {
  const { user } = useAuth();
  const [team, setTeam] = useState<TeamDto | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  const authHeaders = { Authorization: `Bearer ${user?.token ?? ''}` };

  const loadTeamData = () => {
    setHasTeam(null);

    fetch(`${API}/teams/members`, { headers: authHeaders })
      .then(async (res) => {
        // 404 = membre sans équipe → afficher JoinOrCreateTeam
        if (res.status === 404 || res.status === 401 || !res.ok) {
          setHasTeam(false);
          return;
        }

        const memberData: Member[] = await res.json();
        setMembers(memberData);
        setHasTeam(true);

        // Charger les infos complètes de l'équipe
        const teamRes = await fetch(`${API}/teams/my-team`, {
          headers: authHeaders,
        });
        if (teamRes.ok) {
          const teamData: TeamDto = await teamRes.json();
          setTeam(teamData);
        }
      })
      .catch(() => setHasTeam(false));
  };

  useEffect(() => {
    if (user) loadTeamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLeave = async () => {
    setLeaveLoading(true);
    try {
      const res = await fetch(`${API}/teams/leave`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (res.ok) {
        setHasTeam(false);
        setTeam(null);
        setMembers([]);
      }
    } catch {
      // silently fail
    } finally {
      setLeaveLoading(false);
      setConfirmOpen(false);
    }
  };

  if (hasTeam === null) return null;
  if (!hasTeam) return <JoinOrCreateTeam onTeamCreated={loadTeamData} />;

  return (
    <Box
      sx={{
        minHeight: '100vh',
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
          gap: 4,
          width: '100%',
          maxWidth: 860,
          alignItems: 'flex-start',
        }}
      >
        {/* ── Left: Team Info ── */}
        <Paper
          elevation={0}
          sx={{
            flex: '0 0 420px',
            borderRadius: '12px',
            p: 3.5,
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

          <Box sx={{ mt: 3.5 }}>
            <Button
              variant="contained"
              onClick={() => setConfirmOpen(true)}
              sx={{
                backgroundColor: '#c0392b',
                borderRadius: '30px',
                px: 4,
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
          <List
            disablePadding
            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
          >
            {members.map((member) => (
              <ListItem
                key={member.tag}
                sx={{
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  px: 2,
                  py: 0.8,
                }}
              >
                <ListItemAvatar sx={{ minWidth: 48 }}>
                  <Avatar
                    src={`/images/${member.imageId}.png`}
                    alt={member.tag}
                    sx={{ width: 36, height: 36 }}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={member.tag}
                  primaryTypographyProps={{
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    color: '#1a2744',
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>

      {/* ── Confirm Leave Dialog ── */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Quitter l'équipe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Es-tu sûr de vouloir quitter l'équipe <strong>{team?.name}</strong>{' '}
            ?
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
