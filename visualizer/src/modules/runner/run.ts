import { ID } from '../lib';
import {
  createInitialMemory,
  getMemoryDiff,
  SerializedMemory,
  serializeMemory
} from '../memory';
import { operationTrace, VOTChunkOperation } from '../operation-trace';
import { OperationChunk, OperationRunResult } from '../run-manager';
import { VizSpec } from '../vizspec';
import { RunError } from './error';
import { OperationRunner } from './operationRunner';

let emptyChunk = (snapshot: SerializedMemory): OperationChunk => ({
  id: ID.chunk.generate(),
  snapshot,
  operations: []
});

export async function* run(opts: {
  operationTraceStream: ReadableStream<String>;
  vizSpec: VizSpec;
  chunkSize: number;
}) {
  // Set up memory
  let memory = createInitialMemory(opts.vizSpec);

  // Start processing operation trace
  let operationTraceProcessor = await operationTrace.process(opts.operationTraceStream);
  let valuesMap = new Map(operationTraceProcessor.initialValues.entries() ?? []);

  yield { type: 'start' as const, programName: operationTraceProcessor.programName };

  // Map list of viz operations to a map
  let vizOperationMap = new Map(
    opts.vizSpec.operations.flatMap(operation => [
      [operation.identifier, operation],
      ...(operation.aliases ?? []).map(alias => [alias, operation] as const)
    ])
  );

  // Keep track of operations per line
  let operationsPerLine = new Map<number, Map<number, VOTChunkOperation>>();
  let afterOperationMap = new Map<number, Set<number>>();
  let getOperationsPerLineNormalized = () =>
    Object.fromEntries(
      [...operationsPerLine.entries()].map(([line, operations]) => [
        String(line),
        [...operations.values()].sort(
          (a, b) => a.properties.operation.pc - b.properties.operation.pc
        )
      ])
    );

  if (operationTraceProcessor.source) {
    yield { type: 'code' as const, code: operationTraceProcessor.source };
  }

  // Create operation runner and run the init script
  let operationRunner = await OperationRunner.create(
    memory,
    operationTraceProcessor.source ?? '',
    opts.vizSpec,
    valuesMap
  );

  yield { type: 'full_bytecode' as const, bytecode: memory.bytecode };
  yield { type: 'reference_bytecode' as const, bytecode: memory.referenceBytecode };

  // Create initial chunk
  let currentSnapshot = serializeMemory(memory);
  let currentChunk = emptyChunk(currentSnapshot);

  let previousOperationPC = -1;

  let lastChunk: OperationRunResult | undefined;

  for await (let traceOperation of operationTraceProcessor.operationIterator) {
    if (traceOperation.type == 'operation') {
      let vizOperation = vizOperationMap.get(traceOperation.name);
      if (!vizOperation) throw new RunError(`No operation found for ${traceOperation.name}`);

      let currentPc = traceOperation.properties.operation.pc;
      if (afterOperationMap.has(previousOperationPC)) {
        afterOperationMap.get(previousOperationPC)!.add(currentPc);
      } else {
        afterOperationMap.set(previousOperationPC, new Set([currentPc]));
      }
      previousOperationPC = currentPc;

      // Run the operation's vizSpec implementation
      let runResult = await operationRunner.runOperation({ vizOperation, traceOperation });

      // Get a snapshot and diff of the updated memory after the operation
      let afterSnapshot = serializeMemory(memory);
      let afterDiff = getMemoryDiff({ before: currentSnapshot, after: afterSnapshot });

      // If the chunk is full, yield it
      if (currentChunk.operations.length >= opts.chunkSize) {
        yield currentChunk;
        yield {
          type: 'operations_per_line' as const,
          operations: getOperationsPerLineNormalized()
        };

        currentChunk = emptyChunk(currentSnapshot);
      }

      // Set the new snapshot
      currentSnapshot = afterSnapshot;

      lastChunk = {
        id: ID.operation.generate(),
        afterDiff,
        operation: traceOperation,
        logs: runResult.logs
      };

      // Add the operation to the chunk
      currentChunk.operations.push(lastChunk);

      // Update the operations per line map
      if (!operationsPerLine.has(traceOperation.properties.operation.line)) {
        operationsPerLine.set(
          traceOperation.properties.operation.line,
          new Map([[traceOperation.properties.operation.pc, traceOperation]])
        );
      } else {
        operationsPerLine
          .get(traceOperation.properties.operation.line)!
          .set(traceOperation.properties.operation.pc, traceOperation);
      }
    } else if (traceOperation.type == 'value') {
      valuesMap.set(traceOperation.name, traceOperation.value);
    } else if (traceOperation.type == 'error') {
      currentChunk.operations.push({
        type: 'error',
        id: ID.operation.generate(),
        afterDiff: undefined,
        operation: lastChunk?.operation
          ? {
              ...lastChunk.operation,
              properties: {
                vizop: traceOperation.properties.vizop,
                operation: traceOperation.properties.operation,
                args: {}
              }
            }
          : undefined,
        logs: [],
        error: {
          region: traceOperation.properties.region,
          message: traceOperation.properties.message,
          hint: traceOperation.properties.hint
        }
      });

      console.log(
        'error',
        JSON.stringify(currentChunk.operations[currentChunk.operations.length - 1], null, 2)
      );
    }
  }

  if (currentChunk.operations.length) yield currentChunk;

  let opsPerLine = getOperationsPerLineNormalized();
  yield { type: 'operations_per_line' as const, operations: opsPerLine };
  yield { type: 'operations_after' as const, after: afterOperationMap };

  // let fullBytecode = memory.bytecode.map(item => {
  //   let line = parseInt(
  //     Object.entries(opsPerLine).find(([line, ops]) =>
  //       ops.some(op => op.properties.operation.pc == item.pc)
  //     )?.[0] ?? item.line.toString()
  //   );
  //   return { ...item, line };
  // });
  yield { type: 'full_bytecode' as const, bytecode: memory.bytecode };
  yield { type: 'reference_bytecode' as const, bytecode: memory.referenceBytecode };

  return { finalMemory: memory };
}
