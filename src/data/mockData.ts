import {
  User,
  Groupe,
  GroupeEleve,
  ParentEleve,
  Seance,
  Presence,
  Progression,
  ModuleLitteraire,
  Devoir,
  Rendu,
  Appreciation,
  Paiement,
  Message,
  Conversation,
  Annonce,
  BadgeEleve,
  Notification,
} from '../types';

export const INITIAL_USERS: User[] = [
  // 1 Admin
  {
    id: 'user-admin-1',
    role: 'admin',
    prenom: 'Mohammed',
    nom: 'Al-Mansour',
    email: 'direction@sihscool.fr',
    avatar: 'cheikh-avatar',
    telephone: '06 12 34 56 78',
    cree_le: '2026-08-15',
  },

  // 2 Professeurs
  {
    id: 'user-prof-1',
    role: 'prof',
    prenom: 'Fatima',
    nom: 'Zahra',
    email: 'fatima@sihscool.fr',
    avatar: 'prof-fatima',
    telephone: '06 98 76 54 32',
    cree_le: '2026-08-20',
  },
  {
    id: 'user-prof-2',
    role: 'prof',
    prenom: 'Bilal',
    nom: 'Hassani',
    email: 'bilal@sihscool.fr',
    avatar: 'prof-bilal',
    telephone: '06 55 44 33 22',
    cree_le: '2026-08-22',
  },

  // 6 Parents
  {
    id: 'user-parent-1',
    role: 'parent',
    prenom: 'Yasmina',
    nom: 'Benali',
    email: 'yasmina.benali@gmail.com',
    avatar: 'parent-yasmina',
    telephone: '06 10 20 30 40',
    cree_le: '2026-09-01',
  },
  {
    id: 'user-parent-2',
    role: 'parent',
    prenom: 'Karim',
    nom: 'Meziani',
    email: 'karim.meziani@gmail.com',
    avatar: 'parent-karim',
    telephone: '06 20 30 40 50',
    cree_le: '2026-09-02',
  },
  {
    id: 'user-parent-3',
    role: 'parent',
    prenom: 'Nadia',
    nom: 'Cherif',
    email: 'nadia.cherif@gmail.com',
    avatar: 'parent-nadia',
    telephone: '06 30 40 50 60',
    cree_le: '2026-09-03',
  },
  {
    id: 'user-parent-4',
    role: 'parent',
    prenom: 'Samira',
    nom: 'Amrani',
    email: 'samira.amrani@gmail.com',
    avatar: 'parent-samira',
    telephone: '06 40 50 60 70',
    cree_le: '2026-09-04',
  },
  {
    id: 'user-parent-5',
    role: 'parent',
    prenom: 'Mehdi',
    nom: 'Tahiri',
    email: 'mehdi.tahiri@gmail.com',
    avatar: 'parent-mehdi',
    telephone: '06 50 60 70 80',
    cree_le: '2026-09-05',
  },
  {
    id: 'user-parent-6',
    role: 'parent',
    prenom: 'Leila',
    nom: 'Belhadj',
    email: 'leila.belhadj@gmail.com',
    avatar: 'parent-leila',
    telephone: '06 60 70 80 90',
    cree_le: '2026-09-06',
  },

  // 10 Élèves
  {
    id: 'user-eleve-1',
    role: 'eleve',
    prenom: 'Inès',
    nom: 'Benali',
    code_connexion: '123456',
    avatar: 'cat-mint',
    cree_le: '2026-09-01',
  },
  {
    id: 'user-eleve-2',
    role: 'eleve',
    prenom: 'Youssef',
    nom: 'Benali',
    code_connexion: '654321',
    avatar: 'lion-yellow',
    cree_le: '2026-09-01',
  },
  {
    id: 'user-eleve-3',
    role: 'eleve',
    prenom: 'Sarah',
    nom: 'Mansouri',
    email: 'sarah.mansouri@outlook.fr',
    code_connexion: '789123',
    avatar: 'flower-pink',
    cree_le: '2026-09-02',
  },
  {
    id: 'user-eleve-4',
    role: 'eleve',
    prenom: 'Amina',
    nom: 'Kadri',
    email: 'amina.kadri@yahoo.fr',
    code_connexion: '456789',
    avatar: 'star-mint',
    cree_le: '2026-09-02',
  },
  {
    id: 'user-eleve-5',
    role: 'eleve',
    prenom: 'Rayan',
    nom: 'Meziani',
    code_connexion: '112233',
    avatar: 'rocket-yellow',
    cree_le: '2026-09-02',
  },
  {
    id: 'user-eleve-6',
    role: 'eleve',
    prenom: 'Sofia',
    nom: 'Meziani',
    code_connexion: '445566',
    avatar: 'butterfly-pink',
    cree_le: '2026-09-02',
  },
  {
    id: 'user-eleve-7',
    role: 'eleve',
    prenom: 'Ziyad',
    nom: 'Cherif',
    code_connexion: '778899',
    avatar: 'falcon-mint',
    cree_le: '2026-09-03',
  },
  {
    id: 'user-eleve-8',
    role: 'eleve',
    prenom: 'Noura',
    nom: 'Amrani',
    code_connexion: '998877',
    avatar: 'rabbit-pink',
    cree_le: '2026-09-04',
  },
  {
    id: 'user-eleve-9',
    role: 'eleve',
    prenom: 'Adam',
    nom: 'Tahiri',
    code_connexion: '332211',
    avatar: 'bear-yellow',
    cree_le: '2026-09-05',
  },
  {
    id: 'user-eleve-10',
    role: 'eleve',
    prenom: 'Kenza',
    nom: 'Belhadj',
    code_connexion: '556677',
    avatar: 'dove-mint',
    cree_le: '2026-09-06',
  },
];

