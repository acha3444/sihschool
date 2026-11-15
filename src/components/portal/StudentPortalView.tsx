import React, { useState, useEffect } from 'react';
import { baremeDe, couleurNote, formatNote, moyenne, sur20 } from '../../lib/notes';
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
  const [tempTexte, setTempTexte] = useState<Record<string, string>>({});
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
    const texte = (tempTexte[devoirId] || '').trim();
    if (!audioData?.base64 && !texte) {
      alert('Enregistrez un vocal ou écrivez votre réponse avant d\'envoyer.');
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
            audio_url: audioData?.base64 || null,
            texte_rendu: texte || null,
            duree_secondes: audioData?.duration || 0,
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
        setTempTexte((prev) => ({ ...prev, [devoirId]: '' }));
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
          <span>Cours, Zoom & Annonces</span>
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

      {/* TAB: DEVOIRS AVEC NOTE VOCALE */}
      {activeTab === 'devoirs' && (
        <div className="space-y-6">
          {/* Moyenne de l'élève */}
          {(() => {
            // moyenne ramenée sur 20 (chaque devoir peut avoir son propre barème)
            const notes = Object.values(rendus)
              .filter((r) => r && r.note !== null && r.note !== undefined)
              .map((r) => sur20(r.note, devoirs.find((d) => d.id === r.devoir_id)?.bareme));
            const m = moyenne(notes);
            if (m === null) return null;
            return (
              <div className="cloud-card p-5 flex items-center justify-between gap-4 border-2 border-[#FFE15C]">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#8C6D00]">Moyenne</p>
                  <p className="text-sm font-bold text-[#4A5487]">Sur {notes.length} devoir{notes.length > 1 ? 's' : ''} noté{notes.length > 1 ? 's' : ''}</p>
                </div>
                <span className={`text-3xl font-black px-4 py-1.5 rounded-2xl ${couleurNote(m)}`}>{formatNote(m)}<span className="text-base font-bold">/20</span></span>
              </div>
            );
          })()}

          {/* Devoirs à faire */}
          <div className="cloud-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#CDBDF2]/40 pb-3">
              <div>
                <h3 className="text-lg md:text-xl font-black text-[#1B2A7A] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1B2A7A]" />
                  Devoirs
                </h3>
                <p className="text-xs text-[#4A5487] font-semibold">
                  Répondez à l'oral (vocal) ou à l'écrit, puis envoyez votre réponse à votre enseignante.
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
                                {rendu.audio_url || rendu.texte_rendu ? `Réponse envoyée le ${formatDate(rendu.created_at)}` : "Noté par l'enseignante"}
                              </span>

                              {rendu.note !== null && rendu.note !== undefined && (
                                <span className={`text-sm font-black px-3 py-0.5 rounded-full ${couleurNote(sur20(rendu.note, d.bareme))}`}>
                                  Note : {formatNote(rendu.note)}/{formatNote(baremeDe(d.bareme))}
                                </span>
                              )}

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

                            {/* Réponse écrite envoyée */}
                            {rendu.texte_rendu && (
                              <div className="p-3 rounded-xl bg-white border border-[#86EFAC]">
                                <p className="text-xs font-black text-[#1E7E44] mb-1">Votre réponse écrite :</p>
                                <p className="text-sm text-[#1B2A7A] whitespace-pre-wrap">{rendu.texte_rendu}</p>
                              </div>
                            )}

                            {/* Lecteur de son propre enregistrement */}
                            {rendu.audio_url && (
                              <AudioPlayer
                                src={rendu.audio_url}
                                label="Votre note vocale enregistrée"
                                className="bg-white border-[#86EFAC]"
                              />
                            )}

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
                                <span>{rendu.audio_url || rendu.texte_rendu ? 'Modifier ma réponse' : 'Envoyer ma réponse'}</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Zone d'enregistrement micro */
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-black text-[#1B2A7A] flex items-center gap-1.5">
                                <Mic className="w-4 h-4 text-[#1B2A7A]" />
                                <span>Votre réponse (vocal et/ou écrit) :</span>
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

                            {/* Réponse écrite */}
                            <textarea
                              value={tempTexte[d.id] || ''}
                              onChange={(e) => setTempTexte((prev) => ({ ...prev, [d.id]: e.target.value }))}
                              placeholder="Ou écrivez votre réponse ici…"
                              rows={4}
                              dir="auto"
                              className="w-full p-3 rounded-2xl bg-white border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-sm font-semibold text-[#1B2A7A]"
                            />

                            {/* Bouton d'envoi lorsque le vocal ou l'écrit est prêt */}
                            {(hasRecorded || (tempTexte[d.id] || '').trim().length > 0) && (
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
                                    : 'Envoyer ma réponse à la maîtresse'}
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
                        <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-[11px] text-[#1E7E44] font-bold">
                            {rendu.audio_url || rendu.texte_rendu ? '✓ Réponse transmise' : '✓ Noté'}
                          </span>
                          {rendu.note !== null && rendu.note !== undefined && (
                            <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${couleurNote(sur20(rendu.note, d.bareme))}`}>
                              {formatNote(rendu.note)}/{formatNote(baremeDe(d.bareme))}
                            </span>
                          )}
                          {rendu.audio_url && (
                            <AudioPlayer src={rendu.audio_url} label="Réécouter" className="!p-1.5 !text-xs" />
                          )}
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
