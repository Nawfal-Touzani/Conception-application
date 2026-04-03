import { useEffect, useState } from 'react';
import { useAuth } from '../../../../contexts/useAuth';
import { MemberProfile } from '../../../../types/member';
import * as memberService from '../../../../services/member/member.service';
import { Container, Divider, Grid2, Paper, Typography } from '@mui/material';
import { ProfileSidebar } from './ProfileSidebar';
import { MemberInfoForm } from './MemberInfoForm';
import { ActionSidebar } from './ActionsSideBar';
import { UnavailabilitySection } from '../../Unavailability/Unavailability';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);

  useEffect(() => {
    if (user?.token) {
      memberService.getMyProfile(user.token).then(setProfile);
    }
  }, [user]);

  if (!profile) return <Typography color="white">Chargement...</Typography>;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 2, bgcolor: '#1e2a44', p: 2 }}>
      <Typography
        variant="h4"
        color="white"
        align="center"
        sx={{ mb: 4, fontWeight: 'bold' }}
      >
        Profil
      </Typography>

      <Grid2 container spacing={3}>
        <Grid2 size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 3, minHeight: '600px' }}>
            <Typography
              variant="h4"
              align="center"
              sx={{ mb: 1, fontWeight: 'bold', color: '#1e2a44' }}
            >
              Informations personnelles
            </Typography>
            <Divider
              sx={{ mb: 2, borderBottomWidth: 2, backgroundColor: '#1e2a44' }}
            />
            <MemberInfoForm profile={profile} />

            <UnavailabilitySection />
          </Paper>
        </Grid2>

        <Grid2 size={{ xs: 12, md: 9, lg: 3 }}>
          <ProfileSidebar profile={profile} />
        </Grid2>

        <Grid2 size={{ xs: 12, md: 6, lg: 3 }}>
          <ActionSidebar profile={profile} />
        </Grid2>
      </Grid2>
    </Container>
  );
};
