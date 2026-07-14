import { AlternativeName, IEntry } from '../entry';
import { Memory } from '../memory';
import { Pointer } from '../pointer';
import { IMemoryRegion } from '../region';
import { Function, SymbolType, SymbolTypeKind, Variable } from '../symbol';

export interface SerializedEntry {
  id: string;
  kind: 'memory' | 'reference';
  size: number;
  name?: string;
  alternativeNames: { [k in AlternativeName]?: string | undefined };
  value: number;
  typeId: string;
  address: { main: number; slice: number; global: number; multiSlice: boolean };
  version: number;
  regionId: string;
  functionId?: string;
  symbolTypeId?: string;
  parentEntryId?: string;
  fieldsMemoryRegionId?: string;
}

export interface SerializedPointer {
  id: string;
  type: string;
  name: string;
  address: number;
  version: number;
}

export interface SerializedMemoryRegion {
  id: string;
  kind: string;
  name: string;
  isFieldStore: boolean;
  pointerIds: string[];
  entryIds: string[];
  version: number;
  functionIds: string[];
  globals: SerializedVariable[];
}

export interface SerializedVariable {
  id: string;
  name: string;
  symbolTypeId: string;
  address: number;
  initialValue: number;
  isParameter: boolean;
}

export interface SerializedFunction {
  id: string;
  name: string;
  line: number;
  version: number;
  locals: SerializedVariable[];
  startAddress: number;
  localsStartOffset: number;
}

export interface SerializedSymbolType {
  id: string;
  name: string;
  version: number;
  kind: SymbolTypeKind;
  line: number;
  arrayDepth: number;
  variables: SerializedVariable[];
}

export interface SerializedMemory {
  regions: SerializedMemoryRegion[];
  entries: SerializedEntry[];
  pointers: SerializedPointer[];
  symbolTypes: SerializedSymbolType[];
  functions: SerializedFunction[];
}

export let serializeMemory = (memory: Memory): SerializedMemory => {
  let regions = new Map<string, SerializedMemoryRegion>();
  let entries = new Map<string, SerializedEntry>();
  let pointers = new Map<string, SerializedPointer>();
  let funcs = new Map<string, SerializedFunction>();
  let symbolTypes = new Map<string, SerializedSymbolType>();

  let processEntry = (
    entry: IEntry,
    address: { main: number; slice: number; multiSlice: boolean; global: number },
    regionId: string
  ) => {
    if (!entries.has(entry.id)) {
      let fieldStore = entry.getFieldStore();

      entries.set(entry.id, {
        address,
        regionId,
        id: entry.id,
        kind: entry.kind,
        version: entry.version,

        name: entry.name,
        alternativeNames: entry.alternativeNames,

        size: entry.getSize(),
        value: entry.getValue(),

        functionId: entry.functionId,
        typeId: entry.type.identifier,
        parentEntryId: entry.parent?.id,
        symbolTypeId: entry.symbolType?.id,

        fieldsMemoryRegionId: fieldStore ? processMemoryRegion(fieldStore, true) : undefined
      });
    }

    return entry.id;
  };

  let processPointer = (pointer: Pointer) => {
    if (!pointers.has(pointer.id)) {
      pointers.set(pointer.id, {
        id: pointer.id,
        type: pointer.type,
        name: pointer.name,
        version: pointer.version,
        address: pointer.getAddress()
      });
    }

    return pointer.id;
  };

  let processVariable = (variable: Variable) => {
    return {
      id: variable.id,
      name: variable.name,
      symbolTypeId: variable.symbolTypeId,
      address: variable.address,
      initialValue: variable.initialValue,
      isParameter: variable.isParameter
    };
  };

  let processSymbolType = (symbolType: SymbolType) => {
    if (!symbolTypes.has(symbolType.id)) {
      symbolTypes.set(symbolType.id, {
        id: symbolType.id,
        name: symbolType.name,
        kind: symbolType.kind,
        line: symbolType.line,
        version: symbolType.version,
        arrayDepth: symbolType.arrayDepth,
        variables: symbolType.variables.map(processVariable)
      });
    }

    return symbolType.id;
  };

  let processFunction = (func: Function) => {
    if (!funcs.has(func.id)) {
      funcs.set(func.id, {
        id: func.id,
        name: func.name,
        line: func.line,
        version: func.version,
        startAddress: func.startAddress,
        locals: func.locals.map(processVariable),
        localsStartOffset: func.localsStartOffset
      });
    }

    return func.id;
  };

  let processMemoryRegion = (region: IMemoryRegion, isFieldStore: boolean) => {
    if (!regions.has(region.id)) {
      regions.set(region.id, {
        id: region.id,
        kind: region.kind,
        name: region.name,
        isFieldStore,
        version: region.version,
        pointerIds: region.listPointers().map(processPointer).sort(),
        functionIds: region.listFunctions().map(processFunction).sort(),
        entryIds: region
          .listEntries()
          .map(({ address, entry }) => processEntry(entry, address, region.id))
          .sort(),
        globals: region.listGlobals().map(processVariable)
      });
    }

    return region.id;
  };

  for (let region of memory.listRegions()) {
    if (region.kind == 'code') continue;
    processMemoryRegion(region, false);
  }

  for (let symbolType of memory.symbolTypes.values()) {
    processSymbolType(symbolType);
  }

  return {
    regions: Array.from(regions.values()),
    entries: Array.from(entries.values()),
    pointers: Array.from(pointers.values()),
    symbolTypes: Array.from(symbolTypes.values()),
    functions: Array.from(funcs.values())
  };
};
