import { EntryType, EntryTypeKind } from '../entryType';
import { Memory, PointerDefinition } from '../memory';
import { IMemoryRegion } from './interface';

export let testMemory = <
  EntriesParam extends {
    [identifier: string]: {
      hasFields?: boolean;
      kind?: EntryTypeKind;
      fieldSize?: number;
    };
  },
  RegionsParam extends {
    [identifier: string]: {
      pointers?: PointerDefinition[];
    } & (
      | {
          type: 'addressable' | 'stack';
          entrySize?: number;
        }
      | { type: 'code' }
    );
  }
>(opts: {
  entryTypes: EntriesParam;
  regions: RegionsParam;
}) => {
  let builder = Memory.create();

  for (let [identifier, region] of Object.entries(opts.regions)) {
    builder.region({
      identifier: identifier,
      name: identifier,
      pointers: region.pointers ?? [],
      type: region.type,
      entrySize: (region as any).entrySize ?? 4
    });
  }

  for (let [identifier, entryType] of Object.entries(opts.entryTypes)) {
    let region =
      entryType.kind == 'pointer'
        ? Object.entries(opts.regions).find(([_, region]) => region.type == 'stack')?.[0]
        : undefined;

    builder.entryType({
      identifier: identifier,
      name: identifier,
      hasFields: entryType.hasFields,
      kind: entryType.kind,
      fieldSize: entryType.fieldSize,
      region
    });
  }

  let memory = builder.build();

  return {
    memory,
    regions: Object.fromEntries(memory.regions.entries()) as {
      [K in keyof RegionsParam]: IMemoryRegion;
    },
    entryTypes: Object.fromEntries(memory.entryTypes.entries()) as {
      [K in keyof EntriesParam]: EntryType;
    }
  };
};
