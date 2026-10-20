import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Sparkles,
  Users,
  GraduationCap,
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Info,
  ShieldCheck,
} from 'lucide-react';
import { AVATAR_OPTIONS, AvatarDisplay } from '../common/AvatarDisplay';
import { Sunburst, FloatingCloud } from '../common/Sunburst';
import { LegalModal, LegalTabType } from '../legal/LegalModal';

interface AuthPageProps {
  onOpenLegal?: (tab: LegalTabType) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onOpenLegal }) => {
  const { loginWithEmail, loginStudent, loginAs, updateUserPassword, users } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [selectedAvatarKey, setSelectedAvatarKey] = useState('cat-mint');
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  // Local fallback for legal modal if not handled by parent App
  const [localLegalModal, setLocalLegalModal] = useState<{ isOpen: boolean; tab: LegalTabType }>({
    isOpen: false,
    tab: 'rgpd',
  });

  const handleOpenLegal = (tab: LegalTabType) => {
    if (onOpenLegal) {
      onOpenLegal(tab);
    } else {
      setLocalLegalModal({ isOpen: true, tab });
    }
  };

  // First Login Password Change State
  const [passwordChangeUser, setPasswordChangeUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeError, setPasswordChangeError] = useState('');

  const handleParentTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email) {
      setErrorMessage('Veuillez renseigner votre adresse e-mail.');
      return;
    }
    const result = loginWithEmail(email, password, selectedRole!);
    if (!result.success) {
      setErrorMessage(result.error || 'Identifiants incorrects ou compte introuvable pour ce profil.');
      return;
    }

    if (result.requiresPasswordChange && result.user) {
      setPasswordChangeUser(result.user);
      return;
    }
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordChangeError('');
    if (!newPassword || newPassword.length < 6) {
      setPasswordChangeError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordChangeError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (!passwordChangeUser) return;

    updateUserPassword(passwordChangeUser.id, newPassword);
    loginAs(passwordChangeUser);
  };

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!studentCode || studentCode.length < 6) {
      setErrorMessage('Veuillez saisir ton code secret à 6 chiffres.');
      return;
    }
    const success = loginStudent(studentCode, selectedAvatarKey);
    if (!success) {
      setErrorMessage('Code à 6 chiffres ou avatar non reconnu. Vérifie avec ton professeur !');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A9D8F5] via-[#BAE2F8] to-[#CDE9FA] text-[#1B2A7A] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative Floating Pastel Clouds */}
      <FloatingCloud className="absolute -top-6 -left-12 w-48 h-24 animate-float" />
      <FloatingCloud className="absolute top-20 -right-10 w-64 h-32 animate-float-delayed" />
      <FloatingCloud className="absolute bottom-10 -left-16 w-56 h-28 animate-float" />

      {/* Top Header */}
      <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2 relative z-10">
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Logo officiel de l'école Sihscool avec la lettre Alif calligraphiée"
            className="h-12 w-auto drop-shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenLegal('rgpd')}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#1B2A7A] hover:underline font-baloo font-bold bg-[#FFFFFF]/80 border border-[#CDBDF2] px-3 py-1.5 rounded-full shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
            <span>Charte & RGPD</span>
          </button>

          <div className="badge-lavender shadow-sm font-baloo">
            <Sunburst size="sm" />
            <span>Apprendre avec joie & douceur</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full my-auto py-6 relative z-10">
        {!selectedRole ? (
          <div className="space-y-8 animate-fadeIn">
            {/* Title Section with Sunburst rays & Gouache illustration */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2">
                <Sunburst size="md" />
                <span className="badge-lavender text-xs uppercase tracking-wider font-extrabold font-baloo">
                  Plateforme pour les mamans et les enfants
                </span>
                <Sunburst size="md" />
              </div>

              <h1 className="font-baloo font-extrabold text-3xl sm:text-5xl text-[#1B2A7A] leading-tight tracking-tight">
                Bienvenue sur <span className="text-[#1B2A7A] underline decoration-[#FFE15C] decoration-wavy">Sihscool</span> !
              </h1>

              <p className="text-[#4A5487] text-sm sm:text-base max-w-lg mx-auto font-baloo font-semibold">
                Un livre illustré vivant pour apprendre l’arabe littéraire et la méthode Nourania pas à pas, avec douceur et bienveillance.
              </p>

              {/* Badges Cours Zoom & Durée 1h30 */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <span className="badge-lavender text-xs font-extrabold shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2F5BD1]" />
                  Cours interactifs en visio sur Zoom
                </span>
                <span className="bg-[#FFE15C] text-[#1B2A7A] text-xs font-extrabold px-3.5 py-1 rounded-full shadow-sm">
                  1h30 par semaine en petit groupe
                </span>
              </div>

              {/* Gouache Illustration Banner */}
              <div className="max-w-md mx-auto my-4 overflow-hidden rounded-[32px] shadow-cloud-pop border-4 border-[#FFF6E3] relative">
                <img
                  src="/illustrations/hero-mom-child.jpg"
                  alt="Illustration peinte à la gouache : une maman et son jeune enfant lisant ensemble un manuel de langue arabe dans une atmosphère douce et bienveillante"
                  className="w-full h-48 sm:h-56 object-cover object-center"
                />
                <div className="absolute bottom-2 right-3 badge-lavender !py-0.5 !px-2.5 text-[10px] shadow-sm">
                  Illustration Sihscool
                </div>
              </div>
            </div>

            {/* 3 Large Cloud-shaped Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
              {/* Card 1: Élève */}
              <div className="cloud-card p-6 sm:p-7 flex flex-col items-center text-center justify-between border-2 border-white hover:border-[#FFE15C] transition-all duration-200 hover:-translate-y-1">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-[28px] bg-[#FFE15C] flex items-center justify-center text-[#1B2A7A] shadow-sun-glow">
                    <Sparkles className="w-10 h-10" strokeWidth={2.5} />
                  </div>
                  <Sunburst size="sm" className="absolute -top-2 -right-2" />
                </div>

                <div className="space-y-1 my-2">
                  <h2 className="font-baloo font-extrabold text-2xl text-[#1B2A7A]">
                    Je suis élève
                  </h2>
                  <p className="font-arabic text-2xl text-[#E5483D] font-bold" dir="rtl">
                    أَنَا تِلْمِيذ
                  </p>
                  <p className="text-xs text-[#4A5487] leading-relaxed font-baloo">
                    Séances Zoom de 1h30 en direct, les 17 leçons de Nourania en voyage de jeu et devoirs de récitation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('eleve');
                    setErrorMessage('');
                  }}
                  className="btn-pill-sun w-full mt-4"
                >
                  <span>Mon espace écolier</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Card 2: Parent */}
              <div className="cloud-card p-6 sm:p-7 flex flex-col items-center text-center justify-between border-2 border-white hover:border-[#CDBDF2] transition-all duration-200 hover:-translate-y-1">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-[28px] bg-[#CDBDF2] flex items-center justify-center text-[#1B2A7A] shadow-lavender-glow">
                    <Users className="w-10 h-10" strokeWidth={2.5} />
                  </div>
                  <Sunburst size="sm" className="absolute -top-2 -right-2" />
                </div>

                <div className="space-y-1 my-2">
                  <h2 className="font-baloo font-extrabold text-2xl text-[#1B2A7A]">
                    Je suis parent
                  </h2>
                  <p className="font-arabic text-2xl text-[#2F5BD1] font-bold" dir="rtl">
                    أَنَا وَلِيُّ الأَمْر
                  </p>
                  <p className="text-xs text-[#4A5487] leading-relaxed font-baloo">
                    Rejoignez les cours Zoom (1h30/semaine), suivez les présences, les progrès et échangez avec le professeur.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('parent');
                    setErrorMessage('');
                  }}
                  className="btn-pill-white w-full mt-4"
                >
                  <span>Espace Famille</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>

              {/* Card 3: Prof / Direction */}
              <div className="cloud-card p-6 sm:p-7 flex flex-col items-center text-center justify-between border-2 border-white hover:border-[#FFE15C] transition-all duration-200 hover:-translate-y-1">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-[28px] bg-[#BAE2F8] flex items-center justify-center text-[#1B2A7A] shadow-soft-blue">
                    <GraduationCap className="w-10 h-10" strokeWidth={2.5} />
                  </div>
                  <Sunburst size="sm" className="absolute -top-2 -right-2" />
                </div>

                <div className="space-y-1 my-2">
                  <h2 className="font-baloo font-extrabold text-2xl text-[#1B2A7A]">
                    Prof & Direction
                  </h2>
                  <p className="font-arabic text-2xl text-[#E5483D] font-bold" dir="rtl">
                    أُسْتَاذ / إِدَارَة
                  </p>
                  <p className="text-xs text-[#4A5487] leading-relaxed font-baloo">
                    Faites l’appel en 1 clic, validez les leçons, corrigez les devoirs et gérez l'école.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('prof');
                    setErrorMessage('');
                  }}
                  className="btn-pill-white w-full mt-4"
                >
                  <span>Espace Enseignant & Admin</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>

          </div>
        ) : selectedRole === 'eleve' ? (
          /* ─── ÉLÈVE LOGIN (CODE 6 CHIFFRES + AVATAR) ─── */
          <div className="max-w-md mx-auto cloud-card p-6 sm:p-8 border-4 border-white shadow-cloud-pop animate-fadeIn space-y-6">
            <button
              onClick={() => {
                setSelectedRole(null);
                setErrorMessage('');
              }}
              className="inline-flex items-center gap-2 text-xs text-[#1B2A7A] hover:underline font-extrabold font-baloo"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} /> Retour au choix du profil
            </button>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-[24px] bg-[#FFE15C] flex items-center justify-center text-[#1B2A7A] mx-auto shadow-sun-glow">
                <Sparkles className="w-8 h-8" strokeWidth={2.5} />
              </div>
              <h2 className="font-baloo font-extrabold text-2xl text-[#1B2A7A]">
                Espace Petit Écolier
              </h2>
              <p className="text-xs text-[#4A5487] font-baloo">
                Choisis ton avatar et saisis ton code secret à 6 chiffres
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[#1B2A7A] text-xs flex items-center gap-2 font-baloo font-bold">
                <AlertCircle className="w-4 h-4 text-[#E5483D] shrink-0" strokeWidth={2.5} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleStudentLogin} className="space-y-5">
              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold font-baloo text-[#1B2A7A] block">
                  1. Ton avatar magique :
                </label>
                <div className="grid grid-cols-5 gap-2 bg-[#FFFFFF] p-3 rounded-3xl border border-[#CDBDF2]">
                  {AVATAR_OPTIONS.slice(0, 10).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedAvatarKey(opt.id)}
                      className={`flex flex-col items-center justify-center p-1 rounded-2xl transition-all ${
                        selectedAvatarKey === opt.id
                          ? 'ring-4 ring-[#FFE15C] scale-110 shadow-sm'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      title={opt.label}
                    >
                      <AvatarDisplay avatarKey={opt.id} size="sm" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 6-Digit Code */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold font-baloo text-[#1B2A7A]">
                    2. Ton code secret (6 chiffres) :
                  </label>
                  <span className="badge-lavender text-[10px]">Exemple : 123456</span>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  pattern="[0-9]*"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full text-center tracking-[0.8em] text-2xl font-mono py-3 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-[#1B2A7A] shadow-inner font-extrabold"
                />
              </div>

              <button type="submit" className="btn-pill-sun w-full !text-base">
                <span>Ouvrir mon cahier d’arabe</span>
                <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </form>
          </div>
        ) : passwordChangeUser ? (
          /* ─── PREMIÈRE CONNEXION : DÉFINITION OBLIGATOIRE DU MOT DE PASSE PERSONNEL ─── */
          <div className="max-w-md mx-auto cloud-card p-6 sm:p-8 border-4 border-white shadow-cloud-pop animate-fadeIn space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-[24px] bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center mx-auto shadow-sun-glow">
                <KeyRound className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h2 className="font-baloo font-extrabold text-2xl text-[#1B2A7A]">
                Première Connexion
              </h2>
              <p className="text-xs text-[#4A5487] font-baloo leading-relaxed">
                Bienvenue <strong>{passwordChangeUser.prenom}</strong> ! Vous vous êtes connecté(e) avec votre mot de passe temporaire.
              </p>
              <div className="p-3 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C] text-[11px] text-[#8C6D00] font-baloo font-bold">
                Pour la sécurité de votre compte famille, veuillez choisir votre nouveau mot de passe personnel.
              </div>
            </div>

            {passwordChangeError && (
              <div className="p-3.5 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[#1B2A7A] text-xs flex items-center gap-2 font-baloo font-bold">
                <AlertCircle className="w-4 h-4 text-[#E5483D] shrink-0" strokeWidth={2.5} />
                <span>{passwordChangeError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4 font-baloo">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#1B2A7A] block">
                  Nouveau mot de passe personnel
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#4A5487] absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    className="w-full py-3.5 pl-11 pr-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-[#1B2A7A] text-xs font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#1B2A7A] block">
                  Confirmez votre nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#4A5487] absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Retapez le mot de passe"
                    className="w-full py-3.5 pl-11 pr-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-[#1B2A7A] text-xs font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-pill-sun w-full !text-sm"
              >
                <span>Enregistrer mon mot de passe & Continuer</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </form>
          </div>
        ) : (
          /* ─── PARENT / TEACHER LOGIN (EMAIL + PASSWORD / TEMP PASSWORD) ─── */
          <div className="max-w-md mx-auto cloud-card p-6 sm:p-8 border-4 border-white shadow-cloud-pop animate-fadeIn space-y-6">
            <button
              onClick={() => {
                setSelectedRole(null);
                setErrorMessage('');
                setPasswordChangeUser(null);
              }}
              className="inline-flex items-center gap-2 text-xs text-[#1B2A7A] hover:underline font-extrabold font-baloo"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} /> Retour au choix du profil
            </button>

            <div className="text-center space-y-2">
              <div
                className={`w-16 h-16 rounded-[24px] flex items-center justify-center mx-auto shadow-sm ${
                  selectedRole === 'parent' ? 'bg-[#CDBDF2] text-[#1B2A7A]' : 'bg-[#FFE15C] text-[#1B2A7A]'
                }`}
              >
                {selectedRole === 'parent' ? (
                  <Users className="w-8 h-8" strokeWidth={2.5} />
                ) : (
                  <GraduationCap className="w-8 h-8" strokeWidth={2.5} />
                )}
              </div>
              <h2 className="font-baloo font-extrabold text-2xl text-[#1B2A7A]">
                {selectedRole === 'parent' ? 'Connexion Espace Famille' : 'Connexion Enseignant & Direction'}
              </h2>
              <p className="text-xs text-[#4A5487] font-baloo">
                {selectedRole === 'parent'
                  ? 'Accès réservé aux parents inscrits par l’établissement'
                  : 'Entrez votre adresse e-mail rattachée à l’école'}
              </p>
            </div>

            {selectedRole === 'parent' && (
              <div className="p-3.5 rounded-2xl bg-[#EAF2F8] border border-[#CDBDF2] text-[11px] text-[#4A5487] font-baloo flex items-start gap-2 leading-relaxed">
                <Info className="w-4 h-4 text-[#1B2A7A] shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>
                  Votre compte famille est créé par l’école lors de l’inscription de votre enfant. Pour votre première connexion, utilisez le <strong>mot de passe temporaire</strong> transmis par la direction.
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[#1B2A7A] text-xs flex items-center gap-2 font-baloo font-bold">
                <AlertCircle className="w-4 h-4 text-[#E5483D] shrink-0" strokeWidth={2.5} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleParentTeacherLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold font-baloo text-[#1B2A7A] block">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#4A5487] absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      selectedRole === 'parent' ? 'yasmina.benali@gmail.com' : 'direction@sihscool.fr ou fatima@sihscool.fr'
                    }
                    className="w-full py-3.5 pl-11 pr-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-[#1B2A7A] text-xs font-baloo font-bold"
                  />
                </div>
                {selectedRole === 'prof' && (
                  <p className="text-[11px] text-[#4A5487] pl-2 font-baloo">
                    Pour l'espace Direction / Administrateur : <strong className="text-[#1B2A7A]">direction@sihscool.fr</strong>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold font-baloo text-[#1B2A7A]">
                    {selectedRole === 'parent' ? 'Mot de passe (ou mot de passe temporaire)' : 'Mot de passe'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setForgotPasswordModal(true)}
                    className="text-[11px] text-[#1B2A7A] hover:underline font-baloo font-bold"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#4A5487] absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full py-3.5 pl-11 pr-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-[#1B2A7A] text-xs font-baloo font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-pill-sun w-full"
              >
                <span>Accéder à mon tableau de bord</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Forgot Password Modal */}
      {forgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm cloud-card p-6 shadow-cloud-pop space-y-4 border-4 border-white">
            <h3 className="font-baloo font-extrabold text-xl text-[#1B2A7A]">
              Mot de passe oublié
            </h3>
            {!forgotEmailSent ? (
              <>
                <p className="text-xs text-[#4A5487] font-baloo leading-relaxed">
                  Indiquez votre adresse e-mail. Un lien sécurisé vous sera transmis pour redéfinir votre mot de passe en toute simplicité.
                </p>
                <input
                  type="email"
                  placeholder="votre.email@exemple.fr"
                  className="w-full py-3 px-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] text-xs font-baloo focus:outline-none"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordModal(false)}
                    className="px-4 py-2 rounded-full text-xs text-[#4A5487] font-baloo font-bold"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotEmailSent(true)}
                    className="btn-pill-sun !min-h-[40px] !text-xs !py-2"
                  >
                    Envoyer le lien
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3 text-center py-2">
                <CheckCircle2 className="w-10 h-10 text-[#1B2A7A] mx-auto" strokeWidth={2.5} />
                <p className="text-xs text-[#1B2A7A] font-baloo font-bold">
                  Lien de réinitialisation envoyé ! Vérifiez votre boîte de réception.
                </p>
                <button
                  onClick={() => {
                    setForgotPasswordModal(false);
                    setForgotEmailSent(false);
                  }}
                  className="btn-pill-sun w-full !min-h-[40px] !text-xs"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer avec liens de conformité légale & RGPD */}
      <footer className="max-w-4xl mx-auto w-full text-center py-4 border-t border-[#CDBDF2]/40 text-xs text-[#4A5487] font-baloo relative z-10 space-y-2.5">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('prof');
              setEmail('direction@sihscool.fr');
            }}
            className="hover:text-[#1B2A7A] hover:underline flex items-center gap-1 font-bold text-[11px] bg-[#FFFFFF]/80 px-3.5 py-1.5 rounded-full border border-[#CDBDF2] shadow-sm transition-all"
          >
            <span>Accès Direction & Administration</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Liens de conformité RGPD, CGU, Remboursement, Cookies, Mineurs */}
        <nav aria-label="Liens d'information légale et réglementaire" className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] pt-1">
          <button
            type="button"
            onClick={() => handleOpenLegal('rgpd')}
            className="text-[#4A5487] hover:text-[#1B2A7A] hover:underline font-bold transition-colors"
          >
            Politique de Confidentialité (RGPD)
          </button>
          <span className="text-[#CDBDF2]" aria-hidden="true">•</span>

          <button
            type="button"
            onClick={() => handleOpenLegal('cgu')}
            className="text-[#4A5487] hover:text-[#1B2A7A] hover:underline font-bold transition-colors"
          >
            Conditions Générales (CGU / CGV)
          </button>
          <span className="text-[#CDBDF2]" aria-hidden="true">•</span>

          <button
            type="button"
            onClick={() => handleOpenLegal('remboursement')}
            className="text-[#4A5487] hover:text-[#1B2A7A] hover:underline font-bold transition-colors"
          >
            Rétractation (14j) & Remboursement
          </button>
          <span className="text-[#CDBDF2]" aria-hidden="true">•</span>

          <button
            type="button"
            onClick={() => handleOpenLegal('cookies')}
            className="text-[#4A5487] hover:text-[#1B2A7A] hover:underline font-bold transition-colors"
          >
            Politique des Cookies (0 traceur publicitaire)
          </button>
          <span className="text-[#CDBDF2]" aria-hidden="true">•</span>

          <button
            type="button"
            onClick={() => handleOpenLegal('mineurs')}
            className="text-[#4A5487] hover:text-[#1B2A7A] hover:underline font-bold transition-colors"
          >
            Protection des Mineurs
          </button>
          <span className="text-[#CDBDF2]" aria-hidden="true">•</span>

          <button
            type="button"
            onClick={() => handleOpenLegal('mentions')}
            className="text-[#4A5487] hover:text-[#1B2A7A] hover:underline font-bold transition-colors"
          >
            Mentions Légales
          </button>
        </nav>

        <p className="text-[11px] text-[#4A5487] font-medium">
          Sihscool © 2026 · Institut d'apprentissage doux et rassurant pour toute la famille. Hébergé en UE · Conforme CNIL.
        </p>
      </footer>

      {/* Local fallback modal */}
      {!onOpenLegal && (
        <LegalModal
          isOpen={localLegalModal.isOpen}
          onClose={() => setLocalLegalModal((prev) => ({ ...prev, isOpen: false }))}
          defaultTab={localLegalModal.tab}
        />
      )}
    </div>
  );
};
