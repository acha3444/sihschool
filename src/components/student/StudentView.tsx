import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NOURANIA_LECONS, BADGES_LIST } from '../../data/curriculum';
import { AvatarDisplay } from '../common/AvatarDisplay';
import { AudioRecorder } from '../common/AudioRecorder';
import { Sunburst } from '../common/Sunburst';
import { Lecon, Devoir } from '../../types';
import {
  Flame,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle,
  Lock,
  Award,
  BookOpen,
  Volume2,
  FileText,
  Send,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  Info,
  X,
  ArrowRight,
  Video,
} from 'lucide-react';

import { arabicAudio } from '../../utils/arabicAudio';

interface StudentViewProps {
  currentTab: string;
  onNavigateTab: (tabId: string) => void;
}

export const StudentView: React.FC<StudentViewProps> = ({ currentTab, onNavigateTab }) => {
  const {
    currentUser,
    groupes,
    groupeEleves,
    seances,
    progressions,
    modulesLitteraire,
    devoirs,
    rendus,
    appreciations,
    badgesEleve,
    submitRendu,
  } = useApp();

  const [selectedLecon, setSelectedLecon] = useState<Lecon | null>(null);
  const [activeAudioDevoir, setActiveAudioDevoir] = useState<string | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<{ [devoirId: string]: string }>({});
  const [activePlayingLetter, setActivePlayingLetter] = useState<string | null>(null);
  const [isPlayingDevoirAudio, setIsPlayingDevoirAudio] = useState<string | null>(null);

  if (!currentUser) return null;

  const studentGroupLink = groupeEleves.find((ge) => ge.eleve_id === currentUser.id);
  const studentGroup = studentGroupLink ? groupes.find((g) => g.id === studentGroupLink.groupe_id) : undefined;

  const nextSession = seances
    .filter((s) => s.groupe_id === studentGroup?.id && !s.effectuee)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const studentProg = progressions.filter((p) => p.eleve_id === currentUser.id);
  const validatedCount = studentProg.filter((p) => p.statut === 'validee').length;
  const nouraniaPercent = Math.round((validatedCount / 17) * 100);

  const studentModules = modulesLitteraire.filter((m) => m.eleve_id === currentUser.id);
  const studentDevoirs = devoirs.filter(
    (d) => d.groupe_id === studentGroup?.id || d.eleve_id === currentUser.id
  );
  const earnedBadgeIds = badgesEleve.filter((b) => b.eleve_id === currentUser.id).map((b) => b.badge_id);
  const studentAppreciations = appreciations.filter((a) => a.eleve_id === currentUser.id);

  const handleAudioReady = (devoirId: string, url: string) => {
    setRecordedAudioUrl((prev) => ({ ...prev, [devoirId]: url }));
  };

  const handleSendHomework = (devoirId: string) => {
    const audio = recordedAudioUrl[devoirId] || 'audio-mock-student.webm';
    submitRendu(devoirId, currentUser.id, audio);
  };

  const handlePlayLetter = (lettre: string) => {
    setActivePlayingLetter(lettre);
    arabicAudio.speak(lettre, {
      rate: 0.8,
      onEnd: () => setActivePlayingLetter(null),
      onError: () => setActivePlayingLetter(null),
    });
  };


  const handleToggleDevoirAudio = (devoir: Devoir) => {
    if (isPlayingDevoirAudio === devoir.id) {
      arabicAudio.stop();
      setIsPlayingDevoirAudio(null);
      return;
    }

    setIsPlayingDevoirAudio(devoir.id);

    const sampleKeyOrText =
      devoir.id && (devoir.id === 'devoir-1' || devoir.id === 'devoir-2' || devoir.id === 'devoir-3')
        ? devoir.id
        : 'أَبْ أُمّ أَخْ أُخْت جَدّ جَدَّة . هٰذَا أَبِي وَهٰذِهِ أُمِّي.';

    arabicAudio.speak(sampleKeyOrText, {
      onEnd: () => setIsPlayingDevoirAudio(null),
      onError: () => setIsPlayingDevoirAudio(null),
    });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-fadeIn max-w-5xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          1. TAB : ACCUEIL ÉCOLIER (DOUX & CHALEUREUX)
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'accueil' && (
        <div className="space-y-6">
          {/* Main Greeting Cloud Card */}
          <div className="cloud-card p-6 sm:p-8 border-4 border-white shadow-cloud-pop relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <AvatarDisplay avatarKey={currentUser.avatar} size="xl" className="shadow-sun-glow ring-4 ring-white" />

              <div className="flex-1 space-y-2">
                <div className="inline-flex items-center gap-2">
                  <span className="badge-lavender">
                    <Sparkles className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
                    Cahier d’apprentissage
                  </span>
                  <Sunburst size="sm" />
                </div>

                <h1 className="font-baloo font-extrabold text-3xl sm:text-4xl text-[#1B2A7A]">
                  Salam <span className="underline decoration-[#FFE15C] decoration-wavy">{currentUser.prenom}</span> !
                </h1>

                <p className="font-arabic text-3xl text-[#E5483D] font-bold" dir="rtl">
                  أَهْلًا وَسَهْلًا بِكَ يَا بَطَل
                </p>

                <p className="text-xs sm:text-sm text-[#4A5487] font-baloo font-semibold">
                  Bienvenue dans ton cahier magique pour apprendre à lire la belle langue du Coran.
                </p>
              </div>

              {/* 7-day Streak Flame (Jaune soleil #FFE15C) */}
              <div className="flex flex-col items-center justify-center p-4 rounded-3xl bg-[#FFE15C] border-2 border-white shadow-sun-glow shrink-0 animate-bounce-subtle">
                <Flame className="w-8 h-8 text-[#1B2A7A] fill-current" strokeWidth={2.5} />
                <span className="font-baloo font-black text-2xl text-[#1B2A7A] leading-tight mt-1">
                  7 JOURS
                </span>
                <span className="text-[10px] uppercase font-bold text-[#1B2A7A] tracking-wider">
                  Série active
                </span>
              </div>
            </div>
          </div>

          {/* Quick Info Grid : Prochain Cours & Progression */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prochain Cours Cloud Card */}
            <div className="cloud-card p-5 border-2 border-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-lavender text-xs">
                  <Calendar className="w-3.5 h-3.5" strokeWidth={2.5} /> Prochain cours
                </span>
                <span className="text-[11px] bg-[#FFFFFF] text-[#1B2A7A] font-extrabold px-3 py-1 rounded-full border border-[#CDBDF2]">
                  {studentGroup?.public === 'femmes' ? 'Groupe Femmes' : 'Groupe Enfants'}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-baloo font-extrabold text-xl text-[#1B2A7A]">
                  {studentGroup?.nom || 'Cours de Nourania'}
                </h3>
                <p className="text-xs text-[#1B2A7A] font-bold flex items-center gap-1.5 font-baloo">
                  <Clock className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
                  {studentGroup?.creneau || 'Mercredi 14h00'}
                </p>
                <p className="text-xs text-[#4A5487] flex items-center gap-1.5 font-baloo font-medium">
                  <Info className="w-3.5 h-3.5 text-[#4A5487]" strokeWidth={2.5} />
                  {studentGroup?.lieu_ou_lien || 'Visio en direct sur Zoom (1h30)'}
                </p>
              </div>

              {/* Direct Zoom Join Button */}
              <div className="pt-2">
                <a
                  href="https://zoom.us/join"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill-sun w-full !min-h-[42px] !text-xs !py-2 flex items-center justify-center gap-2 shadow-sm hover:scale-102 transition-transform"
                >
                  <Video className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                  <span>Rejoindre la visio Zoom (1h30)</span>
                </a>
              </div>

              {nextSession && (
                <div className="pt-2 border-t border-[#CDBDF2]/40 flex items-center justify-between text-xs font-baloo">
                  <span className="text-[#4A5487]">Thème prévu :</span>
                  <span className="text-[#1B2A7A] font-extrabold truncate max-w-[200px]">
                    {nextSession.theme || 'Exercices de récitation'}
                  </span>
                </div>
              )}
            </div>

            {/* Progression Nourania Card */}
            <div className="cloud-card p-5 border-2 border-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-lavender text-xs">
                  <BookOpen className="w-3.5 h-3.5" strokeWidth={2.5} /> Parcours Nourania
                </span>
                <span className="text-sm font-black text-[#1B2A7A] font-baloo bg-[#FFE15C] px-2.5 py-0.5 rounded-full">
                  {nouraniaPercent}%
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-baloo font-bold">
                  <span className="text-[#1B2A7A]">Leçons validées :</span>
                  <span className="text-[#1B2A7A]">{validatedCount} / 17 leçons</span>
                </div>
                <div className="w-full h-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FFE15C] to-[#CDBDF2] transition-all duration-700"
                    style={{ width: `${nouraniaPercent}%` }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => onNavigateTab('nourania')}
                className="btn-pill-white w-full !min-h-[42px] !text-xs !py-2"
              >
                <span>Ouvrir la carte des 17 leçons</span>
                <ArrowRight className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* School Notebook Illustration Banner */}
          <div className="cloud-card p-5 border-2 border-white flex flex-col sm:flex-row items-center gap-5 shadow-soft-blue">
            <img
              src="/illustrations/school-notebook.jpg"
              alt="Illustration d'un cahier d'écolier illustré pour les devoirs de récitation orale et de lecture de la méthode Nourania"
              className="w-full sm:w-48 h-32 object-cover rounded-2xl border-2 border-[#CDBDF2]"
            />
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="inline-flex items-center gap-2">
                <Sunburst size="sm" />
                <span className="badge-lavender text-xs">Devoirs de lecture</span>
              </div>
              <h3 className="font-baloo font-extrabold text-lg text-[#1B2A7A]">
                {studentDevoirs[0]?.titre || 'Récitation du Tanwin'}
              </h3>
              <p className="text-xs text-[#4A5487] font-baloo">
                Écoute le professeur et enregistre ta voix pour gagner de nouveaux badges !
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab('devoirs')}
                className="btn-pill-sun !min-h-[42px] !text-xs !py-2"
              >
                <span>Faire mon devoir audio</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. TAB : NOURANIA (17 LEÇONS AVEC LETTRES ROUGE / BLEU 32PX)
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'nourania' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="cloud-card p-6 sm:p-7 border-4 border-white space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sunburst size="sm" />
                  <span className="badge-lavender text-xs uppercase font-extrabold font-baloo">
                    Méthode Officielle Nourania
                  </span>
                </div>
                <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A] mt-1">
                  Le Grand Voyage des 17 Leçons
                </h2>
                <p className="font-arabic text-2xl text-[#E5483D] font-bold" dir="rtl">
                  القَاعِدَةُ النُّورَانِيَّة (17 دَرْسًا)
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-3xl font-black font-baloo text-[#1B2A7A] bg-[#FFE15C] px-3 py-1 rounded-full shadow-sm">
                  {nouraniaPercent}%
                </span>
                <p className="text-xs text-[#4A5487] mt-1 font-baloo font-bold">
                  {validatedCount} leçons réussies sur 17
                </p>
              </div>
            </div>

            <div className="w-full h-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] p-0.5 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFE15C] via-[#CDBDF2] to-[#A9D8F5] transition-all duration-700"
                style={{ width: `${nouraniaPercent}%` }}
              />
            </div>
          </div>

          {/* 17 Lessons Cloud Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {NOURANIA_LECONS.map((lecon) => {
              const statusObj = studentProg.find((p) => p.lecon_id === lecon.id);
              const statut = statusObj ? statusObj.statut : lecon.numero === 1 ? 'en_cours' : 'verrouillee';

              return (
                <div
                  key={lecon.id}
                  onClick={() => setSelectedLecon(lecon)}
                  className={`cloud-card p-5 border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    statut === 'validee'
                      ? 'border-[#FFE15C] bg-[#FFF6E3] hover:shadow-sun-glow'
                      : statut === 'en_cours'
                      ? 'border-[#CDBDF2] bg-[#FFFFFF] shadow-cloud-pop'
                      : 'border-white/80 bg-[#FFF6E3]/70 opacity-60 hover:opacity-85'
                  }`}
                >
                  {/* Top Badge & Number */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-baloo font-extrabold text-sm shadow-sm ${
                        statut === 'validee'
                          ? 'bg-[#FFE15C] text-[#1B2A7A]'
                          : statut === 'en_cours'
                          ? 'bg-[#CDBDF2] text-[#1B2A7A]'
                          : 'bg-[#FFFFFF] text-[#4A5487] border border-[#CDBDF2]'
                      }`}
                    >
                      {statut === 'validee' ? (
                        <CheckCircle className="w-5 h-5 text-[#1B2A7A]" strokeWidth={2.5} />
                      ) : statut === 'verrouillee' ? (
                        <Lock className="w-4 h-4 text-[#4A5487]" strokeWidth={2.5} />
                      ) : (
                        lecon.numero
                      )}
                    </span>

                    <span
                      className={`text-[11px] font-extrabold font-baloo px-3 py-1 rounded-full ${
                        statut === 'validee'
                          ? 'bg-[#FFE15C] text-[#1B2A7A]'
                          : statut === 'en_cours'
                          ? 'bg-[#CDBDF2] text-[#1B2A7A]'
                          : 'bg-[#FFFFFF] text-[#4A5487] border border-[#CDBDF2]'
                      }`}
                    >
                      {statut === 'validee' ? 'Validée ✓' : statut === 'en_cours' ? 'En cours' : 'À venir'}
                    </span>
                  </div>

                  {/* Title & Arabic */}
                  <div className="space-y-1 flex-1">
                    <h3 className="font-baloo font-extrabold text-base text-[#1B2A7A] leading-tight">
                      {lecon.titre}
                    </h3>
                    <p className="font-arabic text-xl text-[#2F5BD1] leading-relaxed font-bold" dir="rtl">
                      {lecon.titre_arabe}
                    </p>
                    <p className="text-xs text-[#4A5487] line-clamp-2 leading-relaxed font-baloo">
                      {lecon.description}
                    </p>
                  </div>

                  {/* Mini School Notebook cards with alternating Red #E5483D & Blue #2F5BD1 (min 32px) */}
                  {lecon.lettres_exemples && lecon.lettres_exemples.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#CDBDF2]/40 flex items-center justify-center gap-2 overflow-x-auto py-1">
                      {lecon.lettres_exemples.slice(0, 4).map((lettre, idx) => {
                        const isRed = idx % 2 === 0;
                        const isPlaying = activePlayingLetter === lettre;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayLetter(lettre);
                            }}
                            className={`notebook-tile px-2 py-1 min-w-[42px] text-center cursor-pointer transition-all ${
                              isPlaying ? 'ring-2 ring-[#FFE15C] scale-110 bg-[#FFF6E3]' : ''
                            }`}
                            title="Touche pour écouter"
                          >
                            <span
                              className={`font-arabic text-[32px] font-bold leading-none ${
                                isRed ? 'text-[#E5483D]' : 'text-[#2F5BD1]'
                              }`}
                            >
                              {lettre}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Detail Lesson Modal with Big Interactive Notebook Tiles (>32px) */}
          {selectedLecon && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
              <div className="w-full max-w-lg cloud-card p-6 sm:p-8 border-4 border-white shadow-cloud-pop space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-[#CDBDF2]/50">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-[#FFE15C] text-[#1B2A7A] font-baloo font-extrabold flex items-center justify-center text-sm shadow-sm">
                      {selectedLecon.numero}
                    </span>
                    <span className="badge-lavender text-xs">Méthode Nourania</span>
                  </div>
                  <button
                    onClick={() => {
                      arabicAudio.stop();
                      setActivePlayingLetter(null);
                      setSelectedLecon(null);
                    }}
                    className="w-9 h-9 rounded-full bg-[#FFFFFF] hover:bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center border border-[#CDBDF2] transition-colors"
                  >
                    <X className="w-5 h-5" strokeWidth={2.5} />
                  </button>
                </div>

                <div className="space-y-1.5 text-center">
                  <h3 className="font-baloo font-extrabold text-2xl text-[#1B2A7A]">
                    {selectedLecon.titre}
                  </h3>
                  <p className="font-arabic text-3xl text-[#2F5BD1] font-bold" dir="rtl">
                    {selectedLecon.titre_arabe}
                  </p>
                  <p className="text-xs text-[#4A5487] leading-relaxed font-baloo font-medium">
                    {selectedLecon.description}
                  </p>
                </div>

                {/* Big Arabic letters in interactive notebook tiles alternating Red #E5483D & Blue #2F5BD1 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-xs font-extrabold font-baloo text-[#1B2A7A] uppercase tracking-wider">
                      Lettres & Exemples (32px+) :
                    </label>
                    <span className="text-[11px] font-baloo font-bold text-[#E5483D] flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5" strokeWidth={2.5} /> Touche une lettre pour l’écouter !
                    </span>
                  </div>

                  <div
                    className="flex flex-wrap items-center justify-center gap-2.5 p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2]"
                    dir="rtl"
                  >
                    {selectedLecon.lettres_exemples?.map((lettre, idx) => {
                      const isRed = idx % 2 === 0;
                      const isHighlighted = activePlayingLetter === lettre;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handlePlayLetter(lettre)}
                          className={`notebook-tile px-3.5 py-1.5 flex items-center justify-center min-w-[52px] min-h-[52px] relative cursor-pointer active:scale-95 transition-all ${
                            isHighlighted
                              ? 'ring-4 ring-[#FFE15C] scale-110 shadow-sun-glow bg-[#FFF6E3]'
                              : 'hover:scale-105'
                          }`}
                          title={`Écouter ${lettre}`}
                        >
                          <span
                            className={`font-arabic text-[36px] font-bold leading-none ${
                              isRed ? 'text-[#E5483D]' : 'text-[#2F5BD1]'
                            }`}
                          >
                            {lettre}
                          </span>
                          {isHighlighted && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#FFE15C] flex items-center justify-center shadow-sm">
                              <Volume2 className="w-2.5 h-2.5 text-[#1B2A7A]" strokeWidth={2.5} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Simple Close Button */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      arabicAudio.stop();
                      setActivePlayingLetter(null);
                      setSelectedLecon(null);
                    }}
                    className="btn-pill-white !min-h-[44px] !text-xs px-6 shadow-sm"
                  >
                    <span>Fermer la leçon</span>
                    <ArrowRight className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. TAB : ARABE LITTÉRAIRE
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'litteraire' && (
        <div className="space-y-6">
          <div className="cloud-card p-6 sm:p-7 border-4 border-white space-y-2">
            <span className="badge-lavender text-xs">Programme Linguistique</span>
            <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
              Arabe Littéraire & Expression
            </h2>
            <p className="font-arabic text-2xl text-[#2F5BD1] font-bold" dir="rtl">
              اللُّغَةُ العَرَبِيَّةُ الفُصْحَى
            </p>
            <p className="text-xs text-[#4A5487] max-w-xl font-baloo">
              Les 4 piliers du cahier : vocabulaire, grammaire, lecture fluide et tracé calligraphique.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {studentModules.map((mod, i) => (
              <div
                key={mod.id}
                className="cloud-card p-6 border-2 border-white space-y-4 shadow-soft-blue"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-baloo font-extrabold text-xl text-[#1B2A7A]">{mod.nom}</h3>
                    <p
                      className={`font-arabic text-2xl font-bold mt-0.5 ${
                        i % 2 === 0 ? 'text-[#E5483D]' : 'text-[#2F5BD1]'
                      }`}
                      dir="rtl"
                    >
                      {mod.nom_arabe}
                    </p>
                  </div>
                  <span className="text-base font-black font-baloo text-[#1B2A7A] bg-[#FFE15C] px-3 py-1 rounded-full shadow-sm">
                    {mod.pourcentage}%
                  </span>
                </div>

                <div className="w-full h-3 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] p-0.5 shadow-inner">
                  <div
                    className="h-full rounded-full bg-[#FFE15C] transition-all duration-700 shadow-sm"
                    style={{ width: `${mod.pourcentage}%` }}
                  />
                </div>

                <div className="space-y-1 text-xs font-baloo">
                  <p className="text-[#4A5487]">
                    Niveau actuel : <span className="text-[#1B2A7A] font-extrabold">{mod.niveau}</span>
                  </p>
                  <p className="text-[#4A5487]">
                    Prochain objectif :{' '}
                    <span className="text-[#1B2A7A] font-bold underline decoration-[#CDBDF2]">
                      {mod.prochain_objectif}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. TAB : MES DEVOIRS (ENREGISTREUR VOCAL INTÉGRÉ)
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'devoirs' && (
        <div className="space-y-6">
          <div className="cloud-card p-6 sm:p-7 border-4 border-white space-y-2">
            <span className="badge-lavender text-xs">Cahier de Devoirs</span>
            <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
              Mes Devoirs & Audios
            </h2>
            <p className="text-xs text-[#4A5487] max-w-xl font-baloo">
              Écoute le modèle audio de ton professeur, puis enregistre ta voix directement avec le gros bouton jaune !
            </p>
          </div>

          <div className="space-y-4">
            {studentDevoirs.map((devoir) => {
              const rendu = rendus.find((r) => r.devoir_id === devoir.id && r.eleve_id === currentUser.id);
              const isDone = rendu?.statut === 'rendu' || rendu?.statut === 'corrige';

              return (
                <div
                  key={devoir.id}
                  className="cloud-card p-6 border-2 border-white space-y-4 shadow-soft-blue"
                >
                  {/* Title & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-baloo font-extrabold text-lg text-[#1B2A7A]">
                          {devoir.titre}
                        </h3>
                        {isDone ? (
                          <span className="badge-lavender text-[11px] !py-0.5">
                            <CheckCircle className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
                            {rendu?.statut === 'corrige' ? 'Corrigé' : 'Rendu ✓'}
                          </span>
                        ) : (
                          <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-[#FFE15C] text-[#1B2A7A] shadow-sm font-baloo">
                            À faire
                          </span>
                        )}
                      </div>
                      {devoir.titre_arabe && (
                        <p className="font-arabic text-xl text-[#2F5BD1] mt-0.5 font-bold" dir="rtl">
                          {devoir.titre_arabe}
                        </p>
                      )}
                    </div>

                    <span className="text-xs text-[#4A5487] flex items-center gap-1 font-baloo font-bold">
                      <Clock className="w-3.5 h-3.5 text-[#E5483D]" strokeWidth={2.5} />
                      Date limite : {devoir.date_limite}
                    </span>
                  </div>

                  {/* Consigne */}
                  <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] font-baloo leading-relaxed shadow-inner">
                    <p className="font-extrabold text-[#1B2A7A] mb-1">Consigne du professeur :</p>
                    <p>{devoir.consigne}</p>
                  </div>

                  {/* Attachment & Audio Model */}
                  <div className="flex flex-wrap items-center gap-3">
                    {devoir.fichiers?.map((f, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#FFFFFF] border border-[#CDBDF2] text-xs text-[#1B2A7A] font-baloo font-bold shadow-sm"
                      >
                        <FileText className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                        <span>{f.nom}</span>
                        <span className="text-[10px] text-[#4A5487]">({f.taille})</span>
                      </div>
                    ))}

                    {devoir.audio_prof && (
                      <button
                        type="button"
                        onClick={() => handleToggleDevoirAudio(devoir)}
                        className={`btn-pill-sun !min-h-[40px] !text-xs !py-1.5 flex items-center gap-2 ${
                          isPlayingDevoirAudio === devoir.id ? 'ring-4 ring-white shadow-sun-glow' : ''
                        }`}
                      >
                        {isPlayingDevoirAudio === devoir.id ? (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-3.5 bg-[#1B2A7A] rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-5 bg-[#1B2A7A] rounded-full animate-bounce [animation-delay:0.15s]"></span>
                              <span className="w-1.5 h-3 bg-[#1B2A7A] rounded-full animate-bounce [animation-delay:0.3s]"></span>
                            </div>
                            <span>Arrêter l’audio modèle</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                            <span>Écouter le modèle audio de l’enseignant</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Active playing box with animated soundwaves */}
                  {isPlayingDevoirAudio === devoir.id && (
                    <div className="p-3.5 rounded-3xl bg-[#FFF6E3] border-2 border-[#FFE15C] flex items-center justify-between font-baloo animate-fadeIn shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-[#FFE15C] flex items-center justify-center">
                          <Volume2 className="w-5 h-5 text-[#1B2A7A] animate-pulse" strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-xs font-extrabold text-[#1B2A7A]">
                            Lecture modèle par l’enseignant en cours...
                          </p>
                          <p className="text-[11px] text-[#4A5487]">
                            Écoute attentivement l’articulation des lettres avant d’enregistrer ta voix !
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleDevoirAudio(devoir)}
                        className="badge-lavender text-xs !py-1 hover:scale-105"
                      >
                        Arrêter
                      </button>
                    </div>
                  )}

                  {/* Teacher Feedback */}
                  {rendu?.statut === 'corrige' && (
                    <div className="p-4 rounded-3xl bg-[#CDBDF2]/40 border-2 border-[#CDBDF2] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-[#1B2A7A] font-baloo">
                          Appréciation du professeur :
                        </span>
                        {rendu.note_ou_mention && (
                          <span className="badge-lavender text-xs font-black">
                            {rendu.note_ou_mention}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#1B2A7A] leading-relaxed italic font-baloo font-semibold">
                        « {rendu.commentaire_prof} »
                      </p>
                    </div>
                  )}

                  {/* Voice recording section if not yet done */}
                  {!isDone && (
                    <div className="pt-2 space-y-3">
                      <AudioRecorder
                        label="Enregistrer ma récitation vocale"
                        onAudioReady={(url) => handleAudioReady(devoir.id, url)}
                      />

                      <button
                        type="button"
                        onClick={() => handleSendHomework(devoir.id)}
                        className="btn-pill-sun w-full"
                      >
                        <Send className="w-4 h-4" strokeWidth={2.5} />
                        <span>J’ai fini · Transmettre ma lecture au professeur</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. TAB : BADGES & APPRÉCIATIONS
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'badges' && (
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-baloo font-extrabold text-2xl text-[#1B2A7A]">
                  Mes Récompenses & Badges
                </h3>
                <p className="text-xs text-[#4A5487] font-baloo">
                  {earnedBadgeIds.length} trophée(s) d’apprentissage débloqué(s)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {BADGES_LIST.map((badge) => {
                const isUnlocked = earnedBadgeIds.includes(badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`cloud-card p-4 text-center flex flex-col items-center justify-between gap-2 border-2 transition-all ${
                      isUnlocked
                        ? 'border-[#FFE15C] bg-[#FFF6E3] shadow-sun-glow'
                        : 'border-white bg-[#FFF6E3]/60 opacity-50 grayscale'
                    }`}
                  >
                    <div
                      className={`w-14 h-14 rounded-[22px] flex items-center justify-center shadow-sm ${
                        isUnlocked ? 'bg-[#FFE15C] text-[#1B2A7A]' : 'bg-[#FFFFFF] text-[#4A5487]'
                      }`}
                    >
                      <Award className="w-8 h-8 text-[#1B2A7A]" strokeWidth={2.5} />
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="font-baloo font-extrabold text-sm text-[#1B2A7A] leading-tight">
                        {badge.titre}
                      </h4>
                      <p className="font-arabic text-lg text-[#E5483D] font-bold" dir="rtl">
                        {badge.titre_arabe}
                      </p>
                      <p className="text-[11px] text-[#4A5487] leading-snug font-baloo">
                        {badge.description}
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-3 py-0.5 rounded-full mt-1 font-baloo ${
                        isUnlocked
                          ? 'bg-[#CDBDF2] text-[#1B2A7A]'
                          : 'bg-[#FFFFFF] text-[#4A5487] border border-[#CDBDF2]'
                      }`}
                    >
                      {isUnlocked ? 'Débloqué ✓' : 'À débloquer'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teacher Appreciations List */}
          <div className="space-y-4 pt-4 border-t border-[#CDBDF2]/40">
            <h3 className="font-baloo font-extrabold text-2xl text-[#1B2A7A] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#1B2A7A]" strokeWidth={2.5} />
              Les Mots de mon Professeur
            </h3>

            <div className="space-y-3">
              {studentAppreciations.map((app) => (
                <div
                  key={app.id}
                  className="cloud-card p-5 border-2 border-white space-y-2 shadow-soft-blue"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="badge-lavender text-xs">Oustadha Fatima</span>
                      {app.badge_rapide && (
                        <span className="text-[11px] bg-[#FFE15C] text-[#1B2A7A] font-extrabold px-3 py-0.5 rounded-full font-baloo shadow-sm">
                          {app.badge_rapide}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#4A5487] font-baloo font-bold">{app.date}</span>
                  </div>

                  <p className="text-xs text-[#1B2A7A] leading-relaxed italic font-baloo font-semibold">
                    « {app.texte} »
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Reminder */}
          <div className="cloud-card p-4 border-2 border-white text-center text-xs text-[#4A5487] flex items-center justify-center gap-2 font-baloo font-bold">
            <ShieldCheck className="w-4 h-4 text-[#1B2A7A] shrink-0" strokeWidth={2.5} />
            <span>
              Espace sécurisé : l’élève échange uniquement les devoirs avec son enseignant.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
