import { OperationSnapshot } from '../../../../run-manager';
import { parsedVizspec } from '../../../vizspec';
import { getEnrichedDiff } from './diff';
import { getEnrichedMemorySnapshot } from './memory';

/**
 * Normalize regions of snapshot, add entries and pointers, and vizspec information including methods
 */
export let getEnrichedOperationSnapshot = (os: OperationSnapshot) => {
  let currentOperationSnapshot = getEnrichedMemorySnapshot(os.snapshot);
  let previousOperationSnapshot = os.previousOperationSnapshot
    ? getEnrichedMemorySnapshot(os.previousOperationSnapshot, os.snapshot)
    : currentOperationSnapshot;

  let vizOperation = parsedVizspec.operations.find(
    o => o.identifier == os.operation?.properties.vizop
  );

  return {
    type: 'operation',
    error: os.error,
    diff: os.diff
      ? getEnrichedDiff(os.diff, previousOperationSnapshot, currentOperationSnapshot)
      : null,
    logs: os.logs,
    operation: os.operation,
    previousOperationSnapshot,
    snapshot: currentOperationSnapshot,
    vizOperation,
    runId: os.runId
  };
};

export type EnrichedSnapshot = ReturnType<typeof getEnrichedOperationSnapshot>;
export type EnrichedRegion = EnrichedSnapshot['previousOperationSnapshot']['regions'][number];
