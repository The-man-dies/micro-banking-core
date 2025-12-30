// utils/reportGenerator.ts
import type { ReportConfig, MonthlySummary } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export async function generateMonthlyReport(
  monthlyData: MonthlySummary[],
  config: ReportConfig
) {
  const filteredData = monthlyData.filter(entry => {
    const entryDate = new Date(`2024-${entry.mois}-01`);
    const startDate = new Date(config.dateDebut);
    const endDate = new Date(config.dateFin);
    return entryDate >= startDate && entryDate <= endDate;
  });

  return {
    type: 'mensuel',
    data: filteredData,
    totals: {
      totalDepots: filteredData.reduce((sum, m) => sum + m.totalDepots, 0),
      totalRetraits: filteredData.reduce((sum, m) => sum + m.totalRetraits, 0),
      totalCommission: filteredData.reduce((sum, m) => sum + m.commission, 0),
    },
    config,
  };
}

export async function generateDailyReport(
  entries: any[],
  config: ReportConfig
) {
  const filteredEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date);
    const startDate = new Date(config.dateDebut);
    const endDate = new Date(config.dateFin);
    return entryDate >= startDate && entryDate <= endDate;
  });

  return {
    type: 'quotidien',
    data: filteredEntries,
    totals: {
      totalDebit: filteredEntries.reduce((sum, e) => sum + e.debit, 0),
      totalCredit: filteredEntries.reduce((sum, e) => sum + e.credit, 0),
    },
    config,
  };
}

export async function exportReport(reportData: any, format: 'pdf' | 'excel' | 'csv'): Promise<string> {
  switch (format) {
    case 'pdf':
      return exportToPDF(reportData);
    case 'excel':
      return exportToExcel(reportData);
    case 'csv':
      return exportToCSV(reportData);
    default:
      throw new Error('Format non supporté');
  }
}

async function exportToPDF(reportData: any): Promise<string> {
  const doc = new jsPDF();
  
  // En-tête
  doc.setFontSize(20);
  doc.text(`Rapport ${reportData.type} - Micro Banking`, 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Période: ${reportData.config.dateDebut} au ${reportData.config.dateFin}`, 20, 30);
  doc.text(`Généré le: ${new Date().toLocaleDateString()}`, 20, 36);
  
  // Tableau des données
  if (reportData.type === 'mensuel') {
    const tableData = reportData.data.map((item: any) => [
      item.mois,
      `${item.totalDepots.toLocaleString()} FCFA`,
      `${item.totalRetraits.toLocaleString()} FCFA`,
      `${item.commission.toLocaleString()} FCFA`,
      `${item.solde.toLocaleString()} FCFA`,
    ]);
    
    (doc as any).autoTable({
      startY: 45,
      head: [['Mois', 'Dépôts', 'Retraits', 'Commissions', 'Solde']],
      body: tableData,
    });
  }
  
  // Totaux
  const finalY = (doc as any).lastAutoTable?.finalY || 80;
  doc.setFontSize(14);
  doc.text('TOTAUX', 20, finalY + 10);
  
  if (reportData.type === 'mensuel') {
    doc.setFontSize(12);
    doc.text(`Total Dépôts: ${reportData.totals.totalDepots.toLocaleString()} FCFA`, 20, finalY + 20);
    doc.text(`Total Retraits: ${reportData.totals.totalRetraits.toLocaleString()} FCFA`, 20, finalY + 28);
    doc.text(`Total Commissions: ${reportData.totals.totalCommission.toLocaleString()} FCFA`, 20, finalY + 36);
  }
  
  const filename = `rapport_${reportData.type}_${Date.now()}.pdf`;
  doc.save(filename);
  
  return filename;
}

async function exportToExcel(reportData: any): Promise<string> {
  const wb = XLSX.utils.book_new();
  
  let ws;
  if (reportData.type === 'mensuel') {
    const data = [
      ['Mois', 'Dépôts (FCFA)', 'Retraits (FCFA)', 'Commissions (FCFA)', 'Solde (FCFA)'],
      ...reportData.data.map((item: any) => [
        item.mois,
        item.totalDepots,
        item.totalRetraits,
        item.commission,
        item.solde,
      ]),
      [],
      ['TOTAUX', reportData.totals.totalDepots, reportData.totals.totalRetraits, reportData.totals.totalCommission, ''],
    ];
    
    ws = XLSX.utils.aoa_to_sheet(data);
  }
  
  if (ws) {
    XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
    const filename = `rapport_${reportData.type}_${Date.now()}.xlsx`;
    XLSX.writeFile(wb, filename);
    return filename;
  }
  
  throw new Error('Erreur lors de la création du fichier Excel');
}

async function exportToCSV(reportData: any): Promise<string> {
  let csvContent = '';
  
  if (reportData.type === 'mensuel') {
    csvContent = 'Mois,Dépôts (FCFA),Retraits (FCFA),Commissions (FCFA),Solde (FCFA)\n';
    reportData.data.forEach((item: any) => {
      csvContent += `${item.mois},${item.totalDepots},${item.totalRetraits},${item.commission},${item.solde}\n`;
    });
  }
  
  const filename = `rapport_${reportData.type}_${Date.now()}.csv`;
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
  
  return filename;
}