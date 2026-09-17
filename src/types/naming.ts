export type NamingMode = 'sequence' | 'manual' | 'spreadsheet' | 'bookmark';

export interface SequenceConfig {
  prefix: string;
  startNumber: number;
  digits: number; // 1 -> 1, 2 -> 01, 3 -> 001, 4 -> 0001
  separator: string; // '_', '-', ''
}

export interface SpreadsheetNamingConfig {
  sheetName: string;
  headerRowIndex: number;
  mode: 'column' | 'template';
  selectedColumn: string;
  template: string; // e.g. "{学年}年_{組}組_{出席番号}_{氏名}"
  zeroPadColumns: Record<string, number>; // column name -> digit count (e.g. 出席番号: 2)
}
