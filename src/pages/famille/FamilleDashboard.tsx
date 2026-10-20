import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Eleve, Groupe, Seance, Presence, Progression, Devoir, Appreciation, Paiement, Annonce } from '../../types/database';
import { StudentPortalView } from '../../components/portal/StudentPortalView';
import { Users, User, AlertCircle, RefreshCw } from 'lucide-react';

export const FamilleDashboard: React.FC = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Enfants du parent connecté
  const [enfants, setEnfants] = useState<Eleve[]>([]);
  const [selectedEnfantId, setSelectedEnfantId] = useState<string | null>(null);

  // Données de l'enfant sélectionné
  const [groupe, setGroupe] = useState<Groupe | null>(null);
  const [seances, setSeances] = useState<Seance[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [progression, setProgression] = useState<Progression | null>(null);
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);
  const [appreciations, setAppreciations] = useState<Appreciation[]>([]);
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [annonces, setAnnonces] = useState<Annonce[]>([]);

  // 1. Charger la liste des enfants du parent
  useEffect(() => {
    async function loadEnfants() {
      if (!session?.user?.id) return;
      setLoading(true);
      setErrorMessage(null);

      try {
        const { data, error } = await supabase
          .from('eleves')
          .select('*')
          .eq('parent_id', session.user.id)
          .order('prenom', { ascending: true });

        if (error) {
          throw error;
        }

        const kids = (data as Eleve[]) || [];
        setEnfants(kids);

        if (kids.length > 0) {
          setSelectedEnfantId(kids[0].id);
        }
      } catch (err: any) {
        console.error('Erreur chargement enfants:', err);
        setErrorMessage('Impossible de charger les données de votre famille.');
      } finally {
        setLoading(false);
      }
    }

    loadEnfants();
  }, [session?.user?.id]);

  // 2. Charger les données spécifiques à l'enfant sélectionné
  useEffect(() => {
    async function loadEnfantDetails() {
      if (!selectedEnfantId) return;

      const currentEnfant = enfants.find((e) => e.id === selectedEnfantId);
      if (!currentEnfant) return;

      try {
        // Groupe de l'enfant
        if (currentEnfant.groupe_id) {
          const { data: grpData } = await supabase
            .from('groupes')
            .select('*')
            .eq('id', currentEnfant.groupe_id)
            .single();
          setGroupe((grpData as Groupe) || null);

          // Séances du groupe
          const { data: sData } = await supabase
            .from('seances')
            .select('*')
            .eq('groupe_id', currentEnfant.groupe_id)
            .order('date', { ascending: false });
          setSeances((sData as Seance[]) || []);

          // Devoirs du groupe
          const { data: devData } = await supabase
            .from('devoirs')
            .select('*')
            .eq('groupe_id', currentEnfant.groupe_id)
            .order('date_limite', { ascending: false });
          setDevoirs((devData as Devoir[]) || []);

          // Annonces pour ce groupe ou générales
          const { data: annData } = await supabase
            .from('annonces')
            .select('*')
            .or(`groupe_id.is.null,groupe_id.eq.${currentEnfant.groupe_id}`)
            .order('publiee_le', { ascending: false });
          setAnnonces((annData as Annonce[]) || []);
        } else {
          setGroupe(null);
          setSeances([]);
          setDevoirs([]);

          // Annonces générales uniquement
          const { data: annData } = await supabase
            .from('annonces')
            .select('*')
            .is('groupe_id', null)
            .order('publiee_le', { ascending: false });
          setAnnonces((annData as Annonce[]) || []);
        }

        // Présences de cet enfant
        const { data: presData } = await supabase
          .from('presences')
          .select('*')
          .eq('eleve_id', selectedEnfantId);
        setPresences((presData as Presence[]) || []);

        // Progression Nourania
        const { data: progData } = await supabase
          .from('progressions')
          .select('*')
          .eq('eleve_id', selectedEnfantId)
          .maybeSingle();
        setProgression((progData as Progression) || null);

        // Appréciations
        const { data: appData } = await supabase
          .from('appreciations')
          .select('*')
          .eq('eleve_id', selectedEnfantId)
          .order('periode', { ascending: false });
        setAppreciations((appData as Appreciation[]) || []);

        // Paiements
        const { data: payData } = await supabase
          .from('paiements')
          .select('*')
          .eq('eleve_id', selectedEnfantId)
          .order('mois', { ascending: false });
        setPaiements((payData as Paiement[]) || []);

      } catch (err: any) {
        console.error('Erreur chargement détails élève:', err);
      }
    }

    loadEnfantDetails();
  }, [selectedEnfantId, enfants]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-[#1B2A7A]">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-[#1B2A7A]" />
        <p className="text-base font-bold">Chargement de votre espace famille...</p>
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

  if (enfants.length === 0) {
    return (
      <div className="p-8 max-w-xl mx-auto cloud-card text-center space-y-4 border border-[#FFE15C]">
        <Users className="w-12 h-12 text-[#1B2A7A] mx-auto opacity-60" />
        <h3 className="text-xl font-black text-[#1B2A7A]">Bienvenue dans votre Espace Famille</h3>
        <p className="text-base text-gray-700">
          Aucun profil d'élève n'est encore rattaché à votre compte. Veuillez contacter l'administration de l'école Sihscool pour finaliser votre inscription.
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

  const selectedEnfant = enfants.find((e) => e.id === selectedEnfantId) || enfants[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* En-tête Espace Famille */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A7A]">
            Espace Famille
          </h1>
          <p className="text-base text-[#1B2A7A]/80 font-medium">
            Suivi pédagogique de vos enfants à l'école Sihscool
          </p>
        </div>

        {/* Sélecteur d'enfant (si plus d'1 enfant) */}
        {enfants.length > 1 && (
          <div className="flex items-center gap-2 bg-[#FFF6E3] p-1.5 rounded-2xl border border-[#CDBDF2]">
            <span className="text-xs font-bold text-[#1B2A7A] pl-2 hidden sm:inline">
              Élève :
            </span>
            <div className="flex gap-1 overflow-x-auto">
              {enfants.map((enfant) => (
                <button
                  key={enfant.id}
                  onClick={() => setSelectedEnfantId(enfant.id)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                    enfant.id === selectedEnfant.id
                      ? 'bg-[#1B2A7A] text-white shadow-md'
                      : 'bg-white text-[#1B2A7A] hover:bg-white/80'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{enfant.prenom}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bannière de l'enfant sélectionné */}
      <div className="cloud-card p-4 sm:p-5 flex items-center justify-between bg-white border border-[#CDBDF2]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center font-black text-xl shadow-inner">
            {selectedEnfant.prenom.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#1B2A7A]">
              {selectedEnfant.prenom} {selectedEnfant.nom}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {groupe ? `Groupe ${groupe.nom} (${groupe.formation.toUpperCase()})` : 'En attente de groupe'}
            </p>
          </div>
        </div>

        {enfants.length > 1 && (
          <span className="text-xs font-bold bg-[#CDBDF2]/40 text-[#1B2A7A] px-3 py-1.5 rounded-full hidden sm:inline-block">
            {enfants.length} enfants inscrits
          </span>
        )}
      </div>

      {/* Composant de vue complète pour l'élève sélectionné */}
      <StudentPortalView
        eleve={selectedEnfant}
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
