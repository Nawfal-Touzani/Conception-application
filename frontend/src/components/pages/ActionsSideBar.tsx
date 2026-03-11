import { Paper, Typography, Divider, Box, Button } from '@mui/material';
// voir pour les boutons si il faut les afficher ou pas ...
export const ActionSidebar = () => {
  const actions = [
    'Consulter mes tournois disputés',
    'Visualiser mes tournois à venir',
    'Créer/Rejoindre une team',
  ];

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        minHeight: '640px',
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
        {actions.map((text) => (
          <Button
            key={text}
            variant="contained"
            fullWidth
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
            {text}
          </Button>
        ))}
      </Box>
    </Paper>
  );
};
