import { ID } from '../../lib';

export type PointerType = 'root_pointer' | 'stack_pointer' | 'code_pointer' | 'custom';

export class Pointer {
  public readonly type: PointerType;
  public readonly name: string;
  #id: string;
  #address: number;
  #version = 1;

  constructor(opts: { name: string; address: number; type: PointerType }) {
    this.#id = ID.pointer.generate();
    this.type = opts.type;
    this.name = opts.name;
    this.#address = opts.address;
  }

  get id(): string {
    return this.#id;
  }

  get version(): number {
    return this.#version;
  }

  getAddress(): number {
    return this.#address;
  }

  setAddress(address: number) {
    this.#address = address;
    this.#version++;
  }

  clone(): Pointer {
    let clone = new Pointer({ address: this.getAddress(), type: this.type, name: this.name });
    clone.#id = this.#id;
    return clone;
  }
}
