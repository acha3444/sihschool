import React from 'react';
import {
  Cat,
  Flame,
  Sparkles,
  Rocket,
  Compass,
  Star,
  Heart,
  Crown,
  BookOpen,
  UserCheck,
  GraduationCap,
  ShieldCheck,
  Smile,
  LucideIcon,
} from 'lucide-react';

interface AvatarDisplayProps {
  avatarKey: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AVATAR_OPTIONS: { id: string; label: string; icon: LucideIcon; bg: string; color: string }[] = [
  { id: 'cat-mint', label: 'Chaton Nuage', icon: Cat, bg: 'bg-[#CDBDF2] border-white', color: 'text-[#1B2A7A]' },
  { id: 'lion-yellow', label: 'Soleil Joyeux', icon: Flame, bg: 'bg-[#FFE15C] border-white', color: 'text-[#1B2A7A]' },
  { id: 'flower-pink', label: 'Étoile Céleste', icon: Star, bg: 'bg-[#FFF6E3] border-[#CDBDF2]', color: 'text-[#1B2A7A]' },
  { id: 'star-mint', label: 'Étincelle Or', icon: Sparkles, bg: 'bg-[#FFE15C] border-white', color: 'text-[#1B2A7A]' },
  { id: 'rocket-yellow', label: 'Fusée des Rêves', icon: Rocket, bg: 'bg-[#BAE2F8] border-white', color: 'text-[#1B2A7A]' },
  { id: 'butterfly-pink', label: 'Cœur Doux', icon: Heart, bg: 'bg-[#FFF6E3] border-[#E5483D]', color: 'text-[#E5483D]' },
  { id: 'falcon-mint', label: 'Boussole Écolier', icon: Compass, bg: 'bg-[#CDBDF2] border-white', color: 'text-[#1B2A7A]' },
  { id: 'rabbit-pink', label: 'Petite Couronne', icon: Crown, bg: 'bg-[#FFE15C] border-white', color: 'text-[#1B2A7A]' },
  { id: 'bear-yellow', label: 'Sourire Ensoleillé', icon: Smile, bg: 'bg-[#FFF6E3] border-[#FFE15C]', color: 'text-[#1B2A7A]' },
  { id: 'dove-mint', label: 'Livre Ouvert', icon: BookOpen, bg: 'bg-[#BAE2F8] border-white', color: 'text-[#1B2A7A]' },
  { id: 'prof-fatima', label: 'Oustadha Fatima', icon: GraduationCap, bg: 'bg-[#CDBDF2] border-white', color: 'text-[#1B2A7A]' },
  { id: 'prof-bilal', label: 'Oustadh Bilal', icon: BookOpen, bg: 'bg-[#FFE15C] border-white', color: 'text-[#1B2A7A]' },
  { id: 'parent-yasmina', label: 'Maman Yasmina', icon: UserCheck, bg: 'bg-[#FFF6E3] border-[#CDBDF2]', color: 'text-[#1B2A7A]' },
  { id: 'parent-karim', label: 'Papa Karim', icon: UserCheck, bg: 'bg-[#BAE2F8] border-white', color: 'text-[#1B2A7A]' },
  { id: 'cheikh-avatar', label: 'Cheikh Mohammed', icon: ShieldCheck, bg: 'bg-[#FFE15C] border-white', color: 'text-[#1B2A7A]' },
];

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({ avatarKey, size = 'md', className = '' }) => {
  const matched = AVATAR_OPTIONS.find((a) => a.id === avatarKey) || {
    id: 'default',
    label: 'Apprenant',
    icon: Sparkles,
    bg: 'bg-[#CDBDF2] border-white',
    color: 'text-[#1B2A7A]',
  };

  const Icon = matched.icon;

  const sizeClasses = {
    sm: 'w-9 h-9 rounded-2xl border-2 text-xs shadow-sm',
    md: 'w-12 h-12 rounded-[22px] border-2 text-sm shadow-soft-blue',
    lg: 'w-16 h-16 rounded-[28px] border-2 text-base shadow-soft-blue',
    xl: 'w-24 h-24 rounded-[36px] border-4 text-xl shadow-cloud-pop',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div
      role="img"
      aria-label={`Avatar : ${matched.label}`}
      className={`inline-flex items-center justify-center shrink-0 transition-transform active:scale-95 ${sizeClasses[size]} ${matched.bg} ${matched.color} ${className}`}
      title={matched.label}
    >
      <Icon className={iconSizes[size]} strokeWidth={2.5} />
    </div>
  );
};
