export interface SpreadsheetRow {
  [key: string]: string | number | boolean | null | undefined;
}

export interface SpreadsheetData {
  sheets: string[];
  currentSheet: string;
  headers: string[];
  rows: SpreadsheetRow[];
  encoding?: string;
}
