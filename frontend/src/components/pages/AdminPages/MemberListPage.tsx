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

  const activeMembers = members.filter((m) => !m.isBan);
  const bannedMembers = members.filter((m) => m.isBan);

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
      <Box sx={{ width: '100%', maxWidth: 1200 }}>
        <Typography
          variant="h4"
          sx={{ color: '#fff', fontWeight: 800, mb: 4, textAlign: 'center' }}
        >
          Gestion des membres
        </Typography>

        <Button
          onClick={() => navigate('/admin')}
          variant="outlined"
          sx={{
            borderColor: '#d8a46b',
            color: '#d8a46b',
            fontWeight: 700,
            mb: 4,
            '&:hover': { backgroundColor: 'rgba(216,164,107,0.1)' },
          }}
        >
          ← Retour
        </Button>

        {loading ? (
          <CircularProgress
            sx={{ color: '#fff', display: 'block', mx: 'auto' }}
          />
        ) : (
          <Box
            sx={{
              display: 'flex',
              gap: 4,
              alignItems: 'flex-start',
            }}
          >
            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#fff',
                  mb: 2,
                  borderBottom: '2px solid #11981a',
                  pb: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Membres Actifs</span>
                <span>{activeMembers.length}</span>
              </Typography>

              {activeMembers.map((m) => (
                <MemberRow
                  key={m.id}
                  member={m}
                  isCurrentUser={m.tag === user?.tag}
                  onBan={() => setBanTarget(m)}
                />
              ))}
            </Box>

            <Box sx={{ flex: 1, width: '100%' }}>
              <Typography
                variant="h6"
                sx={{
                  color: '#fff',
                  mb: 2,
                  borderBottom: '2px solid #b40f0f',
                  pb: 1,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Membres Bannis</span>
                <span>{bannedMembers.length}</span>
              </Typography>

              {bannedMembers.length === 0 ? (
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.4)',
                    textAlign: 'center',
                    mt: 4,
                  }}
                >
                  Aucun membre banni
                </Typography>
              ) : (
                <Box sx={{ opacity: 0.5 }}>
                  {bannedMembers.map((m) => (
                    <MemberRow key={m.id} member={m} isCurrentUser={false} />
                  ))}
                </Box>
              )}
            </Box>
          </Box>
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
