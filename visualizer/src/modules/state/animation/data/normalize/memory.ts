import { SerializedEntry, SerializedMemory, SerializedMemoryRegion } from '../../../../memory';
import { parsedVizspec } from '../../../vizspec';
import { sortEntries } from './sortEntries';

export type EnrichedEntry = SerializedEntry & { region: SerializedMemoryRegion } & (
    | {
        fieldKind: 'none';
      }
    | {
        fieldKind: 'field_region';
        childEntries: (EnrichedEntry & {
          fieldGroup: {
            region: SerializedMemoryRegion;
            groupEntry: SerializedEntry;
          };
        })[];
      }
    | {
        fieldKind: 'field_entry';
        originalFieldRegionId: string;
        fieldRegionEntryId: string;

        fieldGroup: {
          region: SerializedMemoryRegion;
          groupEntry: SerializedEntry;
        };
      }
  );

export let getFieldEntry = (childEntry: SerializedEntry, parentEntry: SerializedEntry) => ({
  ...childEntry,
  fieldKind: 'field_entry' as const,
  fieldRegionEntryId: parentEntry.id,
  regionId: parentEntry.regionId,
  originalFieldRegionId: childEntry.regionId,
  address: {
    main: childEntry.address.main + parentEntry.address.main,
    multiSlice: childEntry.address.multiSlice,
    slice: childEntry.address.slice,
    global: 0
  }
});

export let getEnrichedMemorySnapshot = (
  mem: SerializedMemory,
  afterMem: SerializedMemory = mem
) => {
  let serializedEntryMap = new Map(mem.entries.map(entry => [entry.id, entry]) ?? []);
  let pointerMap = new Map(mem.pointers.map(pointer => [pointer.id, pointer]) ?? []);
  let regionMap = new Map(mem.regions.map(region => [region.id, region]) ?? []);

  let fieldRegionsMap = new Map(
    mem.entries.flatMap(entry => {
      if (!entry.fieldsMemoryRegionId) return [];

      let fieldRegion = mem.regions.find(r => r.id == entry.fieldsMemoryRegionId)!;

      return [[entry.fieldsMemoryRegionId!, { parentEntry: entry, fieldRegion }]] as const;
    })
  );

  let entries: EnrichedEntry[] = mem.entries.map(entry => {
    if (entry.fieldsMemoryRegionId) {
      return {
        ...entry,
        region: regionMap.get(entry.regionId)!,
        fieldKind: 'field_region' as const,
        childEntries: sortEntries(
          fieldRegionsMap.get(entry.fieldsMemoryRegionId)!.fieldRegion.entryIds.map(id => {
            let childEntry = serializedEntryMap.get(id)!;

            return {
              ...getFieldEntry(childEntry, entry),
              region: regionMap.get(entry.regionId)!,
              // originalRegion: regionMap.get(childEntry.regionId)!

              fieldGroup: {
                region: regionMap.get(childEntry.regionId)!,
                groupEntry: entry
              }
            };
          })
        )
      };
    }

    let fieldInfo = fieldRegionsMap.get(entry.regionId);
    if (fieldInfo) {
      let region = regionMap.get(fieldInfo.parentEntry.regionId)!;

      return {
        region,
        ...getFieldEntry(entry, fieldInfo.parentEntry),

        fieldGroup: {
          region: regionMap.get(entry.regionId)!,
          groupEntry: fieldInfo.parentEntry
        }
      };
    }

    return {
      ...entry,
      region: regionMap.get(entry.regionId)!,
      fieldKind: 'none' as const
    };
  });

  let entriesByRegion = entries.reduce((map, entry) => {
    let entries = map.get(entry.regionId) ?? [];
    entries.push(entry);
    map.set(entry.regionId, entries);
    return map;
  }, new Map<string, EnrichedEntry[]>());

  let regions = mem.regions.flatMap(region => {
    if (region.isFieldStore) return [];

    let currentRegion = afterMem.regions.find(r => r.id == region.id) ?? region;

    let mcRegion = parsedVizspec.declarations.region[region.name];
    let functions = afterMem.functions
      .filter(f => currentRegion.functionIds.includes(f.id))
      .sort((a, b) => a.line - b.line);

    return {
      ...region,

      vizspec: mcRegion,
      functions,

      // Remove id references
      entryIds: undefined,
      pointerIds: undefined,

      // Add full entries and pointers
      entries: sortEntries(entriesByRegion.get(region.id) ?? []),
      pointers: region.pointerIds.map(id => pointerMap.get(id)!).filter(Boolean)
    };
  });

  return {
    ...mem,
    regions,
    entries
  };
};

export type EnrichedMemorySnapshot = ReturnType<typeof getEnrichedMemorySnapshot>;
