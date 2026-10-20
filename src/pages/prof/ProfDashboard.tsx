import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
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
} from 'lucide-react';

type ProfTab = 'aujourdhui' | 'seances' | 'devoirs' | 'eleves' | 'groupes' | 'annonces';

export const ProfDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfTab>('aujourdhui');
  const [loading, setLoading] = useState(true);

  // Données de l'enseignante
  const [mesGroupes, setMesGroupes] = useState<Groupe[]>([]);
  const [mesEleves, setMesEleves] = useState<Eleve[]>([]);
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

  const loadProfData = async () => {
    if (!profile?.id) return;
    setLoading(true);

    try {
      // 1. Récupérer les groupes assignés à cette prof
      const { data: groupesData } = await supabase
        .from('groupes')
        .select('*')
        .eq('prof_id', profile.id)
        .order('nom');

      const grps = (groupesData as Groupe[]) || [];
      setMesGroupes(grps);
      const groupeIds = grps.map((g) => g.id);

      if (groupeIds.length > 0) {
        // Définir les groupes par défaut pour les modals
        if (!seanceGroupeId) setSeanceGroupeId(groupeIds[0]);
        if (!devoirGroupeId) setDevoirGroupeId(groupeIds[0]);
        if (!annonceGroupeId) setAnnonceGroupeId(groupeIds[0]);

        // 2. Élèves de ses groupes
        const { data: elevesData } = await supabase
          .from('eleves')
          .select('*, parent:profiles!eleves_parent_id_fkey(*), groupe:groupes(*)')
          .in('groupe_id', groupeIds)
          .order('nom');
        const els = (elevesData as Eleve[]) || [];
        setMesEleves(els);

        const eleveIds = els.map((e) => e.id);

        // 3. Séances de ses groupes
        const { data: seancesData } = await supabase
          .from('seances')
          .select('*, groupe:groupes(*)')
          .in('groupe_id', groupeIds)
          .order('date', { ascending: false });
        setSeances((seancesData as Seance[]) || []);

        // 4. Présences
        const { data: presencesData } = await supabase
          .from('presences')
          .select('*');
        setPresences((presencesData as Presence[]) || []);

        // 5. Progressions des élèves
        if (eleveIds.length > 0) {
          const { data: progData } = await supabase
            .from('progressions')
            .select('*')
            .in('eleve_id', eleveIds);
          setProgressions((progData as Progression[]) || []);

          // 6. Appréciations
          const { data: apprecData } = await supabase
            .from('appreciations')
            .select('*')
            .in('eleve_id', eleveIds)
            .order('periode', { ascending: false });
          setAppreciations((apprecData as Appreciation[]) || []);
        }

        // 7. Devoirs
        const { data: devoirsData } = await supabase
          .from('devoirs')
          .select('*, groupe:groupes(*)')
          .in('groupe_id', groupeIds)
          .order('created_at', { ascending: false });
        setDevoirs((devoirsData as Devoir[]) || []);

        // 8. Récitations et devoirs rendus par les élèves
        if (eleveIds.length > 0) {
          const { data: rendusData } = await supabase
            .from('devoir_rendus')
            .select('*, eleve:eleves(*), devoir:devoirs(*)')
            .in('eleve_id', eleveIds)
            .order('created_at', { ascending: false });
          setRendus((rendusData as DevoirRendu[]) || []);
        }
      } else {
        setMesEleves([]);
        setSeances([]);
        setPresences([]);
        setProgressions([]);
        setDevoirs([]);
        setRendus([]);
        setAppreciations([]);
      }

      // 8. Annonces
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

  // Supprimer un devoir
  const handleDeleteDevoir = async (devoirId: string) => {
    if (!confirm('Êtes-vous sûre de vouloir supprimer ce devoir ?')) return;
    try {
      const { error } = await supabase.from('devoirs').delete().eq('id', devoirId);
      if (error) throw error;
      setDevoirs((prev) => prev.filter((d) => d.id !== devoirId));
    } catch (err: any) {
      alert('Erreur suppression devoir : ' + err.message);
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
  const seancesDuJour = seances.filter((s) => s.date === todayDate);

  // Séances filtrées
  const filteredSeances = seances.filter((s) =>
    filterGroupeId === 'all' ? true : s.groupe_id === filterGroupeId
  );

  // Devoirs filtrés
  const filteredDevoirs = devoirs.filter((d) =>
    filterGroupeId === 'all' ? true : d.groupe_id === filterGroupeId
  );

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
              Espace Pédagogique
            </span>
            <span className="text-xs font-bold text-[#4A5487]">
              {mesGroupes.length} groupe(s) · {mesEleves.length} élève(s)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A7A]">
            Bonjour {profile?.prenom || 'Professeure'} 🌸
          </h1>
          <p className="text-sm text-[#4A5487] font-semibold">
            Gérez vos séances, envoyez vos devoirs et suivez la progression Nourania de vos élèves.
          </p>
        </div>

        {/* Boutons d'action rapide */}
        {mesGroupes.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
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

            <button
              onClick={() => {
                setSeanceGroupeId(mesGroupes[0].id);
                setIsAddSeanceModalOpen(true);
              }}
              className="btn-pill-white text-xs sm:text-sm !min-h-[44px] flex items-center gap-2 border border-[#CDBDF2] shadow-xs font-black"
            >
              <Plus className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
              <span>+ Planifier une séance</span>
            </button>
          </div>
        )}
      </div>

      {/* Alerte si aucun groupe n'est encore assigné */}
      {mesGroupes.length === 0 && (
        <div className="cloud-card p-6 bg-gradient-to-r from-[#FFF6E3] to-white border-2 border-[#FFE15C] space-y-2">
          <div className="flex items-center gap-2 text-[#854D0E] font-black text-base">
            <AlertCircle className="w-5 h-5 text-[#854D0E]" />
            <span>Aucun groupe ne vous est encore attribué</span>
          </div>
          <p className="text-xs sm:text-sm text-[#4A5487] font-medium leading-relaxed">
            Votre compte enseignante est bien actif. L'administratrice (Siham) doit simplement vous assigner vos groupes dans le panneau Admin (onglet <strong>Groupes</strong>). Dès que ce sera fait, vos élèves, vos séances et vos devoirs apparaîtront ici automatiquement !
          </p>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          NAVIGATION ONGLETS
      ───────────────────────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'aujourdhui', label: "Aujourd'hui", icon: Calendar, badge: seancesDuJour.length },
          { id: 'seances', label: 'Séances & Appel', icon: Clock, badge: seances.length },
          { id: 'devoirs', label: 'Devoirs donnés', icon: BookCheck, badge: devoirs.length },
          { id: 'eleves', label: 'Mes Élèves', icon: Users, badge: mesEleves.length },
          { id: 'groupes', label: 'Mes Groupes', icon: Layers, badge: mesGroupes.length },
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
          1. ONGLET : AUJOURD'HUI & APPEL EN 1 CLIC
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'aujourdhui' && (
        <div className="space-y-6">
          {seancesDuJour.length === 0 ? (
            <div className="cloud-card p-8 text-center space-y-4">
              <Calendar className="w-12 h-12 text-[#1B2A7A] mx-auto opacity-50" />
              <h3 className="text-xl font-black text-[#1B2A7A]">Aucune séance prévue aujourd'hui</h3>
              <p className="text-sm text-[#4A5487] font-semibold">
                Vous n'avez pas de séance enregistrée à la date d'aujourd'hui ({todayDate}).
              </p>
              {mesGroupes.length > 0 && (
                <button
                  onClick={() => {
                    setSeanceGroupeId(mesGroupes[0].id);
                    setSeanceDate(todayDate);
                    setIsAddSeanceModalOpen(true);
                  }}
                  className="btn-pill-sun text-xs font-black"
                >
                  <Plus className="w-4 h-4 mr-1 inline" />
                  Programmer une séance pour aujourd'hui
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {seancesDuJour.map((seance) => {
                const grp = mesGroupes.find((g) => g.id === seance.groupe_id);
                const elevesGroupe = mesEleves.filter((e) => e.groupe_id === seance.groupe_id);
                const isAppelOpen = selectedSeanceForAppel === seance.id;

                const presencesSeance = presences.filter((p) => p.seance_id === seance.id);
                const presentsCount = presencesSeance.filter((p) => p.statut === 'present').length;
                const absentsCount = presencesSeance.filter((p) => p.statut === 'absent').length;

                return (
                  <div key={seance.id} className="cloud-card p-6 border-2 border-[#FFE15C] space-y-4 shadow-soft-blue">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#FFE15C] text-[#1B2A7A] uppercase mb-2">
                          Séance d'aujourd'hui
                        </div>
                        <h3 className="text-xl font-black text-[#1B2A7A]">
                          {grp?.nom} ({grp?.formation.toUpperCase()})
                        </h3>
                        <p className="text-xs text-[#4A5487] font-semibold">
                          Horaire : <strong>{grp?.heure}</strong>
                          {seance.theme && ` · Thème : ${seance.theme}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 font-bold">
                          Appel : <span className="text-[#1E7E44]">{presentsCount} présent(s)</span> · <span className="text-[#9B1C1C]">{absentsCount} absent(s)</span> sur {elevesGroupe.length} élèves
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {grp?.lien_zoom && (
                          <a
                            href={grp.lien_zoom}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-pill-white text-xs !min-h-[40px] flex items-center gap-1.5 border border-[#CDBDF2]"
                          >
                            <Video className="w-4 h-4 text-[#1B2A7A]" />
                            <span>Lancer Zoom</span>
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        )}

                        <button
                          onClick={() => setSelectedSeanceForAppel(isAppelOpen ? null : seance.id)}
                          className="btn-pill-sun text-xs !min-h-[40px] flex items-center gap-1.5 font-black"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isAppelOpen ? "Fermer l'appel" : "Faire l'appel"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Zone d'appel 1 clic */}
                    {isAppelOpen && (
                      <div className="pt-4 border-t border-[#CDBDF2]/40 space-y-3">
                        <h4 className="font-black text-sm text-[#1B2A7A] uppercase tracking-wide">
                          Pointage des présences ({elevesGroupe.length} élèves) :
                        </h4>

                        {elevesGroupe.length === 0 ? (
                          <p className="text-xs text-gray-500 italic">Aucun élève rattaché à ce groupe.</p>
                        ) : (
                          <div className="space-y-2">
                            {elevesGroupe.map((eleve) => {
                              const presence = presences.find(
                                (p) => p.seance_id === seance.id && p.eleve_id === eleve.id
                              );
                              const currentStatut = presence?.statut;

                              return (
                                <div
                                  key={eleve.id}
                                  className="p-3 rounded-2xl bg-white border border-[#CDBDF2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                  <div className="font-bold text-sm text-[#1B2A7A]">
                                    {eleve.prenom} {eleve.nom}
                                  </div>

                                  <div className="grid grid-cols-4 gap-1.5 sm:flex sm:items-center">
                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePresence(seance.id, eleve.id, 'present')}
                                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                        currentStatut === 'present'
                                          ? 'bg-[#1E7E44] text-white shadow-sm ring-2 ring-emerald-300'
                                          : 'bg-[#EAFBF1] text-[#1E7E44] hover:bg-[#D3F7E1]'
                                      }`}
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                      <span>Présent</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePresence(seance.id, eleve.id, 'absent')}
                                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                        currentStatut === 'absent'
                                          ? 'bg-[#9B1C1C] text-white shadow-sm ring-2 ring-red-300'
                                          : 'bg-[#FDE8E8] text-[#9B1C1C] hover:bg-[#FCD1D1]'
                                      }`}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                      <span>Absent</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePresence(seance.id, eleve.id, 'retard')}
                                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                        currentStatut === 'retard'
                                          ? 'bg-[#854D0E] text-white shadow-sm ring-2 ring-yellow-300'
                                          : 'bg-[#FEF08A] text-[#854D0E] hover:bg-[#FDE047]'
                                      }`}
                                    >
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>Retard</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleUpdatePresence(seance.id, eleve.id, 'excuse')}
                                      className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                                        currentStatut === 'excuse'
                                          ? 'bg-[#3730A3] text-white shadow-sm ring-2 ring-indigo-300'
                                          : 'bg-[#E0E7FF] text-[#3730A3] hover:bg-[#C7D2FE]'
                                      }`}
                                    >
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      <span>Excusé</span>
                                    </button>
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
          2. ONGLET : SÉANCES & HISTORIQUE COMPLET
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'seances' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#1B2A7A]">Gestion des Séances</h2>
              <p className="text-xs text-[#4A5487] font-semibold">
                Planifiez vos cours, saisissez le thème abordé et effectuez l'appel des élèves.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {mesGroupes.length > 1 && (
                <select
                  value={filterGroupeId}
                  onChange={(e) => setFilterGroupeId(e.target.value)}
                  className="min-h-[40px] px-3 py-1.5 rounded-full border border-[#CDBDF2] bg-white text-xs font-bold text-[#1B2A7A]"
                >
                  <option value="all">Tous mes groupes</option>
                  {mesGroupes.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nom}
                    </option>
                  ))}
                </select>
              )}

              {mesGroupes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSeanceGroupeId(mesGroupes[0].id);
                    setIsAddSeanceModalOpen(true);
                  }}
                  className="btn-pill-sun text-xs !min-h-[40px] flex items-center gap-1.5 font-black"
                >
                  <Plus className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                  <span>+ Planifier une séance</span>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {filteredSeances.map((seance) => {
              const grp = mesGroupes.find((g) => g.id === seance.groupe_id);
              const elevesGroupe = mesEleves.filter((e) => e.groupe_id === seance.groupe_id);
              const isAppelOpen = selectedSeanceForAppel === seance.id;
              const isToday = seance.date === todayDate;

              const presencesSeance = presences.filter((p) => p.seance_id === seance.id);
              const presentsCount = presencesSeance.filter((p) => p.statut === 'present').length;
              const absentsCount = presencesSeance.filter((p) => p.statut === 'absent').length;

              return (
                <div
                  key={seance.id}
                  className={`cloud-card p-5 border-2 transition-all space-y-3 ${
                    isToday ? 'border-[#FFE15C] shadow-soft-blue' : 'border-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase text-[#1B2A7A] bg-[#FFF6E3] px-2.5 py-0.5 rounded-full border border-[#FFE15C]">
                          {grp?.nom || 'Groupe'}
                        </span>
                        <span className="text-xs font-bold text-[#1B2A7A]">
                          📅 {new Date(seance.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        {isToday && (
                          <span className="badge-sun text-[10px] font-extrabold uppercase px-2 py-0.5">
                            Aujourd'hui
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#4A5487] font-semibold">
                        Horaire habituel : <strong>{grp?.heure}</strong>
                        {seance.theme ? (
                          <span className="ml-2 text-[#1B2A7A] font-bold">
                            · Thème : « {seance.theme} »
                          </span>
                        ) : (
                          <span className="ml-2 text-gray-400 italic">· Sans thème précisé</span>
                        )}
                      </p>

                      <p className="text-xs text-gray-500 font-bold">
                        Appel : <span className="text-[#1E7E44]">{presentsCount} présent(s)</span> · <span className="text-[#9B1C1C]">{absentsCount} absent(s)</span> sur {elevesGroupe.length} élèves
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedSeanceForAppel(isAppelOpen ? null : seance.id)}
                        className="btn-pill-sun text-xs !min-h-[38px] flex items-center gap-1.5 font-bold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isAppelOpen ? "Fermer l'appel" : "Faire l'appel"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteSeance(seance.id)}
                        title="Supprimer la séance"
                        className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Feuille d'appel dépliable */}
                  {isAppelOpen && (
                    <div className="pt-3 border-t border-[#CDBDF2]/40 space-y-2">
                      <h4 className="font-black text-xs text-[#1B2A7A] uppercase tracking-wide">
                        Feuille de présence ({elevesGroupe.length} élèves) :
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {elevesGroupe.map((eleve) => {
                          const presence = presences.find(
                            (p) => p.seance_id === seance.id && p.eleve_id === eleve.id
                          );
                          const currentStatut = presence?.statut;

                          return (
                            <div
                              key={eleve.id}
                              className="p-2.5 rounded-xl bg-white border border-[#CDBDF2]/40 flex items-center justify-between gap-2"
                            >
                              <span className="font-bold text-xs text-[#1B2A7A] truncate">
                                {eleve.prenom} {eleve.nom}
                              </span>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePresence(seance.id, eleve.id, 'present')}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                    currentStatut === 'present'
                                      ? 'bg-[#1E7E44] text-white'
                                      : 'bg-[#EAFBF1] text-[#1E7E44]'
                                  }`}
                                >
                                  Présent
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePresence(seance.id, eleve.id, 'absent')}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                    currentStatut === 'absent'
                                      ? 'bg-[#9B1C1C] text-white'
                                      : 'bg-[#FDE8E8] text-[#9B1C1C]'
                                  }`}
                                >
                                  Absent
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePresence(seance.id, eleve.id, 'retard')}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                    currentStatut === 'retard'
                                      ? 'bg-[#854D0E] text-white'
                                      : 'bg-[#FEF08A] text-[#854D0E]'
                                  }`}
                                >
                                  Retard
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdatePresence(seance.id, eleve.id, 'excuse')}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                                    currentStatut === 'excuse'
                                      ? 'bg-[#3730A3] text-white'
                                      : 'bg-[#E0E7FF] text-[#3730A3]'
                                  }`}
                                >
                                  Excusé
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredSeances.length === 0 && (
              <div className="cloud-card p-10 text-center text-gray-500 space-y-3">
                <Clock className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-bold">Aucune séance enregistrée pour le moment.</p>
                {mesGroupes.length > 0 && (
                  <button
                    onClick={() => {
                      setSeanceGroupeId(mesGroupes[0].id);
                      setIsAddSeanceModalOpen(true);
                    }}
                    className="btn-pill-sun text-xs font-black"
                  >
                    + Créer votre première séance
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

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
              {mesGroupes.length > 1 && (
                <select
                  value={filterGroupeId}
                  onChange={(e) => setFilterGroupeId(e.target.value)}
                  className="min-h-[40px] px-3 py-1.5 rounded-full border border-[#CDBDF2] bg-white text-xs font-bold text-[#1B2A7A]"
                >
                  <option value="all">Tous mes groupes</option>
                  {mesGroupes.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nom}
                    </option>
                  ))}
                </select>
              )}

              {mesGroupes.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setDevoirGroupeId(mesGroupes[0].id);
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
              const grp = mesGroupes.find((g) => g.id === devoir.groupe_id);
              const isPast = devoir.date_limite ? devoir.date_limite < todayDate : false;
              const rendusDuDevoir = rendus.filter((r) => r.devoir_id === devoir.id);
              const elevesDuGroupe = mesEleves.filter((e) => e.groupe_id === devoir.groupe_id);
              const isRendusOpen = selectedDevoirForRendus === devoir.id;

              return (
                <div
                  key={devoir.id}
                  className="cloud-card p-5 border-2 border-white shadow-soft-blue flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-[#1B2A7A] bg-[#FFF6E3] px-2.5 py-0.5 rounded-full border border-[#FFE15C]">
                        {grp?.nom || 'Groupe'}
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

                  <div className="pt-2 border-t border-[#CDBDF2]/40 flex items-center justify-between text-[11px] text-gray-400">
                    <span>
                      Donné le {new Date(devoir.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDeleteDevoir(devoir.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 font-bold"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Supprimer</span>
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
                  Cliquez sur le bouton ci-dessous pour envoyer votre premier devoir aux élèves de votre classe.
                </p>
                {mesGroupes.length > 0 && (
                  <button
                    onClick={() => {
                      setDevoirGroupeId(mesGroupes[0].id);
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

      {/* ─────────────────────────────────────────────────────────────────────
          4. ONGLET : MES ÉLÈVES & SUIVI NOURANIA
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'eleves' && (
        <div className="space-y-6">
          {/* Recherche */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchEleve}
              onChange={(e) => setSearchEleve(e.target.value)}
              placeholder="Rechercher un élève par son prénom ou nom..."
              className="w-full min-h-[46px] pl-12 pr-4 py-3 rounded-2xl bg-white border border-[#CDBDF2] text-sm text-[#1B2A7A] font-semibold focus:ring-2 focus:ring-[#FFE15C] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Liste des élèves */}
            <div className="md:col-span-1 space-y-2">
              {mesEleves
                .filter(
                  (e) =>
                    e.prenom.toLowerCase().includes(searchEleve.toLowerCase()) ||
                    e.nom.toLowerCase().includes(searchEleve.toLowerCase())
                )
                .map((eleve) => {
                  const prog = progressions.find((p) => p.eleve_id === eleve.id);
                  const isSelected = selectedEleveDetail?.id === eleve.id;

                  return (
                    <div
                      key={eleve.id}
                      onClick={() => setSelectedEleveDetail(eleve)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-[#1B2A7A] text-white shadow-md border-[#1B2A7A]'
                          : 'bg-white hover:bg-[#FFF6E3] border-[#CDBDF2]/50 text-[#1B2A7A]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-sm sm:text-base">
                          {eleve.prenom} {eleve.nom}
                        </h4>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[#FFE15C] text-[#1B2A7A]'
                          }`}
                        >
                          Leçon {prog?.lecon_actuelle || 1}/17
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                        {eleve.groupe?.nom || 'Sans groupe'}
                      </p>
                    </div>
                  );
                })}

              {mesEleves.length === 0 && (
                <p className="text-xs text-gray-500 italic p-4 text-center">
                  Aucun élève dans vos groupes.
                </p>
              )}
            </div>

            {/* Fiche détaillée élève & saisie progression */}
            <div className="md:col-span-2">
              {selectedEleveDetail ? (
                <div className="cloud-card p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black text-[#1B2A7A]">
                        {selectedEleveDetail.prenom} {selectedEleveDetail.nom}
                      </h3>
                      <p className="text-xs text-[#4A5487] font-semibold">
                        Groupe : <strong>{selectedEleveDetail.groupe?.nom}</strong> ({selectedEleveDetail.groupe?.formation.toUpperCase()})
                      </p>
                    </div>

                    {selectedEleveDetail.parent?.telephone && (
                      <a
                        href={`https://wa.me/${selectedEleveDetail.parent.telephone.replace(/\s+/g, '').replace('+', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-pill-white text-xs !min-h-[38px] flex items-center gap-1.5 border border-[#CDBDF2] text-[#1E7E44] font-black"
                      >
                        <span>WhatsApp Parent : {selectedEleveDetail.parent.telephone}</span>
                      </a>
                    )}
                  </div>

                  {/* Saisie Progression Nourania */}
                  <div className="p-5 rounded-2xl bg-white border border-[#CDBDF2]/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-[#1B2A7A] flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#1B2A7A]" />
                        Progression Méthode Nourania (1 à 17)
                      </h4>
                      {progSaveSuccess && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Enregistré !
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[#1B2A7A]">
                        Leçon actuellement travaillée :
                      </label>
                      <select
                        value={editProgLecon}
                        onChange={(e) => setEditProgLecon(parseInt(e.target.value, 10))}
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#CDBDF2] bg-white text-sm font-bold text-[#1B2A7A]"
                      >
                        {[
                          { num: 1, title: 'Leçon 1 : Les lettres isolées' },
                          { num: 2, title: 'Leçon 2 : Les lettres composées' },
                          { num: 3, title: 'Leçon 3 : Les lettres coupées' },
                          { num: 4, title: 'Leçon 4 : Les voyelles courtes (Harakat)' },
                          { num: 5, title: 'Leçon 5 : Le Tanween' },
                          { num: 6, title: 'Leçon 6 : Exercices sur les Harakat et Tanween' },
                          { num: 7, title: 'Leçon 7 : Les voyelles longues mineures' },
                          { num: 8, title: 'Leçon 8 : Les lettres de prolongation (Madd) et de douceur (Leen)' },
                          { num: 9, title: 'Leçon 9 : Exercices sur le Madd et Leen' },
                          { num: 10, title: 'Leçon 10 : Le Soukoun' },
                          { num: 11, title: 'Leçon 11 : Exercices sur le Soukoun' },
                          { num: 12, title: 'Leçon 12 : La Chaddah' },
                          { num: 13, title: 'Leçon 13 : Exercices sur la Chaddah' },
                          { num: 14, title: 'Leçon 14 : La Chaddah avec le Soukoun' },
                          { num: 15, title: 'Leçon 15 : La Chaddah avec la Chaddah' },
                          { num: 16, title: 'Leçon 16 : La Chaddah avec les lettres de Madd' },
                          { num: 17, title: 'Leçon 17 : Révision générale et fin Nourania' },
                        ].map((lec) => (
                          <option key={lec.num} value={lec.num}>
                            {lec.title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[#1B2A7A]">
                        Votre commentaire pour la famille et l'élève :
                      </label>
                      <textarea
                        value={editProgCommentaire}
                        onChange={(e) => setEditProgCommentaire(e.target.value)}
                        rows={3}
                        placeholder="Ex: Excellente prononciation de la lettre Ra aujourd'hui. Bien réviser la page 8..."
                        className="w-full p-3 rounded-xl border border-[#CDBDF2] text-xs sm:text-sm text-[#1B2A7A] focus:outline-none focus:ring-2 focus:ring-[#FFE15C]"
                      />
                    </div>

                    <button
                      onClick={handleSaveProgression}
                      className="btn-pill-sun text-xs font-black !min-h-[40px] w-full"
                    >
                      Enregistrer la progression de {selectedEleveDetail.prenom}
                    </button>
                  </div>

                  {/* Ajouter une appréciation mensuelle */}
                  <form onSubmit={handleAddAppreciation} className="p-5 rounded-2xl bg-white border border-[#CDBDF2]/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-[#1B2A7A] flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#1B2A7A]" />
                        Ajouter une appréciation mensuelle
                      </h4>
                      {apprecSaveSuccess && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Ajouté !
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Période</label>
                        <input
                          type="month"
                          value={newApprecPeriode}
                          onChange={(e) => setNewApprecPeriode(e.target.value)}
                          className="w-full min-h-[40px] px-3 py-2 rounded-xl border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A]"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Appréciation</label>
                        <textarea
                          value={newApprecTexte}
                          onChange={(e) => setNewApprecTexte(e.target.value)}
                          rows={2}
                          placeholder="Bilan du mois pour la famille (efforts, assiduité, conseils)..."
                          className="w-full p-2.5 rounded-xl border border-[#CDBDF2] text-xs text-[#1B2A7A]"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-pill-white text-xs font-bold !min-h-[38px] border border-[#CDBDF2] hover:bg-[#FFE15C]"
                    >
                      Publier l'appréciation
                    </button>

                    {/* Historique appréciations */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                        Historique des appréciations de {selectedEleveDetail.prenom} :
                      </h5>
                      {appreciations
                        .filter((a) => a.eleve_id === selectedEleveDetail.id)
                        .map((app) => (
                          <div key={app.id} className="p-3 rounded-xl bg-gray-50 text-xs text-gray-700">
                            <span className="font-black text-[#1B2A7A] mr-2">[{app.periode}]</span>
                            {app.texte}
                          </div>
                        ))}
                    </div>
                  </form>
                </div>
              ) : (
                <div className="cloud-card p-12 text-center text-gray-500 space-y-2">
                  <Users className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-sm font-bold text-[#1B2A7A]">Sélectionnez un élève dans la liste à gauche</p>
                  <p className="text-xs text-[#4A5487]">
                    Vous pourrez mettre à jour sa leçon Nourania (1 à 17) et lui rédiger une appréciation.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────
          5. ONGLET : MES GROUPES & SALLES ZOOM
      ───────────────────────────────────────────────────────────────────── */}
      {activeTab === 'groupes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mesGroupes.map((grp) => {
              const elevesDuGroupe = mesEleves.filter((e) => e.groupe_id === grp.id);

              return (
                <div key={grp.id} className="cloud-card p-6 space-y-4 shadow-soft-blue">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-black uppercase text-[#1B2A7A] bg-[#FFE15C] px-3 py-1 rounded-full">
                        {grp.formation}
                      </span>
                      <h3 className="text-xl font-black text-[#1B2A7A] mt-2">{grp.nom}</h3>
                      <p className="text-xs text-[#4A5487] font-semibold">
                        {grp.jour} · <strong>{grp.heure}</strong>
                      </p>
                    </div>

                    {grp.lien_zoom && (
                      <a
                        href={grp.lien_zoom}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-pill-sun text-xs !min-h-[40px] flex items-center gap-1.5 font-black"
                      >
                        <Video className="w-4 h-4" />
                        <span>Lancer Zoom</span>
                      </a>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#CDBDF2]/40 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSeanceGroupeId(grp.id);
                        setIsAddSeanceModalOpen(true);
                      }}
                      className="btn-pill-white text-xs !min-h-[36px] flex items-center gap-1 border border-[#CDBDF2] font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter une séance</span>
                    </button>

                    <button
                      onClick={() => {
                        setDevoirGroupeId(grp.id);
                        setIsAddDevoirModalOpen(true);
                      }}
                      className="btn-pill-white text-xs !min-h-[36px] flex items-center gap-1 border border-[#CDBDF2] font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Donner un devoir</span>
                    </button>
                  </div>

                  {/* Élèves inscrits */}
                  <div className="pt-2">
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">
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
                        <span className="text-xs text-gray-400 italic">Aucun élève pour le moment</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {mesGroupes.length === 0 && (
            <div className="cloud-card p-12 text-center text-gray-500">
              <Layers className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-base font-bold text-[#1B2A7A]">Aucun groupe ne vous a encore été attribué.</p>
              <p className="text-xs text-[#4A5487] mt-1">L'administratrice Siham vous assignera vos groupes d'enseignement.</p>
            </div>
          )}
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
          MODAL : CRÉER UNE SÉANCE
      ───────────────────────────────────────────────────────────────────── */}
      {isAddSeanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="cloud-card max-w-md w-full p-6 space-y-4 bg-white border-2 border-[#1B2A7A] shadow-soft-blue">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-[#1B2A7A]">Planifier une séance</h3>
              <button
                type="button"
                onClick={() => setIsAddSeanceModalOpen(false)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700"
              >
                ✕ Fermer
              </button>
            </div>

            <form onSubmit={handleCreateSeance} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Groupe concerné *</label>
                <select
                  value={seanceGroupeId}
                  onChange={(e) => setSeanceGroupeId(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A]"
                  required
                >
                  {mesGroupes.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nom} ({g.jour} · {g.heure})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Date de la séance *</label>
                <input
                  type="date"
                  value={seanceDate}
                  onChange={(e) => setSeanceDate(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-xs font-bold text-[#1B2A7A]"
                  required
                >
                </input>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Thème abordé / Leçon (optionnel)</label>
                <input
                  type="text"
                  value={seanceTheme}
                  onChange={(e) => setSeanceTheme(e.target.value)}
                  placeholder="Ex: Méthode Nourania Leçon 4 - Les Harakat"
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-xs text-[#1B2A7A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddSeanceModalOpen(false)}
                  className="btn-pill-white text-xs !min-h-[40px]"
                >
                  Annuler
                </button>
                <button type="submit" className="btn-pill-sun text-xs !min-h-[40px] font-black">
                  Créer la séance
                </button>
              </div>
            </form>
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
                  {mesGroupes.map((g) => (
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
                  {mesGroupes.map((g) => (
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
    </div>
  );
};
