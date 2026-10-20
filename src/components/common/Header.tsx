import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShieldCheck, Users, GraduationCap } from 'lucide-react';

export const Header: React.FC = () => {
  const { profile, signOut } = useAuth();

  if (!profile) return null;

  return (
    <header className="sticky top-0 z-40 bg-[#FFF6E3]/95 backdrop-blur-md border-b border-[#CDBDF2]/40 px-4 py-2.5 sm:px-6 shadow-[0_4px_20px_rgba(27,42,122,0.05)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="Logo officiel de l'école Sihscool"
            className="h-9 sm:h-10 w-auto drop-shadow-sm"
          />

          {/* Role Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-baloo font-bold border border-[#CDBDF2] bg-[#FFFFFF] text-[#1B2A7A] shadow-xs">
            {profile.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />}
            {profile.role === 'parent' && <Users className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />}
            {profile.role === 'eleve' && <GraduationCap className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />}
            <span className="font-extrabold text-[11px] sm:text-xs">
              {profile.role === 'admin'
                ? 'Direction'
                : profile.role === 'parent'
                ? 'Espace Famille'
                : 'Espace Élève'}
            </span>
          </div>
        </div>

        {/* User Info & Logout Button */}
        <div className="flex items-center gap-3 font-baloo">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-extrabold text-[#1B2A7A] leading-tight">
              {profile.prenom} {profile.nom}
            </p>
            <p className="text-[10px] text-[#4A5487] font-semibold">
              {profile.role === 'admin' ? 'Administratrice' : 'Connecté(e)'}
            </p>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="btn-pill-white !min-h-[40px] !py-1.5 !px-3.5 !text-xs flex items-center gap-1.5 shadow-xs hover:border-[#FFE15C]"
            title="Se déconnecter de Sihscool"
          >
            <LogOut className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
            <span className="font-bold">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
};
