import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from '@mui/material';
import JoinOrCreateTeam from './JoinOrCreateTeam';

type Member = {
  id: number;
  tag: string;
  imageId: number;
};

type Team = {
  id: number;
  name: string;
};

const TeamPage = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // récupérer l'équipe
    fetch('http://localhost:3000/teams/my-team', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 404) {
          setHasTeam(false);
          return;
        }

        const teamData = await res.json();
        setTeam(teamData);
        setHasTeam(true);

        return fetch('http://localhost:3000/teams/members', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      })
      .then((res) => res?.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMembers(data);
        }
      })
      .catch(() => setHasTeam(false));
  }, []);

  if (hasTeam === null) return null;

  if (!hasTeam) return <JoinOrCreateTeam />;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
      <Paper sx={{ width: 500, p: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Équipe : {team?.name}
        </Typography>

        <Typography variant="h6" sx={{ mb: 2 }}>
          Membres
        </Typography>

        <List>
          {members.map((member) => (
            <ListItem key={member.tag}>
              <ListItemAvatar>
                <Avatar src={`/images/${member.imageId}.png`} />
              </ListItemAvatar>

              <ListItemText primary={member.tag} />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default TeamPage;
