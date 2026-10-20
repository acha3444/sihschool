export type UserRole = 'admin' | 'prof' | 'parent' | 'eleve';
export type Role = UserRole;
export type Formation = 'nourania' | 'litteraire' | 'eveil';
export type EleveType = 'enfant' | 'adulte';
export type PresenceStatut = 'present' | 'absent' | 'retard' | 'excuse';
export type PaiementStatut = 'paye' | 'en_attente';

export interface Profile {
  id: string;
  role: UserRole;
  prenom: string;
  nom: string;
  telephone?: string | null;
  doit_changer_mdp: boolean;
  created_at: string;
}

export interface Groupe {
  id: string;
  nom: string;
  formation: Formation;
  jour: string;
  heure: string;
  lien_zoom?: string | null;
  prof_id?: string | null;
  created_at: string;
  // Joined fields
  prof?: Profile | null;
}

export interface Eleve {
  id: string;
  prenom: string;
  nom: string;
  date_naissance?: string | null;
  type: EleveType;
  parent_id?: string | null;
  compte_id?: string | null;
  groupe_id?: string | null;
  notes_admin?: string | null;
  created_at: string;
  // Joined fields
  parent?: Profile | null;
  compte?: Profile | null;
  groupe?: Groupe | null;
  progression?: Progression | null;
}

export interface Seance {
  id: string;
  groupe_id: string;
  date: string;
  theme?: string | null;
  created_at: string;
  groupe?: Groupe | null;
}

export interface Presence {
  id: string;
  seance_id: string;
  eleve_id: string;
  statut: PresenceStatut;
  created_at: string;
  seance?: Seance | null;
  eleve?: Eleve | null;
}

export interface Progression {
  id: string;
  eleve_id: string;
  formation: Formation;
  lecon_actuelle: number; // 1 à 17
  commentaire?: string | null;
  mis_a_jour_le: string;
  created_at: string;
}

export type DevoirRenduStatut = 'en_attente' | 'valide' | 'a_reviser';

export interface Devoir {
  id: string;
  groupe_id: string;
  titre: string;
  consigne: string;
  audio_consigne?: string | null;
  date_limite?: string | null;
  created_at: string;
  groupe?: Groupe | null;
}

export interface DevoirRendu {
  id: string;
  devoir_id: string;
  eleve_id: string;
  audio_url: string;
  duree_secondes: number;
  commentaire_eleve?: string | null;
  statut: DevoirRenduStatut;
  commentaire_prof?: string | null;
  corrige_le?: string | null;
  created_at: string;
  eleve?: Eleve | null;
  devoir?: Devoir | null;
}

export interface Appreciation {
  id: string;
  eleve_id: string;
  periode: string; // "YYYY-MM"
  texte: string;
  created_at: string;
}

export interface Paiement {
  id: string;
  eleve_id: string;
  mois: string; // "YYYY-MM"
  montant: number;
  statut: PaiementStatut;
  moyen?: string | null;
  date_paiement?: string | null;
  created_at: string;
  eleve?: Eleve | null;
}

export interface Annonce {
  id: string;
  titre: string;
  texte: string;
  groupe_id?: string | null;
  publiee_le: string;
  created_at: string;
  groupe?: Groupe | null;
}