export const INITIAL_PARENT_ELEVES: ParentEleve[] = [
  { parent_id: 'user-parent-1', eleve_id: 'user-eleve-1' }, // Yasmina -> Inès
  { parent_id: 'user-parent-1', eleve_id: 'user-eleve-2' }, // Yasmina -> Youssef
  { parent_id: 'user-parent-2', eleve_id: 'user-eleve-5' }, // Karim -> Rayan
  { parent_id: 'user-parent-2', eleve_id: 'user-eleve-6' }, // Karim -> Sofia
  { parent_id: 'user-parent-3', eleve_id: 'user-eleve-7' }, // Nadia -> Ziyad
  { parent_id: 'user-parent-4', eleve_id: 'user-eleve-8' }, // Samira -> Noura
  { parent_id: 'user-parent-5', eleve_id: 'user-eleve-9' }, // Mehdi -> Adam
  { parent_id: 'user-parent-6', eleve_id: 'user-eleve-10' }, // Leila -> Kenza
];

export const INITIAL_GROUPES: Groupe[] = [
  {
    id: 'groupe-1',
    nom: 'Enfants Nourania – Débutants',
    type: 'nourania',
    public: 'enfants',
    creneau: 'Mercredi 14h00 - 15h30',
    lieu_ou_lien: 'Salle Al-Qalam (1er étage)',
    prof_id: 'user-prof-1',
    tarif_mensuel: 45,
    code_couleur: 'mint',
  },
  {
    id: 'groupe-2',
    nom: 'Femmes Nourania & Tajwid',
    type: 'nourania',
    public: 'femmes',
    creneau: 'Samedi 10h00 - 12h00',
    lieu_ou_lien: 'Salle Rayhan & Visio Jitsi',
    prof_id: 'user-prof-1',
    tarif_mensuel: 55,
    code_couleur: 'pinkHot',
  },
  {
    id: 'groupe-3',
    nom: 'Enfants & Ados Arabe Littéraire',
    type: 'litteraire',
    public: 'enfants',
    creneau: 'Dimanche 10h30 - 12h00',
    lieu_ou_lien: 'Salle Al-Hikma',
    prof_id: 'user-prof-2',
    tarif_mensuel: 50,
    code_couleur: 'yellowStreak',
  },
];

