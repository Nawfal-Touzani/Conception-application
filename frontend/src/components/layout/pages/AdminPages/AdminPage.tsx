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
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../../../../contexts/useAuth';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../../../../services/admin.service';
import { MemberDto } from '../../../../types/admin.types';
import { MemberRow } from './MemberRow';

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
    adminService
      .getAdmins(token)
      .then((data) => {
        const filtered = data.filter((m) => !m.isBan && m.tag !== user?.tag);
        setAdmins(filtered);
      })
      .catch(() => setError('Erreur lors du chargement des administrateurs.'));
  }, [token, user?.tag]);

  const loadAllMembers = useCallback(() => {
    adminService
      .getAllMembers(token)
      .then((data) =>
        setAllMembers(data.filter((m) => !m.isAdmin && !m.admin && !m.isBan)),
      )
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

    const res = await adminService.promoteToAdmin(token, member.id);

    if (!res.ok) {
      setError('Impossible de nommer cet administrateur.');
      return;
    }
    setSuccess(`${member.tag} est maintenant administrateur.`);
    setPromoteOpen(false);
    loadAdmins();
    loadAllMembers();
  };

  // Supprimer un admin
  const handleDemote = async () => {
    if (!demoteTarget) return;
    setError(null);
    setSuccess(null);

    const res = await adminService.revokeAdmin(token, demoteTarget.id);

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
        <Box sx={{ width: '100%', maxWidth: 760 }}>
          <Typography
            variant="h4"
            sx={{
              color: '#fff',
              fontWeight: 800,
              textAlign: 'center',
              mb: 4,
              mt: 2,
            }}
          >
            Gestion des administrateurs
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
            <Button
              onClick={() => setPromoteOpen(true)}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '6px',
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
            <MemberRow
              key={member.email}
              member={member}
              onDelete={setDemoteTarget}
            />
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
            ml: 12,
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
            onClick={() => navigate('/admin/members')}
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
