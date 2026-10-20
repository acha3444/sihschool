import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Groupe,
  GroupeEleve,
  ParentEleve,
  Seance,
  Presence,
  PresenceStatut,
  Progression,
  ModuleLitteraire,
  Devoir,
  Rendu,
  Appreciation,
  Paiement,
  PaiementStatut,
  Message,
  Conversation,
  Annonce,
  BadgeEleve,
  Notification,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_PARENT_ELEVES,
  INITIAL_GROUPES,
  INITIAL_GROUPE_ELEVES,
  INITIAL_SEANCES,
  INITIAL_PRESENCES,
  INITIAL_PROGRESSIONS,
  INITIAL_MODULES_LITTERAIRE,
  INITIAL_DEVOIRS,
  INITIAL_RENDUS,
  INITIAL_APPRECIATIONS,
  INITIAL_PAIEMENTS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_ANNONCES,
  INITIAL_BADGES_ELEVE,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import { triggerLessonConfetti, triggerRewardConfetti } from '../utils/confetti';

interface AppContextType {
  // Theme
  isDark: boolean;
  toggleTheme: () => void;

  // Auth
  currentUser: User | null;
  loginAs: (user: User) => void;
  loginWithEmail: (email: string, role: UserRole) => boolean;
  loginStudent: (code: string, avatar: string) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Selected Child (Parent Space)
  selectedChildId: string | null;
  setSelectedChildId: (id: string) => void;
  selectedChild: User | null;

  // Data Collections
  users: User[];
  parentEleves: ParentEleve[];
  groupes: Groupe[];
  groupeEleves: GroupeEleve[];
  seances: Seance[];
  presences: Presence[];
  progressions: Progression[];
  modulesLitteraire: ModuleLitteraire[];
  devoirs: Devoir[];
  rendus: Rendu[];
  appreciations: Appreciation[];
  paiements: Paiement[];
  conversations: Conversation[];
  messages: Message[];
  annonces: Annonce[];
  badgesEleve: BadgeEleve[];
  notifications: Notification[];

  // Helpers
  getChildrenOfParent: (parentId: string) => User[];
  getGroupOfStudent: (eleveId: string) => Groupe | undefined;
  getStudentsOfGroup: (groupeId: string) => User[];
  getGroupsOfTeacher: (profId: string) => Groupe[];
  getStudentsOfTeacher: (profId: string) => User[];
  getUnreadNotificationsCount: () => number;

  // Mutations
  markPresence: (seanceId: string, eleveId: string, statut: PresenceStatut, motif?: string) => void;
  reportAbsence: (eleveId: string, seanceId: string, motif: string) => void;
  validateLecon: (eleveId: string, leconId: string, profId: string) => void;
  updateModuleProgress: (eleveId: string, moduleNom: 'Vocabulaire' | 'Grammaire' | 'Lecture' | 'Écriture', pourcentage: number) => void;
  createDevoir: (devoirData: Omit<Devoir, 'id' | 'cree_le'>) => void;
  submitRendu: (devoirId: string, eleveId: string, audioEleve?: string) => void;
  reviewRendu: (devoirId: string, eleveId: string, commentaire: string, note?: string) => void;
  addAppreciation: (eleveId: string, profId: string, seanceId: string | undefined, texte: string, badgeRapide?: string) => void;
  markPaiement: (paiementId: string, statut: PaiementStatut, moyen?: string) => void;
  sendMessage: (conversationId: string, texte: string, audioUrl?: string) => void;
  createAnnonce: (annonceData: Omit<Annonce, 'id' | 'cree_le'>) => void;
  createEleve: (data: { prenom: string; nom: string; avatar: string; groupeId: string; parentId?: string; parentEmail?: string; telephoneParent?: string }) => User;
  createGroupe: (data: Omit<Groupe, 'id'>) => Groupe;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
  exportDataJson: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getLocal = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(`sihscool_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading key ${key}`, e);
    return fallback;
  }
};

