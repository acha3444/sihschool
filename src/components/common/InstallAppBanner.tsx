import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare, Sparkles, CheckCircle2, Monitor } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Detect if running in standalone mode (already installed as PWA)
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // 2. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Check dismissal in session
    const dismissed = sessionStorage.getItem('sihscool_pwa_dismissed');
    if (!dismissed) {
      setShowBanner(true);
    }

    // 4. Capture native beforeinstallprompt (Chromium / Android / Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 5. Custom event listener for manual trigger (Header button, Footer, Cards)
    const handleManualOpen = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowGuideModal(true);
      }
    };
    window.addEventListener('sihscool-open-install', handleManualOpen);

    // 6. Listen to successful installation
    window.addEventListener('appinstalled', () => {
      setIsStandalone(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('sihscool-open-install', handleManualOpen);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowBanner(false);
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('sihscool_pwa_dismissed', 'true');
    } catch {
      // Ignored
    }
    setShowBanner(false);
  };

  if (isStandalone) return null;

  return (
    <>
      {/* ─── FLOATING INSTALL BANNER (Visible on mobile & desktop until dismissed) ─── */}
      {showBanner && (
        <aside
          role="region"
          aria-label="Installation de l'application Sihscool"
          className="fixed top-16 sm:top-20 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-40 animate-fadeIn"
        >
          <div className="cloud-card border-3 border-white p-3.5 sm:p-4 shadow-[0_12px_35px_rgba(27,42,122,0.2)] bg-[#FFF6E3] font-baloo flex items-center justify-between gap-3 relative">
            <div className="flex items-center gap-3 min-w-0">
              {/* App Icon */}
              <div className="w-11 h-11 rounded-2xl bg-[#A9D8F5] border-2 border-white flex items-center justify-center shrink-0 shadow-sm overflow-hidden p-1">
                <img src="/icon-192.png" alt="Icône Sihscool" className="w-full h-full object-contain rounded-xl" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs sm:text-sm text-[#1B2A7A] truncate">
                    Application Sihscool
                  </span>
                  <span className="badge-lavender text-[9px] !py-0.2 !px-1.5 font-bold shrink-0">
                    Plein Écran
                  </span>
                </div>
                <p className="text-[11px] text-[#4A5487] truncate font-medium">
                  Ajouter sur votre écran d’accueil (iOS & Android)
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
                aria-label="Fermer la suggestion"
                className="w-7 h-7 rounded-full bg-[#FFFFFF] border border-[#CDBDF2] text-[#4A5487] hover:text-[#1B2A7A] flex items-center justify-center transition-colors shadow-xs"
              >
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* ─── GUIDED INSTALL MODAL (iOS Safari + Chrome / Android / Desktop) ─── */}
      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
        >
          <div className="w-full max-w-sm cloud-card border-4 border-white p-6 shadow-cloud-pop space-y-4 font-baloo bg-[#FFF6E3]">
            <div className="flex items-center justify-between pb-2 border-b border-[#CDBDF2]/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FFE15C] flex items-center justify-center text-[#1B2A7A] shadow-sm">
                  <Smartphone className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div>
                  <h3 id="guide-modal-title" className="font-extrabold text-lg text-[#1B2A7A] leading-tight">
                    {isIOS ? 'Installer sur iPhone / iPad' : 'Installer l’application'}
                  </h3>
                  <p className="text-[11px] text-[#4A5487] font-semibold">
                    Accès direct depuis l’écran d'accueil
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                aria-label="Fermer les instructions"
                className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#CDBDF2] text-[#1B2A7A] hover:bg-[#FFE15C] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            {isIOS ? (
              /* Instructions iOS Safari */
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
                      C'est l'icône <Share2 className="w-3.5 h-3.5 text-[#2F5BD1] inline mx-0.5" strokeWidth={2.5} /> en bas de l'écran dans Safari.
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
                      Avec l'icône <PlusSquare className="w-3.5 h-3.5 text-[#1B2A7A] inline mx-0.5" strokeWidth={2.5} /> puis appuyez sur <strong>Ajouter</strong> en haut à droite.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Instructions Android / Chrome / Ordinateur */
              <div className="space-y-3 text-xs text-[#1B2A7A]">
                <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                    Sur Android (Chrome) :
                  </p>
                  <p className="text-[11px] text-[#4A5487] leading-relaxed">
                    Appuyez sur les <strong>3 petits points verticaux (⋮)</strong> en haut à droite de Chrome, puis sélectionnez <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                    Sur Ordinateur (Chrome / Edge / Safari) :
                  </p>
                  <p className="text-[11px] text-[#4A5487] leading-relaxed">
                    Cliquez sur l'icône d'installation <Download className="w-3.5 h-3.5 text-[#1B2A7A] inline mx-0.5" strokeWidth={2.5} /> située tout à droite dans la barre d'adresse de votre navigateur.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[11px] text-[#8C6D00] flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-[#E5483D] shrink-0" strokeWidth={2.5} />
              <span>Sihscool s’ouvrira alors en plein écran sans aucune barre d'adresse !</span>
            </div>

            <button
              type="button"
              onClick={() => setShowGuideModal(false)}
              className="btn-pill-sun w-full !min-h-[40px] !text-xs font-extrabold"
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
