import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';

export default function TeamPage() {
  const members = [
    { name: 'Tag89#004', avatar: '/avatar1.png' },
    { name: 'Tag7#001', avatar: '/avatar2.png' },
    { name: 'Tag988#002', avatar: '/avatar3.png' },
    { name: 'Tag44#003', avatar: '/avatar4.png' },
    { name: 'Tag777#005', avatar: '/avatar5.png' },
  ];

  return (
    <Box sx={{ p: 4, backgroundColor: '#24324a', minHeight: '100vh' }}>
      <Typography variant="h4" color="white" align="center" mb={4}>
        Mon équipe
      </Typography>

      <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
        {/* Infos équipe */}
        <Paper sx={{ p: 4, width: 400, borderRadius: 4 }}>
          <Typography>Nom : nomEquipe</Typography>
          <Typography>Responsable : Tag988#002</Typography>
          <Typography>Second responsable : Tag89#004</Typography>
          <Typography>Date de création : 14/02/2026</Typography>

          <Button
            variant="contained"
            color="error"
            sx={{ mt: 3, borderRadius: 5 }}
          >
            Quitter
          </Button>
        </Paper>

        {/* Membres */}
        <Paper sx={{ p: 4, width: 350, borderRadius: 4 }}>
          <Typography variant="h6" mb={2}>
            Membres de l'équipe
          </Typography>

          <List>
            {members.map((member, index) => (
              <ListItem key={index}>
                <ListItemAvatar>
                  <Avatar src={member.avatar} />
                </ListItemAvatar>
                <ListItemText primary={member.name} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
}
