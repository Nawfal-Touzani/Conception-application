import { useState } from 'react';
import { MatchDetail } from '../../types/match.types';
import {
  declareForfeit,
  validateResult,
  contestResult,
} from '../../services/match/match.service';

interface UseMatchDetailResult {
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
}

export const useMatchDetail = (
  initialMatch: MatchDetail,
  token: string,
): UseMatchDetailResult => {
  const [match, setMatch] = useState<MatchDetail>(initialMatch);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);
  const [showContestConfirm, setShowContestConfirm] = useState(false);

  // Helper interne qui factorise le loading/error/success autour d'une action
  const runAction = async (
    action: () => Promise<MatchDetail>,
    onSuccess?: (updated: MatchDetail) => void,
  ) => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updated = await action();
      setMatch(updated);
      onSuccess?.(updated);
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForfeit = async () => {
    await runAction(
      () => declareForfeit(match.id, token),
      () => {
        setSuccessMsg('Forfait déclaré. Score attribué 0–5.');
        setShowForfeitConfirm(false);
      },
    );
  };

  const handleValidate = async () => {
    await runAction(
      () => validateResult(match.id, token),
      () => setSuccessMsg('Résultat validé.'),
    );
  };

  const handleContest = async () => {
    await runAction(
      () => contestResult(match.id, token),
      () => {
        setSuccessMsg('Résultat contesté. Un administrateur va vérifier.');
        setShowContestConfirm(false);
      },
    );
  };

  return {
    match,
    loading,
    errorMsg,
    successMsg,
    showForfeitConfirm,
    showContestConfirm,
    setShowForfeitConfirm,
    setShowContestConfirm,
    handleForfeit,
    handleValidate,
    handleContest,
    onMatchUpdated: setMatch,
  };
};
