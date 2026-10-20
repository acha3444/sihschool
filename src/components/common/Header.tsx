import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  LogOut,
  Users,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Smartphone,
} from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { NotificationModal } from './NotificationModal';
import { LegalModal, LegalTabType } from '../legal/LegalModal';
import { Sunburst } from './Sunburst';

interface HeaderProps {
  onOpenLegal?: (tab: LegalTabType) => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLegal }) => {
  const {
    currentUser,
    logout,
    selectedChildId,
    setSelectedChildId,
    getChildrenOfParent,
    getUnreadNotificationsCount,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);

  const handleOpenLegalModal = (tab: LegalTabType = 'rgpd') => {
    if (onOpenLegal) {
      onOpenLegal(tab);
    } else {
      setShowLegalModal(true);
    }
  };

  const unreadCount = getUnreadNotificationsCount();
  const parentChildren = currentUser?.role === 'parent' ? getChildrenOfParent(currentUser.id) : [];

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFF6E3]/95 backdrop-blur-md border-b border-[#CDBDF2]/40 px-4 py-2.5 sm:px-6 shadow-[0_4px_20px_rgba(27,42,122,0.05)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo with (أ) in soft red */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo.svg"
                alt="Logo officiel de l'école Sihscool - Institut d'apprentissage de l'arabe et méthode Nourania"
                className="h-10 w-auto drop-shadow-sm"
              />
            </div>

            {/* Role Badge Indicator */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-baloo font-bold border border-[#CDBDF2] bg-[#FFFFFF] text-[#1B2A7A] shadow-sm">
                {currentUser.role === 'admin' && <ShieldCheck className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />}
                {currentUser.role === 'prof' && <GraduationCap className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />}
                {currentUser.role === 'parent' && <Users className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />}
                {currentUser.role === 'eleve' && <Sparkles className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />}
                <span className="font-extrabold text-[12px]">
                  {currentUser.role === 'eleve'
                    ? 'Espace Élève'
                    : currentUser.role === 'parent'
                    ? 'Espace Famille'
                    : currentUser.role === 'prof'
                    ? 'Espace Professeur'
                    : 'Direction de l’école'}
                </span>
              </div>
            )}
          </div>

          {/* Child Selector if Parent has multiple children (Pastilles Lavande) */}
          {currentUser?.role === 'parent' && parentChildren.length > 1 && (
            <div className="flex items-center gap-1.5 bg-[#FFFFFF] border border-[#CDBDF2]/70 px-2 py-1.5 rounded-full shadow-sm">
              <span className="text-[11px] font-bold text-[#4A5487] hidden md:inline mr-1 font-baloo">
                Enfant :
              </span>
              {parentChildren.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-baloo font-bold transition-all ${
                    selectedChildId === child.id
                      ? 'bg-[#CDBDF2] text-[#1B2A7A] shadow-sm scale-105'
                      : 'text-[#4A5487] hover:text-[#1B2A7A] hover:bg-[#FFF6E3]'
                  }`}
                >
                  <AvatarDisplay avatarKey={child.avatar} size="sm" className="w-5 h-5 !rounded-lg" />
                  <span>{child.prenom}</span>
                </button>
              ))}
            </div>
          )}

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PWA Mobile App Download Button */}
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('sihscool-open-install'))}
              className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#CDBDF2] text-[#1B2A7A] hover:bg-[#FFE15C] flex items-center justify-center transition-colors shadow-sm"
              title="Installer l'application sur smartphone (iOS & Android)"
              aria-label="Installer l'application Sihscool sur smartphone"
            >
              <Smartphone className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
            </button>

            {/* Legal / RGPD compliance button */}
            <button
              type="button"
              onClick={() => handleOpenLegalModal('rgpd')}
              className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#CDBDF2] text-[#1B2A7A] hover:bg-[#FFE15C] flex items-center justify-center transition-colors shadow-sm"
              title="Centre Juridique, Charte & RGPD"
              aria-label="Ouvrir le centre juridique et la conformité RGPD"
            >
              <ShieldCheck className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
            </button>

            {/* Notification Bell with Pink/Sun badge */}
            {currentUser && (
              <button
                type="button"
                onClick={() => setShowNotifications(true)}
                className="relative w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#CDBDF2] text-[#1B2A7A] hover:bg-[#FFF6E3] flex items-center justify-center transition-colors shadow-sm"
                title="Notifications"
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ''}`}
              >
                <Bell className="w-4 h-4" strokeWidth={2.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FFE15C] text-[#1B2A7A] text-[10px] font-black flex items-center justify-center border-2 border-white shadow-sm animate-bounce-subtle">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile Avatar & Logout */}
            {currentUser && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 pl-2 border-l border-[#CDBDF2]">
                  <AvatarDisplay avatarKey={currentUser.avatar} size="sm" />
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-[#1B2A7A] font-baloo leading-tight">
                      {currentUser.prenom} {currentUser.nom}
                    </span>
                    <span className="text-[10px] text-[#4A5487] font-semibold">
                      {currentUser.role === 'eleve' ? 'Élève' : currentUser.role === 'parent' ? 'Parent' : 'Enseignant'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="w-10 h-10 rounded-full bg-[#FFFFFF] border border-[#CDBDF2] text-[#4A5487] hover:text-[#E5483D] hover:bg-[#FFF6E3] flex items-center justify-center transition-colors ml-1 shadow-sm"
                  title="Se déconnecter"
                  aria-label="Se déconnecter de la session"
                >
                  <LogOut className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Notifications Drawer */}
      <NotificationModal isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      {/* Fallback Legal & RGPD Modal */}
      {!onOpenLegal && (
        <LegalModal isOpen={showLegalModal} onClose={() => setShowLegalModal(false)} />
      )}
    </>
  );
};
