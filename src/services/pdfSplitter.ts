import type { SplitGroup } from '../types/pdf';

/**
 * Helper to construct a SplitGroup object
 */
function makeGroup(
  order: number,
  pageIndices: number[],
  defaultNamePrefix = 'split'
): SplitGroup {
  const startPage = pageIndices[0] + 1;
  const endPage = pageIndices[pageIndices.length - 1] + 1;
  const numStr = String(order).padStart(2, '0');
  const fileName = `${defaultNamePrefix}_${numStr}.pdf`;

  return {
    id: `group_${order}_${startPage}_${endPage}`,
    order,
    pageIndices,
    startPage,
    endPage,
    fileName
  };
}

/**
 * Mode A: Split 1 page per group
 */
export function createGroupsPageByPage(totalPages: number): SplitGroup[] {
  if (totalPages <= 0) return [];
  const groups: SplitGroup[] = [];
  for (let i = 0; i < totalPages; i++) {
    groups.push(makeGroup(i + 1, [i]));
  }
  return groups;
}

/**
 * Mode B: Split N pages per group
 */
export function createGroupsFixedPages(
  totalPages: number,
  pagesPerGroup: number
): SplitGroup[] {
  if (totalPages <= 0 || pagesPerGroup <= 0) return [];
  const groups: SplitGroup[] = [];
  let groupOrder = 1;

  for (let i = 0; i < totalPages; i += pagesPerGroup) {
    const pageIndices: number[] = [];
    for (let j = i; j < i + pagesPerGroup && j < totalPages; j++) {
      pageIndices.push(j);
    }
    groups.push(makeGroup(groupOrder++, pageIndices));
  }

  return groups;
}

/**
 * Mode C: Range specification (e.g. "1-3, 4-7, 8, 9-12")
 */
export function parseRanges(
  totalPages: number,
  rangeString: string
): { groups: SplitGroup[]; error?: string } {
  if (!rangeString.trim()) {
    return { groups: [], error: '範囲を入力してください。 (例: 1-3, 4-7, 8)' };
  }

  const parts = rangeString.split(',').map((p) => p.trim()).filter(Boolean);
  const groups: SplitGroup[] = [];
  const coveredPages = new Set<number>();
  let groupOrder = 1;

  for (const part of parts) {
    // Single page "8" or range "1-3"
    const matchSingle = part.match(/^(\d+)$/);
    const matchRange = part.match(/^(\d+)\s*-\s*(\d+)$/);

    if (matchSingle) {
      const pageNum = parseInt(matchSingle[1], 10);
      if (pageNum < 1 || pageNum > totalPages) {
        return {
          groups: [],
          error: `範囲エラー: ページ番号 ${pageNum} は存在しません (総ページ数: ${totalPages})`
        };
      }
      const pageIndex = pageNum - 1;
      if (coveredPages.has(pageIndex)) {
        return { groups: [], error: `範囲エラー: ページ ${pageNum} が重複しています。` };
      }
      coveredPages.add(pageIndex);
      groups.push(makeGroup(groupOrder++, [pageIndex]));
    } else if (matchRange) {
      const start = parseInt(matchRange[1], 10);
      const end = parseInt(matchRange[2], 10);

      if (start < 1 || end > totalPages || start > end) {
        return {
          groups: [],
          error: `範囲エラー: 範囲指定「${part}」が不正です。(1～${totalPages}の範囲で指定してください)`
        };
      }

      const pageIndices: number[] = [];
      for (let p = start; p <= end; p++) {
        const pageIdx = p - 1;
        if (coveredPages.has(pageIdx)) {
          return { groups: [], error: `範囲エラー: ページ ${p} が重複しています。` };
        }
        coveredPages.add(pageIdx);
        pageIndices.push(pageIdx);
      }
      groups.push(makeGroup(groupOrder++, pageIndices));
    } else {
      return {
        groups: [],
        error: `範囲フォーマットが不正です: 「${part}」。例: 1-3, 4, 5-8`
      };
    }
  }

  return { groups };
}

/**
 * Mode D: Thumbnail Breakpoints
 */
export function createGroupsFromBreakpoints(
  totalPages: number,
  breakpoints: boolean[]
): SplitGroup[] {
  if (totalPages <= 0) return [];
  const groups: SplitGroup[] = [];
  let currentIndices: number[] = [0];
  let groupOrder = 1;

  for (let i = 0; i < totalPages - 1; i++) {
    if (breakpoints[i]) {
      groups.push(makeGroup(groupOrder++, currentIndices));
      currentIndices = [i + 1];
    } else {
      currentIndices.push(i + 1);
    }
  }
  if (currentIndices.length > 0) {
    groups.push(makeGroup(groupOrder++, currentIndices));
  }

  return groups;
}
