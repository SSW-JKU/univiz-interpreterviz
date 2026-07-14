import { useEffect } from 'react';
import { atom } from '../../../lib';
import { Operation } from '../../operation/hooks/useCurrentOperation';

let expandedAtom = atom<string[]>([]);

export let useExpanded = () => expandedAtom.use();

export let toggleExpanded = (id: string) => {
  let current = expandedAtom.get();
  if (current.includes(id)) {
    expandedAtom.set(current.filter(i => i != id));
  } else {
    expandedAtom.set([...current, id]);
  }
};

export let setExpanded = (ids: string[]) =>
  expandedAtom.set([...new Set([...expandedAtom.get(), ...ids])]);

export let useAutoExpand = (operation: Operation | null) => {
  useEffect(() => {
    if (!operation?.diff?.entries) return;

    let entryMap = new Map([
      ...(operation.previousOperationSnapshot?.entries ?? []).map(e => [e.id, e] as const),
      ...operation.snapshot.entries.map(e => [e.id, e] as const)
    ]);

    let toExpand = operation.diff.entries
      .flatMap(([_, e]) => {
        let entries = [e];
        if (e.parentEntryId) entries.push(entryMap.get(e.parentEntryId)!);

        return entries;
      })
      .filter(Boolean)
      .flatMap(e => [e.regionId, e.fieldsMemoryRegionId!])
      .filter(Boolean);

    setExpanded(toExpand);
  }, [operation]);
};
