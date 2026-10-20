import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
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
  UserPlus,
  Phone,
  User as UserIcon,
} from 'lucide-react';
import { AVATAR_OPTIONS, AvatarDisplay } from '../common/AvatarDisplay';
import { Sunburst, FloatingCloud } from '../common/Sunburst';

export const AuthPage: React.FC = () => {
  const { loginWithEmail, loginStudent, loginAs, users, groupes, registerParentAndStudent } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentCode, setStudentCode] = useState('');

  // Parent Registration State
  const [parentAuthMode, setParentAuthMode] = useState<'login' | 'register'>('login');
  const [regParentPrenom, setRegParentPrenom] = useState('');
  const [regParentNom, setRegParentNom] = useState('');
  const [regParentEmail, setRegParentEmail] = useState('');
  const [regParentPhone, setRegParentPhone] = useState('');
  const [regStudentPrenom, setRegStudentPrenom] = useState('');
  const [regStudentNom, setRegStudentNom] = useState('');
  const [regStudentGroupId, setRegStudentGroupId] = useState('');
  const [regStudentAvatar, setRegStudentAvatar] = useState('cat-mint');
  const [newRegistrationResult, setNewRegistrationResult] = useState<{ parent: any; eleve: any } | null>(null);
  const [selectedAvatarKey, setSelectedAvatarKey] = useState('cat-mint');
  const [errorMessage, setErrorMessage] = useState('');
  const [forgotPasswordModal, setForgotPasswordModal] = useState(false);
  const [forgotEmailSent, setForgotEmailSent] = useState(false);

  const handleParentTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email) {
      setErrorMessage('Veuillez renseigner votre adresse e-mail.');
      return;
    }
    const success = loginWithEmail(email, selectedRole!);
    if (!success) {
      setErrorMessage('Identifiants incorrects ou compte introuvable pour ce profil.');
    }
  };

  const handleParentRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (
      !regParentPrenom.trim() ||
      !regParentNom.trim() ||
      !regParentEmail.trim() ||
      !regStudentPrenom.trim() ||
      !regStudentNom.trim()
    ) {
      setErrorMessage('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    const groupId = regStudentGroupId || (groupes[0]?.id || 'groupe-1');
    const result = registerParentAndStudent({
      parentPrenom: regParentPrenom,
      parentNom: regParentNom,
      parentEmail: regParentEmail,
      parentTelephone: regParentPhone,
      studentPrenom: regStudentPrenom,
      studentNom: regStudentNom,
      studentAvatar: regStudentAvatar,
      groupeId: groupId,
    });
    setNewRegistrationResult(result);
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
          <img src="/logo.svg" alt="Sihscool" className="h-12 w-auto drop-shadow-sm" />
        </div>

        <div className="badge-lavender shadow-sm font-baloo">
          <Sunburst size="sm" />
          <span>Apprendre avec joie & douceur</span>
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

              {/* Gouache Illustration Banner */}
              <div className="max-w-md mx-auto my-4 overflow-hidden rounded-[32px] shadow-cloud-pop border-4 border-[#FFF6E3] relative">
                <img
                  src="/illustrations/hero-mom-child.jpg"
                  alt="Maman et son enfant lisant l'arabe avec tendresse"
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
                    Les 17 leçons de Nourania en voyage de jeu, cartes de lettres et devoirs de récitation.
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
                    Suivez les présences de vos enfants, les mots du prof, les reçus et échangez en privé.
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
        ) : (
          /* ─── PARENT / TEACHER LOGIN (EMAIL + PASSWORD) & PARENT REGISTRATION ─── */
          <div className="max-w-lg mx-auto cloud-card p-6 sm:p-8 border-4 border-white shadow-cloud-pop animate-fadeIn space-y-6">
            <button
              onClick={() => {
                setSelectedRole(null);
                setErrorMessage('');
                setParentAuthMode('login');
                setNewRegistrationResult(null);
              }}
              className="inline-flex items-center gap-2 text-xs text-[#1B2A7A] hover:underline font-extrabold font-baloo"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2.5} /> Retour au choix du profil
            </button>

            {newRegistrationResult ? (
              <div className="space-y-6 text-center animate-fadeIn py-2">
                <div className="w-16 h-16 rounded-[24px] bg-[#58CC02]/20 text-[#2B7A00] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-baloo font-extrabold text-2xl text-[#1B2A7A]">
                    Bienvenue dans la famille Sihscool ! 🎉
                  </h3>
                  <p className="text-xs text-[#4A5487] font-baloo">
                    L'inscription de <strong>{newRegistrationResult.eleve.prenom} {newRegistrationResult.eleve.nom}</strong> a bien été enregistrée.
                  </p>
                </div>

                <div className="p-4 rounded-3xl bg-[#FFF6E3] border-2 border-[#FFE15C] space-y-2">
                  <p className="text-xs text-[#8C6D00] font-baloo font-extrabold uppercase">
                    Code secret écolier de {newRegistrationResult.eleve.prenom} :
                  </p>
                  <p className="font-mono text-3xl font-black text-[#1B2A7A] tracking-[0.25em]">
                    {newRegistrationResult.eleve.code_connexion}
                  </p>
                  <p className="text-[11px] text-[#4A5487] font-baloo">
                    Votre enfant utilisera ce code à 6 chiffres et son avatar ({newRegistrationResult.eleve.avatar}) pour se connecter à son carnet de cours.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => loginAs(newRegistrationResult.parent)}
                  className="btn-pill-sun w-full"
                >
                  <span>Accéder à mon Espace Famille</span>
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <>
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
                    {selectedRole === 'parent'
                      ? parentAuthMode === 'login'
                        ? 'Connexion Espace Famille'
                        : 'Inscription Famille & Inscription Enfant'
                      : 'Connexion Enseignant & Direction'}
                  </h2>
                  <p className="text-xs text-[#4A5487] font-baloo">
                    {selectedRole === 'parent'
                      ? parentAuthMode === 'login'
                        ? 'Entrez votre adresse e-mail rattachée à l’école'
                        : 'Inscrivez votre enfant pour démarrer l’apprentissage de l’arabe et la méthode Nourania'
                      : 'Entrez votre adresse e-mail rattachée à l’école'}
                  </p>
                </div>

                {/* Segmented Switcher for Parent: Connexion vs Inscription */}
                {selectedRole === 'parent' && (
                  <div className="flex rounded-full bg-[#EAF2F8] p-1 border border-[#CDBDF2]">
                    <button
                      type="button"
                      onClick={() => {
                        setParentAuthMode('login');
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-2 px-3 rounded-full text-xs font-baloo font-extrabold transition-all ${
                        parentAuthMode === 'login'
                          ? 'bg-[#FFFFFF] text-[#1B2A7A] shadow-sm'
                          : 'text-[#4A5487] hover:text-[#1B2A7A]'
                      }`}
                    >
                      Se connecter
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setParentAuthMode('register');
                        setErrorMessage('');
                      }}
                      className={`flex-1 py-2 px-3 rounded-full text-xs font-baloo font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                        parentAuthMode === 'register'
                          ? 'bg-[#FFE15C] text-[#1B2A7A] shadow-sm'
                          : 'text-[#4A5487] hover:text-[#1B2A7A]'
                      }`}
                    >
                      <UserPlus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      Première inscription
                    </button>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-3.5 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[#1B2A7A] text-xs flex items-center gap-2 font-baloo font-bold">
                    <AlertCircle className="w-4 h-4 text-[#E5483D] shrink-0" strokeWidth={2.5} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* PARENT LOGIN FORM */}
                {(selectedRole !== 'parent' || parentAuthMode === 'login') && (
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
                          Mot de passe
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
                      className={`w-full ${selectedRole === 'parent' ? 'btn-pill-sun' : 'btn-pill-sun'}`}
                    >
                      <span>Accéder à mon tableau de bord</span>
                      <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </form>
                )}

                {/* PARENT REGISTRATION FORM */}
                {selectedRole === 'parent' && parentAuthMode === 'register' && (
                  <form onSubmit={handleParentRegister} className="space-y-4">
                    {/* Responsable Legal */}
                    <div className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#CDBDF2] space-y-3">
                      <span className="text-xs font-extrabold font-baloo text-[#1B2A7A] flex items-center gap-1.5">
                        <UserIcon className="w-4 h-4 text-[#CDBDF2]" strokeWidth={2.5} />
                        1. Vos coordonnées (Parent / Tuteur)
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          required
                          value={regParentPrenom}
                          onChange={(e) => setRegParentPrenom(e.target.value)}
                          placeholder="Votre prénom"
                          className="py-2.5 px-4 rounded-full bg-[#F8FAFC] border-2 border-[#CDBDF2] text-xs font-baloo font-bold focus:outline-none focus:border-[#FFE15C]"
                        />
                        <input
                          type="text"
                          required
                          value={regParentNom}
                          onChange={(e) => setRegParentNom(e.target.value)}
                          placeholder="Votre nom de famille"
                          className="py-2.5 px-4 rounded-full bg-[#F8FAFC] border-2 border-[#CDBDF2] text-xs font-baloo font-bold focus:outline-none focus:border-[#FFE15C]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="email"
                          required
                          value={regParentEmail}
                          onChange={(e) => setRegParentEmail(e.target.value)}
                          placeholder="Votre adresse e-mail"
                          className="py-2.5 px-4 rounded-full bg-[#F8FAFC] border-2 border-[#CDBDF2] text-xs font-baloo font-bold focus:outline-none focus:border-[#FFE15C]"
                        />
                        <input
                          type="tel"
                          value={regParentPhone}
                          onChange={(e) => setRegParentPhone(e.target.value)}
                          placeholder="Téléphone (ex: 06 12 34 56 78)"
                          className="py-2.5 px-4 rounded-full bg-[#F8FAFC] border-2 border-[#CDBDF2] text-xs font-baloo font-bold focus:outline-none focus:border-[#FFE15C]"
                        />
                      </div>
                    </div>

                    {/* Enfant à inscrire */}
                    <div className="p-4 rounded-3xl bg-[#FFFFFF] border border-[#CDBDF2] space-y-3">
                      <span className="text-xs font-extrabold font-baloo text-[#1B2A7A] flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[#FFE15C]" strokeWidth={2.5} />
                        2. L'enfant à inscrire
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <input
                          type="text"
                          required
                          value={regStudentPrenom}
                          onChange={(e) => setRegStudentPrenom(e.target.value)}
                          placeholder="Prénom de l'enfant"
                          className="py-2.5 px-4 rounded-full bg-[#F8FAFC] border-2 border-[#CDBDF2] text-xs font-baloo font-bold focus:outline-none focus:border-[#FFE15C]"
                        />
                        <input
                          type="text"
                          required
                          value={regStudentNom}
                          onChange={(e) => setRegStudentNom(e.target.value)}
                          placeholder="Nom de l'enfant"
                          className="py-2.5 px-4 rounded-full bg-[#F8FAFC] border-2 border-[#CDBDF2] text-xs font-baloo font-bold focus:outline-none focus:border-[#FFE15C]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold font-baloo text-[#4A5487] block">
                          Classe / Groupe souhaité :
                        </label>
                        <select
                          value={regStudentGroupId}
                          onChange={(e) => setRegStudentGroupId(e.target.value)}
                          className="w-full py-2.5 px-4 rounded-full bg-[#F8FAFC] border-2 border-[#CDBDF2] text-xs font-baloo font-bold focus:outline-none text-[#1B2A7A]"
                        >
                          {groupes.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.nom} ({g.creneau})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold font-baloo text-[#4A5487] block">
                          Avatar animal pour son cahier :
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {AVATAR_OPTIONS.slice(0, 4).map((av) => (
                            <button
                              key={av.id}
                              type="button"
                              onClick={() => setRegStudentAvatar(av.id)}
                              className={`p-2 rounded-2xl flex flex-col items-center gap-1 border-2 transition-all ${
                                regStudentAvatar === av.id
                                  ? 'border-[#FFE15C] bg-[#FFF6E3] shadow-sun-glow'
                                  : 'border-transparent bg-[#F8FAFC] hover:bg-white'
                              }`}
                            >
                              <AvatarDisplay avatarKey={av.id} size="sm" />
                              <span className="text-[10px] font-baloo font-bold text-[#1B2A7A]">
                                {av.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn-pill-sun w-full !text-sm"
                    >
                      <UserPlus className="w-4 h-4" strokeWidth={2.5} />
                      <span>Inscrire mon enfant & Créer mon espace</span>
                    </button>
                  </form>
                )}
              </>
            )}
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

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center py-4 border-t border-[#CDBDF2]/40 text-xs text-[#4A5487] font-baloo relative z-10 space-y-2">
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
        <p>Sihscool © 2026 · Espace d’apprentissage doux et rassurant pour toute la famille.</p>
      </footer>
    </div>
  );
};
