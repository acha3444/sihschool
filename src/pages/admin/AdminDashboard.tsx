import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { InscriptionsPanel } from '../../components/common/InscriptionsPanel';
import { LienInscription } from '../../components/common/LienInscription';
import {
  Profile,
  Groupe,
  Eleve,
  Seance,
  Presence,
  Progression,
  Devoir,
  Appreciation,
  Paiement,
  Annonce,
  PresenceStatut,
  PaiementStatut,
} from '../../types/database';
import {
  Calendar,
  Users,
  Layers,
  CreditCard,
  Megaphone,
  Plus,
  Search,
  Check,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  Copy,
  CheckCheck,
  Edit2,
  Trash2,
  ArrowRight,
  TrendingUp,
  FileText,
  UserPlus,
  BookOpen,
  KeyRound,
} from 'lucide-react';

type AdminTab = 'eleves' | 'profs' | 'groupes' | 'annonces';

export const AdminDashboard: React.FC = () => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('eleves');
  const [loading, setLoading] = useState(true);

  // Données globales
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [parentsProfiles, setParentsProfiles] = useState<Profile[]>([]);
  const [profsProfiles, setProfsProfiles] = useState<Profile[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [progressions, setProgressions] = useState<Progression[]>([]);
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);

  // Filtres et sélections
  const todayDate = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayDate);
  const [selectedSeanceForAppel, setSelectedSeanceForAppel] = useState<string | null>(null);

  // Recherche Élèves
  const [searchEleve, setSearchEleve] = useState('');
  const [selectedEleveDetail, setSelectedEleveDetail] = useState<Eleve | null>(null);

  // Modal Ajouter un Élève
  const [isAddEleveModalOpen, setIsAddEleveModalOpen] = useState(false);
  const [newElevePrenom, setNewElevePrenom] = useState('');
  const [newEleveNom, setNewEleveNom] = useState('');
  const [newEleveDateNaissance, setNewEleveDateNaissance] = useState('');
  const [newEleveType, setNewEleveType] = useState<'enfant' | 'adulte'>('enfant');
  const [newEleveGroupeId, setNewEleveGroupeId] = useState('');
  const [newEleveNotes, setNewEleveNotes] = useState('');

  // Parent mode pour enfant
  const [parentChoiceMode, setParentChoiceMode] = useState<'existing' | 'new'>('new');
  const [selectedParentId, setSelectedParentId] = useState('');
  const [newParentPrenom, setNewParentPrenom] = useState('');
  const [newParentNom, setNewParentNom] = useState('');
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentTel, setNewParentTel] = useState('');

  // Adulte account
  const [newAdulteEmail, setNewAdulteEmail] = useState('');
  const [newAdulteTel, setNewAdulteTel] = useState('');

  const [addEleveLoading, setAddEleveLoading] = useState(false);
  const [addEleveError, setAddEleveError] = useState('');
  const [createdAccountResult, setCreatedAccountResult] = useState<{
    tempPassword?: string;
    email?: string;
    prenom?: string;
    elevePrenom?: string;
  } | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Modal Ajouter une Enseignante
  const [isAddProfModalOpen, setIsAddProfModalOpen] = useState(false);
  const [newProfPrenom, setNewProfPrenom] = useState('');
  const [newProfNom, setNewProfNom] = useState('');
  const [newProfEmail, setNewProfEmail] = useState('');
  const [newProfTel, setNewProfTel] = useState('');
  const [addProfLoading, setAddProfLoading] = useState(false);
  const [addProfError, setAddProfError] = useState('');
  const [createdProfResult, setCreatedProfResult] = useState<{
    tempPassword?: string;
    email?: string;
    prenom?: string;
  } | null>(null);
  const [copiedProfInvite, setCopiedProfInvite] = useState(false);

  // Modal Réinitialisation mot de passe utilisateur
  const [resetModalResult, setResetModalResult] = useState<{
    tempPassword: string;
    email: string;
    prenom: string;
    nom?: string;
    telephone?: string;
    role?: string;
  } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [copiedResetMsg, setCopiedResetMsg] = useState(false);

  // Modal Réinitialisation Manuelle (n'importe quel compte ou e-mail)
  const [isManualResetModalOpen, setIsManualResetModalOpen] = useState(false);
  const [manualResetEmail, setManualResetEmail] = useState('');
  const [manualResetSelectedUserId, setManualResetSelectedUserId] = useState('');
  const [manualResetError, setManualResetError] = useState('');

  // Progression modifiable pour fiche élève
  const [editProgLecon, setEditProgLecon] = useState<number>(1);
  const [editProgCommentaire, setEditProgCommentaire] = useState<string>('');
  const [progSaveSuccess, setProgSaveSuccess] = useState(false);

  // Appréciation ajout
  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [newApprecPeriode, setNewApprecPeriode] = useState<string>(currentMonthStr);
  const [newApprecTexte, setNewApprecTexte] = useState<string>('');
  const [apprecSaveSuccess, setApprecSaveSuccess] = useState(false);

  // Modal Créer / Modifier Groupe
  const [isGroupeModalOpen, setIsGroupeModalOpen] = useState(false);
  const [editingGroupeId, setEditingGroupeId] = useState<string | null>(null);
  const [groupeNom, setGroupeNom] = useState('');
  const [groupeFormation, setGroupeFormation] = useState<'nourania' | 'litteraire' | 'eveil'>('nourania');
  const [groupeJour, setGroupeJour] = useState('Mercredi');
  const [groupeHeure, setGroupeHeure] = useState('14:00 - 15:30');
  const [groupeLienZoom, setGroupeLienZoom] = useState('');
  const [groupeProfId, setGroupeProfId] = useState('');

  // Modal Séance pour Groupe
  const [isAddSeanceModalOpen, setIsAddSeanceModalOpen] = useState(false);
  const [seanceGroupeId, setSeanceGroupeId] = useState('');
  const [seanceDate, setSeanceDate] = useState(todayDate);
  const [seanceTheme, setSeanceTheme] = useState('');

  // Modal Devoir pour Groupe
  const [isAddDevoirModalOpen, setIsAddDevoirModalOpen] = useState(false);
  const [devoirGroupeId, setDevoirGroupeId] = useState('');
  const [devoirTitre, setDevoirTitre] = useState('');
  const [devoirConsigne, setDevoirConsigne] = useState('');
  const [devoirDateLimite, setDevoirDateLimite] = useState('');

  // Paiements mois
  const [selectedPaiementMois, setSelectedPaiementMois] = useState<string>(currentMonthStr);
  const [filterPaiementPendingOnly, setFilterPaiementPendingOnly] = useState(false);

  // Annonces
  const [annonceTitre, setAnnonceTitre] = useState('');
  const [annonceTexte, setAnnonceTexte] = useState('');
  const [annonceGroupeId, setAnnonceGroupeId] = useState('');
  const [annonceSuccess, setAnnonceSuccess] = useState(false);

  // Charger toutes les données depuis Supabase
  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        groupesRes,
        elevesRes,
        parentsRes,
        profsRes,
        seancesRes,
        presencesRes,
        progressionsRes,
        devoirsRes,
        appreciationsRes,
        paiementsRes,
        annoncesRes,
      ] = await Promise.all([
        supabase.from('groupes').select('*').order('nom'),
        supabase.from('eleves').select('*, parent:profiles!eleves_parent_id_fkey(*), groupe:groupes(*)').order('nom'),
        supabase.from('profiles').select('*').eq('role', 'parent').order('nom'),
        supabase.from('profiles').select('*').eq('role', 'prof').order('prenom'),
        supabase.from('seances').select('*, groupe:groupes(*)').order('date', { ascending: false }),
        supabase.from('presences').select('*'),
        supabase.from('progressions').select('*'),
        supabase.from('devoirs').select('*, groupe:groupes(*)').order('created_at', { ascending: false }),
        supabase.from('appreciations').select('*').order('periode', { ascending: false }),
        supabase.from('paiements').select('*, eleve:eleves(*)').order('mois', { ascending: false }),
        supabase.from('annonces').select('*, groupe:groupes(*)').order('publiee_le', { ascending: false }),
      ]);

      if (groupesRes.data) setGroupes(groupesRes.data);
      if (elevesRes.data) setEleves(elevesRes.data);
      if (parentsRes.data) setParentsProfiles(parentsRes.data);
      if (profsRes.data) setProfsProfiles(profsRes.data);
      if (seancesRes.data) setSeances(seancesRes.data);
      if (presencesRes.data) setPresences(presencesRes.data);
      if (progressionsRes.data) setProgressions(progressionsRes.data);
      if (devoirsRes.data) setDevoirs(devoirsRes.data);
      if (appreciationsRes.data) setAppreciations(appreciationsRes.data);
      if (paiementsRes.data) setPaiements(paiementsRes.data);
      if (annoncesRes.data) setAnnonces(annoncesRes.data);
    } catch (err) {
      console.error('Erreur chargement données admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync state for detailed student
  useEffect(() => {
    if (selectedEleveDetail) {
      const prog = progressions.find((p) => p.eleve_id === selectedEleveDetail.id);
      if (prog) {
        setEditProgLecon(prog.lecon_actuelle);
        setEditProgCommentaire(prog.commentaire || '');
      } else {
        setEditProgLecon(1);
        setEditProgCommentaire('');
      }
    }
  }, [selectedEleveDetail, progressions]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. APPEL : Enregistrement en 1 clic
  // ─────────────────────────────────────────────────────────────────────────────
  const handleMarkPresence = async (seanceId: string, eleveId: string, statut: PresenceStatut) => {
    // Optimistic update
    setPresences((prev) => {
      const filtered = prev.filter((p) => !(p.seance_id === seanceId && p.eleve_id === eleveId));
      return [
        ...filtered,
        {
          id: `tmp-${Date.now()}`,
          seance_id: seanceId,
          eleve_id: eleveId,
          statut,
          created_at: new Date().toISOString(),
        },
      ];
    });

    try {
      const { error } = await supabase.from('presences').upsert(
        {
          seance_id: seanceId,
          eleve_id: eleveId,
          statut,
        },
        { onConflict: 'seance_id,eleve_id' }
      );
      if (error) console.error('Erreur sauvegarde présence:', error.message);
    } catch (err) {
      console.error('Erreur présence:', err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. AJOUTER UN ÉLÈVE + COMPTE SERVERLESS
  // ─────────────────────────────────────────────────────────────────────────────
  const handleCreateEleveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddEleveError('');
    setAddEleveLoading(true);

    try {
      let parentId: string | null = null;
      let compteId: string | null = null;
      let generatedTempPass: string | undefined = undefined;
      let inviteEmail: string | undefined = undefined;
      let invitePrenom: string | undefined = undefined;

      // Cas 1 : Enfant
      if (newEleveType === 'enfant') {
        if (parentChoiceMode === 'existing') {
          if (!selectedParentId) {
            setAddEleveError('Veuillez sélectionner un compte parent existant.');
            setAddEleveLoading(false);
            return;
          }
          parentId = selectedParentId;
        } else {
          // Création d'un nouveau compte parent via fonction Vercel
          if (!newParentEmail || !newParentPrenom) {
            setAddEleveError('L\'adresse e-mail et le prénom du parent sont obligatoires.');
            setAddEleveLoading(false);
            return;
          }

          const response = await fetch('/api/admin/create-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              prenom: newParentPrenom,
              nom: newParentNom,
              email: newParentEmail,
              telephone: newParentTel,
              role: 'parent',
            }),
          });

          const data = await response.json();
          if (!response.ok || !data.success) {
            throw new Error(data.error || 'Erreur lors de la création du compte parent.');
          }

          parentId = data.userId;
          generatedTempPass = data.tempPassword;
          inviteEmail = data.email;
          invitePrenom = newParentPrenom;
        }
      } else {
        // Cas 2 : Élève adulte
        if (!newAdulteEmail || !newElevePrenom) {
          setAddEleveError('L\'adresse e-mail et le prénom sont obligatoires pour un élève adulte.');
          setAddEleveLoading(false);
          return;
        }

        const response = await fetch('/api/admin/create-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            prenom: newElevePrenom,
            nom: newEleveNom,
            email: newAdulteEmail,
            telephone: newAdulteTel,
            role: 'eleve',
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Erreur lors de la création du compte élève.');
        }

        compteId = data.userId;
        generatedTempPass = data.tempPassword;
        inviteEmail = data.email;
        invitePrenom = newElevePrenom;
      }

      // 3. Insérer dans la table 'eleves'
      const { data: newEleve, error: eleveError } = await supabase
        .from('eleves')
        .insert({
          prenom: newElevePrenom.trim(),
          nom: newEleveNom.trim(),
          date_naissance: newEleveDateNaissance || null,
          type: newEleveType,
          parent_id: parentId,
          compte_id: compteId,
          groupe_id: newEleveGroupeId || null,
          notes_admin: newEleveNotes || null,
        })
        .select('*, parent:profiles!eleves_parent_id_fkey(*), groupe:groupes(*)')
        .single();

      if (eleveError || !newEleve) {
        throw new Error(eleveError?.message || 'Erreur lors de l\'enregistrement de l\'élève.');
      }

      // 4. Initialiser la progression (Leçon 1 Nourania)
      await supabase.from('progressions').insert({
        eleve_id: newEleve.id,
        formation: 'nourania',
        lecon_actuelle: 1,
        commentaire: 'Bienvenue à SihSchool ! Première leçon démarrée.',
      });

      // Rafraîchir les données
      await loadAllData();

      // Résultat avec mot de passe temporaire pour affichage
      if (generatedTempPass) {
        setCreatedAccountResult({
          tempPassword: generatedTempPass,
          email: inviteEmail,
          prenom: invitePrenom,
          elevePrenom: newElevePrenom,
        });
      } else {
        setIsAddEleveModalOpen(false);
      }

      // Réinitialiser le formulaire
      setNewElevePrenom('');
      setNewEleveNom('');
      setNewEleveDateNaissance('');
      setNewEleveGroupeId('');
      setNewEleveNotes('');
      setNewParentPrenom('');
      setNewParentNom('');
      setNewParentEmail('');
      setNewParentTel('');
      setNewAdulteEmail('');
      setNewAdulteTel('');
    } catch (err: any) {
      console.error(err);
      setAddEleveError(err.message || 'Une erreur est survenue.');
    } finally {
      setAddEleveLoading(false);
    }
  };

  const handleCopyInvitationMessage = () => {
    if (!createdAccountResult) return;
    const origin = window.location.origin;
    const msg = `Assalamu alaykum ${createdAccountResult.prenom} ! L'inscription de ${createdAccountResult.elevePrenom} à l'école SihSchool est validée.\n\nAccès à la plateforme : ${origin}/login\nIdentifiant : ${createdAccountResult.email}\nMot de passe temporaire : ${createdAccountResult.tempPassword}\n\n(Il vous sera demandé de choisir votre propre mot de passe à votre première connexion).\n\nÀ très vite sur SihSchool !`;
    navigator.clipboard.writeText(msg);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 3000);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. PROGRESSION ÉLÈVE : Sauvegarde
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSaveProgression = async () => {
    if (!selectedEleveDetail) return;
    try {
      const { error } = await supabase.from('progressions').upsert(
        {
          eleve_id: selectedEleveDetail.id,
          formation: 'nourania',
          lecon_actuelle: editProgLecon,
          commentaire: editProgCommentaire,
          mis_a_jour_le: new Date().toISOString(),
        },
        { onConflict: 'eleve_id' }
      );

      if (!error) {
        setProgSaveSuccess(true);
        setTimeout(() => setProgSaveSuccess(false), 2500);
        await loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. APPRÉCIATIONS : Ajout mensuel
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAddAppreciation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEleveDetail || !newApprecTexte.trim()) return;

    try {
      const { error } = await supabase.from('appreciations').insert({
        eleve_id: selectedEleveDetail.id,
        periode: newApprecPeriode,
        texte: newApprecTexte.trim(),
      });

      if (!error) {
        setNewApprecTexte('');
        setApprecSaveSuccess(true);
        setTimeout(() => setApprecSaveSuccess(false), 2500);
        await loadAllData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 5. ENSEIGNANTES : Création de compte
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAddProf = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddProfError('');
    if (!newProfEmail || !newProfPrenom) {
      setAddProfError('Le prénom et l\'adresse e-mail sont obligatoires.');
      return;
    }

    setAddProfLoading(true);
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          prenom: newProfPrenom.trim(),
          nom: newProfNom.trim(),
          email: newProfEmail.trim().toLowerCase(),
          telephone: newProfTel.trim(),
          role: 'prof',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la création du compte enseignante.');
      }

      setCreatedProfResult({
        tempPassword: data.tempPassword,
        email: data.email,
        prenom: newProfPrenom,
      });

      setNewProfPrenom('');
      setNewProfNom('');
      setNewProfEmail('');
      setNewProfTel('');
      await loadAllData();
    } catch (err: any) {
      setAddProfError(err.message || 'Impossible de créer le compte enseignante.');
    } finally {
      setAddProfLoading(false);
    }
  };

  // 5.5. RÉINITIALISATION DU MOT DE PASSE UTILISATEUR
  const handleTriggerResetPassword = async (
    target: { userId?: string; email?: string },
    targetName?: string,
    telephone?: string
  ) => {
    const label = targetName || target.email || 'cet utilisateur';
    if (!confirm(`Voulez-vous réinitialiser le mot de passe de ${label} et générer un code temporaire ?`)) {
      return;
    }

    setResetLoading(true);
    setManualResetError('');
    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          userId: target.userId,
          email: target.email,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de la réinitialisation.');
      }

      setResetModalResult({
        tempPassword: data.tempPassword,
        email: data.email,
        prenom: data.prenom,
        nom: data.nom,
        telephone: telephone || data.telephone,
        role: data.role,
      });
      setCopiedResetMsg(false);
      setIsManualResetModalOpen(false);
      setManualResetEmail('');
      setManualResetSelectedUserId('');
    } catch (err: any) {
      if (isManualResetModalOpen) {
        setManualResetError(err.message || 'Impossible de réinitialiser le mot de passe.');
      } else {
        alert('Erreur réinitialisation : ' + err.message);
      }
    } finally {
      setResetLoading(false);
    }
  };

  const handleCopyResetWhatsApp = () => {
    if (!resetModalResult) return;
    const origin = window.location.origin;
    const msg = `Assalamu alaykum ${resetModalResult.prenom} !\n\nVoici vos nouveaux identifiants pour vous connecter à l'école SihSchool :\n🌐 Lien de connexion : ${origin}/login\n📧 Identifiant : ${resetModalResult.email}\n🔑 Mot de passe temporaire : ${resetModalResult.tempPassword}\n\n(Dès votre première connexion, la plateforme vous demandera de choisir votre propre mot de passe personnel).\n\nÀ très vite sur SihSchool !`;
    navigator.clipboard.writeText(msg);
    setCopiedResetMsg(true);
    setTimeout(() => setCopiedResetMsg(false), 3000);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. GROUPES : Création / Modification
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSaveGroupe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupeNom.trim()) return;

    try {
      if (editingGroupeId) {
        await supabase
          .from('groupes')
          .update({
            nom: groupeNom.trim(),
            formation: groupeFormation,
            jour: groupeJour,
            heure: groupeHeure,
            lien_zoom: groupeLienZoom.trim() || null,
            prof_id: groupeProfId || null,
          })
          .eq('id', editingGroupeId);
      } else {
        await supabase.from('groupes').insert({
          nom: groupeNom.trim(),
          formation: groupeFormation,
          jour: groupeJour,
          heure: groupeHeure,
          lien_zoom: groupeLienZoom.trim() || null,
          prof_id: groupeProfId || null,
        });
      }

      setIsGroupeModalOpen(false);
      setEditingGroupeId(null);
      setGroupeNom('');
      setGroupeLienZoom('');
      setGroupeProfId('');
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Créer une Séance pour un Groupe
  const handleAddSeance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seanceGroupeId || !seanceDate) return;

    try {
      await supabase.from('seances').insert({
        groupe_id: seanceGroupeId,
        date: seanceDate,
        theme: seanceTheme.trim() || null,
      });

      setIsAddSeanceModalOpen(false);
      setSeanceTheme('');
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Créer un Devoir pour un Groupe
  const handleAddDevoir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoirGroupeId || !devoirTitre.trim() || !devoirConsigne.trim()) return;

    try {
      await supabase.from('devoirs').insert({
        groupe_id: devoirGroupeId,
        titre: devoirTitre.trim(),
        consigne: devoirConsigne.trim(),
        date_limite: devoirDateLimite || null,
      });

      setIsAddDevoirModalOpen(false);
      setDevoirTitre('');
      setDevoirConsigne('');
      setDevoirDateLimite('');
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Supprimer un Devoir
  const handleDeleteDevoir = async (devoirId: string) => {
    if (!confirm('Êtes-vous sûre de vouloir supprimer ce devoir ? Cette action est irréversible.')) return;
    try {
      await supabase.from('devoir_rendus').delete().eq('devoir_id', devoirId);
      const { error } = await supabase.from('devoirs').delete().eq('id', devoirId);
      if (error) throw error;
      setDevoirs((prev) => prev.filter((d) => d.id !== devoirId));
      alert('Devoir supprimé avec succès !');
    } catch (err: any) {
      alert('Erreur suppression devoir : ' + err.message);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 6. PAIEMENTS : Marquer payé en 1 clic
  // ─────────────────────────────────────────────────────────────────────────────
  const handleMarkPaiementPaye = async (eleveId: string, mois: string) => {
    try {
      await supabase.from('paiements').upsert(
        {
          eleve_id: eleveId,
          mois,
          montant: 45,
          statut: 'paye',
          moyen: 'Virement',
          date_paiement: todayDate,
        },
        { onConflict: 'eleve_id,mois' }
      );
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // 7. ANNONCES : Publication & Suppression
  // ─────────────────────────────────────────────────────────────────────────────
  const handlePublishAnnonce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annonceTitre.trim() || !annonceTexte.trim()) return;

    try {
      await supabase.from('annonces').insert({
        titre: annonceTitre.trim(),
        texte: annonceTexte.trim(),
        groupe_id: annonceGroupeId || null,
      });

      setAnnonceTitre('');
      setAnnonceTexte('');
      setAnnonceGroupeId('');
      setAnnonceSuccess(true);
      setTimeout(() => setAnnonceSuccess(false), 2500);
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAnnonce = async (id: string) => {
    if (!window.confirm('Supprimer cette annonce ?')) return;
    try {
      await supabase.from('annonces').delete().eq('id', id);
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtrage des élèves
  const filteredEleves = eleves.filter((e) => {
    const q = searchEleve.toLowerCase();
    return (
      e.prenom.toLowerCase().includes(q) ||
      e.nom.toLowerCase().includes(q) ||
      (e.groupe?.nom || '').toLowerCase().includes(q)
    );
  });

  // Séances du jour sélectionné
  const seancesDuJour = seances.filter((s) => s.date === selectedDate);

  return (
    <div className="space-y-6 pb-20 animate-fadeIn font-baloo">
      {/* ─── EN-TÊTE / ONGLETS PRINCIPAUX ─── */}
      <div className="cloud-card p-4 sm:p-6 border-4 border-white shadow-soft-blue">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#CDBDF2]/40 pb-4 mb-4">
          <div>
            <span className="badge-lavender text-xs uppercase tracking-wider font-extrabold">
              Espace Direction
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A7A] mt-1">
              Tableau de Bord Administratif
            </h1>
            <p className="text-xs sm:text-sm text-[#4A5487] font-semibold mt-0.5">
              Comptes (enseignantes, parents, élèves), groupes, liens Zoom et annonces.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setManualResetEmail('');
                setManualResetSelectedUserId('');
                setManualResetError('');
                setIsManualResetModalOpen(true);
              }}
              className="btn-pill-white text-xs sm:text-sm py-2.5 px-3.5 flex items-center gap-1.5 border border-[#CDBDF2] shadow-xs min-h-[44px]"
              title="Réinitialiser le mot de passe d'un élève, parent ou enseignant en cas d'oubli"
            >
              <KeyRound className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
              <span>Mot de passe oublié ?</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCreatedProfResult(null);
                setIsAddProfModalOpen(true);
              }}
              className="btn-pill-white text-xs sm:text-sm py-2.5 px-4 flex items-center gap-2 border border-[#CDBDF2] shadow-xs min-h-[44px]"
            >
              <Plus className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
              <span>Ajouter une enseignante</span>
            </button>

            <a
              href="/prof"
              className="btn-pill-sun text-xs sm:text-sm py-2.5 px-4.5 flex items-center gap-2 self-start sm:self-center shadow-md min-h-[44px]"
              title="Donner des devoirs, écouter et corriger les vocaux"
            >
              <BookOpen className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
              <span>Espace devoirs</span>
            </a>
          </div>
        </div>

        {/* 6 Onglets du menu */}
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'eleves', label: 'Élèves & comptes', icon: Users, badge: eleves.length },
            { id: 'profs', label: 'Enseignantes', icon: BookOpen, badge: profsProfiles.length },
            { id: 'groupes', label: 'Groupes & Zoom', icon: Layers, badge: groupes.length },
            { id: 'annonces', label: 'Annonces', icon: Megaphone, badge: annonces.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as AdminTab);
                  setSelectedEleveDetail(null);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all min-h-[44px] ${
                  isActive
                    ? 'bg-[#FFE15C] text-[#1B2A7A] shadow-sun-glow'
                    : 'bg-white text-[#4A5487] hover:text-[#1B2A7A] border border-[#CDBDF2]/50'
                }`}
              >
                <Icon className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#1B2A7A] text-white">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Élèves & comptes (inscriptions, parents, mots de passe) */}
      {activeTab === 'eleves' && <InscriptionsPanel />}

      {/* ─────────────────────────────────────────────────────────────────────
          2.5. ONGLET : ENSEIGNANTES (GESTION & CRÉATION DE COMPTE)
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'profs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#1B2A7A]">Équipe Enseignante</h2>
              <p className="text-xs text-[#4A5487] font-semibold">
                Gérez les comptes des enseignantes et visualisez les groupes qui leur sont attribués.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreatedProfResult(null);
                setIsAddProfModalOpen(true);
              }}
              className="btn-pill-sun !min-h-[42px] !text-xs !py-1.5 !px-4 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
              <span>+ Ajouter une enseignante</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profsProfiles.map((prof) => {
              const groupesDuProf = groupes.filter((g) => g.prof_id === prof.id);

              return (
                <div
                  key={prof.id}
                  className="cloud-card p-5 border-3 border-white shadow-soft-blue space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge-lavender text-[10px] font-extrabold uppercase flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        Professeure
                      </span>
                      <span className="text-xs font-bold text-[#4A5487]">
                        {groupesDuProf.length} groupe(s)
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-[#1B2A7A]">
                      {prof.prenom} {prof.nom}
                    </h3>

                    <div className="space-y-1 text-xs text-[#4A5487]">
                      {prof.telephone && (
                        <p className="flex items-center gap-1.5 font-bold">
                          <span>📞 {prof.telephone}</span>
                          <a
                            href={`https://wa.me/${prof.telephone.replace(/\s+/g, '').replace('+', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#1E7E44] text-[10px] underline ml-1"
                          >
                            WhatsApp
                          </a>
                        </p>
                      )}
                    </div>

                    {/* Groupes assignés */}
                    <div className="pt-2 border-t border-[#CDBDF2]/30">
                      <p className="text-[10px] font-black uppercase text-[#1B2A7A] mb-1.5">
                        Groupes attribués :
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {groupesDuProf.map((grp) => (
                          <span
                            key={grp.id}
                            className="text-[11px] font-bold bg-[#FFE15C]/50 text-[#1B2A7A] px-2.5 py-0.5 rounded-full"
                          >
                            {grp.nom} ({grp.jour})
                          </span>
                        ))}
                        {groupesDuProf.length === 0 && (
                          <span className="text-xs text-gray-400 italic">
                            Aucun groupe assigné pour le moment.
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Réinitialisation mot de passe */}
                    <div className="pt-3 border-t border-[#CDBDF2]/30 flex items-center justify-between">
                      <button
                        type="button"
                        disabled={resetLoading}
                        onClick={() =>
                          handleTriggerResetPassword(
                            { userId: prof.id },
                            `Enseignante ${prof.prenom} ${prof.nom}`,
                            prof.telephone || undefined
                          )
                        }
                        className="btn-pill-white !min-h-[34px] !text-[11px] !py-1 !px-3 inline-flex items-center gap-1.5 hover:border-[#FFE15C] text-[#1B2A7A] font-bold"
                        title="Générer un mot de passe temporaire pour cette enseignante"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-[#1B2A7A]" />
                        <span>Réinitialiser mot de passe</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {profsProfiles.length === 0 && (
            <div className="cloud-card p-12 text-center text-[#4A5487] space-y-3">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-base font-bold text-[#1B2A7A]">Aucune enseignante enregistrée</p>
              <p className="text-xs max-w-sm mx-auto">
                Cliquez sur le bouton ci-dessous pour créer le compte de votre première enseignante avec un mot de passe temporaire.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCreatedProfResult(null);
                  setIsAddProfModalOpen(true);
                }}
                className="btn-pill-sun !min-h-[42px] !text-xs !py-1.5 !px-5 inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#1B2A7A]" />
                <span>Ajouter une enseignante</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          3. ONGLET : GROUPES (CRÉER, MODIFIER, SÉANCES, DEVOIRS)
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'groupes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-[#1B2A7A]">Groupes de cours</h2>
            <button
              type="button"
              onClick={() => {
                setEditingGroupeId(null);
                setGroupeNom('');
                setGroupeLienZoom('');
                setIsGroupeModalOpen(true);
              }}
              className="btn-pill-sun !min-h-[42px] !text-xs !py-1.5 !px-4 flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
              <span>Créer un groupe</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupes.map((grp) => {
              const countEleves = eleves.filter((e) => e.groupe_id === grp.id).length;
              const devoirsGroupe = devoirs.filter((d) => d.groupe_id === grp.id);

              return (
                <div
                  key={grp.id}
                  className="cloud-card p-5 border-3 border-white shadow-soft-blue space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge-lavender text-[10px] font-extrabold uppercase">
                        {grp.formation}
                      </span>
                      <span className="text-xs font-bold text-[#4A5487]">
                        {countEleves} élève(s)
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-[#1B2A7A]">{grp.nom}</h3>
                    <p className="text-xs text-[#4A5487] font-semibold">
                      Créneau : <strong>{grp.jour} de {grp.heure}</strong>
                    </p>

                    {(() => {
                      const profAss = profsProfiles.find((p) => p.id === grp.prof_id);
                      return (
                        <p className="text-xs font-bold text-[#1B2A7A]">
                          👩‍🏫 Enseignante : {profAss ? `${profAss.prenom} ${profAss.nom}` : <span className="text-gray-400 font-normal italic">Non assignée (Direction)</span>}
                        </p>
                      );
                    })()}

                    {grp.lien_zoom && (
                      <p className="text-xs text-[#2F5BD1] truncate font-bold">
                        Zoom : <a href={grp.lien_zoom} target="_blank" rel="noreferrer" className="underline">{grp.lien_zoom}</a>
                      </p>
                    )}
                  </div>

                  <LienInscription groupe={grp} onChange={loadAllData} />

                  {/* Actions Groupe */}
                  <div className="pt-3 border-t border-[#CDBDF2]/30 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setDevoirGroupeId(grp.id);
                        setDevoirTitre('');
                        setDevoirConsigne('');
                        setIsAddDevoirModalOpen(true);
                      }}
                      className="btn-pill-white !min-h-[36px] !py-1 !px-3 !text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Devoir</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingGroupeId(grp.id);
                        setGroupeNom(grp.nom);
                        setGroupeFormation(grp.formation);
                        setGroupeJour(grp.jour);
                        setGroupeHeure(grp.heure);
                        setGroupeLienZoom(grp.lien_zoom || '');
                        setGroupeProfId(grp.prof_id || '');
                        setIsGroupeModalOpen(true);
                      }}
                      className="p-2 rounded-full text-[#4A5487] hover:text-[#1B2A7A] hover:bg-white ml-auto"
                      title="Modifier le groupe"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Devoirs actifs */}
                  {devoirsGroupe.length > 0 && (
                    <div className="pt-2 border-t border-[#CDBDF2]/20 space-y-1">
                      <span className="text-[10px] text-[#4A5487] uppercase font-bold block mb-1">Derniers devoirs :</span>
                      {devoirsGroupe.slice(0, 3).map((dev) => (
                        <div key={dev.id} className="flex items-center justify-between text-xs text-[#1B2A7A] py-0.5">
                          <p className="truncate mr-2 font-medium">
                            • <strong>{dev.titre}</strong> {dev.date_limite && <span className="text-gray-400 text-[10px]">({dev.date_limite})</span>}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleDeleteDevoir(dev.id)}
                            title="Supprimer ce devoir"
                            className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          5. ONGLET : ANNONCES
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'annonces' && (
        <div className="space-y-6">
          {/* Formulaire de publication */}
          <div className="cloud-card p-5 sm:p-6 border-3 border-white shadow-soft-blue space-y-4">
            <h3 className="text-lg font-black text-[#1B2A7A] flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-[#1B2A7A]" />
              Publier une nouvelle annonce
            </h3>

            {annonceSuccess && (
              <div className="p-3 rounded-2xl bg-[#EAF7E8] border border-[#BDE8B7] text-[#2B7A00] text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" /> Annonce publiée pour les familles !
              </div>
            )}

            <form onSubmit={handlePublishAnnonce} className="space-y-3 font-baloo">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={annonceTitre}
                  onChange={(e) => setAnnonceTitre(e.target.value)}
                  placeholder="Titre de l'annonce (ex: Vacances de printemps)"
                  className="py-2.5 px-4 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                />

                <select
                  value={annonceGroupeId}
                  onChange={(e) => setAnnonceGroupeId(e.target.value)}
                  className="py-2.5 px-4 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                >
                  <option value="">Destinataires : Tout le monde (Annonce générale)</option>
                  {groupes.map((g) => (
                    <option key={g.id} value={g.id}>
                      Groupe ciblé : {g.nom}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                required
                rows={3}
                value={annonceTexte}
                onChange={(e) => setAnnonceTexte(e.target.value)}
                placeholder="Détails de l'annonce transmis aux familles..."
                className="w-full p-3.5 rounded-2xl bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] focus:outline-none"
              />

              <button type="submit" className="btn-pill-sun !min-h-[42px] !text-xs !py-1 !px-5 ml-auto block">
                Publier l'annonce
              </button>
            </form>
          </div>

          {/* Liste des annonces publiées */}
          <div className="space-y-3">
            <h3 className="font-black text-lg text-[#1B2A7A]">Annonces en ligne ({annonces.length})</h3>
            {annonces.length === 0 ? (
              <p className="text-xs text-[#4A5487] italic">Aucune annonce publiée.</p>
            ) : (
              annonces.map((ann) => (
                <div
                  key={ann.id}
                  className="cloud-card p-4 sm:p-5 border-2 border-white flex items-start justify-between gap-3 shadow-soft-blue"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="badge-lavender text-[10px] font-extrabold">{ann.publiee_le}</span>
                      <span className="text-[11px] font-bold text-[#4A5487]">
                        {ann.groupe_id ? `Groupe : ${ann.groupe?.nom}` : 'Tous les élèves'}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-base text-[#1B2A7A]">{ann.titre}</h4>
                    <p className="text-xs text-[#4A5487] leading-relaxed whitespace-pre-line">{ann.texte}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteAnnonce(ann.id)}
                    className="p-2 text-[#4A5487] hover:text-[#E5483D] rounded-full"
                    title="Supprimer l'annonce"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL : CRÉER / MODIFIER GROUPE
      ───────────────────────────────────────────────────────────────────── */}
      {isGroupeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A7A]/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md cloud-card p-6 border-4 border-white shadow-cloud-pop space-y-4">
            <div className="flex items-center justify-between border-b border-[#CDBDF2]/30 pb-3">
              <h3 className="font-black text-xl text-[#1B2A7A]">
                {editingGroupeId ? 'Modifier le groupe' : 'Créer un nouveau groupe'}
              </h3>
              <button
                type="button"
                onClick={() => setIsGroupeModalOpen(false)}
                className="text-xs text-[#4A5487] font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGroupe} className="space-y-3 font-baloo">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#1B2A7A]">Nom du groupe *</label>
                <input
                  type="text"
                  required
                  value={groupeNom}
                  onChange={(e) => setGroupeNom(e.target.value)}
                  placeholder="Ex: Nourania Enfants - Samedi"
                  className="w-full py-2.5 px-3.5 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-[#1B2A7A]">Formation :</label>
                  <select
                    value={groupeFormation}
                    onChange={(e) => setGroupeFormation(e.target.value as any)}
                    className="w-full py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                  >
                    <option value="nourania">Nourania</option>
                    <option value="litteraire">Arabe Littéraire</option>
                    <option value="eveil">Éveil</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-[#1B2A7A]">Jour :</label>
                  <select
                    value={groupeJour}
                    onChange={(e) => setGroupeJour(e.target.value)}
                    className="w-full py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                  >
                    {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#1B2A7A]">Heure du cours :</label>
                <input
                  type="text"
                  required
                  value={groupeHeure}
                  onChange={(e) => setGroupeHeure(e.target.value)}
                  placeholder="Ex: 14:00 - 15:30"
                  className="w-full py-2.5 px-3.5 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#1B2A7A]">Lien Zoom :</label>
                <input
                  type="url"
                  value={groupeLienZoom}
                  onChange={(e) => setGroupeLienZoom(e.target.value)}
                  placeholder="https://us02web.zoom.us/j/..."
                  className="w-full py-2.5 px-3.5 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#1B2A7A]">Enseignante assignée :</label>
                <select
                  value={groupeProfId}
                  onChange={(e) => setGroupeProfId(e.target.value)}
                  className="w-full py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                >
                  <option value="">Non assignée (Direction)</option>
                  {profsProfiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.prenom} {p.nom}
                    </option>
                  ))}
                </select>
              </div>

              <button type="submit" className="btn-pill-sun w-full min-h-[44px] !text-xs mt-2">
                Enregistrer le groupe
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL : AJOUTER UNE ENSEIGNANTE & COMPTE VERCEL SERVERLESS
      ───────────────────────────────────────────────────────────────────── */}
      {isAddProfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A7A]/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg cloud-card p-6 border-4 border-white shadow-cloud-pop space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#CDBDF2]/30 pb-3">
              <h3 className="font-black text-xl text-[#1B2A7A]">Ajouter une enseignante</h3>
              <button
                type="button"
                onClick={() => {
                  setIsAddProfModalOpen(false);
                  setCreatedProfResult(null);
                }}
                className="text-xs text-[#4A5487] hover:text-[#1B2A7A] font-bold"
              >
                ✕ Fermer
              </button>
            </div>

            {createdProfResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-[#EAFBF1] border border-[#C5F3D6] text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-[#1E7E44] mx-auto" />
                  <h4 className="font-black text-base text-[#1E7E44]">
                    Compte Enseignante créé avec succès !
                  </h4>
                  <p className="text-xs text-[#1B2A7A]">
                    Transmettez ces identifiants temporaires à l'enseignante. Elle devra définir son mot de passe personnel dès sa première connexion sur <strong className="underline">app.sihschool.com</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border-2 border-[#FFE15C] space-y-2 text-xs font-bold text-[#1B2A7A]">
                  <p>👤 <strong>Nom :</strong> {createdProfResult.prenom}</p>
                  <p>📧 <strong>Identifiant :</strong> {createdProfResult.email}</p>
                  <p>🔑 <strong>Mot de passe temporaire :</strong> <span className="font-mono text-sm bg-[#FFE15C]/40 px-2 py-0.5 rounded-md">{createdProfResult.tempPassword}</span></p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const msg = `Salam aleykoum ${createdProfResult.prenom},\n\nVoici vos accès à votre Espace Enseignante SihSchool :\n🔗 Lien : https://app.sihschool.com\n📧 Identifiant : ${createdProfResult.email}\n🔑 Mot de passe temporaire : ${createdProfResult.tempPassword}\n\nVous pourrez définir votre mot de passe personnel dès votre première connexion.`;
                    navigator.clipboard.writeText(msg);
                    setCopiedProfInvite(true);
                    setTimeout(() => setCopiedProfInvite(false), 2500);
                  }}
                  className="btn-pill-sun w-full min-h-[48px] flex items-center justify-center gap-2 text-xs font-black shadow-md"
                >
                  {copiedProfInvite ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-[#1E7E44]" />
                      <span>Invitation copiée dans le presse-papier !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copier l'invitation pour WhatsApp</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddProfModalOpen(false);
                    setCreatedProfResult(null);
                  }}
                  className="btn-pill-white w-full min-h-[40px] text-xs border border-[#CDBDF2]"
                >
                  Terminé
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddProf} className="space-y-3 font-baloo">
                {addProfError && (
                  <div className="p-3 rounded-2xl bg-[#FDE8E8] border border-[#F8B4B4] text-xs font-bold text-[#9B1C1C] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{addProfError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[#1B2A7A]">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={newProfPrenom}
                      onChange={(e) => setNewProfPrenom(e.target.value)}
                      placeholder="Ex: Fatima"
                      className="w-full py-2.5 px-3.5 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[#1B2A7A]">Nom</label>
                    <input
                      type="text"
                      value={newProfNom}
                      onChange={(e) => setNewProfNom(e.target.value)}
                      placeholder="Ex: Zahra"
                      className="w-full py-2.5 px-3.5 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-[#1B2A7A]">Adresse e-mail (connexion) *</label>
                  <input
                    type="email"
                    required
                    value={newProfEmail}
                    onChange={(e) => setNewProfEmail(e.target.value)}
                    placeholder="fatima@exemple.com"
                    className="w-full py-2.5 px-3.5 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-[#1B2A7A]">Téléphone / WhatsApp</label>
                  <input
                    type="tel"
                    value={newProfTel}
                    onChange={(e) => setNewProfTel(e.target.value)}
                    placeholder="06 12 34 56 78"
                    className="w-full py-2.5 px-3.5 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={addProfLoading}
                  className="btn-pill-sun w-full min-h-[48px] text-xs font-black shadow-md mt-4 flex items-center justify-center gap-2"
                >
                  {addProfLoading ? (
                    <span>Création du compte en cours...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Créer le compte & Générer l'accès</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL : AJOUTER DEVOIR
      ───────────────────────────────────────────────────────────────────── */}
      {isAddDevoirModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A7A]/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md cloud-card p-6 border-4 border-white shadow-cloud-pop space-y-4">
            <h3 className="font-black text-lg text-[#1B2A7A]">Ajouter un devoir</h3>
            <form onSubmit={handleAddDevoir} className="space-y-3 font-baloo">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#1B2A7A]">Titre du devoir *</label>
                <input
                  type="text"
                  required
                  value={devoirTitre}
                  onChange={(e) => setDevoirTitre(e.target.value)}
                  placeholder="Ex: Réciter la leçon 3 à la maison"
                  className="w-full py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#1B2A7A]">Consigne détaillée *</label>
                <textarea
                  required
                  rows={3}
                  value={devoirConsigne}
                  onChange={(e) => setDevoirConsigne(e.target.value)}
                  placeholder="Consignes données aux élèves..."
                  className="w-full p-3 rounded-2xl bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#1B2A7A]">Date limite :</label>
                <input
                  type="date"
                  value={devoirDateLimite}
                  onChange={(e) => setDevoirDateLimite(e.target.value)}
                  className="w-full py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDevoirModalOpen(false)}
                  className="flex-1 btn-pill-white !min-h-[40px] !text-xs"
                >
                  Annuler
                </button>
                <button type="submit" className="flex-1 btn-pill-sun !min-h-[40px] !text-xs">
                  Ajouter le devoir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL : RÉINITIALISER UN MOT DE PASSE EN 1 CLIC (OUBLI DE MDP)
      ───────────────────────────────────────────────────────────────────── */}
      {isManualResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A7A]/50 backdrop-blur-sm animate-fadeIn font-baloo">
          <div className="w-full max-w-md cloud-card p-6 border-4 border-white shadow-cloud-pop space-y-4">
            <div className="flex items-center justify-between border-b border-[#CDBDF2]/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#1B2A7A]">Réinitialiser un mot de passe</h3>
                  <p className="text-[11px] text-[#4A5487] font-semibold">Pour n'importe qui : élève, parent, prof ou admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsManualResetModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#CDBDF2] flex items-center justify-center text-[#4A5487] hover:text-[#1B2A7A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {manualResetError && (
              <div className="p-3 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[#E5483D] text-xs flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{manualResetError}</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualResetSelectedUserId) {
                  const targetUser =
                    profsProfiles.find((p) => p.id === manualResetSelectedUserId) ||
                    parentsProfiles.find((p) => p.id === manualResetSelectedUserId);
                  handleTriggerResetPassword(
                    { userId: manualResetSelectedUserId },
                    targetUser ? `${targetUser.prenom} ${targetUser.nom}` : undefined,
                    targetUser?.telephone || undefined
                  );
                } else if (manualResetEmail.trim()) {
                  handleTriggerResetPassword({ email: manualResetEmail.trim().toLowerCase() });
                }
              }}
              className="space-y-4 text-xs font-baloo"
            >
              {/* Option A : Choisir dans la liste des comptes existants */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-[#1B2A7A] block">
                  Option 1 : Sélectionner un utilisateur dans la liste
                </label>
                <select
                  value={manualResetSelectedUserId}
                  onChange={(e) => {
                    setManualResetSelectedUserId(e.target.value);
                    if (e.target.value) setManualResetEmail('');
                  }}
                  className="w-full py-2.5 px-3 rounded-2xl bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                >
                  <option value="">-- Choisir un compte dans l'école --</option>
                  <optgroup label="👩‍🏫 Enseignantes">
                    {profsProfiles.map((prof) => (
                      <option key={prof.id} value={prof.id}>
                        {prof.prenom} {prof.nom} (Professeure)
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="👨‍👩‍👦 Parents d'élèves">
                    {parentsProfiles.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {parent.prenom} {parent.nom} {parent.telephone ? `(${parent.telephone})` : ''}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#CDBDF2]/50"></div>
                <span className="flex-shrink mx-3 text-[10px] text-[#4A5487] font-black uppercase">OU</span>
                <div className="flex-grow border-t border-[#CDBDF2]/50"></div>
              </div>

              {/* Option B : Taper directement l'e-mail du compte */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-[#1B2A7A] block">
                  Option 2 : Saisir directement l'adresse e-mail du compte
                </label>
                <input
                  type="email"
                  value={manualResetEmail}
                  onChange={(e) => {
                    setManualResetEmail(e.target.value);
                    if (e.target.value) setManualResetSelectedUserId('');
                  }}
                  placeholder="exemple@gmail.com"
                  className="w-full py-2.5 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C] text-[11px] text-[#8C6D00] leading-relaxed">
                💡 <strong>Comment ça marche ?</strong> Un code temporaire sécurisé (ex: <code>SIH-849201</code>) sera généré. Vous pourrez copier le message WhatsApp tout prêt pour la personne. Dès sa connexion, elle choisira son propre mot de passe.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsManualResetModalOpen(false)}
                  className="flex-1 btn-pill-white !min-h-[42px] !text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={resetLoading || (!manualResetSelectedUserId && !manualResetEmail.trim())}
                  className="flex-1 btn-pill-sun !min-h-[42px] !text-xs font-bold disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4 text-[#1B2A7A]" />
                  <span>{resetLoading ? 'Génération...' : 'Réinitialiser'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL : RÉSULTAT RÉINITIALISATION MOT DE PASSE (MESSAGE WHATSAPP)
      ───────────────────────────────────────────────────────────────────── */}
      {resetModalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A7A]/50 backdrop-blur-sm animate-fadeIn font-baloo">
          <div className="w-full max-w-lg cloud-card p-6 border-4 border-white shadow-cloud-pop space-y-4">
            <div className="flex items-center justify-between border-b border-[#CDBDF2]/40 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[#EAF7E8] text-[#2B7A00] flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#1B2A7A]">Mot de passe réinitialisé !</h3>
                  <p className="text-xs text-[#4A5487] font-semibold">
                    Compte : {resetModalResult.prenom} {resetModalResult.nom || ''} ({resetModalResult.email})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResetModalResult(null)}
                className="w-8 h-8 rounded-full bg-white border border-[#CDBDF2] flex items-center justify-center text-[#4A5487] hover:text-[#1B2A7A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Carte des identifiants */}
            <div className="p-4 rounded-2xl bg-white border-2 border-[#FFE15C] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#4A5487] uppercase tracking-wide">Identifiant (E-mail) :</span>
                <span className="text-xs font-bold text-[#1B2A7A] font-mono">{resetModalResult.email}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-[#CDBDF2]/30">
                <span className="text-xs font-extrabold text-[#4A5487] uppercase tracking-wide">Nouveau mot de passe temporaire :</span>
                <span className="px-3 py-1 rounded-full bg-[#FFE15C] text-[#1B2A7A] font-black text-sm font-mono tracking-wider shadow-xs">
                  {resetModalResult.tempPassword}
                </span>
              </div>
            </div>

            {/* Aperçu du message WhatsApp */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-[#1B2A7A] block">
                Message à transmettre à {resetModalResult.prenom} :
              </label>
              <div className="p-3.5 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C] text-xs text-[#1B2A7A] font-mono whitespace-pre-wrap leading-relaxed select-all">
                {`Assalamu alaykum ${resetModalResult.prenom} !\n\nVoici vos nouveaux identifiants pour vous connecter à l'école SihSchool :\n🌐 Lien de connexion : ${window.location.origin}/login\n📧 Identifiant : ${resetModalResult.email}\n🔑 Mot de passe temporaire : ${resetModalResult.tempPassword}\n\n(Dès votre première connexion, la plateforme vous demandera de choisir votre propre mot de passe personnel).\n\nÀ très vite sur SihSchool !`}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyResetWhatsApp}
                className="flex-1 btn-pill-sun !min-h-[44px] !text-xs font-extrabold inline-flex items-center justify-center gap-2 shadow-sm"
              >
                {copiedResetMsg ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-[#1B2A7A]" />
                    <span>Message copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#1B2A7A]" />
                    <span>Copier le message WhatsApp</span>
                  </>
                )}
              </button>

              {resetModalResult.telephone && (
                <a
                  href={`https://wa.me/${resetModalResult.telephone.replace(/\s+/g, '').replace('+', '')}?text=${encodeURIComponent(
                    `Assalamu alaykum ${resetModalResult.prenom} !\n\nVoici vos nouveaux identifiants pour vous connecter à l'école SihSchool :\n🌐 Lien de connexion : ${window.location.origin}/login\n📧 Identifiant : ${resetModalResult.email}\n🔑 Mot de passe temporaire : ${resetModalResult.tempPassword}\n\n(Dès votre première connexion, la plateforme vous demandera de choisir votre propre mot de passe personnel).\n\nÀ très vite sur SihSchool !`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill-white !min-h-[44px] !text-xs font-extrabold inline-flex items-center justify-center gap-1.5 border border-[#1E7E44] text-[#1E7E44] hover:bg-[#EAFBF1]"
                >
                  <span>💬 Ouvrir WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setResetModalResult(null)}
                className="btn-pill-white !min-h-[44px] !text-xs px-4"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
