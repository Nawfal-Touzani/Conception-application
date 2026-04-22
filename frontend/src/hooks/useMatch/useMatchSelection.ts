import { useState, useEffect } from 'react';
import { MatchDetail, MemberSelectionDto } from '../../types/match.types';
import {
  getEligibleMembers,
  submitSelection,
  modifySelection,
} from '../../services/match/match.service';

interface UseMatchSelectionResult {
  eligibleMembers: MemberSelectionDto[];
  selectedIds: number[];
  loading: boolean;
  submitting: boolean;
  errorMsg: string | null;
  successMsg: string | null;
  toggleMember: (id: number) => void;
  handleSubmit: () => Promise<void>;
}

// hasExistingSelection: true si l'équipe du responsable a déjà une compo soumise
// (lineupStatus !== 'NOT_SELECTED') => bascule POST vers PUT
export const useMatchSelection = (
  match: MatchDetail,
  token: string,
  hasExistingSelection: boolean,
  onSuccess: (updated: MatchDetail) => void,
): UseMatchSelectionResult => {
  const [eligibleMembers, setEligibleMembers] = useState<MemberSelectionDto[]>(
    [],
  );
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadEligibleMembers = async () => {
      setErrorMsg(null);

      try {
        const members = await getEligibleMembers(match.id, token);
        setEligibleMembers(members);
      } catch (err) {
        if (err instanceof Error) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg('Erreur lors du chargement des membres.');
        }
      } finally {
        setLoading(false);
      }
    };

    loadEligibleMembers();
  }, [match.id, token]);

  const toggleMember = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      // Maximum 4 joueurs sélectionnables
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    if (selectedIds.length !== 4) {
      setErrorMsg('Sélectionnez exactement 4 joueurs.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // POST pour première soumission, PUT pour modification
      const updated = hasExistingSelection
        ? await modifySelection(match.id, selectedIds, token)
        : await submitSelection(match.id, selectedIds, token);

      setSuccessMsg('Composition enregistrée !');
      onSuccess(updated);
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Erreur lors de la soumission de la composition.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    eligibleMembers,
    selectedIds,
    loading,
    submitting,
    errorMsg,
    successMsg,
    toggleMember,
    handleSubmit,
  };
};
