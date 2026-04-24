import { Box, Typography } from '@mui/material';
import { MemberDto } from '../../../../types/admin.types';
import { MemberRow } from './MemberRow';

interface Props {
  title: string;
  count: number;
  members: MemberDto[];
  borderColor: string;
  isBannedSection?: boolean;
  onAction: (member: MemberDto) => void;
}

// S'occupe des colonnes de liste de membres (actifs ou ban)
// affiche titre, compteur,...
export const MemberListSection = ({
  title,
  count,
  members,
  borderColor,
  isBannedSection,
  onAction,
}: Props) => (
  <Box sx={{ flex: 1, width: '100%' }}>
    <Typography
      variant="h6"
      sx={{
        color: '#fff',
        mb: 2,
        borderBottom: `2px solid ${borderColor}`,
        pb: 1,
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <span>{title}</span>
      <span>{count}</span>
    </Typography>

    {members.length === 0 ? (
      <Typography
        sx={{
          color: 'rgba(255,255,255,0.4)',
          textAlign: 'center',
          mt: 4,
        }}
      >
        Aucun membre {isBannedSection ? 'banni' : 'actif'}
      </Typography>
    ) : (
      <Box sx={{ opacity: isBannedSection ? 0.5 : 1 }}>
        {members.map((m) => (
          <MemberRow
            key={m.id}
            member={m}
            onBan={!isBannedSection ? () => onAction(m) : undefined}
            onShowBanInfo={isBannedSection ? () => onAction(m) : undefined}
          />
        ))}
      </Box>
    )}
  </Box>
);
