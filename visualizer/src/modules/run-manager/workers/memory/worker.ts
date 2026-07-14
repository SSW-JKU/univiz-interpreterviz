import * as Comlink from 'comlink';
import { FullBytecodeItem } from '../../../memory';
import { VOTChunkOperation } from '../../../operation-trace';
import { findChunkAtOperationIndex, getOperationAtIndex } from '../lib/getOperationAtIndex';
import { createRunnerManager } from '../runner/manager';

let {
  start,
  logManager,
  observableCode,
  observableOperationsAfter,
  observableOperationsPerLine,
  observableFullBytecodeItems,
  observableOperationChunkList,
  observableReferenceBytecodeItems
} = createRunnerManager();

let operationsBefore = observableOperationsAfter.map(operationsAfter => {
  let allOperationPCs = new Set(
    [...operationsAfter.entries()].flatMap(([pc, after]) => [pc, ...after])
  );

  let operationsBefore = new Map<number, Set<number>>();

  for (let pc of allOperationPCs) {
    let before = new Set<number>(
      [...operationsAfter.entries()]
        .filter(([_, after]) => after.has(pc))
        .map(([before]) => before)
    );

    operationsBefore.set(pc, before);
  }

  return operationsBefore;
});

let observableOperationCount = observableOperationChunkList.map(
  ({ operationCount }) => operationCount
);

let getOperationRaw = (index: number) => {
  if (index == 0) {
    return {
      logs: [],
      snapshot: observableOperationChunkList.value.chunks[0].snapshot,
      runId: 'run_initial',
      diff: {
        entries: [],
        regions: [],
        pointers: []
      },
      operation: null,
      previousOperationSnapshot: observableOperationChunkList.value.chunks[0].snapshot
    };
  }

  let logs = logManager.getLogs(index - 1);
  let { operationSnapshot, previousOperationSnapshot } = getOperationAtIndex(
    observableOperationChunkList.value,
    index - 1
  );

  if (!previousOperationSnapshot)
    previousOperationSnapshot = observableOperationChunkList.value.chunks[0].snapshot;

  return {
    type:
      operationSnapshot.runResult.type == 'error'
        ? ('error' as const)
        : ('operation' as const),
    error:
      'error' in operationSnapshot.runResult ? operationSnapshot.runResult.error : undefined,
    logs,
    snapshot: operationSnapshot.snapshot,
    runId: operationSnapshot.runResult.id,
    diff: operationSnapshot.runResult.afterDiff,
    operation: operationSnapshot.runResult.operation,
    previousOperationSnapshot: previousOperationSnapshot
  };
};

let getOperation = (index: number) => {
  let op = getOperationRaw(index);

  return {
    ...op,
    snapshot: op.snapshot,
    previousOperationSnapshot: op.previousOperationSnapshot
      ? op.previousOperationSnapshot
      : undefined
  };
};

let tryToFindOperationAtLineInDirection = (opts: {
  currentIndex: number;
  line: number;
  offset: number;
  direction: 'up' | 'down';
  maxSearch: number;
}) => {
  let dir = opts.direction === 'up' ? -1 : 1;

  let globalStartIndex = opts.currentIndex + opts.offset * dir;
  if (observableOperationCount.value < globalStartIndex) return;

  let chunks = observableOperationChunkList.value.chunks;
  let offsetFromGlobalStartIndex = 0;

  while (true) {
    let { chunkIndex, operationIndex } = findChunkAtOperationIndex(
      observableOperationChunkList.value,
      globalStartIndex
    );

    let chunk = chunks[chunkIndex];
    let currentOperationIndex = operationIndex;

    while (chunk) {
      let operations = chunk.operations;
      for (let j = currentOperationIndex; j < operations.length; j++) {
        offsetFromGlobalStartIndex++;

        let operation = operations[j];
        if (
          operation?.operation &&
          operation.operation.properties.operation.line == opts.line
        ) {
          let finalIndex = offsetFromGlobalStartIndex + globalStartIndex;

          return {
            operation: getOperation(finalIndex),
            index: finalIndex
          };
        }
      }

      currentOperationIndex = 0;
      chunk = chunks[chunkIndex + 1];

      if (offsetFromGlobalStartIndex >= opts.maxSearch) break;
    }

    if (offsetFromGlobalStartIndex >= opts.maxSearch) break;
  }
};

let getOperationAtLine = (opts: { currentIndex: number; line: number }) => {
  try {
    let maxSearch = 100;

    for (let i = 0; i < 10; i++) {
      let after = tryToFindOperationAtLineInDirection({
        ...opts,
        offset: i * maxSearch,
        direction: 'down',
        maxSearch
      });
      if (after && after.operation.operation?.properties.operation.line == opts.line)
        return after;

      let before = tryToFindOperationAtLineInDirection({
        ...opts,
        offset: i * maxSearch,
        direction: 'up',
        maxSearch
      });
      if (before && before.operation.operation?.properties.operation.line == opts.line)
        return before;
    }
  } catch (e) {
    console.error(e);
  }
};

let getOperationsAtSameLine = (index: number) => {
  let current = getOperation(index);
  let line = current.operation?.properties.operation.line;
  if (!line) return [];

  let ops: (VOTChunkOperation & { index: number })[] = [];

  let currentIndex = index;

  while (true) {
    let prev = getOperation(--currentIndex);
    if (!prev.operation || prev.operation.properties.operation.line !== line) break;

    ops.unshift({ ...prev.operation, index: currentIndex });
  }

  currentIndex = index;
  ops.push({ ...current.operation!, index });

  while (true) {
    let next = getOperation(++currentIndex);
    if (!next.operation || next.operation.properties.operation.line !== line) break;

    ops.push({ ...next.operation, index: currentIndex });
  }

  return ops;
};

let running = false;

let exposed = {
  start: (operationTrace: File | Blob) => {
    if (running) throw new Error('Already running');
    running = true;
    return start(operationTrace);
  },

  getOperation: (index: number) => getOperation(index),
  getOperationAtLine: (opts: { currentIndex: number; line: number }) =>
    getOperationAtLine(opts),
  getOperationsAtSameLine: (index: number) => getOperationsAtSameLine(index),

  getFullBytecodeItems: () => observableFullBytecodeItems.value,
  getReferenceBytecodeItems: () => observableReferenceBytecodeItems.value,

  getOperationInfo: (pc: number) => {
    let after = observableOperationsAfter.value.get(pc) ?? new Set();
    let before = operationsBefore.value.get(pc) ?? new Set();

    return { after: [...after], before: [...before] };
  },

  getOperationCount: () => observableOperationCount.value,
  onOperationCountChange: (cb: (value: number) => void) => {
    observableOperationCount.subscribe(cb);
  },

  onDone: (cb: () => void) => {
    observableOperationChunkList.subscribe(({ done }) => {
      if (done) cb();
    });
  },

  onCode: (cb: (code: string) => void) => {
    observableCode.subscribe(cb);
  },

  onOperationsPerLine: (cb: (operations: Record<string, VOTChunkOperation[]>) => void) => {
    observableOperationsPerLine.subscribe(cb);
  },

  onFullBytecodeItems: (cb: (items: FullBytecodeItem[]) => void) => {
    observableFullBytecodeItems.subscribe(cb);
  },

  onReferenceBytecodeItems: (cb: (items: FullBytecodeItem[]) => void) => {
    observableReferenceBytecodeItems.subscribe(cb);
  }
};

export type MemoryWorker = typeof exposed;

Comlink.expose(exposed);
