import { useEffect, useMemo, useState } from 'react';
import { unique } from '../../../lib/utils/unique';
import { VSOperation } from '../../../vizspec';
import { OperationStateCurrent } from './useCurrentOperation';
import { OperationStateBytecode } from './useOperationBytecode';

export interface JumpOperation {
  pc: number;
  line: number;
  opcode: string;
  meta: VSOperation;
  jumpDestinations: number[];
}

export let useOperationJumps = ({
  bytecodeOpsPerLineNormalized,
  bytecodeLineForPc,
  currentOperation,
  currentLine,
  manager,
  code
}: OperationStateCurrent & OperationStateBytecode) => {
  let [jumpInfo, setJumpInfo] = useState<{
    jumpOperations: JumpOperation[];
    otherLinesToExpand: number[];
  }>({
    jumpOperations: [],
    otherLinesToExpand: []
  });

  let mappableBytecodeOpsPerLine = useMemo(
    () => [...bytecodeOpsPerLineNormalized.entries()],
    [bytecodeOpsPerLineNormalized]
  );

  let sourceLines = useMemo(() => code.split('\n'), [code]);

  useEffect(() => {
    if (currentOperation === undefined) {
      return setJumpInfo({
        jumpOperations: [],
        otherLinesToExpand: []
      });
    }

    (async () => {
      // For a given line, find the operations of said line and
      // which PCs they lead to
      let findTargetOperationsForLine = async (line: number) => {
        let targetLineOperations = await Promise.all(
          bytecodeOpsPerLineNormalized.get(line)?.flatMap(async op => {
            let info = await manager.getOperationInfo(op.pc)!;
            if (!info) return [];

            let after = new Set(info.after);

            if (op.meta.flags.highlightJumps) {
              let dest = Number(op.opcode.split(' ')[1]);
              after.add(dest + op.pc);
            }

            if (op.meta.identifier == 'optional_jump') after.add(op.pc + 3);

            return {
              before: info.before,
              after: [...after],
              operation: op,
              meta: op.meta
            };
          }) ?? []
        ).then(o => o.flat());

        return targetLineOperations;
      };

      // Same as above, but for multiple lines
      let findTargetOperationsForLines = async (lines: number[]) =>
        unique(
          await Promise.all(lines.map(findTargetOperationsForLine)).then(o => o.flat()),
          (a, b) => a.operation.pc === b.operation.pc
        );

      let currentLineCode = sourceLines[currentLine - 1]?.toLowerCase() ?? '';
      let currentLineIsIf =
        currentLineCode.includes('if') || currentLineCode.includes('switch');

      let linesToExpand = new Set<number>([currentLine]);
      let jumpOperations: JumpOperation[] = [];

      let currentLinePcRange = [0, 0];

      // We need to runs to also find & expand back jumps for loops
      for (let i = 0; i < 2; i++) {
        // Find the target operations of the current lines to expand
        let currentTargetOperations = await findTargetOperationsForLines([...linesToExpand]);

        // Abort if there are no jump operations
        if (!currentTargetOperations.some(o => o.meta.flags.highlightJumps)) {
          break;
        }

        if (i == 0) {
          currentLinePcRange = [
            Math.min(...currentTargetOperations.map(o => o.operation.pc)),
            Math.max(...currentTargetOperations.map(o => o.operation.pc))
          ];
        }

        // Find the jump destinations of all current jump operations
        let linesWithOperationToJumpTo = currentTargetOperations
          .filter(o => o.meta.flags.highlightJumps)
          .flatMap(jumpOp =>
            mappableBytecodeOpsPerLine
              .filter(([_, ops]) => ops.some(op => jumpOp.after.includes(op.pc)))
              .map(([line]) => Number(line))
          );

        // Find other operations which jump to any of the current lines
        // e.g., when we jump back to the start of the loop
        // after the loop body ends
        let linesWithOperationWhichJumpTo = currentLineIsIf
          ? []
          : currentTargetOperations.flatMap(jumpOp =>
              mappableBytecodeOpsPerLine
                .filter(([_, ops]) =>
                  ops.some(op => jumpOp.before.includes(op.pc) && op.meta.flags.highlightJumps)
                )
                .flatMap(([line]) => Number(line))
            );

        linesToExpand = new Set(
          [
            ...linesToExpand,
            ...linesWithOperationToJumpTo,
            ...linesWithOperationWhichJumpTo
          ].flatMap(l => [l, l + 1])
        );

        let linesToFindJumpOperations = false ? [currentLine] : [...linesToExpand];

        // Find only the jump operation of the current lines
        jumpOperations = (await findTargetOperationsForLines(linesToFindJumpOperations))
          .filter(o => o.meta.flags.highlightJumps)
          // .filter(o => {
          //   let codeLine = sourceLines[o.operation.line - 1].toLowerCase();
          //   let isIf =
          //     codeLine.includes('if') ||
          //     codeLine.includes('else') ||
          //     codeLine.includes('switch');
          //   let isLoop = codeLine.includes('for') || codeLine.includes('while');

          //   if (!isIf && !isLoop) return true;

          //   // return o.operation.line === currentLine;

          //   return true;
          // })
          .map(o => ({
            ...o.operation,
            meta: o.meta,
            jumpDestinations: o.after
          }));
      }

      // Filter out jump operations which are not related to the current line
      // or are part of an else block
      jumpOperations = jumpOperations.filter(j => {
        let fromPc = j.pc;
        let toPcs = j.jumpDestinations;

        let relatedToCurrentLine =
          (fromPc >= currentLinePcRange[0] && fromPc <= currentLinePcRange[1]) ||
          toPcs.some(pc => pc >= currentLinePcRange[0] && pc <= currentLinePcRange[1]);

        let codeLine = sourceLines[j.line - 1]?.toLowerCase() ?? '';
        let isElse = codeLine.includes('else');

        return relatedToCurrentLine || (isElse && currentLineIsIf);
      });

      // Remove jumps to the next operation
      jumpOperations = jumpOperations
        .map(j => ({
          ...j,
          jumpDestinations: j.jumpDestinations.filter(pc => Math.abs(j.pc - pc) > 3)
        }))
        .filter(j => j.jumpDestinations.length);

      let jumpOperationLines = new Set(
        jumpOperations.flatMap(j => {
          let fromLine = bytecodeLineForPc.get(j.pc)!;
          let toLines = j.jumpDestinations.map(pc => bytecodeLineForPc.get(pc)!);

          return [fromLine, ...toLines].filter(Boolean);
        })
      );

      setJumpInfo({
        jumpOperations,
        otherLinesToExpand: [...linesToExpand].filter(l => jumpOperationLines.has(l))
      });
    })().catch(console.error);
  }, [
    currentLine,
    mappableBytecodeOpsPerLine,
    bytecodeOpsPerLineNormalized,
    currentOperation
  ]);

  return {
    jumpInfo
  };
};
