import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { isSupabaseConfigured } from './lib/supabase';
import { LoginPage } from './components/auth/LoginPage';
import { ResetPasswordPage } from './components/auth/ResetPasswordPage';
import { ForcePasswordChangeModal } from './components/auth/ForcePasswordChangeModal';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FamilleDashboard } from './pages/famille/FamilleDashboard';
import { EleveDashboard } from './pages/eleve/EleveDashboard';
import { Role } from './types/database';
import { RefreshCw, AlertTriangle } from 'lucide-react';

// Error Boundary pour intercepter toute anomalie d'affichage
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#A9D8F5] via-[#BAE2F8] to-[#CDE9FA] flex items-center justify-center p-4 text-[#1B2A7A]">
          <div className="cloud-card max-w-md w-full p-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
            <h1 className="text-xl font-black">Une erreur est survenue</h1>
            <p className="text-sm text-gray-700">
              {this.state.error?.message || 'Impossible de charger l\'application.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/login';
              }}
              className="btn-pill-sun"
            >
              Retour à la page de connexion
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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
  // Alerte claire si Supabase n'a pas été configuré dans Vercel
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#A9D8F5] via-[#BAE2F8] to-[#CDE9FA] flex items-center justify-center p-4 text-[#1B2A7A] font-baloo">
        <div className="cloud-card max-w-lg w-full p-8 text-center space-y-4 border-4 border-white shadow-xl">
          <AlertTriangle className="w-12 h-12 text-[#1B2A7A] mx-auto opacity-80" />
          <h1 className="text-2xl font-black text-[#1B2A7A]">Configuration Vercel requise</h1>
          <p className="text-base text-gray-700 leading-relaxed">
            Les variables d'environnement Supabase ne sont pas encore définies sur Vercel.
          </p>
          <div className="p-4 rounded-2xl bg-white/80 text-left text-xs font-mono space-y-2 border border-[#CDBDF2]">
            <p className="font-bold text-[#1B2A7A]">Ajoutez dans Vercel (Settings &gt; Environment Variables) :</p>
            <p>1. <span className="font-bold">VITE_SUPABASE_URL</span></p>
            <p>2. <span className="font-bold">VITE_SUPABASE_ANON_KEY</span></p>
            <p>3. <span className="font-bold">SUPABASE_SERVICE_ROLE_KEY</span></p>
          </div>
          <p className="text-xs text-gray-500">
            Puis cliquez sur <strong>Redeploy</strong> dans Vercel pour appliquer les changements.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
};

export default App;
