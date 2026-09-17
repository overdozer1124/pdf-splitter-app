import { describe, it, expect } from 'vitest';
import { sanitizeFilename } from '../filenameSanitizer';

describe('filenameSanitizer', () => {
  it('should preserve valid japanese filenames with .pdf', () => {
    expect(sanitizeFilename('山田太郎.pdf')).toBe('山田太郎.pdf');
    expect(sanitizeFilename('7年A組_01_通知表')).toBe('7年A組_01_通知表.pdf');
  });

  it('should replace forbidden characters \\ / : * ? " < > | with _', () => {
    expect(sanitizeFilename('test/file:name*?.pdf')).toBe('test_file_name__.pdf');
    expect(sanitizeFilename('a\\b:c*d?e"f<g>h|i')).toBe('a_b_c_d_e_f_g_h_i.pdf');
  });

  it('should sanitize Windows reserved names like CON, PRN, AUX', () => {
    expect(sanitizeFilename('CON.pdf')).toBe('CON_file.pdf');
    expect(sanitizeFilename('prn')).toBe('prn_file.pdf');
    expect(sanitizeFilename('COM1')).toBe('COM1_file.pdf');
    expect(sanitizeFilename('LPT9.pdf')).toBe('LPT9_file.pdf');
  });

  it('should trim trailing dots and spaces', () => {
    expect(sanitizeFilename('  sample.name. . . ')).toBe('sample.name.pdf');
  });

  it('should strip duplicate .pdf extensions', () => {
    expect(sanitizeFilename('document.pdf.pdf')).toBe('document.pdf');
  });

  it('should fallback to document.pdf when given empty or whitespace name', () => {
    expect(sanitizeFilename('')).toBe('document.pdf');
    expect(sanitizeFilename('   ')).toBe('document.pdf');
  });

  it('should apply Unicode NFC normalization', () => {
    // NFD composed 'か' + dakuten (U+304B + U+3099) vs NFC 'が' (U+304C)
    const nfdString = 'か\u3099';
    const clean = sanitizeFilename(nfdString);
    expect(clean).toBe('が.pdf');
  });
});
