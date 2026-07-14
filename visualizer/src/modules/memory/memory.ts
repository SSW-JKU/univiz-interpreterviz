import { IEntry } from './entry';
import { EntryType, EntryTypeKind } from './entryType';
import { MemoryError } from './lib';
import { Pointer } from './pointer';
import {
  AddressableRegion,
  CodeRegion,
  CreateEntryParams,
  IMemoryRegion,
  StackRegion
} from './region';
import { SymbolType, SymbolTypeParams } from './symbol';

export interface PointerDefinition {
  name: string;
  type: 'root_pointer' | 'stack_pointer' | 'code_pointer' | 'custom';
}

export type RegionDefinition = {
  identifier: string;
  name: string;
  pointers: PointerDefinition[];
} & (
  | {
      type: 'addressable' | 'stack';
      entrySize: number;
    }
  | { type: 'code' }
);

export interface EntryTypeDefinition {
  identifier: string;
  name: string;
  hasFields?: boolean;
  kind?: EntryTypeKind;
  region?: string;
  fieldSize?: number;
}

export interface FullBytecodeItem {
  pc: number;
  line: number;
  vizop: string;
  opcode: string;
}

export class Memory {
  public symbolTypes: SymbolType[] = [];
  public readonly regions: Map<string, IMemoryRegion>;
  public readonly entryTypes: Map<string, EntryType>;
  public readonly bytecode: FullBytecodeItem[] = [];
  public readonly referenceBytecode: FullBytecodeItem[] = [];

  constructor(
    regions: RegionDefinition[] | Map<string, IMemoryRegion>,
    entryTypes: EntryTypeDefinition[] | Map<string, EntryType>
  ) {
    this.regions =
      regions instanceof Map
        ? regions
        : new Map<string, IMemoryRegion>(
            regions.map(region => {
              let pointers = region.pointers.map(
                pointer =>
                  new Pointer({
                    name: pointer.name,
                    address: 0,
                    type: pointer.type
                  })
              );

              return [
                region.identifier,
                region.type == 'code'
                  ? new CodeRegion(region.identifier, pointers, this)
                  : region.type == 'addressable'
                    ? new AddressableRegion(
                        region.identifier,
                        pointers,
                        region.entrySize,
                        this
                      )
                    : new StackRegion(region.identifier, pointers, region.entrySize, this)
              ] as const;
            })
          );

    this.entryTypes =
      entryTypes instanceof Map
        ? entryTypes
        : new Map<string, EntryType>(
            entryTypes.map(entryType => [
              entryType.identifier,
              new EntryType({
                ...entryType,
                kind: entryType.kind ?? 'memory'
              })
            ])
          );
  }

  static create() {
    return new MemoryBuilder(b => new Memory(b.regions, b.entryTypes));
  }

  public createEntry(input: CreateEntryParams) {
    let anyRegion = this.regions.values().next().value;
    if (!anyRegion) throw new MemoryError('No regions defined.');

    return anyRegion.createEntry(input);
  }

  public createModifiedEntry(parent: IEntry) {
    let anyRegion = this.regions.values().next().value;
    if (!anyRegion) throw new MemoryError('No regions defined.');

    return anyRegion.createModifiedEntry(parent);
  }

  public getPointer(name: string) {
    for (let region of this.regions.values()) {
      if (region.hasPointer(name)) return region.getPointer(name);
    }

    throw new MemoryError(`No pointer with name ${name}.`);
  }

  public setPointer(name: string, address: number) {
    let pointer = this.getPointer(name);

    if (pointer.type == 'root_pointer') {
      throw new MemoryError('Cannot set address on root pointer.');
    }

    pointer.setAddress(address);
  }

  public initPointers(values: Record<string, number>) {
    for (let [name, address] of Object.entries(values)) {
      this.setPointer(name, address);
    }
  }

  public getSymbolType(name: string | number) {
    return this.getSymbolTypeById(name);
  }

  public getSymbolTypeById(id: number | string) {
    let type = SymbolType.getById(this.symbolTypes, id);
    if (type) return type;

    throw new MemoryError(`No symbol type with id ${id}.`);
  }

  public setSymbolTypes(types: SymbolTypeParams[]) {
    this.symbolTypes = types.map(type => SymbolType.create(type));
  }

  public listPointers() {
    return Array.from(this.regions.values()).flatMap(region => region.listPointers());
  }

  public getRegion(identifier: string) {
    if (!this.regions.has(identifier))
      throw new MemoryError(`No region with identifier ${identifier}.`);

    return this.regions.get(identifier)!;
  }

  public hasRegion(identifier: string) {
    return this.regions.has(identifier);
  }

  public listRegions() {
    return Array.from(this.regions.values());
  }

  public getEntryType(identifier: string) {
    if (!this.entryTypes.has(identifier))
      throw new MemoryError(`No entry type with identifier ${identifier}.`);

    return this.entryTypes.get(identifier)!;
  }

  public hasEntryType(identifier: string) {
    return this.entryTypes.has(identifier);
  }

  public clone() {
    let regions = new Map<string, IMemoryRegion>(
      Array.from(this.regions.entries()).map(([identifier, region]) => [
        identifier,
        region.clone()
      ])
    );

    return new Memory(regions, this.entryTypes);
  }

  public printMemory() {
    for (let region of this.regions.values()) {
      region.printMemory();
    }
  }

  public setBytecode(bytecode: FullBytecodeItem[]) {
    this.bytecode.push(...bytecode);
  }

  public setReferenceBytecode(bytecode: FullBytecodeItem[]) {
    this.referenceBytecode.push(...bytecode);
  }
}

export class MemoryBuilder {
  #regions: RegionDefinition[] = [];
  #entryTypes: EntryTypeDefinition[] = [];

  constructor(
    private buildMemory: ({
      regions,
      entryTypes
    }: {
      regions: RegionDefinition[];
      entryTypes: EntryTypeDefinition[];
    }) => Memory
  ) {}

  region(region: RegionDefinition) {
    this.#regions.push(region);
    return this;
  }

  entryType(entryType: EntryTypeDefinition) {
    this.#entryTypes.push(entryType);
    return this;
  }

  build() {
    return this.buildMemory({
      regions: this.#regions,
      entryTypes: this.#entryTypes
    });
  }
}
