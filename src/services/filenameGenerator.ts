import type { SequenceConfig, SpreadsheetNamingConfig } from '../types/naming';
import type { SpreadsheetRow } from '../types/spreadsheet';
import { sanitizeFilename } from './filenameSanitizer';

/**
 * Format a number with leading zeroes
 */
export function padZero(num: number | string, digits: number): string {
  const str = String(num);
  if (digits <= 1) return str;
  return str.padStart(digits, '0');
}

/**
 * Generate sequence filenames (e.g., 個人票_001.pdf)
 */
export function generateSequenceNames(
  count: number,
  config: SequenceConfig
): string[] {
  const names: string[] = [];
  const prefix = config.prefix.trim();

  for (let i = 0; i < count; i++) {
    const num = config.startNumber + i;
    const formattedNum = padZero(num, config.digits);
    const rawName = prefix
      ? `${prefix}${config.separator}${formattedNum}`
      : formattedNum;
    names.push(sanitizeFilename(rawName));
  }

  return names;
}

/**
 * Replace placeholders in template like "{学年}年_{組}組_{出席番号}_{氏名}" with row values
 */
export function fillTemplate(
  template: string,
  row: SpreadsheetRow,
  zeroPadColumns: Record<string, number> = {}
): string {
  if (!template) return '';

  return template.replace(/\{([^}]+)\}/g, (_, colName: string) => {
    const rawVal = row[colName];
    if (rawVal === undefined || rawVal === null) return '';

    const digits = zeroPadColumns[colName];
    if (digits && digits > 1 && (typeof rawVal === 'number' || !isNaN(Number(rawVal)))) {
      return padZero(String(rawVal), digits);
    }

    return String(rawVal);
  });
}

/**
 * Generate filenames from spreadsheet rows (column mode or template mode)
 */
export function generateSpreadsheetNames(
  rows: SpreadsheetRow[],
  config: SpreadsheetNamingConfig
): string[] {
  return rows.map((row, idx) => {
    let rawName = '';

    if (config.mode === 'column') {
      const colVal = row[config.selectedColumn];
      rawName = colVal !== undefined && colVal !== null ? String(colVal) : `split_${idx + 1}`;
    } else {
      rawName = fillTemplate(config.template, row, config.zeroPadColumns);
      if (!rawName.trim()) {
        rawName = `split_${idx + 1}`;
      }
    }

    return sanitizeFilename(rawName);
  });
}
