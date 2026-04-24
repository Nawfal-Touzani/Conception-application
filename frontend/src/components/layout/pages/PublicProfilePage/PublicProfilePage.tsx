import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Avatar, Button } from '@mui/material';
import { usePublicMember } from '../../../../hooks/usePublicMember/usePublicMember';


// page de profil public
const PublicProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { member } = usePublicMember(id);

  if (!member) return null;

  const profileInfos = [
    { label: 'Membre de :', value: member.teamName || ' / ' },
    {
      label: 'Spécialité :',
      value:
        member.speciality.charAt(0).toUpperCase() + member.speciality.slice(1),
    },
    {
      label: 'Depuis le :',
      value: new Date(member.profileCreationDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1a2744',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 2,
      }}
    >
      <Button
        onClick={() => navigate(-1)}
        variant="outlined"
        sx={{
          alignSelf: 'flex-start',
          borderColor: '#d8a46b',
          color: '#d8a46b',
          fontWeight: 700,
          ml: 7,
          mt: 2,
          '&:hover': {
            backgroundColor: 'rgba(216,164,107,0.1)',
          },
        }}
      >
        ← Retour
      </Button>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 1,
          border: '2px solid #fff',
          borderRadius: '30px',
          p: 8,
          maxWidth: '500px',
        }}
      >
        <Avatar
          src={
            member.profileImage
              ? `http://localhost:3000${member.profileImage}`
              : undefined
          }
          sx={{
            width: 160,
            height: 160,
            mb: 2.5,
            border: '2px solid rgba(255, 255, 255, 0.87)',
          }}
        />

        <Typography variant="h2" sx={{ mb: 1 }}>
          {member.tag}#{String(member.id).padStart(3, '0')}
        </Typography>

        <Box
          sx={{
            width: 350,
            height: '2px',
            backgroundColor: '#fff',
            mb: 2.5,
          }}
        />

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            width: '100%',
          }}
        >
          {profileInfos.map((info) => (
            <Box
              key={info.label}
              sx={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem' }}
            >
              <Typography
                sx={{
                  fontWeight: 'bold',
                  minWidth: '160px',
                  fontSize: 'inherit',
                }}
              >
                {info.label}
              </Typography>
              <Typography sx={{ fontSize: 'inherit' }}>{info.value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PublicProfilePage;
