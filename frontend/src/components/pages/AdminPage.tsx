import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../contexts/useAuth';
import { useNavigate } from 'react-router-dom';

type MemberDto = {
  id: number;
  email: string;
  tag: string;
  speciality: string;
  teamName: string | null;
  profileImage: string | null;
  isAvailable: boolean;
  isAdmin: boolean;
};

const API = '/api';
const PAGE_SIZE = 4;

const AdminPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = user?.token ?? '';

  const [admins, setAdmins] = useState<MemberDto[]>([]);
  const [allMembers, setAllMembers] = useState<MemberDto[]>([]);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [promoteOpen, setPromoteOpen] = useState(false);
  const [demoteTarget, setDemoteTarget] = useState<MemberDto | null>(null);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') navigate('/');
  }, [user, navigate]);

  const loadAdmins = useCallback(() => {
    fetch(`${API}/members/admins`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data: MemberDto[] = await res.json();
        setAdmins(data);
      })
      .catch(() => setError('Erreur lors du chargement des administrateurs.'));
  }, [token]);

  const loadAllMembers = useCallback(() => {
    fetch(`${API}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) return;
        const data: MemberDto[] = await res.json();
        setAllMembers(data.filter((m) => !m.isAdmin));
      })
      .catch(() => setError('Erreur lors du chargement des membres.'));
  }, [token]);

  useEffect(() => {
    if (user) {
      loadAdmins();
      loadAllMembers();
    }
  }, [user, loadAdmins, loadAllMembers]);

  const handlePromote = async (member: MemberDto) => {
    setError(null);
    setSuccess(null);

    const res = await fetch(`${API}/members/admins/${member.id}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setError('Impossible de nommer cet administrateur.');
      return;
    }
    setSuccess(`${member.tag} est maintenant administrateur.`);
    setPromoteOpen(false);
    loadAdmins();
    loadAllMembers();
  };

  const handleDemote = async () => {
    if (!demoteTarget) return;
    setError(null);
    setSuccess(null);

    const res = await fetch(`${API}/members/admins/${demoteTarget.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      setError('Impossible de révoquer cet administrateur.');
      setDemoteTarget(null);
      return;
    }
    const isSelf = demoteTarget.tag === user?.tag;
    setDemoteTarget(null);
    if (isSelf) {
      logout();
      navigate('/');
      return;
    }
    setSuccess(`${demoteTarget.tag} n'est plus administrateur.`);
    loadAdmins();
    loadAllMembers();
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
      <Box sx={{ width: '100%', maxWidth: 760 }}>
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
                fontSize: '1.2rem',
                p: 0,
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                src={
                  member.profileImage
                    ? `http://localhost:3000${member.profileImage}`
                    : undefined
                }
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

              {member.tag !== user?.tag && (
                <IconButton
                  onClick={() => setDemoteTarget(member)}
                  sx={{
                    color: '#e74c3c',
                    '&:hover': { backgroundColor: 'rgba(231,76,60,0.1)' },
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
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
      </Box>

      {/* Dialog — Ajouter un administrateur */}
      <Dialog
        open={promoteOpen}
        onClose={() => setPromoteOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: '#1a2744',
            borderRadius: '16px',
            border: '2px solid #fff',
          },
        }}
      >
        <DialogTitle
          sx={{ color: '#fff', fontWeight: 800, textAlign: 'center' }}
        >
          Ajouter un administrateur
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {allMembers.length === 0 && (
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.6)',
                  textAlign: 'center',
                  mt: 2,
                }}
              >
                Tous les membres sont déjà administrateurs.
              </Typography>
            )}
            {allMembers.map((member) => (
              <Box
                key={member.email}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 1.2,
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255,255,255,0.08)',
                }}
              >
                <Avatar
                  src={
                    member.profileImage
                      ? `http://localhost:3000${member.profileImage}`
                      : undefined
                  }
                  alt={member.tag}
                  sx={{ width: 36, height: 36 }}
                />
                <Typography sx={{ fontWeight: 700, color: '#fff', flex: 1 }}>
                  {member.tag}
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '0.85rem',
                    mr: 1,
                  }}
                >
                  {member.speciality}
                </Typography>
                <IconButton
                  onClick={() => handlePromote(member)}
                  sx={{
                    backgroundColor: '#27ae60',
                    color: '#fff',
                    width: 30,
                    height: 30,
                    '&:hover': { backgroundColor: '#219150' },
                  }}
                >
                  <AddIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={() => setPromoteOpen(false)}
            sx={{ color: '#fff', textTransform: 'none', fontWeight: 600 }}
          >
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog — Confirmer révocation */}
      <Dialog
        open={!!demoteTarget}
        onClose={() => setDemoteTarget(null)}
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle>Révoquer un administrateur</DialogTitle>
        <DialogContent>
          <Typography>
            Es-tu sûr de vouloir révoquer les droits administrateur de{' '}
            <strong>{demoteTarget?.tag}</strong> ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDemoteTarget(null)}
            sx={{ textTransform: 'none' }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDemote}
            color="error"
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Confirmer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;
