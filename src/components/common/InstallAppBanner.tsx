import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare, Sparkles, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if already installed & running as standalone app
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;

    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // 2. Check if user dismissed the prompt recently (within 7 days)
    try {
      const dismissed = localStorage.getItem('sihscool_pwa_install_dismissed');
      if (dismissed) {
        const dismissedDate = new Date(dismissed).getTime();
        const now = new Date().getTime();
        // If dismissed less than 7 days ago, don't auto-show
        if (now - dismissedDate < 7 * 24 * 60 * 60 * 1000) {
          return;
        }
      }
    } catch {
      // Ignored
    }

    // 3. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Android / Chrome / Edge beforeinstallprompt listener
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If on iOS Safari and not standalone, show gentle suggestion after a few seconds
    if (isIosDevice && !isStandalone) {
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    // Listen to manual open trigger from header or settings
    const handleManualOpen = () => {
      if (isIosDevice || !deferredPrompt) {
        setShowIOSModal(true);
      } else {
        deferredPrompt.prompt();
      }
    };
    window.addEventListener('sihscool-open-install', handleManualOpen);

    // Listen to appinstalled event
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('sihscool-open-install', handleManualOpen);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem('sihscool_pwa_install_dismissed', new Date().toISOString());
    } catch {
      // Ignored
    }
    setShowBanner(false);
  };

  if (installed || !showBanner) return null;

  return (
    <>
      {/* Floating Gentle Install Pill Banner at Top or Bottom */}
      <aside
        role="region"
        aria-label="Installation de l'application Sihscool sur smartphone"
        className="fixed top-16 sm:top-20 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-fadeIn"
      >
        <div className="cloud-card border-3 border-white p-3.5 sm:p-4 shadow-[0_12px_30px_rgba(27,42,122,0.18)] bg-[#FFF6E3] font-baloo flex items-center justify-between gap-3 relative">
          <div className="flex items-center gap-3 min-w-0">
            {/* App Icon */}
            <div className="w-11 h-11 rounded-2xl bg-[#A9D8F5] border-2 border-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1">
              <img src="/icon-192.png" alt="Icône Sihscool" className="w-full h-full object-contain rounded-xl" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm text-[#1B2A7A] truncate">
                  Installer Sihscool
                </span>
                <span className="badge-lavender text-[9px] !py-0.2 !px-1.5 font-bold shrink-0">
                  App Mobile
                </span>
              </div>
              <p className="text-[11px] text-[#4A5487] truncate font-medium">
                Accès direct plein écran depuis votre écran d’accueil
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="btn-pill-sun !min-h-[34px] !text-xs !py-1 !px-3 shadow-sm font-extrabold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
              <span>Installer</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Masquer la suggestion d'installation"
              className="w-7 h-7 rounded-full bg-[#FFFFFF] border border-[#CDBDF2] text-[#4A5487] hover:text-[#1B2A7A] flex items-center justify-center transition-colors shadow-xs"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Safari Guided Install Modal */}
      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
        >
          <div className="w-full max-w-sm cloud-card border-4 border-white p-6 shadow-cloud-pop space-y-5 font-baloo bg-[#FFF6E3]">
            <div className="flex items-center justify-between pb-2 border-b border-[#CDBDF2]/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FFE15C] flex items-center justify-center text-[#1B2A7A] shadow-sm">
                  <Smartphone className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 id="ios-modal-title" className="font-extrabold text-lg text-[#1B2A7A] leading-tight">
                    Installer sur iPhone / iPad
                  </h3>
                  <p className="text-[11px] text-[#4A5487] font-semibold">
                    En 2 petites étapes faciles depuis Safari
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                aria-label="Fermer les instructions"
                className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#CDBDF2] text-[#1B2A7A] hover:bg-[#FFE15C] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#1B2A7A]">
              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#CDBDF2] flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-[#CDBDF2] text-[#1B2A7A] flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-bold">
                    Appuyez sur le bouton <strong>Partager</strong>
                  </p>
                  <p className="text-[11px] text-[#4A5487] flex items-center gap-1 mt-0.5">
                    C'est l'icône <Share2 className="w-3.5 h-3.5 text-[#2F5BD1] inline mx-0.5" strokeWidth={2.5} /> en bas de votre écran dans Safari.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#CDBDF2] flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-bold">
                    Faites défiler et touchez <strong>« Sur l'écran d'accueil »</strong>
                  </p>
                  <p className="text-[11px] text-[#4A5487] flex items-center gap-1 mt-0.5">
                    Accompagné de l'icône <PlusSquare className="w-3.5 h-3.5 text-[#1B2A7A] inline mx-0.5" strokeWidth={2.5} /> puis appuyez sur <strong>Ajouter</strong> en haut à droite.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[11px] text-[#8C6D00] flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-[#E5483D] shrink-0" strokeWidth={2.5} />
              <span>L’application Sihscool s’ouvrira alors en plein écran sans barre de navigation !</span>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="btn-pill-sun w-full !min-h-[40px] !text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
              <span>C’est compris !</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
