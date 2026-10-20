import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AvatarDisplay, AVATAR_OPTIONS } from '../common/AvatarDisplay';
import { AudioRecorder } from '../common/AudioRecorder';
import { NOURANIA_LECONS } from '../../data/curriculum';
import { generatePdfReceipt } from '../../utils/pdfReceipt';
import { arabicAudio } from '../../utils/arabicAudio';
import { Sunburst } from '../common/Sunburst';
import { User, Groupe } from '../../types';
import {
  UserCheck,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  BookOpen,
  Plus,
  Send,
  Volume2,
  Calendar,
  AlertTriangle,
  Users,
  KeyRound,
  FileText,
  ShieldCheck,
  Megaphone,
  Check,
  Download,
  ArrowRight,
} from 'lucide-react';

interface TeacherViewProps {
  currentTab: string;
  onNavigateTab: (tabId: string) => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({ currentTab, onNavigateTab }) => {
  const {
    currentUser,
    users,
    groupes,
    seances,
    presences,
    progressions,
    devoirs,
    rendus,
    paiements,
    conversations,
    messages,
    markPresence,
    validateLecon,
    createDevoir,
    reviewRendu,
    addAppreciation,
    markPaiement,
    sendMessage,
    createAnnonce,
    createEleve,
    createGroupe,
    getGroupsOfTeacher,
    getStudentsOfTeacher,
    getStudentsOfGroup,
  } = useApp();

  const isSuperAdmin = currentUser?.role === 'admin';

  const [selectedSeanceId, setSelectedSeanceId] = useState<string>('seance-2');
  const [appreciationStudentId, setAppreciationStudentId] = useState<string>('user-eleve-1');
  const [appreciationText, setAppreciationText] = useState<string>('');
  const [appreciationTag, setAppreciationTag] = useState<string>('Très bonne lecture');
  const [appreciationSuccess, setAppreciationSuccess] = useState(false);

  const [newDevoirTitle, setNewDevoirTitle] = useState('');
  const [newDevoirArabic, setNewDevoirArabic] = useState('');
  const [newDevoirConsigne, setNewDevoirConsigne] = useState('');
  const [newDevoirGroupId, setNewDevoirGroupId] = useState('groupe-1');
  const [newDevoirDueDate, setNewDevoirDueDate] = useState('2026-10-28');
  const [newDevoirAudio, setNewDevoirAudio] = useState('');
  const [devoirSuccess, setDevoirSuccess] = useState(false);

  const [reviewDevoirId, setReviewDevoirId] = useState<string | null>(null);
  const [reviewStudentId, setReviewStudentId] = useState<string | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewNote, setReviewNote] = useState('Macha Allah ! (مُمْتَاز)');
  const [playingRenduId, setPlayingRenduId] = useState<string | null>(null);

  const [newStudentPrenom, setNewStudentPrenom] = useState('');
  const [newStudentNom, setNewStudentNom] = useState('');
  const [newStudentAvatar, setNewStudentAvatar] = useState('falcon-mint');
  const [newStudentGroupId, setNewStudentGroupId] = useState('groupe-1');
  const [newStudentParentEmail, setNewStudentParentEmail] = useState('');
  const [createdStudentResult, setCreatedStudentResult] = useState<User | null>(null);

  const [newGroupNom, setNewGroupNom] = useState('');
  const [newGroupType, setNewGroupType] = useState<'nourania' | 'litteraire' | 'mixte'>('nourania');
  const [newGroupPublic, setNewGroupPublic] = useState<'enfants' | 'femmes' | 'mixte'>('enfants');
  const [newGroupCreneau, setNewGroupCreneau] = useState('');
  const [newGroupLieu, setNewGroupLieu] = useState('');
  const [newGroupTarif, setNewGroupTarif] = useState(45);
  const [groupSuccess, setGroupSuccess] = useState(false);

  const [newAnnonceTitle, setNewAnnonceTitle] = useState('');
  const [newAnnonceContent, setNewAnnonceContent] = useState('');
  const [annonceSuccess, setAnnonceSuccess] = useState(false);

  const [selectedConvId, setSelectedConvId] = useState<string>('conv-1');
  const [teacherChatInput, setTeacherChatInput] = useState('');

  if (!currentUser) return null;

  const teacherGroups = isSuperAdmin ? groupes : getGroupsOfTeacher(currentUser.id);
  const teacherStudents = isSuperAdmin ? users.filter((u) => u.role === 'eleve') : getStudentsOfTeacher(currentUser.id);

  const activeSeance = seances.find((s) => s.id === selectedSeanceId) || seances[0];
  const seanceStudents = activeSeance ? getStudentsOfGroup(activeSeance.groupe_id) : [];
  const pendingReviews = rendus.filter((r) => r.statut === 'rendu');

