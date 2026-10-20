import jsPDF from 'jspdf';
import { Paiement, User, Groupe } from '../types';

export const generatePdfReceipt = (
  paiement: Paiement,
  eleve: User,
  parent: User,
  groupe?: Groupe
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Soft pastel sky background
  doc.setFillColor(169, 216, 245);
  doc.rect(0, 0, 210, 297, 'F');

  // Main Cream Cloud Card container
  doc.setFillColor(255, 246, 227); // #FFF6E3
  doc.roundedRect(15, 15, 180, 267, 10, 10, 'F');

  // Top Sun Yellow Ribbon
  doc.setFillColor(255, 225, 92); // #FFE15C
  doc.roundedRect(15, 15, 180, 6, 3, 3, 'F');

  // School Brand Header
  doc.setTextColor(27, 42, 122); // Deep Navy #1B2A7A
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('SIHSCOOL', 25, 36);

  // Soft red Arabic letter
  doc.setTextColor(229, 72, 61); // Soft Red #E5483D
  doc.setFontSize(24);
  doc.text('(أ)', 82, 36);

  doc.setFontSize(10);
  doc.setTextColor(74, 84, 135); // #4A5487
  doc.setFont('helvetica', 'normal');
  doc.text('École d’Arabe & Méthode Nourania · Institut Pédagogique', 25, 43);
  doc.text('Suivi scolaire pour enfants et familles · Année 2026-2027', 25, 48);

  // Receipt Pill Badge (Lavender #CDBDF2)
  doc.setFillColor(205, 189, 242);
  doc.roundedRect(125, 26, 60, 12, 6, 6, 'F');
  doc.setTextColor(27, 42, 122);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('REÇU OFFICIEL DE COTISATION', 128, 33.5);

  // Divider line in soft lavender
  doc.setDrawColor(205, 189, 242);
  doc.setLineWidth(0.8);
  doc.line(25, 55, 185, 55);

  // Metadata
  doc.setTextColor(74, 84, 135);
  doc.setFontSize(9);
  doc.text('Numéro de référence :', 25, 65);
  doc.text('Date de règlement :', 25, 72);
  doc.text('Mode de paiement :', 25, 79);

  doc.setTextColor(27, 42, 122);
  doc.setFont('helvetica', 'bold');
  doc.text(paiement.recu_numero || `REC-${Date.now().toString().slice(-6)}`, 70, 65);
  doc.text(paiement.paye_le || new Date().toISOString().split('T')[0], 70, 72);
  doc.text(paiement.moyen_paiement || 'Carte bancaire / Virement', 70, 79);

  // Family and Student White Pill Cards
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(25, 90, 75, 44, 6, 6, 'F');
  doc.roundedRect(110, 90, 75, 44, 6, 6, 'F');

  // Responsible Parent Block
  doc.setTextColor(27, 42, 122);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Parent Responsable', 32, 100);
  doc.setFontSize(10);
  doc.text(`${parent.prenom} ${parent.nom}`, 32, 108);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(74, 84, 135);
  doc.setFontSize(8.5);
  doc.text(`Email : ${parent.email || 'famille@sihscool.fr'}`, 32, 116);
  doc.text(`Tél : ${parent.telephone || '06 -- -- -- --'}`, 32, 123);

  // Student Learner Block
  doc.setTextColor(27, 42, 122);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Élève Apprenant(e)', 117, 100);
  doc.setFontSize(10);
  doc.text(`${eleve.prenom} ${eleve.nom}`, 117, 108);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(74, 84, 135);
  doc.setFontSize(8.5);
  doc.text(`Groupe : ${groupe ? groupe.nom : 'Cours Nourania & Arabe'}`, 117, 116);
  doc.text(`Créneau : ${groupe ? groupe.creneau : 'Hebdomadaire'}`, 117, 123);

  // Tuition Table Header in Lavender Pill
  doc.setFillColor(205, 189, 242);
  doc.roundedRect(25, 145, 160, 10, 3, 3, 'F');
  doc.setTextColor(27, 42, 122);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('DÉSIGNATION DES ENSEIGNEMENTS', 32, 151.5);
  doc.text('PÉRIODE', 115, 151.5);
  doc.text('MONTANT', 155, 151.5);

  // Row
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 122);
  doc.setFontSize(10);
  doc.text('Cotisation mensuelle d’apprentissage', 32, 165);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(74, 84, 135);
  doc.setFontSize(8);
  doc.text('Méthode Nourania, cours d’arabe littéraire & suivi personnalisé', 32, 171);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(27, 42, 122);
  doc.setFontSize(10);
  doc.text(paiement.mois, 115, 166);
  doc.text(`${paiement.montant.toFixed(2)} €`, 155, 166);

  // Line
  doc.setDrawColor(205, 189, 242);
  doc.line(25, 180, 185, 180);

  // Total Yellow Card
  doc.setFillColor(255, 225, 92);
  doc.roundedRect(105, 188, 80, 24, 6, 6, 'F');
  doc.setTextColor(74, 84, 135);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Total réglé TTC :', 112, 198);
  doc.setTextColor(27, 42, 122);
  doc.setFontSize(16);
  doc.text(`${paiement.montant.toFixed(2)} €`, 112, 206);

  // Stamp "ACQUITTÉ"
  doc.setDrawColor(27, 42, 122);
  doc.setLineWidth(1.2);
  doc.roundedRect(30, 190, 56, 20, 5, 5, 'S');
  doc.setTextColor(27, 42, 122);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('✓ ACQUITTÉ', 39, 201);
  doc.setFontSize(7.5);
  doc.text('INSTITUT SIHSCOOL', 37, 206);

  // Footer
  doc.setTextColor(74, 84, 135);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Sihscool · Association pour l’enseignement bienveillant de la langue arabe.', 25, 242);
  doc.text('Document certifié conforme valant justificatif de paiement et reçu d’acompte.', 25, 247);
  doc.text('Contact : direction@sihscool.fr · https://sihscool.fr', 25, 252);

  const filename = `Recu_Sihscool_${eleve.prenom}_${paiement.mois.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
};
