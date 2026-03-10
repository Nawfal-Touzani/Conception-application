import { useState } from 'react';
import { Box, Typography, Paper, Button, TextField } from '@mui/material';

const JoinOrCreateTeam = () => {
  const [teamName, setTeamName] = useState('');

  const createTeam = () => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:3000/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: teamName,
      }),
    }).then((res) => {
      if (res.status === 201) {
        window.location.reload();
      }

      if (res.status === 409) {
        alert('Vous avez déjà une équipe');
      }

      if (res.status === 400) {
        alert("Nom d'équipe invalide");
      }
    });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        gap: 5,
        mt: 5,
      }}
    >
      {/* Rejoindre une team */}

      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Rejoindre une team
        </Typography>

        <Typography>
          La recherche d'équipe sera disponible prochainement.
        </Typography>

        <Button variant="contained" sx={{ mt: 3 }}>
          Envoyer demande
        </Button>
      </Paper>

      {/* Créer une team */}

      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Créer une team
        </Typography>

        <TextField
          fullWidth
          label="Nom de l'équipe"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Button variant="contained" onClick={createTeam}>
          Créer
        </Button>
      </Paper>
    </Box>
  );
};

export default JoinOrCreateTeam;
