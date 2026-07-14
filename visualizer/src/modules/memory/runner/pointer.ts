import { Pointer } from '../pointer';

export class RunnerPointer {
  constructor(private pointer: Pointer) {}

  get id() {
    return this.pointer.id;
  }

  get type() {
    return this.pointer.type;
  }

  get name() {
    return this.pointer.name;
  }

  getAddress() {
    return this.pointer.getAddress();
  }

  setAddress(address: number) {
    this.pointer.setAddress(address);
  }
}
