import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AvatarDisplay } from '../common/AvatarDisplay';
import { generatePdfReceipt } from '../../utils/pdfReceipt';
import { NOURANIA_LECONS } from '../../data/curriculum';
import { Sunburst } from '../common/Sunburst';
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Send,
  Download,
  CreditCard,
  MessageCircle,
  Megaphone,
  BookOpen,
  Sparkles,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

interface ParentViewProps {
  currentTab: string;
  onNavigateTab: (tabId: string) => void;
}

export const ParentView: React.FC<ParentViewProps> = ({ currentTab, onNavigateTab }) => {
  const {
    currentUser,
    selectedChild,
    getChildrenOfParent,
    setSelectedChildId,
    groupes,
    groupeEleves,
    seances,
    presences,
    progressions,
    devoirs,
    rendus,
    appreciations,
    paiements,
    conversations,
    messages,
    annonces,
    reportAbsence,
    sendMessage,
    users,
  } = useApp();

  const [absenceMotif, setAbsenceMotif] = useState('');
  const [absenceSeanceId, setAbsenceSeanceId] = useState('');
  const [absenceSuccess, setAbsenceSuccess] = useState(false);
  const [chatInput, setChatInput] = useState('');

  if (!currentUser) return null;

  const children = getChildrenOfParent(currentUser.id);
  const activeChild = selectedChild || (children.length > 0 ? children[0] : null);

  if (!activeChild) {
    return (
      <div className="p-8 text-center text-[#4A5487] font-baloo font-bold">
        Aucun enfant rattaché à ce compte parent.
      </div>
    );
  }

  const childGroupLink = groupeEleves.find((ge) => ge.eleve_id === activeChild.id);
  const childGroup = childGroupLink ? groupes.find((g) => g.id === childGroupLink.groupe_id) : undefined;

  const childPresences = presences.filter((p) => p.eleve_id === activeChild.id);
  const totalSessions = childPresences.length;
  const presentCount = childPresences.filter((p) => p.statut === 'present').length;
  const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;
  const lastPresence = childPresences[childPresences.length - 1];

  const childProg = progressions.filter((p) => p.eleve_id === activeChild.id);
  const validatedLessons = childProg.filter((p) => p.statut === 'validee');
  const nouraniaPercent = Math.round((validatedLessons.length / 17) * 100);

  const childAppreciations = appreciations.filter((a) => a.eleve_id === activeChild.id);
  const lastAppreciation = childAppreciations[0];

  const childDevoirs = devoirs.filter(
    (d) => d.groupe_id === childGroup?.id || d.eleve_id === activeChild.id
  );
  const childPayments = paiements.filter((p) => p.eleve_id === activeChild.id);

  const activeConversation = conversations.find(
    (c) => c.parent_id === currentUser.id && c.eleve_id === activeChild.id
  );
  const conversationMessages = activeConversation
    ? messages.filter((m) => m.conversation_id === activeConversation.id)
    : [];

  const handleReportAbsenceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!absenceSeanceId || !absenceMotif) return;
    reportAbsence(activeChild.id, absenceSeanceId, absenceMotif);
    setAbsenceSuccess(true);
    setAbsenceMotif('');
    setTimeout(() => setAbsenceSuccess(false), 4000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeConversation) return;
    sendMessage(activeConversation.id, chatInput.trim());
    setChatInput('');
  };

  const upcomingSessions = seances
    .filter((s) => s.groupe_id === childGroup?.id && !s.effectuee)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-fadeIn max-w-5xl mx-auto">
      {/* ─── MULTI-CHILD PASTILLES ─── */}
      {children.length > 1 && (
        <div className="cloud-card p-3 border-2 border-white flex items-center justify-between">
          <span className="text-xs font-extrabold font-baloo text-[#1B2A7A] pl-2 uppercase tracking-wider">
            Enfant suivi :
          </span>
          <div className="flex gap-2">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-baloo font-bold text-xs transition-all ${
                  activeChild.id === child.id
                    ? 'bg-[#FFE15C] text-[#1B2A7A] shadow-sun-glow scale-105 font-black'
                    : 'bg-[#FFFFFF] text-[#4A5487] border border-[#CDBDF2]'
                }`}
              >
                <AvatarDisplay avatarKey={child.avatar} size="sm" />
                <span>{child.prenom}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          1. TAB : DASHBOARD (TABLEAU DE BORD PARENT)
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="cloud-card p-6 sm:p-8 border-4 border-white shadow-cloud-pop flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AvatarDisplay avatarKey={activeChild.avatar} size="lg" className="ring-4 ring-[#CDBDF2]" />
              <div>
                <div className="inline-flex items-center gap-2">
                  <span className="badge-lavender text-xs">Suivi maternel bienveillant</span>
                  <Sunburst size="sm" />
                </div>
                <h1 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
                  {activeChild.prenom} {activeChild.nom}
                </h1>
                <p className="text-xs text-[#4A5487] font-baloo font-bold">
                  Groupe : <span className="text-[#1B2A7A]">{childGroup?.nom || 'Nourania Débutants'}</span>
                </p>
              </div>
            </div>

            {/* Attendance & Progress Pills */}
            <div className="flex gap-3">
              <div className="px-5 py-2.5 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] text-center shadow-sm">
                <span className="text-xs text-[#4A5487] block font-baloo font-bold">Assiduité</span>
                <span className="font-baloo font-black text-2xl text-[#1B2A7A]">{attendanceRate}%</span>
              </div>
              <div className="px-5 py-2.5 rounded-3xl bg-[#FFE15C] border-2 border-white text-center shadow-sun-glow">
                <span className="text-xs text-[#1B2A7A] block font-baloo font-extrabold">Nourania</span>
                <span className="font-baloo font-black text-2xl text-[#1B2A7A]">
                  {validatedLessons.length}/17
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Last Attendance */}
            <div className="cloud-card p-5 border-2 border-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-lavender text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} /> Dernière séance
                </span>
                <button
                  onClick={() => onNavigateTab('presences')}
                  className="btn-pill-white !min-h-[32px] !py-1 !px-3 !text-[11px]"
                >
                  <span>Historique</span>
                  <ArrowRight className="w-3 h-3 text-[#1B2A7A]" strokeWidth={2.5} />
                </button>
              </div>

              {lastPresence ? (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#CDBDF2]">
                  <div className="flex items-center gap-3">
                    {lastPresence.statut === 'present' && (
                      <CheckCircle className="w-6 h-6 text-[#1B2A7A]" strokeWidth={2.5} />
                    )}
                    {lastPresence.statut === 'absent' && (
                      <XCircle className="w-6 h-6 text-[#E5483D]" strokeWidth={2.5} />
                    )}
                    {lastPresence.statut === 'retard' && (
                      <Clock className="w-6 h-6 text-[#1B2A7A]" strokeWidth={2.5} />
                    )}
                    <div>
                      <p className="text-xs font-extrabold text-[#1B2A7A] capitalize font-baloo">
                        Statut : {lastPresence.statut}
                      </p>
                      {lastPresence.motif && (
                        <p className="text-[11px] text-[#4A5487] font-baloo">Motif : {lastPresence.motif}</p>
                      )}
                    </div>
                  </div>
                  <span className="badge-lavender text-[10px]">Validé</span>
                </div>
              ) : (
                <p className="text-xs text-[#4A5487] font-baloo">Aucune présence enregistrée.</p>
              )}
            </div>

            {/* Last Appreciation */}
            <div className="cloud-card p-5 border-2 border-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-lavender text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} /> Mot de l’enseignant
                </span>
                {lastAppreciation?.badge_rapide && (
                  <span className="text-[11px] bg-[#FFE15C] text-[#1B2A7A] font-extrabold px-3 py-0.5 rounded-full font-baloo shadow-sm">
                    {lastAppreciation.badge_rapide}
                  </span>
                )}
              </div>

              {lastAppreciation ? (
                <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-1">
                  <p className="text-xs text-[#1B2A7A] italic leading-relaxed font-baloo font-semibold">
                    « {lastAppreciation.texte} »
                  </p>
                  <p className="text-[10px] text-[#4A5487] text-right font-baloo font-bold">
                    Séance du {lastAppreciation.date}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-[#4A5487] font-baloo">Aucune appréciation récente.</p>
              )}
            </div>
          </div>

          {/* Pending Homework & Payment Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Homework Overview */}
            <div className="cloud-card p-5 border-2 border-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-lavender text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} /> Devoirs en cours
                </span>
                <span className="text-xs font-black text-[#1B2A7A] font-baloo">
                  {childDevoirs.length} assigné(s)
                </span>
              </div>

              <div className="space-y-2">
                {childDevoirs.slice(0, 2).map((d) => {
                  const r = rendus.find((x) => x.devoir_id === d.id && x.eleve_id === activeChild.id);
                  const isDone = r?.statut === 'rendu' || r?.statut === 'corrige';
                  return (
                    <div
                      key={d.id}
                      className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#CDBDF2] flex items-center justify-between text-xs font-baloo"
                    >
                      <div className="truncate pr-2">
                        <p className="font-extrabold text-[#1B2A7A] truncate">{d.titre}</p>
                        <p className="text-[10px] text-[#4A5487]">Date limite : {d.date_limite}</p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isDone ? 'badge-lavender' : 'bg-[#FFE15C] text-[#1B2A7A]'
                        }`}
                      >
                        {isDone ? 'Rendu ✓' : 'À faire'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tuition Status */}
            <div className="cloud-card p-5 border-2 border-white space-y-3">
              <div className="flex items-center justify-between">
                <span className="badge-lavender text-xs">
                  <CreditCard className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} /> Cotisation mensuelle
                </span>
                <button
                  onClick={() => onNavigateTab('paiements')}
                  className="btn-pill-white !min-h-[32px] !py-1 !px-3 !text-[11px]"
                >
                  <span>Reçus PDF</span>
                  <ArrowRight className="w-3 h-3 text-[#1B2A7A]" strokeWidth={2.5} />
                </button>
              </div>

              {childPayments.length > 0 ? (
                <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#CDBDF2] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-extrabold text-[#1B2A7A] font-baloo">{childPayments[0].mois}</p>
                    <p className="text-[11px] text-[#4A5487] font-baloo font-semibold">
                      Montant : <strong className="text-[#1B2A7A]">{childPayments[0].montant} €</strong>
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-extrabold font-baloo uppercase ${
                      childPayments[0].statut === 'paye'
                        ? 'bg-[#FFE15C] text-[#1B2A7A] shadow-sm'
                        : childPayments[0].statut === 'en_retard'
                        ? 'bg-[#E5483D] text-white animate-pulse'
                        : 'badge-lavender'
                    }`}
                  >
                    {childPayments[0].statut === 'paye'
                      ? 'Réglé ✓'
                      : childPayments[0].statut === 'en_retard'
                      ? 'En retard'
                      : 'À régler'}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[#4A5487] font-baloo">Aucune cotisation enregistrée.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. TAB : PRÉSENCES & SIGNALEMENT D'ABSENCE
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'presences' && (
        <div className="space-y-6">
          <div className="cloud-card p-6 sm:p-7 border-4 border-white space-y-2">
            <span className="badge-lavender text-xs">Registre de Présence</span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
                Assiduité de {activeChild.prenom}
              </h2>
              <span className="text-lg font-black font-baloo text-[#1B2A7A] bg-[#FFE15C] px-3.5 py-1 rounded-full shadow-sm">
                Taux : {attendanceRate}%
              </span>
            </div>
            <p className="text-xs text-[#4A5487] font-baloo">
              Prévenez l’enseignant en cas d’absence afin de préparer le rattrapage pédagogique.
            </p>
          </div>

          {/* Form Signaler Absence */}
          <div className="cloud-card p-6 border-2 border-white space-y-4">
            <h3 className="font-baloo font-extrabold text-lg text-[#1B2A7A] flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#FFE15C]" strokeWidth={2.5} />
              Signaler une absence anticipée
            </h3>

            <form onSubmit={handleReportAbsenceSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                required
                value={absenceSeanceId}
                onChange={(e) => setAbsenceSeanceId(e.target.value)}
                className="py-3 px-3.5 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs font-baloo font-bold text-[#1B2A7A] focus:outline-none"
              >
                <option value="">Sélectionner la séance...</option>
                {upcomingSessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.date} · {s.heure_debut} ({s.theme || 'Cours'})
                  </option>
                ))}
              </select>

              <input
                type="text"
                required
                value={absenceMotif}
                onChange={(e) => setAbsenceMotif(e.target.value)}
                placeholder="Motif (ex: RDV médical, voyage...)"
                className="py-3 px-3.5 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs font-baloo text-[#1B2A7A] focus:outline-none"
              />

              <button type="submit" className="btn-pill-sun !text-xs !py-2.5">
                <span>Transmettre au professeur</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </form>

            {absenceSuccess && (
              <div className="p-3.5 rounded-2xl bg-[#FFF6E3] border-2 border-[#FFE15C] text-[#1B2A7A] text-xs font-baloo font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                <span>Absence transmise à l’enseignant et enregistrée dans le dossier scolaire.</span>
              </div>
            )}
          </div>

          {/* Attendance History */}
          <div className="space-y-3">
            <h3 className="font-baloo font-extrabold text-xl text-[#1B2A7A]">Historique des séances</h3>
            <div className="space-y-2">
              {childPresences.map((p, idx) => (
                <div
                  key={idx}
                  className="cloud-card p-4 border border-white flex items-center justify-between text-xs font-baloo"
                >
                  <div className="flex items-center gap-3">
                    {p.statut === 'present' && (
                      <CheckCircle className="w-5 h-5 text-[#1B2A7A]" strokeWidth={2.5} />
                    )}
                    {p.statut === 'absent' && (
                      <XCircle className="w-5 h-5 text-[#E5483D]" strokeWidth={2.5} />
                    )}
                    {p.statut === 'retard' && (
                      <Clock className="w-5 h-5 text-[#1B2A7A]" strokeWidth={2.5} />
                    )}
                    <div>
                      <p className="font-extrabold text-[#1B2A7A] capitalize">
                        Séance : {p.statut}
                      </p>
                      {p.motif && (
                        <p className="text-[11px] text-[#4A5487] italic">« {p.motif} »</p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`font-baloo font-extrabold px-3 py-1 rounded-full text-[11px] ${
                      p.statut === 'present'
                        ? 'bg-[#FFE15C] text-[#1B2A7A]'
                        : p.statut === 'absent'
                        ? 'bg-[#E5483D] text-white'
                        : 'badge-lavender'
                    }`}
                  >
                    {p.statut.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. TAB : PROGRESSION PÉDAGOGIQUE (LECTURE SEULE)
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'progression' && (
        <div className="space-y-6">
          <div className="cloud-card p-6 sm:p-7 border-4 border-white space-y-2">
            <span className="badge-lavender text-xs">Bilan d’Apprentissage</span>
            <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
              Progression de {activeChild.prenom}
            </h2>
            <p className="text-xs text-[#4A5487] font-baloo">
              Vue en lecture seule de l’avancement de la méthode Nourania.
            </p>
          </div>

          <div className="cloud-card p-6 border-2 border-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-baloo font-extrabold text-xl text-[#1B2A7A]">
                  Méthode Nourania (17 leçons)
                </h3>
                <p className="text-xs text-[#4A5487] font-baloo">
                  {validatedLessons.length} leçons validées par le professeur
                </p>
              </div>
              <span className="font-baloo font-black text-2xl text-[#1B2A7A] bg-[#FFE15C] px-3.5 py-1 rounded-full shadow-sm">
                {nouraniaPercent}%
              </span>
            </div>

            <div className="w-full h-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] p-0.5 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#FFE15C] to-[#CDBDF2] transition-all duration-700"
                style={{ width: `${nouraniaPercent}%` }}
              />
            </div>

            <div className="space-y-2 pt-2">
              {NOURANIA_LECONS.map((l, idx) => {
                const prog = childProg.find((p) => p.lecon_id === l.id);
                const isVal = prog?.statut === 'validee';
                const isCurrent = prog?.statut === 'en_cours';

                return (
                  <div
                    key={l.id}
                    className={`p-3.5 rounded-3xl border flex items-center justify-between text-xs font-baloo transition-all ${
                      isVal
                        ? 'bg-[#FFFFFF] border-[#FFE15C] text-[#1B2A7A] shadow-sm'
                        : isCurrent
                        ? 'bg-[#FFF6E3] border-[#CDBDF2] text-[#1B2A7A]'
                        : 'bg-[#FFF6E3]/50 border-white/80 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#CDBDF2] text-[#1B2A7A] font-black flex items-center justify-center text-xs">
                        {l.numero}
                      </span>
                      <div>
                        <p className="font-extrabold">{l.titre}</p>
                        <p
                          className={`font-arabic text-base font-bold ${
                            idx % 2 === 0 ? 'text-[#E5483D]' : 'text-[#2F5BD1]'
                          }`}
                          dir="rtl"
                        >
                          {l.titre_arabe}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                        isVal
                          ? 'bg-[#FFE15C] text-[#1B2A7A]'
                          : isCurrent
                          ? 'badge-lavender'
                          : 'bg-[#FFFFFF] text-[#4A5487]'
                      }`}
                    >
                      {isVal ? `Validée le ${prog.validee_le || '2026'}` : isCurrent ? 'En cours' : 'À venir'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. TAB : COTISATIONS & REÇU PDF
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'paiements' && (
        <div className="space-y-6">
          <div className="cloud-card p-6 sm:p-7 border-4 border-white space-y-2">
            <span className="badge-lavender text-xs">Gestion Administrative</span>
            <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
              Cotisations & Reçus Scolaires
            </h2>
            <p className="text-xs text-[#4A5487] font-baloo">
              Téléchargez vos reçus officiels en PDF pour votre comptabilité et le suivi des cours.
            </p>
          </div>

          <div className="space-y-3">
            {childPayments.map((pay) => (
              <div
                key={pay.id}
                className="cloud-card p-5 border-2 border-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-soft-blue"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-baloo font-extrabold text-xl text-[#1B2A7A]">{pay.mois}</h3>
                    <span
                      className={`text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase font-baloo ${
                        pay.statut === 'paye'
                          ? 'bg-[#FFE15C] text-[#1B2A7A]'
                          : pay.statut === 'en_retard'
                          ? 'bg-[#E5483D] text-white'
                          : 'badge-lavender'
                      }`}
                    >
                      {pay.statut === 'paye'
                        ? 'Réglé ✓'
                        : pay.statut === 'en_retard'
                        ? 'En retard'
                        : 'À régler'}
                    </span>
                  </div>
                  <p className="text-xs text-[#4A5487] font-baloo">
                    Cotisation : <strong className="text-[#1B2A7A] font-extrabold">{pay.montant} €</strong>
                  </p>
                  {pay.paye_le && (
                    <p className="text-[11px] text-[#4A5487] font-baloo">
                      Payé le : {pay.paye_le} · Réf : {pay.recu_numero}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {pay.statut === 'paye' ? (
                    <button
                      type="button"
                      onClick={() => generatePdfReceipt(pay, activeChild, currentUser, childGroup)}
                      className="btn-pill-sun w-full sm:w-auto !min-h-[44px] !text-xs !py-2"
                    >
                      <Download className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                      <span>Télécharger le reçu PDF</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        alert(
                          'Paiement en ligne par carte (Stripe Connect) : module prêt pour future activation.'
                        )
                      }
                      className="btn-pill-white w-full sm:w-auto !min-h-[44px] !text-xs !py-2"
                    >
                      <CreditCard className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                      <span>Régler par Carte (Bientôt)</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. TAB : MESSAGERIE PARENT - ENSEIGNANT
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'messages' && (
        <div className="space-y-4">
          <div className="cloud-card p-4 border-2 border-white flex items-center justify-between shadow-soft-blue">
            <div className="flex items-center gap-3">
              <AvatarDisplay avatarKey="prof-fatima" size="md" />
              <div>
                <h3 className="font-baloo font-extrabold text-base text-[#1B2A7A] leading-tight">
                  Oustadha Fatima Zahra
                </h3>
                <p className="text-[11px] text-[#4A5487] font-baloo font-bold">Enseignante de {activeChild.prenom}</p>
              </div>
            </div>
            <span className="badge-lavender text-[11px]">En ligne</span>
          </div>

          <div className="h-80 overflow-y-auto p-4 cloud-card border-2 border-white space-y-3">
            {conversationMessages.map((msg) => {
              const isMe = msg.auteur_id === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col max-w-[80%] ${isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div
                    className={`p-3.5 rounded-3xl text-xs leading-relaxed font-baloo font-semibold ${
                      isMe
                        ? 'bg-[#FFE15C] text-[#1B2A7A] rounded-br-none shadow-sm'
                        : 'bg-[#FFFFFF] border border-[#CDBDF2] text-[#1B2A7A] rounded-bl-none'
                    }`}
                  >
                    {msg.texte}
                  </div>
                  <span className="text-[9px] text-[#4A5487] mt-1 px-1 font-baloo font-bold">
                    {new Date(msg.cree_le).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Écrire un mot doux à l’enseignant..."
              className="flex-1 py-3 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs font-baloo text-[#1B2A7A] focus:outline-none"
            />
            <button type="submit" className="btn-pill-sun !min-h-[44px] !text-xs !py-2">
              <Send className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
              <span className="hidden sm:inline">Envoyer</span>
            </button>
          </form>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. TAB : ANNONCES
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'annonces' && (
        <div className="space-y-4">
          <div className="cloud-card p-6 sm:p-7 border-4 border-white space-y-2">
            <span className="badge-lavender text-xs">Gazette Scolaire</span>
            <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
              Annonces de l’École
            </h2>
            <p className="text-xs text-[#4A5487] font-baloo">
              Retrouvez toutes les informations sur les ateliers, vacances et calendriers.
            </p>
          </div>

          <div className="space-y-4">
            {annonces.map((ann) => (
              <div
                key={ann.id}
                className="cloud-card p-6 border-2 border-white space-y-3 shadow-soft-blue"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                    <h3 className="font-baloo font-extrabold text-lg text-[#1B2A7A]">{ann.titre}</h3>
                  </div>
                  <span className="badge-lavender text-[10px]">{ann.cree_le}</span>
                </div>

                <p className="text-xs text-[#1B2A7A] leading-relaxed font-baloo">{ann.texte}</p>

                <div className="pt-2 border-t border-[#CDBDF2]/40 flex items-center justify-between text-[11px] text-[#4A5487] font-baloo font-bold">
                  <span>Signé : {ann.auteur_nom}</span>
                  <span className="text-[#1B2A7A]">École Sihscool</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
