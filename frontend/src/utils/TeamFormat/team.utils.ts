export function formatDate(dateStr?: string | null): string {
  // Garde : couvre les cas `undefined`, `null` et chaîne vide
  if (!dateStr) return '—';

  // `new Date(dateStr)` parse une chaîne ISO 8601 (ex: "2024-03-15T10:00:00Z") en objet Date
  // `toLocaleDateString` formate ensuite selon la locale et les options fournies
  // 'fr-BE' : locale belge francophone — produit le format JJ/MM/AAAA
  return new Date(dateStr).toLocaleDateString('fr-BE', {
    day: '2-digit', // jour sur 2 chiffres : 01, 02 … 31
    month: '2-digit', // mois sur 2 chiffres : 01, 02 … 12
    year: 'numeric', // année sur 4 chiffres : 2024
  });
}
