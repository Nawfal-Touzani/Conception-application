import { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../../../services/admin.service';
import { MemberDto } from '../../../types/admin.types';
import { useAuth } from '../../../contexts/useAuth';
import { MemberRow } from './MemberRow';
import { BanModal } from '../../Ban/BanModal';

const MembersListPage = () => {
  const [members, setMembers] = useState<MemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [banTarget, setBanTarget] = useState<MemberDto | null>(null);

  useEffect(() => {
    adminService
      .getAllMembers(user?.token ?? '')
      .then(setMembers)
      .finally(() => setLoading(false));
  }, [user]);

  const handleConfirmBan = async (reason: string) => {
    if (!banTarget) return;

    const res = await adminService.banMember(
      user?.token ?? '',
      banTarget.id,
      reason,
    );
    if (res.ok) {
      const updatedMembers = await adminService.getAllMembers(
        user?.token ?? '',
      );
      setMembers(updatedMembers);
    } else {
      throw new Error();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1a2744',
        p: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 760 }}>
        <Typography
          variant="h4"
          sx={{ color: '#fff', fontWeight: 800, mb: 4, textAlign: 'center' }}
        >
          Tous les Membres
        </Typography>

        <Button
          onClick={() => navigate('/admin')}
          variant="outlined"
          sx={{
            borderColor: '#d8a46b',
            color: '#d8a46b',
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: '8px',
            mb: 2,
            '&:hover': {
              backgroundColor: 'rgba(216,164,107,0.1)',
            },
          }}
        >
          ←
        </Button>

        {loading ? (
          <CircularProgress
            sx={{ color: '#fff', display: 'block', mx: 'auto' }}
          />
        ) : (
          members.map((m) => (
            <MemberRow
              key={m.id}
              member={m}
              isCurrentUser={m.tag === user?.tag}
              onBan={() => setBanTarget(m)}
            />
          ))
        )}
        <BanModal
          open={!!banTarget}
          member={banTarget}
          onClose={() => setBanTarget(null)}
          onConfirm={handleConfirmBan}
        />
      </Box>
    </Box>
  );
};

export default MembersListPage;
