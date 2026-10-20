import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Home,
  MapPin,
  BookOpen,
  CheckSquare,
  Award,
  CalendarCheck,
  TrendingUp,
  CreditCard,
  MessageCircle,
  Megaphone,
  UserCheck,
  Users,
  ShieldCheck,
  Smartphone,
  LucideIcon,
} from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { LegalTabType } from '../legal/LegalModal';

export interface NavTabItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface NavigationProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  onOpenLegal?: (tab: LegalTabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange, onOpenLegal }) => {
  const { currentUser, conversations } = useApp();

  if (!currentUser) return null;

  let unreadMessagesCount = 0;
  if (currentUser.role === 'parent') {
    unreadMessagesCount = conversations
      .filter((c) => c.parent_id === currentUser.id)
      .reduce((sum, c) => sum + c.non_lus_parent, 0);
  } else if (currentUser.role === 'prof' || currentUser.role === 'admin') {
    unreadMessagesCount = conversations
      .filter((c) => c.prof_id === currentUser.id)
      .reduce((sum, c) => sum + c.non_lus_prof, 0);
  }

  let tabs: NavTabItem[] = [];

  if (currentUser.role === 'eleve') {
    tabs = [
      { id: 'accueil', label: 'Accueil', icon: Home },
      { id: 'nourania', label: 'Nourania', icon: MapPin },
      { id: 'litteraire', label: 'Littéraire', icon: BookOpen },
      { id: 'devoirs', label: 'Devoirs', icon: CheckSquare },
      { id: 'badges', label: 'Récompenses', icon: Award },
    ];
  } else if (currentUser.role === 'parent') {
    tabs = [
      { id: 'dashboard', label: 'Aperçu', icon: Home },
      { id: 'presences', label: 'Présences', icon: CalendarCheck },
      { id: 'progression', label: 'Progression', icon: TrendingUp },
      { id: 'paiements', label: 'Cotisations', icon: CreditCard },
      { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadMessagesCount },
      { id: 'annonces', label: 'Annonces', icon: Megaphone },
    ];
  } else {
    tabs = [
      { id: 'dashboard', label: 'Tableau', icon: Home },
      { id: 'appel', label: 'Appel', icon: UserCheck },
      { id: 'progression', label: 'Nourania', icon: TrendingUp },
      { id: 'devoirs', label: 'Devoirs', icon: CheckSquare },
      { id: 'groupes', label: 'Élèves', icon: Users },
      { id: 'messages', label: 'Messages', icon: MessageCircle, badge: unreadMessagesCount },
      { id: 'admin', label: currentUser.role === 'admin' ? 'Direction' : 'Cotisations', icon: ShieldCheck },
    ];
  }

  return (
    <>
      {/* ─── DESKTOP SIDEBAR (Fond crème #FFF6E3) ─── */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 bg-[#FFF6E3] border-r border-[#CDBDF2]/50 z-30 p-4 shadow-[4px_0_20px_rgba(27,42,122,0.04)]">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 px-3 py-3 mb-3 border-b border-[#CDBDF2]/40">
          <img
            src="/logo.svg"
            alt="Logo officiel de l'école Sihscool - Institut d'apprentissage de l'arabe et méthode Nourania"
            className="h-10 w-auto"
          />
        </div>

        {/* Current User Cloud Card */}
        <div className="flex items-center gap-3 p-3 rounded-3xl bg-[#FFFFFF] border border-[#CDBDF2]/60 mb-5 shadow-soft-blue">
          <AvatarDisplay avatarKey={currentUser.avatar} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-extrabold text-[#1B2A7A] truncate font-baloo">
              {currentUser.prenom} {currentUser.nom}
            </p>
            <span className="badge-lavender text-[10px] !py-0.5 !px-2 font-bold">
              {currentUser.role === 'eleve'
                ? 'Élève'
                : currentUser.role === 'parent'
                ? 'Parent'
                : currentUser.role === 'prof'
                ? 'Enseignant'
                : 'Directeur'}
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-full font-baloo font-bold text-sm transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-[#CDBDF2] text-[#1B2A7A] shadow-sm font-extrabold scale-102'
                    : 'text-[#4A5487] hover:text-[#1B2A7A] hover:bg-[#FFFFFF]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-[#1B2A7A]" strokeWidth={2.5} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && tab.badge > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-[#FFE15C] text-[#1B2A7A] shadow-sm">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* PWA Install & Legal Links */}
        <div className="pt-2 pb-1 flex flex-col items-center gap-1.5 text-center">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('sihscool-open-install'))}
            className="inline-flex items-center gap-1.5 text-[11px] font-baloo font-bold text-[#1B2A7A] bg-[#FFFFFF] border border-[#CDBDF2] px-3 py-1 rounded-full shadow-xs hover:bg-[#FFE15C] transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
            <span>Installer l’application</span>
          </button>

          <button
            type="button"
            onClick={() => (onOpenLegal ? onOpenLegal('rgpd') : undefined)}
            className="inline-flex items-center gap-1.5 text-[10px] font-baloo font-bold text-[#4A5487] hover:text-[#1B2A7A] hover:underline transition-colors"
          >
            <ShieldCheck className="w-3 h-3 text-[#1B2A7A]" strokeWidth={2.5} />
            <span>Charte & Protection RGPD</span>
          </button>
        </div>

        {/* Bottom gentle Arabic proverb */}
        <div className="pt-2 border-t border-[#CDBDF2]/40 text-center">
          <p className="font-arabic text-lg text-[#1B2A7A] leading-relaxed font-bold" dir="rtl">
            خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
          </p>
          <p className="text-[11px] text-[#4A5487] font-baloo font-semibold">
            « Le meilleur d’entre vous est celui qui apprend le Coran et l’enseigne »
          </p>
        </div>
      </aside>

      {/* ─── MOBILE BOTTOM BAR (Fond crème #FFF6E3, actif en pilule lavande #CDBDF2) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFF6E3]/95 backdrop-blur-xl border-t border-[#CDBDF2]/60 px-2 py-2 safe-area-pb shadow-[0_-4px_25px_rgba(27,42,122,0.06)]">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex flex-col items-center justify-center min-w-[54px] min-h-[48px] py-1 px-2 transition-all duration-150 active:scale-95 ${
                  isActive
                    ? 'bg-[#CDBDF2] text-[#1B2A7A] rounded-full shadow-sm font-black'
                    : 'text-[#4A5487]'
                }`}
              >
                <Icon className="w-5 h-5 text-[#1B2A7A]" strokeWidth={2.5} />
                <span className="text-[10px] font-baloo font-bold leading-tight mt-0.5 truncate max-w-[62px]">
                  {tab.label}
                </span>

                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute top-0.5 right-1 w-4 h-4 rounded-full bg-[#FFE15C] text-[#1B2A7A] text-[9px] font-black flex items-center justify-center border-2 border-[#FFF6E3] shadow-sm">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};
