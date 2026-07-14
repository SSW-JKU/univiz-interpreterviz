import { EnrichedEntry } from '../data/normalize/memory';
import { EnrichedSnapshot } from '../data/normalize/operationSnapshot';

export type EntryAnimation = { object: 'entry' } & (
  | {
      type: 'fusion';
      inputs: EnrichedEntry[];
      new: EnrichedEntry;
    }
  | {
      type: 'modify';
      before: EnrichedEntry;
      after: EnrichedEntry;
    }
  | {
      type: 'move';
      from: EnrichedEntry;
      to: EnrichedEntry;
    }
  | {
      type: 'copy';
      from: EnrichedEntry;
      to: EnrichedEntry;
    }
  | {
      type: 'add';
      entry: EnrichedEntry;
    }
  | {
      type: 'remove';
      entry: EnrichedEntry;
    }
  | {
      type: 'add_field_entry';
      entry: EnrichedEntry;
      children: EnrichedEntry[];
    }
  | {
      type: 'noop';
    }
);

export type Animation = EntryAnimation & { operation: EnrichedSnapshot };

export type AnimationPlan = Animation[];
