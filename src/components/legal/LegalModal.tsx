import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Download,
  Trash2,
  X,
  FileText,
  CheckCircle2,
  Lock,
  Cookie,
  RotateCcw,
  Users,
  Copy,
  ExternalLink,
  Info,
  Server,
  HelpCircle,
} from 'lucide-react';

export type LegalTabType = 'rgpd' | 'cgu' | 'remboursement' | 'cookies' | 'mineurs' | 'mentions';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: LegalTabType;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, defaultTab = 'rgpd' }) => {
  const { exportDataJson } = useApp();
  const [tab, setTab] = useState<LegalTabType>(defaultTab);
  const [deleteRequested, setDeleteRequested] = useState(false);
  const [copiedForm, setCopiedForm] = useState<string | null>(null);

  // Sync tab with defaultTab when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTab(defaultTab);
      setDeleteRequested(false);
      setCopiedForm(null);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, formId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedForm(formId);
    setTimeout(() => setCopiedForm(null), 3500);
  };

  const retractationFormTemplate = `MODÈLE DE FORMULAIRE DE RÉTRACTATION (Code de la consommation - Annexe à l'article R. 221-1)
------------------------------------------------------------------------------------------------
À l'attention de la direction de Sihscool :
Adresse e-mail : direction@sihscool.fr

Je vous notifie par la présente ma rétractation du contrat portant sur l'inscription / l'abonnement aux services d'apprentissage Sihscool ci-dessous :

- Nom et prénom du parent / responsable légal : 
- Adresse e-mail du compte parent : 
- Nom et prénom de l'élève (ou des élèves) : 
- Date de l'inscription en ligne : 
- Numéro ou référence du reçu (le cas échéant) : 

Fait le : [Date]
Signature (si notification sur papier) :`;

  const parentalConsentTemplate = `FORMULAIRE D'AUTORISATION PARENTALE ET DE CONSENTEMENT AU TRAITEMENT DES DONNÉES DU MINEUR
(Conforme à l'article 8 du RGPD et à la loi Informatique et Libertés française)
------------------------------------------------------------------------------------------------
Je soussigné(e),
Nom et prénom du responsable légal : 
Adresse email : 
Numéro de téléphone : 

Agissant en qualité de titulaire de l'autorité parentale sur l'enfant mineur :
Nom et prénom de l'élève : 
Niveau scolaire / Groupe : 

1. Déclare inscrire mon enfant sur la plateforme pédagogique Sihscool pour suivre les cours hebdomadaires d'1h30 par semaine en visioconférence interactive sur Zoom.
2. Autorise Sihscool à créer un compte écolier sécurisé (identifié par un avatar et un code PIN local à 6 chiffres, sans collecte d'adresse email pour le mineur).
3. Autorise mon enfant à participer aux séances de visio Zoom en petit groupe et à transmettre de courts devoirs de récitation vocale (méthode Nourania et lecture coranique) à son professeur désigné, aux fins exclusives d'écoute et de correction pédagogique individuelle.
4. M'engage à respecter l'intimité des autres enfants en ne procédant à aucun enregistrement ou capture d'écran des cours en direct sur Zoom.
5. Ai pris connaissance que ces données ne sont jamais rendues publiques, ne sont cédées à aucun tiers et sont supprimées en fin d'année scolaire ou sur simple demande écrite à direction@sihscool.fr.

Fait le : [Date]
Mention "Bon pour accord" et signature du parent :`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
    >
      <div className="w-full max-w-3xl cloud-card border-4 border-white p-5 sm:p-7 shadow-[0_20px_50px_rgba(27,42,122,0.25)] max-h-[92vh] flex flex-col font-baloo bg-[#FFF6E3]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#CDBDF2]/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFE15C] flex items-center justify-center text-[#1B2A7A] shadow-sun-glow shrink-0">
              <ShieldCheck className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div>
              <h2 id="legal-modal-title" className="font-extrabold text-xl sm:text-2xl text-[#1B2A7A] leading-tight">
                Centre Juridique & Conformité
              </h2>
              <p className="text-xs text-[#4A5487] font-semibold">
                RGPD · Code de la consommation · CNIL · Protection des Mineurs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer la fenêtre juridique"
            className="w-10 h-10 rounded-full bg-[#FFFFFF] hover:bg-[#FFE15C] text-[#1B2A7A] flex items-center justify-center border border-[#CDBDF2] transition-colors shadow-sm"
          >
            <X className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Tabs */}
        <div className="flex gap-1.5 pt-3 pb-2 border-b border-[#CDBDF2]/40 text-xs font-extrabold overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTab('rgpd')}
            className={`px-3.5 py-2 rounded-full transition-all shrink-0 flex items-center gap-1.5 ${
              tab === 'rgpd' ? 'bg-[#CDBDF2] text-[#1B2A7A] shadow-sm' : 'text-[#4A5487] hover:text-[#1B2A7A] hover:bg-white/60'
            }`}
          >
            <Lock className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Confidentialité RGPD</span>
          </button>

          <button
            onClick={() => setTab('cgu')}
            className={`px-3.5 py-2 rounded-full transition-all shrink-0 flex items-center gap-1.5 ${
              tab === 'cgu' ? 'bg-[#CDBDF2] text-[#1B2A7A] shadow-sm' : 'text-[#4A5487] hover:text-[#1B2A7A] hover:bg-white/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>CGU & Inscription</span>
          </button>

          <button
            onClick={() => setTab('remboursement')}
            className={`px-3.5 py-2 rounded-full transition-all shrink-0 flex items-center gap-1.5 ${
              tab === 'remboursement' ? 'bg-[#CDBDF2] text-[#1B2A7A] shadow-sm' : 'text-[#4A5487] hover:text-[#1B2A7A] hover:bg-white/60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Remboursement & Rétractation</span>
          </button>

          <button
            onClick={() => setTab('cookies')}
            className={`px-3.5 py-2 rounded-full transition-all shrink-0 flex items-center gap-1.5 ${
              tab === 'cookies' ? 'bg-[#CDBDF2] text-[#1B2A7A] shadow-sm' : 'text-[#4A5487] hover:text-[#1B2A7A] hover:bg-white/60'
            }`}
          >
            <Cookie className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Politique des Cookies</span>
          </button>

          <button
            onClick={() => setTab('mineurs')}
            className={`px-3.5 py-2 rounded-full transition-all shrink-0 flex items-center gap-1.5 ${
              tab === 'mineurs' ? 'bg-[#CDBDF2] text-[#1B2A7A] shadow-sm' : 'text-[#4A5487] hover:text-[#1B2A7A] hover:bg-white/60'
            }`}
          >
            <Users className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Mineurs & Consentement</span>
          </button>

          <button
            onClick={() => setTab('mentions')}
            className={`px-3.5 py-2 rounded-full transition-all shrink-0 flex items-center gap-1.5 ${
              tab === 'mentions' ? 'bg-[#CDBDF2] text-[#1B2A7A] shadow-sm' : 'text-[#4A5487] hover:text-[#1B2A7A] hover:bg-white/60'
            }`}
          >
            <Info className="w-3.5 h-3.5" strokeWidth={2.5} />
            <span>Mentions Légales</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs text-[#4A5487] leading-relaxed pr-2 font-medium">
          {/* ═════════════════ 1. RGPD & CONFIDENTIALITÉ ═════════════════ */}
          {tab === 'rgpd' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#1B2A7A] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                    Politique de Protection des Données Personnelles (RGPD)
                  </h3>
                  <span className="badge-lavender text-[10px]">Règlement (UE) 2016/679</span>
                </div>
                <p>
                  Sihscool s'engage à respecter scrupuleusement la vie privée des apprenants, des enfants et des familles, conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés modifiée du 6 janvier 1978.
                </p>
              </div>

              {/* Principes clés */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#CDBDF2]">
                  <h4 className="font-extrabold text-xs text-[#1B2A7A] mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
                    1. Minimisation des Données (Art. 5.1.c)
                  </h4>
                  <p className="text-[11px] leading-normal">
                    Nous ne collectons que le strict minimum pédagogique : nom, prénom, code secret local à 6 chiffres pour l'enfant. <strong>Zéro adresse email pour les élèves</strong>, zéro géolocalisation et zéro donnée biométrique superflue.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FFFFFF] border border-[#CDBDF2]">
                  <h4 className="font-extrabold text-xs text-[#1B2A7A] mb-1 flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
                    2. Hébergement Souverain en UE
                  </h4>
                  <p className="text-[11px] leading-normal">
                    La base de données PostgreSQL de Sihscool est hébergée sur des serveurs sécurisés situés dans l'Union Européenne (Région eu-central-1 Francfort, Allemagne) avec chiffrement SSL/TLS en transit et au repos.
                  </p>
                </div>
              </div>

              {/* Données collectées par profil */}
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-3">
                <h4 className="font-extrabold text-xs text-[#1B2A7A] uppercase tracking-wide">
                  Tableau des Traitements et Données Collectées
                </h4>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-[#FFF6E3] border border-[#FFE15C]/60">
                    <strong className="text-[#1B2A7A]">Élèves Mineurs :</strong> Prénom, nom, code PIN d'accès local à 6 chiffres, avatar symbolique, assiduité aux cours (présence/absence), devoirs audio de récitation remis au professeur.
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFF6E3] border border-[#FFE15C]/60">
                    <strong className="text-[#1B2A7A]">Parents & Tuteurs :</strong> Prénom, nom, adresse e-mail de liaison administrative, numéro de téléphone de contact d'urgence, relevé des cotisations (montant, date, statut). Aucun numéro de carte bancaire n'est stocké sur nos serveurs.
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FFF6E3] border border-[#FFE15C]/60">
                    <strong className="text-[#1B2A7A]">Enseignants & Équipe :</strong> Identité professionnelle, adresse e-mail académique, journal des évaluations pédagogiques.
                  </div>
                </div>
              </div>

              {/* Durées de conservation */}
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">
                  Durées de Conservation (Article 5.1.e RGPD)
                </h4>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li><strong>Dossier scolaire actif :</strong> Conservé pendant toute la scolarité de l'élève au sein de l'établissement.</li>
                  <li><strong>Enregistrements audio des devoirs :</strong> Supprimés automatiquement en fin d'année scolaire ou sur simple demande parentale.</li>
                  <li><strong>Pièces comptables & Reçus de cotisation :</strong> Conservés 10 ans conformément aux obligations du Code de commerce (Article L. 123-22).</li>
                  <li><strong>Archivage administratif :</strong> 1 an après le départ de l'élève, puis anonymisation ou effacement irréversible.</li>
                </ul>
              </div>

              {/* Droits des utilisateurs & Actions directes */}
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-3">
                <h4 className="font-extrabold text-sm text-[#1B2A7A] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                  Vos Droits Légaux (Articles 15 à 22 du RGPD)
                </h4>
                <p className="text-[11px]">
                  Vous disposez des droits d'accès, de rectification, de portabilité, de limitation et d'effacement de vos données personnelles. Vous pouvez exercer vos droits directement ci-dessous ou par email à <strong className="text-[#1B2A7A]">dpo@sihscool.fr</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={exportDataJson}
                    className="btn-pill-sun !min-h-[44px] !text-xs !py-2 w-full shadow-sm"
                  >
                    <Download className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                    <span>Exporter mes données (JSON / Portabilité)</span>
                  </button>

                  <button
                    onClick={() => setDeleteRequested(true)}
                    className="btn-pill-white !min-h-[44px] !text-xs !py-2 w-full text-[#E5483D] border-[#E5483D]/40"
                  >
                    <Trash2 className="w-4 h-4 text-[#E5483D]" strokeWidth={2.5} />
                    <span>Demander l’effacement définitif</span>
                  </button>
                </div>

                {deleteRequested && (
                  <div className="p-3.5 rounded-2xl bg-[#FFF6E3] border-2 border-[#FFE15C] text-[#1B2A7A] text-xs flex items-center gap-3 animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-[#1B2A7A] shrink-0" strokeWidth={2.5} />
                    <p className="font-bold">
                      Votre demande d'effacement a été enregistrée. Conformément au RGPD, le traitement complet sera effectué sous 48 heures ouvrées par la direction.
                    </p>
                  </div>
                )}
              </div>

              {/* Réclamation CNIL */}
              <div className="p-3 rounded-2xl bg-[#FFF6E3] border border-[#CDBDF2] text-[11px] text-[#4A5487] flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-[#1B2A7A] shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  En cas de litige non résolu, vous pouvez introduire une réclamation auprès de l'autorité de contrôle française compétente : <strong>Commission Nationale de l'Informatique et des Libertés (CNIL)</strong>, 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 (site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="underline text-[#1B2A7A] font-bold">www.cnil.fr</a>).
                </div>
              </div>
            </div>
          )}

          {/* ═════════════════ 2. CONDITIONS GÉNÉRALES (CGU / CGV) ═════════════════ */}
          {tab === 'cgu' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h3 className="font-extrabold text-sm text-[#1B2A7A]">
                  Conditions Générales d'Utilisation & d'Inscription (CGU / CGV)
                </h3>
                <p>
                  Les présentes conditions régissent l'accès et l'utilisation de la plateforme numérique <strong>Sihscool</strong> ainsi que les modalités des cours d'arabe littéraire et de méthode Nourania.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">Article 1 : Format des Cours & Visioconférence Zoom (1h30 / semaine)</h4>
                <p className="text-[11px]">
                  Les enseignements dispensés par Sihscool s'effectuent à distance, en direct par visioconférence via le logiciel <strong>Zoom</strong>, sous la forme d'<strong>une séance hebdomadaire d'une heure et trente minutes (1h30 par semaine)</strong> par groupe de niveau. Chaque séance est sécurisée par un mot de passe unique et une salle d'attente (*Waiting Room*) filtrée par l'enseignant pour interdire tout accès non autorisé.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">Article 2 : Création et Accompagnement des Comptes</h4>
                <p className="text-[11px]">
                  Afin de garantir un environnement sécurisé et bienveillant, <strong>aucun compte ne peut être ouvert librement par un inconnu ou un mineur isolé</strong>. Les comptes familles et élèves sont ouverts exclusivement par la direction après instruction du dossier d'inscription. Les parents reçoivent un mot de passe temporaire à usage unique (OTP) qu'ils doivent obligatoirement renouveler dès la première connexion.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">Article 3 : Assiduité aux Séances Zoom et Rôle des Familles</h4>
                <p className="text-[11px]">
                  Les parents veillent à ce que leur enfant soit connecté à l'heure convenue à la séance Zoom hebdomadaire (1h30) dans un environnement calme favorisant la concentration. Toute absence prévisible doit être signalée au professeur à l'avance.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">Article 4 : Interdiction d'Enregistrement des Sessions Zoom</h4>
                <p className="text-[11px]">
                  Afin de garantir le respect absolu de la vie privée, de la voix et du droit à l'image des enfants mineurs participants et des enseignants, <strong>il est formellement interdit à toute personne (famille, élève ou tiers) d'enregistrer, capturer, photographier ou diffuser tout extrait vidéo ou sonore des séances Zoom</strong>. Tout manquement donnera lieu à l'exclusion immédiate sans remboursement.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">Article 5 : Propriété Intellectuelle (Code de la propriété intellectuelle)</h4>
                <p className="text-[11px]">
                  L'ensemble des contenus présents sur Sihscool (illustrations artistiques à la gouache, enregistrements audio de récitation, graphismes, textes, fiches d'exercices et logo) est protégé par les lois françaises et internationales relatives au droit d'auteur.
                </p>
              </div>
            </div>
          )}

          {/* ═════════════════ 3. REMBOURSEMENT & RÉTRACTATION ═════════════════ */}
          {tab === 'remboursement' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#1B2A7A] flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                    Droit de Rétractation & Politique de Remboursement
                  </h3>
                  <span className="badge-lavender text-[10px]">Code de la consommation</span>
                </div>
                <p>
                  En application des dispositions du Code de la consommation français régissant les ventes et souscriptions de prestations de services conclues à distance, vous disposez de garanties claires et transparentes.
                </p>
              </div>

              {/* Délai légal 14 jours */}
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">
                  1. Droit Légal de Rétractation de 14 Jours (Article L. 221-18)
                </h4>
                <p className="text-[11px]">
                  Vous avez le droit de vous rétracter du présent contrat sans donner de motif dans un délai de <strong>quatorze (14) jours calendaires</strong> à compter du jour de la souscription en ligne ou du paiement de votre cotisation.
                </p>
                <div className="p-2.5 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C] text-[11px] text-[#1B2A7A] font-bold">
                  Aucun frais ni pénalité ne sera appliqué en cas d'exercice régulier du droit de rétractation dans ce délai.
                </div>
              </div>

              {/* Exception exécution anticipée */}
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">
                  2. Exécution Anticipée des Cours (Article L. 221-28 1°)
                </h4>
                <p className="text-[11px]">
                  Si vous avez expressément demandé que les cours débutent avant l'expiration du délai de rétractation de 14 jours, vous conservez votre droit de rétractation mais le remboursement sera calculé au prorata exact des séances de visio Zoom de 1h30 effectivement dispensées jusqu'à la notification de votre rétractation.
                </p>
              </div>

              {/* Délais et modalité de remboursement */}
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">
                  3. Délais de Remboursement
                </h4>
                <p className="text-[11px]">
                  En cas de rétractation validée, Sihscool s'engage à vous rembourser la totalité des sommes versées dans un délai maximum de <strong>quatorze (14) jours</strong> à compter de la réception de votre demande, via le même moyen de paiement que celui utilisé lors de la transaction initiale.
                </p>
              </div>

              {/* Formulaire type de rétractation */}
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-[#1B2A7A]">
                    Formulaire Type de Rétractation (Article R. 221-1)
                  </h4>
                  <button
                    onClick={() => copyToClipboard(retractationFormTemplate, 'retractation')}
                    className="btn-pill-sun !min-h-[36px] !text-xs !py-1 !px-3 shadow-sm"
                  >
                    {copiedForm === 'retractation' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
                        <span>Copié dans le presse-papier !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
                        <span>Copier le formulaire</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-[#FFF6E3] border border-[#CDBDF2] rounded-2xl text-[10px] text-[#1B2A7A] font-mono whitespace-pre-wrap leading-tight overflow-x-auto">
                  {retractationFormTemplate}
                </pre>
              </div>

              {/* Médiation de la consommation */}
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">
                  Médiation de la Consommation (Article L. 612-1 du Code de la consommation)
                </h4>
                <p className="text-[11px]">
                  Conformément aux dispositions légales, tout consommateur a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d'un litige. Sihscool adhère au centre de médiation agréé :
                  <br />
                  <strong>Centre de la Médiation de la Consommation de Conciliateurs de Justice (CM2C)</strong>
                  <br />
                  Adresse : 49 Rue de Ponthieu, 75008 Paris · Site web : <a href="https://www.cm2c.net" target="_blank" rel="noopener noreferrer" className="underline text-[#1B2A7A] font-bold">www.cm2c.net</a>
                </p>
              </div>
            </div>
          )}

          {/* ═════════════════ 4. POLITIQUE DES COOKIES & TRACEURS ═════════════════ */}
          {tab === 'cookies' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#1B2A7A] flex items-center gap-2">
                    <Cookie className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                    Politique des Cookies & Traceurs
                  </h3>
                  <span className="badge-lavender text-[10px]">Directive ePrivacy & CNIL</span>
                </div>
                <p>
                  Sihscool applique une politique de transparence intégrale : <strong>nous n'exploitons aucun cookie de ciblage publicitaire ni aucun traceur commercial tiers</strong>.
                </p>
              </div>

              {/* Pourquoi pas de bandeau bloquant ? */}
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
                  Base Juridique de l'Exemption de Consentement Préalable
                </h4>
                <p className="text-[11px]">
                  En vertu de l'<strong>article 82 de la loi Informatique et Libertés</strong> et des lignes directrices de la CNIL (délibération n° 2020-091), les traceurs strictement nécessaires à la fourniture d'un service expressément demandé par l'utilisateur ne requièrent pas de consentement préalable bloquant.
                </p>
                <p className="text-[11px]">
                  C'est la raison pour laquelle vous n'êtes pas harcelé par des fenêtres intrusives vous demandant d'accepter des traceurs de publicité comportementale qui n'existent pas sur Sihscool.
                </p>
              </div>

              {/* Inventaire détaillé */}
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-3">
                <h4 className="font-extrabold text-xs text-[#1B2A7A] uppercase tracking-wide">
                  Inventaire Exhaustif des Témoins & Stockages Utilisés
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#CDBDF2] text-[#1B2A7A] font-bold">
                        <th className="py-2 pr-3">Clé de stockage</th>
                        <th className="py-2 pr-3">Finalité</th>
                        <th className="py-2 pr-3">Durée</th>
                        <th className="py-2">Statut CNIL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CDBDF2]/40">
                      <tr>
                        <td className="py-2 pr-3 font-mono font-bold text-[#1B2A7A]">sihscool_current_user_id</td>
                        <td className="py-2 pr-3">Maintien sécurisé de la session élève / parent</td>
                        <td className="py-2 pr-3">Session / Déconnexion</td>
                        <td className="py-2 text-[#2F5BD1] font-bold">Strictement Nécessaire</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-mono font-bold text-[#1B2A7A]">sihscool_cookie_consent</td>
                        <td className="py-2 pr-3">Mémorisation de l'accusé de lecture des règles</td>
                        <td className="py-2 pr-3">6 mois</td>
                        <td className="py-2 text-[#2F5BD1] font-bold">Strictement Nécessaire</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-mono font-bold text-[#1B2A7A]">sihscool_theme</td>
                        <td className="py-2 pr-3">Préférence d'affichage interface douce</td>
                        <td className="py-2 pr-3">Persistant</td>
                        <td className="py-2 text-[#2F5BD1] font-bold">Préférence Fonctionnelle</td>
                      </tr>
                      <tr>
                        <td className="py-2 pr-3 font-mono font-bold text-[#1B2A7A]">sihscool_data_cache</td>
                        <td className="py-2 pr-3">Accélération du chargement des devoirs d'arabe</td>
                        <td className="py-2 pr-3">Locale au navigateur</td>
                        <td className="py-2 text-[#2F5BD1] font-bold">Pédagogique / Hors-ligne</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Gestion dans le navigateur */}
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">Comment paramétrer vos cookies ?</h4>
                <p className="text-[11px]">
                  Vous pouvez configurer votre navigateur pour bloquer ou supprimer ces données locales à tout moment (Chrome, Safari, Firefox, Edge). Veuillez noter que la suppression du témoin d'authentification aura pour effet de vous déconnecter de votre espace famille ou élève.
                </p>
              </div>
            </div>
          )}

          {/* ═════════════════ 5. MINEURS & CONSENTEMENT PARENTAL ═════════════════ */}
          {tab === 'mineurs' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#1B2A7A] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#1B2A7A]" strokeWidth={2.5} />
                    Protection des Mineurs & Enregistrements Vocaux
                  </h3>
                  <span className="badge-lavender text-[10px]">Article 8 RGPD</span>
                </div>
                <p>
                  En France, la majorité numérique en matière de consentement est fixée à 15 ans. Sur Sihscool, la protection des mineurs fait l'objet de garanties de premier plan.
                </p>
              </div>

              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">1. Aucun Réseau Social ni Contact Externe</h4>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Aucun profil d'élève n'est public ni référencé sur les moteurs de recherche.</li>
                  <li>Aucune messagerie entre élèves n'existe : les élèves ne peuvent interagir qu'avec leur propre enseignant.</li>
                  <li>Aucune publicité n'est affichée aux enfants.</li>
                  <li>L'accès élève n'utilise aucune adresse email personnelle d'enfant.</li>
                </ul>
              </div>

              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">2. Encadrement des Enregistrements Vocaux</h4>
                <p className="text-[11px]">
                  Pour valider les règles de phonétique (méthode Nourania) et de Tajwîd, les élèves sont amenés à enregistrer de courtes phrases lues. Ces fichiers vocaux :
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Sont écoutés <strong>uniquement et exclusivement</strong> par le professeur de la classe.</li>
                  <li>Ne sont jamais partagés publiquement ni revendus.</li>
                  <li>Ne sont <strong>jamais utilisés</strong> pour alimenter ou entraîner des modèles d'intelligence artificielle commerciaux.</li>
                  <li>Peuvent être supprimés à tout moment sur demande du titulaire de l'autorité parentale.</li>
                </ul>
              </div>

              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-2">
                <h4 className="font-extrabold text-xs text-[#1B2A7A]">3. Protection Renforcée lors des Séances en Visioconférence Zoom</h4>
                <ul className="list-disc list-inside space-y-1 text-[11px]">
                  <li>Les cours ont lieu en direct sur Zoom (1h30 par semaine) en comité restreint d'élèves.</li>
                  <li>Chaque session est protégée par salle d'attente et mot de passe non public.</li>
                  <li>Les sessions Zoom ne font l'objet d'aucun enregistrement vidéo public.</li>
                  <li>Les enfants sont accompagnés avec bienveillance et douceur pour une prise de parole en toute confiance.</li>
                </ul>
              </div>

              {/* Formulaire d'autorisation parentale */}
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-xs text-[#1B2A7A]">
                    Formulaire Type d'Autorisation Parentale (Copiable)
                  </h4>
                  <button
                    onClick={() => copyToClipboard(parentalConsentTemplate, 'parental')}
                    className="btn-pill-sun !min-h-[36px] !text-xs !py-1 !px-3 shadow-sm"
                  >
                    {copiedForm === 'parental' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
                        <span>Copié dans le presse-papier !</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#1B2A7A]" strokeWidth={2.5} />
                        <span>Copier l’autorisation</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 bg-[#FFF6E3] border border-[#CDBDF2] rounded-2xl text-[10px] text-[#1B2A7A] font-mono whitespace-pre-wrap leading-tight overflow-x-auto">
                  {parentalConsentTemplate}
                </pre>
              </div>
            </div>
          )}

          {/* ═════════════════ 6. MENTIONS LÉGALES (LCEN) ═════════════════ */}
          {tab === 'mentions' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-3xl bg-[#FFFFFF] border-2 border-[#CDBDF2] space-y-3">
                <h3 className="font-extrabold text-sm text-[#1B2A7A]">
                  Mentions Légales (Loi pour la Confiance dans l'Économie Numérique - LCEN)
                </h3>
                <p className="text-[11px]">
                  Conformément aux dispositions de l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique, il est précisé aux utilisateurs l'identité des différents intervenants dans le cadre de sa réalisation et de son suivi :
                </p>

                <div className="space-y-2 text-[11px]">
                  <div className="p-3 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C]/60 space-y-1">
                    <strong className="text-[#1B2A7A] block">1. Éditeur du Site :</strong>
                    <p>
                      <strong>Sihscool</strong> · Institut d’Enseignement de la Langue Arabe et de la Méthode Nourania.<br />
                      Structure d'enseignement et d'éveil bienveillant pour enfants et familles.<br />
                      Adresse administrative : 12 rue de la Paix, 75002 Paris, France.<br />
                      Courriel de contact : <span className="text-[#1B2A7A] font-bold">direction@sihscool.fr</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C]/60 space-y-1">
                    <strong className="text-[#1B2A7A] block">2. Directeur de la Publication :</strong>
                    <p>
                      Cheikh Mohammed Al-Mansour, Directeur Pédagogique de l'Institut Sihscool.
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C]/60 space-y-1">
                    <strong className="text-[#1B2A7A] block">3. Hébergement de l'Application et de la Base de Données :</strong>
                    <p>
                      <strong>Supabase Cloud Inc.</strong><br />
                      Hébergement sécurisé au sein de l'Union Européenne (Datacenter AWS Frankfurt, région eu-central-1, Allemagne).<br />
                      Conformité certifiée : SOC 2 Type II, ISO 27001, RGPD.<br />
                      Site web : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline text-[#1B2A7A] font-bold">https://supabase.com</a>
                    </p>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FFF6E3] border border-[#FFE15C]/60 space-y-1">
                    <strong className="text-[#1B2A7A] block">4. Délégué à la Protection des Données (DPO) :</strong>
                    <p>
                      Contact DPO officiel : <span className="text-[#1B2A7A] font-bold">dpo@sihscool.fr</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
