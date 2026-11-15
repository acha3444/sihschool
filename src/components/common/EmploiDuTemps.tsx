import React from 'react';
import { Eleve, Groupe } from '../../types/database';
import { BookCheck, CalendarDays, Clock, Plus, Users, Video } from 'lucide-react';

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const sansAccents = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** « mercredis », « Mercredi » → 2 (index dans JOURS), sinon -1 */
const indexJour = (jour?: string | null) => {
  const j = sansAccents(jour || '').trim().replace(/s$/, '');
  return JOURS.findIndex((d) => sansAccents(d) === j);
};

/** « 14:00 - 15:30 », « 11h30 – 13h00 », « 9h-10h » → minutes depuis minuit */
const plage = (heure?: string | null): { debut: number; fin: number } | null => {
  const t = [...(heure || '').matchAll(/(\d{1,2})\s*[h:]\s*(\d{2})?/gi)].map((m) => +m[1] * 60 + +(m[2] || 0));
  if (!t.length) return null;
  const debut = t[0];
  const fin = t[1] && t[1] > debut ? t[1] : debut + 60;
  return { debut, fin };
};

const hhmm = (min: number) => `${Math.floor(min / 60)}h${String(min % 60).padStart(2, '0')}`;

// Couleurs par groupe (stables d'un affichage à l'autre)
const PALETTE = [
  { bg: '#FFF6E3', border: '#FFE15C', ink: '#8C6D00' },
  { bg: '#EAF7E8', border: '#BDE8B7', ink: '#1E7E44' },
  { bg: '#FDE8F0', border: '#F5B8CF', ink: '#B0174F' },
  { bg: '#E7F0FB', border: '#B9D2F2', ink: '#1D4F91' },
  { bg: '#F3EEFF', border: '#CDBDF2', ink: '#5B3FA8' },
];
const couleur = (id: string) => PALETTE[[...id].reduce((n, c) => n + c.charCodeAt(0), 0) % PALETTE.length];

type Cours = { g: Groupe; jour: number; debut: number; fin: number; nb: number };

interface Props {
  groupes: Groupe[];
  eleves: Eleve[];
  onDevoir: (groupeId: string) => void;
  onCreerGroupe: () => void;
}

