import { Paper, Typography, Divider, Box, Button } from '@mui/material';
import { MemberProfile } from '../../../types/member';
import { useNavigate } from 'react-router-dom';

export const ActionSidebar = ({ profile }: { profile: MemberProfile }) => {
  const navigate = useNavigate();

  const actions = [
    { text: 'Consulter mes tournois disputés', path: '#' },
    { text: 'Visualiser mes tournois à venir', path: '#' },
  ];

  if (!profile.teamName) {
    actions.push({ text: 'Créer/Rejoindre une team', path: '/team' });
  }

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        minHeight: '687px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{ mb: 2, fontWeight: 'bold', color: '#1e2a44' }}
      >
        Actions
      </Typography>
      <Divider
        sx={{ mb: 4, borderBottomWidth: 2, backgroundColor: '#1e2a44' }}
      />

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          flexGrow: 1,
          justifyContent: 'center',
        }}
      >
        {actions.map((action) => (
          <Button
            key={action.text}
            variant="contained"
            fullWidth
            onClick={() => action.path !== '#' && navigate(action.path)}
            sx={{
              bgcolor: '#1e2a44',
              py: 1.8,
              px: 2,
              textTransform: 'none',
              borderRadius: 2,
              fontWeight: 'bold',
              fontSize: '1.4rem',
              lineHeight: 1.2,
              whiteSpace: 'normal',
              textAlign: 'center',
              '&:hover': { bgcolor: '#415060' },
            }}
          >
            {action.text}
          </Button>
        ))}
      </Box>
    </Paper>
  );
};
