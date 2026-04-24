import { useAuth } from '../../contexts/useAuth';
import { MatchDetail, TeamMatchDto } from '../../types/match.types';
import { useMatchDetail } from './useMatchDetail';
import {
  getMyTeam,
  hasExistingSelection,
  isPendingResult,
  isScheduledMatch,
  isScorePublic,
} from '../../utils/match/match-detail.utils';

interface UseMatchDetailPageParams {
  initialMatch: MatchDetail;
  userTeamId?: number | null;
}

interface UseMatchDetailPageResult {
  match: MatchDetail;
  loading: boolean;
  errorMsg: string | null;
  successMsg: string | null;
  showForfeitConfirm: boolean;
  showContestConfirm: boolean;
  setShowForfeitConfirm: (v: boolean) => void;
  setShowContestConfirm: (v: boolean) => void;
  handleForfeit: () => Promise<void>;
  handleValidate: () => Promise<void>;
  handleContest: () => Promise<void>;
  onMatchUpdated: (m: MatchDetail) => void;
  myTeam: TeamMatchDto | null;
  scorePublic: boolean;
  isPending: boolean;
  isScheduled: boolean;
  selectionAlreadyExists: boolean;
}

export const useMatchDetailPage = ({
  initialMatch,
  userTeamId = null,
}: UseMatchDetailPageParams): UseMatchDetailPageResult => {
  // recupere le token de l'utilisateur connecte
  const { user } = useAuth();
  const token = user?.token ?? '';

  // reutilise le hook principal pour toutes les actions du match
  const matchDetailState = useMatchDetail(initialMatch, token);

  const { match } = matchDetailState;

  // prepare les donnees d'affichage specifiques a la page
  const myTeam = getMyTeam(match, userTeamId);
  const scorePublic = isScorePublic(match);
  const isPending = isPendingResult(match);
  const isScheduled = isScheduledMatch(match);
  const selectionAlreadyExists = hasExistingSelection(myTeam);

  return {
    ...matchDetailState,
    myTeam,
    scorePublic,
    isPending,
    isScheduled,
    selectionAlreadyExists,
  };
};