export const INITIAL_GROUPE_ELEVES: GroupeEleve[] = [
  // Groupe 1 : Nourania Enfants
  { groupe_id: 'groupe-1', eleve_id: 'user-eleve-1' }, // Inès
  { groupe_id: 'groupe-1', eleve_id: 'user-eleve-2' }, // Youssef
  { groupe_id: 'groupe-1', eleve_id: 'user-eleve-6' }, // Sofia
  { groupe_id: 'groupe-1', eleve_id: 'user-eleve-7' }, // Ziyad
  { groupe_id: 'groupe-1', eleve_id: 'user-eleve-8' }, // Noura
  { groupe_id: 'groupe-1', eleve_id: 'user-eleve-10' }, // Kenza

  // Groupe 2 : Femmes
  { groupe_id: 'groupe-2', eleve_id: 'user-eleve-3' }, // Sarah
  { groupe_id: 'groupe-2', eleve_id: 'user-eleve-4' }, // Amina

  // Groupe 3 : Littéraire
  { groupe_id: 'groupe-3', eleve_id: 'user-eleve-5' }, // Rayan
  { groupe_id: 'groupe-3', eleve_id: 'user-eleve-9' }, // Adam
  { groupe_id: 'groupe-3', eleve_id: 'user-eleve-1' }, // Inès participe aussi au littéraire
];

export const INITIAL_SEANCES: Seance[] = [
  // Mercredis passés et à venir
  {
    id: 'seance-1',
    groupe_id: 'groupe-1',
    date: '2026-10-07',
    heure_debut: '14:00',
    heure_fin: '15:30',
    theme: 'Leçon 4 : Les voyelles courtes (Al-Harakat)',
    effectuee: true,
  },
  {
    id: 'seance-2',
    groupe_id: 'groupe-1',
    date: '2026-10-14',
    heure_debut: '14:00',
    heure_fin: '15:30',
    theme: 'Leçon 5 : Le Tanwin & entraînement phonétique',
    effectuee: true,
  },
  {
    id: 'seance-3',
    groupe_id: 'groupe-1',
    date: '2026-10-21',
    heure_debut: '14:00',
    heure_fin: '15:30',
    theme: 'Leçon 6 : Exercices sur Harakat et Tanwin',
    effectuee: false,
  },
  // Samedi femmes
  {
    id: 'seance-4',
    groupe_id: 'groupe-2',
    date: '2026-10-10',
    heure_debut: '10:00',
    heure_fin: '12:00',
    theme: 'Leçon 8 : Madd et Lîn dans le Coran',
    effectuee: true,
  },
  {
    id: 'seance-5',
    groupe_id: 'groupe-2',
    date: '2026-10-17',
    heure_debut: '10:00',
    heure_fin: '12:00',
    theme: 'Leçon 9 : Pratique du Madd et Lîn',
    effectuee: true,
  },
  {
    id: 'seance-6',
    groupe_id: 'groupe-2',
    date: '2026-10-24',
    heure_debut: '10:00',
    heure_fin: '12:00',
    theme: 'Leçon 10 : Le Soukoun et la Qalqalah',
    effectuee: false,
  },
  // Dimanche littéraire
  {
    id: 'seance-7',
    groupe_id: 'groupe-3',
    date: '2026-10-11',
    heure_debut: '10:30',
    heure_fin: '12:00',
    theme: 'Vocabulaire : La famille et les salutations',
    effectuee: true,
  },
  {
    id: 'seance-8',
    groupe_id: 'groupe-3',
    date: '2026-10-18',
    heure_debut: '10:30',
    heure_fin: '12:00',
    theme: 'Grammaire : Les pronoms personnels isolés',
    effectuee: true,
  },
  {
    id: 'seance-9',
    groupe_id: 'groupe-3',
    date: '2026-10-25',
    heure_debut: '10:30',
    heure_fin: '12:00',
    theme: 'Écriture : Les lettres lunaires et solaires',
    effectuee: false,
  },
];

