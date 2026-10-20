import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
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
} from 'lucide-react';

type AdminTab = 'aujourdhui' | 'eleves' | 'groupes' | 'paiements' | 'annonces';

export const AdminDashboard: React.FC = () => {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('aujourdhui');
  const [loading, setLoading] = useState(true);

  // Données globales
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [parentsProfiles, setParentsProfiles] = useState<Profile[]>([]);
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
        commentaire: 'Bienvenue à Sihscool ! Première leçon démarrée.',
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
    const msg = `Assalamu alaykum ${createdAccountResult.prenom} ! L'inscription de ${createdAccountResult.elevePrenom} à l'école Sihscool est validée.\n\nAccès à la plateforme : ${origin}/login\nIdentifiant : ${createdAccountResult.email}\nMot de passe temporaire : ${createdAccountResult.tempPassword}\n\n(Il vous sera demandé de choisir votre propre mot de passe à votre première connexion).\n\nÀ très vite sur Sihscool !`;
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
  // 5. GROUPES : Création / Modification
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
          })
          .eq('id', editingGroupeId);
      } else {
        await supabase.from('groupes').insert({
          nom: groupeNom.trim(),
          formation: groupeFormation,
          jour: groupeJour,
          heure: groupeHeure,
          lien_zoom: groupeLienZoom.trim() || null,
        });
      }

      setIsGroupeModalOpen(false);
      setEditingGroupeId(null);
      setGroupeNom('');
      setGroupeLienZoom('');
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
              Suivi en direct des séances, appel, élèves, groupes, paiements et annonces.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setCreatedAccountResult(null);
              setIsAddEleveModalOpen(true);
            }}
            className="btn-pill-sun text-xs sm:text-sm py-2.5 px-4.5 flex items-center gap-2 self-start sm:self-center shadow-md min-h-[44px]"
          >
            <UserPlus className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
            <span>Ajouter un élève</span>
          </button>
        </div>

        {/* 5 Onglets du menu */}
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            { id: 'aujourdhui', label: 'Aujourd\'hui', icon: Calendar, badge: seancesDuJour.length },
            { id: 'eleves', label: 'Élèves', icon: Users, badge: eleves.length },
            { id: 'groupes', label: 'Groupes', icon: Layers, badge: groupes.length },
            { id: 'paiements', label: 'Paiements', icon: CreditCard },
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

      {/* ─────────────────────────────────────────────────────────────────────
          1. ONGLET : AUJOURD'HUI & APPEL
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'aujourdhui' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-extrabold text-[#1B2A7A]">Date des séances :</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="py-1.5 px-3 rounded-full bg-white border-2 border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] focus:outline-none min-h-[44px]"
              />
              {selectedDate === todayDate && (
                <span className="badge-lavender text-[11px] font-extrabold">Aujourd'hui</span>
              )}
            </div>
          </div>

          {seancesDuJour.length === 0 ? (
            <div className="cloud-card p-8 border-4 border-white text-center space-y-3 shadow-soft-blue">
              <Calendar className="w-10 h-10 text-[#4A5487] mx-auto opacity-60" />
              <h3 className="text-lg font-extrabold text-[#1B2A7A]">Aucune séance prévue pour cette date</h3>
              <p className="text-xs text-[#4A5487] max-w-sm mx-auto">
                Vous pouvez programmer une séance pour l'un de vos groupes dans l'onglet « Groupes ».
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {seancesDuJour.map((seance) => {
                const groupe = seance.groupe;
                const groupeEleves = eleves.filter((e) => e.groupe_id === seance.groupe_id);
                const isAppelOpen = selectedSeanceForAppel === seance.id;

                const presencesSeance = presences.filter((p) => p.seance_id === seance.id);
                const presentCount = presencesSeance.filter((p) => p.statut === 'present').length;
                const absentCount = presencesSeance.filter((p) => p.statut === 'absent').length;

                return (
                  <div
                    key={seance.id}
                    className="cloud-card p-5 sm:p-6 border-3 border-white shadow-soft-blue space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#CDBDF2]/30 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="badge-lavender text-[11px] font-extrabold uppercase">
                            {groupe?.formation || 'Nourania'}
                          </span>
                          <span className="text-xs font-bold text-[#4A5487] flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {groupe?.heure || '14:00 - 15:30'}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-[#1B2A7A] mt-1">
                          {groupe?.nom || 'Groupe'}
                        </h3>
                        {seance.theme && (
                          <p className="text-xs text-[#4A5487] font-semibold mt-0.5">
                            Thème du jour : <strong>{seance.theme}</strong>
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {groupe?.lien_zoom && (
                          <a
                            href={groupe.lien_zoom}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-pill-white !min-h-[40px] !py-1.5 !px-3 !text-xs flex items-center gap-1.5"
                          >
                            <Video className="w-4 h-4 text-[#2F5BD1]" />
                            <span>Lien Zoom</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedSeanceForAppel(isAppelOpen ? null : seance.id)}
                          className="btn-pill-sun !min-h-[40px] !py-1.5 !px-4 !text-xs flex items-center gap-1.5 shadow-sm"
                        >
                          <Users className="w-4 h-4 text-[#1B2A7A]" />
                          <span>{isAppelOpen ? 'Masquer l\'appel' : 'Faire l\'appel'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Résumé de l'appel */}
                    <div className="flex items-center gap-3 text-xs text-[#4A5487] font-bold">
                      <span className="text-[#2B7A00]">✓ {presentCount} Présent(s)</span>
                      <span className="text-[#E5483D]">✗ {absentCount} Absent(s)</span>
                      <span>· Total groupe : {groupeEleves.length} élève(s)</span>
                    </div>

                    {/* Liste pour faire l'appel */}
                    {isAppelOpen && (
                      <div className="pt-2 space-y-3 animate-fadeIn">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#1B2A7A] border-b border-[#CDBDF2]/30 pb-1">
                          Élèves du groupe — Cliquez sur le statut pour enregistrer en 1 clic :
                        </h4>

                        {groupeEleves.length === 0 ? (
                          <p className="text-xs text-[#4A5487] italic">Aucun élève rattaché à ce groupe.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {groupeEleves.map((eleve) => {
                              const presence = presences.find(
                                (p) => p.seance_id === seance.id && p.eleve_id === eleve.id
                              );
                              const currentStatut = presence?.statut;

                              return (
                                <div
                                  key={eleve.id}
                                  className="p-3.5 rounded-2xl bg-white border border-[#CDBDF2]/60 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                                >
                                  <div>
                                    <p className="font-extrabold text-sm text-[#1B2A7A]">
                                      {eleve.prenom} {eleve.nom}
                                    </p>
                                    <span className="text-[11px] text-[#4A5487]">
                                      {eleve.type === 'enfant' ? 'Écolier' : 'Adulte'}
                                    </span>
                                  </div>

                                  {/* 4 Boutons tactiles (min 44px) */}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    {(
                                      [
                                        { id: 'present', label: 'Présent', bg: 'bg-[#58CC02] text-white', border: 'border-[#58CC02]' },
                                        { id: 'absent', label: 'Absent', bg: 'bg-[#E5483D] text-white', border: 'border-[#E5483D]' },
                                        { id: 'retard', label: 'Retard', bg: 'bg-[#FFE15C] text-[#1B2A7A]', border: 'border-[#FFE15C]' },
                                        { id: 'excuse', label: 'Excusé', bg: 'bg-[#CDBDF2] text-[#1B2A7A]', border: 'border-[#CDBDF2]' },
                                      ] as const
                                    ).map((btn) => {
                                      const isSelected = currentStatut === btn.id;
                                      return (
                                        <button
                                          key={btn.id}
                                          type="button"
                                          onClick={() => handleMarkPresence(seance.id, eleve.id, btn.id)}
                                          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all min-h-[44px] min-w-[58px] ${
                                            isSelected
                                              ? `${btn.bg} shadow-sm scale-102 ring-2 ring-[#1B2A7A]`
                                              : 'bg-white text-[#4A5487] border border-[#CDBDF2]/60 hover:bg-[#FFF6E3]'
                                          }`}
                                        >
                                          {btn.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          2. ONGLET : ÉLÈVES (RECHERCHE + FICHE DÉTAILLÉE + AJOUT)
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'eleves' && (
        <div className="space-y-6">
          {!selectedEleveDetail ? (
            <>
              {/* Barre de recherche */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-[#4A5487] absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchEleve}
                    onChange={(e) => setSearchEleve(e.target.value)}
                    placeholder="Rechercher par prénom, nom ou groupe..."
                    className="w-full py-3 pl-11 pr-4 rounded-full bg-white border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-sm font-bold text-[#1B2A7A] min-h-[44px]"
                  />
                </div>
              </div>

              {/* Liste des élèves */}
              {filteredEleves.length === 0 ? (
                <div className="cloud-card p-8 border-4 border-white text-center text-[#4A5487]">
                  Aucun élève trouvé.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEleves.map((eleve) => {
                    const prog = progressions.find((p) => p.eleve_id === eleve.id);
                    return (
                      <div
                        key={eleve.id}
                        onClick={() => setSelectedEleveDetail(eleve)}
                        className="cloud-card p-4 sm:p-5 border-2 border-white hover:border-[#FFE15C] transition-all cursor-pointer shadow-soft-blue flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="badge-lavender text-[10px] font-extrabold uppercase">
                              {eleve.type === 'enfant' ? 'Écolier' : 'Adulte'}
                            </span>
                            <span className="text-[11px] font-bold text-[#8C6D00] bg-[#FFF6E3] px-2 py-0.5 rounded-full border border-[#FFE15C]">
                              Leçon {prog?.lecon_actuelle || 1}/17
                            </span>
                          </div>

                          <h3 className="font-extrabold text-lg text-[#1B2A7A]">
                            {eleve.prenom} {eleve.nom}
                          </h3>

                          <p className="text-xs text-[#4A5487]">
                            Groupe : <strong>{eleve.groupe?.nom || 'Non rattaché'}</strong>
                          </p>

                          {eleve.type === 'enfant' && eleve.parent && (
                            <p className="text-xs text-[#4A5487]">
                              Parent : {eleve.parent.prenom} {eleve.parent.nom}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#CDBDF2]/30 flex items-center justify-between text-xs text-[#1B2A7A] font-extrabold">
                          <span>Voir la fiche</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* ─── FICHE ÉLÈVE DÉTAILLÉE ─── */
            <div className="space-y-6 animate-fadeIn">
              <button
                type="button"
                onClick={() => setSelectedEleveDetail(null)}
                className="btn-pill-white !min-h-[40px] !text-xs !py-1 !px-3 inline-flex items-center gap-1.5"
              >
                ← Retour à la liste des élèves
              </button>

              <div className="cloud-card p-6 border-4 border-white shadow-soft-blue space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#CDBDF2]/40 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="badge-lavender text-xs uppercase font-extrabold">
                        {selectedEleveDetail.type === 'enfant' ? 'Écolier Enfant' : 'Élève Adulte'}
                      </span>
                      <span className="text-xs text-[#4A5487] font-bold">
                        Groupe : {selectedEleveDetail.groupe?.nom || 'Aucun'}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[#1B2A7A] mt-1">
                      {selectedEleveDetail.prenom} {selectedEleveDetail.nom}
                    </h2>
                  </div>

                  {selectedEleveDetail.parent && (
                    <div className="p-3 rounded-2xl bg-white border border-[#CDBDF2] text-xs font-semibold">
                      <span className="text-[#4A5487] block text-[10px] uppercase font-extrabold">Parent rattaché :</span>
                      <p className="font-bold text-[#1B2A7A]">{selectedEleveDetail.parent.prenom} {selectedEleveDetail.parent.nom}</p>
                      {selectedEleveDetail.parent.telephone && (
                        <p className="text-[11px] text-[#4A5487]">{selectedEleveDetail.parent.telephone}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Section 1 : Progression Modifiable */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#CDBDF2] space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-base text-[#1B2A7A] flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#1B2A7A]" />
                      Progression Nourania (Leçon 1 à 17)
                    </h3>
                    <span className="text-xs font-bold text-[#8C6D00] bg-[#FFF6E3] px-3 py-1 rounded-full border border-[#FFE15C]">
                      Leçon actuelle : {editProgLecon} / 17
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-[#1B2A7A]">Numéro de leçon :</label>
                      <select
                        value={editProgLecon}
                        onChange={(e) => setEditProgLecon(Number(e.target.value))}
                        className="w-full py-2.5 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                      >
                        {Array.from({ length: 17 }, (_, i) => i + 1).map((num) => (
                          <option key={num} value={num}>
                            Leçon {num} : Méthode Nourania
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-extrabold text-[#1B2A7A]">Commentaire du professeur :</label>
                      <input
                        type="text"
                        value={editProgCommentaire}
                        onChange={(e) => setEditProgCommentaire(e.target.value)}
                        placeholder="Ex: Excellente prononciation, le Soukoun est acquis !"
                        className="w-full py-2.5 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {progSaveSuccess && (
                      <span className="text-xs text-[#2B7A00] font-extrabold flex items-center gap-1">
                        <Check className="w-4 h-4" /> Progression enregistrée !
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveProgression}
                      className="ml-auto btn-pill-sun !min-h-[40px] !text-xs !py-1 !px-4"
                    >
                      Enregistrer la progression
                    </button>
                  </div>
                </div>

                {/* Section 2 : Appréciations Mensuelles */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#CDBDF2] space-y-3">
                  <h3 className="font-extrabold text-base text-[#1B2A7A] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#1B2A7A]" />
                    Appréciations par mois
                  </h3>

                  <form onSubmit={handleAddAppreciation} className="space-y-2 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="month"
                        value={newApprecPeriode}
                        onChange={(e) => setNewApprecPeriode(e.target.value)}
                        className="py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                      />
                      <input
                        type="text"
                        required
                        value={newApprecTexte}
                        onChange={(e) => setNewApprecTexte(e.target.value)}
                        placeholder="Rédiger une appréciation pour cette période..."
                        className="sm:col-span-2 py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {apprecSaveSuccess && (
                        <span className="text-xs text-[#2B7A00] font-extrabold flex items-center gap-1">
                          <Check className="w-4 h-4" /> Appréciation ajoutée !
                        </span>
                      )}
                      <button type="submit" className="ml-auto btn-pill-sun !min-h-[38px] !text-xs !py-1 !px-4">
                        Ajouter l'appréciation
                      </button>
                    </div>
                  </form>

                  {/* Historique appréciations élève */}
                  <div className="space-y-2 pt-2 border-t border-[#CDBDF2]/30">
                    {appreciations
                      .filter((a) => a.eleve_id === selectedEleveDetail.id)
                      .map((app) => (
                        <div key={app.id} className="p-3 rounded-xl bg-[#FFF6E3] border border-[#FFE15C] text-xs font-baloo">
                          <span className="badge-lavender text-[10px] font-extrabold">{app.periode}</span>
                          <p className="font-semibold text-[#1B2A7A] mt-1">{app.texte}</p>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Section 3 : Historique des Présences */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#CDBDF2] space-y-3">
                  <h3 className="font-extrabold text-base text-[#1B2A7A] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#1B2A7A]" />
                    Historique des Présences
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {presences
                      .filter((p) => p.eleve_id === selectedEleveDetail.id)
                      .slice(0, 8)
                      .map((pr) => {
                        const seanceInfo = seances.find((s) => s.id === pr.seance_id);
                        return (
                          <div key={pr.id} className="p-2.5 rounded-xl border border-[#CDBDF2]/60 text-center font-baloo">
                            <span className="text-[10px] text-[#4A5487] block font-bold">{seanceInfo?.date || 'Séance'}</span>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase mt-1 ${
                                pr.statut === 'present'
                                  ? 'bg-[#EAF7E8] text-[#2B7A00]'
                                  : pr.statut === 'absent'
                                  ? 'bg-[#FFF0D4] text-[#E5483D]'
                                  : 'bg-[#FFF6E3] text-[#8C6D00]'
                              }`}
                            >
                              {pr.statut}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
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

                    {grp.lien_zoom && (
                      <p className="text-xs text-[#2F5BD1] truncate font-bold">
                        Zoom : <a href={grp.lien_zoom} target="_blank" rel="noreferrer" className="underline">{grp.lien_zoom}</a>
                      </p>
                    )}
                  </div>

                  {/* Actions Groupe */}
                  <div className="pt-3 border-t border-[#CDBDF2]/30 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setSeanceGroupeId(grp.id);
                        setSeanceDate(todayDate);
                        setSeanceTheme('');
                        setIsAddSeanceModalOpen(true);
                      }}
                      className="btn-pill-sun !min-h-[36px] !py-1 !px-3 !text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Séance</span>
                    </button>

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
                    <div className="pt-2 border-t border-[#CDBDF2]/20">
                      <span className="text-[10px] text-[#4A5487] uppercase font-bold block mb-1">Derniers devoirs :</span>
                      {devoirsGroupe.slice(0, 2).map((dev) => (
                        <p key={dev.id} className="text-xs text-[#1B2A7A] truncate">
                          • <strong>{dev.titre}</strong> (limite: {dev.date_limite || 'Sans'})
                        </p>
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
          4. ONGLET : PAIEMENTS (TABLEAU DU MOIS + EN 1 CLIC)
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'paiements' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-extrabold text-[#1B2A7A]">Mois de cotisation :</label>
              <input
                type="month"
                value={selectedPaiementMois}
                onChange={(e) => setSelectedPaiementMois(e.target.value)}
                className="py-1.5 px-3 rounded-full bg-white border-2 border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
              />
            </div>

            <label className="flex items-center gap-2 text-xs font-extrabold text-[#1B2A7A] cursor-pointer">
              <input
                type="checkbox"
                checked={filterPaiementPendingOnly}
                onChange={(e) => setFilterPaiementPendingOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#1B2A7A]"
              />
              <span>Afficher uniquement les cotisations en attente</span>
            </label>
          </div>

          <div className="cloud-card p-5 border-3 border-white shadow-soft-blue space-y-3">
            <h3 className="font-black text-lg text-[#1B2A7A]">
              État des cotisations pour {selectedPaiementMois}
            </h3>

            <div className="space-y-2">
              {eleves
                .filter((eleve) => {
                  const paiement = paiements.find(
                    (p) => p.eleve_id === eleve.id && p.mois === selectedPaiementMois
                  );
                  if (filterPaiementPendingOnly) {
                    return !paiement || paiement.statut === 'en_attente';
                  }
                  return true;
                })
                .map((eleve) => {
                  const paiement = paiements.find(
                    (p) => p.eleve_id === eleve.id && p.mois === selectedPaiementMois
                  );
                  const isPaye = paiement?.statut === 'paye';

                  return (
                    <div
                      key={eleve.id}
                      className="p-3.5 rounded-2xl bg-white border border-[#CDBDF2]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#1B2A7A]">
                            {eleve.prenom} {eleve.nom}
                          </span>
                          <span className="text-xs text-[#4A5487]">({eleve.groupe?.nom || 'Sans groupe'})</span>
                        </div>
                        <p className="text-[11px] text-[#4A5487] mt-0.5">
                          Tarif mensuel : <strong>{paiement?.montant || 45} €</strong>
                          {isPaye && paiement?.date_paiement && (
                            <span> · Réglé le {paiement.date_paiement} ({paiement.moyen || 'Virement'})</span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {isPaye ? (
                          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-[#EAF7E8] text-[#2B7A00] border border-[#BDE8B7]">
                            Payé ✓
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1.5 rounded-full text-xs font-black bg-[#FFF0D4] text-[#E5483D] border border-[#FFE15C]">
                              En attente
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMarkPaiementPaye(eleve.id, selectedPaiementMois)}
                              className="btn-pill-sun !min-h-[38px] !py-1 !px-3 !text-xs shadow-xs"
                            >
                              Marquer payé
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
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
          MODAL : AJOUTER UN ÉLÈVE & COMPTE VERCEL SERVERLESS
      ───────────────────────────────────────────────────────────────────── */}
      {isAddEleveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A7A]/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg cloud-card p-6 border-4 border-white shadow-cloud-pop space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#CDBDF2]/30 pb-3">
              <h3 className="font-black text-xl text-[#1B2A7A]">Ajouter un nouvel élève</h3>
              <button
                type="button"
                onClick={() => setIsAddEleveModalOpen(false)}
                className="text-xs text-[#4A5487] hover:text-[#1B2A7A] font-bold"
              >
                Fermer ✕
              </button>
            </div>

            {addEleveError && (
              <div className="p-3 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[#E5483D] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addEleveError}</span>
              </div>
            )}

            {/* Si un mot de passe temporaire vient d'être généré */}
            {createdAccountResult ? (
              <div className="p-4 rounded-2xl bg-[#EAF7E8] border border-[#BDE8B7] space-y-3 font-baloo">
                <div className="flex items-center gap-2 text-[#2B7A00] font-black text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Compte créé avec succès !</span>
                </div>

                <div className="p-3 rounded-xl bg-white border border-[#BDE8B7] space-y-1">
                  <p className="text-xs text-[#4A5487]">
                    Identifiant : <strong>{createdAccountResult.email}</strong>
                  </p>
                  <p className="text-xs text-[#4A5487]">
                    Mot de passe temporaire :{' '}
                    <code className="font-mono text-base font-black text-[#E5483D] bg-[#FFF6E3] px-2 py-0.5 rounded">
                      {createdAccountResult.tempPassword}
                    </code>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyInvitationMessage}
                  className="btn-pill-sun w-full !text-xs !py-2.5 flex items-center justify-center gap-2"
                >
                  {copiedInvite ? (
                    <>
                      <CheckCheck className="w-4 h-4 text-[#2B7A00]" />
                      <span className="text-[#2B7A00]">Message d'invitation copié !</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copier le message pour WhatsApp / SMS</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddEleveModalOpen(false)}
                  className="w-full text-center text-xs text-[#4A5487] font-bold py-1"
                >
                  Terminer
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateEleveSubmit} className="space-y-4 font-baloo">
                {/* Type : Enfant ou Adulte */}
                <div className="space-y-1">
                  <label className="text-xs font-extrabold text-[#1B2A7A]">Type d'élève :</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewEleveType('enfant')}
                      className={`flex-1 py-2 px-3 rounded-full text-xs font-bold border transition-all ${
                        newEleveType === 'enfant' ? 'bg-[#FFE15C] text-[#1B2A7A] border-[#FFE15C]' : 'bg-white text-[#4A5487]'
                      }`}
                    >
                      Enfant (rattaché à un parent)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewEleveType('adulte')}
                      className={`flex-1 py-2 px-3 rounded-full text-xs font-bold border transition-all ${
                        newEleveType === 'adulte' ? 'bg-[#FFE15C] text-[#1B2A7A] border-[#FFE15C]' : 'bg-white text-[#4A5487]'
                      }`}
                    >
                      Élève Adulte (compte autonome)
                    </button>
                  </div>
                </div>

                {/* Nom et Prénom de l'élève */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[#1B2A7A]">Prénom de l'élève *</label>
                    <input
                      type="text"
                      required
                      value={newElevePrenom}
                      onChange={(e) => setNewElevePrenom(e.target.value)}
                      placeholder="Prénom"
                      className="w-full py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[#1B2A7A]">Nom de famille *</label>
                    <input
                      type="text"
                      required
                      value={newEleveNom}
                      onChange={(e) => setNewEleveNom(e.target.value)}
                      placeholder="Nom"
                      className="w-full py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[#1B2A7A]">Date de naissance :</label>
                    <input
                      type="date"
                      value={newEleveDateNaissance}
                      onChange={(e) => setNewEleveDateNaissance(e.target.value)}
                      className="w-full py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-extrabold text-[#1B2A7A]">Groupe de cours :</label>
                    <select
                      value={newEleveGroupeId}
                      onChange={(e) => setNewEleveGroupeId(e.target.value)}
                      className="w-full py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                    >
                      <option value="">Sélectionner un groupe</option>
                      {groupes.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nom} ({g.jour} {g.heure})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Si Enfant : Choix du Parent */}
                {newEleveType === 'enfant' ? (
                  <div className="p-3.5 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C] space-y-3">
                    <label className="text-xs font-extrabold text-[#1B2A7A] block">
                      Compte Parent référent :
                    </label>

                    <div className="flex gap-2 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                        <input
                          type="radio"
                          name="parentMode"
                          checked={parentChoiceMode === 'new'}
                          onChange={() => setParentChoiceMode('new')}
                        />
                        <span>Créer un nouveau parent</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                        <input
                          type="radio"
                          name="parentMode"
                          checked={parentChoiceMode === 'existing'}
                          onChange={() => setParentChoiceMode('existing')}
                        />
                        <span>Choisir un parent existant</span>
                      </label>
                    </div>

                    {parentChoiceMode === 'new' ? (
                      <div className="space-y-2 pt-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            required
                            value={newParentPrenom}
                            onChange={(e) => setNewParentPrenom(e.target.value)}
                            placeholder="Prénom du parent *"
                            className="py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                          />
                          <input
                            type="text"
                            value={newParentNom}
                            onChange={(e) => setNewParentNom(e.target.value)}
                            placeholder="Nom du parent"
                            className="py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="email"
                            required
                            value={newParentEmail}
                            onChange={(e) => setNewParentEmail(e.target.value)}
                            placeholder="Email du parent *"
                            className="py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                          />
                          <input
                            type="tel"
                            value={newParentTel}
                            onChange={(e) => setNewParentTel(e.target.value)}
                            placeholder="Téléphone"
                            className="py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                          />
                        </div>
                      </div>
                    ) : (
                      <select
                        value={selectedParentId}
                        onChange={(e) => setSelectedParentId(e.target.value)}
                        className="w-full py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                      >
                        <option value="">Sélectionnez un parent dans la liste</option>
                        {parentsProfiles.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.prenom} {p.nom} ({p.telephone || 'Sans tél'})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  /* Si Adulte : compte élève */
                  <div className="p-3.5 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C] space-y-2">
                    <label className="text-xs font-extrabold text-[#1B2A7A] block">
                      Accès plateforme de l'élève adulte :
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="email"
                        required
                        value={newAdulteEmail}
                        onChange={(e) => setNewAdulteEmail(e.target.value)}
                        placeholder="Adresse email de l'élève *"
                        className="py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                      />
                      <input
                        type="tel"
                        value={newAdulteTel}
                        onChange={(e) => setNewAdulteTel(e.target.value)}
                        placeholder="Téléphone portable"
                        className="py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={addEleveLoading}
                  className="btn-pill-sun w-full min-h-[48px] !text-sm disabled:opacity-50"
                >
                  <span>{addEleveLoading ? 'Création en cours...' : 'Valider l\'inscription de l\'élève'}</span>
                </button>
              </form>
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

              <button type="submit" className="btn-pill-sun w-full min-h-[44px] !text-xs mt-2">
                Enregistrer le groupe
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL : CRÉER SÉANCE
      ───────────────────────────────────────────────────────────────────── */}
      {isAddSeanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A7A]/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm cloud-card p-6 border-4 border-white shadow-cloud-pop space-y-4">
            <h3 className="font-black text-lg text-[#1B2A7A]">Créer une séance</h3>
            <form onSubmit={handleAddSeance} className="space-y-3 font-baloo">
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#1B2A7A]">Date de la séance *</label>
                <input
                  type="date"
                  required
                  value={seanceDate}
                  onChange={(e) => setSeanceDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-extrabold text-[#1B2A7A]">Thème / Leçon abordée :</label>
                <input
                  type="text"
                  value={seanceTheme}
                  onChange={(e) => setSeanceTheme(e.target.value)}
                  placeholder="Ex: Récitation Leçon 4"
                  className="w-full py-2 px-3 rounded-full bg-white border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] min-h-[44px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSeanceModalOpen(false)}
                  className="flex-1 btn-pill-white !min-h-[40px] !text-xs"
                >
                  Annuler
                </button>
                <button type="submit" className="flex-1 btn-pill-sun !min-h-[40px] !text-xs">
                  Valider
                </button>
              </div>
            </form>
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
    </div>
  );
};
