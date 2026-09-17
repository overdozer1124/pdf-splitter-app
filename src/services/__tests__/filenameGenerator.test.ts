import { describe, it, expect } from 'vitest';
import {
  generateSequenceNames,
  generateSpreadsheetNames,
  fillTemplate,
  padZero
} from '../filenameGenerator';

describe('filenameGenerator', () => {
  describe('padZero', () => {
    it('should pad numbers with leading zeroes according to digits', () => {
      expect(padZero(1, 1)).toBe('1');
      expect(padZero(1, 2)).toBe('01');
      expect(padZero(1, 3)).toBe('001');
      expect(padZero(42, 4)).toBe('0042');
    });
  });

  describe('generateSequenceNames', () => {
    it('should generate sequence filenames with prefix, digits, separator', () => {
      const result = generateSequenceNames(3, {
        prefix: '個人票',
        startNumber: 1,
        digits: 3,
        separator: '_'
      });

      expect(result).toEqual([
        '個人票_001.pdf',
        '個人票_002.pdf',
        '個人票_003.pdf'
      ]);
    });

    it('should work without prefix', () => {
      const result = generateSequenceNames(2, {
        prefix: '',
        startNumber: 5,
        digits: 2,
        separator: '_'
      });

      expect(result).toEqual(['05.pdf', '06.pdf']);
    });
  });

  describe('fillTemplate', () => {
    it('should replace column placeholders with row values', () => {
      const row = { 学年: 7, 組: 'A', 出席番号: 1, 氏名: '山田太郎' };
      const template = '{学年}年_{組}組_{出席番号}_{氏名}';
      const output = fillTemplate(template, row);

      expect(output).toBe('7年_A組_1_山田太郎');
    });

    it('should apply zero padding when configured for a column', () => {
      const row = { 学年: 7, 組: 'A', 出席番号: 2, 氏名: '鈴木花子' };
      const template = '{学年}年_{組}組_{出席番号}_{氏名}';
      const zeroPad = { 出席番号: 2 };
      const output = fillTemplate(template, row, zeroPad);

      expect(output).toBe('7年_A組_02_鈴木花子');
    });
  });

  describe('generateSpreadsheetNames', () => {
    it('should generate names using a single column', () => {
      const rows = [{ 氏名: '山田太郎' }, { 氏名: '鈴木花子' }];
      const result = generateSpreadsheetNames(rows, {
        sheetName: 'Sheet1',
        headerRowIndex: 0,
        mode: 'column',
        selectedColumn: '氏名',
        template: '',
        zeroPadColumns: {}
      });

      expect(result).toEqual(['山田太郎.pdf', '鈴木花子.pdf']);
    });
  });
});
