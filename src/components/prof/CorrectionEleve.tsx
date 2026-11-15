import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DevoirRendu, Eleve } from '../../types/database';
import { AudioPlayer } from '../common/AudioPlayer';
import { lireNote, formatNote } from '../../lib/notes';
import { CheckCircle2, FileText, RotateCcw, Star } from 'lucide-react';

interface Props {
  eleve: Eleve;
  devoirId: string;
  bareme: number;
  rendu?: DevoirRendu;
  onSaved: (rendu: DevoirRendu) => void;
}

/**
 * Correction d'un élève pour un devoir : écoute du vocal, lecture de la réponse écrite,
 * Valider / À réviser, note sur 20 et commentaire. Fonctionne aussi sans rendu (note directe).
 */
export const CorrectionEleve: React.FC<Props> = ({ eleve, devoirId, bareme, rendu, onSaved }) => {
  const [statut, setStatut] = useState<'valide' | 'a_reviser'>(rendu?.statut === 'a_reviser' ? 'a_reviser' : 'valide');
  const [note, setNote] = useState(rendu?.note !== null && rendu?.note !== undefined ? formatNote(rendu.note) : '');
  const [commentaire, setCommentaire] = useState(rendu?.commentaire_prof || '');
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState('');

  const aRendu = !!(rendu?.audio_url || rendu?.texte_rendu);

  const enregistrer = async () => {
    setError('');
    const n = lireNote(note, bareme);
    if (n === undefined) return setError(`La note doit être entre 0 et ${formatNote(bareme)}.`);
    setSaving(true);
    const correction = { statut, note: n, commentaire_prof: commentaire.trim() || null, corrige_le: new Date().toISOString() };
    const req = rendu
      ? supabase.from('devoir_rendus').update(correction).eq('id', rendu.id)
      : supabase.from('devoir_rendus').insert({ devoir_id: devoirId, eleve_id: eleve.id, audio_url: null, duree_secondes: 0, ...correction });
    const { data, error: err } = await req.select('*, eleve:eleves(*), devoir:devoirs(*)').single();
    setSaving(false);
    if (err || !data) return setError(err?.message || "La correction n'a pas pu être enregistrée.");
    onSaved(data as DevoirRendu);
    setOk(true);
    setTimeout(() => setOk(false), 2500);
  };

  return (
    <div className="space-y-2 pt-1">
      {rendu?.texte_rendu && (
        <div className="p-3 rounded-xl bg-[#F7F5FF] border border-[#CDBDF2]">
          <p className="text-[11px] font-black text-[#5B3FA8] flex items-center gap-1 mb-1">
            <FileText className="w-3.5 h-3.5" /> Réponse écrite
          </p>
          <p className="text-sm text-[#1B2A7A] whitespace-pre-wrap" dir="auto">{rendu.texte_rendu}</p>
        </div>
      )}
      {rendu?.audio_url && <AudioPlayer src={rendu.audio_url} label={`Récitation de ${eleve.prenom}`} className="!p-2 bg-[#F9FAFB]" />}
      {!aRendu && <p className="text-[11px] text-gray-400 italic">Pas encore de réponse : vous pouvez quand même noter {eleve.prenom}.</p>}

      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => setStatut('valide')}
          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${statut === 'valide' ? 'bg-[#1E7E44] text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          <Star className="w-3 h-3" /> Valider
        </button>
        <button
          type="button"
          onClick={() => setStatut('a_reviser')}
          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold inline-flex items-center gap-1 ${statut === 'a_reviser' ? 'bg-[#854D0E] text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          <RotateCcw className="w-3 h-3" /> À réviser
        </button>
        <label className="inline-flex items-center gap-1 ml-auto text-[11px] font-black text-[#1B2A7A]">
          Note
          <input
            type="text"
            inputMode="decimal"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="—"
            aria-label={`Note de ${eleve.prenom} sur ${bareme}`}
            className="w-14 min-h-[32px] px-2 rounded-lg border border-[#CDBDF2] text-sm font-black text-center text-[#1B2A7A]"
          />
          /{formatNote(bareme)}
        </label>
      </div>

      <div className="flex items-start gap-1.5">
        <textarea
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Correction ou remarque pour l'élève…"
          rows={2}
          dir="auto"
          className="flex-1 min-h-[38px] px-2.5 py-1.5 rounded-lg border border-[#CDBDF2] text-xs text-[#1B2A7A]"
        />
        <button type="button" onClick={enregistrer} disabled={saving} className="btn-pill-sun text-[11px] font-bold !min-h-[38px] px-3 flex-shrink-0">
          {saving ? '...' : ok ? <CheckCircle2 className="w-4 h-4" /> : 'Enregistrer'}
        </button>
      </div>
      {error && <p className="text-[11px] font-bold text-[#E5483D]">{error}</p>}
    </div>
  );
};
