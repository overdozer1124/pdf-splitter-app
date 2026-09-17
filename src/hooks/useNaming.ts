import { useState, useMemo } from 'react';
import type { NamingMode, SequenceConfig, SpreadsheetNamingConfig } from '../types/naming';
import type { SpreadsheetData, SpreadsheetRow } from '../types/spreadsheet';
import type { SplitGroup } from '../types/pdf';
import {
  generateSequenceNames,
  generateSpreadsheetNames
} from '../services/filenameGenerator';
import { parseSpreadsheet } from '../services/spreadsheetReader';

export function useNaming(splitGroups: SplitGroup[]) {
  const [namingMode, setNamingMode] = useState<NamingMode>('sequence');

  // Mode A: Sequence
  const [sequenceConfig, setSequenceConfig] = useState<SequenceConfig>({
    prefix: '個人票',
    startNumber: 1,
    digits: 2,
    separator: '_'
  });

  // Mode B: Manual
  const [manualNames, setManualNames] = useState<string[]>([]);

  // Mode C: Spreadsheet
  const [spreadsheetData, setSpreadsheetData] = useState<SpreadsheetData | null>(null);
  const [spreadsheetConfig, setSpreadsheetConfig] = useState<SpreadsheetNamingConfig>({
    sheetName: '',
    headerRowIndex: 0,
    mode: 'column',
    selectedColumn: '',
    template: '{学年}年_{組}組_{出席番号}_{氏名}',
    zeroPadColumns: {}
  });

  const handleManualNameChange = (index: number, newName: string) => {
    const updated = [...manualNames];
    while (updated.length < splitGroups.length) {
      updated.push('');
    }
    updated[index] = newName;
    setManualNames(updated);
  };

  const handleImportSpreadsheet = async (file: File, encoding: string = 'UTF-8') => {
    try {
      const buffer = await file.arrayBuffer();
      const parsed = parseSpreadsheet(buffer, encoding);
      setSpreadsheetData(parsed);

      setSpreadsheetConfig((prev) => ({
        ...prev,
        sheetName: parsed.currentSheet,
        selectedColumn: parsed.headers[0] || ''
      }));
    } catch (err: any) {
      alert(`名簿ファイルを読み込めませんでした: ${err?.message || '形式を確認してください'}`);
    }
  };

  const handleSelectSheet = (sheetName: string) => {
    if (!spreadsheetData) return;
    setSpreadsheetConfig((prev) => ({
      ...prev,
      sheetName
    }));
  };

  const handleReorderRows = (newRows: SpreadsheetRow[]) => {
    if (!spreadsheetData) return;
    setSpreadsheetData({
      ...spreadsheetData,
      rows: newRows
    });
  };

  // Generate output filenames based on active mode
  const generatedNames = useMemo<string[]>(() => {
    const count = splitGroups.length;

    switch (namingMode) {
      case 'sequence':
        return generateSequenceNames(count, sequenceConfig);

      case 'manual': {
        const names: string[] = [];
        for (let i = 0; i < count; i++) {
          const m = manualNames[i];
          names.push(m && m.trim() ? m.trim() : splitGroups[i]?.fileName || `split_${i + 1}.pdf`);
        }
        return names;
      }

      case 'spreadsheet': {
        if (!spreadsheetData || spreadsheetData.rows.length === 0) {
          return splitGroups.map((g) => g.fileName);
        }
        return generateSpreadsheetNames(spreadsheetData.rows, spreadsheetConfig);
      }

      default:
        return splitGroups.map((g) => g.fileName);
    }
  }, [namingMode, splitGroups, sequenceConfig, manualNames, spreadsheetData, spreadsheetConfig]);

  return {
    namingMode,
    setNamingMode,
    sequenceConfig,
    setSequenceConfig,
    manualNames,
    handleManualNameChange,
    spreadsheetData,
    spreadsheetConfig,
    setSpreadsheetConfig,
    handleImportSpreadsheet,
    handleSelectSheet,
    handleReorderRows,
    generatedNames
  };
}