export const INITIAL_PRESENCES: Presence[] = [
  // Séance 1 (7 Octobre - Groupe 1)
  { seance_id: 'seance-1', eleve_id: 'user-eleve-1', statut: 'present' }, // Inès
  { seance_id: 'seance-1', eleve_id: 'user-eleve-2', statut: 'present' }, // Youssef
  { seance_id: 'seance-1', eleve_id: 'user-eleve-6', statut: 'present' }, // Sofia
  { seance_id: 'seance-1', eleve_id: 'user-eleve-7', statut: 'retard', motif: 'Retard de 10 min (embouteillages)' }, // Ziyad
  { seance_id: 'seance-1', eleve_id: 'user-eleve-8', statut: 'present' }, // Noura
  { seance_id: 'seance-1', eleve_id: 'user-eleve-10', statut: 'absent', motif: 'Grippe saisonnière' }, // Kenza

  // Séance 2 (14 Octobre - Groupe 1)
  { seance_id: 'seance-2', eleve_id: 'user-eleve-1', statut: 'present' },
  { seance_id: 'seance-2', eleve_id: 'user-eleve-2', statut: 'retard', motif: 'Retard de 5 min' },
  { seance_id: 'seance-2', eleve_id: 'user-eleve-6', statut: 'present' },
  { seance_id: 'seance-2', eleve_id: 'user-eleve-7', statut: 'present' },
  { seance_id: 'seance-2', eleve_id: 'user-eleve-8', statut: 'absent', motif: 'Rendez-vous dentiste prévenu' },
  { seance_id: 'seance-2', eleve_id: 'user-eleve-10', statut: 'present' },

  // Séance 4 & 5 (Femmes)
  { seance_id: 'seance-4', eleve_id: 'user-eleve-3', statut: 'present' },
  { seance_id: 'seance-4', eleve_id: 'user-eleve-4', statut: 'present' },
  { seance_id: 'seance-5', eleve_id: 'user-eleve-3', statut: 'present' },
  { seance_id: 'seance-5', eleve_id: 'user-eleve-4', statut: 'absent', motif: 'Déplacement professionnel' },

  // Séance 7 & 8 (Littéraire)
  { seance_id: 'seance-7', eleve_id: 'user-eleve-5', statut: 'present' },
  { seance_id: 'seance-7', eleve_id: 'user-eleve-9', statut: 'present' },
  { seance_id: 'seance-7', eleve_id: 'user-eleve-1', statut: 'present' },
  { seance_id: 'seance-8', eleve_id: 'user-eleve-5', statut: 'present' },
  { seance_id: 'seance-8', eleve_id: 'user-eleve-9', statut: 'retard', motif: 'Transport' },
  { seance_id: 'seance-8', eleve_id: 'user-eleve-1', statut: 'present' },
];

export const INITIAL_PROGRESSIONS: Progression[] = [
  // Inès (Élève 1) - très avancée : leçons 1 à 4 validées, leçon 5 en cours
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-1', statut: 'validee', validee_le: '2026-09-16', validee_par: 'user-prof-1' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-2', statut: 'validee', validee_le: '2026-09-23', validee_par: 'user-prof-1' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-3', statut: 'validee', validee_le: '2026-09-30', validee_par: 'user-prof-1' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-4', statut: 'validee', validee_le: '2026-10-07', validee_par: 'user-prof-1' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-5', statut: 'en_cours' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-6', statut: 'verrouillee' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-7', statut: 'verrouillee' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-8', statut: 'verrouillee' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-9', statut: 'verrouillee' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-10', statut: 'verrouillee' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-11', statut: 'verrouillee' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-12', statut: 'verrouillee' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-13', statut: 'verrouillee' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-14', statut: 'verrouillee' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-15', statut: 'verrouillee' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-16', statut: 'verrouillee' },
  { eleve_id: 'user-eleve-1', lecon_id: 'nourania-17', statut: 'verrouillee' },

  // Youssef (Élève 2) - leçons 1 à 3 validées, leçon 4 en cours
  { eleve_id: 'user-eleve-2', lecon_id: 'nourania-1', statut: 'validee', validee_le: '2026-09-16', validee_par: 'user-prof-1' },
  { eleve_id: 'user-eleve-2', lecon_id: 'nourania-2', statut: 'validee', validee_le: '2026-09-30', validee_par: 'user-prof-1' },
  { eleve_id: 'user-eleve-2', lecon_id: 'nourania-3', statut: 'validee', validee_le: '2026-10-07', validee_par: 'user-prof-1' },
  { eleve_id: 'user-eleve-2', lecon_id: 'nourania-4', statut: 'en_cours' },
  { eleve_id: 'user-eleve-2', lecon_id: 'nourania-5', statut: 'verrouillee' },

  // Sarah Mansouri (Élève 3 - Femmes) - leçons 1 à 8 validées, 9 en cours
  { eleve_id: 'user-eleve-3', lecon_id: 'nourania-1', statut: 'validee', validee_le: '2026-09-05' },
  { eleve_id: 'user-eleve-3', lecon_id: 'nourania-2', statut: 'validee', validee_le: '2026-09-12' },
  { eleve_id: 'user-eleve-3', lecon_id: 'nourania-3', statut: 'validee', validee_le: '2026-09-19' },
  { eleve_id: 'user-eleve-3', lecon_id: 'nourania-4', statut: 'validee', validee_le: '2026-09-26' },
  { eleve_id: 'user-eleve-3', lecon_id: 'nourania-5', statut: 'validee', validee_le: '2026-10-03' },
  { eleve_id: 'user-eleve-3', lecon_id: 'nourania-6', statut: 'validee', validee_le: '2026-10-10' },
  { eleve_id: 'user-eleve-3', lecon_id: 'nourania-7', statut: 'validee', validee_le: '2026-10-10' },
  { eleve_id: 'user-eleve-3', lecon_id: 'nourania-8', statut: 'validee', validee_le: '2026-10-17' },
  { eleve_id: 'user-eleve-3', lecon_id: 'nourania-9', statut: 'en_cours' },
];

