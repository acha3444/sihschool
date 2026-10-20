import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { AuthPage } from './components/auth/AuthPage';
import { StudentView } from './components/student/StudentView';
import { ParentView } from './components/parent/ParentView';
import { TeacherView } from './components/teacher/TeacherView';
import { CookieBanner } from './components/common/CookieBanner';
import { InstallAppBanner } from './components/common/InstallAppBanner';
import { LegalModal, LegalTabType } from './components/legal/LegalModal';

export const AppContent: React.FC = () => {
  const { currentUser } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('accueil');
  const [legalModalState, setLegalModalState] = useState<{ isOpen: boolean; tab: LegalTabType }>({
    isOpen: false,
    tab: 'rgpd',
  });

  const handleOpenLegal = (tab: LegalTabType) => {
    setLegalModalState({ isOpen: true, tab });
  };

  useEffect(() => {
    if (currentUser?.role === 'eleve') {
      setCurrentTab('accueil');
    } else if (currentUser?.role === 'parent') {
      setCurrentTab('dashboard');
    } else if (currentUser?.role === 'prof' || currentUser?.role === 'admin') {
      setCurrentTab('dashboard');
    }
  }, [currentUser?.role, currentUser?.id]);

  return (
    <>
      {!currentUser ? (
        <AuthPage onOpenLegal={handleOpenLegal} />
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-[#A9D8F5] via-[#BAE2F8] to-[#CDE9FA] text-[#1B2A7A] flex flex-col font-sans">
          {/* Desktop Sidebar & Mobile Bottom Navigation */}
          <Navigation currentTab={currentTab} onTabChange={setCurrentTab} onOpenLegal={handleOpenLegal} />

          {/* Main App Container */}
          <div className="flex-1 md:pl-64 flex flex-col min-w-0">
            <Header onOpenLegal={handleOpenLegal} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {currentUser.role === 'eleve' && (
                <StudentView currentTab={currentTab} onNavigateTab={setCurrentTab} />
              )}

              {currentUser.role === 'parent' && (
                <ParentView currentTab={currentTab} onNavigateTab={setCurrentTab} />
              )}

              {(currentUser.role === 'prof' || currentUser.role === 'admin') && (
                <TeacherView currentTab={currentTab} onNavigateTab={setCurrentTab} />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Discrete CNIL-compliant Cookie and Privacy Informational Banner */}
      <CookieBanner onOpenCookiesPolicy={() => handleOpenLegal('cookies')} />

      {/* PWA Mobile App Installation Assistant (iOS & Android) */}
      <InstallAppBanner />

      {/* Global Comprehensive Legal & Compliance Modal */}
      <LegalModal
        isOpen={legalModalState.isOpen}
        onClose={() => setLegalModalState((prev) => ({ ...prev, isOpen: false }))}
        defaultTab={legalModalState.tab}
      />
    </>
  );
};
