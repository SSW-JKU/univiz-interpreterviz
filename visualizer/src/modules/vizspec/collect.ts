import { fastVal } from '../lib';
import { VSDeclaration } from './parser';

let declarationTypes = ['type' as const, 'region' as const];
export type VSDeclarationType = (typeof declarationTypes)[number];

export interface VSRegion {
  name: string;
  type: 'stack' | 'addressable' | 'code';
  kind?: 'global' | 'method_stack';
  entrySize: number;
  pointers: {
    name: string;
    type?: 'root_pointer' | 'stack_pointer' | 'code_pointer';
  }[];
  // visualization: {
  //   direction: 'forward' | 'backward';
  //   orientation: 'vertical' | 'horizontal';
  // };
}

export interface VSEntryType {
  name: string;
  kind: 'memory' | 'object' | 'array' | 'pointer';
  hasFields?: boolean;
  fieldSize?: number;
  region?: string;
  display?: 'special' | 'value';
}

let regionVal = fastVal.object({
  name: fastVal.string(),
  type: fastVal.oneOf('stack', 'addressable', 'code'),
  kind: fastVal.optional(fastVal.oneOf('global', 'method_stack')),
  entrySize: fastVal.number(),
  pointers: fastVal.array(
    fastVal.object({
      name: fastVal.string(),
      type: fastVal.optional(fastVal.oneOf('root_pointer', 'stack_pointer', 'code_pointer'))
    })
  )
  // visualization: fastVal.object({
  //   direction: fastVal.oneOf('forward', 'backward'),
  //   orientation: fastVal.oneOf('vertical', 'horizontal')
  // })
});

let entryTypeVal = fastVal.object({
  name: fastVal.string(),
  kind: fastVal.oneOf('memory', 'object', 'array', 'pointer'),
  hasFields: fastVal.optional(fastVal.boolean()),
  fieldSize: fastVal.optional(fastVal.number()),
  region: fastVal.optional(fastVal.string())
});

export type VSCollectedDeclaration = {
  type: {
    [identifier: string]: VSEntryType;
  };
  region: {
    [identifier: string]: VSRegion;
  };
};

export let collect = (declarations: VSDeclaration[]): VSCollectedDeclaration => {
  let collected: VSCollectedDeclaration = {
    type: {},
    region: {}
  };

  for (let declaration of declarations) {
    if (!declarationTypes.includes(declaration.type as VSDeclarationType)) {
      throw new Error(`Invalid declaration type: ${declaration.type}.`);
    }

    let type = declaration.type as VSDeclarationType;
    if (type == 'region') {
      let res = fastVal.validate(declaration.object, regionVal);
      if (!res.ok)
        throw new Error(`Invalid region declaration: ${JSON.stringify(res.errors, null, 2)}`);
      collected.region[declaration.identifier] = res.value;
    } else if (type == 'type') {
      let res = fastVal.validate(declaration.object, entryTypeVal);
      if (!res.ok)
        throw new Error(`Invalid type declaration: ${JSON.stringify(res.errors, null, 2)}`);
      collected.type[declaration.identifier] = res.value;
    } else {
      throw new Error(`Invalid declaration type: ${type}.`);
    }
  }

  return collected;
};