export const INITIAL_MODULES_LITTERAIRE: ModuleLitteraire[] = [
  // Inès
  { id: 'lit-1', eleve_id: 'user-eleve-1', nom: 'Vocabulaire', nom_arabe: 'المُفْرَدَات', pourcentage: 65, niveau: 'Niveau 1 - Débutant', prochain_objectif: 'Les objets de l’école et les animaux' },
  { id: 'lit-2', eleve_id: 'user-eleve-1', nom: 'Grammaire', nom_arabe: 'القَوَاعِد', pourcentage: 45, niveau: 'Niveau 1 - Débutant', prochain_objectif: 'Le masculin et le féminin (Taa Marbouta)' },
  { id: 'lit-3', eleve_id: 'user-eleve-1', nom: 'Lecture', nom_arabe: 'القِرَاءَة', pourcentage: 75, niveau: 'Niveau 2 - Intermédiaire', prochain_objectif: 'Fluidité et liaisons avec Hamzat al-Wasl' },
  { id: 'lit-4', eleve_id: 'user-eleve-1', nom: 'Écriture', nom_arabe: 'الكِتَابَة', pourcentage: 55, niveau: 'Niveau 1 - Débutant', prochain_objectif: 'Tracé fluide du Raa (ر) et Zay (ز)' },

  // Rayan
  { id: 'lit-5', eleve_id: 'user-eleve-5', nom: 'Vocabulaire', nom_arabe: 'المُفْرَدَات', pourcentage: 80, niveau: 'Niveau 2 - Intermédiaire', prochain_objectif: 'Le dialogue au marché et à la maison' },
  { id: 'lit-6', eleve_id: 'user-eleve-5', nom: 'Grammaire', nom_arabe: 'القَوَاعِد', pourcentage: 70, niveau: 'Niveau 2 - Intermédiaire', prochain_objectif: 'La phrase nominale (Joumla Ismiyya)' },
  { id: 'lit-7', eleve_id: 'user-eleve-5', nom: 'Lecture', nom_arabe: 'القِرَاءَة', pourcentage: 85, niveau: 'Niveau 2 - Intermédiaire', prochain_objectif: 'Petits récits historiques arabes' },
  { id: 'lit-8', eleve_id: 'user-eleve-5', nom: 'Écriture', nom_arabe: 'الكِتَابَة', pourcentage: 60, niveau: 'Niveau 1 - Débutant', prochain_objectif: 'Calligraphie Naskh régulière' },
];

