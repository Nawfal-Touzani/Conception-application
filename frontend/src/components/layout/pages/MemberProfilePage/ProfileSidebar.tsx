import { Avatar, Box, Button, Divider, Typography } from '@mui/material';
import { MemberProfile } from '../../../../types/member';
import { useState } from 'react';
import { AvatarModal } from '../../Avatar/Avatar';
import * as memberService from '../../../../services/member/member.service';
import { useAuth } from '../../../../contexts/useAuth';

const BASE_URL = 'http://localhost:3000';

export const ProfileSidebar = ({ profile }: { profile: MemberProfile }) => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const handleAvatarChange = async (newUrl: string) => {
    if (!user?.token) return;

    const relativeUrl = newUrl.replace('http://localhost:3000', '');

    try {
      await memberService.updateMyProfile(user.token, {
        profileImage: relativeUrl,
      });
      setModalOpen(false);
      window.location.reload();
    } catch (error) {
      alert("Erreur lors du changement d'avatar");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      color="white"
      sx={{ mt: 3 }}
    >
      <Avatar
        src={
          profile.profileImage?.startsWith('/')
            ? `${BASE_URL}${profile.profileImage}`
            : profile.profileImage
        }
        sx={{ width: 140, height: 140, mb: 5, border: '4px solid white' }}
      />

      <Button
        variant="contained"
        onClick={() => setModalOpen(true)}
        sx={{
          bgcolor: 'white',
          color: 'black',
          mb: 4,
          fontWeight: 'bold',
          textTransform: 'none',
        }}
      >
        Changer son avatar
      </Button>

      <AvatarModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleAvatarChange}
        currentImage={profile.profileImage}
      />

      <Divider
        sx={{
          width: '80%',
          bgcolor: '#ffffff',
          mb: 1,
          opacity: 1,
          height: '1px',
        }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          width: '100%',
          px: 6,
          mt: 3,
        }}
      >
        {[
          { label: 'Rôle :', value: profile.admin ? 'Admin' : 'Joueur' },
          {
            label: 'Spécialité :',
            value:
              profile.speciality.charAt(0).toUpperCase() +
              profile.speciality.slice(1),
          },
          { label: 'Équipe :', value: profile.teamName || '/' },
          {
            label: 'Depuis le :',
            value: new Date(profile.creationDate).toLocaleDateString(),
          },
        ].map((info) => (
          <Box
            key={info.label}
            sx={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}
          >
            <Typography
              sx={{
                fontWeight: 'bold',
                minWidth: '140px',
                fontSize: 'inherit',
              }}
            >
              {info.label}
            </Typography>
            <Typography sx={{ fontSize: 'inherit' }}>{info.value}</Typography>
          </Box>
        ))}

        <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}>
          <Typography
            sx={{ fontWeight: 'bold', minWidth: '120px', fontSize: 'inherit' }}
          >
            Statut :
          </Typography>

          <Typography
            sx={{
              fontSize: 'inherit',
              color: profile.isAvailable ? '#4caf50' : '#f44336',
              fontWeight: profile.isAvailable ? 'normal' : 'bold',
            }}
          >
            {profile.isAvailable ? 'Disponible' : 'Indisponible'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
