import { useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { MemberDto } from '../../../../types/admin.types';
import { useAuth } from '../../../../contexts/useAuth';
import { BanModal } from './Ban/BanModal';
import { BanInfoModal } from './Ban/BanInfoModal';
import { useMembersManagement } from '../../../../hooks/useMemberManagement/useMembersManagement';
import { MemberListSection } from './MemberListSection';

const MembersListPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { activeMembers, bannedMembers, loading, handleBan } =
    useMembersManagement(user?.token ?? '', user?.tag);

  const [banTarget, setBanTarget] = useState<MemberDto | null>(null);
  const [infoTarget, setInfoTarget] = useState<MemberDto | null>(null);

  const onConfirmBan = async (reason: string) => {
    if (banTarget) {
      try {
        await handleBan(banTarget.id, reason);
        setBanTarget(null);
      } catch (error) {
        alert('Erreur lors du bannissement');
      }
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
            <MemberListSection
              title="Membres Actifs"
              count={activeMembers.length}
              members={activeMembers}
              borderColor="#11981a"
              onAction={setBanTarget}
            />

            <MemberListSection
              title="Membres Bannis"
              count={bannedMembers.length}
              members={bannedMembers}
              borderColor="#b40f0f"
              isBannedSection
              onAction={setInfoTarget}
            />
          </Box>
        )}

        <BanModal
          open={!!banTarget}
          member={banTarget}
          onClose={() => setBanTarget(null)}
          onConfirm={onConfirmBan}
        />

        <BanInfoModal
          open={!!infoTarget}
          onClose={() => setInfoTarget(null)}
          member={infoTarget}
        />
      </Box>
    </Box>
  );
};

export default MembersListPage;