export const INITIAL_DEVOIRS: Devoir[] = [
  {
    id: 'devoir-1',
    groupe_id: 'groupe-1',
    titre: 'Récitation du Tanwin (Fathatayn, Kasratayn, Dammatayn)',
    titre_arabe: 'تَسْمِيعُ التَّنْوِين مَعَ التَّهَجِّي',
    consigne: 'Écoute d’abord l’audio de démonstration ci-dessous. Ensuite, récite les 3 premières lignes de la leçon 5 en articulant bien le son [an], [in], [oun] et enregistre ta voix !',
    date_limite: '2026-10-21',
    fichiers: [
      {
        nom: 'Planche_Nourania_Lecon5.pdf',
        url: '#',
        taille: '1.2 Mo',
        type: 'pdf',
      },
    ],
    audio_prof: 'demo-nourania-tanwin.mp3',
    cree_le: '2026-10-14',
    prof_id: 'user-prof-1',
  },
  {
    id: 'devoir-2',
    groupe_id: 'groupe-1',
    titre: 'Écriture des lettres avec voyelles',
    titre_arabe: 'كِتَابَةُ الحُرُوف مَعَ الحَرَكَات',
    consigne: 'Recopier sur le cahier les lettres Daal, Dhaal, Raa, Zay avec les trois voyelles courtes (Fatha, Kasra, Damma). Prends une photo ou valide quand c’est fini.',
    date_limite: '2026-10-21',
    fichiers: [
      {
        nom: 'Modele_Cahier_L4.png',
        url: '#',
        taille: '850 Ko',
        type: 'image',
      },
    ],
    cree_le: '2026-10-14',
    prof_id: 'user-prof-1',
  },
  {
    id: 'devoir-3',
    groupe_id: 'groupe-3',
    titre: 'Les membres de la famille en arabe',
    titre_arabe: 'أَفْرَادُ العَائِلَة',
    consigne: 'Mémoriser le vocabulaire : Ab (أَب), Oumm (أُمّ), Akh (أَخ), Oukht (أُخْت), Jadd (جَدّ), Jaddah (جَدَّة). Enregistrer une phrase avec "Hâdhâ" (هٰذَا) et "Hâdhihi" (هٰذِهِ).',
    date_limite: '2026-10-25',
    audio_prof: 'famille-arabe-vocabulaire.mp3',
    cree_le: '2026-10-18',
    prof_id: 'user-prof-2',
  },
];

export const INITIAL_RENDUS: Rendu[] = [
  // Devoir 1 - Inès (rendu avec audio !)
  {
    devoir_id: 'devoir-1',
    eleve_id: 'user-eleve-1',
    statut: 'corrige',
    audio_eleve: 'audio-ines-tanwin.webm',
    commentaire_prof: 'Macha Allah Inès ! Les trois voyelles sont très bien différenciées. Pense juste à ne pas allonger le "an" à la fin.',
    note_ou_mention: 'Excellent ! (مُمْتَاز)',
    rendu_le: '2026-10-16',
  },
  // Devoir 1 - Youssef (rendu)
  {
    devoir_id: 'devoir-1',
    eleve_id: 'user-eleve-2',
    statut: 'rendu',
    audio_eleve: 'audio-youssef-tanwin.webm',
    rendu_le: '2026-10-18',
  },
  // Devoir 2 - Inès (a faire)
  {
    devoir_id: 'devoir-2',
    eleve_id: 'user-eleve-1',
    statut: 'a_faire',
  },
];

export const INITIAL_APPRECIATIONS: Appreciation[] = [
  {
    id: 'app-1',
    eleve_id: 'user-eleve-1',
    prof_id: 'user-prof-1',
    seance_id: 'seance-2',
    date: '2026-10-14',
    texte: 'Macha Allah Inès a une concentration remarquable. La lecture des voyelles courtes est très fluide et l’épellation Nourania est parfaitement maîtrisée !',
    badge_rapide: 'Très bonne lecture',
    cree_le: '2026-10-14T15:45:00',
  },
  {
    id: 'app-2',
    eleve_id: 'user-eleve-1',
    prof_id: 'user-prof-1',
    seance_id: 'seance-1',
    date: '2026-10-07',
    texte: 'Excellente participation en classe. Inès a aidé ses camarades pour la reconnaissance des lettres composées.',
    badge_rapide: 'Excellent travail',
    cree_le: '2026-10-07T15:50:00',
  },
  {
    id: 'app-3',
    eleve_id: 'user-eleve-2',
    prof_id: 'user-prof-1',
    seance_id: 'seance-2',
    date: '2026-10-14',
    texte: 'Bonne séance pour Youssef. Il faut poursuivre la révision des lettres qui se ressemblent (ذ et ز, س et ش) à la maison.',
    badge_rapide: 'À réviser à la maison',
    cree_le: '2026-10-14T15:48:00',
  },
  {
    id: 'app-4',
    eleve_id: 'user-eleve-5',
    prof_id: 'user-prof-2',
    seance_id: 'seance-8',
    date: '2026-10-18',
    texte: 'Rayan montre une belle motivation en grammaire. Les accords des pronoms sont acquis.',
    badge_rapide: 'Très bons progrès',
    cree_le: '2026-10-18T12:15:00',
  },
];

