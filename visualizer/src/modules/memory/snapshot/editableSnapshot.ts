import { MemoryDiff } from './diff';
import {
  SerializedEntry,
  SerializedFunction,
  SerializedMemory,
  SerializedMemoryRegion,
  SerializedPointer,
  SerializedSymbolType
} from './serialize';

export class EditableMemorySnapshot {
  #entries: Map<string, SerializedEntry>;
  #regions: Map<string, SerializedMemoryRegion>;
  #pointers: Map<string, SerializedPointer>;
  #symbolTypes: Map<string, SerializedSymbolType>;
  #functions: Map<string, SerializedFunction>;

  constructor(snapshot: SerializedMemory) {
    this.#entries = new Map(snapshot.entries.map(entry => [entry.id, entry]));
    this.#regions = new Map(snapshot.regions.map(region => [region.id, region]));
    this.#pointers = new Map(snapshot.pointers.map(pointer => [pointer.id, pointer]));
    this.#symbolTypes = new Map(
      snapshot.symbolTypes.map(symbolType => [symbolType.id, symbolType])
    );
    this.#functions = new Map(snapshot.functions.map(func => [func.id, func]));
  }

  applyEntryDiff(diff: MemoryDiff['entries'][0]) {
    if (diff[0] == 'add' || diff[0] == 'update') {
      this.#entries.set(diff[1].id, diff[1]);
    } else {
      this.#entries.delete(diff[1].id);
    }
  }

  applyRegionDiff(diff: MemoryDiff['regions'][0]) {
    if (diff[0] == 'add' || diff[0] == 'update') {
      this.#regions.set(diff[1].id, diff[1]);
    } else {
      this.#regions.delete(diff[1].id);
    }
  }

  applyPointerDiff(diff: MemoryDiff['pointers'][0]) {
    if (diff[0] == 'add' || diff[0] == 'update') {
      let updatedPointer = diff[1];
      let currentPointer = this.#pointers.get(updatedPointer.id);

      if (currentPointer?.address !== updatedPointer.address) {
        this.#pointers.set(diff[1].id, diff[1]);
      }
    } else {
      this.#pointers.delete(diff[1].id);
    }
  }

  applySymbolTypeDiff(diff: MemoryDiff['symbolTypes'][0]) {
    if (diff[0] == 'add' || diff[0] == 'update') {
      this.#symbolTypes.set(diff[1].id, diff[1]);
    } else {
      this.#symbolTypes.delete(diff[1].id);
    }
  }

  applyFunctionDiff(diff: MemoryDiff['functions'][0]) {
    if (diff[0] == 'add' || diff[0] == 'update') {
      this.#functions.set(diff[1].id, diff[1]);
    } else {
      this.#functions.delete(diff[1].id);
    }
  }

  get snapshot(): SerializedMemory {
    return {
      entries: Array.from(this.#entries.values()),
      regions: Array.from(this.#regions.values()),
      pointers: Array.from(this.#pointers.values()),
      symbolTypes: Array.from(this.#symbolTypes.values()),
      functions: Array.from(this.#functions.values())
    };
  }
}
