import React from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Chip,
  Divider,
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HistoryIcon from '@mui/icons-material/History';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { MatchDetail } from '../../../../../types/match.types';
import { usePersonalMatches } from '../../../../../hooks/useMatch/usePersonalMatches';
import {
  formatMatchDateTime,
  getStateColor,
} from '../../../../../utils/match/match.utils';

type Props = {
  token: string;
  onMatchClick: (match: MatchDetail) => void;
};

const PersonalMatchesSection: React.FC<Props> = ({ token, onMatchClick }) => {
  const { upcoming, past, loading, error } = usePersonalMatches(token);

  const lastMatch = past.length > 0 ? past[0] : null;
  const nextMatch = upcoming.length > 0 ? upcoming[0] : null;

  if (loading) {
    return (
      <Box sx={s.loadingWrap}>
        <Box sx={s.loadingOrb} />
        <CircularProgress
          sx={{ color: '#d6b36a', position: 'relative', zIndex: 1 }}
        />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper elevation={0} sx={s.errorBox}>
        <Typography sx={s.errorText}>{error}</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={s.root}>
      <Box sx={s.hero}>
        <Box sx={s.heroGlowOne} />
        <Box sx={s.heroGlowTwo} />

        <Box sx={s.heroTop}>
          <Box>
            <Typography sx={s.eyebrow}>Archives & calendrier</Typography>
          </Box>

          <Box sx={s.statsWrap}>
            <StatPill
              icon={<HistoryIcon sx={{ fontSize: 15 }} />}
              label="Joués"
              value={past.length}
            />
            <StatPill
              icon={<ScheduleIcon sx={{ fontSize: 15 }} />}
              label="À venir"
              value={upcoming.length}
            />
          </Box>
        </Box>

        <Box sx={s.featuredGrid}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <SectionLabel
              icon={<HistoryIcon sx={{ fontSize: 15 }} />}
              label="Dernier match joué"
            />
            {lastMatch ? (
              <FeaturedMatchCard
                match={lastMatch}
                variant="past"
                onClick={() => onMatchClick(lastMatch)}
              />
            ) : (
              <LuxuryEmptyCard
                title="Aucun match joué"
                description="Ton historique apparaîtra ici dès que tu auras disputé une rencontre."
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <SectionLabel
              icon={<ScheduleIcon sx={{ fontSize: 15 }} />}
              label="Prochain rendez-vous"
            />
            {nextMatch ? (
              <FeaturedMatchCard
                match={nextMatch}
                variant="upcoming"
                onClick={() => onMatchClick(nextMatch)}
              />
            ) : (
              <LuxuryEmptyCard
                title="Aucun match prévu"
                description="Quand une nouvelle rencontre sera planifiée, elle brillera ici."
              />
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={s.columns}>
        <MatchColumn
          title="Tous les matchs joués"
          icon={<HistoryIcon sx={{ fontSize: 16 }} />}
          matches={past}
          emptyMessage="Aucun match disputé pour le moment."
          onMatchClick={onMatchClick}
          tone="past"
        />

        <MatchColumn
          title="Tous les prochains matchs"
          icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
          matches={upcoming}
          emptyMessage="Aucun match à venir."
          onMatchClick={onMatchClick}
          tone="upcoming"
        />
      </Box>
    </Box>
  );
};

const MatchColumn: React.FC<{
  title: string;
  icon: React.ReactNode;
  matches: MatchDetail[];
  emptyMessage: string;
  onMatchClick: (match: MatchDetail) => void;
  tone: 'past' | 'upcoming';
}> = ({ title, icon, matches, emptyMessage, onMatchClick, tone }) => {
  return (
    <Paper elevation={0} sx={s.columnPanel}>
      <Box sx={s.columnHeader}>
        <Box sx={s.columnTitleWrap}>
          <Box sx={s.columnIconWrap}>{icon}</Box>
          <Box>
            <Typography sx={s.columnTitle}>{title}</Typography>
            <Typography sx={s.columnCount}>
              {matches.length} match{matches.length > 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider sx={s.divider} />

      {matches.length === 0 ? (
        <Box sx={s.columnEmpty}>
          <Typography sx={s.columnEmptyText}>{emptyMessage}</Typography>
        </Box>
      ) : (
        <Box sx={s.list}>
          {matches.map((match) => (
            <ElegantMatchRow
              key={match.id}
              match={match}
              tone={tone}
              onClick={() => onMatchClick(match)}
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

const FeaturedMatchCard: React.FC<{
  match: MatchDetail;
  onClick: () => void;
  variant: 'past' | 'upcoming';
}> = ({ match, onClick, variant }) => {
  const scorePublic = match.scoreA !== null && match.scoreB !== null;
  const teamAWon = match.winnerId === match.teamA?.id;
  const teamBWon = match.winnerId === match.teamB?.id;

  return (
    <Paper elevation={0} onClick={onClick} sx={s.featuredCard(variant)}>
      <Box sx={s.featuredOverlay} />

      <Box sx={s.featuredHeader}>
        <Chip label={match.roundLabel} size="small" sx={s.roundChip} />
        <Box sx={s.statePill}>
          <FiberManualRecordIcon
            sx={{
              fontSize: 10,
              color: getStateColor(match.state),
            }}
          />
          <Typography sx={s.stateText}>{match.state}</Typography>
        </Box>
      </Box>

      <Typography sx={s.tournamentName}>{match.tournamentName}</Typography>

      <Box sx={s.featuredMiddle}>
        <FeaturedTeam
          name={match.teamA?.name ?? '?'}
          winner={teamAWon}
          align="left"
        />
        <Box sx={s.bigScoreBox}>
          {scorePublic ? (
            <>
              <Typography sx={s.bigScore(teamAWon)}>{match.scoreA}</Typography>
              <Typography sx={s.bigDash}>—</Typography>
              <Typography sx={s.bigScore(teamBWon)}>{match.scoreB}</Typography>
            </>
          ) : (
            <Typography sx={s.vsText}>VS</Typography>
          )}
        </Box>
        <FeaturedTeam
          name={match.teamB?.name ?? '?'}
          winner={teamBWon}
          align="right"
        />
      </Box>

      <Box sx={s.featuredFooter}>
        <Typography sx={s.featuredDate}>
          {formatMatchDateTime(match.dateTime)}
        </Typography>
        <Box sx={s.openWrap}>
          <Typography sx={s.openText}>Ouvrir</Typography>
          <ArrowOutwardIcon sx={{ fontSize: 16 }} />
        </Box>
      </Box>
    </Paper>
  );
};

const ElegantMatchRow: React.FC<{
  match: MatchDetail;
  onClick: () => void;
  tone: 'past' | 'upcoming';
}> = ({ match, onClick, tone }) => {
  const scorePublic = match.scoreA !== null && match.scoreB !== null;
  const teamAWon = match.winnerId === match.teamA?.id;
  const teamBWon = match.winnerId === match.teamB?.id;

  return (
    <Paper elevation={0} onClick={onClick} sx={s.rowCard(tone)}>
      <Box sx={s.rowTop}>
        <Typography sx={s.rowTournament} noWrap>
          {match.tournamentName}
        </Typography>
        <Chip label={match.roundLabel} size="small" sx={s.rowChip} />
      </Box>

      <Box sx={s.rowMiddle}>
        <MiniTeam
          name={match.teamA?.name ?? '?'}
          winner={teamAWon}
          align="left"
        />
        <Box sx={s.rowScoreCenter}>
          {scorePublic ? (
            <Typography sx={s.rowScore}>
              {match.scoreA} - {match.scoreB}
            </Typography>
          ) : (
            <Typography sx={s.rowVs}>VS</Typography>
          )}
        </Box>
        <MiniTeam
          name={match.teamB?.name ?? '?'}
          winner={teamBWon}
          align="right"
        />
      </Box>

      <Box sx={s.rowBottom}>
        <Typography sx={s.rowDate}>
          {formatMatchDateTime(match.dateTime)}
        </Typography>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: getStateColor(match.state),
            boxShadow: `0 0 12px ${getStateColor(match.state)}`,
          }}
        />
      </Box>
    </Paper>
  );
};

const FeaturedTeam: React.FC<{
  name: string;
  winner: boolean;
  align: 'left' | 'right';
}> = ({ name, winner, align }) => (
  <Box
    sx={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      gap: 0.75,
      minWidth: 0,
    }}
  >
    {winner && align === 'left' && (
      <EmojiEventsIcon sx={{ fontSize: 16, color: '#d6b36a' }} />
    )}
    <Typography
      noWrap
      sx={{
        color: winner ? '#f4d58d' : 'rgba(255,255,255,0.88)',
        fontWeight: winner ? 800 : 600,
        fontSize: '0.98rem',
        letterSpacing: 0.2,
        maxWidth: '100%',
      }}
    >
      {name}
    </Typography>
    {winner && align === 'right' && (
      <EmojiEventsIcon sx={{ fontSize: 16, color: '#d6b36a' }} />
    )}
  </Box>
);

const MiniTeam: React.FC<{
  name: string;
  winner: boolean;
  align: 'left' | 'right';
}> = ({ name, winner, align }) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      display: 'flex',
      justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
      alignItems: 'center',
      gap: 0.5,
    }}
  >
    {winner && align === 'left' && (
      <EmojiEventsIcon sx={{ fontSize: 13, color: '#d6b36a' }} />
    )}
    <Typography
      noWrap
      sx={{
        fontSize: '0.84rem',
        fontWeight: winner ? 800 : 500,
        color: winner ? '#f4d58d' : 'rgba(245,247,255,0.92)',
      }}
    >
      {name}
    </Typography>
    {winner && align === 'right' && (
      <EmojiEventsIcon sx={{ fontSize: 13, color: '#d6b36a' }} />
    )}
  </Box>
);

const SectionLabel: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <Box sx={s.sectionLabel}>
    {icon}
    <Typography sx={s.sectionLabelText}>{label}</Typography>
  </Box>
);

const StatPill: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
}> = ({ icon, label, value }) => (
  <Box sx={s.statPill}>
    {icon}
    <Typography sx={s.statLabel}>{label}</Typography>
    <Typography sx={s.statValue}>{value}</Typography>
  </Box>
);

const LuxuryEmptyCard: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => (
  <Paper elevation={0} sx={s.luxuryEmpty}>
    <SportsSoccerIcon
      sx={{ fontSize: 26, color: 'rgba(214,179,106,0.9)', mb: 1.5 }}
    />
    <Typography sx={s.luxuryEmptyTitle}>{title}</Typography>
    <Typography sx={s.luxuryEmptyDescription}>{description}</Typography>
  </Paper>
);

const s = {
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2.5,
  },

  loadingWrap: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    py: 6,
    position: 'relative',
  },

  loadingOrb: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: '50%',
    background:
      'radial-gradient(circle, rgba(214,179,106,0.22) 0%, rgba(214,179,106,0) 72%)',
    filter: 'blur(6px)',
  },

  errorBox: {
    borderRadius: '24px',
    p: 2.5,
    background:
      'linear-gradient(135deg, rgba(80,18,24,0.92) 0%, rgba(44,10,15,0.96) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  errorText: {
    color: '#ffd5d5',
    textAlign: 'center' as const,
    fontSize: '0.95rem',
    fontWeight: 600,
  },

  hero: {
    position: 'relative' as const,
    overflow: 'hidden',
    borderRadius: '30px',
    p: { xs: 2, md: 3 },
    background: `
      radial-gradient(circle at top left, rgba(212,175,92,0.18), transparent 28%),
      radial-gradient(circle at bottom right, rgba(106,130,251,0.18), transparent 32%),
      linear-gradient(145deg, #0f172d 0%, #182443 48%, #0c1224 100%)
    `,
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 24px 70px rgba(6, 10, 20, 0.28)',
  },

  heroGlowOne: {
    position: 'absolute' as const,
    top: -40,
    left: -30,
    width: 180,
    height: 180,
    borderRadius: '50%',
    background: 'rgba(214,179,106,0.12)',
    filter: 'blur(28px)',
    pointerEvents: 'none' as const,
  },

  heroGlowTwo: {
    position: 'absolute' as const,
    right: -40,
    bottom: -60,
    width: 220,
    height: 220,
    borderRadius: '50%',
    background: 'rgba(92,135,255,0.10)',
    filter: 'blur(32px)',
    pointerEvents: 'none' as const,
  },

  heroTop: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: { xs: 'flex-start', md: 'center' },
    flexDirection: { xs: 'column', md: 'row' },
    gap: 2,
    mb: 2.25,
  },

  eyebrow: {
    color: 'rgba(214,179,106,0.95)',
    textTransform: 'uppercase' as const,
    letterSpacing: 2.2,
    fontSize: '1rem',
    fontWeight: 800,
    mb: 0.75,
  },

  title: {
    color: '#f8f4ea',
    fontSize: { xs: '1.7rem', md: '2.2rem' },
    fontWeight: 900,
    lineHeight: 1,
    letterSpacing: -0.8,
    mb: 0.8,
  },

  subtitle: {
    color: 'rgba(239,242,250,0.72)',
    fontSize: '0.95rem',
    maxWidth: 560,
    lineHeight: 1.6,
  },

  statsWrap: {
    display: 'flex',
    gap: 1,
    flexWrap: 'wrap' as const,
  },

  statPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.8,
    px: 1.2,
    py: 0.9,
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    backdropFilter: 'blur(12px)',
  },

  statLabel: {
    color: 'rgba(240,243,250,0.75)',
    fontSize: '0.8rem',
    fontWeight: 600,
  },

  statValue: {
    color: '#f4d58d',
    fontSize: '0.92rem',
    fontWeight: 900,
  },

  featuredGrid: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
    gap: 2,
  },

  sectionLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 0.75,
    color: 'rgba(239,242,250,0.88)',
  },

  sectionLabelText: {
    fontSize: '0.8rem',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.6,
    fontWeight: 800,
  },

  featuredCard: (variant: 'past' | 'upcoming') => ({
    position: 'relative' as const,
    overflow: 'hidden',
    borderRadius: '24px',
    p: 2,
    minHeight: 200,
    cursor: 'pointer',
    background:
      variant === 'past'
        ? 'linear-gradient(145deg, rgba(22,31,58,0.96) 0%, rgba(14,20,39,0.98) 100%)'
        : 'linear-gradient(145deg, rgba(18,36,57,0.96) 0%, rgba(10,20,35,0.98) 100%)',
    border:
      variant === 'past'
        ? '1px solid rgba(214,179,106,0.18)'
        : '1px solid rgba(114,164,255,0.18)',
    boxShadow: '0 18px 40px rgba(0,0,0,0.24)',
    transition:
      'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 28px 60px rgba(0,0,0,0.30)',
      borderColor:
        variant === 'past'
          ? 'rgba(214,179,106,0.34)'
          : 'rgba(114,164,255,0.34)',
    },
  }),

  featuredOverlay: {
    position: 'absolute' as const,
    inset: 0,
    background:
      'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
    pointerEvents: 'none' as const,
  },

  featuredHeader: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 1.4,
    gap: 1,
  },

  roundChip: {
    backgroundColor: 'rgba(214,179,106,0.14)',
    color: '#f4d58d',
    fontWeight: 800,
    borderRadius: '999px',
    border: '1px solid rgba(214,179,106,0.16)',
    '& .MuiChip-label': {
      px: 1,
    },
  },

  statePill: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.6,
    px: 1,
    py: 0.45,
    borderRadius: '999px',
    background: 'rgba(255,255,255,0.05)',
  },

  stateText: {
    color: 'rgba(238,241,248,0.72)',
    fontSize: '0.72rem',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },

  tournamentName: {
    position: 'relative' as const,
    zIndex: 1,
    color: '#f7f1e4',
    fontSize: '0.95rem',
    fontWeight: 700,
    mb: 2.2,
    pr: 4,
  },

  featuredMiddle: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 2.4,
  },

  bigScoreBox: {
    minWidth: 112,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 1,
  },

  bigScore: (winner: boolean) => ({
    fontSize: '2rem',
    fontWeight: 900,
    lineHeight: 1,
    minWidth: 28,
    textAlign: 'center' as const,
    color: winner ? '#f4d58d' : '#f5f7fb',
    textShadow: winner ? '0 0 24px rgba(214,179,106,0.16)' : 'none',
  }),

  bigDash: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: '1.4rem',
    fontWeight: 500,
  },

  vsText: {
    color: 'rgba(245,247,251,0.86)',
    fontStyle: 'italic',
    fontSize: '0.9rem',
    fontWeight: 700,
    letterSpacing: 1,
  },

  featuredFooter: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 1,
  },

  featuredDate: {
    color: 'rgba(238,241,248,0.72)',
    fontSize: '0.8rem',
    fontWeight: 500,
  },

  openWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5,
    color: '#f4d58d',
  },

  openText: {
    fontSize: '0.8rem',
    fontWeight: 800,
    letterSpacing: 0.5,
  },

  luxuryEmpty: {
    borderRadius: '24px',
    p: 2.5,
    minHeight: 200,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center' as const,
    background:
      'linear-gradient(145deg, rgba(17,24,43,0.9) 0%, rgba(11,15,28,0.96) 100%)',
    border: '1px dashed rgba(214,179,106,0.18)',
  },

  luxuryEmptyTitle: {
    color: '#f4ede0',
    fontSize: '1rem',
    fontWeight: 800,
    mb: 0.75,
  },

  luxuryEmptyDescription: {
    color: 'rgba(236,240,248,0.64)',
    fontSize: '0.88rem',
    maxWidth: 280,
    lineHeight: 1.6,
  },

  columns: {
    display: 'grid',
    gridTemplateColumns: { xs: '1fr', xl: '1fr 1fr' },
    gap: 2,
  },

  columnPanel: {
    borderRadius: '28px',
    overflow: 'hidden',
    background:
      'linear-gradient(180deg, rgba(13,18,33,0.97) 0%, rgba(10,14,25,0.99) 100%)',
    border: '1px solid rgba(255,255,255,0.08)',
    boxShadow: '0 18px 50px rgba(5, 8, 18, 0.24)',
  },

  columnHeader: {
    px: 2,
    pt: 2,
    pb: 1.5,
  },

  columnTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 1.2,
  },

  columnIconWrap: {
    width: 36,
    height: 36,
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(214,179,106,0.10)',
    color: '#f4d58d',
    border: '1px solid rgba(214,179,106,0.14)',
  },

  columnTitle: {
    color: '#f7f3eb',
    fontSize: '1rem',
    fontWeight: 800,
    letterSpacing: 0.2,
  },

  columnCount: {
    color: 'rgba(230,235,245,0.55)',
    fontSize: '0.8rem',
    mt: 0.15,
  },

  divider: {
    borderColor: 'rgba(255,255,255,0.08)',
  },

  columnEmpty: {
    px: 2,
    py: 4,
  },

  columnEmptyText: {
    color: 'rgba(230,235,245,0.58)',
    fontSize: '0.9rem',
    fontStyle: 'italic',
    textAlign: 'center' as const,
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    p: 1.5,
    maxHeight: 620,
    overflowY: 'auto' as const,
    '&::-webkit-scrollbar': {
      width: 8,
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(255,255,255,0.10)',
      borderRadius: 999,
    },
  },

  rowCard: (tone: 'past' | 'upcoming') => ({
    borderRadius: '20px',
    p: 1.5,
    cursor: 'pointer',
    background:
      tone === 'past'
        ? 'linear-gradient(145deg, rgba(24,32,57,0.95) 0%, rgba(16,22,40,0.98) 100%)'
        : 'linear-gradient(145deg, rgba(20,35,54,0.95) 0%, rgba(12,21,36,0.98) 100%)',
    border:
      tone === 'past'
        ? '1px solid rgba(214,179,106,0.10)'
        : '1px solid rgba(103,148,236,0.12)',
    transition:
      'transform 160ms ease, border-color 160ms ease, background 160ms ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      borderColor:
        tone === 'past' ? 'rgba(214,179,106,0.24)' : 'rgba(103,148,236,0.24)',
    },
  }),

  rowTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    mb: 1.1,
  },

  rowTournament: {
    color: '#f3f0e8',
    fontSize: '0.78rem',
    fontWeight: 700,
    maxWidth: '68%',
  },

  rowChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    color: 'rgba(244,247,255,0.8)',
    borderRadius: '999px',
    '& .MuiChip-label': {
      px: 0.8,
      fontSize: '0.68rem',
      fontWeight: 700,
    },
  },

  rowMiddle: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    mb: 1,
  },

  rowScoreCenter: {
    minWidth: 74,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  rowScore: {
    color: '#f4d58d',
    fontSize: '1rem',
    fontWeight: 900,
    letterSpacing: 0.4,
  },

  rowVs: {
    color: 'rgba(240,243,250,0.78)',
    fontSize: '0.82rem',
    fontStyle: 'italic',
    fontWeight: 700,
  },

  rowBottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
  },

  rowDate: {
    color: 'rgba(227,233,244,0.6)',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
};

export default PersonalMatchesSection;
