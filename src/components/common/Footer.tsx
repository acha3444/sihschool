import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="text-center py-6 px-4 text-xs text-[#4A5487] font-baloo font-semibold border-t border-[#CDBDF2]/30 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <p>© {new Date().getFullYear()} Sihscool · Plateforme d'apprentissage de l'arabe</p>
        <p className="font-arabic text-sm text-[#1B2A7A] font-bold" dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
      </div>
    </footer>
  );
};
