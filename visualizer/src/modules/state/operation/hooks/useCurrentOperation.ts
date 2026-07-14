import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useAutoExpand } from '../../animation/hooks/useExpanded';
import { parsedVizspec } from '../../vizspec';
import { useOperationManager } from './useOperationManager';

interface BytecodeArrow {
  source: { type: 'line'; line: number };
  targets: (
    | { type: 'line'; line: number }
    | { type: 'operation'; pc: number; line: number }
  )[];
}

let lastOperationIndexRef = { runId: '', index: -1 };

export type Operation = NonNullable<
  Awaited<ReturnType<ReturnType<typeof useOperationManager>['getOperation']>>
>;

export let useCurrentOperation = (runId: string) => {
  let manager = useOperationManager(runId);

  let [operationIndex, _setOperationIndex] = useState(-1);
  let [currentOperation, setOperation] = useState<Operation | null>(null);

  let [linesToExpand, setLinesToExpand] = useState<number[]>([]);
  let [bytecodeArrows, setBytecodeArrows] = useState<BytecodeArrow[]>([]);

  let operationIndexRef = useRef<number>(-1);
  useEffect(() => {
    if (operationIndexRef.current !== operationIndex) {
      operationIndexRef.current = operationIndex;

      if (operationIndex < 0 || operationIndex > manager.operationCount) return;

      manager.getOperation(operationIndex)?.then(async o => {
        let metacodeOp = parsedVizspec.operations.find(
          mo => mo.identifier == o.operation?.name
        );
        if (
          metacodeOp?.flags.highlightNextForCall &&
          operationIndex + 1 < manager.operationCount
        ) {
          try {
            let next = await manager.getOperation(operationIndex + 1);
            let nextLine = next?.operation?.properties.operation.line;

            if (nextLine) {
              setLinesToExpand([nextLine]);
              setBytecodeArrows([
                {
                  source: { type: 'line', line: o.operation?.properties.operation.line ?? -1 },
                  targets: [
                    {
                      type: 'operation',
                      pc: next?.operation?.properties.operation.pc ?? -1,
                      line: nextLine
                    }
                  ]
                }
              ]);
            }
          } catch (e) {
            console.error(e);
          }
        } else {
          setLinesToExpand([]);
          setBytecodeArrows([]);
        }

        setOperation(o);
      });
    }
  }, [operationIndex, manager, operationIndexRef]);

  let operationCountRef = useRef<number>(manager.operationCount);
  operationCountRef.current = manager.operationCount;
  let setOperationIndex = useCallback(
    (index: number) => {
      if (index < 0) index = 0;
      if (index > operationCountRef.current) index = operationCountRef.current;

      _setOperationIndex(index);

      lastOperationIndexRef = { runId, index };
    },
    [_setOperationIndex]
  );

  useEffect(() => {
    if (manager.operationCount > 0 && operationIndex === -1) {
      let last = lastOperationIndexRef.runId == runId ? lastOperationIndexRef.index : -1;
      let newIndex = Math.max(0, Math.min(last, manager.operationCount - 1));

      setOperationIndex(newIndex);
    }
  }, [manager.operationCount, operationIndex, setOperationIndex]);

  let line = useMemo(
    () => currentOperation?.operation?.properties.operation.line ?? -1,
    [currentOperation]
  );

  let operationsOfCurrentLine = useMemo(() => {
    let ops = manager.operationsPerLine[String(line)];
    return ops ?? [];
  }, [manager.operationsPerLine, line]);

  let getOperationAtLine = useCallback(
    async (line: number) => {
      let op = await manager?.getOperationAtLine({
        currentIndex: operationIndexRef.current,
        line
      });
      return op;
    },
    [manager]
  );

  let getOperationAtLineAndPC = useCallback(
    async (opts: { pc?: number; lineNumber: number }) => {
      let lineOperation = await getOperationAtLine(opts.lineNumber);
      if (!lineOperation) {
        toast.error(`No operation found at line ${opts.lineNumber}`);
        return;
      }

      if (opts.pc !== undefined) {
        let opsAtLine = await manager?.getOperationsAtSameLine(lineOperation.index);
        if (!opsAtLine) return;

        return opsAtLine.find(o => o.properties.operation.pc == opts.pc);
      } else {
        let lineOp = lineOperation.operation.operation;
        if (lineOp) return { ...lineOp, index: lineOperation.index };
      }
    },
    [getOperationAtLine, manager]
  );

  let jumpTo = useCallback(
    async (opts: { pc?: number; lineNumber: number }) => {
      let op = await getOperationAtLineAndPC(opts);
      if (op) setOperationIndex(op.index);
    },
    [getOperationAtLineAndPC]
  );

  let nextOperation = useCallback(() => {
    setOperationIndex(operationIndexRef.current + 1);
  }, []);

  let currentLine = currentOperation?.operation?.properties.operation.line ?? -1;

  useAutoExpand(currentOperation);

  return {
    manager,
    code: manager.code,
    isDone: manager.isDone,
    operationCount: manager.operationCount,
    operationsPerLine: manager.operationsPerLine,
    fullBytecodeItems: manager.fullBytecodeItems,
    referenceBytecodeItems: manager.referenceBytecodeItems,

    jumpTo,
    nextOperation,

    currentLine,
    operationIndex,
    currentOperation,
    setOperationIndex,
    getOperationAtLine,
    getOperationAtLineAndPC,
    operationsOfCurrentLine,

    linesToExpand,
    bytecodeArrows
  };
};

export type OperationStateCurrent = ReturnType<typeof useCurrentOperation>;
