import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Button,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type MemberDto = {
  id: number;
  email: string;
  tag: string;
  speciality: string;
  teamName: string | null;
  profileImage: string | null;
  creationDate: string | null;
  isAvailable: boolean;
};

const API = '/api';
const PAGE_SIZE = 4;

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const token = user?.token ?? '';

  const [allMembers, setAllMembers] = useState<MemberDto[]>([]);
  const [admins, setAdmins] = useState<MemberDto[]>([]);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog pour nommer un admin
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [nonAdmins, setNonAdmins] = useState<MemberDto[]>([]);

  // Dialog pour confirmer suppression
  const [demoteTarget, setDemoteTarget] = useState<MemberDto | null>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') navigate('/');
  }, [user, navigate]);

  const loadMembers = useCallback(() => {
    fetch(`${API}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data: MemberDto[] = await res.json();
        setAllMembers(data);
      })
      .catch(() => setError('Erreur lors du chargement des membres.'));
  }, [token]);

  useEffect(() => {
    if (user) loadMembers();
  }, [user, loadMembers]);

  // Séparer admins et non-admins à partir de allMembers
  // Le backend ne renvoie pas isAdmin directement dans le DTO
  // On considère tous les membres comme potentiels admins à nommer
  // La page affiche tous les membres pour l'instant — à adapter si le DTO inclut isAdmin
  useEffect(() => {
    setAdmins(allMembers);
    setNonAdmins(allMembers);
  }, [allMembers]);

  const handlePromote = async (member: MemberDto) => {
    setError(null);
    setSuccess(null);
    const res = await fetch(`${API}/members/${member.id}/promote`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setError('Impossible de nommer cet administrateur.');
      return;
    }
    setSuccess(`${member.tag} est maintenant administrateur.`);
    setPromoteOpen(false);
    loadMembers();
  };

  const handleDemote = async () => {
    if (!demoteTarget) return;
    setError(null);
    setSuccess(null);
    const res = await fetch(`${API}/members/${demoteTarget.id}/demote`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setError('Impossible de révoquer cet administrateur.');
      setDemoteTarget(null);
      return;
    }
    setSuccess(`${demoteTarget.tag} n'est plus administrateur.`);
    setDemoteTarget(null);
    loadMembers();
  };

  const totalPages = Math.ceil(admins.length / PAGE_SIZE);
  const paginated = admins.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 760,
          borderRadius: '16px',
          p: 4,
          backgroundColor: '#1a2744',
          border: '2px solid #fff',
        }}
      >
        {/* Titre + bouton + */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Box sx={{ flex: 1 }} />
          <Typography
            variant="h5"
            sx={{
              color: '#fff',
              fontWeight: 800,
              flex: 2,
              textAlign: 'center',
            }}
          >
            Gestion des administrateurs
          </Typography>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              onClick={() => setPromoteOpen(true)}
              sx={{
                minWidth: 36,
                width: 36,
                height: 36,
                borderRadius: '8px',
                backgroundColor: '#27ae60',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.4rem',
                p: 0,
                lineHeight: 1,
                '&:hover': { backgroundColor: '#219150' },
              }}
            >
              +
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess(null)}
            sx={{ mb: 2 }}
          >
            {success}
          </Alert>
        )}

        {/* Liste des admins */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {paginated.map((member) => (
            <Box
              key={member.email}
              sx={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#fff',
                borderRadius: '10px',
                px: 2,
                py: 1.2,
                gap: 2,
              }}
            >
              <Avatar
                src={member.profileImage ?? undefined}
                alt={member.tag}
                sx={{ width: 40, height: 40 }}
              />

              <Typography
                sx={{ fontWeight: 700, color: '#1a2744', minWidth: 130 }}
              >
                {member.tag}
              </Typography>

              <Typography sx={{ color: '#555', fontSize: '0.9rem', flex: 1 }}>
                {member.speciality}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: member.isAvailable ? '#27ae60' : '#e74c3c',
                  }}
                />
                <Typography sx={{ fontSize: '0.85rem', color: '#333' }}>
                  {member.isAvailable ? 'Disponible' : 'Indisponible'}
                </Typography>
              </Box>

              <IconButton
                onClick={() => setDemoteTarget(member)}
                sx={{
                  color: '#e74c3c',
                  '&:hover': { backgroundColor: 'rgba(231,76,60,0.1)' },
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Box>

        {/* Pagination */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 3,
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            variant="contained"
            sx={{
              backgroundColor: '#fff',
              color: '#1a2744',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#eee' },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                color: '#aaa',
              },
            }}
          >
            Précédent
          </Button>

          <Typography sx={{ color: '#fff', fontWeight: 600 }}>
            Page {page + 1} sur {totalPages || 1}
          </Typography>

          <Button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            variant="contained"
            sx={{
              backgroundColor: '#fff',
              color: '#1a2744',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#eee' },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                color: '#aaa',
              },
            }}
          >
            Suivant
          </Button>

          <Button
            onClick={() => setPage(0)}
            variant="outlined"
            sx={{
              borderColor: '#d8a46b',
              color: '#d8a46b',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { backgroundColor: 'rgba(216,164,107,0.1)' },
            }}
          >
            Tous les membres
          </Button>
        </Box>
      </Paper>

      {/* Dialog — Nommer un admin */}
      <Dialog
        open={promoteOpen}
        onClose={() => setPromoteOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nommer un administrateur</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
            {nonAdmins.map((member) => (
              <Box
                key={member.email}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.5,
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                }}
              >
                <Avatar
                  src={member.profileImage ?? undefined}
                  alt={member.tag}
                  sx={{ width: 36, height: 36 }}
                />
                <Typography sx={{ flex: 1, fontWeight: 600, color: '#1a2744' }}>
                  {member.tag}
                </Typography>
                <Typography sx={{ color: '#888', fontSize: '0.85rem', mr: 1 }}>
                  {member.speciality}
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handlePromote(member)}
                  sx={{
                    backgroundColor: '#1a2744',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '6px',
                    '&:hover': { backgroundColor: '#151e32' },
                  }}
                >
                  Nommer
                </Button>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromoteOpen(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog — Confirmer suppression admin */}
      <Dialog open={!!demoteTarget} onClose={() => setDemoteTarget(null)}>
        <DialogTitle>Révoquer un administrateur</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Es-tu sûr de vouloir révoquer les droits administrateur de{' '}
            <strong>{demoteTarget?.tag}</strong> ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDemoteTarget(null)}>Annuler</Button>
          <Button onClick={handleDemote} color="error" variant="contained">
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;
