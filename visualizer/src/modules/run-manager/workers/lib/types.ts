import { MemoryDiff, SerializedMemory } from '../../../memory';
import { VOTChunkOperation } from '../../../operation-trace';

export interface ChunkList {
  done: boolean;
  chunkSize: number;
  operationCount: number;
  chunks: OperationChunk[];
}

export interface Log {
  ts: number;
  message: string;
}

export interface OperationRunResult {
  type?: 'run';
  id: string;
  logs: Log[];
  afterDiff: MemoryDiff;
  operation: VOTChunkOperation;
}

export interface OperationError {
  type: 'error';
  id: string;
  error: {
    region: string;
    message: string;
    hint: string;
  };
  logs: Log[];
  afterDiff?: undefined;
  operation?: VOTChunkOperation;
}

export type OperationPart = OperationRunResult | OperationError;

export interface OperationChunk {
  id: string;
  snapshot: SerializedMemory;
  operations: OperationPart[];
}
