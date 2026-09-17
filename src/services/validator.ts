import type { ValidationError } from '../types/validation';
import { sanitizeFilename } from './filenameSanitizer';

export interface ValidationResult {
  errors: ValidationError[];
  sanitizedNames: string[];
  canExport: boolean;
}

export function validateNaming(
  splitCount: number,
  names: string[],
  autoSequenceDuplicates: boolean = false
): ValidationResult {
  const errors: ValidationError[] = [];
  const processedNames: string[] = [];

  // 1. Check count mismatch
  if (splitCount <= 0) {
    errors.push({
      type: 'COUNT_MISMATCH',
      message: 'PDFが分割されていません。分割位置を指定してください。'
    });
  } else if (names.length !== splitCount) {
    errors.push({
      type: 'COUNT_MISMATCH',
      message: `PDFの分割数（${splitCount}件）とファイル名の数（${names.length}件）が一致していません。`
    });
  }

  // 2. Process names, check empty & invalid
  const seenMap = new Map<string, number>();

  for (let i = 0; i < names.length; i++) {
    const rawName = names[i] || '';
    const cleanName = sanitizeFilename(rawName);

    if (!rawName.trim()) {
      errors.push({
        type: 'EMPTY_NAME',
        message: `No.${i + 1} のファイル名が空欄です。`,
        index: i
      });
    }

    processedNames.push(cleanName);
    seenMap.set(cleanName, (seenMap.get(cleanName) || 0) + 1);
  }

  // 3. Handle duplicates
  const finalNames: string[] = [];
  const countTracker = new Map<string, number>();

  for (let i = 0; i < processedNames.length; i++) {
    const name = processedNames[i];
    const totalOccurrences = seenMap.get(name) || 0;

    if (totalOccurrences > 1) {
      if (!autoSequenceDuplicates) {
        errors.push({
          type: 'DUPLICATE_NAME',
          message: `ファイル名「${name}」が重複しています。`,
          index: i
        });
        finalNames.push(name);
      } else {
        const currentCount = (countTracker.get(name) || 0) + 1;
        countTracker.set(name, currentCount);

        if (currentCount === 1) {
          finalNames.push(name);
        } else {
          // Append _2, _3 etc. before .pdf
          const base = name.replace(/\.pdf$/i, '');
          const newName = `${base}_${currentCount}.pdf`;
          finalNames.push(newName);
        }
      }
    } else {
      finalNames.push(name);
    }
  }

  const canExport = splitCount > 0 && errors.length === 0;

  return {
    errors,
    sanitizedNames: finalNames,
    canExport
  };
}
