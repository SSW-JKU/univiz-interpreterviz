import {
  SerializedEntry,
  SerializedFunction,
  SerializedMemory,
  SerializedMemoryRegion,
  SerializedPointer,
  SerializedSymbolType
} from './serialize';

let isEntryEqual = (a: SerializedEntry, b: SerializedEntry) => {
  return (
    a.id == b.id &&
    a.version == b.version &&
    a.address.main == b.address.main &&
    a.address.slice == b.address.slice &&
    a.regionId == b.regionId
  );
};

let isPointerEqual = (a: SerializedPointer, b: SerializedPointer) => {
  return a.id == b.id && (a.version == b.version || a.address == b.address);
};

let isMemoryRegionEqual = (a: SerializedMemoryRegion, b: SerializedMemoryRegion) => {
  return a.id == b.id && a.version == b.version;
};

let isFunctionEqual = (a: SerializedFunction, b: SerializedFunction) => {
  return a.id == b.id && a.version == b.version;
};

let isSymbolTypeEqual = (a: SerializedSymbolType, b: SerializedSymbolType) => {
  return a.id == b.id && a.version == b.version;
};

export type MemoryDiffResult<T> = ['remove' | 'add' | 'update', T];
export type MemoryDiffRegion = MemoryDiffResult<SerializedMemoryRegion>;
export type MemoryDiffEntry = MemoryDiffResult<SerializedEntry>;
export type MemoryDiffPointer = MemoryDiffResult<SerializedPointer>;
export type MemoryDiffFunction = MemoryDiffResult<SerializedFunction>;
export type MemoryDiffSymbolType = MemoryDiffResult<SerializedSymbolType>;

let diffMany = <T extends { id: string }>(
  before: T[],
  after: T[],
  isEqual: (a: T, b: T) => boolean
): MemoryDiffResult<T>[] => {
  let diff = new Map<string, MemoryDiffResult<T>>();

  let beforeMap = new Map(before.map(item => [item.id, item]));
  let afterMap = new Map(after.map(item => [item.id, item]));

  for (let [id, beforeItem] of beforeMap) {
    if (!afterMap.has(id)) {
      diff.set(id, ['remove', beforeItem]);
    }
  }

  for (let [id, afterItem] of afterMap) {
    if (!beforeMap.has(id)) {
      diff.set(id, ['add', afterItem]);
    } else {
      let beforeItem = beforeMap.get(id)!;
      if (!isEqual(beforeItem, afterItem)) {
        diff.set(id, ['update', afterItem]);
      }
    }
  }

  return Array.from(diff.values());
};

export let getMemoryDiff = ({
  before,
  after
}: {
  before: SerializedMemory;
  after: SerializedMemory;
}) => {
  return {
    regions: diffMany(before.regions, after.regions, isMemoryRegionEqual),
    entries: diffMany(before.entries, after.entries, isEntryEqual),
    pointers: diffMany(before.pointers, after.pointers, isPointerEqual),
    functions: diffMany(before.functions, after.functions, isFunctionEqual),
    symbolTypes: diffMany(before.symbolTypes, after.symbolTypes, isSymbolTypeEqual)
  };
};

export type MemoryDiff = ReturnType<typeof getMemoryDiff>;
