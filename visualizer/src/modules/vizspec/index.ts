import { collect } from './collect';
import { parse } from './parser';

export let vizspec = {
  parse,
  collect,
  process: (input: string) => parse(input)
};

export type {
  VSCollectedDeclaration,
  VSDeclarationType,
  VSEntryType,
  VSRegion
} from './collect';
export type { VizSpec, VSDeclaration, VSFunction, VSInit, VSOperation } from './parser';
