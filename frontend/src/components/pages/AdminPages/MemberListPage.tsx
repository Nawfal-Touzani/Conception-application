import { useEffect, useState } from 'react';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import * as adminService from '../../../services/admin.service';
import { MemberDto } from '../../../types/admin.types';
import { useAuth } from '../../../contexts/useAuth';
import { MemberRow } from './MemberRow';

const MembersListPage = () => {
  const [members, setMembers] = useState<MemberDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    adminService
      .getAllMembers(user?.token ?? '')
      .then(setMembers)
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#1a2744',
        p: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 760 }}>
        <Typography
          variant="h4"
          sx={{ color: '#fff', fontWeight: 800, mb: 4, textAlign: 'center' }}
        >
          Tous les Membres
        </Typography>

        <Button
          onClick={() => navigate('/admin')}
          sx={{ color: '#d8a46b', mb: 2, fontWeight: 700 }}
        >
          ←
        </Button>

        {loading ? (
          <CircularProgress
            sx={{ color: '#fff', display: 'block', mx: 'auto' }}
          />
        ) : (
          members.map((m) => <MemberRow key={m.id} member={m} />)
        )}
      </Box>
    </Box>
  );
};

export default MembersListPage;
