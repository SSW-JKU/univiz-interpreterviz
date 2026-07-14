import { useCallback, useEffect, useRef, useState } from 'react';
import { useAutoRef } from '../../../lib';
import { useNavigateWithPrefix } from '../../../lib/hooks/useNavigateWithPrefix';
import { FullBytecodeItem } from '../../../memory';
import { VOTChunkOperation } from '../../../operation-trace';
import { RunManager } from '../../../run-manager';
import { MemoryWorkerManager } from '../../../run-manager/workers/memory/manager';

export let useOperationManager = (runId: string) => {
  let [manager, setManager] = useState<MemoryWorkerManager | null>(null);
  let navigate = useNavigateWithPrefix();

  let [operationCount, setOperationCount] = useState(0);
  let [isDone, setIsDone] = useState(false);
  let [code, setCode] = useState('');
  let [operationsPerLine, setOperationsPerLine] = useState<
    Record<string, VOTChunkOperation[]>
  >({});
  let [fullBytecodeItems, setFullBytecodeItems] = useState<FullBytecodeItem[]>(
    () => manager?.fullBytecodeItems.getFullBytecodeItems() ?? []
  );
  let [referenceBytecodeItems, setReferenceBytecodeItems] = useState<FullBytecodeItem[]>(
    () => manager?.referenceBytecodeItems.getReferenceBytecodeItems() ?? []
  );

  let startedRef = useRef('');
  useEffect(() => {
    if (startedRef.current === runId) return;
    startedRef.current = runId;

    (async () => {
      manager = await RunManager.get(runId);
      if (!manager) return navigate('/');

      await manager.start();

      setManager(manager);

      setOperationCount(manager.operationCount.getValue());
      setIsDone(manager.done.isDone());
      setCode(manager.code.getCode());
      setOperationsPerLine(manager.operationsPerLine.getOperations());
    })().catch(console.error);
  }, [runId]);

  useEffect(
    () =>
      manager?.operationCount.onChange(() =>
        setOperationCount(manager!.operationCount.getValue())
      ),
    [manager]
  );

  useEffect(() => manager?.done.onDone(() => setIsDone(manager!.done.isDone())), [manager]);
  useEffect(() => manager?.code.onCode(() => setCode(manager!.code.getCode())), [manager]);
  useEffect(() => {
    setFullBytecodeItems(manager?.fullBytecodeItems.getFullBytecodeItems() ?? []);

    return manager?.fullBytecodeItems.onFullBytecodeItems(() =>
      setFullBytecodeItems(manager!.fullBytecodeItems.getFullBytecodeItems())
    );
  }, [manager]);
  useEffect(() => {
    setReferenceBytecodeItems(
      manager?.referenceBytecodeItems.getReferenceBytecodeItems() ?? []
    );

    return manager?.referenceBytecodeItems.onReferenceBytecodeItems(() =>
      setReferenceBytecodeItems(manager!.referenceBytecodeItems.getReferenceBytecodeItems())
    );
  }, [manager]);
  useEffect(
    () =>
      manager?.operationsPerLine.onOperations(() =>
        setOperationsPerLine(manager!.operationsPerLine.getOperations())
      ),
    [manager]
  );

  let managerRef = useAutoRef(manager);

  let getOperation = useCallback(
    (index: number) => managerRef.current?.getOperation(index),
    []
  );

  let getOperationAtLine = useCallback(
    async ({ currentIndex, line }: { currentIndex: number; line: number }) =>
      managerRef.current?.getOperationAtLine({ currentIndex, line }),
    []
  );

  let getOperationsAtSameLine = useCallback(
    (index: number) => managerRef.current?.getOperationsAtSameLine(index),
    []
  );

  let getOperationInfo = useCallback(
    (pc: number) => managerRef.current?.getOperationInfo(pc),
    []
  );

  return {
    code,
    isDone,
    getOperation,
    operationCount,
    fullBytecodeItems,
    operationsPerLine,
    referenceBytecodeItems,

    getOperationInfo,
    getOperationAtLine,
    getOperationsAtSameLine
  };
};
