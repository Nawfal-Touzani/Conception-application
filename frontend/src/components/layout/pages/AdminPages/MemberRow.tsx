import { Box, Avatar, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import { MemberDto } from '../../../../types/admin.types';

interface MemberRowProps {
  member: MemberDto;
  isCurrentUser?: boolean;
  onDelete?: (member: MemberDto) => void;
  showStatus?: boolean;
  onBan?: (member: MemberDto) => void;
}

export const MemberRow = ({
  member,
  isCurrentUser,
  onDelete,
  onBan,
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

    <Box sx={{ display: 'flex', gap: 1 }}>
      {onBan && (
        <Tooltip
          title={
            isCurrentUser
              ? 'Vous ne pouvez pas vous bannir'
              : 'Bannir le membre'
          }
        >
          <span>
            {' '}
            <IconButton
              onClick={() => onBan(member)}
              disabled={isCurrentUser}
              sx={{
                color: '#ae210f',
                '&.Mui-disabled': { color: 'rgba(103, 94, 93, 0.3)' },
              }}
            >
              <BlockIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}

      {onDelete && (
        <Tooltip
          title={
            isCurrentUser
              ? 'Vous ne pouvez pas vous révoquer'
              : 'Révoquer Admin'
          }
        >
          <span>
            <IconButton
              onClick={() => onDelete(member)}
              disabled={isCurrentUser}
              sx={{
                color: '#f31212',
                '&.Mui-disabled': { color: 'rgba(104, 96, 96, 0.43)' },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>
      )}
    </Box>
  </Box>
);
