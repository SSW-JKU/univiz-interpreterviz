import { EnrichedEntry } from './memory';

export let entrySorter = <T extends EnrichedEntry>(a: T, b: T) => {
  // field_regions should come first
  if (a.address.main == b.address.main) {
    if (a.fieldKind == 'field_region') return -1;
    if (b.fieldKind == 'field_region') return 1;
    return a.address.slice - b.address.slice;
  }

  return a.address.main - b.address.main;
};

export let sortEntries = <T extends EnrichedEntry>(entries: T[]) => entries.sort(entrySorter);
