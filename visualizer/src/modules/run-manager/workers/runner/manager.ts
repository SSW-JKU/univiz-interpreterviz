import { Observable } from '../../../lib';
import { FullBytecodeItem } from '../../../memory';
import { VOTChunkOperation } from '../../../operation-trace';
import { createLogManager } from '../lib/logManager';
import { ChunkList, OperationChunk } from '../lib/types';
import RunnerWorker from './worker?worker';

export let createRunnerManager = () => {
  let worker = new RunnerWorker({ name: 'runner' });

  let observableOperationChunkList = new Observable<ChunkList>({
    chunkSize: 0,
    operationCount: 0,
    done: false,
    chunks: []
  });

  let observableCode = new Observable<string>('');
  let observableOperationsPerLine = new Observable<Record<string, VOTChunkOperation[]>>({});
  let observableOperationsAfter = new Observable<Map<number, Set<number>>>(new Map());
  let observableFullBytecodeItems = new Observable<FullBytecodeItem[]>([]);
  let observableReferenceBytecodeItems = new Observable<FullBytecodeItem[]>([]);

  let logManager = createLogManager();

  let running = false;
  let start = (operationTrace: File | Blob) => {
    if (running) throw new Error('Already running');
    running = true;

    return new Promise<{
      programName: string;
    }>((resolve, reject) => {
      worker.postMessage({
        type: 'run',
        operationTrace
      });

      worker.addEventListener('message', event => {
        let data = event.data as
          | { type: 'chunks'; chunks: OperationChunk[] }
          | { type: 'done' }
          | { type: 'code'; code: string }
          | { type: 'start'; programName: string }
          | { type: 'operations_per_line'; operations: Record<string, VOTChunkOperation[]> }
          | { type: 'operations_after'; operations: Map<number, Set<number>> }
          | { type: 'full_bytecode'; bytecode: FullBytecodeItem[] }
          | { type: 'reference_bytecode'; bytecode: FullBytecodeItem[] };

        if (data.type == 'chunks') {
          let current = observableOperationChunkList.value;

          let chunkLengths = data.chunks.map(chunk => chunk.operations.length);
          let chunkSize = Math.max(current.chunkSize, ...chunkLengths);

          let firstChunkIndex = current.chunks.length;

          observableOperationChunkList.next({
            chunkSize,
            operationCount: current.operationCount + chunkLengths.reduce((a, b) => a + b, 0),
            chunks: [...current.chunks, ...data.chunks],
            done: false
          });

          logManager.pushChunks({
            firstChunkIndex,
            chunkSize,
            chunks: data.chunks
          });
        } else if (data.type == 'operations_per_line') {
          observableOperationsPerLine.next(data.operations);
        } else if (data.type == 'operations_after') {
          observableOperationsAfter.next(data.operations);
        } else if (data.type == 'code') {
          observableCode.next(data.code);
        } else if (data.type == 'full_bytecode') {
          observableFullBytecodeItems.next(data.bytecode);
        } else if (data.type == 'reference_bytecode') {
          observableReferenceBytecodeItems.next(data.bytecode);
        } else if (data.type == 'start') {
          resolve({ programName: data.programName });
        } else if (data.type == 'done') {
          observableOperationChunkList.next({
            ...observableOperationChunkList.value,
            done: true
          });

          worker.terminate();
        }
      });
    });
  };

  return {
    observableReferenceBytecodeItems,
    observableOperationChunkList,
    observableOperationsPerLine,
    observableFullBytecodeItems,
    observableOperationsAfter,
    observableCode,
    logManager,
    start
  };
};
