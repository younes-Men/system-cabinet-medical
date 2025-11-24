import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import API_URL from '../config/api';

async function exportLPatient() {
  try {
    const response = await fetch(`${API_URL}/patients`);

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des données');
    }

    // Convertir en JSON
    const jsonData = await response.json();
    
    // Vérifier si les données existent
    const flatData = (jsonData || []).map((item) => ({
      Nom: item.nom || '',
      Prénom: item.prenom || '',
      Téléphone: item.telephone || '',
      'Date de naissance': item.date_naissance 
        ? new Date(item.date_naissance).toLocaleDateString('fr-FR') 
        : '',
      Adresse: item.adresse || '',
      CIN: item.cin || '',
    }));

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Patients');

    // Add headers avec style
    worksheet.columns = [
      { header: 'Nom', key: 'Nom', width: 25 },
      { header: 'Prénom', key: 'Prénom', width: 25 },
      { header: 'Téléphone', key: 'Téléphone', width: 18 },
      { header: 'Date de naissance', key: 'Date de naissance', width: 20 },
      { header: 'Adresse', key: 'Adresse', width: 50 },
      { header: 'CIN', key: 'CIN', width: 18 },
    ];

    // Style pour les en-têtes
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { ...worksheet.getRow(1).font, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    flatData.forEach((item) => worksheet.addRow(item));

    // Générer le nom du fichier avec la date
    const date = new Date().toISOString().split('T')[0];
    const fileName = `patients_export_${date}.xlsx`;

    // Generate Excel file buffer
    const excelBuffer = await workbook.xlsx.writeBuffer();

    // Create blob and download
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    FileSaver.saveAs(blob, fileName);
    
    alert('Export Excel réussi ! Le fichier a été téléchargé.');
  } catch (error) {
    console.error('Export failed:', error);
    alert('Erreur lors de l\'export Excel: ' + error.message);
  }
}

export default exportLPatient;
