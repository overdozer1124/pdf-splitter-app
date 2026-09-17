import { useState, useMemo, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import type { NamingMode, SequenceConfig, SpreadsheetNamingConfig } from '../types/naming';
import type { SpreadsheetData, SpreadsheetRow } from '../types/spreadsheet';
import type { SplitGroup } from '../types/pdf';
import {
  generateSequenceNames,
  generateSpreadsheetNames
} from '../services/filenameGenerator';
import { sanitizeFilename } from '../services/filenameSanitizer';
import { parseSpreadsheet } from '../services/spreadsheetReader';
import { extractBookmarks } from '../services/pdfReader';

export function useNaming(splitGroups: SplitGroup[], pdfDocProxy: pdfjsLib.PDFDocumentProxy | null) {
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

  // Mode D: Bookmark
  const [bookmarks, setBookmarks] = useState<Array<{ title: string; page: number }>>([]);
  const [isExtractingBookmarks, setIsExtractingBookmarks] = useState(false);

  useEffect(() => {
    if (pdfDocProxy) {
      setIsExtractingBookmarks(true);
      extractBookmarks(pdfDocProxy)
        .then((b) => setBookmarks(b))
        .catch(() => setBookmarks([]))
        .finally(() => setIsExtractingBookmarks(false));
    } else {
      setBookmarks([]);
    }
  }, [pdfDocProxy]);

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

      case 'bookmark': {
        return splitGroups.map((group, idx) => {
          // Find the last bookmark that appears at or before the group's start page
          // (assuming bookmarks are sorted by page ascending)
          let matchTitle = '';
          for (let i = bookmarks.length - 1; i >= 0; i--) {
            if (bookmarks[i].page <= group.startPage) {
              matchTitle = bookmarks[i].title;
              break;
            }
          }
          if (matchTitle && matchTitle.trim()) {
            return sanitizeFilename(matchTitle.trim());
          }
          return `split_${idx + 1}.pdf`;
        });
      }

      default:
        return splitGroups.map((g) => g.fileName);
    }
  }, [namingMode, splitGroups, sequenceConfig, manualNames, spreadsheetData, spreadsheetConfig, bookmarks]);


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
    generatedNames,
    bookmarks,
    isExtractingBookmarks
  };
}
