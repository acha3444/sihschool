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
  DevoirRendu,
  Appreciation,
  Annonce,
  PresenceStatut,
} from '../../types/database';
import { AudioPlayer } from '../../components/common/AudioPlayer';
import { AudioRecorder } from '../../components/common/AudioRecorder';
import { InscriptionsPanel } from '../../components/common/InscriptionsPanel';
import {
  Calendar,
  Users,
  Layers,
  Megaphone,
  Plus,
  Search,
  Check,
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  Video,
  FileText,
  Award,
  RefreshCw,
  ExternalLink,
  Trash2,
  BookOpen,
  Send,
  BookCheck,
  Edit2,
  UserCheck,
  UserPlus,
} from 'lucide-react';

type ProfTab = 'devoirs' | 'inscriptions' | 'groupes' | 'annonces';

export const ProfDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfTab>('devoirs');
  const [loading, setLoading] = useState(true);

  // Données de l'enseignante et globales
  const [mesGroupes, setMesGroupes] = useState<Groupe[]>([]);
  const [tousLesGroupes, setTousLesGroupes] = useState<Groupe[]>([]);
  const [profsProfiles, setProfsProfiles] = useState<Profile[]>([]);
  const [mesEleves, setMesEleves] = useState<Eleve[]>([]);
  const [tousLesEleves, setTousLesEleves] = useState<Eleve[]>([]);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [progressions, setProgressions] = useState<Progression[]>([]);
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);
  const [rendus, setRendus] = useState<DevoirRendu[]>([]);

  // Filtres
  const todayDate = new Date().toISOString().split('T')[0];
  const [selectedSeanceForAppel, setSelectedSeanceForAppel] = useState<string | null>(null);
  const [selectedDevoirForRendus, setSelectedDevoirForRendus] = useState<string | null>(null);
  const [filterGroupeId, setFilterGroupeId] = useState<string>('all');
  const [searchEleve, setSearchEleve] = useState('');
  const [selectedEleveDetail, setSelectedEleveDetail] = useState<Eleve | null>(null);
  const [groupesViewFilter, setGroupesViewFilter] = useState<'mes_groupes' | 'tous' | 'a_pourvoir'>('mes_groupes');

  // Correction devoirs
  const [correctionStatut, setCorrectionStatut] = useState<Record<string, 'valide' | 'a_reviser'>>({});
  const [correctionCommentaire, setCorrectionCommentaire] = useState<Record<string, string>>({});
  const [savingCorrectionId, setSavingCorrectionId] = useState<string | null>(null);

  // Progression modifiable
  const [editProgLecon, setEditProgLecon] = useState<number>(1);
  const [editProgCommentaire, setEditProgCommentaire] = useState<string>('');
  const [progSaveSuccess, setProgSaveSuccess] = useState(false);

  // Nouvelle appréciation
  const currentMonthStr = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const [newApprecPeriode, setNewApprecPeriode] = useState<string>(currentMonthStr);
  const [newApprecTexte, setNewApprecTexte] = useState<string>('');
  const [apprecSaveSuccess, setApprecSaveSuccess] = useState(false);

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
  const [devoirAudioConsigne, setDevoirAudioConsigne] = useState('');
  const [devoirDateLimite, setDevoirDateLimite] = useState('');

  // Modal Annonce pour Groupe
  const [isAddAnnonceModalOpen, setIsAddAnnonceModalOpen] = useState(false);
  const [annonceGroupeId, setAnnonceGroupeId] = useState('');
  const [annonceTitre, setAnnonceTitre] = useState('');
  const [annonceTexte, setAnnonceTexte] = useState('');

  // Modal Créer / Modifier Groupe (Autonomie Enseignante)
  const [isGroupeModalOpen, setIsGroupeModalOpen] = useState(false);
  const [editingGroupeId, setEditingGroupeId] = useState<string | null>(null);
  const [groupeNom, setGroupeNom] = useState('');
  const [groupeFormation, setGroupeFormation] = useState<'nourania' | 'litteraire' | 'eveil'>('nourania');
  const [groupeJour, setGroupeJour] = useState('Mercredi');
  const [groupeHeure, setGroupeHeure] = useState('14:00 - 15:30');
  const [groupeLienZoom, setGroupeLienZoom] = useState('');
  const [groupeAutoAssign, setGroupeAutoAssign] = useState(true);

  const loadProfData = async () => {
    if (!profile?.id) return;
    setLoading(true);

    try {
      // 1. Récupérer TOUS les groupes (avec profil de l'enseignante assignée)
      const { data: groupesData, error: grpError } = await supabase
        .from('groupes')
        .select('*, prof:profiles!groupes_prof_id_fkey(*)')
        .order('nom');

      if (grpError) console.error('Erreur chargement groupes:', grpError);
      const allGrps = (groupesData as Groupe[]) || [];
      setTousLesGroupes(allGrps);

      // La direction voit tous les groupes depuis l'espace devoirs
      const myGrps = profile.role === 'admin' ? allGrps : allGrps.filter((g) => g.prof_id === profile.id);
      setMesGroupes(myGrps);
      const myGroupeIds = myGrps.map((g) => g.id);

      // Définir les groupes par défaut pour les modals
      if (myGroupeIds.length > 0) {
        if (!seanceGroupeId || !myGroupeIds.includes(seanceGroupeId)) setSeanceGroupeId(myGroupeIds[0]);
        if (!devoirGroupeId || !myGroupeIds.includes(devoirGroupeId)) setDevoirGroupeId(myGroupeIds[0]);
        if (!annonceGroupeId || !myGroupeIds.includes(annonceGroupeId)) setAnnonceGroupeId(myGroupeIds[0]);
      } else if (allGrps.length > 0) {
        if (!seanceGroupeId) setSeanceGroupeId(allGrps[0].id);
        if (!devoirGroupeId) setDevoirGroupeId(allGrps[0].id);
        if (!annonceGroupeId) setAnnonceGroupeId(allGrps[0].id);
      }

      // 2. Profils de toutes les enseignantes
      const { data: profsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'prof');
      setProfsProfiles((profsData as Profile[]) || []);

      // 3. Récupérer tous les élèves
      const { data: elevesData } = await supabase
        .from('eleves')
        .select('*, parent:profiles!eleves_parent_id_fkey(*), groupe:groupes(*)')
        .order('nom');
      const allEls = (elevesData as Eleve[]) || [];
      setTousLesEleves(allEls);
      const myEls = allEls.filter((e) => e.groupe_id && myGroupeIds.includes(e.groupe_id));
      setMesEleves(myEls);

      // 4. Séances
      const { data: seancesData } = await supabase
        .from('seances')
        .select('*, groupe:groupes(*)')
        .order('date', { ascending: false });
      setSeances((seancesData as Seance[]) || []);

      // 5. Présences
      const { data: presencesData } = await supabase
        .from('presences')
        .select('*');
      setPresences((presencesData as Presence[]) || []);

      // 6. Progressions des élèves
      const { data: progData } = await supabase
        .from('progressions')
        .select('*');
      setProgressions((progData as Progression[]) || []);

      // 7. Appréciations
      const { data: apprecData } = await supabase
        .from('appreciations')
        .select('*')
        .order('periode', { ascending: false });
      setAppreciations((apprecData as Appreciation[]) || []);

      // 8. Devoirs
      const { data: devoirsData } = await supabase
        .from('devoirs')
        .select('*, groupe:groupes(*)')
        .order('created_at', { ascending: false });
      setDevoirs((devoirsData as Devoir[]) || []);

      // 9. Récitations / devoirs rendus
      const { data: rendusData } = await supabase
        .from('devoir_rendus')
        .select('*, eleve:eleves(*), devoir:devoirs(*)')
        .order('created_at', { ascending: false });
      setRendus((rendusData as DevoirRendu[]) || []);

      // 10. Annonces
      const { data: annoncesData } = await supabase
        .from('annonces')
        .select('*, groupe:groupes(*)')
        .order('publiee_le', { ascending: false });
      setAnnonces((annoncesData as Annonce[]) || []);
    } catch (err) {
      console.error('Erreur chargement données enseignante:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfData();
  }, [profile?.id]);

  // Synchronisation sélection élève
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

  // Pointage présence en 1 clic
  const handleUpdatePresence = async (
    seanceId: string,
    eleveId: string,
    statut: PresenceStatut
  ) => {
    try {
      const existing = presences.find((p) => p.seance_id === seanceId && p.eleve_id === eleveId);
      if (existing) {
        const { error } = await supabase
          .from('presences')
          .update({ statut })
          .eq('id', existing.id);
        if (error) throw error;
        setPresences((prev) => prev.map((p) => (p.id === existing.id ? { ...p, statut } : p)));
      } else {
        const { data, error } = await supabase
          .from('presences')
          .insert({ seance_id: seanceId, eleve_id: eleveId, statut })
          .select()
          .single();
        if (error) throw error;
        if (data) setPresences((prev) => [...prev, data as Presence]);
      }
    } catch (err: any) {
      alert('Impossible d\'enregistrer la présence : ' + err.message);
    }
  };

  // Enregistrer la progression Nourania
  const handleSaveProgression = async () => {
    if (!selectedEleveDetail) return;
    try {
      const existing = progressions.find((p) => p.eleve_id === selectedEleveDetail.id);
      if (existing) {
        const { data, error } = await supabase
          .from('progressions')
          .update({
            lecon_actuelle: editProgLecon,
            commentaire: editProgCommentaire,
            mis_a_jour_le: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setProgressions((prev) => prev.map((p) => (p.id === existing.id ? (data as Progression) : p)));
        }
      } else {
        const { data, error } = await supabase
          .from('progressions')
          .insert({
            eleve_id: selectedEleveDetail.id,
            formation: selectedEleveDetail.groupe?.formation || 'nourania',
            lecon_actuelle: editProgLecon,
            commentaire: editProgCommentaire,
          })
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setProgressions((prev) => [...prev, data as Progression]);
        }
      }
      setProgSaveSuccess(true);
      setTimeout(() => setProgSaveSuccess(false), 2500);
    } catch (err: any) {
      alert('Erreur enregistrement progression : ' + err.message);
    }
  };

  // Ajouter une appréciation
  const handleAddAppreciation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEleveDetail || !newApprecTexte.trim()) return;
    try {
      const { data, error } = await supabase
        .from('appreciations')
        .insert({
          eleve_id: selectedEleveDetail.id,
          periode: newApprecPeriode,
          texte: newApprecTexte.trim(),
        })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setAppreciations((prev) => [data as Appreciation, ...prev]);
        setNewApprecTexte('');
        setApprecSaveSuccess(true);
        setTimeout(() => setApprecSaveSuccess(false), 2500);
      }
    } catch (err: any) {
      alert('Erreur ajout appréciation : ' + err.message);
    }
  };

  // Créer une séance
  const handleCreateSeance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!seanceGroupeId) return;
    try {
      const { data, error } = await supabase
        .from('seances')
        .insert({
          groupe_id: seanceGroupeId,
          date: seanceDate,
          theme: seanceTheme || null,
        })
        .select('*, groupe:groupes(*)')
        .single();
      if (error) throw error;
      if (data) {
        setSeances((prev) => [data as Seance, ...prev]);
        setIsAddSeanceModalOpen(false);
        setSeanceTheme('');
      }
    } catch (err: any) {
      alert('Erreur création séance : ' + err.message);
    }
  };

  // Supprimer une séance
  const handleDeleteSeance = async (seanceId: string) => {
    if (!confirm('Êtes-vous sûre de vouloir supprimer cette séance ?')) return;
    try {
      const { error } = await supabase.from('seances').delete().eq('id', seanceId);
      if (error) throw error;
      setSeances((prev) => prev.filter((s) => s.id !== seanceId));
      if (selectedSeanceForAppel === seanceId) setSelectedSeanceForAppel(null);
    } catch (err: any) {
      alert('Erreur suppression séance : ' + err.message);
    }
  };

  // Créer un devoir
  const handleCreateDevoir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoirGroupeId || !devoirTitre || !devoirConsigne) return;
    try {
      const { data, error } = await supabase
        .from('devoirs')
        .insert({
          groupe_id: devoirGroupeId,
          titre: devoirTitre.trim(),
          consigne: devoirConsigne.trim(),
          audio_consigne: devoirAudioConsigne || null,
          date_limite: devoirDateLimite || null,
        })
        .select('*, groupe:groupes(*)')
        .single();
      if (error) throw error;
      if (data) {
        setDevoirs((prev) => [data as Devoir, ...prev]);
        setIsAddDevoirModalOpen(false);
        setDevoirTitre('');
        setDevoirConsigne('');
        setDevoirAudioConsigne('');
        setDevoirDateLimite('');
      }
    } catch (err: any) {
      alert('Erreur ajout devoir : ' + err.message);
    }
  };

  // Corriger un devoir rendu par un élève
  const handleSaveCorrection = async (renduId: string) => {
    const statut = correctionStatut[renduId] || 'valide';
    const commentaire = correctionCommentaire[renduId] || '';
    setSavingCorrectionId(renduId);
    try {
      const { data, error } = await supabase
        .from('devoir_rendus')
        .update({
          statut,
          commentaire_prof: commentaire.trim() || null,
          corrige_le: new Date().toISOString(),
        })
        .eq('id', renduId)
        .select('*, eleve:eleves(*), devoir:devoirs(*)')
        .single();

      if (error) throw error;
      if (data) {
        setRendus((prev) => prev.map((r) => (r.id === renduId ? (data as DevoirRendu) : r)));
        alert('Correction et retour bien enregistrés pour cet élève !');
      }
    } catch (err: any) {
      alert('Erreur enregistrement correction : ' + err.message);
    } finally {
      setSavingCorrectionId(null);
    }
  };

  // Supprimer un devoir (avec suppression en cascade des rendus associés)
  const handleDeleteDevoir = async (devoirId: string) => {
    if (!confirm('Êtes-vous sûre de vouloir supprimer ce devoir ? Cette action est irréversible.')) return;
    try {
      // 1. Supprimer les rendus associés pour garantir la conformité des clés étrangères
      const { error: rendusError } = await supabase.from('devoir_rendus').delete().eq('devoir_id', devoirId);
      if (rendusError) console.warn('Avertissement suppression rendus:', rendusError);

      // 2. Supprimer le devoir
      const { error } = await supabase.from('devoirs').delete().eq('id', devoirId);
      if (error) throw error;

      setDevoirs((prev) => prev.filter((d) => d.id !== devoirId));
      setRendus((prev) => prev.filter((r) => r.devoir_id !== devoirId));
      if (selectedDevoirForRendus === devoirId) {
        setSelectedDevoirForRendus(null);
      }
      alert('Le devoir a été supprimé avec succès !');
    } catch (err: any) {
      console.error('Erreur suppression devoir:', err);
      alert('Erreur suppression devoir : ' + (err.message || 'Impossible de supprimer ce devoir.'));
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // GESTION AUTONOME DES GROUPES PAR LE PROFESSEUR
  // ─────────────────────────────────────────────────────────────────────────────

  // S'attribuer un groupe en 1 clic
  const handleAssignGroup = async (groupeId: string) => {
    if (!profile?.id) return;
    try {
      const { error } = await supabase
        .from('groupes')
        .update({ prof_id: profile.id })
        .eq('id', groupeId);
      if (error) throw error;
      await loadProfData();
      alert('Félicitations ! Vous avez pris en charge cette classe avec succès 🌸');
    } catch (err: any) {
      alert('Erreur lors de l\'attribution du groupe : ' + err.message);
    }
  };

  // Se désattribuer d'un groupe en 1 clic
  const handleUnassignGroup = async (groupeId: string) => {
    if (!confirm('Voulez-vous retirer cette classe de vos groupes en charge ?')) return;
    try {
      const { error } = await supabase
        .from('groupes')
        .update({ prof_id: null })
        .eq('id', groupeId);
      if (error) throw error;
      await loadProfData();
    } catch (err: any) {
      alert('Erreur lors de la désattribution : ' + err.message);
    }
  };

  // Ouvrir modal création groupe
  const handleOpenCreateGroupeModal = () => {
    setEditingGroupeId(null);
    setGroupeNom('');
    setGroupeFormation('nourania');
    setGroupeJour('Mercredi');
    setGroupeHeure('14:00 - 15:30');
    setGroupeLienZoom('');
    setGroupeAutoAssign(true);
    setIsGroupeModalOpen(true);
  };

  // Ouvrir modal modification groupe
  const handleOpenEditGroupeModal = (grp: Groupe) => {
    setEditingGroupeId(grp.id);
    setGroupeNom(grp.nom);
    setGroupeFormation(grp.formation);
    setGroupeJour(grp.jour);
    setGroupeHeure(grp.heure);
    setGroupeLienZoom(grp.lien_zoom || '');
    setGroupeAutoAssign(grp.prof_id === profile?.id);
    setIsGroupeModalOpen(true);
  };

  // Enregistrer création ou modification de groupe
  const handleSaveGroupe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupeNom.trim()) return;

    try {
      if (editingGroupeId) {
        const { error } = await supabase
          .from('groupes')
          .update({
            nom: groupeNom.trim(),
            formation: groupeFormation,
            jour: groupeJour,
            heure: groupeHeure,
            lien_zoom: groupeLienZoom.trim() || null,
            prof_id: groupeAutoAssign ? profile?.id : null,
          })
          .eq('id', editingGroupeId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('groupes')
          .insert({
            nom: groupeNom.trim(),
            formation: groupeFormation,
            jour: groupeJour,
            heure: groupeHeure,
            lien_zoom: groupeLienZoom.trim() || null,
            prof_id: groupeAutoAssign ? profile?.id : null,
          });
        if (error) throw error;
      }

      setIsGroupeModalOpen(false);
      setEditingGroupeId(null);
      await loadProfData();
    } catch (err: any) {
      alert('Erreur enregistrement groupe : ' + err.message);
    }
  };

  // Supprimer un groupe
  const handleDeleteGroupe = async (groupeId: string) => {
    if (!confirm('Êtes-vous sûre de vouloir supprimer définitivement ce groupe ? Les séances et devoirs liés seront également supprimés.')) {
      return;
    }
    try {
      const { error } = await supabase.from('groupes').delete().eq('id', groupeId);
      if (error) throw error;
      await loadProfData();
    } catch (err: any) {
      alert('Erreur suppression groupe : ' + err.message);
    }
  };

  // Publier une annonce
  const handleCreateAnnonce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annonceTitre.trim() || !annonceTexte.trim()) return;
    try {
      const { data, error } = await supabase
        .from('annonces')
        .insert({
          titre: annonceTitre.trim(),
          texte: annonceTexte.trim(),
          groupe_id: annonceGroupeId || null,
        })
        .select('*, groupe:groupes(*)')
        .single();
      if (error) throw error;
      if (data) {
        setAnnonces((prev) => [data as Annonce, ...prev]);
        setIsAddAnnonceModalOpen(false);
        setAnnonceTitre('');
        setAnnonceTexte('');
      }
    } catch (err: any) {
      alert('Erreur publication annonce : ' + err.message);
    }
  };

  // Séances du jour
  const seancesDuJour = seances.filter((s) =>
    s.date === todayDate && (mesGroupes.length > 0 ? mesGroupes.some((g) => g.id === s.groupe_id) : true)
  );

  // Séances filtrées
  const filteredSeances = seances.filter((s) => {
    if (filterGroupeId === 'all') {
      return mesGroupes.length > 0 ? mesGroupes.some((g) => g.id === s.groupe_id) : true;
    }
    return s.groupe_id === filterGroupeId;
  });

  // Devoirs filtrés
  const filteredDevoirs = devoirs.filter((d) => {
    if (filterGroupeId === 'all') {
      return mesGroupes.length > 0 ? mesGroupes.some((g) => g.id === d.groupe_id) : true;
    }
    return d.groupe_id === filterGroupeId;
  });

  // Groupes sans prof (à pourvoir)
  const groupesSansProf = tousLesGroupes.filter((g) => !g.prof_id);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#1B2A7A]">
        <RefreshCw className="w-10 h-10 animate-spin mb-3 text-[#1B2A7A]" />
        <p className="text-base font-bold">Chargement de votre espace enseignante...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* ─────────────────────────────────────────────────────────────────────
          HEADER ENSEIGNANTE & ACTIONS RAPIDES
      ───────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="badge-lavender text-xs font-black uppercase flex items-center gap-1.5 py-1 px-3">
              <BookOpen className="w-3.5 h-3.5" />
              Espace Enseignante
            </span>
            <span className="text-xs font-bold text-[#4A5487]">
              {mesGroupes.length} groupe(s) en charge · {mesEleves.length} élève(s) · {tousLesGroupes.length} classe(s) totale(s)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A7A]">
            Bonjour {profile?.prenom || 'Professeure'} 🌸
          </h1>
          <p className="text-sm text-[#4A5487] font-semibold">
            Donnez les devoirs (texte ou vocal), inscrivez les élèves et partagez les liens Zoom.
          </p>
        </div>

        {/* Boutons d'action rapide */}
        <div className="flex flex-wrap items-center gap-2">
          {mesGroupes.length > 0 && (
            <>
              <button
                onClick={() => {
                  setDevoirGroupeId(mesGroupes[0].id);
                  setIsAddDevoirModalOpen(true);
                }}
                className="btn-pill-sun text-xs sm:text-sm !min-h-[44px] flex items-center gap-2 shadow-sm font-black"
              >
                <Plus className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                <span>+ Donner un devoir</span>
              </button>
            </>
          )}

          <button
            onClick={handleOpenCreateGroupeModal}
            className="btn-pill-white text-xs sm:text-sm !min-h-[44px] flex items-center gap-2 border border-[#CDBDF2] shadow-xs font-black"
          >
            <Plus className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
            <span>+ Créer une classe</span>
          </button>
        </div>
      </div>

      {/* Alerte si aucun groupe n'est encore assigné */}
      {mesGroupes.length === 0 && (
        <div className="cloud-card p-6 bg-gradient-to-r from-[#FFF6E3] to-white border-2 border-[#FFE15C] space-y-3">
          <div className="flex items-center gap-2 text-[#854D0E] font-black text-base">
            <AlertCircle className="w-5 h-5 text-[#854D0E]" />
            <span>Vous n'avez pas encore de groupe en charge</span>
          </div>
          <p className="text-xs sm:text-sm text-[#4A5487] font-medium leading-relaxed">
            Vous disposez des mêmes droits que l'administration pour gérer l'école : vous pouvez vous attribuer une classe existante en 1 clic ou créer votre propre groupe dès maintenant !
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => {
                setActiveTab('groupes');
                setGroupesViewFilter('a_pourvoir');
              }}
              className="btn-pill-sun text-xs font-black flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Voir les groupes disponibles ({groupesSansProf.length})</span>
            </button>
            <button
              onClick={handleOpenCreateGroupeModal}
              className="btn-pill-white text-xs font-black flex items-center gap-1.5 border border-[#CDBDF2]"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une nouvelle classe</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          NAVIGATION ONGLETS
      ───────────────────────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'devoirs', label: 'Devoirs', icon: BookCheck, badge: filteredDevoirs.length },
          { id: 'inscriptions', label: 'Élèves & comptes', icon: Users, badge: tousLesEleves.length },
          { id: 'groupes', label: 'Groupes & Zoom', icon: Layers, badge: tousLesGroupes.length },
          { id: 'annonces', label: 'Annonces', icon: Megaphone, badge: annonces.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ProfTab)}
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

      {/* ─────────────────────────────────────────────────────────────────────
          3. ONGLET : DEVOIRS DONNÉS & NOUVEAUX DEVOIRS
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'devoirs' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#1B2A7A]">Devoirs & Exercices</h2>
              <p className="text-xs text-[#4A5487] font-semibold">
                Donnez des devoirs à vos groupes avec les consignes et la date limite de réalisation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {tousLesGroupes.length > 1 && (
                <select
                  value={filterGroupeId}
                  onChange={(e) => setFilterGroupeId(e.target.value)}
                  className="min-h-[40px] px-3 py-1.5 rounded-full border border-[#CDBDF2] bg-white text-xs font-bold text-[#1B2A7A]"
                >
                  <option value="all">Toutes mes classes</option>
                  {tousLesGroupes.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nom} {g.prof_id === profile?.id ? '(Ma classe)' : ''}
                    </option>
                  ))}
                </select>
              )}

              {tousLesGroupes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setDevoirGroupeId(mesGroupes[0]?.id || tousLesGroupes[0]?.id);
                    setIsAddDevoirModalOpen(true);
                  }}
                  className="btn-pill-sun text-xs !min-h-[40px] flex items-center gap-1.5 font-black"
                >
                  <Plus className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                  <span>+ Donner un devoir</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDevoirs.map((devoir) => {
              const grp = tousLesGroupes.find((g) => g.id === devoir.groupe_id);
              const isPast = devoir.date_limite ? devoir.date_limite < todayDate : false;
              const rendusDuDevoir = rendus.filter((r) => r.devoir_id === devoir.id);
              const elevesDuGroupe = tousLesEleves.filter((e) => e.groupe_id === devoir.groupe_id);
              const isRendusOpen = selectedDevoirForRendus === devoir.id;

              return (
                <div
                  key={devoir.id}
                  className="cloud-card p-5 border-2 border-white shadow-soft-blue flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-[#1B2A7A] bg-[#FFF6E3] px-2.5 py-0.5 rounded-full border border-[#FFE15C]">
                          {devoir.groupe?.nom || grp?.nom || 'Groupe'}
                        </span>

                        {devoir.date_limite && (
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              isPast
                                ? 'bg-gray-100 text-gray-500'
                                : 'bg-[#EAFBF1] text-[#1E7E44] border border-[#1E7E44]/20'
                            }`}
                          >
                            {isPast ? 'Terminé' : `Pour le ${new Date(devoir.date_limite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`}
                          </span>
                        )}
                      </div>

                      {/* Bouton de suppression bien visible */}
                      <button
                        type="button"
                        onClick={() => handleDeleteDevoir(devoir.id)}
                        title="Supprimer ce devoir"
                        className="px-2.5 py-1 rounded-xl text-red-600 hover:text-white hover:bg-red-600 border border-red-200 transition-all flex items-center gap-1.5 text-xs font-bold shadow-2xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>

                    <h3 className="text-base font-black text-[#1B2A7A] leading-snug">
                      {devoir.titre}
                    </h3>

                    <div className="p-3 rounded-xl bg-white border border-[#CDBDF2]/40 text-xs text-[#4A5487] font-medium whitespace-pre-line leading-relaxed">
                      {devoir.consigne}
                    </div>

                    {/* Modèle de consigne vocale de la prof si présente */}
                    {devoir.audio_consigne && (
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-[#1B2A7A]">
                          Votre consigne vocale :
                        </span>
                        <AudioPlayer
                          src={devoir.audio_consigne}
                          label="Modèle audio"
                          className="!p-2 bg-[#FFF6E3] border-[#FFE15C]"
                        />
                      </div>
                    )}

                    {/* Bouton pour afficher les récitations reçues */}
                    <button
                      type="button"
                      onClick={() => setSelectedDevoirForRendus(isRendusOpen ? null : devoir.id)}
                      className={`w-full py-2.5 px-4 rounded-2xl text-xs font-black transition-all flex items-center justify-between shadow-xs ${
                        isRendusOpen
                          ? 'bg-[#1B2A7A] text-white'
                          : 'bg-[#FFF6E3] hover:bg-[#FFEEC2] text-[#1B2A7A] border border-[#FFE15C]'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <BookCheck className="w-4 h-4" />
                        <span>Récitations des élèves</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white text-[#1B2A7A] text-[10px] font-extrabold">
                        {rendusDuDevoir.length} / {elevesDuGroupe.length} reçue(s)
                      </span>
                    </button>

                    {/* Panneau dépliable des récitations d'élèves */}
                    {isRendusOpen && (
                      <div className="pt-2 border-t border-[#CDBDF2]/40 space-y-3">
                        <h4 className="text-xs font-black text-[#1B2A7A] uppercase tracking-wide">
                          Écoute & Correction des élèves ({elevesDuGroupe.length}) :
                        </h4>

                        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                          {elevesDuGroupe.map((el) => {
                            const rendu = rendusDuDevoir.find((r) => r.eleve_id === el.id);

                            return (
                              <div
                                key={el.id}
                                className="p-3 rounded-2xl bg-white border border-[#CDBDF2]/60 space-y-2 shadow-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-xs text-[#1B2A7A]">
                                    {el.prenom} {el.nom}
                                  </span>

                                  {rendu ? (
                                    <span
                                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        rendu.statut === 'valide'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : rendu.statut === 'a_reviser'
                                          ? 'bg-amber-100 text-amber-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}
                                    >
                                      {rendu.statut === 'valide'
                                        ? 'Validé 🌟'
                                        : rendu.statut === 'a_reviser'
                                        ? 'À réviser 🔄'
                                        : 'En attente ⏳'}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] text-gray-400 italic">
                                      Non rendu
                                    </span>
                                  )}
                                </div>

                                {rendu ? (
                                  <div className="space-y-2 pt-1">
                                    {/* Lecteur audio de la note de l'élève */}
                                    <AudioPlayer
                                      src={rendu.audio_url}
                                      label={`Récitation de ${el.prenom}`}
                                      className="!p-2 bg-[#F9FAFB]"
                                    />

                                    {/* Formulaire de correction / retour enseignant */}
                                    <div className="space-y-1.5 pt-1">
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setCorrectionStatut((prev) => ({
                                              ...prev,
                                              [rendu.id]: 'valide',
                                            }))
                                          }
                                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                            (correctionStatut[rendu.id] || rendu.statut) === 'valide'
                                              ? 'bg-[#1E7E44] text-white shadow-xs'
                                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                          }`}
                                        >
                                          Valider 🌟
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            setCorrectionStatut((prev) => ({
                                              ...prev,
                                              [rendu.id]: 'a_reviser',
                                            }))
                                          }
                                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                            (correctionStatut[rendu.id] || rendu.statut) === 'a_reviser'
                                              ? 'bg-[#854D0E] text-white shadow-xs'
                                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                          }`}
                                        >
                                          À réviser 🔄
                                        </button>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <input
                                          type="text"
                                          value={
                                            correctionCommentaire[rendu.id] !== undefined
                                              ? correctionCommentaire[rendu.id]
                                              : rendu.commentaire_prof || ''
                                          }
                                          onChange={(e) =>
                                            setCorrectionCommentaire((prev) => ({
                                              ...prev,
                                              [rendu.id]: e.target.value,
                                            }))
                                          }
                                          placeholder="Remarque pour l'élève (prononciation, encouragements)..."
                                          className="flex-1 min-h-[34px] px-2.5 py-1 rounded-lg border border-[#CDBDF2] text-xs text-[#1B2A7A]"
                                        />

                                        <button
                                          type="button"
                                          onClick={() => handleSaveCorrection(rendu.id)}
                                          disabled={savingCorrectionId === rendu.id}
                                          className="btn-pill-sun text-[10px] font-bold !min-h-[34px] px-3 flex-shrink-0"
                                        >
                                          {savingCorrectionId === rendu.id ? '...' : 'Enregistrer'}
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[11px] text-gray-400 italic">
                                    L'élève n'a pas encore enregistré sa récitation.
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#CDBDF2]/40 flex items-center justify-between text-[11px] text-gray-500">
                    <span>
                      Donné le {new Date(devoir.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteDevoir(devoir.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 font-bold text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer le devoir</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredDevoirs.length === 0 && (
              <div className="col-span-full cloud-card p-12 text-center text-gray-500 space-y-3">
                <BookCheck className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-base font-bold text-[#1B2A7A]">Aucun devoir n'a été donné pour le moment.</p>
                <p className="text-xs text-[#4A5487]">
                  Cliquez sur le bouton ci-dessous pour envoyer votre premier devoir aux élèves.
                </p>
                {tousLesGroupes.length > 0 && (
                  <button
                    onClick={() => {
                      setDevoirGroupeId(mesGroupes[0]?.id || tousLesGroupes[0]?.id);
                      setIsAddDevoirModalOpen(true);
                    }}
                    className="btn-pill-sun text-xs font-black inline-flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Donner un premier devoir</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Élèves & comptes : inscriptions, comptes parents / élèves, mots de passe */}
      {activeTab === 'inscriptions' && <InscriptionsPanel onChange={loadProfData} />}

      {/* ─────────────────────────────────────────────────────────────────────
          5. ONGLET : GESTION DES GROUPES & ATTRIBUTION AUTONOME
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'groupes' && (
        <div className="space-y-6">
          {/* Header de l'onglet avec filtres et bouton Créer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#1B2A7A] flex items-center gap-2">
                <Layers className="w-6 h-6 text-[#1B2A7A]" />
                Gestion & Attribution des Groupes
              </h2>
              <p className="text-xs text-[#4A5487] font-semibold">
                Prenez en charge une classe en 1 clic, créez de nouveaux créneaux ou gérez les paramètres Zoom.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateGroupeModal}
              className="btn-pill-sun text-xs !min-h-[42px] px-4 flex items-center gap-2 font-black shadow-sun-glow"
            >
              <Plus className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
              <span>+ Créer un nouveau groupe</span>
            </button>
          </div>

          {/* Filtres de sous-onglets : Mes groupes, Tous les groupes, À pourvoir */}
          <div className="flex items-center gap-2 border-b border-[#CDBDF2]/40 pb-3 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setGroupesViewFilter('mes_groupes')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
                groupesViewFilter === 'mes_groupes'
                  ? 'bg-[#1B2A7A] text-white shadow-xs'
                  : 'bg-white text-[#4A5487] hover:bg-gray-100 border border-[#CDBDF2]/40'
              }`}
            >
              Mes classes en charge ({mesGroupes.length})
            </button>
            <button
              type="button"
              onClick={() => setGroupesViewFilter('tous')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
                groupesViewFilter === 'tous'
                  ? 'bg-[#1B2A7A] text-white shadow-xs'
                  : 'bg-white text-[#4A5487] hover:bg-gray-100 border border-[#CDBDF2]/40'
              }`}
            >
              Toutes les classes ({tousLesGroupes.length})
            </button>
            <button
              type="button"
              onClick={() => setGroupesViewFilter('a_pourvoir')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all ${
                groupesViewFilter === 'a_pourvoir'
                  ? 'bg-[#1B2A7A] text-white shadow-xs'
                  : 'bg-white text-[#4A5487] hover:bg-gray-100 border border-[#CDBDF2]/40'
              }`}
            >
              Classes disponibles / à pourvoir ({groupesSansProf.length})
            </button>
          </div>

          {/* Grille des cartes de groupes */}
          {(() => {
            const displayedGroupes =
              groupesViewFilter === 'mes_groupes'
                ? mesGroupes
                : groupesViewFilter === 'a_pourvoir'
                ? groupesSansProf
                : tousLesGroupes;

            if (displayedGroupes.length === 0) {
              return (
                <div className="cloud-card p-12 text-center text-gray-500 space-y-3">
                  <Layers className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-base font-bold text-[#1B2A7A]">
                    {groupesViewFilter === 'mes_groupes'
                      ? "Vous n'avez pas encore de classe en charge."
                      : groupesViewFilter === 'a_pourvoir'
                      ? "Toutes les classes ont actuellement un enseignant assigné."
                      : "Aucun groupe n'a été créé pour le moment."}
                  </p>
                  <p className="text-xs text-[#4A5487]">
                    {groupesViewFilter === 'mes_groupes'
                      ? "Vous pouvez vous attribuer une classe existante parmi les groupes disponibles ou créer votre propre groupe."
                      : "Cliquez ci-dessous pour créer une nouvelle classe."}
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-2">
                    {groupesViewFilter === 'mes_groupes' && tousLesGroupes.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setGroupesViewFilter('tous')}
                        className="btn-pill-sun text-xs font-black px-4 py-2"
                      >
                        Voir tous les groupes ({tousLesGroupes.length})
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleOpenCreateGroupeModal}
                      className="btn-pill-white text-xs font-black px-4 py-2 border border-[#CDBDF2]"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1 inline" />
                      Créer un groupe
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedGroupes.map((grp) => {
                  const elevesDuGroupe = tousLesEleves.filter((e) => e.groupe_id === grp.id);
                  const devoirsDuGroupe = devoirs.filter((d) => d.groupe_id === grp.id);
                  const isMyGroup = grp.prof_id === profile?.id;
                  const assignedProf = profsProfiles.find((p) => p.id === grp.prof_id);

                  return (
                    <div
                      key={grp.id}
                      className={`cloud-card p-6 space-y-4 transition-all ${
                        isMyGroup ? 'border-2 border-[#FFE15C] shadow-soft-blue' : 'border border-[#CDBDF2]/50'
                      }`}
                    >
                      {/* En-tête de la carte */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-[11px] font-black uppercase text-[#1B2A7A] bg-[#FFE15C] px-2.5 py-0.5 rounded-full">
                              {grp.formation.toUpperCase()}
                            </span>
                            <span className="text-[11px] font-bold text-[#4A5487] bg-white border border-[#CDBDF2]/60 px-2 py-0.5 rounded-full">
                              {elevesDuGroupe.length} élève(s)
                            </span>
                          </div>
                          <h3 className="text-xl font-black text-[#1B2A7A] mt-1">{grp.nom}</h3>
                          <p className="text-xs text-[#4A5487] font-semibold">
                            📅 {grp.jour} · <strong>{grp.heure}</strong>
                          </p>
                        </div>

                        {/* Actions Rapides Modifier / Supprimer */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditGroupeModal(grp)}
                            title="Modifier ce groupe"
                            className="p-2 text-gray-400 hover:text-[#1B2A7A] hover:bg-white rounded-xl transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteGroupe(grp.id)}
                            title="Supprimer définitivement ce groupe"
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* STATUT D'ATTRIBUTION DU GROUPE (AUTONOMIE ENSEIGNANTE) */}
                      <div className="pt-1">
                        {isMyGroup ? (
                          <div className="p-3 rounded-2xl bg-[#EAFBF1] border border-[#1E7E44]/30 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs font-black text-[#1E7E44]">
                              <UserCheck className="w-4 h-4" />
                              <span>✨ Votre classe (assignée à vous)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleUnassignGroup(grp.id)}
                              className="text-[11px] font-bold text-red-600 hover:text-red-800 hover:underline"
                            >
                              Me désassigner
                            </button>
                          </div>
                        ) : !grp.prof_id ? (
                          <div className="p-3 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="text-xs font-black text-[#854D0E] block">⚠️ Classe disponible (sans enseignant)</span>
                              <span className="text-[11px] text-[#854D0E]/80">Aucun professeur n'est encore assigné à ce groupe.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAssignGroup(grp.id)}
                              className="btn-pill-sun text-xs font-black !min-h-[36px] px-3.5 flex items-center gap-1.5 flex-shrink-0"
                            >
                              <UserPlus className="w-4 h-4" />
                              <span>M'assigner ce groupe</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="text-xs text-gray-600 font-semibold">
                              👩‍🏫 Enseignante : <strong>{assignedProf ? `${assignedProf.prenom} ${assignedProf.nom}` : 'Autre collègue'}</strong>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAssignGroup(grp.id)}
                              className="btn-pill-white text-xs font-bold !min-h-[34px] px-3 border border-[#CDBDF2] flex-shrink-0"
                            >
                              <span>Prendre en charge</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Salle Zoom */}
                      <div className="pt-1">
                        {grp.lien_zoom ? (
                          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                            <div className="flex items-center gap-1.5 text-[#1B2A7A] truncate font-bold">
                              <Video className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <span className="truncate">{grp.lien_zoom}</span>
                            </div>
                            <a
                              href={grp.lien_zoom}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-pill-sun text-[11px] font-black !min-h-[32px] px-2.5 flex items-center gap-1 flex-shrink-0"
                            >
                              <span>Tester Zoom</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-gray-400 italic p-2 bg-gray-50 rounded-xl">
                            <span>Pas de lien Zoom configuré</span>
                            <button
                              type="button"
                              onClick={() => handleOpenEditGroupeModal(grp)}
                              className="text-[11px] text-[#1B2A7A] font-bold hover:underline"
                            >
                              + Ajouter
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Actions rapides sur le groupe */}
                      <div className="pt-2 border-t border-[#CDBDF2]/40 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setDevoirGroupeId(grp.id);
                            setIsAddDevoirModalOpen(true);
                          }}
                          className="btn-pill-white text-xs !min-h-[36px] flex items-center gap-1 border border-[#CDBDF2] font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Donner un devoir</span>
                        </button>
                      </div>

                      {/* Devoirs actifs du groupe avec suppression 1 clic */}
                      {devoirsDuGroupe.length > 0 && (
                        <div className="pt-2 border-t border-[#CDBDF2]/30 space-y-1.5">
                          <span className="text-[10px] font-black text-[#4A5487] uppercase tracking-wide block">
                            Devoirs en cours ({devoirsDuGroupe.length}) :
                          </span>
                          <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                            {devoirsDuGroupe.map((dev) => (
                              <div
                                key={dev.id}
                                className="p-2 rounded-xl bg-white border border-[#CDBDF2]/60 flex items-center justify-between gap-2 shadow-2xs"
                              >
                                <div className="truncate">
                                  <span className="font-bold text-xs text-[#1B2A7A] block truncate">• {dev.titre}</span>
                                  {dev.date_limite && (
                                    <span className="text-[10px] text-gray-500">Pour le {new Date(dev.date_limite).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDevoir(dev.id)}
                                  title="Supprimer ce devoir"
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Élèves inscrits */}
                      <div className="pt-2 border-t border-[#CDBDF2]/30">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-wide mb-2">
                          Élèves inscrits ({elevesDuGroupe.length}) :
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {elevesDuGroupe.map((el) => (
                            <span
                              key={el.id}
                              className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white border border-[#CDBDF2] text-[#1B2A7A]"
                            >
                              {el.prenom} {el.nom}
                            </span>
                          ))}
                          {elevesDuGroupe.length === 0 && (
                            <span className="text-xs text-gray-400 italic">Aucun élève inscrit pour le moment</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          6. ONGLET : ANNONCES
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'annonces' && (
        <div className="cloud-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-[#1B2A7A] flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#1B2A7A]" />
                Annonces & Communications
              </h3>
              <p className="text-xs text-[#4A5487] font-semibold">
                Annonces de la direction et messages adressés à vos groupes.
              </p>
            </div>

            {mesGroupes.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setAnnonceGroupeId(mesGroupes[0].id);
                  setIsAddAnnonceModalOpen(true);
                }}
                className="btn-pill-sun text-xs !min-h-[40px] flex items-center gap-1.5 font-black"
              >
                <Plus className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                <span>+ Publier une annonce</span>
              </button>
            )}
          </div>

          <div className="space-y-3 pt-2">
            {annonces.map((annonce) => (
              <div key={annonce.id} className="p-4 rounded-2xl bg-white border border-[#CDBDF2]/40 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-sm sm:text-base text-[#1B2A7A]">{annonce.titre}</h4>
                  <span className="text-[10px] text-gray-500 font-bold">
                    {new Date(annonce.publiee_le).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">{annonce.texte}</p>
                {annonce.groupe?.nom && (
                  <span className="inline-block text-[10px] font-bold text-[#1B2A7A] bg-[#FFE15C]/60 px-2.5 py-0.5 rounded-full">
                    Groupe concerné : {annonce.groupe.nom}
                  </span>
                )}
              </div>
            ))}
            {annonces.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-6">Aucune annonce pour le moment.</p>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL : AJOUTER UN DEVOIR
      ───────────────────────────────────────────────────────────────────── */}
      {isAddDevoirModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="cloud-card max-w-lg w-full p-6 space-y-4 bg-white border-2 border-[#1B2A7A] shadow-soft-blue">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookCheck className="w-5 h-5 text-[#1B2A7A]" />
                <h3 className="text-lg font-black text-[#1B2A7A]">Donner un devoir au groupe</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddDevoirModalOpen(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700"
              >
                ✕ Fermer
              </button>
            </div>

            <form onSubmit={handleCreateDevoir} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Groupe destinataire *</label>
                <select
                  value={devoirGroupeId}
                  onChange={(e) => setDevoirGroupeId(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A]"
                  required
                >
                  {(mesGroupes.length > 0 ? mesGroupes : tousLesGroupes).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nom} ({g.jour} · {g.heure})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Titre du devoir *</label>
                <input
                  type="text"
                  value={devoirTitre}
                  onChange={(e) => setDevoirTitre(e.target.value)}
                  placeholder="Ex: Exercice Nourania Leçon 3 & Récitation"
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Consignes pour les élèves *</label>
                <textarea
                  value={devoirConsigne}
                  onChange={(e) => setDevoirConsigne(e.target.value)}
                  rows={4}
                  placeholder="Exemple :&#10;1. Relire à voix haute la page 10 trois fois avec un parent.&#10;2. Écrire les 4 lettres composées sur le cahier."
                  className="w-full p-3 rounded-xl border border-[#CDBDF2] text-xs sm:text-sm text-[#1B2A7A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Date limite de réalisation (optionnel)</label>
                <input
                  type="date"
                  value={devoirDateLimite}
                  onChange={(e) => setDevoirDateLimite(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A]"
                />
              </div>

              <div className="space-y-1 pt-1">
                <label className="block text-xs font-bold text-[#1B2A7A]">
                  Consigne vocale ou modèle de prononciation (optionnel) :
                </label>
                <AudioRecorder
                  label="Enregistrer un modèle vocal pour les élèves"
                  onAudioReady={(base64) => setDevoirAudioConsigne(base64)}
                  onReset={() => setDevoirAudioConsigne('')}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddDevoirModalOpen(false)}
                  className="btn-pill-white text-xs !min-h-[40px]"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-pill-sun text-xs !min-h-[40px] font-black">
                  Envoyer le devoir au groupe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL : PUBLIER UNE ANNONCE POUR LE GROUPE
      ───────────────────────────────────────────────────────────────────── */}
      {isAddAnnonceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="cloud-card max-w-md w-full p-6 space-y-4 bg-white border-2 border-[#1B2A7A] shadow-soft-blue">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#1B2A7A]" />
                <h3 className="text-lg font-black text-[#1B2A7A]">Publier un message</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAnnonceModalOpen(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700"
              >
                ✕ Fermer
              </button>
            </div>

            <form onSubmit={handleCreateAnnonce} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Groupe destinataire *</label>
                <select
                  value={annonceGroupeId}
                  onChange={(e) => setAnnonceGroupeId(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A]"
                  required
                >
                  {(mesGroupes.length > 0 ? mesGroupes : tousLesGroupes).map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Titre du message *</label>
                <input
                  type="text"
                  value={annonceTitre}
                  onChange={(e) => setAnnonceTitre(e.target.value)}
                  placeholder="Ex: Rappel matériel pour la séance de samedi"
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Contenu de l'annonce *</label>
                <textarea
                  value={annonceTexte}
                  onChange={(e) => setAnnonceTexte(e.target.value)}
                  rows={4}
                  placeholder="Écrivez votre message pour les parents et élèves..."
                  className="w-full p-3 rounded-xl border border-[#CDBDF2] text-xs sm:text-sm text-[#1B2A7A]"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAnnonceModalOpen(false)}
                  className="btn-pill-white text-xs !min-h-[40px]"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-pill-sun text-xs !min-h-[40px] font-black flex items-center gap-1.5">
                  <Send className="w-4 h-4" />
                  <span>Publier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          MODAL : CRÉER / MODIFIER UN GROUPE (AUTONOMIE ENSEIGNANTE)
      ───────────────────────────────────────────────────────────────────── */}
      {isGroupeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="cloud-card max-w-lg w-full p-6 space-y-4 bg-white border-2 border-[#1B2A7A] shadow-soft-blue">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#1B2A7A]" />
                <h3 className="text-lg font-black text-[#1B2A7A]">
                  {editingGroupeId ? 'Modifier la classe' : 'Créer une nouvelle classe'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsGroupeModalOpen(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700"
              >
                ✕ Fermer
              </button>
            </div>

            <form onSubmit={handleSaveGroupe} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Nom du groupe / classe *</label>
                <input
                  type="text"
                  value={groupeNom}
                  onChange={(e) => setGroupeNom(e.target.value)}
                  placeholder="Ex : Nourania Débutants - Mercredi A"
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Formation *</label>
                  <select
                    value={groupeFormation}
                    onChange={(e) => setGroupeFormation(e.target.value as any)}
                    className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A]"
                  >
                    <option value="nourania">Méthode Nourania</option>
                    <option value="litteraire">Arabe Littéraire</option>
                    <option value="eveil">Éveil 3-5 ans</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Jour du cours *</label>
                  <select
                    value={groupeJour}
                    onChange={(e) => setGroupeJour(e.target.value)}
                    className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A]"
                  >
                    <option value="Lundi">Lundi</option>
                    <option value="Mardi">Mardi</option>
                    <option value="Mercredi">Mercredi</option>
                    <option value="Jeudi">Jeudi</option>
                    <option value="Vendredi">Vendredi</option>
                    <option value="Samedi">Samedi</option>
                    <option value="Dimanche">Dimanche</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Créneau horaire *</label>
                <input
                  type="text"
                  value={groupeHeure}
                  onChange={(e) => setGroupeHeure(e.target.value)}
                  placeholder="Ex : 14:00 - 15:30 ou 18:00 - 19:00"
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Lien de la salle Zoom (optionnel)</label>
                <input
                  type="url"
                  value={groupeLienZoom}
                  onChange={(e) => setGroupeLienZoom(e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-xs text-[#1B2A7A]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#FFF6E3] border border-[#FFE15C] flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="profAutoAssignCheckbox"
                  checked={groupeAutoAssign}
                  onChange={(e) => setGroupeAutoAssign(e.target.checked)}
                  className="w-4 h-4 text-[#1B2A7A] rounded border-gray-300"
                />
                <label htmlFor="profAutoAssignCheckbox" className="text-xs font-bold text-[#1B2A7A] cursor-pointer">
                  M'assigner cette classe en tant qu'enseignante responsable
                </label>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsGroupeModalOpen(false)}
                  className="btn-pill-white text-xs !min-h-[40px] px-4 font-bold border border-gray-200"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-pill-sun text-xs !min-h-[40px] px-5 font-black"
                >
                  {editingGroupeId ? 'Mettre à jour la classe' : 'Créer la classe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
