import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, KeyRound, AlertCircle, CheckCircle2, LogOut, ArrowRight } from 'lucide-react';

export const ForcePasswordChangeModal: React.FC = () => {
  const { user, profile, updatePassword, signOut } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Ce modal ne doit s'afficher QUE si l'utilisateur est connecté et doit changer son mot de passe
  if (!user || !profile || !profile.doit_changer_mdp) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    const res = await updatePassword(newPassword);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Erreur lors du changement de mot de passe.');
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A7A]/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md cloud-card p-6 sm:p-8 border-4 border-white shadow-cloud-pop space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-[24px] bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center mx-auto shadow-sun-glow">
            <KeyRound className="w-8 h-8 stroke-[2.5]" />
          </div>

          <h2 className="font-baloo font-extrabold text-2xl text-[#1B2A7A]">
            Première Connexion
          </h2>

          <p className="text-sm text-[#4A5487] font-baloo leading-relaxed">
            Bienvenue <strong>{profile?.prenom} {profile?.nom}</strong> ! Vous vous êtes connecté avec votre mot de passe temporaire.
          </p>

          <div className="p-3 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C] text-xs text-[#8C6D00] font-baloo font-bold">
            Pour la sécurité de votre compte sur Sihscool, veuillez définir votre mot de passe personnel définitif.
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[#E5483D] text-xs flex items-center gap-2 font-baloo font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={2.5} />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-2xl bg-[#EAF7E8] border border-[#BDE8B7] text-[#2B7A00] text-center font-baloo font-bold space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto" />
            <p>Votre mot de passe a été mis à jour avec succès !</p>
            <p className="text-xs text-[#4A5487]">Redirection vers votre espace...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-baloo">
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#1B2A7A] block">
                Nouveau mot de passe (min. 6 caractères) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#4A5487] absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full py-3.5 pl-11 pr-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-[#1B2A7A] text-sm font-bold min-h-[44px]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-[#1B2A7A] block">
                Confirmez votre nouveau mot de passe *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#4A5487] absolute left-4 top-1/2 -translate-y-1/2" strokeWidth={2.5} />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full py-3.5 pl-11 pr-4 rounded-full bg-[#FFFFFF] border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-[#1B2A7A] text-sm font-bold min-h-[44px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pill-sun w-full !text-sm min-h-[48px] disabled:opacity-50"
            >
              <span>{loading ? 'Enregistrement...' : 'Enregistrer mon mot de passe & Continuer'}</span>
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={signOut}
                className="inline-flex items-center gap-1.5 text-xs text-[#4A5487] hover:text-[#1B2A7A] font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Se déconnecter</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
