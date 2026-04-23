import { Box, Typography, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MemberRow } from './MemberRow';
import { useAdmin } from '../../../../hooks/useAdmin/useAdmin';
import { adminSx } from '../../../../styles/admin.styles';
import PromoteAdminDialog from './PromoteAdminDialog';
import DemoteAdminDialog from './DemoteAdminDialog';

const AdminPage = () => {
  const navigate = useNavigate();
  const {
    allMembers,
    page,
    setPage,
    error,
    setError,
    success,
    setSuccess,
    promoteOpen,
    setPromoteOpen,
    demoteTarget,
    setDemoteTarget,
    totalPages,
    paginated,
    handlePromote,
    handleDemote,
  } = useAdmin();

  return (
    <Box sx={adminSx.root}>
      <Box sx={{ width: '100%', maxWidth: 760 }}>
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h4" sx={adminSx.title}>
            Gestion des administrateurs
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
          <Button onClick={() => setPromoteOpen(true)} sx={adminSx.addButton}>
            +
          </Button>
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

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {paginated.map((member) => (
            <MemberRow
              key={member.email}
              member={member}
              onDelete={setDemoteTarget}
            />
          ))}
        </Box>

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
            sx={adminSx.paginationButton}
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
            sx={adminSx.paginationButton}
          >
            Suivant
          </Button>

          <Button
            onClick={() => navigate('/admin/members')}
            variant="outlined"
            sx={adminSx.allMembersButton}
          >
            Tous les membres
          </Button>
        </Box>
      </Box>

      <PromoteAdminDialog
        open={promoteOpen}
        allMembers={allMembers}
        onClose={() => setPromoteOpen(false)}
        onPromote={handlePromote}
      />

      <DemoteAdminDialog
        demoteTarget={demoteTarget}
        onClose={() => setDemoteTarget(null)}
        onConfirm={handleDemote}
      />
    </Box>
  );
};

export default AdminPage;
