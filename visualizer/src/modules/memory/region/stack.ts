import { IEntry } from '../entry';
import { MemoryError } from '../lib';
import { Memory } from '../memory';
import { Pointer } from '../pointer';
import { AddressableRegion } from './addressable';

export class StackRegion extends AddressableRegion {
  #stackPointer: Pointer | undefined;
  #stackPointerValue = 0; // Fallback if there is no stack pointer

  constructor(name: string, pointers: Pointer[], entrySize: number, memory: Memory) {
    super(name, pointers, entrySize, memory, 'stack');

    this.#stackPointer = pointers.find(pointer => pointer.type === 'stack_pointer');
  }

  public toString() {
    let memory = super.toString();
    let stackPointer = `Stack Pointer: ${this.getStackPointer()}`;
    return `${memory}\n${stackPointer}`;
  }

  private getStackPointer() {
    return this.#stackPointer?.getAddress() ?? this.#stackPointerValue;
  }

  private setStackPointer(address: number) {
    this.incrementVersion();

    this.#stackPointerValue = address;
    if (this.#stackPointer) this.#stackPointer.setAddress(address);
  }

  private updateStackPointer(update: number) {
    this.setStackPointer(Math.max(0, this.getStackPointer() + update));
  }

  public getNextAddress() {
    return this.getStackPointer();
  }

  public push(entry: IEntry): void {
    this.checkEntry('push', entry);

    let chunks = super.getChunkSize(entry); // Number of chunks the entry occupies
    this.set(this.getStackPointer(), entry);
    this.updateStackPointer(chunks);
  }

  public pop(): IEntry {
    let stackPointer = this.getStackPointer();
    if (stackPointer < 0) throw new MemoryError('Cannot pop from empty stack.');

    let entry = super.getSafe(stackPointer - 1);
    if (!entry) throw new MemoryError('Cannot pop from empty stack.');

    this.removeEntryAndAllAfter(stackPointer - 1);
    this.updateStackPointer(-super.getChunkSize(entry));

    return entry;
  }

  public peek(): IEntry {
    let entry = this.getSafe(this.getStackPointer() - 1);
    if (!entry) throw new MemoryError('Cannot peek from empty stack.');

    return entry;
  }

  public clone(): StackRegion {
    let clone = new StackRegion(this.name, this.clonePointers(), this.entrySize, this.memory);
    clone._id = this._id;

    clone.setVersionForClone(this.version + 1);

    for (let mem of this._memory) {
      if (mem?.type == 'entry') {
        clone._memory.push({ type: 'entry', entries: mem.entries.map(e => e.clone()) });
      } else if (mem?.type == 'overflow') {
        clone._memory.push({ type: 'overflow', entryIndex: mem.entryIndex });
      } else {
        clone._memory.push(undefined!);
      }
    }

    clone.setStackPointer(this.getStackPointer());

    return clone;
  }
}
