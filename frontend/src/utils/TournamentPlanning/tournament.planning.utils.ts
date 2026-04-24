import { Match, Round, TeamPos } from '../../types/tournament.planning.types';

// Mélange les équipes aléatoirement pour le bracket
export function shuffleArray(array: string[]): string[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Construit le bracket depuis les équipes inscrites
// Si nombre impair → bye automatique (l'équipe passe au tour suivant)
export function buildBracket(teams: string[]): Round[] {
  const rounds: Round[] = [];
  let current = shuffleArray(teams);

  const round1: Match[] = [];
  const nextSlots: string[] = [];

  for (let i = 0; i < current.length; i += 2) {
    if (current[i + 1] === undefined) {
      // Bye : équipe seule, elle passe direct
      nextSlots.push(current[i]);
    } else {
      round1.push({ team1: current[i], team2: current[i + 1] });
      nextSlots.push('?'); // Le gagnant sera connu plus tard
    }
  }
  rounds.push(round1);
  current = nextSlots;

  // Rounds suivants jusqu'à la finale
  while (current.length > 1) {
    const round: Match[] = [];
    const next: string[] = [];

    for (let i = 0; i < current.length; i += 2) {
      if (current[i + 1] === undefined) {
        next.push(current[i]);
      } else {
        round.push({ team1: current[i], team2: current[i + 1] });
        next.push('?');
      }
    }
    if (round.length > 0) rounds.push(round);
    current = next;
  }

  return rounds;
}

// Reconstruit le bracket depuis ce que le backend renvoie (planning déjà publié)
export function buildFullBracketFromBackend(
  backendMatches: {
    roundNumber: number;
    teamA: string | null;
    teamB: string | null;
  }[],
): Round[] {
  const maxRound = Math.max(...backendMatches.map((m) => m.roundNumber));
  const rounds: Round[] = [];

  for (let r = 1; r <= maxRound; r++) {
    const roundMatches = backendMatches
      .filter((m) => m.roundNumber === r)
      .map((m) => ({ team1: m.teamA ?? '?', team2: m.teamB ?? '?' }));
    rounds.push(roundMatches);
  }

  return rounds;
}

// Affiche le nom du round (Finale, Demi-finales, etc.)
export const roundLabels = (total: number, idx: number): string => {
  const remaining = total - idx;
  if (remaining === 1) return 'Finale';
  if (remaining === 2) return 'Demi-finales';
  if (remaining === 3) return 'Quarts de finale';
  return `Tour ${idx + 1}`;
};

// Récupère le nom d'une équipe à une position donnée dans le bracket
export function getTeamAt(rounds: Round[], pos: TeamPos): string {
  return pos.slot === 0
    ? rounds[pos.roundIdx][pos.matchIdx].team1
    : rounds[pos.roundIdx][pos.matchIdx].team2;
}

// Échange deux équipes dans le bracket (pour le drag & drop / swap en draft)
export function swapTeams(rounds: Round[], a: TeamPos, b: TeamPos): Round[] {
  // On copie pour éviter de muter le state directement
  const next = rounds.map((r) => r.map((m) => ({ ...m })));
  const tA = getTeamAt(next, a);
  const tB = getTeamAt(next, b);

  if (a.slot === 0) next[a.roundIdx][a.matchIdx].team1 = tB;
  else next[a.roundIdx][a.matchIdx].team2 = tB;

  if (b.slot === 0) next[b.roundIdx][b.matchIdx].team1 = tA;
  else next[b.roundIdx][b.matchIdx].team2 = tA;

  return next;
}

// Vérifie si deux positions pointent vers le même slot
export function posEqual(a: TeamPos, b: TeamPos): boolean {
  return (
    a.roundIdx === b.roundIdx && a.matchIdx === b.matchIdx && a.slot === b.slot
  );
}
