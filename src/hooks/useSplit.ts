import { useState, useMemo } from 'react';
import type { SplitGroup, SplitMode } from '../types/pdf';
import {
  createGroupsPageByPage,
  createGroupsFixedPages,
  parseRanges,
  createGroupsFromBreakpoints
} from '../services/pdfSplitter';

export function useSplit(totalPages: number) {
  const [splitMode, setSplitMode] = useState<SplitMode>('thumbnail');
  const [fixedPagesPerGroup, setFixedPagesPerGroup] = useState<number>(2);
  const [rangeString, setRangeString] = useState<string>('');
  const [rangeError, setRangeError] = useState<string | undefined>(undefined);
  const [breakpoints, setBreakpoints] = useState<boolean[]>([]);

  // Initialize breakpoints whenever totalPages changes
  useMemo(() => {
    if (totalPages > 1) {
      // Default: 1 page per break (Mode D default)
      setBreakpoints(new Array(totalPages - 1).fill(true));
    } else {
      setBreakpoints([]);
    }
  }, [totalPages]);

  const toggleBreakpoint = (index: number) => {
    setBreakpoints((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const splitGroups = useMemo<SplitGroup[]>(() => {
    if (totalPages <= 0) return [];

    switch (splitMode) {
      case 'single':
        setRangeError(undefined);
        return createGroupsPageByPage(totalPages);

      case 'fixed':
        setRangeError(undefined);
        return createGroupsFixedPages(totalPages, fixedPagesPerGroup);

      case 'range': {
        const parsed = parseRanges(totalPages, rangeString);
        setRangeError(parsed.error);
        return parsed.groups;
      }

      case 'thumbnail':
      default:
        setRangeError(undefined);
        return createGroupsFromBreakpoints(totalPages, breakpoints);
    }
  }, [splitMode, totalPages, fixedPagesPerGroup, rangeString, breakpoints]);

  return {
    splitMode,
    setSplitMode,
    fixedPagesPerGroup,
    setFixedPagesPerGroup,
    rangeString,
    setRangeString,
    rangeError,
    breakpoints,
    toggleBreakpoint,
    splitGroups
  };
}
