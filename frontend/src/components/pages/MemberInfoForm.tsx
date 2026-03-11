import { Box } from '@mui/material';
import { MemberProfile } from '../../types/member';
import { ProfileInputField } from './ProfileInputField';

export const MemberInfoForm = ({ profile }: { profile: MemberProfile }) => {
  return (
    <Box>
      <ProfileInputField label="Adresse email :" value={profile.email} />

      <ProfileInputField
        label="Mot de passe :"
        value="**********" // a modifier en fct du mdp du profile connecté
        type="password"
        onEditClick={() => {}}
      />

      <ProfileInputField label="Tag de jeu :" value={profile.tag} />

      <ProfileInputField label="Spécialité :" value={profile.speciality} />
    </Box>
  );
};
