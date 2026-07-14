import { OperationSnapshot } from '../../../../run-manager';
import { EnrichedMemorySnapshot } from './memory';

export let getEnrichedDiff = (
  diff: NonNullable<OperationSnapshot['diff']>,
  beforeMem: EnrichedMemorySnapshot,
  afterMem: EnrichedMemorySnapshot
) => {
  let afterEntryMap = new Map(afterMem.entries.map(entry => [entry.id, entry]));
  let beforeEntryMap = new Map(beforeMem.entries.map(entry => [entry.id, entry]));

  return {
    ...diff,
    entries: diff.entries.map(diff => {
      if (diff[0] == 'remove') return [diff[0], beforeEntryMap.get(diff[1].id)!] as const;
      return [diff[0], afterEntryMap.get(diff[1].id)!] as const;
    })
  };
};
