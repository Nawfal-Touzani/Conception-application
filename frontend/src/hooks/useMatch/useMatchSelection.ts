import { useEffect, useState } from 'react';
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

// hasExistingSelection indique si une compo existe deja
// si oui on fera un put au lieu d'un post
export const useMatchSelection = (
  match: MatchDetail,
  token: string,
  hasExistingSelection: boolean,
  onSuccess: (updated: MatchDetail) => void,
): UseMatchSelectionResult => {
  // contient les membres selectionnables retournes par le back
  const [eligibleMembers, setEligibleMembers] = useState<MemberSelectionDto[]>(
    [],
  );

  // contient les ids actuellement coches
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // indique le chargement initial de la liste
  const [loading, setLoading] = useState(true);

  // indique si l'envoi de la composition est en cours
  const [submitting, setSubmitting] = useState(false);

  // message d'erreur affiche dans la page
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // message de succes affiche dans la page
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const loadEligibleMembers = async () => {
      // nettoie les erreurs avant un nouveau chargement
      setErrorMsg(null);

      try {
        const members = await getEligibleMembers(match.id, token);

        // stocke les membres que le responsable peut utiliser
        setEligibleMembers(members);
      } catch (err) {
        // transforme l'erreur en message simple pour l'ui
        if (err instanceof Error) {
          setErrorMsg(err.message);
        } else {
          setErrorMsg('Erreur lors du chargement des membres.');
        }
      } finally {
        // coupe le loading a la fin dans tous les cas
        setLoading(false);
      }
    };

    loadEligibleMembers();
  }, [match.id, token]);

  const toggleMember = (id: number) => {
    setSelectedIds((prev) => {
      // retire le joueur si il etait deja coche
      if (prev.includes(id)) return prev.filter((x) => x !== id);

      // bloque toute selection supplementaire au dela de 4 joueurs
      if (prev.length >= 4) return prev;

      // ajoute le joueur a la selection courante
      return [...prev, id];
    });
  };

  const handleSubmit = async () => {
    // protege le submit si la selection n'est pas complete
    if (selectedIds.length !== 4) {
      setErrorMsg('Selectionnez exactement 4 joueurs.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      // choisit la bonne route selon qu'on cree ou modifie la compo
      const updated = hasExistingSelection
        ? await modifySelection(match.id, selectedIds, token)
        : await submitSelection(match.id, selectedIds, token);

      setSuccessMsg('Composition enregistree !');

      // remonte le match mis a jour au parent
      onSuccess(updated);
    } catch (err) {
      // transforme l'erreur pour l'affichage utilisateur
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Erreur lors de la soumission de la composition.');
      }
    } finally {
      // debloque toujours le bouton en fin de requete
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
