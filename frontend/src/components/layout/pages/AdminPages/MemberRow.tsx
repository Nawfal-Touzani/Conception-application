import { Box, Avatar, Typography, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import { MemberDto } from '../../../../types/admin.types';
import { Link } from 'react-router-dom';
import InfoIcon from '@mui/icons-material/Info';

interface MemberRowProps {
  member: MemberDto;
  onDelete?: (member: MemberDto) => void;
  showStatus?: boolean;
  onBan?: (member: MemberDto) => void;
  onShowBanInfo?: (member: MemberDto) => void;
}

// Composant qui représente la ligne de chaque membre (profil, spécialité et actions)
export const MemberRow = ({
  member,
  onDelete,
  onBan,
  onShowBanInfo,
}: MemberRowProps) => (
  <Box
    data-testid={`member-row-${member.tag}`}
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

    <Typography
      component={Link}
      to={`/members/${member.id}`}
      sx={{
        color: '#1a2744',
        minWidth: 120,
        fontSize: '1.4rem',
        textDecoration: 'none',
        cursor: 'pointer',
        '&:hover': {
          textDecoration: 'underline',
        },
      }}
    >
      {member.tag}#{String(member.id).padStart(3, '0')}
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
      {member.isBan && onShowBanInfo && (
        <Tooltip title="Détails du bannissement">
          <IconButton
            onClick={() => onShowBanInfo(member)}
            sx={{ color: '#1a2744' }}
          >
            <InfoIcon />
          </IconButton>
        </Tooltip>
      )}

      {onBan && (
        <IconButton
          onClick={() => onBan(member)}
          sx={{ color: '#ae210f' }}
          aria-label="Bannir le membre"
        >
          <BlockIcon />
        </IconButton>
      )}

      {onDelete && (
        <IconButton
          onClick={() => onDelete(member)}
          sx={{ color: '#f31212' }}
          aria-label="Détails du bannissement"
        >
          <DeleteIcon />
        </IconButton>
      )}
    </Box>
  </Box>
);