const setLocal = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(`sihscool_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving key ${key}`, e);
  }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme (Dark mode default)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('sihscool_theme');
    return saved !== null ? saved === 'dark' : true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('sihscool_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('sihscool_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Data Collections State
  const [users, setUsers] = useState<User[]>(() => getLocal('users', INITIAL_USERS));
  const [parentEleves, setParentEleves] = useState<ParentEleve[]>(() => getLocal('parentEleves', INITIAL_PARENT_ELEVES));
  const [groupes, setGroupes] = useState<Groupe[]>(() => getLocal('groupes', INITIAL_GROUPES));
  const [groupeEleves, setGroupeEleves] = useState<GroupeEleve[]>(() => getLocal('groupeEleves', INITIAL_GROUPE_ELEVES));
  const [seances, setSeances] = useState<Seance[]>(() => getLocal('seances', INITIAL_SEANCES));
  const [presences, setPresences] = useState<Presence[]>(() => getLocal('presences', INITIAL_PRESENCES));
  const [progressions, setProgressions] = useState<Progression[]>(() => getLocal('progressions', INITIAL_PROGRESSIONS));
  const [modulesLitteraire, setModulesLitteraire] = useState<ModuleLitteraire[]>(() => getLocal('modulesLitteraire', INITIAL_MODULES_LITTERAIRE));
  const [devoirs, setDevoirs] = useState<Devoir[]>(() => getLocal('devoirs', INITIAL_DEVOIRS));
  const [rendus, setRendus] = useState<Rendu[]>(() => getLocal('rendus', INITIAL_RENDUS));
  const [appreciations, setAppreciations] = useState<Appreciation[]>(() => getLocal('appreciations', INITIAL_APPRECIATIONS));
  const [paiements, setPaiements] = useState<Paiement[]>(() => getLocal('paiements', INITIAL_PAIEMENTS));
  const [conversations, setConversations] = useState<Conversation[]>(() => getLocal('conversations', INITIAL_CONVERSATIONS));
  const [messages, setMessages] = useState<Message[]>(() => getLocal('messages', INITIAL_MESSAGES));
  const [annonces, setAnnonces] = useState<Annonce[]>(() => getLocal('annonces', INITIAL_ANNONCES));
  const [badgesEleve, setBadgesEleve] = useState<BadgeEleve[]>(() => getLocal('badgesEleve', INITIAL_BADGES_ELEVE));
  const [notifications, setNotifications] = useState<Notification[]>(() => getLocal('notifications', INITIAL_NOTIFICATIONS));

  // Current User (default null, or preloaded from storage)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedId = localStorage.getItem('sihscool_current_user_id');
    if (savedId) {
      const found = INITIAL_USERS.find((u) => u.id === savedId);
      if (found) return found;
    }
    return null; // show welcome landing page by default
  });

  // Selected Child (for parent)
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => setLocal('users', users), [users]);
  useEffect(() => setLocal('parentEleves', parentEleves), [parentEleves]);
  useEffect(() => setLocal('groupes', groupes), [groupes]);
  useEffect(() => setLocal('groupeEleves', groupeEleves), [groupeEleves]);
  useEffect(() => setLocal('seances', seances), [seances]);
  useEffect(() => setLocal('presences', presences), [presences]);
  useEffect(() => setLocal('progressions', progressions), [progressions]);
  useEffect(() => setLocal('modulesLitteraire', modulesLitteraire), [modulesLitteraire]);
  useEffect(() => setLocal('devoirs', devoirs), [devoirs]);
  useEffect(() => setLocal('rendus', rendus), [rendus]);
  useEffect(() => setLocal('appreciations', appreciations), [appreciations]);
  useEffect(() => setLocal('paiements', paiements), [paiements]);
  useEffect(() => setLocal('conversations', conversations), [conversations]);
  useEffect(() => setLocal('messages', messages), [messages]);
  useEffect(() => setLocal('annonces', annonces), [annonces]);
  useEffect(() => setLocal('badgesEleve', badgesEleve), [badgesEleve]);
  useEffect(() => setLocal('notifications', notifications), [notifications]);

  // Auth Operations
  const loginAs = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('sihscool_current_user_id', user.id);

    // If parent, set first child as selected
    if (user.role === 'parent') {
      const childrenLinks = parentEleves.filter((pe) => pe.parent_id === user.id);
      if (childrenLinks.length > 0) {
        setSelectedChildId(childrenLinks[0].eleve_id);
      }
    }
  };

  const loginWithEmail = (email: string, role: UserRole): boolean => {
    const user = users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase() && (u.role === role || (role === 'admin' && u.role === 'admin'))
    );
    if (user) {
      loginAs(user);
      return true;
    }
    return false;
  };

  const loginStudent = (code: string, avatar: string): boolean => {
    const student = users.find(
      (u) => u.role === 'eleve' && u.code_connexion === code && (avatar ? u.avatar === avatar : true)
    );
    if (student) {
      loginAs(student);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setSelectedChildId(null);
    localStorage.removeItem('sihscool_current_user_id');
  };

  const switchRole = (role: UserRole) => {
    const target = users.find((u) => u.role === role);
    if (target) {
      loginAs(target);
    }
  };

  // Set child if parent changes
  useEffect(() => {
    if (currentUser?.role === 'parent') {
      const childLinks = parentEleves.filter((pe) => pe.parent_id === currentUser.id);
      if (childLinks.length > 0 && (!selectedChildId || !childLinks.some((c) => c.eleve_id === selectedChildId))) {
        setSelectedChildId(childLinks[0].eleve_id);
      }
    }
  }, [currentUser, parentEleves, selectedChildId]);

  const selectedChild = selectedChildId ? users.find((u) => u.id === selectedChildId) || null : null;

  // Helpers
  const getChildrenOfParent = (parentId: string): User[] => {
    const childIds = parentEleves.filter((pe) => pe.parent_id === parentId).map((pe) => pe.eleve_id);
    return users.filter((u) => childIds.includes(u.id));
  };

  const getGroupOfStudent = (eleveId: string): Groupe | undefined => {
    const link = groupeEleves.find((ge) => ge.eleve_id === eleveId);
    if (!link) return undefined;
    return groupes.find((g) => g.id === link.groupe_id);
  };

  const getStudentsOfGroup = (groupeId: string): User[] => {
    const studentIds = groupeEleves.filter((ge) => ge.groupe_id === groupeId).map((ge) => ge.eleve_id);
    return users.filter((u) => studentIds.includes(u.id));
  };

  const getGroupsOfTeacher = (profId: string): Groupe[] => {
    return groupes.filter((g) => g.prof_id === profId);
  };

  const getStudentsOfTeacher = (profId: string): User[] => {
    const teacherGroupIds = getGroupsOfTeacher(profId).map((g) => g.id);
    const studentIds = groupeEleves
      .filter((ge) => teacherGroupIds.includes(ge.groupe_id))
      .map((ge) => ge.eleve_id);
    const uniqueIds = Array.from(new Set(studentIds));
    return users.filter((u) => uniqueIds.includes(u.id));
  };

  const getUnreadNotificationsCount = (): number => {
    if (!currentUser) return 0;
    return notifications.filter((n) => n.destinataire_id === currentUser.id && !n.lu).length;
  };

  // Mutations
  const markPresence = (seanceId: string, eleveId: string, statut: PresenceStatut, motif?: string) => {
    setPresences((prev) => {
      const existingIndex = prev.findIndex((p) => p.seance_id === seanceId && p.eleve_id === eleveId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], statut, motif };
        return updated;
      }
      return [...prev, { seance_id: seanceId, eleve_id: eleveId, statut, motif }];
    });

    // Notify parent if absent or late
    if (statut === 'absent' || statut === 'retard') {
      const parentLink = parentEleves.find((pe) => pe.eleve_id === eleveId);
      const student = users.find((u) => u.id === eleveId);
      if (parentLink && student) {
        const notif: Notification = {
          id: `notif-${Date.now()}`,
          destinataire_id: parentLink.parent_id,
          titre: statut === 'absent' ? `Absence signalée : ${student.prenom}` : `Retard signalé : ${student.prenom}`,
          message:
            statut === 'absent'
              ? `${student.prenom} a été marqué(e) absent(e) lors de la séance. Motif : ${motif || 'Non précisé'}`
              : `${student.prenom} est arrivé(e) en retard. Motif : ${motif || 'Non précisé'}`,
          type: 'presence',
          lu: false,
          cree_le: new Date().toISOString(),
          action_url: 'presences',
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    }
  };

  const reportAbsence = (eleveId: string, seanceId: string, motif: string) => {
    markPresence(seanceId, eleveId, 'absent', motif);
    // Also notify prof
    const studentGroup = getGroupOfStudent(eleveId);
    if (studentGroup) {
      const student = users.find((u) => u.id === eleveId);
      const notifProf: Notification = {
        id: `notif-prof-${Date.now()}`,
        destinataire_id: studentGroup.prof_id,
        titre: `Absence prévue : ${student?.prenom}`,
        message: `Le parent de ${student?.prenom} a signalé une absence anticipée pour la prochaine séance. Motif : "${motif}"`,
        type: 'presence',
        lu: false,
        cree_le: new Date().toISOString(),
        action_url: 'presences',
      };
      setNotifications((prev) => [notifProf, ...prev]);
    }
  };

  const validateLecon = (eleveId: string, leconId: string, profId: string) => {
    setProgressions((prev) => {
      const numMatch = leconId.match(/nourania-(\d+)/);
      const currentNum = numMatch ? parseInt(numMatch[1], 10) : 1;
      const nextLeconId = `nourania-${currentNum + 1}`;

      let updated = prev.map((p) => {
        if (p.eleve_id === eleveId && p.lecon_id === leconId) {
          return {
            ...p,
            statut: 'validee' as const,
            validee_le: new Date().toISOString().split('T')[0],
            validee_par: profId,
          };
        }
        return p;
      });

      // If next lesson was locked, set it to en_cours
      const nextExists = updated.some((p) => p.eleve_id === eleveId && p.lecon_id === nextLeconId);
      if (nextExists) {
        updated = updated.map((p) => {
          if (p.eleve_id === eleveId && p.lecon_id === nextLeconId && p.statut === 'verrouillee') {
            return { ...p, statut: 'en_cours' as const };
          }
          return p;
        });
      } else if (currentNum < 17) {
        updated.push({
          eleve_id: eleveId,
          lecon_id: nextLeconId,
          statut: 'en_cours',
        });
      }

      return updated;
    });

    // Confetti celebration!
    triggerLessonConfetti();

    // Check badges
    const num = parseInt(leconId.replace('nourania-', ''), 10);
    const awardBadge = (badgeId: string) => {
      setBadgesEleve((prev) => {
        if (prev.some((b) => b.eleve_id === eleveId && b.badge_id === badgeId)) return prev;
        triggerRewardConfetti();
        return [...prev, { badge_id: badgeId, eleve_id: eleveId, obtenu_le: new Date().toISOString().split('T')[0] }];
      });
    };

    if (num === 1) awardBadge('badge-3'); // Alphabet master
    if (num >= 1) awardBadge('badge-1'); // 1ère leçon
    if (num >= 9) awardBadge('badge-5'); // Mi-parcours
    if (num >= 13) awardBadge('badge-6'); // Shaddah
    if (num === 17) awardBadge('badge-7'); // Diplôme

    // Notify parent
    const student = users.find((u) => u.id === eleveId);
    const parentLink = parentEleves.find((pe) => pe.eleve_id === eleveId);
    if (parentLink && student) {
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        destinataire_id: parentLink.parent_id,
        titre: `🎉 Leçon validée pour ${student.prenom} !`,
        message: `Félicitations ! Le professeur a validé la leçon ${num} de la méthode Nourania.`,
        type: 'appreciation',
        lu: false,
        cree_le: new Date().toISOString(),
        action_url: 'progression',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const updateModuleProgress = (
    eleveId: string,
    moduleNom: 'Vocabulaire' | 'Grammaire' | 'Lecture' | 'Écriture',
    pourcentage: number
  ) => {
    setModulesLitteraire((prev) =>
      prev.map((m) => (m.eleve_id === eleveId && m.nom === moduleNom ? { ...m, pourcentage } : m))
    );
  };

  const createDevoir = (devoirData: Omit<Devoir, 'id' | 'cree_le'>) => {
    const newId = `devoir-${Date.now()}`;
    const newDevoir: Devoir = {
      ...devoirData,
      id: newId,
      cree_le: new Date().toISOString().split('T')[0],
    };
    setDevoirs((prev) => [newDevoir, ...prev]);

    // Create empty 'a_faire' rendus for all target students
    let targetStudentIds: string[] = [];
    if (devoirData.groupe_id) {
      targetStudentIds = getStudentsOfGroup(devoirData.groupe_id).map((u) => u.id);
    } else if (devoirData.eleve_id) {
      targetStudentIds = [devoirData.eleve_id];
    }

    const newRendus: Rendu[] = targetStudentIds.map((sid) => ({
      devoir_id: newId,
      eleve_id: sid,
      statut: 'a_faire',
    }));
    setRendus((prev) => [...prev, ...newRendus]);

    // Notify parents
    targetStudentIds.forEach((sid) => {
      const parentLink = parentEleves.find((pe) => pe.eleve_id === sid);
      const student = users.find((u) => u.id === sid);
      if (parentLink && student) {
        const notif: Notification = {
          id: `notif-${Date.now()}-${sid}`,
          destinataire_id: parentLink.parent_id,
          titre: `Nouveau devoir : ${devoirData.titre}`,
          message: `Un devoir a été assigné à ${student.prenom} pour le ${devoirData.date_limite}.`,
          type: 'devoir',
          lu: false,
          cree_le: new Date().toISOString(),
          action_url: 'devoirs',
        };
        setNotifications((prev) => [notif, ...prev]);
      }
    });
  };

  const submitRendu = (devoirId: string, eleveId: string, audioEleve?: string) => {
    setRendus((prev) => {
      const idx = prev.findIndex((r) => r.devoir_id === devoirId && r.eleve_id === eleveId);
      const submission: Rendu = {
        devoir_id: devoirId,
        eleve_id: eleveId,
        statut: 'rendu',
        audio_eleve: audioEleve || 'audio-sample.webm',
        rendu_le: new Date().toISOString().split('T')[0],
      };
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...submission };
        return updated;
      }
      return [...prev, submission];
    });

    triggerRewardConfetti();

    // Check if student deserves voice reader badge
    setBadgesEleve((prev) => {
      if (prev.some((b) => b.eleve_id === eleveId && b.badge_id === 'badge-4')) return prev;
      return [...prev, { badge_id: 'badge-4', eleve_id: eleveId, obtenu_le: new Date().toISOString().split('T')[0] }];
    });

    // Notify prof
    const devoir = devoirs.find((d) => d.id === devoirId);
    const student = users.find((u) => u.id === eleveId);
    if (devoir && student) {
      const notif: Notification = {
        id: `notif-devoir-rendu-${Date.now()}`,
        destinataire_id: devoir.prof_id,
        titre: `Devoir rendu par ${student.prenom}`,
        message: `${student.prenom} a envoyé son enregistrement pour "${devoir.titre}".`,
        type: 'devoir',
        lu: false,
        cree_le: new Date().toISOString(),
        action_url: 'devoirs',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const reviewRendu = (devoirId: string, eleveId: string, commentaire: string, note?: string) => {
    setRendus((prev) =>
      prev.map((r) =>
        r.devoir_id === devoirId && r.eleve_id === eleveId
          ? {
              ...r,
              statut: 'corrige' as const,
              commentaire_prof: commentaire,
              note_ou_mention: note || 'Bien joué !',
            }
          : r
      )
    );

    // Notify parent
    const parentLink = parentEleves.find((pe) => pe.eleve_id === eleveId);
    const student = users.find((u) => u.id === eleveId);
    const devoir = devoirs.find((d) => d.id === devoirId);
    if (parentLink && student && devoir) {
      const notif: Notification = {
        id: `notif-review-${Date.now()}`,
        destinataire_id: parentLink.parent_id,
        titre: `Devoir corrigé : ${devoir.titre}`,
        message: `Le professeur a corrigé le devoir de ${student.prenom} : "${commentaire}"`,
        type: 'devoir',
        lu: false,
        cree_le: new Date().toISOString(),
        action_url: 'devoirs',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const addAppreciation = (
    eleveId: string,
    profId: string,
    seanceId: string | undefined,
    texte: string,
    badgeRapide?: string
  ) => {
    const newApp: Appreciation = {
      id: `app-${Date.now()}`,
      eleve_id: eleveId,
      prof_id: profId,
      seance_id: seanceId,
      date: new Date().toISOString().split('T')[0],
      texte,
      badge_rapide: badgeRapide,
      cree_le: new Date().toISOString(),
    };
    setAppreciations((prev) => [newApp, ...prev]);

    // Notify parent
    const parentLink = parentEleves.find((pe) => pe.eleve_id === eleveId);
    const student = users.find((u) => u.id === eleveId);
    if (parentLink && student) {
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        destinataire_id: parentLink.parent_id,
        titre: `Nouvelle appréciation pour ${student.prenom}`,
        message: texte,
        type: 'appreciation',
        lu: false,
        cree_le: new Date().toISOString(),
        action_url: 'appreciations',
      };
      setNotifications((prev) => [notif, ...prev]);
    }
  };

  const markPaiement = (paiementId: string, statut: PaiementStatut, moyen?: string) => {
    setPaiements((prev) =>
      prev.map((p) => {
        if (p.id === paiementId) {
          return {
            ...p,
            statut,
            paye_le: statut === 'paye' ? new Date().toISOString().split('T')[0] : undefined,
            recu_numero: statut === 'paye' ? (p.recu_numero || `REC-${Date.now().toString().slice(-6)}`) : undefined,
            moyen_paiement: moyen || p.moyen_paiement || 'Carte bancaire',
          };
        }
        return p;
      })
    );
  };

  const sendMessage = (conversationId: string, texte: string, audioUrl?: string) => {
    if (!currentUser) return;
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      conversation_id: conversationId,
      auteur_id: currentUser.id,
      texte,
      audio_url: audioUrl,
      lu: false,
      cree_le: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);

    // Update conversation last message
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          const isProf = currentUser.role === 'prof' || currentUser.role === 'admin';
          return {
            ...c,
            dernier_message: texte,
            dernier_message_date: new Date().toISOString(),
            non_lus_parent: isProf ? c.non_lus_parent + 1 : c.non_lus_parent,
            non_lus_prof: !isProf ? c.non_lus_prof + 1 : c.non_lus_prof,
          };
        }
        return c;
      })
    );
  };

  const createAnnonce = (annonceData: Omit<Annonce, 'id' | 'cree_le'>) => {
    const newAnn: Annonce = {
      ...annonceData,
      id: `ann-${Date.now()}`,
      cree_le: new Date().toISOString().split('T')[0],
    };
    setAnnonces((prev) => [newAnn, ...prev]);

    // Notify all parents
    users
      .filter((u) => u.role === 'parent')
      .forEach((parent) => {
        const notif: Notification = {
          id: `notif-ann-${Date.now()}-${parent.id}`,
          destinataire_id: parent.id,
          titre: `📢 Annonce : ${annonceData.titre}`,
          message: annonceData.texte.slice(0, 100) + '...',
          type: 'annonce',
          lu: false,
          cree_le: new Date().toISOString(),
          action_url: 'annonces',
        };
        setNotifications((prev) => [notif, ...prev]);
      });
  };

  const createEleve = (data: {
    prenom: string;
    nom: string;
    avatar: string;
    groupeId: string;
    parentId?: string;
    parentEmail?: string;
    telephoneParent?: string;
  }): User => {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const newId = `user-eleve-${Date.now()}`;
    const newEleve: User = {
      id: newId,
      role: 'eleve',
      prenom: data.prenom,
      nom: data.nom,
      code_connexion: code,
      avatar: data.avatar || 'falcon-mint',
      cree_le: new Date().toISOString().split('T')[0],
    };

    setUsers((prev) => [...prev, newEleve]);

    // Attach to group
    setGroupeEleves((prev) => [...prev, { groupe_id: data.groupeId, eleve_id: newId }]);

    // Initialize Nourania progression (1st lesson en_cours, others locked)
    const initialProg: Progression[] = [
      { eleve_id: newId, lecon_id: 'nourania-1', statut: 'en_cours' },
      ...Array.from({ length: 16 }, (_, i) => ({
        eleve_id: newId,
        lecon_id: `nourania-${i + 2}`,
        statut: 'verrouillee' as const,
      })),
    ];
    setProgressions((prev) => [...prev, ...initialProg]);

    // Attach or create parent
    let pId = data.parentId;
    if (!pId && data.parentEmail) {
      // Check if parent email exists
      const existingParent = users.find((u) => u.role === 'parent' && u.email === data.parentEmail);
      if (existingParent) {
        pId = existingParent.id;
      } else {
        const newParentId = `user-parent-${Date.now()}`;
        const newParent: User = {
          id: newParentId,
          role: 'parent',
          prenom: 'Parent de',
          nom: data.prenom,
          email: data.parentEmail,
          telephone: data.telephoneParent,
          avatar: 'parent-generic',
          cree_le: new Date().toISOString().split('T')[0],
        };
        setUsers((prev) => [...prev, newParent]);
        pId = newParentId;
      }
    }

    if (pId) {
      setParentEleves((prev) => [...prev, { parent_id: pId!, eleve_id: newId }]);
    }

    return newEleve;
  };

  const createGroupe = (data: Omit<Groupe, 'id'>): Groupe => {
    const newId = `groupe-${Date.now()}`;
    const newG: Groupe = { ...data, id: newId };
    setGroupes((prev) => [...prev, newG]);
    return newG;
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, lu: true } : n)));
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.destinataire_id === currentUser.id ? { ...n, lu: true } : n))
    );
  };

  const resetDemoData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setParentEleves(INITIAL_PARENT_ELEVES);
    setGroupes(INITIAL_GROUPES);
    setGroupeEleves(INITIAL_GROUPE_ELEVES);
    setSeances(INITIAL_SEANCES);
    setPresences(INITIAL_PRESENCES);
    setProgressions(INITIAL_PROGRESSIONS);
    setModulesLitteraire(INITIAL_MODULES_LITTERAIRE);
    setDevoirs(INITIAL_DEVOIRS);
    setRendus(INITIAL_RENDUS);
    setAppreciations(INITIAL_APPRECIATIONS);
    setPaiements(INITIAL_PAIEMENTS);
    setConversations(INITIAL_CONVERSATIONS);
    setMessages(INITIAL_MESSAGES);
    setAnnonces(INITIAL_ANNONCES);
    setBadgesEleve(INITIAL_BADGES_ELEVE);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(null);
    setSelectedChildId(null);
  };

  const exportDataJson = () => {
    const data = {
      users,
      groupes,
      seances,
      presences,
      progressions,
      devoirs,
      rendus,
      appreciations,
      paiements,
      export_date: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sihscool_export_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppContext.Provider
      value={{
        isDark,
        toggleTheme,
        currentUser,
        loginAs,
        loginWithEmail,
        loginStudent,
        logout,
        switchRole,
        selectedChildId,
        setSelectedChildId,
        selectedChild,
        users,
        parentEleves,
        groupes,
        groupeEleves,
        seances,
        presences,
        progressions,
        modulesLitteraire,
        devoirs,
        rendus,
        appreciations,
        paiements,
        conversations,
        messages,
        annonces,
        badgesEleve,
        notifications,
        getChildrenOfParent,
        getGroupOfStudent,
        getStudentsOfGroup,
        getGroupsOfTeacher,
        getStudentsOfTeacher,
        getUnreadNotificationsCount,
        markPresence,
        reportAbsence,
        validateLecon,
        updateModuleProgress,
        createDevoir,
        submitRendu,
        reviewRendu,
        addAppreciation,
        markPaiement,
        sendMessage,
        createAnnonce,
        createEleve,
        createGroupe,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
        exportDataJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
