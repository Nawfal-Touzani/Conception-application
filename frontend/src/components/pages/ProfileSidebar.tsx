import { Avatar, Box, Button, Divider, Typography } from '@mui/material';
import { MemberProfile } from '../../types/member';
import { useState } from 'react';
import { AvatarModal } from '../Avatar/Avatar';
import * as memberService from '../../services/memberService';
import { useAuth } from '../../contexts/AuthContext';

export const ProfileSidebar = ({ profile }: { profile: MemberProfile }) => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const handleAvatarChange = async (newUrl: string) => {
    if (!user?.token) return;
    try {
      await memberService.updateMyProfile(user.token, { profileImage: newUrl });
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
        src={profile.profileImage}
        sx={{ width: 150, height: 150, mb: 5, border: '4px solid white' }}
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
          mb: 3,
          opacity: 1,
          height: '1px',
        }}
      />

      <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
        {profile.tag} {/* Demander ce qu'il faut mettre ici */}
      </Typography>

      <Box sx={{ textAlign: 'center', '& p': { mb: 4 } }}>
        <Typography
          sx={{
            mt: 3,
            fontSize: '1.5rem',
          }}
        >
          {profile.speciality} des {profile.teamName || '[nomEquipe]'}
        </Typography>
        <Typography
          sx={{
            mt: 3,
            fontSize: '1.5rem',
          }}
        >
          Depuis le {new Date(profile.creationDate).toLocaleDateString()}
        </Typography>
        {profile.isAvailable ? (
          <Typography
            sx={{
              color: '#4caf50',
              mt: 3,
              fontSize: '1.5rem',
            }}
          >
            Actuellement disponible
          </Typography>
        ) : (
          <Typography
            sx={{
              fontWeight: 'bold',
              color: '#f44336',
              mt: 3,
              fontSize: '1.5rem',
            }}
          >
            Actuellement indisponible
          </Typography>
        )}
      </Box>
    </Box>
  );
};
