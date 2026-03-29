import { Box, Avatar, Typography, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { MemberDto } from '../../../types/admin.types';

interface MemberRowProps {
  member: MemberDto;
  isCurrentUser?: boolean;
  onDelete?: (member: MemberDto) => void;
  showStatus?: boolean;
}

export const MemberRow = ({
  member,
  isCurrentUser,
  onDelete,
}: MemberRowProps) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: '10px',
      px: 2,
      py: 1.2,
      gap: 2,
      mb: 1,
    }}
  >
    <Avatar
      src={
        member.profileImage
          ? `http://localhost:3000${member.profileImage}`
          : undefined
      }
      alt={member.tag}
      sx={{ width: 60, height: 60 }}
    />

    <Typography sx={{ color: '#1a2744', minWidth: 120, fontSize: '1.4rem' }}>
      {member.tag}
    </Typography>

    <Typography sx={{ color: '#555', fontSize: '1.2rem', flex: 1 }}>
      {member.speciality.charAt(0).toUpperCase() + member.speciality.slice(1)}
    </Typography>

    <Typography
      sx={{
        fontSize: '1.2rem',
        color: member.isAvailable ? '#4caf50' : '#f44336',
        fontWeight: member.isAvailable ? 'normal' : 'bold',
        minWidth: 170,
      }}
    >
      {member.isAvailable ? 'Disponible' : 'Indisponible'}
    </Typography>

    {onDelete && !isCurrentUser && (
      <IconButton
        onClick={() => onDelete(member)}
        sx={{
          color: '#e74c3c',
        }}
      >
        <DeleteIcon />
      </IconButton>
    )}
  </Box>
);
