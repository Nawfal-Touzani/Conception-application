import { MatchBracket } from '../../types/match.types';

// dimensions fixes des cartes du bracket
export const CARD_HEIGHT = 84;
export const CARD_WIDTH = 230;
export const ROUND_GAP = 72;
export const TOP_OFFSET = 8;
export const ROW_GAP = 24;

// hauteur d'un slot = carte + espace entre les cartes
export const SLOT_HEIGHT = CARD_HEIGHT + ROW_GAP;

type BracketLayout = {
  rounds: MatchBracket[][];
  positions: Map<number, number>;
  matchById: Map<number, MatchBracket>;
};

// simplifie le libelle d'un tour pour l'affichage
export const simplifyRoundLabel = (
  label?: string,
  roundIndex?: number,
): string => {
  if (!label) {
    return `Tour ${typeof roundIndex === 'number' ? roundIndex + 1 : ''}`;
  }

  const normalized = label.toLowerCase();

  // on raccourcit les noms des tours pour eviter un titre trop long
  if (normalized.includes('huit')) return 'Huitiemes';
  if (normalized.includes('quart')) return 'Quarts';
  if (normalized.includes('demi')) return 'Demi-finales';
  if (normalized.includes('final')) return 'Finale';

  return label;
};

// calcule une moyenne simple
const average = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

// groupe les matchs par numero de tour
const groupByRound = (matches: MatchBracket[]): Map<number, MatchBracket[]> => {
  const roundsByNumber = new Map<number, MatchBracket[]>();

  for (const match of matches) {
    if (!roundsByNumber.has(match.roundNumber)) {
      roundsByNumber.set(match.roundNumber, []);
    }

    roundsByNumber.get(match.roundNumber)!.push(match);
  }

  return roundsByNumber;
};

// calcule la position verticale de chaque match dans le bracket
const computePositions = (
  rounds: MatchBracket[][],
): { positions: Map<number, number>; orderScores: Map<number, number> } => {
  const positions = new Map<number, number>();
  const orderScores = new Map<number, number>();

  // le premier tour est pose de haut en bas avec un espacement fixe
  const firstRound = rounds[0] ?? [];
  firstRound.forEach((match, index) => {
    positions.set(match.id, TOP_OFFSET + index * SLOT_HEIGHT);
    orderScores.set(match.id, index);
  });

  for (let rIdx = 1; rIdx < rounds.length; rIdx++) {
    const prevRound = rounds[rIdx - 1];
    const currentRound = rounds[rIdx];

    const childrenByParent = new Map<number, MatchBracket[]>();

    // relie chaque match enfant a son match parent du tour suivant
    prevRound.forEach((child) => {
      if (!child.nextMatchId) return;

      const existingChildren = childrenByParent.get(child.nextMatchId) ?? [];
      existingChildren.push(child);
      childrenByParent.set(child.nextMatchId, existingChildren);
    });

    // on trie les matchs du tour selon la position moyenne de leurs enfants
    currentRound.sort((a, b) => {
      const aChildren = childrenByParent.get(a.id) ?? [];
      const bChildren = childrenByParent.get(b.id) ?? [];

      const aAverage =
        aChildren.length > 0
          ? average(aChildren.map((child) => orderScores.get(child.id) ?? 0))
          : Number.MAX_SAFE_INTEGER;

      const bAverage =
        bChildren.length > 0
          ? average(bChildren.map((child) => orderScores.get(child.id) ?? 0))
          : Number.MAX_SAFE_INTEGER;

      return aAverage - bAverage || a.id - b.id;
    });

    currentRound.forEach((match, index) => {
      const children = childrenByParent.get(match.id) ?? [];

      if (children.length > 0) {
        // centre le match parent entre ses matchs enfants
        const childCenters = children.map(
          (child) => (positions.get(child.id) ?? 0) + CARD_HEIGHT / 2,
        );

        const centerY = average(childCenters);

        positions.set(match.id, centerY - CARD_HEIGHT / 2);
        orderScores.set(
          match.id,
          average(children.map((child) => orderScores.get(child.id) ?? index)),
        );
      } else {
        // fallback si le match n'a pas encore de liens exploitables
        positions.set(match.id, TOP_OFFSET + index * SLOT_HEIGHT);
        orderScores.set(match.id, index);
      }
    });
  }

  // on re-trie chaque tour avec les positions finales calculees
  for (let rIdx = 1; rIdx < rounds.length; rIdx++) {
    rounds[rIdx].sort((a, b) => {
      const ay = positions.get(a.id) ?? 0;
      const by = positions.get(b.id) ?? 0;

      return ay - by || a.id - b.id;
    });
  }

  return { positions, orderScores };
};

// transforme la liste brute de matchs en structure exploitable pour l'affichage
export const buildBracketLayout = (matches: MatchBracket[]): BracketLayout => {
  const matchById = new Map(matches.map((match) => [match.id, match]));
  const roundsByNumber = groupByRound(matches);

  const sortedRoundNumbers = [...roundsByNumber.keys()].sort((a, b) => a - b);
  const rounds = sortedRoundNumbers.map((roundNumber) => [
    ...(roundsByNumber.get(roundNumber) ?? []),
  ]);

  const { positions } = computePositions(rounds);

  return { rounds, positions, matchById };
};

// calcule la largeur totale a reserver pour tous les tours
export const computeBracketWidth = (roundCount: number): number => {
  return roundCount * (CARD_WIDTH + ROUND_GAP) - ROUND_GAP;
};

// calcule la hauteur totale a partir de la carte la plus basse
export const computeBracketHeight = (
  matches: MatchBracket[],
  positions: Map<number, number>,
): number => {
  return (
    Math.max(
      ...matches.map((match) => (positions.get(match.id) ?? 0) + CARD_HEIGHT),
      300,
    ) +
    TOP_OFFSET * 2
  );
};