export const INITIAL_PAIEMENTS: Paiement[] = [
  // Inès (Parent : Yasmina)
  {
    id: 'pay-1',
    eleve_id: 'user-eleve-1',
    parent_id: 'user-parent-1',
    mois: 'Octobre 2026',
    montant: 45,
    statut: 'paye',
    paye_le: '2026-10-02',
    recu_numero: 'REC-2026-10-001',
    moyen_paiement: 'Carte bancaire',
  },
  {
    id: 'pay-2',
    eleve_id: 'user-eleve-1',
    parent_id: 'user-parent-1',
    mois: 'Septembre 2026',
    montant: 45,
    statut: 'paye',
    paye_le: '2026-09-04',
    recu_numero: 'REC-2026-09-001',
    moyen_paiement: 'Virement',
  },
  {
    id: 'pay-3',
    eleve_id: 'user-eleve-1',
    parent_id: 'user-parent-1',
    mois: 'Novembre 2026',
    montant: 45,
    statut: 'a_regler',
  },

  // Youssef (Parent : Yasmina)
  {
    id: 'pay-4',
    eleve_id: 'user-eleve-2',
    parent_id: 'user-parent-1',
    mois: 'Octobre 2026',
    montant: 45,
    statut: 'paye',
    paye_le: '2026-10-02',
    recu_numero: 'REC-2026-10-002',
    moyen_paiement: 'Carte bancaire',
  },
  {
    id: 'pay-5',
    eleve_id: 'user-eleve-2',
    parent_id: 'user-parent-1',
    mois: 'Novembre 2026',
    montant: 45,
    statut: 'a_regler',
  },

  // Rayan (Parent : Karim)
  {
    id: 'pay-6',
    eleve_id: 'user-eleve-5',
    parent_id: 'user-parent-2',
    mois: 'Octobre 2026',
    montant: 50,
    statut: 'en_retard',
  },

  // Sofia (Parent : Karim)
  {
    id: 'pay-7',
    eleve_id: 'user-eleve-6',
    parent_id: 'user-parent-2',
    mois: 'Octobre 2026',
    montant: 45,
    statut: 'en_retard',
  },

  // Ziyad (Parent : Nadia)
  {
    id: 'pay-8',
    eleve_id: 'user-eleve-7',
    parent_id: 'user-parent-3',
    mois: 'Octobre 2026',
    montant: 45,
    statut: 'paye',
    paye_le: '2026-10-05',
    recu_numero: 'REC-2026-10-008',
    moyen_paiement: 'Chèque',
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    parent_id: 'user-parent-1', // Yasmina
    prof_id: 'user-prof-1', // Oustadha Fatima
    eleve_id: 'user-eleve-1', // Inès
    dernier_message: 'Salam alaykoum Oustadha, merci pour le retour sur la récitation d’Inès !',
    dernier_message_date: '2026-10-16T18:30:00',
    non_lus_parent: 0,
    non_lus_prof: 1,
  },
  {
    id: 'conv-2',
    parent_id: 'user-parent-1', // Yasmina
    prof_id: 'user-prof-1', // Oustadha Fatima
    eleve_id: 'user-eleve-2', // Youssef
    dernier_message: 'Bonjour Madame Benali, Youssef a bien rattrapé son petit retard de mercredi.',
    dernier_message_date: '2026-10-15T10:15:00',
    non_lus_parent: 1,
    non_lus_prof: 0,
  },
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    conversation_id: 'conv-1',
    auteur_id: 'user-prof-1',
    texte: 'Salam alaykoum Madame Benali. Je voulais vous féliciter pour la régularité d’Inès, son écoute de l’audio de Nourania l’aide énormément !',
    lu: true,
    cree_le: '2026-10-14T17:00:00',
  },
  {
    id: 'msg-2',
    conversation_id: 'conv-1',
    auteur_id: 'user-parent-1',
    texte: 'Salam alaykoum Oustadha Fatima. Barak Allahou fik pour votre bienveillance et votre méthode pédagogique. Inès a adoré enregistrer son audio pour le devoir !',
    lu: true,
    cree_le: '2026-10-14T19:20:00',
  },
  {
    id: 'msg-3',
    conversation_id: 'conv-1',
    auteur_id: 'user-prof-1',
    texte: 'C’est un réel plaisir d’entendre ses progrès. J’ai validé sa leçon 4 et elle a débloqué son badge d’assiduité.',
    lu: true,
    cree_le: '2026-10-15T09:10:00',
  },
  {
    id: 'msg-4',
    conversation_id: 'conv-1',
    auteur_id: 'user-parent-1',
    texte: 'Salam alaykoum Oustadha, merci pour le retour sur la récitation d’Inès !',
    lu: false,
    cree_le: '2026-10-16T18:30:00',
  },
];

