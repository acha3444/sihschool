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
  Appreciation,
  Annonce,
  PresenceStatut,
} from '../../types/database';
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
  Edit2,
  FileText,
  Award,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

type ProfTab = 'aujourdhui' | 'eleves' | 'groupes' | 'annonces';

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

  // Filtres
  const todayDate = new Date().toISOString().split('T')[0];
  const [selectedSeanceForAppel, setSelectedSeanceForAppel] = useState<string | null>(null);
  const [searchEleve, setSearchEleve] = useState('');
  const [selectedEleveDetail, setSelectedEleveDetail] = useState<Eleve | null>(null);

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
  const [devoirDateLimite, setDevoirDateLimite] = useState('');

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
      } else {
        setMesEleves([]);
        setSeances([]);
        setDevoirs([]);
      }

      // 8. Annonces
      const { data: annoncesData } = await supabase
        .from('annonces')
        .select('*, groupe:groupes(*)')
        .order('publiee_le', { ascending: false });
      setAnnonces((annoncesData as Annonce[]) || []);
    } catch (err) {
      console.error('Erreur chargement données prof:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfData();
  }, [profile?.id]);

  // Synchroniser la progression de l'élève sélectionné
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
      setProgSaveSuccess(false);
      setApprecSaveSuccess(false);
    }
  }, [selectedEleveDetail, progressions]);

  // Enregistrer la présence en 1 clic
  const handleUpdatePresence = async (seanceId: string, eleveId: string, statut: PresenceStatut) => {
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

  // Créer un devoir
  const handleCreateDevoir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoirGroupeId || !devoirTitre || !devoirConsigne) return;
    try {
      const { data, error } = await supabase
        .from('devoirs')
        .insert({
          groupe_id: devoirGroupeId,
          titre: devoirTitre,
          consigne: devoirConsigne,
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
        setDevoirDateLimite('');
      }
    } catch (err: any) {
      alert('Erreur ajout devoir : ' + err.message);
    }
  };

  // Séances du jour
  const seancesDuJour = seances.filter((s) => s.date === todayDate);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#1B2A7A]">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#1B2A7A]" />
        <p className="text-base font-bold">Chargement de votre espace enseignante...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header Enseignante */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A7A]">
            Espace Enseignante
          </h1>
          <p className="text-base text-[#1B2A7A]/80 font-medium">
            Bienvenue {profile?.prenom} · Gestion pédagogique de vos groupes
          </p>
        </div>

        {/* Bouton rapide nouvelle séance */}
        {mesGroupes.length > 0 && (
          <button
            onClick={() => {
              setSeanceGroupeId(mesGroupes[0].id);
              setIsAddSeanceModalOpen(true);
            }}
            className="btn-pill-sun text-sm !min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Créer une séance</span>
          </button>
        )}
      </div>

      {/* Navigation Onglets */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('aujourdhui')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'aujourdhui'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Aujourd'hui {seancesDuJour.length > 0 && `(${seancesDuJour.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('eleves')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'eleves'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Mes Élèves ({mesEleves.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('groupes')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'groupes'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Mes Groupes ({mesGroupes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('annonces')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'annonces'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <Megaphone className="w-4 h-4" />
          <span>Annonces</span>
        </button>
      </div>

      {/* CONTENU ONGLETS */}

      {/* 1. AUJOURD'HUI & APPEL */}
      {activeTab === 'aujourdhui' && (
        <div className="space-y-6">
          {seancesDuJour.length === 0 ? (
            <div className="cloud-card p-8 text-center space-y-4">
              <Calendar className="w-12 h-12 text-[#1B2A7A] mx-auto opacity-50" />
              <h3 className="text-xl font-black text-[#1B2A7A]">Aucune séance prévue aujourd'hui</h3>
              <p className="text-base text-gray-600">
                Vous n'avez pas de séance programmée à la date d'aujourd'hui.
              </p>
              {mesGroupes.length > 0 && (
                <button
                  onClick={() => {
                    setSeanceGroupeId(mesGroupes[0].id);
                    setIsAddSeanceModalOpen(true);
                  }}
                  className="btn-pill-sun"
                >
                  <Plus className="w-4 h-4" />
                  <span>Programmer une séance aujourd'hui</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {seancesDuJour.map((seance) => {
                const grp = mesGroupes.find((g) => g.id === seance.groupe_id);
                const elevesGroupe = mesEleves.filter((e) => e.groupe_id === seance.groupe_id);
                const isAppelOpen = selectedSeanceForAppel === seance.id;

                return (
                  <div key={seance.id} className="cloud-card p-6 border-2 border-[#FFE15C] space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#FFE15C] text-[#1B2A7A] uppercase mb-2">
                          Séance d'aujourd'hui
                        </div>
                        <h3 className="text-xl font-black text-[#1B2A7A]">
                          {grp?.nom} ({grp?.formation.toUpperCase()})
                        </h3>
                        <p className="text-sm text-gray-600">
                          Horaire : <strong>{grp?.heure}</strong> {seance.theme && `· Thème : ${seance.theme}`}
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
                          className="btn-pill-sun text-sm !min-h-[44px]"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isAppelOpen ? 'Fermer l\'appel' : 'Faire l\'appel'}</span>
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
                          <p className="text-sm text-gray-500 italic">Aucun élève rattaché à ce groupe.</p>
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
                                      className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
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
                                      className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
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
                                      className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
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
                                      className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
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

      {/* 2. MES ÉLÈVES */}
      {activeTab === 'eleves' && (
        <div className="space-y-6">
          {/* Recherche */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchEleve}
              onChange={(e) => setSearchEleve(e.target.value)}
              placeholder="Rechercher un élève par nom ou prénom..."
              className="w-full min-h-[44px] pl-12 pr-4 py-3 rounded-2xl bg-white border border-[#CDBDF2] text-base focus:ring-2 focus:ring-[#FFE15C] focus:outline-none"
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
                        <h4 className="font-black text-base">{eleve.prenom} {eleve.nom}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#FFE15C] text-[#1B2A7A]'
                        }`}>
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
                <p className="text-sm text-gray-500 italic p-4 text-center">
                  Aucun élève dans vos groupes.
                </p>
              )}
            </div>

            {/* Fiche détaillée élève & saisie progression */}
            <div className="md:col-span-2">
              {selectedEleveDetail ? (
                <div className="cloud-card p-6 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-[#1B2A7A]">
                      {selectedEleveDetail.prenom} {selectedEleveDetail.nom}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Groupe : <strong>{selectedEleveDetail.groupe?.nom}</strong> ({selectedEleveDetail.groupe?.formation.toUpperCase()})
                    </p>
                  </div>

                  {/* Saisie Progression Nourania */}
                  <div className="p-5 rounded-2xl bg-white border border-[#CDBDF2]/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-base text-[#1B2A7A] flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#1B2A7A]" />
                        Progression Méthode Nourania
                      </h4>
                      {progSaveSuccess && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Enregistré !
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[#1B2A7A]">
                        Leçon actuelle (1 à 17) :
                      </label>
                      <select
                        value={editProgLecon}
                        onChange={(e) => setEditProgLecon(parseInt(e.target.value, 10))}
                        className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#CDBDF2] bg-white text-base font-bold text-[#1B2A7A]"
                      >
                        {Array.from({ length: 17 }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            Leçon {n} {n === 1 ? '(Lettres simples)' : n === 17 ? '(Fin Nourania)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[#1B2A7A]">
                        Votre commentaire pour l'élève et la famille :
                      </label>
                      <textarea
                        value={editProgCommentaire}
                        onChange={(e) => setEditProgCommentaire(e.target.value)}
                        rows={3}
                        placeholder="Ex: Excellente prononciation des lettres emphatiques aujourd'hui..."
                        className="w-full p-3 rounded-xl border border-[#CDBDF2] text-sm text-[#1B2A7A] focus:outline-none focus:ring-2 focus:ring-[#FFE15C]"
                      />
                    </div>

                    <button
                      onClick={handleSaveProgression}
                      className="btn-pill-sun text-sm !min-h-[40px] w-full"
                    >
                      Enregistrer la progression
                    </button>
                  </div>

                  {/* Ajouter une appréciation mensuelle */}
                  <form onSubmit={handleAddAppreciation} className="p-5 rounded-2xl bg-white border border-[#CDBDF2]/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-base text-[#1B2A7A] flex items-center gap-2">
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
                        <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Mois / Période</label>
                        <input
                          type="month"
                          value={newApprecPeriode}
                          onChange={(e) => setNewApprecPeriode(e.target.value)}
                          className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-[#CDBDF2] text-sm"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Appréciation</label>
                        <textarea
                          value={newApprecTexte}
                          onChange={(e) => setNewApprecTexte(e.target.value)}
                          rows={2}
                          placeholder="Bilan mensuel pour la famille..."
                          className="w-full p-2.5 rounded-xl border border-[#CDBDF2] text-sm"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-pill-white text-xs font-bold !min-h-[40px] border border-[#CDBDF2] hover:bg-[#FFE15C]"
                    >
                      Publier l'appréciation
                    </button>

                    {/* Historique appréciations */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <h5 className="text-xs font-bold text-gray-500 uppercase">Historique :</h5>
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
                <div className="cloud-card p-12 text-center text-gray-500">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-base font-bold">Sélectionnez un élève à gauche pour gérer sa progression</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. MES GROUPES */}
      {activeTab === 'groupes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mesGroupes.map((grp) => {
              const elevesDuGroupe = mesEleves.filter((e) => e.groupe_id === grp.id);

              return (
                <div key={grp.id} className="cloud-card p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-black uppercase text-[#1B2A7A] bg-[#FFE15C] px-3 py-1 rounded-full">
                        {grp.formation}
                      </span>
                      <h3 className="text-xl font-black text-[#1B2A7A] mt-2">{grp.nom}</h3>
                      <p className="text-sm text-gray-600">
                        {grp.jour} à <strong>{grp.heure}</strong>
                      </p>
                    </div>

                    {grp.lien_zoom && (
                      <a
                        href={grp.lien_zoom}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-pill-sun text-xs !min-h-[40px] flex items-center gap-1.5"
                      >
                        <Video className="w-4 h-4" />
                        <span>Lien Zoom</span>
                      </a>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#CDBDF2]/40 flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setSeanceGroupeId(grp.id);
                        setIsAddSeanceModalOpen(true);
                      }}
                      className="btn-pill-white text-xs !min-h-[36px] flex items-center gap-1 border border-[#CDBDF2]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter une séance</span>
                    </button>

                    <button
                      onClick={() => {
                        setDevoirGroupeId(grp.id);
                        setIsAddDevoirModalOpen(true);
                      }}
                      className="btn-pill-white text-xs !min-h-[36px] flex items-center gap-1 border border-[#CDBDF2]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter un devoir</span>
                    </button>
                  </div>

                  {/* Élèves inscrits */}
                  <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-2">
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
                        <span className="text-xs text-gray-400 italic">Aucun élève</span>
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
              <p className="text-base font-bold">Aucun groupe ne vous a encore été assigné.</p>
              <p className="text-sm">L'administratrice Siham vous assignera vos groupes d'enseignement.</p>
            </div>
          )}
        </div>
      )}

      {/* 4. ANNONCES */}
      {activeTab === 'annonces' && (
        <div className="cloud-card p-6 space-y-4">
          <h3 className="text-xl font-black text-[#1B2A7A] flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#1B2A7A]" />
            Annonces de l'école
          </h3>

          <div className="space-y-4">
            {annonces.map((annonce) => (
              <div key={annonce.id} className="p-4 rounded-2xl bg-white border border-[#CDBDF2]/40 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-base text-[#1B2A7A]">{annonce.titre}</h4>
                  <span className="text-xs text-gray-500">{annonce.publiee_le}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{annonce.texte}</p>
                {annonce.groupe?.nom && (
                  <span className="inline-block text-xs font-bold text-[#1B2A7A] bg-[#CDBDF2]/30 px-2.5 py-0.5 rounded-full">
                    Groupe : {annonce.groupe.nom}
                  </span>
                )}
              </div>
            ))}
            {annonces.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-6">Aucune annonce pour le moment.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL CRÉER UNE SÉANCE */}
      {isAddSeanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="cloud-card max-w-md w-full p-6 space-y-4 bg-white border-2 border-[#1B2A7A]">
            <h3 className="text-lg font-black text-[#1B2A7A]">Ajouter une séance</h3>
            <form onSubmit={handleCreateSeance} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Groupe</label>
                <select
                  value={seanceGroupeId}
                  onChange={(e) => setSeanceGroupeId(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-sm"
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
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Date</label>
                <input
                  type="date"
                  value={seanceDate}
                  onChange={(e) => setSeanceDate(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Thème de la séance (optionnel)</label>
                <input
                  type="text"
                  value={seanceTheme}
                  onChange={(e) => setSeanceTheme(e.target.value)}
                  placeholder="Ex: Révision des voyelles courtes..."
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-sm"
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
                <button type="submit" className="btn-pill-sun text-xs !min-h-[40px]">
                  Créer la séance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AJOUTER UN DEVOIR */}
      {isAddDevoirModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="cloud-card max-w-md w-full p-6 space-y-4 bg-white border-2 border-[#1B2A7A]">
            <h3 className="text-lg font-black text-[#1B2A7A]">Ajouter un devoir</h3>
            <form onSubmit={handleCreateDevoir} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Groupe</label>
                <select
                  value={devoirGroupeId}
                  onChange={(e) => setDevoirGroupeId(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-sm"
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
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Titre du devoir</label>
                <input
                  type="text"
                  value={devoirTitre}
                  onChange={(e) => setDevoirTitre(e.target.value)}
                  placeholder="Ex: Exercice leçon 3"
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Consigne</label>
                <textarea
                  value={devoirConsigne}
                  onChange={(e) => setDevoirConsigne(e.target.value)}
                  rows={3}
                  placeholder="Écrire et répéter 5 fois la ligne 2..."
                  className="w-full p-2.5 rounded-xl border border-[#CDBDF2] text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B2A7A] mb-1">Date limite (optionnel)</label>
                <input
                  type="date"
                  value={devoirDateLimite}
                  onChange={(e) => setDevoirDateLimite(e.target.value)}
                  className="w-full min-h-[44px] p-2.5 rounded-xl border border-[#CDBDF2] text-sm"
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
                <button type="submit" className="btn-pill-sun text-xs !min-h-[40px]">
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