  const QUICK_CHIPS = [
    'Très bonne lecture',
    'Macha Allah excellent travail',
    'À réviser à la maison',
    'Bel effort d’articulation',
    'Attention au Soukoun',
    'Participation joyeuse',
  ];

  const handleAppreciationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appreciationText || !appreciationStudentId) return;
    addAppreciation(appreciationStudentId, currentUser.id, selectedSeanceId, appreciationText, appreciationTag);
    setAppreciationText('');
    setAppreciationSuccess(true);
    setTimeout(() => setAppreciationSuccess(false), 3000);
  };

  const handleCreateDevoirSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDevoirTitle || !newDevoirConsigne) return;
    createDevoir({
      titre: newDevoirTitle,
      titre_arabe: newDevoirArabic,
      consigne: newDevoirConsigne,
      groupe_id: newDevoirGroupId,
      date_limite: newDevoirDueDate,
      audio_prof: newDevoirAudio || undefined,
      prof_id: currentUser.id,
    });
    setNewDevoirTitle('');
    setNewDevoirArabic('');
    setNewDevoirConsigne('');
    setNewDevoirAudio('');
    setDevoirSuccess(true);
    setTimeout(() => setDevoirSuccess(false), 3000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewDevoirId || !reviewStudentId) return;
    reviewRendu(reviewDevoirId, reviewStudentId, reviewComment, reviewNote);
    setReviewDevoirId(null);
    setReviewStudentId(null);
    setReviewComment('');
  };

  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentPrenom || !newStudentNom) return;
    const created = createEleve({
      prenom: newStudentPrenom,
      nom: newStudentNom,
      avatar: newStudentAvatar,
      groupeId: newStudentGroupId,
      parentEmail: newStudentParentEmail,
    });
    setCreatedStudentResult(created);
    setNewStudentPrenom('');
    setNewStudentNom('');
    setNewStudentParentEmail('');
  };

  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupNom || !newGroupCreneau) return;
    createGroupe({
      nom: newGroupNom,
      type: newGroupType,
      public: newGroupPublic,
      creneau: newGroupCreneau,
      lieu_ou_lien: newGroupLieu || 'Salle Al-Qalam',
      tarif_mensuel: newGroupTarif,
      prof_id: currentUser.id,
      code_couleur: 'mint',
    });
    setNewGroupNom('');
    setNewGroupCreneau('');
    setGroupSuccess(true);
    setTimeout(() => setGroupSuccess(false), 3000);
  };

  const handleAnnonceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnonceTitle || !newAnnonceContent) return;
    createAnnonce({
      titre: newAnnonceTitle,
      texte: newAnnonceContent,
      auteur_nom: `${currentUser.prenom} ${currentUser.nom}`,
      priorite: 'normale',
    });
    setNewAnnonceTitle('');
    setNewAnnonceContent('');
    setAnnonceSuccess(true);
    setTimeout(() => setAnnonceSuccess(false), 3000);
  };

  const handleTeacherSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherChatInput.trim()) return;
    sendMessage(selectedConvId, teacherChatInput.trim());
    setTeacherChatInput('');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-fadeIn max-w-5xl mx-auto">
      {/* ─────────────────────────────────────────────────────────────
          1. TAB : DASHBOARD ENSEIGNANT / DIRECTION
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Hero Card */}
          <div className="cloud-card p-6 sm:p-8 border-4 border-white shadow-cloud-pop flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <AvatarDisplay avatarKey={currentUser.avatar} size="lg" className="ring-4 ring-[#FFE15C]" />
              <div>
                <div className="inline-flex items-center gap-2">
                  <span className="badge-lavender text-xs">
                    {isSuperAdmin ? 'Direction de l’École' : 'Espace Pédagogique'}
                  </span>
                  <Sunburst size="sm" />
                </div>
                <h1 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
                  Bonjour {currentUser.prenom}
                </h1>
                <p className="text-xs text-[#4A5487] font-baloo font-bold">
                  {teacherGroups.length} groupe(s) actif(s) · {teacherStudents.length} élèves inscrits
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => onNavigateTab('appel')}
                className="btn-pill-sun flex-1 sm:flex-initial !text-xs !py-2.5"
              >
                <UserCheck className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                <span>Faire l’appel</span>
              </button>
              <button
                onClick={() => onNavigateTab('devoirs')}
                className="btn-pill-white flex-1 sm:flex-initial !text-xs !py-2.5"
              >
                <BookOpen className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                <span>Nouveau devoir</span>
                <ArrowRight className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="cloud-card p-5 border-2 border-white space-y-2">
              <span className="badge-lavender text-xs">
                <BookOpen className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} /> Devoirs à corriger
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-baloo font-black text-3xl text-[#1B2A7A]">
                  {pendingReviews.length}
                </span>
                <button
                  onClick={() => onNavigateTab('devoirs')}
                  className="btn-pill-white !min-h-[30px] !py-0.5 !px-3 !text-[11px]"
                >
                  <span>Corriger</span>
                  <ArrowRight className="w-3 h-3 text-[#1B2A7A]" strokeWidth={2.5} />
                </button>
              </div>
              <p className="text-[11px] text-[#4A5487] font-baloo">
                Récitations audio en attente
              </p>
            </div>

            <div className="cloud-card p-5 border-2 border-white space-y-2">
              <span className="badge-lavender text-xs">
                <Calendar className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} /> Prochaine séance
              </span>
              <p className="font-baloo font-extrabold text-base text-[#1B2A7A] truncate">
                {activeSeance?.theme || 'Cours de Nourania'}
              </p>
              <p className="text-[11px] text-[#4A5487] font-baloo font-semibold">
                {activeSeance?.date} à {activeSeance?.heure_debut}
              </p>
            </div>

            <div className="cloud-card p-5 border-2 border-white space-y-2">
              <span className="badge-lavender text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} /> Vigilance Assiduité
              </span>
              <span className="font-baloo font-black text-3xl text-[#1B2A7A]">2 élèves</span>
              <p className="text-[11px] text-[#4A5487] font-baloo">
                Kenza & Noura (absences signalées)
              </p>
            </div>
          </div>

          {/* Sessions List */}
          <div className="cloud-card p-6 border-4 border-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-baloo font-extrabold text-xl text-[#1B2A7A] flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#1B2A7A]" strokeWidth={2.5} />
                Séances programmées
              </h3>
              <button
                onClick={() => onNavigateTab('appel')}
                className="btn-pill-white !min-h-[32px] !py-1 !px-3 !text-[11px]"
              >
                <span>Registre d’appel</span>
                <ArrowRight className="w-3 h-3 text-[#1B2A7A]" strokeWidth={2.5} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {seances.slice(0, 4).map((s) => {
                const grp = groupes.find((g) => g.id === s.groupe_id);
                return (
                  <div
                    key={s.id}
                    className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] flex items-center justify-between font-baloo"
                  >
                    <div>
                      <p className="font-extrabold text-sm text-[#1B2A7A]">{grp?.nom}</p>
                      <p className="text-xs text-[#1B2A7A] font-bold">
                        {s.date} · {s.heure_debut} - {s.heure_fin}
                      </p>
                      <p className="text-[11px] text-[#4A5487]">{s.theme || 'Thème du jour'}</p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSeanceId(s.id);
                        onNavigateTab('appel');
                      }}
                      className="btn-pill-sun !min-h-[36px] !py-1 !px-3 !text-xs"
                    >
                      <span>Appel</span>
                      <ArrowRight className="w-3 h-3 text-[#1B2A7A]" strokeWidth={2.5} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. TAB : FAIRE L'APPEL
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'appel' && (
        <div className="space-y-6">
          <div className="cloud-card p-6 sm:p-7 border-4 border-white space-y-3">
            <span className="badge-lavender text-xs">Feuille d’Émargement</span>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
                Faire l’Appel de la Séance
              </h2>

              <select
                value={selectedSeanceId}
                onChange={(e) => setSelectedSeanceId(e.target.value)}
                className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs font-baloo font-extrabold text-[#1B2A7A] focus:outline-none"
              >
                {seances.map((s) => {
                  const grp = groupes.find((g) => g.id === s.groupe_id);
                  return (
                    <option key={s.id} value={s.id}>
                      {s.date} ({grp?.nom})
                    </option>
                  );
                })}
              </select>
            </div>
            <p className="text-xs text-[#4A5487] font-baloo">
              Cliquez pour enregistrer la présence. Les parents sont instantanément notifiés des absences et retards.
            </p>
          </div>

          <div className="space-y-3">
            {seanceStudents.map((student) => {
              const studentPresence = presences.find(
                (p) => p.seance_id === selectedSeanceId && p.eleve_id === student.id
              );
              const statut = studentPresence?.statut || 'present';

              return (
                <div
                  key={student.id}
                  className="cloud-card p-4 border-2 border-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft-blue"
                >
                  <div className="flex items-center gap-3">
                    <AvatarDisplay avatarKey={student.avatar} size="md" />
                    <div>
                      <h4 className="font-baloo font-extrabold text-base text-[#1B2A7A] leading-tight">
                        {student.prenom} {student.nom}
                      </h4>
                      <p className="text-[11px] text-[#4A5487] font-baloo">
                        Code élève : <span className="font-mono font-bold text-[#1B2A7A]">{student.code_connexion}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => markPresence(selectedSeanceId, student.id, 'present')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-baloo font-extrabold text-xs transition-all active:scale-95 ${
                        statut === 'present'
                          ? 'bg-[#FFE15C] text-[#1B2A7A] shadow-sun-glow scale-105'
                          : 'bg-[#FFFFFF] text-[#4A5487] border border-[#CDBDF2]'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                      <span>Présent</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => markPresence(selectedSeanceId, student.id, 'retard', 'Retard en début de séance')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-baloo font-extrabold text-xs transition-all active:scale-95 ${
                        statut === 'retard'
                          ? 'bg-[#CDBDF2] text-[#1B2A7A] shadow-lavender-glow scale-105'
                          : 'bg-[#FFFFFF] text-[#4A5487] border border-[#CDBDF2]'
                      }`}
                    >
                      <Clock className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                      <span>En retard</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => markPresence(selectedSeanceId, student.id, 'absent', 'Non excusé')}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-baloo font-extrabold text-xs transition-all active:scale-95 ${
                        statut === 'absent'
                          ? 'bg-[#E5483D] text-white shadow-sm scale-105'
                          : 'bg-[#FFFFFF] text-[#4A5487] border border-[#CDBDF2]'
                      }`}
                    >
                      <XCircle className="w-4 h-4" strokeWidth={2.5} />
                      <span>Absent</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Post-Class Appreciation */}
          <div className="cloud-card p-6 border-4 border-white space-y-4">
            <h3 className="font-baloo font-extrabold text-lg text-[#1B2A7A] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1B2A7A]" strokeWidth={2.5} />
              Rédiger un mot pour l’élève et sa famille
            </h3>

            <form onSubmit={handleAppreciationSubmit} className="space-y-3 font-baloo">
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={appreciationStudentId}
                  onChange={(e) => setAppreciationStudentId(e.target.value)}
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs font-bold text-[#1B2A7A] focus:outline-none sm:w-1/3"
                >
                  {seanceStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.prenom} {s.nom}
                    </option>
                  ))}
                </select>

                <div className="flex-1 flex flex-wrap gap-1.5">
                  {QUICK_CHIPS.map((chip, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setAppreciationTag(chip);
                        setAppreciationText((prev) => (prev ? `${prev} - ${chip}` : chip));
                      }}
                      className="px-3 py-1 rounded-full bg-[#FFFFFF] hover:bg-[#FFE15C] border border-[#CDBDF2] text-[11px] text-[#1B2A7A] font-bold transition-all"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                value={appreciationText}
                onChange={(e) => setAppreciationText(e.target.value)}
                placeholder="Commentaire bienveillant pour l’élève et ses parents..."
                className="w-full py-3 px-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none"
              />

              <div className="flex items-center justify-between">
                {appreciationSuccess && (
                  <span className="text-xs text-[#1B2A7A] flex items-center gap-1 font-extrabold">
                    <Check className="w-4 h-4" strokeWidth={2.5} /> Appréciation enregistrée et transmise !
                  </span>
                )}
                <button type="submit" className="ml-auto btn-pill-sun !min-h-[42px] !text-xs !py-2">
                  <span>Publier le commentaire</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. TAB : PROGRESSION & VALIDATION NOURANIA (CONFETTIS)
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'progression' && (
        <div className="space-y-6">
          <div className="cloud-card p-6 sm:p-7 border-4 border-white space-y-2">
            <span className="badge-lavender text-xs">Validation Pédagogique</span>
            <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
              Valider les Leçons Nourania
            </h2>
            <p className="text-xs text-[#4A5487] font-baloo">
              Validez la leçon d’un élève en 1 clic (déclenche une pluie de confettis jaunes et lavande et notifie la maman).
            </p>
          </div>

          <div className="space-y-3">
            {teacherStudents.map((student) => {
              const studentProgress = progressions.filter((p) => p.eleve_id === student.id);
              const valCount = studentProgress.filter((p) => p.statut === 'validee').length;
              const currentLesson = studentProgress.find((p) => p.statut === 'en_cours');
              const nextLeconId = currentLesson?.lecon_id || `nourania-${valCount + 1}`;
              const nextLecon = NOURANIA_LECONS.find((l) => l.id === nextLeconId);

              return (
                <div
                  key={student.id}
                  className="cloud-card p-5 border-2 border-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-soft-blue font-baloo"
                >
                  <div className="flex items-center gap-3">
                    <AvatarDisplay avatarKey={student.avatar} size="md" />
                    <div>
                      <h4 className="font-extrabold text-base text-[#1B2A7A] leading-tight">
                        {student.prenom} {student.nom}
                      </h4>
                      <p className="text-xs text-[#4A5487] font-bold">
                        {valCount} / 17 leçons validées
                      </p>
                      {nextLecon && (
                        <p className="text-[11px] text-[#1B2A7A]">
                          Leçon en cours :{' '}
                          <strong className="underline decoration-[#FFE15C]">
                            {nextLecon.numero}. {nextLecon.titre}
                          </strong>
                        </p>
                      )}
                    </div>
                  </div>

                  {nextLecon && (
                    <button
                      type="button"
                      onClick={() => validateLecon(student.id, nextLecon.id, currentUser.id)}
                      className="btn-pill-sun !min-h-[44px] !text-xs !py-2"
                    >
                      <Sparkles className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                      <span>Valider la leçon {nextLecon.numero} 🎉</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. TAB : DEVOIRS & AUDIOS
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'devoirs' && (
        <div className="space-y-6">
          <div className="cloud-card p-6 sm:p-7 border-4 border-white space-y-2">
            <span className="badge-lavender text-xs">Cahier de Devoirs</span>
            <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
              Devoirs & Récitations Audio
            </h2>
            <p className="text-xs text-[#4A5487] font-baloo">
              Créez des devoirs avec modèle audio vocal et évaluez les enregistrements reçus des élèves.
            </p>
          </div>

          {/* Pending Submissions */}
          <div className="space-y-3">
            <h3 className="font-baloo font-extrabold text-xl text-[#1B2A7A] flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#1B2A7A]" strokeWidth={2.5} />
              Récitations reçues à évaluer ({pendingReviews.length})
            </h3>

            {pendingReviews.length === 0 ? (
              <div className="cloud-card p-5 border-2 border-white text-xs text-[#4A5487] text-center font-baloo">
                Toutes les récitations reçues ont été corrigées avec amour !
              </div>
            ) : (
              pendingReviews.map((rendu) => {
                const dev = devoirs.find((d) => d.id === rendu.devoir_id);
                const eleve = users.find((u) => u.id === rendu.eleve_id);

                return (
                  <div
                    key={`${rendu.devoir_id}-${rendu.eleve_id}`}
                    className="cloud-card p-5 border-2 border-[#FFE15C] space-y-3 shadow-soft-blue"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AvatarDisplay avatarKey={eleve?.avatar || 'cat-mint'} size="sm" />
                        <div>
                          <p className="font-baloo font-extrabold text-sm text-[#1B2A7A]">
                            {eleve?.prenom} {eleve?.nom}
                          </p>
                          <p className="text-xs text-[#4A5487] font-baloo font-bold">{dev?.titre}</p>
                        </div>
                      </div>
                      <span className="badge-lavender text-[10px]">
                        Rendu le : {rendu.rendu_le || 'Aujourd’hui'}
                      </span>
                    </div>

                    {(() => {
                      const renduKey = `${rendu.devoir_id}-${rendu.eleve_id}`;
                      const isPlaying = playingRenduId === renduKey;
                      return (
                        <div className="p-3 rounded-2xl bg-[#FFFFFF] border-2 border-[#CDBDF2] flex items-center justify-between font-baloo">
                          <div className="flex items-center gap-2 text-xs text-[#1B2A7A]">
                            <Volume2 className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                            <span>Récitation vocale ({rendu.audio_eleve})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (isPlaying) {
                                arabicAudio.stop();
                                setPlayingRenduId(null);
                              } else {
                                setPlayingRenduId(renduKey);
                                const audioSource =
                                  rendu.audio_eleve &&
                                  (rendu.audio_eleve.startsWith('data:') ||
                                    rendu.audio_eleve.startsWith('blob:') ||
                                    rendu.audio_eleve.startsWith('/audio/') ||
                                    rendu.audio_eleve.startsWith('http'))
                                    ? rendu.audio_eleve
                                    : '/audio/devoirs/student-sample.mp3';

                                arabicAudio.playAudioUrl(audioSource, {
                                  onEnd: () => setPlayingRenduId(null),
                                  onError: () => setPlayingRenduId(null),
                                });
                              }
                            }}
                            className="btn-pill-sun !min-h-[32px] !text-[11px] !py-1 !px-3 shadow-sm"
                          >
                            {isPlaying ? (
                              <div className="flex items-center gap-1.5 font-bold">
                                <span className="w-1 h-3 bg-[#1B2A7A] rounded-full animate-bounce"></span>
                                <span className="w-1 h-4 bg-[#1B2A7A] rounded-full animate-bounce [animation-delay:0.15s]"></span>
                                <span className="w-1 h-3 bg-[#1B2A7A] rounded-full animate-bounce [animation-delay:0.3s]"></span>
                                <span>Arrêter</span>
                              </div>
                            ) : (
                              <span>Écouter la voix</span>
                            )}
                          </button>
                        </div>
                      );
                    })()}

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleReviewSubmit(e);
                      }}
                      className="space-y-2 pt-2 border-t border-[#CDBDF2]/40"
                    >
                      <div className="flex flex-col sm:flex-row gap-2 font-baloo">
                        <input
                          type="text"
                          required
                          value={reviewComment}
                          onChange={(e) => {
                            setReviewDevoirId(rendu.devoir_id);
                            setReviewStudentId(rendu.eleve_id);
                            setReviewComment(e.target.value);
                          }}
                          placeholder="Commentaire encourageant pour l’élève..."
                          className="flex-1 py-2 px-3 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none"
                        />
                        <select
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          className="py-2 px-3 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] font-bold"
                        >
                          <option value="Macha Allah ! (مُمْتَاز)">Macha Allah ! (مُمْتَاز)</option>
                          <option value="Très bien ! (جَيِّد جِدًّا)">Très bien ! (جَيِّد جِدًّا)</option>
                          <option value="Bien, à consolider (جَيِّد)">Bien, à consolider (جَيِّد)</option>
                        </select>
                        <button type="submit" className="btn-pill-sun !min-h-[38px] !text-xs !py-1 !px-4">
                          <span>Valider</span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
                        </button>
                      </div>
                    </form>
                  </div>
                );
              })
            )}
          </div>

          {/* Create Homework Form */}
          <div className="cloud-card p-6 border-4 border-white space-y-4">
            <h3 className="font-baloo font-extrabold text-xl text-[#1B2A7A] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#1B2A7A]" strokeWidth={2.5} />
              Donner un nouveau devoir
            </h3>

            <form onSubmit={handleCreateDevoirSubmit} className="space-y-3 font-baloo">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newDevoirTitle}
                  onChange={(e) => setNewDevoirTitle(e.target.value)}
                  placeholder="Titre du devoir (ex: Récitation Leçon 6)"
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-bold"
                />

                <input
                  type="text"
                  value={newDevoirArabic}
                  onChange={(e) => setNewDevoirArabic(e.target.value)}
                  placeholder="Titre en arabe (ex: تَسْمِيعُ الحَرَكَات)"
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#E5483D] focus:outline-none text-right font-arabic font-bold"
                  dir="rtl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={newDevoirGroupId}
                  onChange={(e) => setNewDevoirGroupId(e.target.value)}
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-bold"
                >
                  {teacherGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      Groupe : {g.nom}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  required
                  value={newDevoirDueDate}
                  onChange={(e) => setNewDevoirDueDate(e.target.value)}
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-bold"
                />
              </div>

              <textarea
                rows={3}
                required
                value={newDevoirConsigne}
                onChange={(e) => setNewDevoirConsigne(e.target.value)}
                placeholder="Consignes détaillées pour la lecture et les exercices..."
                className="w-full py-3 px-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-medium"
              />

              <AudioRecorder
                label="Enregistrer le modèle audio du professeur (facultatif)"
                onAudioReady={(url) => setNewDevoirAudio(url)}
              />

              <div className="flex items-center justify-between pt-2">
                {devoirSuccess && (
                  <span className="text-xs text-[#1B2A7A] font-extrabold flex items-center gap-1">
                    <Check className="w-4 h-4" strokeWidth={2.5} /> Devoir publié et assigné aux élèves !
                  </span>
                )}
                <button type="submit" className="ml-auto btn-pill-sun !min-h-[44px] !text-xs !py-2">
                  <span>Publier le devoir</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          5. TAB : ÉLÈVES & GROUPES (GÉNÉRATION CODE 6 CHIFFRES)
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'groupes' && (
        <div className="space-y-6">
          <div className="cloud-card p-6 sm:p-7 border-4 border-white space-y-2">
            <span className="badge-lavender text-xs">Gestion Scolaire</span>
            <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
              Groupes & Inscription d’Élèves
            </h2>
            <p className="text-xs text-[#4A5487] font-baloo">
              Inscrivez des élèves avec génération automatique du code à 6 chiffres et création de groupes.
            </p>
          </div>

          {/* Student Creation Form */}
          <div className="cloud-card p-6 border-4 border-white space-y-4">
            <h3 className="font-baloo font-extrabold text-xl text-[#1B2A7A] flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#1B2A7A]" strokeWidth={2.5} />
              Inscrire un nouvel enfant
            </h3>

            <form onSubmit={handleCreateStudentSubmit} className="space-y-4 font-baloo">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={newStudentPrenom}
                  onChange={(e) => setNewStudentPrenom(e.target.value)}
                  placeholder="Prénom de l’enfant"
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-bold"
                />
                <input
                  type="text"
                  required
                  value={newStudentNom}
                  onChange={(e) => setNewStudentNom(e.target.value)}
                  placeholder="Nom de famille"
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={newStudentGroupId}
                  onChange={(e) => setNewStudentGroupId(e.target.value)}
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-bold"
                >
                  {teacherGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      Rattacher au groupe : {g.nom}
                    </option>
                  ))}
                </select>

                <input
                  type="email"
                  value={newStudentParentEmail}
                  onChange={(e) => setNewStudentParentEmail(e.target.value)}
                  placeholder="Email du parent (pour invitation)"
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-bold"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-extrabold text-[#1B2A7A]">
                  Avatar de l’écolier :
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {AVATAR_OPTIONS.slice(0, 8).map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setNewStudentAvatar(a.id)}
                      className={`p-1 rounded-2xl transition-all ${
                        newStudentAvatar === a.id ? 'ring-4 ring-[#FFE15C] scale-105' : 'opacity-70'
                      }`}
                    >
                      <AvatarDisplay avatarKey={a.id} size="sm" />
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn-pill-sun w-full">
                <span>Créer l’élève & Générer le code secret</span>
                <ArrowRight className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
              </button>
            </form>

            {createdStudentResult && (
              <div className="p-5 rounded-3xl bg-[#FFFFFF] border-2 border-[#FFE15C] space-y-2 shadow-soft-blue animate-fadeIn font-baloo">
                <div className="flex items-center gap-3">
                  <AvatarDisplay avatarKey={createdStudentResult.avatar} size="md" />
                  <div>
                    <h4 className="font-extrabold text-base text-[#1B2A7A]">
                      Élève créé : {createdStudentResult.prenom} {createdStudentResult.nom}
                    </h4>
                    <p className="text-xs text-[#4A5487]">
                      Code secret à 6 chiffres pour se connecter sans email :
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#FFF6E3] border-2 border-[#FFE15C] flex items-center justify-center text-center">
                  <span className="font-mono text-3xl font-black text-[#1B2A7A] tracking-widest">
                    {createdStudentResult.code_connexion}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Group Creation Form */}
          <div className="cloud-card p-6 border-4 border-white space-y-4">
            <h3 className="font-baloo font-extrabold text-xl text-[#1B2A7A] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1B2A7A]" strokeWidth={2.5} />
              Créer un groupe de cours
            </h3>

            <form onSubmit={handleCreateGroupSubmit} className="space-y-3 font-baloo">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={newGroupNom}
                  onChange={(e) => setNewGroupNom(e.target.value)}
                  placeholder="Nom (ex: Enfants Nourania - Samedi)"
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-bold"
                />

                <select
                  value={newGroupType}
                  onChange={(e) => setNewGroupType(e.target.value as any)}
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-bold"
                >
                  <option value="nourania">Nourania</option>
                  <option value="litteraire">Arabe Littéraire</option>
                  <option value="mixte">Mixte</option>
                </select>

                <select
                  value={newGroupPublic}
                  onChange={(e) => setNewGroupPublic(e.target.value as any)}
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-bold"
                >
                  <option value="enfants">Enfants</option>
                  <option value="femmes">Femmes</option>
                  <option value="mixte">Mixte</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  required
                  value={newGroupCreneau}
                  onChange={(e) => setNewGroupCreneau(e.target.value)}
                  placeholder="Créneau (ex: Samedi 10h)"
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-bold"
                />

                <input
                  type="text"
                  value={newGroupLieu}
                  onChange={(e) => setNewGroupLieu(e.target.value)}
                  placeholder="Lieu / Lien (ex: Salle Rayhan)"
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-bold"
                />

                <input
                  type="number"
                  value={newGroupTarif}
                  onChange={(e) => setNewGroupTarif(Number(e.target.value))}
                  placeholder="Tarif mensuel (€)"
                  className="py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs text-[#1B2A7A] focus:outline-none font-bold"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {groupSuccess && (
                  <span className="text-xs text-[#1B2A7A] font-extrabold flex items-center gap-1">
                    <Check className="w-4 h-4" strokeWidth={2.5} /> Groupe créé !
                  </span>
                )}
                <button type="submit" className="ml-auto btn-pill-sun !min-h-[42px] !text-xs !py-2">
                  <span>Ajouter le groupe</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. TAB : MESSAGES & ANNONCES
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'messages' && (
        <div className="space-y-6">
          <div className="cloud-card p-6 sm:p-7 border-4 border-white space-y-2">
            <span className="badge-lavender text-xs">Échanges Parents</span>
            <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
              Messagerie & Annonces
            </h2>
            <p className="text-xs text-[#4A5487] font-baloo">
              Communiquez avec les familles ou diffusez un mot d’information à tous les inscrits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-1">
              <span className="text-xs font-extrabold font-baloo uppercase text-[#1B2A7A] block pl-1">
                Conversations :
              </span>
              {conversations.map((c) => {
                const parent = users.find((u) => u.id === c.parent_id);
                const eleve = users.find((u) => u.id === c.eleve_id);
                const isSelected = selectedConvId === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`p-3.5 rounded-3xl border cursor-pointer transition-all font-baloo ${
                      isSelected
                        ? 'bg-[#FFE15C] border-white text-[#1B2A7A] shadow-sun-glow'
                        : 'cloud-card border-white hover:bg-[#FFFFFF]'
                    }`}
                  >
                    <p className="font-extrabold text-xs text-[#1B2A7A]">
                      {parent?.prenom} {parent?.nom}
                    </p>
                    <p className="text-[10px] text-[#4A5487] font-bold">Élève : {eleve?.prenom}</p>
                    <p className="text-[11px] truncate text-[#1B2A7A] mt-1">{c.dernier_message}</p>
                  </div>
                );
              })}
            </div>

            <div className="md:col-span-2 space-y-3 cloud-card p-5 border-2 border-white">
              <h4 className="font-baloo font-extrabold text-sm text-[#1B2A7A] border-b border-[#CDBDF2]/40 pb-2">
                Discussion directe
              </h4>

              <div className="h-64 overflow-y-auto space-y-2.5 p-3 bg-[#FFFFFF] rounded-3xl border-2 border-[#CDBDF2]">
                {messages
                  .filter((m) => m.conversation_id === selectedConvId)
                  .map((msg) => {
                    const isMe = msg.auteur_id === currentUser.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] ${
                          isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <div
                          className={`p-3 rounded-3xl text-xs leading-relaxed font-baloo font-semibold ${
                            isMe
                              ? 'bg-[#FFE15C] text-[#1B2A7A] rounded-br-none shadow-sm'
                              : 'bg-[#FFF6E3] border border-[#CDBDF2] text-[#1B2A7A] rounded-bl-none'
                          }`}
                        >
                          {msg.texte}
                        </div>
                      </div>
                    );
                  })}
              </div>

              <form onSubmit={handleTeacherSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={teacherChatInput}
                  onChange={(e) => setTeacherChatInput(e.target.value)}
                  placeholder="Répondre à la famille..."
                  className="flex-1 py-2.5 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs font-baloo text-[#1B2A7A] focus:outline-none"
                />
                <button type="submit" className="btn-pill-sun !min-h-[42px] !text-xs !py-1 !px-4">
                  <span>Envoyer</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          7. TAB : COTISATIONS & TRÉSORERIE (ADMIN)
      ───────────────────────────────────────────────────────────── */}
      {currentTab === 'admin' && (
        <div className="space-y-6">
          <div className="cloud-card p-6 sm:p-7 border-4 border-white space-y-2">
            <span className="badge-lavender text-xs">Direction & Trésorerie</span>
            <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A]">
              Cotisations Scolaires & Reçus
            </h2>
            <p className="text-xs text-[#4A5487] font-baloo">
              Validez les paiements reçus et générez les reçus officiels en PDF.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="cloud-card p-5 border-2 border-white space-y-1">
              <span className="text-xs text-[#4A5487] uppercase font-extrabold font-baloo">Total Encaissé</span>
              <p className="font-baloo font-black text-3xl text-[#1B2A7A]">
                {paiements.filter((p) => p.statut === 'paye').reduce((s, p) => s + p.montant, 0)} €
              </p>
            </div>

            <div className="cloud-card p-5 border-2 border-white space-y-1">
              <span className="text-xs text-[#4A5487] uppercase font-extrabold font-baloo">En Attente / Retard</span>
              <p className="font-baloo font-black text-3xl text-[#E5483D]">
                {paiements.filter((p) => p.statut !== 'paye').reduce((s, p) => s + p.montant, 0)} €
              </p>
            </div>

            <div className="cloud-card p-5 border-2 border-white space-y-1">
              <span className="text-xs text-[#4A5487] uppercase font-extrabold font-baloo">Écoliers Actifs</span>
              <p className="font-baloo font-black text-3xl text-[#1B2A7A]">
                {users.filter((u) => u.role === 'eleve').length}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-baloo font-extrabold text-xl text-[#1B2A7A]">Registre des cotisations</h3>
            <div className="space-y-2">
              {paiements.map((pay) => {
                const eleve = users.find((u) => u.id === pay.eleve_id);
                const parent = users.find((u) => u.id === pay.parent_id);

                return (
                  <div
                    key={pay.id}
                    className="cloud-card p-4 border border-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-baloo shadow-soft-blue"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#1B2A7A]">
                          {eleve?.prenom} {eleve?.nom}
                        </span>
                        <span className="text-[#4A5487]">({parent?.prenom} {parent?.nom})</span>
                      </div>
                      <p className="text-[11px] text-[#1B2A7A] font-bold">{pay.mois} · Montant : {pay.montant} €</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full font-extrabold uppercase text-[10px] ${
                          pay.statut === 'paye'
                            ? 'bg-[#FFE15C] text-[#1B2A7A]'
                            : pay.statut === 'en_retard'
                            ? 'bg-[#E5483D] text-white'
                            : 'badge-lavender'
                        }`}
                      >
                        {pay.statut}
                      </span>

                      {pay.statut !== 'paye' ? (
                        <button
                          type="button"
                          onClick={() => markPaiement(pay.id, 'paye', 'Virement bancaire')}
                          className="btn-pill-sun !min-h-[34px] !py-1 !px-3 !text-[11px]"
                        >
                          <span>Marquer payé ✓</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            if (eleve && parent) generatePdfReceipt(pay, eleve, parent);
                          }}
                          className="btn-pill-white !min-h-[34px] !py-1 !px-3 !text-[11px]"
                        >
                          <Download className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
                          <span>Reçu PDF</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
