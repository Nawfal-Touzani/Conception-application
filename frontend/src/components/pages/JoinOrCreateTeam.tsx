import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

type Team = {
  id: number;
  name: string;
};

const JoinOrCreateTeam = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:3000/teams', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setTeams(data));
  }, []);

  const createTeam = async () => {
    const res = await fetch('http://localhost:3000/teams', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: teamName }),
    });

    if (res.status === 201) {
      navigate('/team');
      window.location.reload();
    }
  };

  const joinTeam = async (teamId: number) => {
    await fetch(`http://localhost:3000/teams/${teamId}/membership-requests`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert('Demande envoyée');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 5, mt: 5 }}>
      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Rejoindre une team
        </Typography>

        <List>
          {teams.map((team) => (
            <ListItem
              key={team.id}
              secondaryAction={
                <Button onClick={() => joinTeam(team.id)}>Rejoindre</Button>
              }
            >
              <ListItemText primary={team.name} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p: 4, width: 400 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Créer une team
        </Typography>

        <TextField
          fullWidth
          label="Nom équipe"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button variant="contained" onClick={createTeam}>
          Créer
        </Button>
      </Paper>
    </Box>
  );
};

export default JoinOrCreateTeam;
