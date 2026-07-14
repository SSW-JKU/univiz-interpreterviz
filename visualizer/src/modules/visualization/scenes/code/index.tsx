import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { useMemo, useRef } from 'react';
import { ArcherContainer, ArcherElement } from 'react-archer';
import { ArrowRight } from 'react-feather';
import { useWindowScroll } from 'react-use';
import styled from 'styled-components';
import {
  BYTECODE_GAP,
  BYTECODE_HEIGHT,
  useSettings,
  useVisualizationState
} from '../../../state';
import { ErrorBoundary } from '../../components/errorBoundary';
import { BytecodeMenu } from './bytecodeMenu';
import { JumpArrows } from './jumpArrows';
import { CodeResizeBar } from './resizeBar';

let Wrapper = styled(motion.aside)`
  background: black;
  overflow-y: auto;
  padding: 0px 10px 0px 10px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  height: 100%;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  scrollbar-color: #666 #222;
  scrollbar-width: thin;
  scrollbar-track-color: #222;
`;

let CodeWrapper = styled.pre`
  font-size: 1rem;
  padding: 0px;
  margin: 0px;
`;

let CodeInner = styled.code`
  display: block;
  color: white;
  background: black;
  font-size: 12px;
`;

let CodeLine = styled.div`
  display: grid;
  grid-template-columns: 40px calc(100% - 40px);
  position: relative;

  &:hover {
    .line-menu {
      opacity: 1;
      visibility: visible;
    }
  }
`;

let CodeLineContent = styled.p`
  margin: 0;
  padding: 0;
  line-height: 1.5;
  white-space: pre-wrap;
  padding: 5px 10px;
`;

let CodeLineIndex = styled.p`
  display: inline-block;
  width: 40px;
  user-select: none;
  padding: 5px 10px;
  height: 100%;

  &:not(.expanded) {
    background: rgba(255, 255, 255, 0.1);

    &::before {
      position: absolute;
      content: '';
      top: 0;
      bottom: 0;
      left: -10px;
      width: 10px;
      background: rgba(255, 255, 255, 0.1);
    }
  }
`;

let CurrentLineWrapper = styled(motion.div)`
  border-radius: 8px;
  position: relative;

  &::before {
    position: absolute;
    content: '';
    top: 0;
    bottom: 0;
    left: -10px;
    width: 50px;
    background: rgba(255, 255, 255, 0.1);
  }
`;

let BytecodeColsWrapper = styled(motion.div)`
  padding: 0px 5px 10px 45px;
  display: flex;
`;

let BytecodeWrapper = styled(motion.div)`
  padding: 0px 5px;
  display: flex;
  gap: ${BYTECODE_GAP}px;
  flex-direction: column;
  flex: 1;
`;

let Bytecode = styled.div`
  display: inline-flex;
  padding: 0px 10px;
  height: ${BYTECODE_HEIGHT}px;
  align-items: center;
  border-radius: 8px;
  position: relative;

  &:hover {
    .line-menu {
      opacity: 1;
      visibility: visible;
    }
  }

  &.light {
    background: white;
    color: black;

    &.error-mark {
      background: #fe8c96 !important;
      color: #57070d;
    }
  }

  &.dark {
    background: rgba(255, 255, 255, 0.2);
    color: white;

    &.error-mark {
      background: #ff4757 !important;
    }
  }
`;

let BytecodeArrow = styled(motion.span)`
  position: absolute;
  top: calc(50% - 10px);
  left: -25px;
  color: white;
  display: flex;
  align-items: center;
  height: 20px;
`;

let BytecodePC = styled.div`
  position: relative;
  user-select: none;

  span,
  div {
    font-size: 12px;
    font-weight: 600;
  }

  span {
    opacity: 0.5;
    height: 100%;
    display: flex;
    align-items: center;
  }

  div {
    position: absolute;
    top: -2px;
    bottom: -2px;
    right: -7px;
    background: white;
    color: black;
    border-radius: 8px;
    padding: 2px 7px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    opacity: 0;
    z-index: 100;
    transition: all 0.3s ease-out;
    transform: scale(1);
    visibility: hidden;
  }

  &:hover div {
    opacity: 1;
    transform: scale(1.1);
    transition: all 0.2s ease;
    visibility: visible;
  }
`;

