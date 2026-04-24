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
import {
  getLastPlayedMatch,
  getMatchCountLabel,
  getNextMatch,
  isScorePublic,
  isTeamAWinner,
  isTeamBWinner,
} from '../../../../../utils/match/personal-matches-section.utils';
import { personalMatchesSectionStyles as s } from '../../../../../styles/match/personalMatchesSection.styles';

type Props = {
  token: string;
  onMatchClick: (match: MatchDetail) => void;
};

type MatchColumnProps = {
  title: string;
  icon: React.ReactNode;
  matches: MatchDetail[];
  emptyMessage: string;
  onMatchClick: (match: MatchDetail) => void;
  tone: 'past' | 'upcoming';
};

type FeaturedMatchCardProps = {
  match: MatchDetail;
  onClick: () => void;
  variant: 'past' | 'upcoming';
};

type ElegantMatchRowProps = {
  match: MatchDetail;
  onClick: () => void;
  tone: 'past' | 'upcoming';
};

type TeamProps = {
  name: string;
  winner: boolean;
  align: 'left' | 'right';
};

type SectionLabelProps = {
  icon: React.ReactNode;
  label: string;
};

type StatPillProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
};

type LuxuryEmptyCardProps = {
  title: string;
  description: string;
};

const PersonalMatchesSection: React.FC<Props> = ({ token, onMatchClick }) => {
  const { upcoming, past, loading, error } = usePersonalMatches(token);

  // extrait les deux matchs les plus importants pour la mise en avant
  const lastMatch = getLastPlayedMatch(past);
  const nextMatch = getNextMatch(upcoming);

  if (loading) {
    return (
      <Box sx={s.loadingWrap}>
        {/* ajoute un halo derriere le spinner pour garder le style de la section */}
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
              label="Joues"
              value={past.length}
            />

            <StatPill
              icon={<ScheduleIcon sx={{ fontSize: 15 }} />}
              label="A venir"
              value={upcoming.length}
            />
          </Box>
        </Box>

        <Box sx={s.featuredGrid}>
          <Box sx={s.sectionStack}>
            <SectionLabel
              icon={<HistoryIcon sx={{ fontSize: 15 }} />}
              label="Dernier match joue"
            />

            {lastMatch ? (
              <FeaturedMatchCard
                match={lastMatch}
                variant="past"
                onClick={() => onMatchClick(lastMatch)}
              />
            ) : (
              <LuxuryEmptyCard
                title="Aucun match joue"
                description="Ton historique apparaitra ici des que tu auras dispute une rencontre."
              />
            )}
          </Box>

          <Box sx={s.sectionStack}>
            <SectionLabel
              icon={<ScheduleIcon sx={{ fontSize: 15 }} />}
              label="Prochain rendez vous"
            />

            {nextMatch ? (
              <FeaturedMatchCard
                match={nextMatch}
                variant="upcoming"
                onClick={() => onMatchClick(nextMatch)}
              />
            ) : (
              <LuxuryEmptyCard
                title="Aucun match prevu"
                description="Quand une nouvelle rencontre sera planifiee, elle brillera ici."
              />
            )}
          </Box>
        </Box>
      </Box>

      <Box sx={s.columns}>
        <MatchColumn
          title="Tous les matchs joues"
          icon={<HistoryIcon sx={{ fontSize: 16 }} />}
          matches={past}
          emptyMessage="Aucun match dispute pour le moment."
          onMatchClick={onMatchClick}
          tone="past"
        />

        <MatchColumn
          title="Tous les prochains matchs"
          icon={<ScheduleIcon sx={{ fontSize: 16 }} />}
          matches={upcoming}
          emptyMessage="Aucun match a venir."
          onMatchClick={onMatchClick}
          tone="upcoming"
        />
      </Box>
    </Box>
  );
};

const MatchColumn: React.FC<MatchColumnProps> = ({
  title,
  icon,
  matches,
  emptyMessage,
  onMatchClick,
  tone,
}) => {
  return (
    <Paper elevation={0} sx={s.columnPanel}>
      <Box sx={s.columnHeader}>
        <Box sx={s.columnTitleWrap}>
          <Box sx={s.columnIconWrap}>{icon}</Box>

          <Box>
            <Typography sx={s.columnTitle}>{title}</Typography>
            <Typography sx={s.columnCount}>
              {getMatchCountLabel(matches.length)}
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

const FeaturedMatchCard: React.FC<FeaturedMatchCardProps> = ({
  match,
  onClick,
  variant,
}) => {
  const scorePublic = isScorePublic(match);
  const teamAWon = isTeamAWinner(match);
  const teamBWon = isTeamBWinner(match);

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

const ElegantMatchRow: React.FC<ElegantMatchRowProps> = ({
  match,
  onClick,
  tone,
}) => {
  const scorePublic = isScorePublic(match);
  const teamAWon = isTeamAWinner(match);
  const teamBWon = isTeamBWinner(match);
  const stateColor = getStateColor(match.state);

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

        {/* donne un rappel visuel rapide de l'etat du match */}
        <Box sx={s.stateDot(stateColor)} />
      </Box>
    </Paper>
  );
};

const FeaturedTeam: React.FC<TeamProps> = ({ name, winner, align }) => (
  <Box sx={s.featuredTeam(align)}>
    {winner && align === 'left' && (
      <EmojiEventsIcon sx={{ fontSize: 16, color: '#d6b36a' }} />
    )}

    <Typography noWrap sx={s.featuredTeamName(winner)}>
      {name}
    </Typography>

    {winner && align === 'right' && (
      <EmojiEventsIcon sx={{ fontSize: 16, color: '#d6b36a' }} />
    )}
  </Box>
);

const MiniTeam: React.FC<TeamProps> = ({ name, winner, align }) => (
  <Box sx={s.miniTeam(align)}>
    {winner && align === 'left' && (
      <EmojiEventsIcon sx={{ fontSize: 13, color: '#d6b36a' }} />
    )}

    <Typography noWrap sx={s.miniTeamName(winner)}>
      {name}
    </Typography>

    {winner && align === 'right' && (
      <EmojiEventsIcon sx={{ fontSize: 13, color: '#d6b36a' }} />
    )}
  </Box>
);

const SectionLabel: React.FC<SectionLabelProps> = ({ icon, label }) => (
  <Box sx={s.sectionLabel}>
    {icon}
    <Typography sx={s.sectionLabelText}>{label}</Typography>
  </Box>
);

const StatPill: React.FC<StatPillProps> = ({ icon, label, value }) => (
  <Box sx={s.statPill}>
    {icon}
    <Typography sx={s.statLabel}>{label}</Typography>
    <Typography sx={s.statValue}>{value}</Typography>
  </Box>
);

const LuxuryEmptyCard: React.FC<LuxuryEmptyCardProps> = ({
  title,
  description,
}) => (
  <Paper elevation={0} sx={s.luxuryEmpty}>
    <SportsSoccerIcon sx={s.luxuryEmptyIcon} />
    <Typography sx={s.luxuryEmptyTitle}>{title}</Typography>
    <Typography sx={s.luxuryEmptyDescription}>{description}</Typography>
  </Paper>
);

export default PersonalMatchesSection;
