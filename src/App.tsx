import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { ForcePasswordChangeModal } from './components/auth/ForcePasswordChangeModal';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FamilleDashboard } from './pages/famille/FamilleDashboard';
import { EleveDashboard } from './pages/eleve/EleveDashboard';
import { Role } from './types/database';
import { RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#A9D8F5] via-[#BAE2F8] to-[#CDE9FA] text-[#1B2A7A]">
        <RefreshCw className="w-10 h-10 animate-spin mb-3 text-[#1B2A7A]" />
        <p className="font-baloo font-bold text-base">Chargement de Sihscool...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(profile.role)) {
    if (profile.role === 'admin') return <Navigate to="/admin" replace />;
    if (profile.role === 'parent') return <Navigate to="/famille" replace />;
    if (profile.role === 'eleve') return <Navigate to="/eleve" replace />;
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A9D8F5] via-[#BAE2F8] to-[#CDE9FA] text-[#1B2A7A] flex flex-col font-baloo">
      <Header />
      <main className="flex-1 pb-12 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
};

const RootRedirect: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#A9D8F5] via-[#BAE2F8] to-[#CDE9FA] text-[#1B2A7A]">
        <RefreshCw className="w-10 h-10 animate-spin mb-3 text-[#1B2A7A]" />
        <p className="font-baloo font-bold text-base">Chargement...</p>
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/login" replace />;
  }

  if (profile.role === 'admin') return <Navigate to="/admin" replace />;
  if (profile.role === 'parent') return <Navigate to="/famille" replace />;
  if (profile.role === 'eleve') return <Navigate to="/eleve" replace />;

  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      {/* Modal bloquant obligatoire si mot de passe temporaire doit être changé */}
      <ForcePasswordChangeModal />

      <Routes>
        {/* Page de connexion unique */}
        <Route path="/login" element={<LoginPage />} />

        {/* Page de réinitialisation de mot de passe */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Espace Admin (Direction) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Espace Famille (Parents) */}
        <Route
          path="/famille"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <FamilleDashboard />
            </ProtectedRoute>
          }
        />

        {/* Espace Élève (Adultes) */}
        <Route
          path="/eleve"
          element={
            <ProtectedRoute allowedRoles={['eleve']}>
              <EleveDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirection racine */}
        <Route path="/" element={<RootRedirect />} />

        {/* Redirection fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
