import { Memory } from '../memory';
import { Pointer } from '../pointer';
import { BaseRegion } from './base';

export class CodeRegion extends BaseRegion {
  constructor(name: string, pointers: Pointer[], memory: Memory) {
    super('code', name, pointers, memory);
  }

  public clone() {
    let clone = new CodeRegion(this.name, this.clonePointers(), this.memory);
    clone._id = this._id;

    clone.setVersionForClone(this.version + 1);

    return clone;
  }

  public toString = () => '[[CODE REGION]]';
}
