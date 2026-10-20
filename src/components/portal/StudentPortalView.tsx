import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Eleve, Groupe, Seance, Presence, Progression, Devoir, DevoirRendu, Appreciation, Paiement, Annonce } from '../../types/database';
import { AudioRecorder } from '../common/AudioRecorder';
import { AudioPlayer } from '../common/AudioPlayer';
import { 
  Video, 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  CreditCard, 
  Megaphone, 
  Award,
  ExternalLink,
  ChevronRight,
  Mic,
  Send,
  Sparkles
} from 'lucide-react';

interface StudentPortalViewProps {
  eleve: Eleve;
  groupe: Groupe | null;
  seances: Seance[];
  presences: Presence[];
  progression: Progression | null;
  devoirs: Devoir[];
  appreciations: Appreciation[];
  paiements: Paiement[];
  annonces: Annonce[];
}

type TabType = 'accueil' | 'progression' | 'devoirs' | 'presences' | 'bilan';

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  eleve,
  groupe,
  seances,
  presences,
  progression,
  devoirs,
  appreciations,
  paiements,
  annonces,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('accueil');
  const [rendus, setRendus] = useState<Record<string, DevoirRendu>>({});
  const [tempAudio, setTempAudio] = useState<Record<string, { base64: string; duration: number }>>({});
  const [tempCommentaire, setTempCommentaire] = useState<Record<string, string>>({});
  const [submittingDevoirId, setSubmittingDevoirId] = useState<string | null>(null);
  const [isReRecording, setIsReRecording] = useState<Record<string, boolean>>({});

  const WHATSAPP_URL = 'https://wa.me/33757589112';

  // Charger les devoirs rendus pour cet élève
  const loadRendus = async () => {
    if (!eleve?.id) return;
    try {
      const { data, error } = await supabase
        .from('devoir_rendus')
        .select('*')
        .eq('eleve_id', eleve.id);

      if (error) {
        console.warn('Erreur chargement devoirs rendus (la table existe-t-elle ?)', error);
        return;
      }

      if (data) {
        const map: Record<string, DevoirRendu> = {};
        data.forEach((r: DevoirRendu) => {
          map[r.devoir_id] = r;
        });
        setRendus(map);
      }
    } catch (err) {
      console.warn('Erreur chargement rendus:', err);
    }
  };

  useEffect(() => {
    loadRendus();
  }, [eleve?.id]);

  // Envoyer un enregistrement audio pour un devoir
  const handleSubmitAudioRendu = async (devoirId: string) => {
    const audioData = tempAudio[devoirId];
    if (!audioData || !audioData.base64) {
      alert('Veuillez d\'abord enregistrer votre note vocale avant d\'envoyer.');
      return;
    }

    setSubmittingDevoirId(devoirId);
    try {
      const { data, error } = await supabase
        .from('devoir_rendus')
        .upsert(
          {
            devoir_id: devoirId,
            eleve_id: eleve.id,
            audio_url: audioData.base64,
            duree_secondes: audioData.duration || 5,
            commentaire_eleve: tempCommentaire[devoirId] || null,
            statut: 'en_attente',
          },
          { onConflict: 'devoir_id,eleve_id' }
        )
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setRendus((prev) => ({ ...prev, [devoirId]: data as DevoirRendu }));
        setIsReRecording((prev) => ({ ...prev, [devoirId]: false }));
        // Nettoyer temp
        setTempAudio((prev) => {
          const next = { ...prev };
          delete next[devoirId];
          return next;
        });
      }
    } catch (err: any) {
      alert('Erreur lors de l\'envoi du devoir : ' + (err.message || 'Problème de connexion'));
    } finally {
      setSubmittingDevoirId(null);
    }
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatPeriod = (periodStr: string) => {
    if (!periodStr) return '';
    const parts = periodStr.split('-');
    if (parts.length === 2) {
      const year = parts[0];
      const monthNum = parseInt(parts[1], 10) - 1;
      const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
      return `${monthNames[monthNum] || parts[1]} ${year}`;
    }
    return periodStr;
  };

  // Status badge for presence
  const getPresenceBadge = (statut: string) => {
    switch (statut) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAFBF1] text-[#1E7E44] border border-[#C5F3D6]">
            <CheckCircle2 className="w-4 h-4 text-[#1E7E44]" />
            Présent(e)
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDE8E8] text-[#9B1C1C] border border-[#F8B4B4]">
            <XCircle className="w-4 h-4 text-[#9B1C1C]" />
            Absent(e)
          </span>
        );
      case 'retard':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF08A] text-[#854D0E] border border-[#FDE047]">
            <Clock className="w-4 h-4 text-[#854D0E]" />
            En retard
          </span>
        );
      case 'excuse':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E0E7FF] text-[#3730A3] border border-[#C7D2FE]">
            <AlertCircle className="w-4 h-4 text-[#3730A3]" />
            Excusé(e)
          </span>
        );
      default:
        return <span>{statut}</span>;
    }
  };

  // Nourania lesson calculation
  const totalLecons = 17;
  const leconActuelle = progression?.lecon_actuelle || 1;
  const progressPercent = Math.min(100, Math.round((leconActuelle / totalLecons) * 100));

  // Devoirs: split between active and past
  const todayStr = new Date().toISOString().split('T')[0];
  const devoirsAFaire = devoirs.filter(d => !d.date_limite || d.date_limite >= todayStr);
  const devoirsPasses = devoirs.filter(d => d.date_limite && d.date_limite < todayStr);

  return (
    <div className="space-y-6">
      {/* Navigation tabs for mobile / desktop */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('accueil')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'accueil'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Séance & Annonces</span>
        </button>

        <button
          onClick={() => setActiveTab('progression')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'progression'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Progression</span>
        </button>

        <button
          onClick={() => setActiveTab('devoirs')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'devoirs'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Devoirs {devoirsAFaire.length > 0 && `(${devoirsAFaire.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('presences')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'presences'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Présences</span>
        </button>

        <button
          onClick={() => setActiveTab('bilan')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'bilan'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Appréciations & Paiements</span>
        </button>
      </div>

      {/* TAB: ACCUEIL & SÉANCES */}
      {activeTab === 'accueil' && (
        <div className="space-y-6">
          {/* Prochaine Séance & Zoom Card */}
          <div className="cloud-card p-6 border-2 border-[#FFE15C] bg-gradient-to-br from-[#FFFDF7] to-[#FFF6E3]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#FFE15C] text-[#1B2A7A]">
                  <Video className="w-3.5 h-3.5" />
                  Prochaine séance en direct
                </div>
                <h3 className="text-xl md:text-2xl font-black text-[#1B2A7A]">
                  {groupe ? groupe.nom : 'Groupe en cours d\'attribution'}
                </h3>
                {groupe ? (
                  <p className="text-base text-[#1B2A7A]/80 font-medium flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#1B2A7A]" />
                    <span>Tous les <strong className="capitalize">{groupe.jour}s</strong> à <strong className="text-lg">{groupe.heure}</strong></span>
                  </p>
                ) : (
                  <p className="text-base text-gray-500">Contactez l'administration pour votre affectation de groupe.</p>
                )}
                {groupe?.formation && (
                  <p className="text-sm text-[#1B2A7A]/70">
                    Formation : <span className="font-bold uppercase">{groupe.formation}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {groupe?.lien_zoom ? (
                  <a
                    href={groupe.lien_zoom}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pill-sun text-base px-6 py-3.5 min-h-[48px] flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Video className="w-5 h-5" />
                    <span>Rejoindre sur Zoom</span>
                    <ExternalLink className="w-4 h-4 opacity-70" />
                  </a>
                ) : (
                  <div className="px-4 py-3 rounded-2xl bg-white/70 border border-amber-200 text-sm text-[#1B2A7A] text-center">
                    Lien Zoom bientôt disponible
                  </div>
                )}

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-5 py-3 rounded-full font-bold text-base bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Contacter Siham sur WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Annonces récentes */}
          <div className="cloud-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-black text-[#1B2A7A] flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#1B2A7A]" />
                Dernières annonces
              </h3>
            </div>

            {annonces.length === 0 ? (
              <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                <Megaphone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-base text-gray-500 font-medium">Aucune annonce pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {annonces.map((annonce) => (
                  <div key={annonce.id} className="p-4 rounded-2xl bg-white border border-[#CDBDF2]/40 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-black text-base text-[#1B2A7A]">{annonce.titre}</h4>
                      <span className="text-xs text-gray-500 font-medium">
                        {formatDate(annonce.publiee_le || annonce.created_at)}
                      </span>
                    </div>
                    <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
                      {annonce.texte}
                    </p>
                    {annonce.groupe_id && (
                      <span className="inline-block text-xs font-bold text-[#1B2A7A] bg-[#CDBDF2]/30 px-2.5 py-0.5 rounded-full">
                        Réservé à votre groupe
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: PROGRESSION */}
      {activeTab === 'progression' && (
        <div className="space-y-6">
          <div className="cloud-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-xl font-black text-[#1B2A7A] flex items-center gap-2">
                  <Award className="w-6 h-6 text-[#1B2A7A]" />
                  Suivi de la Méthode Nourania
                </h3>
                <p className="text-sm text-gray-600">
                  Progression officielle sur les 17 leçons d'apprentissage
                </p>
              </div>
              <div className="bg-[#FFE15C] text-[#1B2A7A] px-4 py-2 rounded-2xl font-black text-lg text-center shadow-sm">
                Leçon {leconActuelle} / {totalLecons}
              </div>
            </div>

            {/* Barre de progression visuelle */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm font-bold text-[#1B2A7A]">
                <span>Progression globale</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-4 bg-white rounded-full overflow-hidden border border-[#1B2A7A]/10 p-0.5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#FFE15C] via-[#CDBDF2] to-[#1B2A7A] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Grille des 17 leçons Nourania */}
            <div className="space-y-3">
              <h4 className="text-sm font-extrabold text-[#1B2A7A] uppercase tracking-wider">
                Feuille de route des 17 leçons :
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
                {Array.from({ length: 17 }, (_, i) => i + 1).map((num) => {
                  const isDone = num < leconActuelle;
                  const isCurrent = num === leconActuelle;

                  return (
                    <div
                      key={num}
                      className={`h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-[#1B2A7A] text-white ring-4 ring-[#FFE15C] shadow-md scale-105'
                          : isDone
                          ? 'bg-[#CDBDF2]/50 text-[#1B2A7A] border border-[#CDBDF2]'
                          : 'bg-white/80 text-gray-400 border border-gray-200'
                      }`}
                    >
                      <span>Leçon</span>
                      <span className="text-sm font-black">{num}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Commentaire de l'enseignante */}
            <div className="mt-8 p-5 rounded-2xl bg-white border border-[#CDBDF2]/50 space-y-2">
              <h4 className="font-black text-base text-[#1B2A7A] flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#1B2A7A]" />
                Commentaire de l'enseignante Siham
              </h4>
              {progression?.commentaire ? (
                <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
                  "{progression.commentaire}"
                </p>
              ) : (
                <p className="text-base text-gray-500 italic">
                  Aucun commentaire saisi pour le moment.
                </p>
              )}
              {progression?.mis_a_jour_le && (
                <p className="text-xs text-gray-400 text-right font-medium">
                  Mis à jour le {formatDate(progression.mis_a_jour_le)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: DEVOIRS AVEC NOTE VOCALE */}
      {activeTab === 'devoirs' && (
        <div className="space-y-6">
          {/* Devoirs à faire */}
          <div className="cloud-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CDBDF2]/40 pb-3">
              <div>
                <h3 className="text-lg md:text-xl font-black text-[#1B2A7A] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1B2A7A]" />
                  Devoirs & Récitations vocales
                </h3>
                <p className="text-xs text-[#4A5487] font-semibold">
                  Écoutez les consignes et enregistrez votre récitation pour l'envoyer à votre enseignante.
                </p>
              </div>
              <span className="badge-lavender text-xs font-black uppercase">
                {devoirsAFaire.length} devoir(s) en cours
              </span>
            </div>

            {devoirsAFaire.length === 0 ? (
              <div className="text-center py-10 bg-white/50 rounded-2xl border border-dashed border-gray-200 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-base text-gray-700 font-bold">Aucun devoir à rendre pour le moment</p>
                <p className="text-xs text-gray-500">Bravo ! Tout est à jour.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {devoirsAFaire.map((d) => {
                  const rendu = rendus[d.id];
                  const reRecording = isReRecording[d.id];
                  const hasRecorded = !!tempAudio[d.id];
                  const isSubmitting = submittingDevoirId === d.id;

                  return (
                    <div
                      key={d.id}
                      className="p-5 rounded-3xl bg-white border-2 border-[#FFE15C] shadow-soft-blue space-y-4"
                    >
                      {/* En-tête devoir */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="space-y-1">
                          <span className="badge-sun text-[10px] font-black uppercase">
                            Exercice obligatoire
                          </span>
                          <h4 className="font-black text-lg text-[#1B2A7A]">{d.titre}</h4>
                        </div>

                        {d.date_limite && (
                          <span className="text-xs font-bold text-[#854D0E] bg-[#FFF6E3] px-3 py-1 rounded-full border border-[#FFE15C]">
                            À rendre pour le {formatDate(d.date_limite)}
                          </span>
                        )}
                      </div>

                      {/* Consignes textuelles */}
                      <div className="p-4 rounded-2xl bg-[#FFFBF0] border border-[#FFE15C]/60 text-sm text-[#1B2A7A] whitespace-pre-line leading-relaxed font-medium">
                        {d.consigne}
                      </div>

                      {/* Consigne audio de l'enseignante (si fournie) */}
                      {d.audio_consigne && (
                        <div className="space-y-1">
                          <p className="text-xs font-black text-[#1B2A7A] flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#1B2A7A]" />
                            <span>Modèle de récitation de l'enseignante :</span>
                          </p>
                          <AudioPlayer
                            src={d.audio_consigne}
                            label="Écouter la consigne / prononciation modèle"
                            className="bg-[#FFF6E3] border-[#FFE15C]"
                          />
                        </div>
                      )}

                      {/* SECTION RENDU VOCAL DE L'ÉLÈVE */}
                      <div className="pt-2 border-t border-[#CDBDF2]/40 space-y-3">
                        {rendu && !reRecording ? (
                          /* L'élève a déjà envoyé sa note vocale */
                          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-black text-[#1E7E44] flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-[#1E7E44]" />
                                Récitation envoyée le {formatDate(rendu.created_at)}
                              </span>

                              {/* Statut de la correction */}
                              {rendu.statut === 'valide' && (
                                <span className="text-xs font-extrabold px-3 py-0.5 rounded-full bg-[#1E7E44] text-white flex items-center gap-1 shadow-xs">
                                  <span>🌟 Validé par l'enseignante !</span>
                                </span>
                              )}
                              {rendu.statut === 'a_reviser' && (
                                <span className="text-xs font-extrabold px-3 py-0.5 rounded-full bg-[#854D0E] text-white flex items-center gap-1 shadow-xs">
                                  <span>🔄 À réviser et réenregistrer</span>
                                </span>
                              )}
                              {rendu.statut === 'en_attente' && (
                                <span className="text-xs font-extrabold px-3 py-0.5 rounded-full bg-[#FEF08A] text-[#854D0E] border border-[#FDE047]">
                                  <span>⏳ En attente d'écoute par l'enseignante</span>
                                </span>
                              )}
                            </div>

                            {/* Lecteur de son propre enregistrement */}
                            <AudioPlayer
                              src={rendu.audio_url}
                              label="Votre note vocale enregistrée"
                              className="bg-white border-[#86EFAC]"
                            />

                            {/* Commentaire de la prof */}
                            {rendu.commentaire_prof && (
                              <div className="p-3 rounded-xl bg-white border border-[#86EFAC] space-y-1">
                                <p className="text-xs font-black text-[#1E7E44] flex items-center gap-1.5">
                                  <MessageCircle className="w-3.5 h-3.5" />
                                  <span>Retour de l'enseignante :</span>
                                </p>
                                <p className="text-xs text-gray-700 italic">
                                  « {rendu.commentaire_prof} »
                                </p>
                              </div>
                            )}

                            {/* Bouton pour réenregistrer */}
                            <div className="flex justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => setIsReRecording((prev) => ({ ...prev, [d.id]: true }))}
                                className="text-xs font-bold text-[#1B2A7A] hover:underline flex items-center gap-1"
                              >
                                <Mic className="w-3.5 h-3.5" />
                                <span>Envoyer une nouvelle prise vocale</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Zone d'enregistrement micro */
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black text-[#1B2A7A] flex items-center gap-1.5">
                                <Mic className="w-4 h-4 text-[#1B2A7A]" />
                                <span>Votre enregistrement vocal :</span>
                              </p>
                              {reRecording && (
                                <button
                                  type="button"
                                  onClick={() => setIsReRecording((prev) => ({ ...prev, [d.id]: false }))}
                                  className="text-xs text-gray-400 hover:text-gray-700"
                                >
                                  Annuler et garder l'ancien
                                </button>
                              )}
                            </div>

                            <AudioRecorder
                              label="Appuyez pour réciter au micro"
                              onAudioReady={(base64, duration) => {
                                setTempAudio((prev) => ({
                                  ...prev,
                                  [d.id]: { base64, duration },
                                }));
                              }}
                              onReset={() => {
                                setTempAudio((prev) => {
                                  const n = { ...prev };
                                  delete n[d.id];
                                  return n;
                                });
                              }}
                            />

                            {/* Bouton d'envoi lorsque l'audio est prêt */}
                            {hasRecorded && (
                              <button
                                type="button"
                                onClick={() => handleSubmitAudioRendu(d.id)}
                                disabled={isSubmitting}
                                className="btn-pill-sun text-xs font-black !min-h-[44px] w-full flex items-center justify-center gap-2 shadow-md animate-pulse"
                              >
                                <Send className="w-4 h-4" />
                                <span>
                                  {isSubmitting
                                    ? 'Envoi en cours...'
                                    : 'Envoyer ma récitation à la maîtresse'}
                                </span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Devoirs passés */}
          {devoirsPasses.length > 0 && (
            <div className="cloud-card p-6 space-y-4">
              <h3 className="text-base md:text-lg font-bold text-[#1B2A7A]/70 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Devoirs des séances précédentes</span>
              </h3>

              <div className="space-y-3">
                {devoirsPasses.map((d) => {
                  const rendu = rendus[d.id];

                  return (
                    <div key={d.id} className="p-4 rounded-2xl bg-white/70 border border-gray-200 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-[#1B2A7A]">{d.titre}</span>
                        <span className="text-xs text-gray-400">
                          {d.date_limite && formatDate(d.date_limite)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">{d.consigne}</p>

                      {rendu && (
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                          <span className="text-[11px] text-[#1E7E44] font-bold">
                            ✓ Récitation transmise
                          </span>
                          <AudioPlayer
                            src={rendu.audio_url}
                            label="Réécouter"
                            className="!p-1.5 !text-xs"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: PRÉSENCES */}
      {activeTab === 'presences' && (
        <div className="cloud-card p-6">
          <h3 className="text-lg md:text-xl font-black text-[#1B2A7A] mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#1B2A7A]" />
            Historique des présences
          </h3>

          {presences.length === 0 ? (
            <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-base text-gray-500 font-medium">Aucun historique de présence enregistré</p>
            </div>
          ) : (
            <div className="space-y-3">
              {presences.map((p) => {
                const seance = seances.find((s) => s.id === p.seance_id);
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white border border-[#CDBDF2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-black text-base text-[#1B2A7A]">
                        {seance?.date ? formatDate(seance.date) : 'Séance'}
                      </div>
                      {seance?.theme && (
                        <p className="text-sm text-gray-600 font-medium">
                          Thème : {seance.theme}
                        </p>
                      )}
                    </div>
                    <div>
                      {getPresenceBadge(p.statut)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: APPRÉCIATIONS & PAIEMENTS */}
      {activeTab === 'bilan' && (
        <div className="space-y-6">
          {/* Appréciations mensuelles */}
          <div className="cloud-card p-6">
            <h3 className="text-lg md:text-xl font-black text-[#1B2A7A] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1B2A7A]" />
              Appréciations de l'enseignante
            </h3>

            {appreciations.length === 0 ? (
              <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-base text-gray-500 font-medium">Aucune appréciation pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appreciations.map((app) => (
                  <div key={app.id} className="p-4 rounded-2xl bg-white border border-[#CDBDF2]/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#1B2A7A] uppercase tracking-wide bg-[#CDBDF2]/30 px-3 py-1 rounded-full">
                        Période : {formatPeriod(app.periode)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(app.created_at)}
                      </span>
                    </div>
                    <p className="text-base text-gray-800 whitespace-pre-line leading-relaxed pt-1">
                      {app.texte}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paiements / Cotisations */}
          <div className="cloud-card p-6">
            <h3 className="text-lg md:text-xl font-black text-[#1B2A7A] mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#1B2A7A]" />
              Suivi des paiements
            </h3>

            {paiements.length === 0 ? (
              <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-base text-gray-500 font-medium">Aucun historique de paiement pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paiements.map((paiement) => (
                  <div
                    key={paiement.id}
                    className="p-4 rounded-2xl bg-white border border-[#CDBDF2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-black text-base text-[#1B2A7A]">
                        Mois de {formatPeriod(paiement.mois)}
                      </div>
                      <div className="text-sm text-gray-600 font-medium flex items-center gap-2">
                        <span>Montant : <strong>{paiement.montant} €</strong></span>
                        {paiement.moyen && (
                          <span className="text-xs text-gray-400">({paiement.moyen})</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {paiement.statut === 'paye' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#EAFBF1] text-[#1E7E44] border border-[#C5F3D6]">
                          <CheckCircle2 className="w-4 h-4 text-[#1E7E44]" />
                          Payé {paiement.date_paiement && `le ${formatDate(paiement.date_paiement)}`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FEF08A] text-[#854D0E] border border-[#FDE047]">
                          <Clock className="w-4 h-4 text-[#854D0E]" />
                          En attente de règlement
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating or bottom persistent WhatsApp CTA on mobile */}
      <div className="pt-4 text-center">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1B2A7A] hover:underline"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          <span>Une question ? Écrivez directement à Siham sur WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
