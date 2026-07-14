import { run } from '../../../runner';
import { parsedVizspec } from '../../../state/vizspec';
import { OperationChunk } from '../lib/types';

let MAX_CHUNKS_TO_SEND = 5;
let MAX_OPERATIONS_TO_SEND = 1000;

let currentChunks: OperationChunk[] = [];
let totalChunksSent = 0;

let sendChunk = (chunk: OperationChunk | null) => {
  if (chunk) currentChunks.push(chunk);

  if (currentChunks.length == 0) return;

  if (
    !chunk ||
    totalChunksSent == 0 ||
    currentChunks.length >= MAX_CHUNKS_TO_SEND ||
    currentChunks.reduce((a, b) => a + b.operations.length, 0) >= MAX_OPERATIONS_TO_SEND
  ) {
    postMessage({ type: 'chunks', chunks: currentChunks });
    totalChunksSent += currentChunks.length;
    currentChunks = [];
  }
};

addEventListener('message', async event => {
  let data = event.data as { type: 'run'; operationTrace: File | Blob };

  let bcFile = data.operationTrace;

  let uint8Stream = bcFile.stream();
  let textStream = uint8Stream.pipeThrough(new TextDecoderStream());

  let chunkSize = 100;
  if (bcFile.size > 5_000_000) chunkSize = 500;
  if (bcFile.size > 10_000_000) chunkSize = 1000;

  let resultIterator = run({
    operationTraceStream: textStream,
    vizSpec: parsedVizspec,
    chunkSize
  });

  for await (let chunk of resultIterator) {
    if ('type' in chunk && chunk.type == 'code') {
      postMessage({ type: 'code', code: chunk.code });
    } else if ('type' in chunk && chunk.type == 'start') {
      postMessage({ type: 'start', programName: chunk.programName });
    } else if ('type' in chunk && chunk.type == 'operations_per_line') {
      postMessage({ type: 'operations_per_line', operations: chunk.operations });
    } else if ('type' in chunk && chunk.type == 'operations_after') {
      postMessage({ type: 'operations_after', operations: chunk.after });
    } else if ('type' in chunk && chunk.type == 'full_bytecode') {
      postMessage({ type: 'full_bytecode', bytecode: chunk.bytecode });
    } else if ('type' in chunk && chunk.type == 'reference_bytecode') {
      postMessage({ type: 'reference_bytecode', bytecode: chunk.bytecode });
    } else {
      sendChunk(chunk as OperationChunk);
    }
  }

  sendChunk(null);
  postMessage({ type: 'done' });
});
