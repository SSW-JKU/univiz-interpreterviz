import { EnrichedEntry } from '../data/normalize/memory';
import { EnrichedSnapshot } from '../data/normalize/operationSnapshot';
import { orderAnimations } from './orderAnimations';
import { AnimationPlan, EntryAnimation } from './types';

/**
 * Plan which animations to perform to transition from previous state to current state
 * @param op current operation snapshot
 * @returns animation plan
 */
let getEntryAnimationPlan = (op: EnrichedSnapshot) => {
  let animationHint = op.vizOperation?.flags.animationHint;

  let animations: EntryAnimation[] = [];

  let removedEntries = (op.diff?.entries ?? [])
    .filter(([type]) => type == 'remove')
    .map(([, entry]) => entry) as EnrichedEntry[];
  let updatedEntries = (op.diff?.entries ?? [])
    .filter(([type]) => type == 'update')
    .map(([, entry]) => entry) as EnrichedEntry[];
  let addedEntries = (op.diff?.entries ?? [])
    .filter(([type]) => type == 'add')
    .map(([, entry]) => entry) as EnrichedEntry[];

  let heapFields = addedEntries.filter(e => e.fieldsMemoryRegionId);

  if (heapFields.length) {
    for (let heapField of heapFields) {
      if (heapField.fieldKind == 'field_region' && heapField.childEntries) {
        animations.push({
          object: 'entry',
          type: 'add_field_entry',
          entry: heapField,
          children: heapField.childEntries
        });

        let childIds = new Set(heapField.childEntries.map(e => e.id));

        addedEntries = addedEntries.filter(e => e.id != heapField.id && !childIds.has(e.id));
      }
    }
  }

  for (let added of addedEntries) {
    let replaces = removedEntries.find(e => added.parentEntryId == e.id);

    if (replaces) {
      // removed added and removed
      removedEntries = removedEntries.filter(
        e =>
          // Get rid of the replaced entry
          e.id != replaces.id &&
          // Get rid of any entries that are at the same address, i.e., ones that are being overwritten
          (e.address.main != added.address.main || e.regionId != added.regionId)
      );
      addedEntries = addedEntries.filter(e => e.id != added.id);

      animations.push({
        type: 'move',
        from: replaces,
        to: added,
        object: 'entry'
      });
    }
  }

  if (animationHint != 'load_operation') {
    for (let addedEntry of addedEntries) {
      let removedInSameRegion = removedEntries.filter(e => e.regionId == addedEntry.regionId);

      if (!removedInSameRegion || removedInSameRegion.length < 2) continue;

      removedEntries = removedEntries.filter(e => e.regionId != addedEntry.regionId);
      addedEntries = addedEntries.filter(e => e.id != addedEntry.id);

      animations.push({
        object: 'entry',
        type: 'fusion',
        inputs: removedInSameRegion,
        new: addedEntry
      });
    }
  }

  for (let entry of addedEntries) {
    if (entry.kind == 'reference') {
      if (animationHint != 'load_operation') {
        removedEntries = removedEntries.filter(
          e => e.regionId != entry.regionId || e.address.main != entry.address.main
        );
      }

      animations.push({
        object: 'entry',
        type: 'copy',
        from: op.previousOperationSnapshot?.entries.find(
          e => e.id == entry.parentEntryId!
        )! as EnrichedEntry,
        to: entry
      });
    } else {
      animations.push({
        object: 'entry',
        type: 'add',
        entry
      });
    }
  }

  for (let entry of removedEntries) {
    animations.push({
      object: 'entry',
      type: 'remove',
      entry
    });
  }

  for (let entry of updatedEntries) {
    let prevEntry = op.previousOperationSnapshot?.entries.find(
      e => e.id == entry.id
    )! as EnrichedEntry;

    animations.push({
      object: 'entry',
      type: 'modify',
      before: prevEntry,
      after: entry
    });
  }

  return animations;
};

export let getAnimationPlan = (operation: EnrichedSnapshot) => {
  let animations: AnimationPlan = getEntryAnimationPlan(operation).map(a => ({
    ...a,
    operation
  }));

  if (animations.length == 0) {
    return [
      {
        operation,
        type: 'noop',
        object: 'entry'
      }
    ] satisfies AnimationPlan;
  }

  return orderAnimations(animations, operation);
};
