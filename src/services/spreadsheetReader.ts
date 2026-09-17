import * as XLSX from 'xlsx';
import type { SpreadsheetData, SpreadsheetRow } from '../types/spreadsheet';

/**
 * Parse an Excel or CSV file from ArrayBuffer
 */
export function parseSpreadsheet(
  buffer: ArrayBuffer,
  encoding: string = 'UTF-8'
): SpreadsheetData {
  let workbook: XLSX.WorkBook;

  if (encoding === 'Shift_JIS') {
    const decoder = new TextDecoder('shift-jis');
    const csvText = decoder.decode(buffer);
    workbook = XLSX.read(csvText, { type: 'string' });
  } else {
    workbook = XLSX.read(buffer, { type: 'array' });
  }

  const sheetNames = workbook.SheetNames || [];
  if (sheetNames.length === 0) {
    throw new Error('シートが見つかりませんでした。');
  }

  const currentSheet = sheetNames[0];
  const sheetData = getSheetData(workbook, currentSheet);

  return {
    sheets: sheetNames,
    currentSheet,
    headers: sheetData.headers,
    rows: sheetData.rows,
    encoding
  };
}

/**
 * Extract headers and rows for a specific sheet name
 */
export function getSheetData(
  workbook: XLSX.WorkBook,
  sheetName: string,
  headerRowIndex: number = 0
): { headers: string[]; rows: SpreadsheetRow[] } {
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    return { headers: [], rows: [] };
  }

  // Convert sheet to 2D array of raw values
  const matrix = XLSX.utils.sheet_to_json<any[]>(worksheet, {
    header: 1,
    defval: ''
  });

  if (matrix.length === 0 || headerRowIndex >= matrix.length) {
    return { headers: [], rows: [] };
  }

  // Get headers from specified header row index
  const rawHeaders = matrix[headerRowIndex] || [];
  const headers: string[] = rawHeaders.map((h: any, idx: number) => {
    const val = String(h).trim();
    return val ? val : `列_${idx + 1}`;
  });

  // Extract data rows after header row
  const rows: SpreadsheetRow[] = [];
  for (let r = headerRowIndex + 1; r < matrix.length; r++) {
    const rowValues = matrix[r];
    if (!rowValues || rowValues.every((val: any) => val === '' || val === null || val === undefined)) {
      continue; // skip completely empty rows
    }

    const rowObj: SpreadsheetRow = {};
    headers.forEach((header, colIdx) => {
      rowObj[header] = rowValues[colIdx] !== undefined ? rowValues[colIdx] : '';
    });
    rows.push(rowObj);
  }

  return { headers, rows };
}
