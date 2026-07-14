import { fastVal, ID } from '../../lib';
import { IEntry, isEntry, MemoryEntry, ModifiedEntry } from '../entry';
import { MemoryError } from '../lib';
import { Memory } from '../memory';
import { Pointer } from '../pointer';
import { FunctionManager, OpenFunctionParams, Variable } from '../symbol';
import { IMemoryRegion } from './interface';

let createEntryValidation = fastVal.object({
  type: fastVal.string(),
  symbolType: fastVal.optional(fastVal.union(fastVal.string(), fastVal.number())),
  size: fastVal.number(),
  value: fastVal.number(),
  name: fastVal.optional(fastVal.union(fastVal.string(), fastVal.record(fastVal.string()))),
  arrayLength: fastVal.optional(fastVal.number()),
  arrayStartOffset: fastVal.optional(fastVal.number()),
  arraySymbolType: fastVal.optional(fastVal.union(fastVal.string(), fastVal.number()))
});

export type CreateEntryParams = {
  type: string;
  symbolType?: string | number;
  size: number;
  value: number;
  name?: string | Record<string, string>;
  arrayLength?: number;
  arrayStartOffset?: number;
};

let createGlobalValidation = fastVal.object({
  name: fastVal.string(),
  initialValue: fastVal.number(),
  address: fastVal.number(),
  type: fastVal.string(),
  symbolType: fastVal.union(fastVal.string(), fastVal.number()),
  size: fastVal.number()
});

export type CreateGlobalParams = (typeof createGlobalValidation)['__ref'];

export class BaseRegion implements IMemoryRegion {
  private pointersMap: Map<string, Pointer>;
  protected _id: string;
  private _version = 1;
  protected functionManager: FunctionManager;
  protected globalVariables: Map<string, Variable> = new Map();

  constructor(
    public readonly kind: 'addressable' | 'stack' | 'code',
    public readonly name: string,
    private readonly pointers: Pointer[],
    public readonly memory: Memory
  ) {
    this.functionManager = new FunctionManager();
    this._id = ID[`${kind}Region`].generate();
    this.pointersMap = new Map(pointers.map(pointer => [pointer.name, pointer]));
  }

  private notImplementedError(): any {
    throw new MemoryError(`Not implemented for ${this.kind}::${this.name} region`);
  }

  get id() {
    return this._id;
  }

  get version() {
    return this._version;
  }

  protected incrementVersion() {
    this._version++;
  }

  protected setVersionForClone(version: number) {
    this._version = version;
  }

  public get(address: number | [number, number | undefined | void], subAddress?: number) {
    return this.notImplementedError();
  }
  public getSafe(address: number | [number, number | undefined | void], subAddress?: number) {
    return this.notImplementedError();
  }
  public set(address: number | [number, number | undefined | void], entry: IEntry) {
    return this.notImplementedError();
  }
  public push(entry: IEntry) {
    return this.notImplementedError();
  }
  public pop() {
    return this.notImplementedError();
  }
  public peek() {
    return this.notImplementedError();
  }
  public clone() {
    return this.notImplementedError();
  }
  public listEntries() {
    return this.notImplementedError();
  }
  public getNextAddress() {
    return this.notImplementedError();
  }

  public listFunctions() {
    return this.functionManager.listFunctions();
  }

  public openFunction(opts: OpenFunctionParams) {
    return this.functionManager.open(opts, this.getNextAddress());
  }

  public closeFunction() {
    return this.functionManager.close();
  }

  public getCurrentFunction() {
    return this.functionManager.getCurrent();
  }

  public createEntry(input: CreateEntryParams) {
    let res = fastVal.validate(input, createEntryValidation);
    if (!res.ok) throw new Error('Invalid input: ' + JSON.stringify(res.errors, null, 2));

    let entryType = this.memory.getEntryType(res.value.type);
    let symbolType =
      res.value.symbolType !== undefined
        ? this.memory.getSymbolType(res.value.symbolType)
        : undefined;

    return new MemoryEntry(entryType, {
      size: res.value.size,
      value: res.value.value,
      names: res.value.name,
      symbolType,
      region: this,
      arrayLength: res.value.arrayLength,
      arrayStartOffset: res.value.arrayStartOffset,
      arraySymbolType: res.value.arraySymbolType
    });
  }

  public createModifiedEntry(parent: IEntry) {
    return new ModifiedEntry(parent, this);
  }

  public printMemory() {
    console.log(`Memory - ${this.kind}::${this.name}`);
    console.log(
      this.toString()
        .split('\n')
        .map(line => `  ${line}`)
        .join('\n')
    );
  }

  public toString() {
    return 'No memory to display';
  }

  public hasPointer(name: string): boolean {
    return this.pointersMap.has(name);
  }

  public getPointer(name: string): Pointer {
    if (!this.hasPointer(name)) {
      throw new MemoryError(`No pointer with name ${name}.`);
    }

    return this.pointersMap.get(name)!;
  }

  public listPointers(): Pointer[] {
    return this.pointers;
  }

  public listGlobals(): Variable[] {
    return Array.from(this.globalVariables.values());
  }

  public setGlobal(global: CreateGlobalParams, opts?: { autoInit?: boolean }) {
    let res = fastVal.validate(global, createGlobalValidation);
    if (!res.ok) throw new Error('Invalid input: ' + JSON.stringify(res.errors, null, 2));

    let symbolType = this.memory.getSymbolTypeById(res.value.symbolType);

    this.globalVariables.set(
      res.value.name,
      new Variable({
        name: res.value.name,
        initialValue: res.value.initialValue,
        address: res.value.address,
        symbolTypeId: symbolType.id,
        isParameter: false
      })
    );

    if (opts?.autoInit !== false) {
      this.set(
        res.value.address,
        this.createEntry({
          type: global.type,
          size: res.value.size,
          value: res.value.initialValue,
          name: res.value.name,
          symbolType: symbolType.name
        })
      );
    }
  }

  public setGlobals(globals: CreateGlobalParams[], opts?: { autoInit?: boolean }) {
    for (let global of globals) this.setGlobal(global, opts);
  }

  public getGlobalAtAddress(address: number): Variable | null {
    for (let variable of this.globalVariables.values()) {
      if (variable.address === address) return variable;
    }

    return null;
  }

  protected checkEntry(method: string, entry: IEntry) {
    if (!isEntry(entry)) {
      throw new MemoryError(`Parameter for ${method} must be an entry, received ${entry}.`);
    }
  }

  protected checkAddress(method: string, address: number) {
    if (typeof address !== 'number') {
      throw new MemoryError(
        `Parameter for ${method} must be an address (number), received ${address}.`
      );
    }
  }

  protected clonePointers = () => this.pointers.map(pointer => pointer.clone());
}
