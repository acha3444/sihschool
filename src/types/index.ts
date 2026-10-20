export type UserRole = 'admin' | 'prof' | 'parent' | 'eleve';

export interface User {
  id: string;
  role: UserRole;
  prenom: string;
  nom: string;
  email?: string;
  avatar: string;
  code_connexion?: string; // 6-digit code for kids student login
  mot_de_passe?: string; // Password or temporary one-time password (OTP)
  doit_changer_mot_de_passe?: boolean; // True if temporary password must be changed on first login
  telephone?: string;
  cree_le: string;
}

export interface ParentEleve {
  parent_id: string;
  eleve_id: string;
}

export type GroupeType = 'nourania' | 'litteraire' | 'mixte';
export type GroupePublic = 'enfants' | 'femmes' | 'mixte';

export interface Groupe {
  id: string;
  nom: string;
  type: GroupeType;
  public: GroupePublic;
  creneau: string; // e.g. "Mercredi 14h00 - 15h30"
  lieu_ou_lien: string; // e.g. "Salle Al-Qalam" or "https://meet.jit.si/sihscool-groupe1"
  prof_id: string;
  tarif_mensuel: number; // e.g. 45 €
  code_couleur: string;
}

export interface GroupeEleve {
  groupe_id: string;
  eleve_id: string;
}

export interface Seance {
  id: string;
  groupe_id: string;
  date: string; // YYYY-MM-DD
  heure_debut: string;
  heure_fin: string;
  theme?: string;
  effectuee: boolean;
}

export type PresenceStatut = 'present' | 'absent' | 'retard';

export interface Presence {
  id?: string;
  seance_id: string;
  eleve_id: string;
  statut: PresenceStatut;
  motif?: string;
}

export interface Lecon {
  id: string;
  programme: 'nourania' | 'litteraire';
  numero: number;
  titre: string;
  titre_arabe: string;
  description: string;
  lettres_exemples?: string[];
  audio_demo_url?: string;
}

export type ProgressionStatut = 'verrouillee' | 'en_cours' | 'validee';

export interface Progression {
  eleve_id: string;
  lecon_id: string;
  statut: ProgressionStatut;
  validee_le?: string;
  validee_par?: string;
}

export interface ModuleLitteraire {
  id: string;
  eleve_id: string;
  nom: 'Vocabulaire' | 'Grammaire' | 'Lecture' | 'Écriture';
  nom_arabe: string;
  pourcentage: number;
  niveau: string; // e.g. "Niveau 1 - Débutant", "Niveau 2 - Intermédiaire"
  prochain_objectif: string;
}

export interface DevoirFichier {
  nom: string;
  url: string;
  taille: string;
  type: 'pdf' | 'image' | 'audio';
}

export interface Devoir {
  id: string;
  groupe_id?: string;
  eleve_id?: string;
  titre: string;
  titre_arabe?: string;
  consigne: string;
  date_limite: string; // YYYY-MM-DD
  fichiers?: DevoirFichier[];
  audio_prof?: string; // audio model to practice reading
  cree_le: string;
  prof_id: string;
}

export type RenduStatut = 'a_faire' | 'rendu' | 'corrige';

export interface Rendu {
  devoir_id: string;
  eleve_id: string;
  statut: RenduStatut;
  audio_eleve?: string;
  commentaire_prof?: string;
  note_ou_mention?: string; // e.g. "Macha Allah !", "Très bien", "À peaufiner"
  rendu_le?: string;
}

export interface Appreciation {
  id: string;
  eleve_id: string;
  prof_id: string;
  seance_id?: string;
  date: string;
  texte: string;
  badge_rapide?: string;
  cree_le: string;
}

export type PaiementStatut = 'paye' | 'a_regler' | 'en_retard';

export interface Paiement {
  id: string;
  eleve_id: string;
  parent_id: string;
  mois: string; // e.g. "Octobre 2026"
  montant: number;
  statut: PaiementStatut;
  paye_le?: string;
  recu_numero?: string;
  moyen_paiement?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  auteur_id: string;
  texte: string;
  pieces_jointes?: string[];
  audio_url?: string;
  lu: boolean;
  cree_le: string;
}

export interface Conversation {
  id: string;
  parent_id: string;
  prof_id: string;
  eleve_id: string;
  dernier_message?: string;
  dernier_message_date?: string;
  non_lus_parent: number;
  non_lus_prof: number;
}

export interface Annonce {
  id: string;
  groupe_id?: string; // empty means whole school
  titre: string;
  texte: string;
  cree_le: string;
  auteur_nom: string;
  priorite: 'normale' | 'urgente';
}

export interface Badge {
  id: string;
  code: string;
  titre: string;
  titre_arabe: string;
  description: string;
  icone: string; // Lucide icon name
  couleur: 'mint' | 'pink' | 'yellow';
}

export interface BadgeEleve {
  badge_id: string;
  eleve_id: string;
  obtenu_le: string;
}

export type NotificationType = 'presence' | 'devoir' | 'appreciation' | 'message' | 'paiement' | 'annonce';

export interface Notification {
  id: string;
  destinataire_id: string;
  titre: string;
  message: string;
  type: NotificationType;
  lu: boolean;
  cree_le: string;
  action_url?: string;
}
