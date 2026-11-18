import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Eleve } from '../../types/database';
import { AlertCircle, CheckCheck, Copy, KeyRound, Smartphone, X } from 'lucide-react';

type Mode = null | 'creer' | 'mdp';

const inputClass =
  'w-full py-3 px-4 rounded-full bg-white border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-sm font-bold text-[#1B2A7A] min-h-[44px]';

/**
 * Carte « Accès de l'enfant » dans l'espace parent : le parent crée un identifiant
 * pour que son enfant se connecte sur son propre téléphone (devoirs, récitations).
 */
export const AccesEnfant: React.FC<{ enfant: Eleve; onChange: (patch: Partial<Eleve>) => void }> = ({ enfant, onChange }) => {
  const { session } = useAuth();
  const [mode, setMode] = useState<Mode>(null);
  const [mdp, setMdp] = useState('');
  const [mdp2, setMdp2] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [resultat, setResultat] = useState<{ identifiant: string; motDePasse: string } | null>(null);
  const [copied, setCopied] = useState(false);

  if (enfant.type !== 'enfant') return null;

  const appel = async (body: Record<string, unknown>) => {
    const response = await fetch('/api/compte-enfant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token}` },
      body: JSON.stringify({ eleveId: enfant.id, ...body }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) throw new Error(data.error || 'Une erreur est survenue.');
    return data;
  };

  const fermer = () => {
    setMode(null);
    setMdp('');
    setMdp2('');
    setError('');
  };

  const valider = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (mdp.length < 6) return setError('Au moins 6 caractères.');
    if (mdp !== mdp2) return setError('Les deux mots de passe ne correspondent pas.');
    setSaving(true);
    try {
      const data = await appel({ action: mode, motDePasse: mdp });
      if (mode === 'creer') onChange({ identifiant: data.identifiant, compte_id: 'ok' });
      setResultat({ identifiant: data.identifiant || enfant.identifiant || '', motDePasse: mdp });
      setCopied(false);
      fermer();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const retirer = async () => {
    if (!confirm(`Supprimer l'accès personnel de ${enfant.prenom} ? Vous pourrez en recréer un plus tard.`)) return;
    try {
      await appel({ action: 'retirer' });
      onChange({ identifiant: null, compte_id: null });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const message = resultat
    ? `Ton accès SihSchool 📚\nSite : ${window.location.origin}\nIdentifiant : ${resultat.identifiant}\nMot de passe : ${resultat.motDePasse}`
    : '';

  return (
    <div className="cloud-card p-4 sm:p-5 bg-white border border-[#CDBDF2] space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[#F3EEFF] text-[#1B2A7A] flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-[#1B2A7A]">Accès de {enfant.prenom} sur son téléphone</h3>
          {enfant.identifiant ? (
            <p className="text-sm text-[#4A5487] font-semibold">
              Identifiant : <span className="font-mono font-black text-[#1B2A7A] bg-[#FFF6E3] px-2 py-0.5 rounded-lg">{enfant.identifiant}</span>
            </p>
          ) : (
            <p className="text-sm text-[#4A5487] font-semibold">
              {enfant.prenom} peut avoir sa propre connexion pour voir ses devoirs et réciter depuis son téléphone.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {enfant.identifiant ? (
          <>
            <button type="button" onClick={() => setMode('mdp')} className="btn-pill-white !min-h-[40px] !text-xs inline-flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" /> Changer son mot de passe
            </button>
            <button type="button" onClick={retirer} className="text-xs font-bold text-[#4A5487] hover:text-[#E5483D] px-2">
              Retirer l'accès
            </button>
          </>
        ) : (
          <button type="button" onClick={() => setMode('creer')} className="btn-pill-sun !min-h-[44px] !text-sm inline-flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Créer l'accès de {enfant.prenom}
          </button>
        )}
      </div>

      {mode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A7A]/50 backdrop-blur-sm">
          <form onSubmit={valider} className="w-full max-w-sm cloud-card p-6 border-4 border-white shadow-cloud-pop space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-[#1B2A7A]">
                {mode === 'creer' ? `Accès de ${enfant.prenom}` : `Nouveau mot de passe pour ${enfant.prenom}`}
              </h3>
              <button type="button" onClick={fermer} aria-label="Fermer" className="text-[#4A5487]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-[#4A5487] font-semibold">
              Choisissez un mot de passe facile à retenir pour {enfant.prenom}.
              {mode === 'creer' && ' Son identifiant sera créé automatiquement.'}
            </p>
            {error && (
              <div className="p-3 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[#E5483D] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
              </div>
            )}
            <input type="password" autoComplete="new-password" placeholder="Mot de passe (6 caractères min.)" className={inputClass} value={mdp} onChange={(e) => setMdp(e.target.value)} />
            <input type="password" autoComplete="new-password" placeholder="Confirmer" className={inputClass} value={mdp2} onChange={(e) => setMdp2(e.target.value)} />
            <button type="submit" disabled={saving} className="btn-pill-sun w-full !min-h-[46px]">
              {saving ? 'Enregistrement...' : mode === 'creer' ? "Créer l'accès" : 'Enregistrer'}
            </button>
          </form>
        </div>
      )}

      {resultat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A7A]/50 backdrop-blur-sm">
          <div className="w-full max-w-sm cloud-card p-6 border-4 border-white shadow-cloud-pop space-y-4 text-center">
            <h3 className="font-black text-lg text-[#1B2A7A]">L'accès de {enfant.prenom} est prêt !</h3>
            <p className="text-sm text-[#4A5487] font-semibold">Sur son téléphone, {enfant.prenom} se connecte avec :</p>
            <div className="p-4 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C] space-y-2 text-left">
              <p className="text-sm font-bold text-[#4A5487]">
                Identifiant : <span className="font-mono font-black text-lg text-[#1B2A7A]">{resultat.identifiant}</span>
              </p>
              <p className="text-sm font-bold text-[#4A5487]">
                Mot de passe : <span className="font-mono font-black text-lg text-[#1B2A7A]">{resultat.motDePasse}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(message);
                  setCopied(true);
                }}
                className="btn-pill-white !min-h-[44px] !text-sm inline-flex items-center justify-center gap-2"
              >
                {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copié !' : 'Copier pour lui envoyer'}
              </button>
              <button type="button" onClick={() => setResultat(null)} className="btn-pill-sun !min-h-[44px]">
                C'est noté
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
