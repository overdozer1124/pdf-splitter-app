import { describe, it, expect } from 'vitest';
import {
  createGroupsPageByPage,
  createGroupsFixedPages,
  parseRanges,
  createGroupsFromBreakpoints
} from '../pdfSplitter';

describe('pdfSplitter', () => {
  it('Mode A: createGroupsPageByPage should split every page into 1 group', () => {
    const result = createGroupsPageByPage(5);
    expect(result).toHaveLength(5);
    expect(result[0].startPage).toBe(1);
    expect(result[0].endPage).toBe(1);
    expect(result[0].pageIndices).toEqual([0]);
    expect(result[4].startPage).toBe(5);
    expect(result[4].pageIndices).toEqual([4]);
  });

  it('Mode B: createGroupsFixedPages should split by N pages per group', () => {
    // 5 pages, 2 pages each -> groups: 1-2, 3-4, 5
    const result = createGroupsFixedPages(5, 2);
    expect(result).toHaveLength(3);
    expect(result[0].pageIndices).toEqual([0, 1]);
    expect(result[1].pageIndices).toEqual([2, 3]);
    expect(result[2].pageIndices).toEqual([4]);
  });

  it('Mode C: parseRanges should parse range strings correctly', () => {
    const { groups, error } = parseRanges(10, '1-3, 4-7, 8, 9-10');
    expect(error).toBeUndefined();
    expect(groups).toHaveLength(4);
    expect(groups[0].startPage).toBe(1);
    expect(groups[0].endPage).toBe(3);
    expect(groups[2].pageIndices).toEqual([7]);
  });

  it('Mode C: parseRanges should catch out of bounds or duplicate range errors', () => {
    const res1 = parseRanges(5, '1-3, 4-6');
    expect(res1.error).toContain('不正です');

    const res2 = parseRanges(5, '1-3, 3-5');
    expect(res2.error).toContain('重複しています');
  });

  it('Mode D: createGroupsFromBreakpoints should split at break markers', () => {
    // 5 pages (4 breakpoints). Break after page 2 (index 1) and page 4 (index 3)
    const breakpoints = [false, true, false, true];
    const result = createGroupsFromBreakpoints(5, breakpoints);

    expect(result).toHaveLength(3);
    expect(result[0].pageIndices).toEqual([0, 1]); // Pages 1-2
    expect(result[1].pageIndices).toEqual([2, 3]); // Pages 3-4
    expect(result[2].pageIndices).toEqual([4]);    // Page 5
  });
});
