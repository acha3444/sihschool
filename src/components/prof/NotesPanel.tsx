import React, { useState } from 'react';
import { Devoir, DevoirRendu, Eleve, Groupe } from '../../types/database';
import { baremeDe, couleurNote, formatNote, moyenne, sur20 } from '../../lib/notes';
import { Award } from 'lucide-react';

interface Props {
  groupes: Groupe[];
  eleves: Eleve[];
  devoirs: Devoir[];
  rendus: DevoirRendu[];
}

/** n : note sur le barème « sur » (20 par défaut) ; la couleur se calcule sur 20 */
const Pastille: React.FC<{ n: number | null | undefined; sur?: number; fort?: boolean }> = ({ n, sur = 20, fort }) =>
  n === null || n === undefined ? (
    <span className="text-[#4A5487]/50 font-bold">—</span>
  ) : (
    <span className={`inline-block min-w-[44px] text-center px-2 py-0.5 rounded-full ${fort ? 'text-sm font-black' : 'text-xs font-extrabold'} ${couleurNote(sur20(n, sur))}`}>
      {formatNote(n)}
      {sur !== 20 && <span className="opacity-60 font-bold">/{formatNote(sur)}</span>}
    </span>
  );

/** Tableau des notes d'un groupe : élèves × devoirs, moyennes par élève, par devoir et du groupe. */
export const NotesPanel: React.FC<Props> = ({ groupes, eleves, devoirs, rendus }) => {
  const [groupeId, setGroupeId] = useState(groupes[0]?.id || '');
  const groupe = groupes.find((g) => g.id === groupeId) || groupes[0];

  if (!groupe) {
    return <div className="cloud-card p-8 text-center font-bold text-[#4A5487]">Aucun groupe pour le moment.</div>;
  }

  const els = eleves.filter((e) => e.groupe_id === groupe.id).sort((a, b) => a.prenom.localeCompare(b.prenom, 'fr'));
  const dvs = devoirs.filter((d) => d.groupe_id === groupe.id).sort((a, b) => a.created_at.localeCompare(b.created_at));
  const note = (eleveId: string, devoirId: string) => rendus.find((r) => r.eleve_id === eleveId && r.devoir_id === devoirId)?.note;
  // Moyenne de l'élève ramenée sur 20 ; moyenne d'un devoir sur son propre barème
  const moyEleve = (e: Eleve) => moyenne(dvs.map((d) => sur20(note(e.id, d.id), d.bareme)));
  const moyDevoir = (d: Devoir) => moyenne(els.map((e) => note(e.id, d.id)));
  const moyGroupe = moyenne(els.map(moyEleve));

  return (
    <div className="space-y-4">
      {groupes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {groupes.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => setGroupeId(g.id)}
              className={`px-4 py-2 rounded-full text-sm font-extrabold min-h-[40px] ${g.id === groupe.id ? 'bg-[#1B2A7A] text-white' : 'bg-white text-[#4A5487] border border-[#CDBDF2]/60'}`}
            >
              {g.nom}
            </button>
          ))}
        </div>
      )}

      <div className="cloud-card p-4 sm:p-5 flex items-center justify-between gap-3 border-2 border-[#FFE15C]">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#8C6D00] flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Moyenne du groupe
          </p>
          <p className="text-lg font-black text-[#1B2A7A]">{groupe.nom}</p>
          <p className="text-xs font-bold text-[#4A5487]">
            {els.length} élève{els.length > 1 ? 's' : ''} · {dvs.length} devoir{dvs.length > 1 ? 's' : ''}
          </p>
        </div>
        {moyGroupe === null ? (
          <span className="text-sm font-bold text-[#4A5487]">Pas encore de note</span>
        ) : (
          <span className={`text-3xl font-black px-4 py-1.5 rounded-2xl ${couleurNote(moyGroupe)}`}>
            {formatNote(moyGroupe)}
            <span className="text-base font-bold">/20</span>
          </span>
        )}
      </div>

      {els.length === 0 ? (
        <div className="cloud-card p-6 text-center font-bold text-[#4A5487]">Aucun élève dans ce groupe.</div>
      ) : (
        <div className="cloud-card p-3 sm:p-4 overflow-x-auto">
          <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="sticky left-0 bg-[#FFF6E3] text-left text-xs font-black text-[#1B2A7A] px-3 py-2 rounded-l-xl">Élève</th>
                {dvs.map((d) => (
                  <th key={d.id} className="text-center text-[11px] font-black text-[#4A5487] px-2 py-2 bg-[#FFF6E3] max-w-[120px]" title={d.titre}>
                    <span className="block truncate max-w-[110px] mx-auto">{d.titre}</span>
                    <span className="block font-bold opacity-70">
                      {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · sur {formatNote(baremeDe(d.bareme))}
                    </span>
                  </th>
                ))}
                <th className="text-center text-xs font-black text-[#1B2A7A] px-3 py-2 bg-[#FFE15C] rounded-r-xl">Moyenne /20</th>
              </tr>
            </thead>
            <tbody>
              {els.map((e) => (
                <tr key={e.id} className="border-b">
                  <td className="sticky left-0 bg-white px-3 py-2.5 font-extrabold text-[#1B2A7A] whitespace-nowrap border-b border-[#CDBDF2]/30">
                    {e.prenom} {e.nom}
                  </td>
                  {dvs.map((d) => (
                    <td key={d.id} className="text-center px-2 py-2.5 border-b border-[#CDBDF2]/30">
                      <Pastille n={note(e.id, d.id)} sur={baremeDe(d.bareme)} />
                    </td>
                  ))}
                  <td className="text-center px-3 py-2.5 border-b border-[#CDBDF2]/30">
                    <Pastille n={moyEleve(e)} fort />
                  </td>
                </tr>
              ))}
              {dvs.length > 0 && (
                <tr>
                  <td className="sticky left-0 bg-[#F7F5FF] px-3 py-2 text-xs font-black text-[#5B3FA8] rounded-l-xl">Moyenne du devoir</td>
                  {dvs.map((d) => (
                    <td key={d.id} className="text-center px-2 py-2 bg-[#F7F5FF]">
                      <Pastille n={moyDevoir(d)} sur={baremeDe(d.bareme)} />
                    </td>
                  ))}
                  <td className="text-center px-3 py-2 bg-[#F7F5FF] rounded-r-xl">
                    <Pastille n={moyGroupe} fort />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {dvs.length === 0 && <p className="text-center text-sm font-bold text-[#4A5487] py-4">Aucun devoir donné à ce groupe pour l'instant.</p>}
        </div>
      )}
      <p className="text-xs font-bold text-[#4A5487] px-1">
        Pour noter : onglet « Devoirs », ouvrez « Réponses & notes des élèves » sous le devoir. Chaque devoir a son barème (sur 20, 10, 5…) ; les moyennes sont ramenées sur 20.
      </p>
    </div>
  );
};
