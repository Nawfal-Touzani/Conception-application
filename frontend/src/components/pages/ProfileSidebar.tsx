import { Avatar, Box, Button, Divider, Typography } from '@mui/material';
import { MemberProfile } from '../../types/member';

export const ProfileSidebar = ({ profile }: { profile: MemberProfile }) => (
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
      size="medium"
      sx={{
        bgcolor: 'white',
        color: 'black',
        fontSize: '1rem',
        mb: 4,
        textTransform: 'none',
        borderRadius: '5px',
        px: 3,
        fontWeight: 'bold',
      }}
    >
      Changer son avatar
    </Button>

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