export let Code = () => {
  let {
    operationState: {
      code,
      jumpInfo,
      linesToExpand,
      bytecodeArrows,
      currentOperation,
      operationsPerLine,
      referenceBytecodeItems,
      bytecodeOpsPerLineNormalized
    }
  } = useVisualizationState();
  let { showAllBytecode, codeBarWidth } = useSettings();

  let scrollRef = useRef<HTMLDivElement>(null);

  let currentLine = currentOperation?.operation?.properties.operation.line;
  let lines = useMemo(() => code.split('\n'), [code]);

  let { x } = useWindowScroll();
  let lastScrollElementRef = useRef<HTMLDivElement | null>(null);

  let referenceBytecodeItemsByLine = useMemo(
    () =>
      referenceBytecodeItems.reduce(
        (acc, item) => {
          let line = item.line;
          if (!acc[line]) acc[line] = [];
          acc[line].push(item);
          return acc;
        },
        {} as Record<number, typeof referenceBytecodeItems>
      ),
    [referenceBytecodeItems]
  );

  let referenceBytecodeDifferences = useMemo(() => {
    let allLines = new Set([
      ...Object.keys(referenceBytecodeItemsByLine),
      ...Object.keys(bytecodeOpsPerLineNormalized)
    ]);

    let pcsToMark = new Set<number>();

    for (let lineString of allLines) {
      let line = Number(lineString);

      let referenceOps = referenceBytecodeItemsByLine[line] ?? [];
      let normalizedOps = bytecodeOpsPerLineNormalized.get(line) ?? [];

      let referencePcs = new Set(referenceOps.map(op => op.pc));
      let normalizedPcs = new Set(normalizedOps.map(op => op.pc));

      let missingPCs = new Set([...referencePcs].filter(pc => !normalizedPcs.has(pc)));
      let extraPCs = new Set([...normalizedPcs].filter(pc => !referencePcs.has(pc)));

      let differentOperations = referenceOps
        .filter((op, i) => {
          let normalizedOp = normalizedOps[i];
          if (!normalizedOp) return true;

          return op.opcode.trim() != normalizedOp.opcode.trim();
        })
        .map(op => op.pc);

      for (let pc of missingPCs) pcsToMark.add(pc);
      for (let pc of extraPCs) pcsToMark.add(pc);
      for (let pc of differentOperations) pcsToMark.add(pc);
    }

    return pcsToMark;
  }, [referenceBytecodeItemsByLine, bytecodeOpsPerLineNormalized]);

  return (
    <ErrorBoundary>
      <CodeResizeBar />
      <div style={{ height: 100, width: codeBarWidth }} />

      <Wrapper
        style={{
          zIndex: x > 10 ? 250 : 50,
          width: codeBarWidth
        }}
        ref={scrollRef}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
      >
        <ArcherContainer
          strokeColor="#8854d0"
          // strokeDasharray="10,2"
          strokeWidth={3}
          svgContainerStyle={{ zIndex: 100 }}
        >
          <CodeWrapper>
            <JumpArrows />

            <CodeInner>
              {lines.map((line, i) => {
                let lineNumber = i + 1;
                let isCurrentLine = currentLine == lineNumber;
                let highlight = linesToExpand.includes(lineNumber);

                let mustExpandForJump = jumpInfo.otherLinesToExpand.includes(lineNumber);

                let normalizedOperationsOfLine =
                  bytecodeOpsPerLineNormalized.get(lineNumber) ?? [];

                let referenceOperationsOfLine = referenceBytecodeItemsByLine[lineNumber] ?? [];

                let pcsInLine = new Set([
                  ...normalizedOperationsOfLine.map(op => op.pc),
                  ...referenceOperationsOfLine.map(op => op.pc)
                ]);
                let hasDifferences = [...pcsInLine].some(pc =>
                  referenceBytecodeDifferences.has(pc)
                );

                let expanded =
                  isCurrentLine ||
                  showAllBytecode ||
                  highlight ||
                  mustExpandForJump ||
                  hasDifferences;

                // if (hasDifferences) expanded = true;

                let inner = (
                  <CodeLine
                    key={i}
                    ref={
                      isCurrentLine
                        ? el => {
                            if (
                              el &&
                              scrollRef.current &&
                              lastScrollElementRef.current != el
                            ) {
                              lastScrollElementRef.current = el;

                              setTimeout(
                                () =>
                                  el.scrollIntoView({ behavior: 'smooth', block: 'center' }),
                                100
                              );
                            }
                          }
                        : undefined
                    }
                  >
                    <CodeLineIndex
                      className={clsx({
                        expanded: expanded && normalizedOperationsOfLine.length
                      })}
                    >
                      {lineNumber}
                    </CodeLineIndex>{' '}
                    <CodeLineContent>{line}</CodeLineContent>
                    {!expanded && operationsPerLine[String(lineNumber)]?.length && (
                      <BytecodeMenu for={{ type: 'line', lineNumber }} />
                    )}
                  </CodeLine>
                );

                if (expanded && normalizedOperationsOfLine.length) {
                  inner = (
                    <ArcherElement
                      key={i}
                      id={`line-${lineNumber}`}
                      relations={
                        isCurrentLine
                          ? bytecodeArrows
                              .filter(a => a.source.line == currentLine)
                              .flatMap(arrow =>
                                arrow.targets.map(target => ({
                                  targetId:
                                    target.type == 'line'
                                      ? `line-${target.line}`
                                      : `op-${target.pc}`,
                                  targetAnchor: target.line > lineNumber ? 'top' : 'bottom',
                                  sourceAnchor: target.line > lineNumber ? 'bottom' : 'top'
                                }))
                              )
                          : []
                      }
                    >
                      <CurrentLineWrapper
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          marginTop: mustExpandForJump ? 10 : 0
                        }}
                        style={{
                          // marginTop: showAllBytecode ? 10 : 0,
                          background: isCurrentLine
                            ? '#8854d0'
                            : highlight || mustExpandForJump || hasDifferences
                              ? '#444'
                              : 'transparent'
                        }}
                        key={`current-${i}`}
                      >
                        <div>{inner}</div>

                        <div>
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{
                              height:
                                normalizedOperationsOfLine.length * BYTECODE_HEIGHT +
                                (normalizedOperationsOfLine.length - 1) * BYTECODE_GAP +
                                10
                            }}
                            style={{ overflow: 'hidden' }}
                          >
                            <BytecodeColsWrapper>
                              <BytecodeWrapper
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                              >
                                {normalizedOperationsOfLine.map((op, i) => {
                                  let isCurrentBytecode =
                                    currentOperation?.operation?.properties.operation.pc ==
                                    op.pc;

                                  let shouldMark = referenceBytecodeDifferences.has(op.pc);

                                  return (
                                    <ArcherElement key={i} id={`op-${op.pc}`}>
                                      <Bytecode
                                        key={i}
                                        data-pc={String(op.pc)}
                                        className={clsx({
                                          'error-mark': shouldMark,
                                          light: isCurrentLine || mustExpandForJump,
                                          dark: !(isCurrentLine || mustExpandForJump)
                                        })}
                                      >
                                        <BytecodePC>
                                          <div>PC = {op.pc}</div>
                                          <span>{op.pc}</span>
                                        </BytecodePC>

                                        <span style={{ userSelect: 'none' }}>: </span>

                                        {op.opcode}

                                        <AnimatePresence>
                                          {isCurrentBytecode && (
                                            <BytecodeArrow
                                              initial={{ opacity: 0, y: -5 }}
                                              animate={{ opacity: 1, y: 0 }}
                                              exit={{ opacity: 0, y: 5 }}
                                            >
                                              <ArrowRight />
                                            </BytecodeArrow>
                                          )}
                                        </AnimatePresence>

                                        {op.type == 'executed' && (
                                          <BytecodeMenu
                                            for={{
                                              type: 'bytecode',
                                              lineNumber,
                                              pc: op.pc
                                            }}
                                          />
                                        )}
                                      </Bytecode>
                                    </ArcherElement>
                                  );
                                })}
                              </BytecodeWrapper>

                              {hasDifferences && (
                                <BytecodeWrapper
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                >
                                  {referenceOperationsOfLine.map((op, i) => {
                                    let shouldMark = referenceBytecodeDifferences.has(op.pc);

                                    return (
                                      <ArcherElement key={i} id={`op-${op.pc}`}>
                                        <Bytecode
                                          key={i}
                                          data-pc={String(op.pc)}
                                          className={clsx({
                                            'error-mark': shouldMark,
                                            light: isCurrentLine || mustExpandForJump,
                                            dark: !(isCurrentLine || mustExpandForJump)
                                          })}
                                        >
                                          {op.opcode}

                                          <BytecodeMenu
                                            for={{
                                              type: 'bytecode',
                                              lineNumber,
                                              pc: op.pc
                                            }}
                                          />
                                        </Bytecode>
                                      </ArcherElement>
                                    );
                                  })}
                                </BytecodeWrapper>
                              )}
                            </BytecodeColsWrapper>
                          </motion.div>
                        </div>
                      </CurrentLineWrapper>
                    </ArcherElement>
                  );
                }

                return inner;
              })}
            </CodeInner>
          </CodeWrapper>
        </ArcherContainer>
      </Wrapper>
    </ErrorBoundary>
  );
};
