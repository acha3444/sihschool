import React, { useState } from 'react';
import { Eleve, Groupe, Seance, Presence, Progression, Devoir, Appreciation, Paiement, Annonce } from '../../types/database';
import { 
  Video, 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  CreditCard, 
  Megaphone, 
  Award,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface StudentPortalViewProps {
  eleve: Eleve;
  groupe: Groupe | null;
  seances: Seance[];
  presences: Presence[];
  progression: Progression | null;
  devoirs: Devoir[];
  appreciations: Appreciation[];
  paiements: Paiement[];
  annonces: Annonce[];
}

type TabType = 'accueil' | 'progression' | 'devoirs' | 'presences' | 'bilan';

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  eleve,
  groupe,
  seances,
  presences,
  progression,
  devoirs,
  appreciations,
  paiements,
  annonces,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('accueil');

  const WHATSAPP_URL = 'https://wa.me/33757589112';

  // Format date helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const formatPeriod = (periodStr: string) => {
    if (!periodStr) return '';
    const parts = periodStr.split('-');
    if (parts.length === 2) {
      const year = parts[0];
      const monthNum = parseInt(parts[1], 10) - 1;
      const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
      ];
      return `${monthNames[monthNum] || parts[1]} ${year}`;
    }
    return periodStr;
  };

  // Status badge for presence
  const getPresenceBadge = (statut: string) => {
    switch (statut) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EAFBF1] text-[#1E7E44] border border-[#C5F3D6]">
            <CheckCircle2 className="w-4 h-4 text-[#1E7E44]" />
            Présent(e)
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FDE8E8] text-[#9B1C1C] border border-[#F8B4B4]">
            <XCircle className="w-4 h-4 text-[#9B1C1C]" />
            Absent(e)
          </span>
        );
      case 'retard':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FEF08A] text-[#854D0E] border border-[#FDE047]">
            <Clock className="w-4 h-4 text-[#854D0E]" />
            En retard
          </span>
        );
      case 'excuse':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E0E7FF] text-[#3730A3] border border-[#C7D2FE]">
            <AlertCircle className="w-4 h-4 text-[#3730A3]" />
            Excusé(e)
          </span>
        );
      default:
        return <span>{statut}</span>;
    }
  };

  // Nourania lesson calculation
  const totalLecons = 17;
  const leconActuelle = progression?.lecon_actuelle || 1;
  const progressPercent = Math.min(100, Math.round((leconActuelle / totalLecons) * 100));

  // Devoirs: split between active and past
  const todayStr = new Date().toISOString().split('T')[0];
  const devoirsAFaire = devoirs.filter(d => !d.date_limite || d.date_limite >= todayStr);
  const devoirsPasses = devoirs.filter(d => d.date_limite && d.date_limite < todayStr);

  return (
    <div className="space-y-6">
      {/* Navigation tabs for mobile / desktop */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('accueil')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'accueil'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Séance & Annonces</span>
        </button>

        <button
          onClick={() => setActiveTab('progression')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'progression'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Progression</span>
        </button>

        <button
          onClick={() => setActiveTab('devoirs')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'devoirs'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Devoirs {devoirsAFaire.length > 0 && `(${devoirsAFaire.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('presences')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'presences'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Présences</span>
        </button>

        <button
          onClick={() => setActiveTab('bilan')}
          className={`flex-shrink-0 min-h-[44px] px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'bilan'
              ? 'bg-[#1B2A7A] text-white shadow-md'
              : 'bg-[#FFF6E3] text-[#1B2A7A] hover:bg-[#FFEEC2]'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Appréciations & Paiements</span>
        </button>
      </div>

      {/* TAB: ACCUEIL & SÉANCES */}
      {activeTab === 'accueil' && (
        <div className="space-y-6">
          {/* Prochaine Séance & Zoom Card */}
          <div className="cloud-card p-6 border-2 border-[#FFE15C] bg-gradient-to-br from-[#FFFDF7] to-[#FFF6E3]">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-[#FFE15C] text-[#1B2A7A]">
                  <Video className="w-3.5 h-3.5" />
                  Prochaine séance en direct
                </div>
                <h3 className="text-xl md:text-2xl font-black text-[#1B2A7A]">
                  {groupe ? groupe.nom : 'Groupe en cours d\'attribution'}
                </h3>
                {groupe ? (
                  <p className="text-base text-[#1B2A7A]/80 font-medium flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#1B2A7A]" />
                    <span>Tous les <strong className="capitalize">{groupe.jour}s</strong> à <strong className="text-lg">{groupe.heure}</strong></span>
                  </p>
                ) : (
                  <p className="text-base text-gray-500">Contactez l'administration pour votre affectation de groupe.</p>
                )}
                {groupe?.formation && (
                  <p className="text-sm text-[#1B2A7A]/70">
                    Formation : <span className="font-bold uppercase">{groupe.formation}</span>
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {groupe?.lien_zoom ? (
                  <a
                    href={groupe.lien_zoom}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-pill-sun text-base px-6 py-3.5 min-h-[48px] flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Video className="w-5 h-5" />
                    <span>Rejoindre sur Zoom</span>
                    <ExternalLink className="w-4 h-4 opacity-70" />
                  </a>
                ) : (
                  <div className="px-4 py-3 rounded-2xl bg-white/70 border border-amber-200 text-sm text-[#1B2A7A] text-center">
                    Lien Zoom bientôt disponible
                  </div>
                )}

                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[48px] px-5 py-3 rounded-full font-bold text-base bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Contacter Siham sur WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          {/* Annonces récentes */}
          <div className="cloud-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-black text-[#1B2A7A] flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#1B2A7A]" />
                Dernières annonces
              </h3>
            </div>

            {annonces.length === 0 ? (
              <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                <Megaphone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-base text-gray-500 font-medium">Aucune annonce pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {annonces.map((annonce) => (
                  <div key={annonce.id} className="p-4 rounded-2xl bg-white border border-[#CDBDF2]/40 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-black text-base text-[#1B2A7A]">{annonce.titre}</h4>
                      <span className="text-xs text-gray-500 font-medium">
                        {formatDate(annonce.publiee_le || annonce.created_at)}
                      </span>
                    </div>
                    <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
                      {annonce.texte}
                    </p>
                    {annonce.groupe_id && (
                      <span className="inline-block text-xs font-bold text-[#1B2A7A] bg-[#CDBDF2]/30 px-2.5 py-0.5 rounded-full">
                        Réservé à votre groupe
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: PROGRESSION */}
      {activeTab === 'progression' && (
        <div className="space-y-6">
          <div className="cloud-card p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-xl font-black text-[#1B2A7A] flex items-center gap-2">
                  <Award className="w-6 h-6 text-[#1B2A7A]" />
                  Suivi de la Méthode Nourania
                </h3>
                <p className="text-sm text-gray-600">
                  Progression officielle sur les 17 leçons d'apprentissage
                </p>
              </div>
              <div className="bg-[#FFE15C] text-[#1B2A7A] px-4 py-2 rounded-2xl font-black text-lg text-center shadow-sm">
                Leçon {leconActuelle} / {totalLecons}
              </div>
            </div>

            {/* Barre de progression visuelle */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm font-bold text-[#1B2A7A]">
                <span>Progression globale</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-4 bg-white rounded-full overflow-hidden border border-[#1B2A7A]/10 p-0.5 shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-[#FFE15C] via-[#CDBDF2] to-[#1B2A7A] rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Grille des 17 leçons Nourania */}
            <div className="space-y-3">
              <h4 className="text-sm font-extrabold text-[#1B2A7A] uppercase tracking-wider">
                Feuille de route des 17 leçons :
              </h4>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-2">
                {Array.from({ length: 17 }, (_, i) => i + 1).map((num) => {
                  const isDone = num < leconActuelle;
                  const isCurrent = num === leconActuelle;

                  return (
                    <div
                      key={num}
                      className={`h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs transition-all ${
                        isCurrent
                          ? 'bg-[#1B2A7A] text-white ring-4 ring-[#FFE15C] shadow-md scale-105'
                          : isDone
                          ? 'bg-[#CDBDF2]/50 text-[#1B2A7A] border border-[#CDBDF2]'
                          : 'bg-white/80 text-gray-400 border border-gray-200'
                      }`}
                    >
                      <span>Leçon</span>
                      <span className="text-sm font-black">{num}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Commentaire de l'enseignante */}
            <div className="mt-8 p-5 rounded-2xl bg-white border border-[#CDBDF2]/50 space-y-2">
              <h4 className="font-black text-base text-[#1B2A7A] flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#1B2A7A]" />
                Commentaire de l'enseignante Siham
              </h4>
              {progression?.commentaire ? (
                <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
                  "{progression.commentaire}"
                </p>
              ) : (
                <p className="text-base text-gray-500 italic">
                  Aucun commentaire saisi pour le moment.
                </p>
              )}
              {progression?.mis_a_jour_le && (
                <p className="text-xs text-gray-400 text-right font-medium">
                  Mis à jour le {formatDate(progression.mis_a_jour_le)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: DEVOIRS */}
      {activeTab === 'devoirs' && (
        <div className="space-y-6">
          {/* Devoirs à faire */}
          <div className="cloud-card p-6">
            <h3 className="text-lg md:text-xl font-black text-[#1B2A7A] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1B2A7A]" />
              Devoirs à préparer
            </h3>

            {devoirsAFaire.length === 0 ? (
              <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-base text-gray-500 font-medium">Aucun devoir pour le moment</p>
                <p className="text-sm text-gray-400">Bravo ! Tout est à jour.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {devoirsAFaire.map((d) => (
                  <div key={d.id} className="p-4 rounded-2xl bg-white border-2 border-[#FFE15C] space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-black text-base text-[#1B2A7A]">{d.titre}</h4>
                      {d.date_limite && (
                        <span className="text-xs font-bold text-amber-900 bg-[#FFE15C] px-3 py-1 rounded-full">
                          À rendre pour le {formatDate(d.date_limite)}
                        </span>
                      )}
                    </div>
                    <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
                      {d.consigne}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Devoirs passés */}
          {devoirsPasses.length > 0 && (
            <div className="cloud-card p-6">
              <h3 className="text-base md:text-lg font-bold text-[#1B2A7A]/70 mb-4">
                Devoirs passés
              </h3>
              <div className="space-y-3">
                {devoirsPasses.map((d) => (
                  <div key={d.id} className="p-3.5 rounded-xl bg-white/70 border border-gray-200 opacity-80">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-[#1B2A7A]">{d.titre}</span>
                      <span className="text-xs text-gray-500">{d.date_limite && formatDate(d.date_limite)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{d.consigne}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB: PRÉSENCES */}
      {activeTab === 'presences' && (
        <div className="cloud-card p-6">
          <h3 className="text-lg md:text-xl font-black text-[#1B2A7A] mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#1B2A7A]" />
            Historique des présences
          </h3>

          {presences.length === 0 ? (
            <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-base text-gray-500 font-medium">Aucun historique de présence enregistré</p>
            </div>
          ) : (
            <div className="space-y-3">
              {presences.map((p) => {
                const seance = seances.find((s) => s.id === p.seance_id);
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white border border-[#CDBDF2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-black text-base text-[#1B2A7A]">
                        {seance?.date ? formatDate(seance.date) : 'Séance'}
                      </div>
                      {seance?.theme && (
                        <p className="text-sm text-gray-600 font-medium">
                          Thème : {seance.theme}
                        </p>
                      )}
                    </div>
                    <div>
                      {getPresenceBadge(p.statut)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: APPRÉCIATIONS & PAIEMENTS */}
      {activeTab === 'bilan' && (
        <div className="space-y-6">
          {/* Appréciations mensuelles */}
          <div className="cloud-card p-6">
            <h3 className="text-lg md:text-xl font-black text-[#1B2A7A] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1B2A7A]" />
              Appréciations de l'enseignante
            </h3>

            {appreciations.length === 0 ? (
              <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-base text-gray-500 font-medium">Aucune appréciation pour le moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appreciations.map((app) => (
                  <div key={app.id} className="p-4 rounded-2xl bg-white border border-[#CDBDF2]/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-[#1B2A7A] uppercase tracking-wide bg-[#CDBDF2]/30 px-3 py-1 rounded-full">
                        Période : {formatPeriod(app.periode)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDate(app.created_at)}
                      </span>
                    </div>
                    <p className="text-base text-gray-800 whitespace-pre-line leading-relaxed pt-1">
                      {app.texte}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paiements / Cotisations */}
          <div className="cloud-card p-6">
            <h3 className="text-lg md:text-xl font-black text-[#1B2A7A] mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#1B2A7A]" />
              Suivi des paiements
            </h3>

            {paiements.length === 0 ? (
              <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-base text-gray-500 font-medium">Aucun historique de paiement pour le moment</p>
              </div>
            ) : (
              <div className="space-y-3">
                {paiements.map((paiement) => (
                  <div
                    key={paiement.id}
                    className="p-4 rounded-2xl bg-white border border-[#CDBDF2]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-black text-base text-[#1B2A7A]">
                        Mois de {formatPeriod(paiement.mois)}
                      </div>
                      <div className="text-sm text-gray-600 font-medium flex items-center gap-2">
                        <span>Montant : <strong>{paiement.montant} €</strong></span>
                        {paiement.moyen && (
                          <span className="text-xs text-gray-400">({paiement.moyen})</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {paiement.statut === 'paye' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#EAFBF1] text-[#1E7E44] border border-[#C5F3D6]">
                          <CheckCircle2 className="w-4 h-4 text-[#1E7E44]" />
                          Payé {paiement.date_paiement && `le ${formatDate(paiement.date_paiement)}`}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FEF08A] text-[#854D0E] border border-[#FDE047]">
                          <Clock className="w-4 h-4 text-[#854D0E]" />
                          En attente de règlement
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating or bottom persistent WhatsApp CTA on mobile */}
      <div className="pt-4 text-center">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#1B2A7A] hover:underline"
        >
          <MessageCircle className="w-4 h-4 text-[#25D366]" />
          <span>Une question ? Écrivez directement à Siham sur WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
