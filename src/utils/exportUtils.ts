import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CollaboratorWithStats } from '../types';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

interface ExportOptions {
  filename?: string;
  format: ExportFormat;
  includeTimestamp?: boolean;
}

// Helper to format data for export
function formatCollaboratorData(collaborators: CollaboratorWithStats[]) {
  return collaborators.map(collab => ({
    'Nome': collab.name,
    'Email': collab.email,
    'CPF': collab.cpf,
    'Cargo': collab.role,
    'Time': collab.team?.name || '-',
    'XP Total': collab.totalXP,
    'Nível': collab.level,
    'Sequência (dias)': collab.streakDays,
    'Cursos Atribuídos': collab.coursesAssigned,
    'Cursos Concluídos': collab.coursesCompleted,
    'Taxa de Conclusão (%)': collab.completionRate.toFixed(1),
    'Cursos Atrasados': collab.coursesLate,
    'Status': collab.coursesLate === 0 ? 'Em dia' : `${collab.coursesLate} atrasado(s)`,
  }));
}

// Export to CSV
export function exportToCSV(
  collaborators: CollaboratorWithStats[],
  options: Omit<ExportOptions, 'format'> = {}
) {
  const data = formatCollaboratorData(collaborators);

  // Convert to CSV string
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header as keyof typeof row];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value);
        return stringValue.includes(',') ? `"${stringValue}"` : stringValue;
      }).join(',')
    )
  ];

  const csvContent = csvRows.join('\n');

  // Add BOM for UTF-8 encoding (Excel compatibility)
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });

  const filename = generateFilename('colaboradores', 'csv', options);
  downloadBlob(blob, filename);
}

// Export to Excel
export function exportToExcel(
  collaborators: CollaboratorWithStats[],
  options: Omit<ExportOptions, 'format'> = {}
) {
  const data = formatCollaboratorData(collaborators);

  // Create workbook
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Colaboradores');

  // Set column widths
  const columnWidths = [
    { wch: 25 }, // Nome
    { wch: 30 }, // Email
    { wch: 15 }, // CPF
    { wch: 20 }, // Cargo
    { wch: 20 }, // Time
    { wch: 10 }, // XP Total
    { wch: 8 },  // Nível
    { wch: 15 }, // Sequência
    { wch: 18 }, // Cursos Atribuídos
    { wch: 18 }, // Cursos Concluídos
    { wch: 20 }, // Taxa de Conclusão
    { wch: 18 }, // Cursos Atrasados
    { wch: 20 }, // Status
  ];
  worksheet['!cols'] = columnWidths;

  const filename = generateFilename('colaboradores', 'xlsx', options);
  XLSX.writeFile(workbook, filename);
}

// Export to PDF
export function exportToPDF(
  collaborators: CollaboratorWithStats[],
  options: Omit<ExportOptions, 'format'> = {}
) {
  const doc = new jsPDF('landscape');

  // Add title
  doc.setFontSize(18);
  doc.text('Relatório de Colaboradores', 14, 20);

  // Add metadata
  doc.setFontSize(10);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 28);
  doc.text(`Total de colaboradores: ${collaborators.length}`, 14, 34);

  // Prepare table data
  const tableData = collaborators.map(collab => [
    collab.name,
    collab.role,
    collab.team?.name || '-',
    collab.totalXP.toString(),
    collab.level.toString(),
    `${collab.completionRate.toFixed(1)}%`,
    collab.coursesLate.toString(),
    collab.coursesLate === 0 ? 'Em dia' : 'Atrasado',
  ]);

  // Add table
  autoTable(doc, {
    startY: 40,
    head: [['Nome', 'Cargo', 'Time', 'XP', 'Nível', 'Conclusão', 'Atrasados', 'Status']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [19, 236, 200], // Primary color #13ecc8
      textColor: [16, 34, 31],   // Dark text
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 40 },  // Nome
      1: { cellWidth: 35 },  // Cargo
      2: { cellWidth: 35 },  // Time
      3: { cellWidth: 20 },  // XP
      4: { cellWidth: 15 },  // Nível
      5: { cellWidth: 25 },  // Conclusão
      6: { cellWidth: 22 },  // Atrasados
      7: { cellWidth: 25 },  // Status
    },
  });

  // Add footer with page numbers
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() - 30,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  const filename = generateFilename('colaboradores', 'pdf', options);
  doc.save(filename);
}

// Main export function
export function exportCollaborators(
  collaborators: CollaboratorWithStats[],
  options: ExportOptions
) {
  switch (options.format) {
    case 'csv':
      exportToCSV(collaborators, options);
      break;
    case 'xlsx':
      exportToExcel(collaborators, options);
      break;
    case 'pdf':
      exportToPDF(collaborators, options);
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
}

// Helper functions
function generateFilename(
  base: string,
  extension: string,
  options: { filename?: string; includeTimestamp?: boolean }
): string {
  if (options.filename) {
    return options.filename.endsWith(`.${extension}`)
      ? options.filename
      : `${options.filename}.${extension}`;
  }

  const timestamp = options.includeTimestamp !== false
    ? `_${new Date().toISOString().split('T')[0]}`
    : '';

  return `${base}${timestamp}.${extension}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
