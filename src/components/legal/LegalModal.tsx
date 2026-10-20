import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Download, Trash2, X, FileText, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'mentions' | 'rgpd' | 'mineurs';
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, defaultTab = 'rgpd' }) => {
  const { exportDataJson } = useApp();
  const [tab, setTab] = useState<'mentions' | 'rgpd' | 'mineurs'>(defaultTab);
  const [deleteRequested, setDeleteRequested] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl cloud-card border-4 border-white p-6 shadow-cloud-pop max-h-[90vh] flex flex-col font-baloo">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#CDBDF2]/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFE15C] flex items-center justify-center text-[#1B2A7A] shadow-sm">
              <ShieldCheck className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-extrabold text-2xl text-[#1B2A7A]">Charte & Protection RGPD</h3>
              <p className="text-xs text-[#4A5487] font-semibold">Conformité CNIL et protection des mineurs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FFFFFF] hover:bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center border border-[#CDBDF2] transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 pt-4 pb-2 border-b border-[#CDBDF2]/40 text-xs font-extrabold">
          <button
            onClick={() => setTab('rgpd')}
            className={`px-4 py-2 rounded-full transition-all ${
              tab === 'rgpd' ? 'bg-[#CDBDF2] text-[#1B2A7A] shadow-sm' : 'text-[#4A5487] hover:text-[#1B2A7A]'
            }`}
          >
            Données & Export
          </button>
          <button
            onClick={() => setTab('mineurs')}
            className={`px-4 py-2 rounded-full transition-all ${
              tab === 'mineurs' ? 'bg-[#CDBDF2] text-[#1B2A7A] shadow-sm' : 'text-[#4A5487] hover:text-[#1B2A7A]'
            }`}
          >
            Protection des Mineurs
          </button>
          <button
            onClick={() => setTab('mentions')}
            className={`px-4 py-2 rounded-full transition-all ${
              tab === 'mentions' ? 'bg-[#CDBDF2] text-[#1B2A7A] shadow-sm' : 'text-[#4A5487] hover:text-[#1B2A7A]'
            }`}
          >
            Mentions Légales
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-[#4A5487] leading-relaxed pr-2 font-medium">
          {tab === 'rgpd' && (
            <div className="space-y-4">
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-sm text-[#1B2A7A] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} /> Droits d’Accès & de Rectification
                </h4>
                <p>
                  Conformément au RGPD (Règlement 2016/679), les familles ont la maîtrise totale de leurs données et de celles de leurs enfants. Vous pouvez télécharger ou demander la suppression définitive de votre dossier scolaire à tout moment.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={exportDataJson}
                  className="btn-pill-sun !min-h-[44px] !text-xs !py-2 w-full"
                >
                  <Download className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                  <span>Exporter mes données (JSON)</span>
                </button>

                <button
                  onClick={() => setDeleteRequested(true)}
                  className="btn-pill-white !min-h-[44px] !text-xs !py-2 w-full text-[#E5483D] border-[#E5483D]/40"
                >
                  <Trash2 className="w-4 h-4 text-[#E5483D]" strokeWidth={2.5} />
                  <span>Demander l’effacement des données</span>
                </button>
              </div>

              {deleteRequested && (
                <div className="p-4 rounded-2xl bg-[#FFF6E3] border-2 border-[#FFE15C] text-[#1B2A7A] text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#1B2A7A] shrink-0" strokeWidth={2.5} />
                  <p>
                    Votre demande de suppression a bien été prise en compte. Le traitement sera exécuté sous 48 heures ouvrées.
                  </p>
                </div>
              )}
            </div>
          )}

          {tab === 'mineurs' && (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2]">
                <h4 className="font-extrabold text-sm text-[#1B2A7A] mb-1">Espace sécurisé & zéro contact externe</h4>
                <ul className="list-disc list-inside mt-2 space-y-1 text-[#1B2A7A]">
                  <li>Aucun profil d’élève n’est public ni indexé par les moteurs de recherche.</li>
                  <li>Aucune messagerie directe entre élèves n’existe sur la plateforme.</li>
                  <li>Les élèves mineurs peuvent uniquement transmettre des devoirs de lecture vocale à leur propre enseignant.</li>
                  <li>Les comptes élèves sont créés sous le contrôle exclusif de la direction et après consentement parental exprès.</li>
                </ul>
              </div>
            </div>
          )}

          {tab === 'mentions' && (
            <div className="space-y-3">
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-sm text-[#1B2A7A]">Éditeur de la Plateforme</h4>
                <p>
                  Sihscool · Institut d’Enseignement de la Langue Arabe et de la Méthode Nourania.<br />
                  Association loi 1901 pour l’éducation bienveillante.<br />
                  Directeur de la publication : Cheikh Mohammed Al-Mansour.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
