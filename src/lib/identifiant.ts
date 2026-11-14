// Les enfants se connectent avec un identifiant (ex. « yasmine4821 ») au lieu d'un e-mail.
// En interne, l'identifiant correspond à une adresse technique qui ne reçoit jamais d'e-mail.
export const DOMAINE_ELEVES = 'eleves.sihschool.com';

export const estIdentifiant = (saisie: string) => !saisie.includes('@');

/** Transforme ce que la personne a tapé (e-mail ou identifiant) en adresse de connexion. */
export const versEmailConnexion = (saisie: string) => {
  const v = saisie.trim().toLowerCase();
  return estIdentifiant(v) ? `${v}@${DOMAINE_ELEVES}` : v;
};