export const INITIAL_ANNONCES: Annonce[] = [
  {
    id: 'ann-1',
    titre: 'Maintien des cours pendant les vacances de Toussaint',
    texte: 'Chers parents et apprenants, les cours de Nourania et d’arabe littéraire seront maintenus la première semaine des vacances (du 21 au 25 octobre). Une pause aura lieu du 26 au 31 octobre.',
    cree_le: '2026-10-12',
    auteur_nom: 'Cheikh Mohammed (Directeur)',
    priorite: 'normale',
  },
  {
    id: 'ann-2',
    groupe_id: 'groupe-1',
    titre: 'Atelier de Calligraphie arabe pour les enfants',
    texte: 'Mercredi 28 octobre à 14h, nous organisons un atelier découverte de la calligraphie avec encre et calame en bambou ! Prévoir une blouse ou un vieux tablier.',
    cree_le: '2026-10-15',
    auteur_nom: 'Oustadha Fatima',
    priorite: 'normale',
  },
];

export const INITIAL_BADGES_ELEVE: BadgeEleve[] = [
  // Inès
  { badge_id: 'badge-1', eleve_id: 'user-eleve-1', obtenu_le: '2026-09-16' },
  { badge_id: 'badge-2', eleve_id: 'user-eleve-1', obtenu_le: '2026-10-01' },
  { badge_id: 'badge-3', eleve_id: 'user-eleve-1', obtenu_le: '2026-09-23' },
  { badge_id: 'badge-4', eleve_id: 'user-eleve-1', obtenu_le: '2026-10-16' },

  // Youssef
  { badge_id: 'badge-1', eleve_id: 'user-eleve-2', obtenu_le: '2026-09-16' },
  { badge_id: 'badge-3', eleve_id: 'user-eleve-2', obtenu_le: '2026-09-30' },

  // Sarah
  { badge_id: 'badge-1', eleve_id: 'user-eleve-3', obtenu_le: '2026-09-05' },
  { badge_id: 'badge-2', eleve_id: 'user-eleve-3', obtenu_le: '2026-09-20' },
  { badge_id: 'badge-5', eleve_id: 'user-eleve-3', obtenu_le: '2026-10-17' },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  // Notifications pour Yasmina (parent)
  {
    id: 'notif-1',
    destinataire_id: 'user-parent-1',
    titre: 'Nouvelle appréciation pour Inès',
    message: 'Oustadha Fatima a ajouté un petit mot d’encouragement pour la séance de Nourania.',
    type: 'appreciation',
    lu: false,
    cree_le: '2026-10-14T15:46:00',
    action_url: 'appreciations',
  },
  {
    id: 'notif-2',
    destinataire_id: 'user-parent-1',
    titre: 'Nouveau devoir de Nourania',
    message: 'Récitation du Tanwin à faire avant le 21 octobre.',
    type: 'devoir',
    lu: true,
    cree_le: '2026-10-14T16:00:00',
    action_url: 'devoirs',
  },
  {
    id: 'notif-3',
    destinataire_id: 'user-parent-1',
    titre: 'Paiement d’Octobre validé',
    message: 'Le reçu PDF pour Inès et Youssef est disponible dans votre espace.',
    type: 'paiement',
    lu: true,
    cree_le: '2026-10-02T11:00:00',
    action_url: 'paiements',
  },
  // Notification pour Karim (retard paiement)
  {
    id: 'notif-4',
    destinataire_id: 'user-parent-2',
    titre: 'Rappel de cotisation d’Octobre',
    message: 'La mensualité pour Rayan et Sofia est en attente de règlement.',
    type: 'paiement',
    lu: false,
    cree_le: '2026-10-18T09:00:00',
    action_url: 'paiements',
  },
];
