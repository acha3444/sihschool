import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2, AlertCircle, KeyRound, ArrowRight } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const { updatePassword, profile } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const res = await updatePassword(password);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        if (profile?.role === 'admin') navigate('/admin');
        else if (profile?.role === 'parent') navigate('/famille');
        else if (profile?.role === 'eleve') navigate('/eleve');
        else navigate('/login');
      }, 2000);
    } else {
      setError(res.error || 'Impossible de mettre à jour le mot de passe.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A9D8F5] via-[#BAE2F8] to-[#CDE9FA] text-[#1B2A7A] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <img
            src="/logo.svg"
            alt="Logo officiel de l'école Sihscool"
            className="h-12 w-auto drop-shadow-sm"
          />
        </div>
      </header>

      <main className="max-w-md mx-auto w-full my-auto py-6">
        <div className="cloud-card p-6 sm:p-8 border-4 border-white shadow-cloud-pop space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center mx-auto shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="font-baloo font-extrabold text-2xl text-[#1B2A7A]">
              Nouveau mot de passe
            </h1>
            <p className="text-xs sm:text-sm text-[#4A5487] font-semibold">
              Définissez un nouveau mot de passe sécurisé pour votre compte Sihscool.
            </p>
          </div>

          {success ? (
            <div className="p-4 rounded-2xl bg-[#EAFBF1] border border-[#C5F3D6] text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-[#1E7E44] mx-auto" />
              <p className="text-base font-bold text-[#1E7E44]">
                Votre mot de passe a été modifié avec succès !
              </p>
              <p className="text-sm text-[#1B2A7A]">Redirection en cours...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-2xl bg-[#FDE8E8] border border-[#F8B4B4] text-xs font-bold text-[#9B1C1C] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1B2A7A]">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1B2A7A]/50" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Au moins 6 caractères"
                    className="w-full min-h-[44px] pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-[#CDBDF2] text-base text-[#1B2A7A] focus:outline-none focus:ring-2 focus:ring-[#FFE15C]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1B2A7A]">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1B2A7A]/50" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    className="w-full min-h-[44px] pl-11 pr-4 py-2.5 rounded-2xl bg-white border border-[#CDBDF2] text-base text-[#1B2A7A] focus:outline-none focus:ring-2 focus:ring-[#FFE15C]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-pill-sun w-full min-h-[48px] text-base font-black flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <span>Enregistrement...</span>
                ) : (
                  <>
                    <span>Mettre à jour mon mot de passe</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="max-w-4xl mx-auto w-full text-center py-2 text-xs text-[#4A5487]">
        © {new Date().getFullYear()} Sihscool
      </footer>
    </div>
  );
};
