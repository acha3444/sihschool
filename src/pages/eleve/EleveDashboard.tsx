import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Eleve, Groupe, Seance, Presence, Progression, Devoir, Appreciation, Paiement, Annonce } from '../../types/database';
import { StudentPortalView } from '../../components/portal/StudentPortalView';
import { User, AlertCircle, RefreshCw } from 'lucide-react';

export const EleveDashboard: React.FC = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fiche élève de l'adulte connecté
  const [eleve, setEleve] = useState<Eleve | null>(null);

  // Données de l'élève
  const [groupe, setGroupe] = useState<Groupe | null>(null);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [progression, setProgression] = useState<Progression | null>(null);
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);

  useEffect(() => {
    async function loadEleveData() {
      if (!session?.user?.id) return;
      setLoading(true);
      setErrorMessage(null);

      try {
        // Récupérer la fiche élève liée au compte (eleves.compte_id = auth.uid())
        const { data: eleveData, error: eleveError } = await supabase
          .from('eleves')
          .select('*')
          .eq('compte_id', session.user.id)
          .maybeSingle();

        if (eleveError) {
          throw eleveError;
        }

        if (!eleveData) {
          setEleve(null);
          setLoading(false);
          return;
        }

        const currentEleve = eleveData as Eleve;
        setEleve(currentEleve);

        // Groupe de l'élève
        if (currentEleve.groupe_id) {
          const { data: grpData } = await supabase
            .from('groupes')
            .select('*')
            .eq('id', currentEleve.groupe_id)
            .single();
          setGroupe((grpData as Groupe) || null);

          // Séances
          const { data: sData } = await supabase
            .from('seances')
            .select('*')
            .eq('groupe_id', currentEleve.groupe_id)
            .order('date', { ascending: false });
          setSeances((sData as Seance[]) || []);

          // Devoirs
          const { data: devData } = await supabase
            .from('devoirs')
            .select('*')
            .eq('groupe_id', currentEleve.groupe_id)
            .order('date_limite', { ascending: false });
          setDevoirs((devData as Devoir[]) || []);

          // Annonces
          const { data: annData } = await supabase
            .from('annonces')
            .select('*')
            .or(`groupe_id.is.null,groupe_id.eq.${currentEleve.groupe_id}`)
            .order('publiee_le', { ascending: false });
          setAnnonces((annData as Annonce[]) || []);
        } else {
          setGroupe(null);
          setSeances([]);
          setDevoirs([]);

          // Annonces générales
          const { data: annData } = await supabase
            .from('annonces')
            .select('*')
            .is('groupe_id', null)
            .order('publiee_le', { ascending: false });
          setAnnonces((annData as Annonce[]) || []);
        }

        // Présences
        const { data: presData } = await supabase
          .from('presences')
          .select('*')
          .eq('eleve_id', currentEleve.id);
        setPresences((presData as Presence[]) || []);

        // Progression
        const { data: progData } = await supabase
          .from('progressions')
          .select('*')
          .eq('eleve_id', currentEleve.id)
          .maybeSingle();
        setProgression((progData as Progression) || null);

        // Appréciations
        const { data: appData } = await supabase
          .from('appreciations')
          .select('*')
          .eq('eleve_id', currentEleve.id)
          .order('periode', { ascending: false });
        setAppreciations((appData as Appreciation[]) || []);

        // Paiements
        const { data: payData } = await supabase
          .from('paiements')
          .select('*')
          .eq('eleve_id', currentEleve.id)
          .order('mois', { ascending: false });
        setPaiements((payData as Paiement[]) || []);

      } catch (err: any) {
        console.error('Erreur chargement fiche élève:', err);
        setErrorMessage('Impossible de charger vos informations d\'élève.');
      } finally {
        setLoading(false);
      }
    }

    loadEleveData();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#1B2A7A]">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#1B2A7A]" />
        <p className="text-base font-bold">Chargement de votre espace élève...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="p-6 max-w-xl mx-auto cloud-card border border-rose-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-base font-bold text-rose-700">{errorMessage}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-pill-sun"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!eleve) {
    return (
      <div className="p-8 max-w-xl mx-auto cloud-card text-center space-y-4 border border-[#FFE15C]">
        <User className="w-12 h-12 text-[#1B2A7A] mx-auto opacity-60" />
        <h3 className="text-xl font-black text-[#1B2A7A]">Bienvenue dans votre Espace Élève</h3>
        <p className="text-base text-gray-700">
          Votre fiche d'élève n'a pas encore été rattachée à ce compte de connexion. Veuillez contacter Siham sur WhatsApp pour finaliser votre accès.
        </p>
        <a
          href="https://wa.me/33757589112"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill-sun"
        >
          Contacter Siham sur WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* En-tête Espace Élève */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A7A]">
            Espace Élève
          </h1>
          <p className="text-base text-[#1B2A7A]/80 font-medium">
            Votre parcours d'apprentissage à l'école Sihscool
          </p>
        </div>
      </div>

      {/* Bannière de l'élève */}
      <div className="cloud-card p-4 sm:p-5 flex items-center justify-between bg-white border border-[#CDBDF2]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center font-black text-xl shadow-inner">
            {eleve.prenom.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#1B2A7A]">
              {eleve.prenom} {eleve.nom}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {groupe ? `Groupe ${groupe.nom} (${groupe.formation.toUpperCase()})` : 'En attente d\'attribution d\'un groupe'}
            </p>
          </div>
        </div>
      </div>

      {/* Composant de vue complète pour l'élève */}
      <StudentPortalView
        eleve={eleve}
        groupe={groupe}
        seances={seances}
        presences={presences}
        progression={progression}
        devoirs={devoirs}
        appreciations={appreciations}
        paiements={paiements}
        annonces={annonces}
      />
    </div>
  );
};
