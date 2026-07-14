import { useMemo } from 'react';
import { FullBytecodeItem } from '../../../memory';
import { parsedVizspec } from '../../vizspec';
import { OperationStateCurrent } from './useCurrentOperation';

export let useOperationBytecode = ({
  operationsPerLine,
  fullBytecodeItems
}: OperationStateCurrent) => {
  let bytecodeOpsPerLineNormalized = useMemo(() => {
    let lines = new Set([
      ...fullBytecodeItems.map(fbi => fbi.line),
      ...Object.keys(operationsPerLine).map(Number)
    ]);

    let executedOperationsByLineMap = new Map(
      Object.entries(operationsPerLine).map(([line, ops]) => [Number(line), ops])
    );

    let fullBytecodeByLineMap = new Map<number, FullBytecodeItem[]>();
    for (let fbi of fullBytecodeItems) {
      let line = fbi.line;
      if (!fullBytecodeByLineMap.has(line)) fullBytecodeByLineMap.set(line, []);
      fullBytecodeByLineMap.get(line)!.push(fbi);
    }

    return new Map(
      [...lines].map(line => {
        let executedOperations = executedOperationsByLineMap.get(line) ?? [];
        let allOperations = fullBytecodeByLineMap.get(line) ?? [];
        let executedPcs = new Set(executedOperations.map(o => o.properties.operation.pc));

        return [
          line,
          [
            ...executedOperations.map(op => {
              let operation = op.properties.operation;
              let meta = parsedVizspec.operations.find(
                mo => mo.identifier === op.properties.vizop
              )!;

              let fullBytecodeItem = fullBytecodeItems.find(fbi => fbi.pc === operation.pc);

              return {
                type: 'executed' as const,

                meta,
                line,
                pc: operation.pc,
                opcode:
                  fullBytecodeItem?.opcode ??
                  [operation.name, operation.args.join(' ')].join(' ')
              };
            }),

            ...allOperations
              .filter(op => !executedPcs.has(op.pc))
              .map(op => {
                let meta = parsedVizspec.operations.find(mo => mo.identifier === op.vizop)!;

                return {
                  type: 'other' as const,

                  meta,
                  line,
                  pc: op.pc,
                  opcode: op.opcode
                };
              })
          ].sort((a, b) => a.pc - b.pc)
        ];
      })
    );
  }, [operationsPerLine, fullBytecodeItems]);

  let bytecodeLineForPc = useMemo(() => {
    let map = new Map<number, number>();
    for (let [line, ops] of bytecodeOpsPerLineNormalized) {
      for (let op of ops) map.set(op.pc, line);
    }
    return map;
  }, [bytecodeOpsPerLineNormalized]);

  return {
    bytecodeLineForPc,
    bytecodeOpsPerLineNormalized
  };
};

export type OperationStateBytecode = ReturnType<typeof useOperationBytecode>;
