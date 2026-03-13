import { Box } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import { MemberProfile } from '../../types/member';
import * as memberService from '../../services/memberService';
import { ProfileInputField } from './ProfileInputField';
import { PasswordModal } from '../Password/PassordModal';
import { SpecialityMenu } from '../Speciality/SpecialityMenu';

export const MemberInfoForm = ({ profile }: { profile: MemberProfile }) => {
  const { user } = useAuth();
  const [openPasswordModal, setOpenPasswordModal] = useState(false);

  const handleSpecialityUpdate = async (name: string) => {
    if (!user?.token) return;
    try {
      await memberService.updateMyProfile(user.token, { speciality: name });
      window.location.reload();
    } catch {
      alert('Erreur lors du changement de spécialité');
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <ProfileInputField label="Adresse email :" value={profile.email} />

      <ProfileInputField
        label="Mot de passe :"
        value="**********"
        type="password"
        onEditClick={() => setOpenPasswordModal(true)}
      />

      <ProfileInputField label="Tag de jeu :" value={profile.tag} />

      <SpecialityMenu
        currentSpeciality={profile.speciality}
        onUpdate={handleSpecialityUpdate}
      />

      {user?.token && (
        <PasswordModal
          open={openPasswordModal}
          onClose={() => setOpenPasswordModal(false)}
          token={user.token}
        />
      )}
    </Box>
  );
};
