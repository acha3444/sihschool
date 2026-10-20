import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const { signIn, resetPassword, profile, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Mode mot de passe oublié
  const [isForgotMode, setIsForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // Si déjà connecté, rediriger selon le rôle
  React.useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin') navigate('/admin', { replace: true });
      else if (profile.role === 'parent') navigate('/famille', { replace: true });
      else if (profile.role === 'eleve') navigate('/eleve', { replace: true });
    }
  }, [user, profile, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Veuillez renseigner votre adresse e-mail et votre mot de passe.');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Identifiants incorrects.');
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail) {
      setForgotError('Veuillez renseigner votre adresse e-mail.');
      return;
    }

    setForgotLoading(true);
    const res = await resetPassword(forgotEmail);
    setForgotLoading(false);

    if (res.success) {
      setForgotSuccess(true);
    } else {
      setForgotError(res.error || 'Impossible d\'envoyer le lien de réinitialisation.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A9D8F5] via-[#BAE2F8] to-[#CDE9FA] text-[#1B2A7A] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Logo officiel de l'école Sihscool"
            className="h-12 w-auto drop-shadow-sm"
          />
        </div>
        <div className="badge-lavender font-baloo shadow-sm text-xs font-bold">
          Apprendre avec joie & douceur
        </div>
      </header>

      {/* Main card */}
      <main className="max-w-md mx-auto w-full my-auto py-6">
        <div className="cloud-card p-6 sm:p-8 border-4 border-white shadow-cloud-pop space-y-6">
          {/* Logo / illustration header */}
          <div className="text-center space-y-2">
            <h1 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1B2A7A] leading-tight">
              Bienvenue sur <span className="underline decoration-[#FFE15C] decoration-wavy">Sihscool</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#4A5487] font-baloo font-semibold">
              Espace de suivi pour l'apprentissage de l'arabe et de la méthode Nourania.
            </p>
          </div>

          {!isForgotMode ? (
            /* ─── FORMULAIRE DE CONNEXION UNIQUE ─── */
            <form onSubmit={handleLogin} className="space-y-4 font-baloo">
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[#E5483D] text-xs flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#1B2A7A] block">
                  Adresse e-mail *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#4A5487] absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nom@exemple.com"
                    autoComplete="email"
                    className="w-full py-3.5 pl-11 pr-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-[#1B2A7A] text-sm font-bold min-h-[44px]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-[#1B2A7A]">
                    Mot de passe *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(true);
                      setForgotEmail(email);
                      setErrorMessage('');
                    }}
                    className="text-xs text-[#1B2A7A] hover:underline font-bold"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#4A5487] absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full py-3.5 pl-11 pr-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-[#1B2A7A] text-sm font-bold min-h-[44px]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-pill-sun w-full min-h-[48px] !text-base disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Connexion en cours...' : 'Accéder à mon espace'}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </button>

              <div className="pt-2 text-center text-xs text-[#4A5487] font-semibold leading-relaxed">
                Première connexion ? Utilisez le <strong>mot de passe temporaire</strong> transmis par la direction.
              </div>
            </form>
          ) : (
            /* ─── FORMULAIRE MOT DE PASSE OUBLIÉ ─── */
            <div className="space-y-4 font-baloo">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center mx-auto shadow-sm">
                  <KeyRound className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h2 className="font-extrabold text-xl text-[#1B2A7A]">
                  Mot de passe oublié
                </h2>
                <p className="text-xs text-[#4A5487]">
                  Indiquez votre adresse e-mail pour recevoir les instructions de réinitialisation.
                </p>
              </div>

              {forgotError && (
                <div className="p-3.5 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[#E5483D] text-xs flex items-center gap-2 font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess ? (
                <div className="p-4 rounded-2xl bg-[#EAF7E8] border border-[#BDE8B7] text-[#2B7A00] text-center font-bold space-y-2">
                  <CheckCircle2 className="w-8 h-8 mx-auto" />
                  <p className="text-sm">E-mail envoyé avec succès !</p>
                  <p className="text-xs text-[#4A5487]">
                    Vérifiez votre boîte de réception pour définir votre nouveau mot de passe.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotMode(false);
                      setForgotSuccess(false);
                    }}
                    className="btn-pill-sun !min-h-[40px] !text-xs !py-1 !px-4 mt-2"
                  >
                    Retour à la connexion
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-[#1B2A7A] block">
                      Votre adresse e-mail *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#4A5487] absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="nom@exemple.com"
                        className="w-full py-3.5 pl-11 pr-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-[#1B2A7A] text-sm font-bold min-h-[44px]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="btn-pill-sun w-full min-h-[48px] !text-sm disabled:opacity-50"
                  >
                    <span>{forgotLoading ? 'Envoi en cours...' : 'Envoyer le lien'}</span>
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setIsForgotMode(false)}
                      className="text-xs text-[#4A5487] hover:text-[#1B2A7A] font-bold"
                    >
                      ← Revenir à la connexion
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer minimaliste et propre sans mention CNIL */}
      <footer className="text-center py-4 text-xs text-[#4A5487] font-baloo font-semibold">
        © {new Date().getFullYear()} Sihscool · Institut d'apprentissage de l'arabe en douceur
      </footer>
    </div>
  );
};
