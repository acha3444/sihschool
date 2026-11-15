// Notes (barème au choix par devoir) et moyennes ramenées sur 20
export const BAREMES = [20, 10, 5, 100];

export const baremeDe = (b: number | null | undefined) => (b && Number(b) > 0 ? Number(b) : 20);

/** 15.5 → « 15,5 » ; 16 → « 16 » */
export const formatNote = (n: number | null | undefined) =>
  n === null || n === undefined ? '—' : (Math.round(Number(n) * 10) / 10).toString().replace('.', ',');

/** Ramène une note sur 20 (pour comparer et faire les moyennes) */
export const sur20 = (note: number | null | undefined, bareme: number | null | undefined) =>
  note === null || note === undefined ? null : (Number(note) * 20) / baremeDe(bareme);

/** Moyenne des valeurs présentes (null si aucune) */
export const moyenne = (notes: (number | null | undefined)[]) => {
  const v = notes.filter((n): n is number => n !== null && n !== undefined && !Number.isNaN(Number(n))).map(Number);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

/** Couleur selon une valeur sur 20 : vert ≥ 14, jaune ≥ 10, rouge sinon */
export const couleurNote = (n20: number | null | undefined) =>
  n20 === null || n20 === undefined ? 'text-[#4A5487] bg-white' : n20 >= 14 ? 'text-[#1E7E44] bg-[#EAF7E8]' : n20 >= 10 ? 'text-[#8C6D00] bg-[#FFF6E3]' : 'text-[#B42318] bg-[#FDECEA]';

/** Lit « 15,5 » ou « 15.5 » ; undefined si invalide ou au-dessus du barème, null si vide */
export const lireNote = (saisie: string, max = 20): number | null | undefined => {
  const t = saisie.trim().replace(',', '.');
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 && n <= max ? Math.round(n * 10) / 10 : undefined;
};