export const EmploiDuTemps: React.FC<Props> = ({ groupes, eleves, onDevoir, onCreerGroupe }) => {
  const aujourdhui = (new Date().getDay() + 6) % 7; // lundi = 0
  const cours: Cours[] = [];
  const sansHoraire: Groupe[] = [];
  for (const g of groupes) {
    const j = indexJour(g.jour), p = plage(g.heure);
    if (j < 0 || !p) sansHoraire.push(g);
    else cours.push({ g, jour: j, ...p, nb: eleves.filter((e) => e.groupe_id === g.id).length });
  }
  cours.sort((a, b) => a.jour - b.jour || a.debut - b.debut);

  // Plage horaire affichée : du premier au dernier cours, arrondie à l'heure (au moins 4 h)
  const debutJour = cours.length ? Math.min(...cours.map((c) => Math.floor(c.debut / 60) * 60)) : 9 * 60;
  const finJour = Math.max(debutJour + 4 * 60, ...cours.map((c) => Math.ceil(c.fin / 60) * 60));
  const PX = 1.75; // pixels par minute
  const heures = Array.from({ length: (finJour - debutJour) / 60 + 1 }, (_, i) => debutJour + i * 60);

  const prochain = (() => {
    const maintenant = aujourdhui * 1440 + new Date().getHours() * 60 + new Date().getMinutes();
    const tri = [...cours].sort((a, b) => {
      const da = (a.jour * 1440 + a.debut - maintenant + 10080) % 10080, db = (b.jour * 1440 + b.debut - maintenant + 10080) % 10080;
      return da - db;
    });
    return tri[0];
  })();

  const Carte: React.FC<{ c: Cours; compact?: boolean }> = ({ c, compact }) => {
    const col = couleur(c.g.id);
    return (
      <div className="h-full rounded-2xl p-2.5 flex flex-col gap-1 overflow-hidden shadow-xs" style={{ background: col.bg, border: `2px solid ${col.border}` }}>
        <div className="text-[11px] font-black flex items-center gap-1" style={{ color: col.ink }}>
          <Clock className="w-3 h-3" /> {hhmm(c.debut)} – {hhmm(c.fin)}
        </div>
        <div className="font-black text-sm text-[#1B2A7A] leading-tight">{c.g.nom}</div>
        <div className="text-[11px] font-bold text-[#4A5487] flex items-center gap-1">
          <Users className="w-3 h-3" /> {c.nb} élève{c.nb > 1 ? 's' : ''}
        </div>
        {!compact && (
          <div className="mt-auto flex flex-wrap gap-1 pt-1">
            {c.g.lien_zoom && (
              <a href={c.g.lien_zoom} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-full bg-white border border-[#CDBDF2] text-[#1B2A7A] hover:border-[#FFE15C]">
                <Video className="w-3 h-3" /> Zoom
              </a>
            )}
            <button type="button" onClick={() => onDevoir(c.g.id)} className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-1 rounded-full bg-white border border-[#CDBDF2] text-[#1B2A7A] hover:border-[#FFE15C]">
              <BookCheck className="w-3 h-3" /> Devoir
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!groupes.length) {
    return (
      <div className="cloud-card p-8 text-center space-y-3">
        <CalendarDays className="w-10 h-10 mx-auto text-[#1B2A7A] opacity-60" />
        <p className="font-black text-[#1B2A7A]">Aucun groupe pour le moment</p>
        <button type="button" onClick={onCreerGroupe} className="btn-pill-sun text-sm inline-flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Créer un groupe
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Prochain cours */}
      {prochain && (
        <div className="cloud-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between border-2 border-[#FFE15C]">
          <div>
            <div className="text-xs font-black uppercase tracking-wide text-[#8C6D00]">Prochain cours</div>
            <div className="text-lg sm:text-xl font-black text-[#1B2A7A]">
              {prochain.g.nom} · {JOURS[prochain.jour]} {hhmm(prochain.debut)} – {hhmm(prochain.fin)}
            </div>
            <div className="text-sm font-bold text-[#4A5487]">{prochain.nb} élève{prochain.nb > 1 ? 's' : ''}</div>
          </div>
          {prochain.g.lien_zoom && (
            <a href={prochain.g.lien_zoom} target="_blank" rel="noopener noreferrer" className="btn-pill-sun text-sm inline-flex items-center justify-center gap-2">
              <Video className="w-4 h-4" /> Lancer Zoom
            </a>
          )}
        </div>
      )}

      {/* Ordinateur / tablette : semaine avec axe des heures */}
      <div className="hidden md:block cloud-card p-4 overflow-x-auto">
        <div className="grid min-w-[880px]" style={{ gridTemplateColumns: `56px repeat(7, minmax(0, 1fr))` }}>
          <div />
          {JOURS.map((j, i) => (
            <div key={j} className={`text-center text-sm font-black py-2 mx-1 rounded-xl ${i === aujourdhui ? 'bg-[#FFE15C] text-[#1B2A7A]' : 'text-[#4A5487]'}`}>
              {j}
              {i === aujourdhui && <span className="block text-[10px] font-extrabold">Aujourd'hui</span>}
            </div>
          ))}
          <div className="relative" style={{ height: (finJour - debutJour) * PX }}>
            {heures.map((h) => (
              <div key={h} className="absolute right-2 -translate-y-1/2 text-[11px] font-bold text-[#4A5487]" style={{ top: (h - debutJour) * PX }}>
                {hhmm(h)}
              </div>
            ))}
          </div>
          {JOURS.map((j, i) => (
            <div key={j} className={`relative mx-1 rounded-2xl ${i === aujourdhui ? 'bg-[#FFF6E3]/70' : 'bg-white/50'}`} style={{ height: (finJour - debutJour) * PX }}>
              {heures.map((h) => (
                <div key={h} className="absolute left-0 right-0 border-t border-dashed border-[#CDBDF2]/50" style={{ top: (h - debutJour) * PX }} />
              ))}
              {cours.filter((c) => c.jour === i).map((c) => (
                <div key={c.g.id} className="absolute left-1 right-1" style={{ top: (c.debut - debutJour) * PX + 2, height: Math.max(70, (c.fin - c.debut) * PX - 4) }}>
                  <Carte c={c} compact={(c.fin - c.debut) * PX < 130} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Téléphone : liste jour par jour */}
      <div className="md:hidden space-y-3">
        {JOURS.map((j, i) => {
          const duJour = cours.filter((c) => c.jour === i);
          if (duJour.length === 0) return null;
          return (
            <div key={j} className={`cloud-card p-3 ${i === aujourdhui ? 'border-2 border-[#FFE15C]' : ''}`}>
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="font-black text-[#1B2A7A]">{j}</span>
                {i === aujourdhui && <span className="text-[11px] font-black bg-[#FFE15C] px-2 py-0.5 rounded-full">Aujourd'hui</span>}
              </div>
              {duJour.length === 0 ? (
                <p className="text-xs font-bold text-[#4A5487]/70 px-1">Pas de cours</p>
              ) : (
                <div className="space-y-2">
                  {duJour.map((c) => (
                    <Carte key={c.g.id} c={c} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Téléphone : les jours sans cours sur une seule ligne */}
      {JOURS.some((_, i) => !cours.some((c) => c.jour === i)) && (
        <p className="md:hidden text-xs font-bold text-[#4A5487] px-2">
          Pas de cours : {JOURS.filter((_, i) => !cours.some((c) => c.jour === i)).map((j) => j.toLowerCase()).join(', ')}.
        </p>
      )}

      {sansHoraire.length > 0 && (
        <div className="cloud-card p-4">
          <p className="text-sm font-black text-[#1B2A7A] mb-1">Groupes sans jour ou horaire reconnu</p>
          <p className="text-xs font-bold text-[#4A5487]">
            {sansHoraire.map((g) => `${g.nom} (${g.jour || '?'} · ${g.heure || '?'})`).join(' — ')}. Modifiez-les dans « Groupes & Zoom ».
          </p>
        </div>
      )}
    </div>
  );
};
