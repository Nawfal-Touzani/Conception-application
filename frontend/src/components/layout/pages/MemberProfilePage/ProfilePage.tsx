import { useEffect, useState } from 'react';
import { useAuth } from '../../../../contexts/useAuth';
import { MemberProfile } from '../../../../types/member';
import * as memberService from '../../../../services/member/member.service';
import { Container, Divider, Grid2, Paper, Typography } from '@mui/material';
import { ProfileSidebar } from './ProfileSidebar';
import { MemberInfoForm } from './MemberInfoForm';
import { ActionSidebar } from './ActionsSideBar';
import { UnavailabilitySection } from './Unavailability/Unavailability';
import PersonalMatchesSection from './Match/PersonalMatchesSection';
import MatchDetailPage from '../MatchPage/MatchDetailPage';
import MatchSelectionPage from '../MatchPage/MatchSelectionPage';
import { MatchDetail } from '../../../../types/match.types';
import * as teamService from '../../../../services/team/team.service';
import { TeamDto } from '../../../../types/team.types';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [myTeam, setMyTeam] = useState<TeamDto | null>(null);

  const token = user?.token ?? '';

  const [view, setView] = useState<
    'profile' | 'matchDetail' | 'matchSelection'
  >('profile');
  const [selectedMatch, setSelectedMatch] = useState<MatchDetail | null>(null);
  const [hasExistingSelection, setHasExistingSelection] = useState(false);

  useEffect(() => {
    if (user?.token) {
      memberService.getMyProfile(user.token).then(setProfile);
    }
  }, [user]);

  useEffect(() => {
    if (!token) return;

    teamService
      .getMyTeam(token)
      .then(setMyTeam)
      .catch(() => setMyTeam(null));
  }, [token]);

  const isResponsible =
    myTeam !== null &&
    (myTeam.responsibleTag === user?.tag ||
      myTeam.secondResponsibleTag === user?.tag);

  const userTeamId = myTeam?.id ?? null;

  if (!profile) return <Typography color="white">Chargement...</Typography>;

  if (view === 'matchDetail' && selectedMatch) {
    return (
      <MatchDetailPage
        match={selectedMatch}
        onBack={() => setView('profile')}
        isResponsible={isResponsible}
        userTeamId={userTeamId}
        onNavigateToSelection={(m, hasExisting) => {
          setSelectedMatch(m);
          setHasExistingSelection(hasExisting);
          setView('matchSelection');
        }}
      />
    );
  }

  if (view === 'matchSelection' && selectedMatch) {
    return (
      <MatchSelectionPage
        match={selectedMatch}
        hasExistingSelection={hasExistingSelection}
        onBack={(updated) => {
          if (updated) setSelectedMatch(updated);
          setView('matchDetail');
        }}
      />
    );
  }

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

        <Grid2 size={{ xs: 12 }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography
              variant="h5"
              sx={{ mb: 2, fontWeight: 'bold', color: '#1e2a44' }}
            >
              Mes matchs
            </Typography>
            <Divider
              sx={{ mb: 2, borderBottomWidth: 2, backgroundColor: '#1e2a44' }}
            />
            <PersonalMatchesSection
              token={token}
              onMatchClick={(match) => {
                setSelectedMatch(match);
                setView('matchDetail');
              }}
            />
          </Paper>
        </Grid2>
      </Grid2>
    </Container>
  );
};
