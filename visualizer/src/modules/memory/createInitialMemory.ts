import { VizSpec } from '../vizspec';
import { Memory } from './memory';

export let createInitialMemory = (vizSpec: VizSpec) => {
  let memoryBuilder = Memory.create();
  for (let [identifier, object] of Object.entries(vizSpec.declarations.region)) {
    memoryBuilder.region({
      identifier,
      type: object.type,
      pointers: object.pointers.map(pointer => ({
        ...pointer,
        type: pointer.type ?? 'custom'
      })),
      name: object.name,
      entrySize: object.entrySize
    });
  }

  for (let [identifier, object] of Object.entries(vizSpec.declarations.type)) {
    memoryBuilder.entryType({
      identifier,
      name: object.name,
      hasFields: object.hasFields,
      kind: object.kind,
      region: object.region,
      fieldSize: object.fieldSize
    });
  }

  return memoryBuilder.build();
};
