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

const TeamPage = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:3000/teams/members', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (res.status === 404) {
          setHasTeam(false);
          return;
        }

        if (!res.ok) {
          throw new Error();
        }

        const data = await res.json();
        setMembers(data);
        setHasTeam(true);
      })
      .catch(() => setHasTeam(false));
  }, []);

  if (hasTeam === null) {
    return null;
  }

  if (!hasTeam) {
    return <JoinOrCreateTeam />;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
      <Paper sx={{ width: 500, p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Membres de l'équipe
        </Typography>

        <List>
          {members.map((member) => (
            <ListItem key={member.id}>
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
