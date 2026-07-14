import { Log, OperationChunk } from './types';

export let createLogManager = () => {
  let logs: Log[][] = [];

  let pushChunk = (opts: { chunkIndex: number; chunkSize: number; chunk: OperationChunk }) => {
    for (let i = 0; i < opts.chunk.operations.length; i++) {
      logs[opts.chunkIndex * opts.chunkSize + i] =
        (opts.chunk.operations[i] as any).logs ?? [];
    }
  };

  let pushChunks = (opts: {
    firstChunkIndex: number;
    chunkSize: number;
    chunks: OperationChunk[];
  }) => {
    for (let i = 0; i < opts.chunks.length; i++) {
      pushChunk({
        chunkIndex: opts.firstChunkIndex + i,
        chunkSize: opts.chunkSize,
        chunk: opts.chunks[i]
      });
    }
  };

  let getLogs = (operationIndex: number) => {
    let logsForOperation: Log[] = [];

    for (let i = 0; i < logs.length && i <= operationIndex; i++) {
      logsForOperation.push(...logs[i]);
    }

    return logsForOperation;
  };

  return { pushChunks, getLogs };
};
