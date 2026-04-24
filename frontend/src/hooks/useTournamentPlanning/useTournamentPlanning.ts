// Hook qui gère toute la logique du planning de tournoi
// La page TournamentPlanningPage ne fait que l'affichage

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/useAuth';
import * as tournamentService from '../../services/tournament/tournament.service';
import {
  buildBracket,
  buildFullBracketFromBackend,
  getTeamAt,
  posEqual,
  swapTeams,
} from '../../utils/TournamentPlanning/tournament.planning.utils';
import {
  Message,
  Phase,
  Round,
  TeamPos,
} from '../../types/tournament.planning.types';
import { TournamentDetails } from '../../types/tournament.types';

const API_URL = '/api/tournaments';

interface UseTournamentPlanningResult {
  tournament: TournamentDetails | null;
  rounds: Round[];
  phase: Phase;
  selected: TeamPos | null;
  message: Message;
  showConfirmModal: boolean;
  showPubOverlay: boolean;
  setShowConfirmModal: (v: boolean) => void;
  setShowPubOverlay: (v: boolean) => void;
  handleTeamClick: (pos: TeamPos) => void;
  doConfirm: () => Promise<void>;
  doReset: () => void;
  doDraft: () => void;
  confirmPublish: () => Promise<void>;
}

export const useTournamentPlanning = (
  tournamentId: number,
): UseTournamentPlanningResult => {
  const { user } = useAuth();
  const token = user?.token ?? '';

  const [tournament, setTournament] = useState<TournamentDetails | null>(null);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [teams, setTeams] = useState<string[]>([]); // Équipes de base, utile pour le reset
  const [phase, setPhase] = useState<Phase>('draft');
  const [confirmedRounds, setConfirmedRounds] = useState<Round[]>([]); // Sauvegarde du bracket confirmé
  const [selected, setSelected] = useState<TeamPos | null>(null); // Équipe sélectionnée pour le swap
  const [message, setMessage] = useState<Message>({ text: '', type: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPubOverlay, setShowPubOverlay] = useState(false);

  // Chargement initial : on check si le planning est déjà publié, confirmé ou encore en draft
  useEffect(() => {
    tournamentService.getTournamentById(token, tournamentId).then((t) => {
      setTournament(t);
      const teamNames = t.registeredTeamNames ?? [];
      setTeams(teamNames);

      const savedBracket = sessionStorage.getItem(`bracket_${tournamentId}`);
      const savedPhase = sessionStorage.getItem(`phase_${tournamentId}`);

      fetch(`${API_URL}/${tournamentId}/matches`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : []))
        .then(
          (
            matches: {
              roundNumber: number;
              teamA: string | null;
              teamB: string | null;
            }[],
          ) => {
            if (matches.length > 0) {
              // Planning publié → on prend les données du backend
              const full = buildFullBracketFromBackend(matches);
              setRounds(full);
              setConfirmedRounds(full);
              setPhase('published');
              sessionStorage.removeItem(`bracket_${tournamentId}`);
              sessionStorage.removeItem(`phase_${tournamentId}`);
            } else if (savedBracket && savedPhase === 'confirmed') {
              // Confirmé mais pas encore publié → on récupère depuis le sessionStorage
              const parsed = JSON.parse(savedBracket);
              setRounds(parsed);
              setConfirmedRounds(parsed);
              setPhase('confirmed');
            } else {
              // Rien → on génère un bracket aléatoire
              setRounds(buildBracket(teamNames));
              setPhase('draft');
            }
          },
        )
        .catch(() => {
          // Si le fetch plante, on essaie quand même de récupérer depuis sessionStorage
          if (savedBracket && savedPhase === 'confirmed') {
            const parsed = JSON.parse(savedBracket);
            setRounds(parsed);
            setConfirmedRounds(parsed);
            setPhase('confirmed');
          } else {
            setRounds(buildBracket(teamNames));
            setPhase('draft');
          }
        });
    });
  }, [tournamentId, token]);

  // Appel API commun pour confirm et publish
  const callPlanningApi = async (p: Phase) => {
    const res = await fetch(`${API_URL}/${tournamentId}/planning`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        phase: p,
        rounds: rounds.map((round) => ({
          matches: round.map((m) => ({ team1: m.team1, team2: m.team2 })),
        })),
      }),
    });
    if (!res.ok) throw new Error('API error');
  };

  // Gère le clic sur une équipe pour faire un swap en mode draft
  const handleTeamClick = (pos: TeamPos) => {
    if (phase !== 'draft') return;
    const teamName = getTeamAt(rounds, pos);
    if (teamName === '?') return; // On peut pas sélectionner un TBD

    if (!selected) {
      setSelected(pos);
    } else if (posEqual(selected, pos)) {
      // Reclique sur la même → désélectionne
      setSelected(null);
    } else {
      const bothRound0 = selected.roundIdx === 0 && pos.roundIdx === 0;
      const byeSwap =
        (selected.roundIdx === 1 && pos.roundIdx === 0) ||
        (selected.roundIdx === 0 && pos.roundIdx === 1);
      // On autorise le swap seulement dans le round 1 ou avec les byes
      if (bothRound0 || byeSwap) setRounds(swapTeams(rounds, selected, pos));
      setSelected(null);
    }
  };

  // Confirme le bracket → sauvegarde en sessionStorage + appel API
  const doConfirm = async () => {
    try {
      await callPlanningApi('confirmed');
      setConfirmedRounds(rounds);
      setSelected(null);
      setPhase('confirmed');
      sessionStorage.setItem(`bracket_${tournamentId}`, JSON.stringify(rounds));
      sessionStorage.setItem(`phase_${tournamentId}`, 'confirmed');
      setMessage({ text: 'Planning confirmé !', type: 'success' });
    } catch {
      setMessage({ text: 'Erreur lors de la confirmation.', type: 'warn' });
    }
  };

  // Reset complet → regénère un bracket aléatoire
  const doReset = () => {
    setRounds(buildBracket(teams));
    setConfirmedRounds([]);
    setSelected(null);
    setPhase('draft');
    sessionStorage.removeItem(`bracket_${tournamentId}`);
    sessionStorage.removeItem(`phase_${tournamentId}`);
  };

  // Revient en mode draft avec le bracket confirmé (pas un nouveau aléatoire)
  const doDraft = () => {
    setRounds(confirmedRounds);
    setPhase('draft');
    setSelected(null);
  };

  // Publication définitive → verrouille le planning
  const confirmPublish = async () => {
    try {
      await callPlanningApi('published');
      sessionStorage.removeItem(`bracket_${tournamentId}`);
      sessionStorage.removeItem(`phase_${tournamentId}`);
      setShowConfirmModal(false);
      setPhase('published');
      setMessage({ text: '', type: '' });
      setTimeout(() => setShowPubOverlay(true), 300);
    } catch {
      setMessage({ text: 'Erreur lors de la publication.', type: 'warn' });
    }
  };

  return {
    tournament,
    rounds,
    phase,
    selected,
    message,
    showConfirmModal,
    showPubOverlay,
    setShowConfirmModal,
    setShowPubOverlay,
    handleTeamClick,
    doConfirm,
    doReset,
    doDraft,
    confirmPublish,
  };
};
