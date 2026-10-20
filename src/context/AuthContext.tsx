import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  mustChangePassword: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Charger le profil utilisateur depuis la table 'profiles'
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profil non trouvé ou erreur de lecture:', error.message);
        // Si le profil n'existe pas encore (ex: premier admin créé dans Auth sans trigger), on crée un profil par défaut
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error('Erreur chargement profil:', err);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      const p = await fetchProfile(user.id);
      if (p) setProfile(p);
    }
  };

  useEffect(() => {
    // 1. Récupérer la session active initiale
    supabase.auth.getSession().then(async ({ data }: { data: { session: Session | null } }) => {
      const initialSession = data.session;
      setSession(initialSession);
      const currentUser = initialSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const userProfile = await fetchProfile(currentUser.id);
        setProfile(userProfile);
      }
      setLoading(false);
    });

    // 2. Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession);
        const currentUser = currentSession?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          const userProfile = await fetchProfile(currentUser.id);
          if (event === 'PASSWORD_RECOVERY') {
            setProfile(userProfile ? { ...userProfile, doit_changer_mdp: true } : null);
          } else {
            setProfile(userProfile);
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Connexion
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        return {
          success: false,
          error:
            error.message === 'Invalid login credentials'
              ? 'Adresse e-mail ou mot de passe incorrect.'
              : error.message,
        };
      }

      if (data.user) {
        const p = await fetchProfile(data.user.id);
        setProfile(p);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la connexion.' };
    }
  };

  // Déconnexion
  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Réinitialisation mot de passe oublié
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors de la demande.' };
    }
  };

  // Changement de mot de passe (première connexion ou utilisateur connecté)
  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Utilisateur non connecté.' };

    try {
      // 1. Mettre à jour dans Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      // 2. Mettre à jour doit_changer_mdp à false dans 'profiles'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ doit_changer_mdp: false })
        .eq('id', user.id);

      if (profileError) {
        console.warn('Erreur mise à jour flag profil:', profileError.message);
      }

      setProfile((prev) => (prev ? { ...prev, doit_changer_mdp: false } : null));

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur lors du changement de mot de passe.' };
    }
  };

  const mustChangePassword = Boolean(profile?.doit_changer_mdp);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        mustChangePassword,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé au sein d\'un AuthProvider');
  }
  return context;
};
