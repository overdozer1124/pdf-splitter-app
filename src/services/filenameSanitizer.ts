/**
 * Sanitize and normalize filenames to prevent issues across Windows, ChromeOS, macOS, and Linux.
 */

const WINDOWS_RESERVED_NAMES = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]);

export function sanitizeFilename(filename: string): string {
  if (!filename) return 'document.pdf';

  // NFC normalization
  let clean = filename.normalize('NFC');

  // Strip trailing .pdf (even if duplicated) before sanitization
  clean = clean.replace(/(\.pdf)+$/i, '');

  // Replace forbidden Windows/Linux/macOS chars \ / : * ? " < > | with _
  clean = clean.replace(/[\\/:*?"<>|]/g, '_');

  // Remove control characters
  clean = clean.replace(/[\x00-\x1f\x7f]/g, '');

  // Trim leading & trailing whitespace and dots
  clean = clean.replace(/^[\s.]+|[\s.]+$|\s+(?=\s)/g, '');

  // If empty after sanitization
  if (!clean) {
    clean = 'document';
  }

  // Check Windows reserved names (case-insensitive)
  if (WINDOWS_RESERVED_NAMES.has(clean.toUpperCase())) {
    clean = `${clean}_file`;
  }

  // Truncate to maximum safe length for Windows filenames (200 chars)
  if (clean.length > 200) {
    clean = clean.substring(0, 200).trim();
  }

  return `${clean}.pdf`;
}
