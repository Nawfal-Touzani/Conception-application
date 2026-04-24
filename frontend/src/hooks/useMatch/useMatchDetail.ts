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
  // garde en memoire le match actuellement affiche
  const [match, setMatch] = useState<MatchDetail>(initialMatch);

  // suit les appels api en cours pour bloquer certains boutons
  const [loading, setLoading] = useState(false);

  // contient le message d'erreur visible dans l'ui
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // contient le message de succes visible dans l'ui
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // ouvre ou ferme la confirmation de forfait
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);

  // ouvre ou ferme la confirmation de contestation
  const [showContestConfirm, setShowContestConfirm] = useState(false);

  // centralise le comportement commun de toutes les actions async
  const runAction = async (
    action: () => Promise<MatchDetail>,
    onSuccess?: (updated: MatchDetail) => void,
  ) => {
    // remet les messages a zero avant une nouvelle action
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updated = await action();

      // met a jour le match local avec la reponse du back
      setMatch(updated);

      // laisse chaque action ajouter son comportement specifique
      onSuccess?.(updated);
    } catch (err) {
      // transforme l'erreur en message simple pour l'utilisateur
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Une erreur est survenue.');
      }
    } finally {
      // termine toujours le loading meme si l'appel echoue
      setLoading(false);
    }
  };

  const handleForfeit = async () => {
    await runAction(
      () => declareForfeit(match.id, token),
      () => {
        // ferme la modale puis confirme l'action a l'utilisateur
        setSuccessMsg('Forfait declare. Score attribue 0 - 5.');
        setShowForfeitConfirm(false);
      },
    );
  };

  const handleValidate = async () => {
    await runAction(
      () => validateResult(match.id, token),
      () => {
        // informe que le resultat a ete valide
        setSuccessMsg('Resultat valide.');
      },
    );
  };

  const handleContest = async () => {
    await runAction(
      () => contestResult(match.id, token),
      () => {
        // ferme la modale puis informe qu'un controle suivra
        setSuccessMsg('Resultat conteste. Un administrateur va verifier.');
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
