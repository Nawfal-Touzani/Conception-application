export const validateEncoding = (data: { scoreA: number; scoreB: number }) => {
  const errors: string[] = [];

  if (data.scoreA < 0 || data.scoreB < 0)
    errors.push('Un résultat ne peut pas etre négatif');

  if (data.scoreA == data.scoreB)
    errors.push('un match nul n"est pas possible.');

  return errors;
};
