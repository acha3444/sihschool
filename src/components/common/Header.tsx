import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShieldCheck, Users, GraduationCap, BookOpen, KeyRound, X, CheckCircle2, AlertCircle } from 'lucide-react';

const ChangePasswordModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Au moins 6 caractères.');
    if (password !== confirm) return setError('Les deux mots de passe ne correspondent pas.');
    setSaving(true);
    const res = await updatePassword(password);
    setSaving(false);
    if (!res.success) return setError(res.error || 'Erreur lors du changement.');
    setDone(true);
  };

  const inputClass =
    'w-full py-3 px-4 rounded-full bg-white border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-sm font-bold text-[#1B2A7A] min-h-[44px]';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A7A]/50 backdrop-blur-sm font-baloo">
      <div className="w-full max-w-sm cloud-card p-6 border-4 border-white shadow-cloud-pop space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg text-[#1B2A7A]">Changer mon mot de passe</h3>
          <button type="button" onClick={onClose} className="text-[#4A5487]" aria-label="Fermer">
            <X className="w-4 h-4" />
          </button>
        </div>
        {done ? (
          <div className="p-4 rounded-2xl bg-[#EAF7E8] border border-[#BDE8B7] text-[#2B7A00] text-center font-bold space-y-2">
            <CheckCircle2 className="w-7 h-7 mx-auto" />
            <p>Mot de passe changé !</p>
            <button type="button" onClick={onClose} className="btn-pill-white !min-h-[40px] !text-xs">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="p-3 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[#E5483D] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Nouveau mot de passe"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Confirmer"
              className={inputClass}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button type="submit" disabled={saving} className="btn-pill-sun w-full !min-h-[46px]">
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export const Header: React.FC = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  if (!profile) return null;

  const btnClass =
    'btn-pill-white !min-h-[40px] !py-1.5 !px-3 !text-xs flex items-center gap-1.5 shadow-xs hover:border-[#FFE15C]';

  return (
    <header className="sticky top-0 z-40 bg-[#FFF6E3]/95 backdrop-blur-md border-b border-[#CDBDF2]/40 px-4 py-2.5 sm:px-6 shadow-[0_4px_20px_rgba(27,42,122,0.05)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 min-w-0">
          <img src="/logo.svg" alt="Logo SihSchool" className="h-9 sm:h-10 w-auto drop-shadow-sm shrink-0" />

          {/* Role Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-baloo font-bold border border-[#CDBDF2] bg-[#FFFFFF] text-[#1B2A7A] shadow-xs">
            {profile.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />}
            {profile.role === 'prof' && <BookOpen className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />}
            {profile.role === 'parent' && <Users className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />}
            {profile.role === 'eleve' && <GraduationCap className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />}
            <span className="font-extrabold text-[11px] sm:text-xs">
              {profile.role === 'admin'
                ? 'Direction'
                : profile.role === 'prof'
                ? 'Enseignante'
                : profile.role === 'parent'
                ? 'Espace Famille'
                : 'Espace Élève'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-baloo">
          <div className="text-right hidden md:block mr-1">
            <p className="text-xs font-extrabold text-[#1B2A7A] leading-tight">
              {profile.prenom} {profile.nom}
            </p>
          </div>

          {profile.role === 'admin' && location.pathname.startsWith('/prof') && (
            <a href="/admin" className={btnClass}>
              <ShieldCheck className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
              <span className="font-bold">Direction</span>
            </a>
          )}

          <button type="button" onClick={() => setShowPassword(true)} className={btnClass} title="Changer mon mot de passe">
            <KeyRound className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
            <span className="font-bold hidden sm:inline">Mot de passe</span>
          </button>

          <button type="button" onClick={signOut} className={btnClass} title="Se déconnecter">
            <LogOut className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
            <span className="font-bold hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>
      {/* Rendu dans <body> : le flou de l'en-tête casserait le positionnement de la fenêtre */}
      {showPassword && createPortal(<ChangePasswordModal onClose={() => setShowPassword(false)} />, document.body)}
    </header>
  );
};
