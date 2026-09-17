import { describe, it, expect } from 'vitest';
import { validateNaming } from '../validator';

describe('validator', () => {
  it('should pass when count matches and no duplicate/empty names', () => {
    const result = validateNaming(3, ['A.pdf', 'B.pdf', 'C.pdf']);
    expect(result.canExport).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should flag count mismatch when split count != name count', () => {
    const result = validateNaming(5, ['A.pdf', 'B.pdf', 'C.pdf', 'D.pdf']);
    expect(result.canExport).toBe(false);
    expect(result.errors[0].type).toBe('COUNT_MISMATCH');
  });

  it('should flag duplicate names when autoSequenceDuplicates is false', () => {
    const result = validateNaming(2, ['山田太郎.pdf', '山田太郎.pdf'], false);
    expect(result.canExport).toBe(false);
    expect(result.errors.some((e) => e.type === 'DUPLICATE_NAME')).toBe(true);
  });

  it('should auto-append sequence numbers to duplicate names when autoSequenceDuplicates is true', () => {
    const result = validateNaming(3, ['山田太郎.pdf', '山田太郎.pdf', '山田太郎.pdf'], true);
    expect(result.canExport).toBe(true);
    expect(result.sanitizedNames).toEqual([
      '山田太郎.pdf',
      '山田太郎_2.pdf',
      '山田太郎_3.pdf'
    ]);
  });
});
