import { EditableMemorySnapshot, SerializedMemory } from '../../../memory';
import { ChunkList, OperationChunk, OperationPart } from './types';

interface OperationSnapshot {
  snapshot: SerializedMemory;
  runResult: OperationPart;
}

export let restoreOperationsInChunk = (chunk: OperationChunk, operationIndexes: number[]) => {
  let memory = new EditableMemorySnapshot(chunk.snapshot);

  let i = 0;

  let result: OperationSnapshot[] = [];

  for (let operationIndex of operationIndexes) {
    if (i > operationIndex) throw new Error('operationIndexes must be sorted');

    for (; i <= operationIndex; i++) {
      let operation = chunk.operations[i];
      if (operation.type == 'error') continue;

      for (let d of operation.afterDiff.entries) memory.applyEntryDiff(d);
      for (let d of operation.afterDiff.regions) memory.applyRegionDiff(d);
      for (let d of operation.afterDiff.pointers) memory.applyPointerDiff(d);
      for (let d of operation.afterDiff.symbolTypes) memory.applySymbolTypeDiff(d);
      for (let d of operation.afterDiff.functions) memory.applyFunctionDiff(d);
    }

    result.push({
      snapshot: memory.snapshot,
      runResult: chunk.operations[operationIndex]
    });
  }

  return result;
};

export let findChunkIndexOfOperationIndex = (chunkList: ChunkList, index: number) => {
  let chunkIndex = 0;
  let currentIndex = index;
  for (let i = 0; i < chunkList.chunks.length; i++) {
    let chunk = chunkList.chunks[i];
    if (currentIndex < chunk.operations.length) {
      chunkIndex = i;
      break;
    }

    currentIndex -= chunk.operations.length;
  }

  return {
    chunkIndex,
    operationIndex: currentIndex
  };
};

export let findChunkAtOperationIndex = (chunkList: ChunkList, index: number) => {
  let { chunkIndex, operationIndex } = findChunkIndexOfOperationIndex(chunkList, index);

  let chunk = chunkList.chunks[chunkIndex];
  if (!chunk) throw new Error(`Chunk ${chunkIndex} not found`);

  return { chunk, chunkIndex, operationIndex };
};

export let getOperationAtIndex = (chunkList: ChunkList, index: number) => {
  let operation: OperationSnapshot;
  let previousOperation: OperationSnapshot | null = null;

  let { chunk, chunkIndex, operationIndex } = findChunkAtOperationIndex(chunkList, index);

  let prevOperationIndex = operationIndex - 1;
  if (prevOperationIndex < 0) {
    operation = restoreOperationsInChunk(chunk, [operationIndex])[0];

    if (chunkIndex > 0) {
      let previousChunk = chunkList.chunks[chunkIndex - 1];

      previousOperation = restoreOperationsInChunk(previousChunk, [
        previousChunk.operations.length - 1
      ])[0];
    }
  } else {
    let operations = restoreOperationsInChunk(chunk, [prevOperationIndex, operationIndex]);

    previousOperation = operations[0];
    operation = operations[1];
  }

  return {
    operationSnapshot: operation,
    previousOperationSnapshot: previousOperation?.snapshot
  };
};
