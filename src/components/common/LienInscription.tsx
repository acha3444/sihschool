import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Groupe } from '../../types/database';
import { CheckCheck, Copy, Link2, RefreshCw } from 'lucide-react';

const nouveauCode = () => {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
};

/** Lien d'inscription d'un groupe, à partager aux familles (WhatsApp, site vitrine...). */
export const LienInscription: React.FC<{ groupe: Groupe; onChange?: () => void }> = ({ groupe, onChange }) => {
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  if (!groupe.code_inscription) return null;
  const url = `${window.location.origin}/inscription/${groupe.code_inscription}`;
  const message = `Assalamu alaykum ! Pour inscrire votre enfant au cours « ${groupe.nom} » (${groupe.jour} ${groupe.heure}) à l'école Sihscool, créez votre compte ici :\n${url}`;

  const copier = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const regenerer = async () => {
    if (!confirm("Créer un nouveau lien ? L'ancien lien ne fonctionnera plus (les élèves déjà inscrits ne sont pas touchés).")) return;
    setBusy(true);
    const { error } = await supabase.from('groupes').update({ code_inscription: nouveauCode() }).eq('id', groupe.id);
    setBusy(false);
    if (error) return alert(error.message);
    onChange?.();
  };

  return (
    <div className="p-3 rounded-2xl bg-[#F3EEFF] border border-[#CDBDF2] space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#1B2A7A]">
        <Link2 className="w-3.5 h-3.5" /> Lien d'inscription pour les familles
      </div>
      <p className="text-[11px] font-mono font-bold text-[#1B2A7A] break-all select-all">{url}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={copier} className="btn-pill-sun !min-h-[34px] !py-1 !px-3 !text-xs inline-flex items-center gap-1.5">
          {copied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copié !' : 'Copier le lien'}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-pill-white !min-h-[34px] !py-1 !px-3 !text-xs inline-flex items-center"
        >
          💬 WhatsApp
        </a>
        <button
          type="button"
          onClick={regenerer}
          disabled={busy}
          className="text-[11px] font-bold text-[#4A5487] hover:text-[#1B2A7A] inline-flex items-center gap-1 px-1"
          title="Créer un nouveau lien (l'ancien ne marchera plus)"
        >
          <RefreshCw className={`w-3 h-3 ${busy ? 'animate-spin' : ''}`} /> Nouveau lien
        </button>
      </div>
    </div>
  );
};
