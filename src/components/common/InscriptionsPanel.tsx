import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Eleve, Groupe, Profile } from '../../types/database';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  CheckCheck,
  KeyRound,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  X,
} from 'lucide-react';

type Identifiants = {
  titre: string;
  prenom: string;
  email: string;
  tempPassword: string;
  telephone?: string | null;
};

const messageIdentifiants = (r: Identifiants) =>
  `Assalamu alaykum ${r.prenom} !\n\nVoici vos identifiants pour l'école Sihscool :\n🌐 Lien : ${window.location.origin}/login\n📧 Identifiant : ${r.email}\n🔑 Mot de passe temporaire : ${r.tempPassword}\n\n(À la première connexion, vous choisirez votre propre mot de passe.)\n\nÀ très vite sur Sihscool !`;

const inputClass =
  'w-full py-2.5 px-4 rounded-2xl bg-white border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-sm font-bold text-[#1B2A7A] min-h-[44px]';
const labelClass = 'text-xs font-extrabold text-[#1B2A7A] block mb-1';

/**
 * Inscriptions : créer des élèves (enfant + compte parent, ou adulte avec son compte),
 * réinitialiser les mots de passe parents / élèves. Utilisé par l'enseignante.
 */
export const InscriptionsPanel: React.FC = () => {
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [parents, setParents] = useState<Profile[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [type, setType] = useState<'enfant' | 'adulte'>('enfant');
  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [groupeId, setGroupeId] = useState('');
  const [parentMode, setParentMode] = useState<'new' | 'existing'>('new');
  const [parentId, setParentId] = useState('');
  const [parentPrenom, setParentPrenom] = useState('');
  const [parentNom, setParentNom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [identifiants, setIdentifiants] = useState<Identifiants | null>(null);
  const [copied, setCopied] = useState(false);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [elevesRes, parentsRes, groupesRes] = await Promise.all([
      supabase
        .from('eleves')
        .select('*, parent:profiles!eleves_parent_id_fkey(*), compte:profiles!eleves_compte_id_fkey(*), groupe:groupes(*)')
        .order('prenom'),
      supabase.from('profiles').select('*').eq('role', 'parent').order('prenom'),
      supabase.from('groupes').select('*').order('nom'),
    ]);
    if (elevesRes.error) console.error('Erreur chargement élèves:', elevesRes.error);
    setEleves((elevesRes.data as Eleve[]) || []);
    setParents((parentsRes.data as Profile[]) || []);
    setGroupes((groupesRes.data as Groupe[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setType('enfant');
    setPrenom('');
    setNom('');
    setGroupeId('');
    setParentMode('new');
    setParentId('');
    setParentPrenom('');
    setParentNom('');
    setEmail('');
    setTelephone('');
    setError('');
  };

  const callApi = async (path: string, body: Record<string, unknown>) => {
    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token}`,
      },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Une erreur est survenue.');
    }
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!prenom.trim()) return setError("Le prénom de l'élève est obligatoire.");

    setSaving(true);
    try {
      let newParentId: string | null = null;
      let compteId: string | null = null;
      let created: Identifiants | null = null;

      if (type === 'enfant') {
        if (parentMode === 'existing') {
          if (!parentId) throw new Error('Choisissez le parent.');
          newParentId = parentId;
        } else {
          if (!parentPrenom.trim() || !email.trim()) throw new Error("Le prénom et l'e-mail du parent sont obligatoires.");
          const data = await callApi('/api/admin/create-user', {
            prenom: parentPrenom,
            nom: parentNom,
            email,
            telephone,
            role: 'parent',
          });
          if (data.alreadyExisted) throw new Error('Un compte existe déjà avec cet e-mail : choisissez « Parent déjà inscrit ».');
          newParentId = data.userId;
          created = { titre: 'Compte parent créé', prenom: parentPrenom, email: data.email, tempPassword: data.tempPassword, telephone };
        }
      } else {
        if (!email.trim()) throw new Error("L'e-mail de l'élève adulte est obligatoire.");
        const data = await callApi('/api/admin/create-user', { prenom, nom, email, telephone, role: 'eleve' });
        if (data.alreadyExisted) throw new Error('Un compte existe déjà avec cet e-mail.');
        compteId = data.userId;
        created = { titre: 'Compte élève créé', prenom, email: data.email, tempPassword: data.tempPassword, telephone };
      }

      const { data: newEleve, error: insertError } = await supabase
        .from('eleves')
        .insert({
          prenom: prenom.trim(),
          nom: nom.trim(),
          type,
          parent_id: newParentId,
          compte_id: compteId,
          groupe_id: groupeId || null,
        })
        .select('id')
        .single();
      if (insertError || !newEleve) throw new Error(insertError?.message || "Impossible d'enregistrer l'élève.");

      await load();
      setModalOpen(false);
      resetForm();
      if (created) {
        setCopied(false);
        setIdentifiants(created);
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async (compte: Profile) => {
    if (!confirm(`Créer un nouveau mot de passe temporaire pour ${compte.prenom} ${compte.nom} ?`)) return;
    setResettingId(compte.id);
    try {
      const data = await callApi('/api/admin/reset-password', { userId: compte.id });
      setCopied(false);
      setIdentifiants({
        titre: 'Mot de passe réinitialisé',
        prenom: data.prenom,
        email: data.email,
        tempPassword: data.tempPassword,
        telephone: compte.telephone,
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setResettingId(null);
    }
  };

  const handleDelete = async (eleve: Eleve) => {
    if (!confirm(`Retirer ${eleve.prenom} ${eleve.nom} de la liste des élèves ? Ses devoirs rendus seront supprimés.`)) return;
    const { error: delError } = await supabase.from('eleves').delete().eq('id', eleve.id);
    if (delError) return alert(delError.message);
    await load();
  };

  const handleCopy = () => {
    if (!identifiants) return;
    navigator.clipboard.writeText(messageIdentifiants(identifiants));
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const q = search.trim().toLowerCase();
  const filtered = eleves.filter((e) =>
    !q ||
    `${e.prenom} ${e.nom} ${e.groupe?.nom || ''} ${e.parent?.prenom || ''} ${e.parent?.nom || ''}`.toLowerCase().includes(q)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#4A5487] absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un élève, un parent, un groupe..."
            className="w-full py-3 pl-11 pr-4 rounded-full bg-white border-2 border-[#CDBDF2] focus:border-[#FFE15C] focus:outline-none text-sm font-bold text-[#1B2A7A] min-h-[44px]"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
          className="btn-pill-sun !min-h-[44px] inline-flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>Inscrire un élève</span>
        </button>
      </div>

      {loading ? (
        <div className="cloud-card p-8 border-4 border-white text-center text-[#4A5487] flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" /> Chargement...
        </div>
      ) : filtered.length === 0 ? (
        <div className="cloud-card p-8 border-4 border-white text-center text-[#4A5487]">
          {eleves.length === 0 ? 'Aucun élève inscrit pour le moment.' : 'Aucun résultat.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((eleve) => {
            const compte = eleve.type === 'enfant' ? eleve.parent : eleve.compte;
            return (
              <div key={eleve.id} className="cloud-card p-4 border-2 border-white shadow-soft-blue space-y-2">
                <div className="flex items-center justify-between">
                  <span className="badge-lavender text-[10px] font-extrabold uppercase">
                    {eleve.type === 'enfant' ? 'Enfant' : 'Adulte'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(eleve)}
                    className="text-[#4A5487] hover:text-[#E5483D] p-1"
                    title="Retirer l'élève"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-extrabold text-lg text-[#1B2A7A]">
                  {eleve.prenom} {eleve.nom}
                </h3>
                <p className="text-xs text-[#4A5487]">
                  Groupe : <strong>{eleve.groupe?.nom || 'Aucun'}</strong>
                </p>
                <p className="text-xs text-[#4A5487]">
                  {eleve.type === 'enfant' ? 'Parent' : 'Compte'} :{' '}
                  <strong>{compte ? `${compte.prenom} ${compte.nom}` : 'Aucun compte'}</strong>
                </p>
                {compte && (
                  <button
                    type="button"
                    onClick={() => handleReset(compte)}
                    disabled={resettingId === compte.id}
                    className="btn-pill-white !min-h-[36px] !text-xs !py-1 !px-3 inline-flex items-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    {resettingId === compte.id ? 'En cours...' : 'Nouveau mot de passe'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A7A]/50 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg cloud-card p-6 border-4 border-white shadow-cloud-pop space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#CDBDF2]/30 pb-3">
              <h3 className="font-black text-xl text-[#1B2A7A]">Inscrire un élève</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-xs text-[#4A5487] font-bold">
                Fermer ✕
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-[#FFF0D4] border border-[#FFE15C] text-[#E5483D] text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {(['enfant', 'adulte'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2.5 rounded-2xl border-2 text-sm font-extrabold ${
                    type === t ? 'bg-[#FFE15C] border-[#FFE15C] text-[#1B2A7A]' : 'bg-white border-[#CDBDF2] text-[#4A5487]'
                  }`}
                >
                  {t === 'enfant' ? 'Enfant (compte parent)' : 'Adulte (son compte)'}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Prénom de l'élève *</label>
                <input className={inputClass} value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
              </div>
              <div>
                <label className={labelClass}>Nom</label>
                <input className={inputClass} value={nom} onChange={(e) => setNom(e.target.value)} />
              </div>
            </div>

            <div>
              <label className={labelClass}>Groupe</label>
              <select className={inputClass} value={groupeId} onChange={(e) => setGroupeId(e.target.value)}>
                <option value="">Aucun pour l'instant</option>
                {groupes.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nom} · {g.jour} {g.heure}
                  </option>
                ))}
              </select>
            </div>

            {type === 'enfant' && (
              <div className="p-4 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C]/60 space-y-3">
                <p className="text-sm font-black text-[#1B2A7A]">Parent</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setParentMode('new')}
                    className={`py-2 rounded-xl border-2 text-xs font-extrabold ${
                      parentMode === 'new' ? 'bg-white border-[#1B2A7A] text-[#1B2A7A]' : 'bg-white/60 border-[#CDBDF2] text-[#4A5487]'
                    }`}
                  >
                    Nouveau parent
                  </button>
                  <button
                    type="button"
                    onClick={() => setParentMode('existing')}
                    className={`py-2 rounded-xl border-2 text-xs font-extrabold ${
                      parentMode === 'existing' ? 'bg-white border-[#1B2A7A] text-[#1B2A7A]' : 'bg-white/60 border-[#CDBDF2] text-[#4A5487]'
                    }`}
                  >
                    Parent déjà inscrit
                  </button>
                </div>

                {parentMode === 'existing' ? (
                  <select className={inputClass} value={parentId} onChange={(e) => setParentId(e.target.value)}>
                    <option value="">Choisir le parent...</option>
                    {parents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.prenom} {p.nom}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Prénom du parent *</label>
                      <input className={inputClass} value={parentPrenom} onChange={(e) => setParentPrenom(e.target.value)} />
                    </div>
                    <div>
                      <label className={labelClass}>Nom du parent</label>
                      <input className={inputClass} value={parentNom} onChange={(e) => setParentNom(e.target.value)} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {(type === 'adulte' || parentMode === 'new') && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>E-mail {type === 'enfant' ? 'du parent' : "de l'élève"} *</label>
                  <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Téléphone (WhatsApp)</label>
                  <input type="tel" className={inputClass} value={telephone} onChange={(e) => setTelephone(e.target.value)} />
                </div>
              </div>
            )}

            <button type="submit" disabled={saving} className="btn-pill-sun w-full !min-h-[48px]">
              {saving ? 'Inscription en cours...' : "Valider l'inscription"}
            </button>
          </form>
        </div>
      )}

      {identifiants && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A7A]/50 backdrop-blur-sm">
          <div className="w-full max-w-lg cloud-card p-6 border-4 border-white shadow-cloud-pop space-y-4">
            <div className="flex items-center justify-between border-b border-[#CDBDF2]/40 pb-3">
              <div className="flex items-center gap-2 text-[#2B7A00] font-black">
                <CheckCircle2 className="w-5 h-5" />
                <span>{identifiants.titre}</span>
              </div>
              <button type="button" onClick={() => setIdentifiants(null)} className="text-[#4A5487]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C] text-xs text-[#1B2A7A] font-mono whitespace-pre-wrap leading-relaxed select-all">
              {messageIdentifiants(identifiants)}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button type="button" onClick={handleCopy} className="flex-1 btn-pill-sun !min-h-[44px] !text-xs inline-flex items-center justify-center gap-2">
                {copied ? <CheckCheck className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Message copié !' : 'Copier le message'}
              </button>
              {identifiants.telephone && (
                <a
                  href={`https://wa.me/${identifiants.telephone.replace(/[^\d]/g, '')}?text=${encodeURIComponent(messageIdentifiants(identifiants))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-pill-white !min-h-[44px] !text-xs inline-flex items-center justify-center"
                >
                  💬 Envoyer sur WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
