import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, ArrowRight } from 'lucide-react';

interface CookieBannerProps {
  onOpenCookiesPolicy: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenCookiesPolicy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('sihscool_cookie_consent');
      if (!consent) {
        // Small delay so it transitions smoothly after initial render
        const timer = setTimeout(() => setIsVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage disabled / private browsing
      setIsVisible(true);
    }
  }, []);

  const handleAcknowledge = () => {
    try {
      localStorage.setItem('sihscool_cookie_consent', JSON.stringify({
        status: 'acknowledged',
        date: new Date().toISOString(),
        version: '1.0'
      }));
    } catch {
      // Ignored
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label="Information sur les cookies et la protection des données personnelles"
      className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-auto sm:max-w-lg z-50 animate-fadeIn"
    >
      <div className="cloud-card border-3 border-white p-4 sm:p-5 shadow-[0_12px_35px_rgba(27,42,122,0.18)] bg-[#FFF6E3] font-baloo relative">
        <button
          onClick={handleAcknowledge}
          aria-label="Fermer le bandeau d'information cookies"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#CDBDF2] text-[#4A5487] hover:text-[#1B2A7A] hover:bg-[#FFE15C] flex items-center justify-center transition-colors shadow-sm"
        >
          <X className="w-4 h-4" strokeWidth={2.5} />
        </button>

        <div className="flex items-start gap-3.5 pr-7">
          <div className="w-10 h-10 rounded-2xl bg-[#FFE15C] flex items-center justify-center text-[#1B2A7A] shrink-0 shadow-sm mt-0.5">
            <Cookie className="w-5 h-5" strokeWidth={2.5} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-[#1B2A7A] leading-tight">
                Cookies & Vie Privée des Enfants
              </h4>
              <span className="badge-lavender !py-0.5 !px-2 text-[10px] font-bold shrink-0 hidden sm:inline-flex">
                <ShieldCheck className="w-3 h-3 text-[#1B2A7A]" strokeWidth={2.5} />
                0 Publicité
              </span>
            </div>

            <p className="text-xs text-[#4A5487] leading-relaxed font-semibold">
              Chez Sihscool, nous protégeons les familles : <strong>aucun cookie publicitaire</strong> ni traceur tiers n'est déposé. Seuls des témoins techniques strictement nécessaires à la sécurité de vos sessions et au fonctionnement de l'école sont utilisés (conformément aux recommandations de la CNIL).
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleAcknowledge}
                className="btn-pill-sun !min-h-[38px] !text-xs !py-1.5 !px-4 shadow-sm"
              >
                <span>J’ai compris & Accepter</span>
              </button>

              <button
                type="button"
                onClick={onOpenCookiesPolicy}
                className="btn-pill-white !min-h-[38px] !text-xs !py-1.5 !px-3.5 text-[#1B2A7A]"
              >
                <span>Détail des cookies</span>
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
