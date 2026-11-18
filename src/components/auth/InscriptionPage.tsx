import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, ArrowRight, Calendar, CheckCircle2, Plus, RefreshCw, Trash2, UserPlus } from 'lucide-react';

type GroupeInfo = { nom: string; formation: string; jour: string; heure: string; enseignante: string | null };
type Enfant = { prenom: string; nom: string };

const inputClass =
  'w-full py-3 px-4 rounded-full bg-white border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-sm font-bold text-[#1B2A7A] min-h-[44px]';
const labelClass = 'text-xs font-extrabold text-[#1B2A7A] block mb-1';

/**
 * Page publique d'inscription : /inscription/:code
 * Le parent (ou l'élève adulte) crée son compte avec son propre mot de passe,
 * et l'enfant est inscrit directement dans le groupe du lien.
 */
export const InscriptionPage: React.FC = () => {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const { user, profile, session, signIn, loading: authLoading } = useAuth();

  const [groupe, setGroupe] = useState<GroupeInfo | null>(null);
  const [loadError, setLoadError] = useState('');
  const [type, setType] = useState<'parent' | 'adulte'>('parent');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [enfants, setEnfants] = useState<Enfant[]>([{ prenom: '', nom: '' }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [ajoutOk, setAjoutOk] = useState(false);

  useEffect(() => {
    fetch(`/api/inscription?code=${encodeURIComponent(code.toUpperCase())}`)
      .then((r) => r.json())
      .then((data) => (data.success ? setGroupe(data.groupe) : setLoadError(data.error || 'Lien invalide.')))
      .catch(() => setLoadError('Impossible de charger le lien. Vérifiez votre connexion.'));
  }, [code]);

  const parentConnecte = Boolean(user && profile?.role === 'parent');
  const autreCompteConnecte = Boolean(user && profile && profile.role !== 'parent');

  const setEnfant = (i: number, champ: keyof Enfant, val: string) =>
    setEnfants((prev) => prev.map((e, k) => (k === i ? { ...e, [champ]: val } : e)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const enfantsValides = enfants.filter((x) => x.prenom.trim());

    if (!parentConnecte) {
      if (!prenom.trim()) return setError('Indiquez votre prénom.');
      if (motDePasse.length < 6) return setError('Le mot de passe doit faire au moins 6 caractères.');
      if (motDePasse !== confirmation) return setError('Les deux mots de passe ne correspondent pas.');
    }
    if ((parentConnecte || type === 'parent') && !enfantsValides.length) {
      return setError("Indiquez le prénom d'au moins un enfant.");
    }

    setSaving(true);
    try {
      const response = await fetch('/api/inscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(parentConnecte && session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: JSON.stringify(
          parentConnecte
            ? { code, enfants: enfantsValides }
            : { code, type, prenom, nom, email, telephone, motDePasse, enfants: enfantsValides }
        ),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) throw new Error(data.error || "L'inscription n'a pas pu être enregistrée.");

      if (parentConnecte) {
        setAjoutOk(true);
        return;
      }
      const login = await signIn(email, motDePasse);
      if (!login.success) throw new Error('Compte créé ! Connectez-vous maintenant avec votre e-mail et votre mot de passe.');
      navigate(type === 'adulte' ? '/eleve' : '/famille', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#A9D8F5] via-[#BAE2F8] to-[#CDE9FA] text-[#1B2A7A] flex flex-col p-4 sm:p-6 font-baloo">
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-2">
        <img src="/logo.svg" alt="Logo SihSchool" className="h-12 w-auto drop-shadow-sm" />
        <Link to="/login" className="badge-lavender shadow-sm text-xs font-bold">
          Déjà inscrit ? Se connecter
        </Link>
      </header>

      <main className="max-w-lg mx-auto w-full py-6">
        <div className="cloud-card p-6 sm:p-8 border-4 border-white shadow-cloud-pop space-y-5">
          {!groupe && !loadError && (
            <div className="flex items-center justify-center gap-2 py-10 text-[#4A5487] font-bold">
              <RefreshCw className="w-5 h-5 animate-spin" /> Chargement...
            </div>
          )}

          {loadError && (
            <div className="text-center space-y-3 py-6">
              <AlertCircle className="w-10 h-10 mx-auto text-[#E5483D]" />
              <p className="font-bold">{loadError}</p>
              <Link to="/login" className="btn-pill-white !text-xs inline-flex">
                Aller à la connexion
              </Link>
            </div>
          )}

          {groupe && (
            <>
              <div className="text-center space-y-2">
                <h1 className="font-extrabold text-2xl sm:text-3xl leading-tight">Inscription à SihSchool</h1>
                <div className="inline-flex flex-col items-center gap-1 px-4 py-3 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C]">
                  <span className="font-black text-lg">{groupe.nom}</span>
                  <span className="text-sm font-bold text-[#4A5487] flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> {groupe.jour} · {groupe.heure}
                  </span>
                  {groupe.enseignante && (
                    <span className="text-xs font-bold text-[#4A5487]">Enseignante : {groupe.enseignante}</span>
                  )}
                </div>
              </div>

              {authLoading ? null : autreCompteConnecte ? (
                <div className="p-4 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-sm font-bold text-center">
                  Vous êtes connecté avec un compte {profile?.role === 'eleve' ? 'élève' : 'de l\'équipe'}.
                  Ce lien sert aux familles : déconnectez-vous pour l'utiliser.
                </div>
              ) : ajoutOk ? (
                <div className="p-5 rounded-2xl bg-[#EAF7E8] border border-[#BDE8B7] text-center space-y-3">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[#2B7A00]" />
                  <p className="font-black text-[#2B7A00]">C'est fait ! Votre enfant est inscrit dans ce groupe.</p>
                  <Link to="/famille" className="btn-pill-sun !text-sm inline-flex items-center gap-2">
                    Aller à mon espace <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[#E5483D] text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {parentConnecte ? (
                    <p className="text-sm font-bold text-center text-[#4A5487]">
                      Bonjour {profile?.prenom} ! Ajoutez votre enfant à ce groupe.
                    </p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {(['parent', 'adulte'] as const).map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setType(t)}
                            className={`py-2.5 px-2 rounded-2xl border-2 text-sm font-extrabold ${
                              type === t ? 'bg-[#FFE15C] border-[#FFE15C]' : 'bg-white border-[#CDBDF2] text-[#4A5487]'
                            }`}
                          >
                            {t === 'parent' ? "J'inscris mon enfant" : "Je m'inscris moi-même"}
                          </button>
                        ))}
                      </div>

                      <p className="text-sm font-black">{type === 'parent' ? 'Vous (le parent)' : 'Vous'}</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Prénom *</label>
                          <input className={inputClass} value={prenom} onChange={(e) => setPrenom(e.target.value)} autoComplete="given-name" />
                        </div>
                        <div>
                          <label className={labelClass}>Nom</label>
                          <input className={inputClass} value={nom} onChange={(e) => setNom(e.target.value)} autoComplete="family-name" />
                        </div>
                      </div>
                      <div>
                        <label className={labelClass}>E-mail * (pour vous connecter)</label>
                        <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
                      </div>
                      <div>
                        <label className={labelClass}>Téléphone (WhatsApp)</label>
                        <input type="tel" className={inputClass} value={telephone} onChange={(e) => setTelephone(e.target.value)} autoComplete="tel" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelClass}>Mot de passe * (6 caractères min.)</label>
                          <input type="password" className={inputClass} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} autoComplete="new-password" />
                        </div>
                        <div>
                          <label className={labelClass}>Confirmer *</label>
                          <input type="password" className={inputClass} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} autoComplete="new-password" />
                        </div>
                      </div>
                    </>
                  )}

                  {(parentConnecte || type === 'parent') && (
                    <div className="p-4 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C]/60 space-y-3">
                      <p className="text-sm font-black">{enfants.length > 1 ? 'Vos enfants' : 'Votre enfant'}</p>
                      {enfants.map((enf, i) => (
                        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                          <div>
                            <label className={labelClass}>Prénom *</label>
                            <input className={inputClass} value={enf.prenom} onChange={(e) => setEnfant(i, 'prenom', e.target.value)} />
                          </div>
                          <div>
                            <label className={labelClass}>Nom</label>
                            <input className={inputClass} value={enf.nom} onChange={(e) => setEnfant(i, 'nom', e.target.value)} placeholder={nom} />
                          </div>
                          <button
                            type="button"
                            onClick={() => setEnfants((prev) => prev.filter((_, k) => k !== i))}
                            disabled={enfants.length === 1}
                            className="h-11 w-11 flex items-center justify-center text-[#4A5487] hover:text-[#E5483D] disabled:opacity-30"
                            aria-label="Retirer cet enfant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setEnfants((prev) => [...prev, { prenom: '', nom: '' }])}
                        className="text-xs font-extrabold inline-flex items-center gap-1.5 hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ajouter un autre enfant
                      </button>
                    </div>
                  )}

                  <button type="submit" disabled={saving} className="btn-pill-sun w-full !min-h-[48px] inline-flex items-center justify-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    {saving ? 'Inscription en cours...' : parentConnecte ? 'Inscrire mon enfant' : 'Créer mon compte'}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};
