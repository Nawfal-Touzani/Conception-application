import { useAuth } from '../../contexts/useAuth';
import { MatchDetail } from '../../types/match.types';
import { useMatchSelection } from './useMatchSelection';

interface UseMatchSelectionPageParams {
  match: MatchDetail;
  hasExistingSelection: boolean;
  onBack: (updatedMatch?: MatchDetail) => void;
}

export const useMatchSelectionPage = ({
  match,
  hasExistingSelection,
  onBack,
}: UseMatchSelectionPageParams) => {
  // recupere le token de l'utilisateur connecte
  const { user } = useAuth();
  const token = user?.token ?? '';

  // branche le hook metier principal avec le token courant
  return useMatchSelection(match, token, hasExistingSelection, onBack);
};
