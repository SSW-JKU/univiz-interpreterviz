import * as Comlink from 'comlink';
import { createListeners } from '../../../lib/utils';
import { FullBytecodeItem } from '../../../memory';
import { VOTChunkOperation } from '../../../operation-trace';
import type { MemoryWorker } from './worker';
import Worker from './worker?worker';

export type OperationSnapshot = ReturnType<MemoryWorker['getOperation']>;
export type Region = OperationSnapshot['snapshot']['regions'][0];
export type Pointers = OperationSnapshot['snapshot']['pointers'][0];
export type Entries = OperationSnapshot['snapshot']['entries'][0];

export let createMemoryWorkerManager = (operationTrace: File | Blob) => {
  let worker = new Worker();
  let manager = Comlink.wrap<MemoryWorker>(worker);

  let getOperation = (index: number) => manager.getOperation(index);
  let getOperationAtLine = (opts: { currentIndex: number; line: number }) =>
    manager.getOperationAtLine(opts);
  let getOperationsAtSameLine = (index: number) => manager.getOperationsAtSameLine(index);
  let getOperationInfo = (pc: number) => manager.getOperationInfo(pc);

  let currentOperationCount = 0;
  let isDone = false;
  let codeValue = '';
  let operationsPerLineValue: Record<string, VOTChunkOperation[]> = {};
  let fullBytecodeItemsValue: FullBytecodeItem[] = [];
  let referenceBytecodeItemsValue: FullBytecodeItem[] = [];

  let operationCountListener = createListeners();
  let doneListener = createListeners();
  let codeListener = createListeners();
  let operationsPerLineListener = createListeners();
  let fullBytecodeItemsListener = createListeners();
  let referenceBytecodeItemsListener = createListeners();

  let p1 = manager.onOperationCountChange(
    Comlink.proxy(value => {
      currentOperationCount = value;
      operationCountListener.notify();
    })
  );

  let p2 = manager.onDone(
    Comlink.proxy(() => {
      isDone = true;
      doneListener.notify();
    })
  );

  let p3 = manager.onCode(
    Comlink.proxy(value => {
      codeValue = value;
      codeListener.notify();
    })
  );

  let p4 = manager.onOperationsPerLine(
    Comlink.proxy(value => {
      operationsPerLineValue = value;
      operationsPerLineListener.notify();
    })
  );

  let p5 = manager.onFullBytecodeItems(
    Comlink.proxy(value => {
      fullBytecodeItemsValue = value;
      fullBytecodeItemsListener.notify();
    })
  );

  let p6 = manager.onReferenceBytecodeItems(
    Comlink.proxy(value => {
      referenceBytecodeItemsValue = value;
      referenceBytecodeItemsListener.notify();
    })
  );

  let operationCount = {
    getValue: () => currentOperationCount,
    onChange: (cb: () => void) => operationCountListener.register(cb)
  };

  let done = {
    isDone: () => isDone,
    onDone: (cb: () => void) => doneListener.register(cb)
  };

  let code = {
    getCode: () => codeValue,
    onCode: (cb: () => void) => codeListener.register(cb)
  };

  let fullBytecodeItems = {
    getFullBytecodeItems: () => fullBytecodeItemsValue,
    onFullBytecodeItems: (cb: () => void) => fullBytecodeItemsListener.register(cb)
  };

  let referenceBytecodeItems = {
    getReferenceBytecodeItems: () => referenceBytecodeItemsValue,
    onReferenceBytecodeItems: (cb: () => void) => referenceBytecodeItemsListener.register(cb)
  };

  let operationsPerLine = {
    getOperations: () => operationsPerLineValue,
    onOperations: (cb: () => void) => operationsPerLineListener.register(cb)
  };

  let programName = '';

  let isRunning = false;

  return {
    getOperation,
    getOperationAtLine,
    getOperationInfo,
    getOperationsAtSameLine,

    done,
    code,
    operationCount,
    operationsPerLine,
    fullBytecodeItems,
    referenceBytecodeItems,

    getProgramName: () => programName,

    waitUntilOperations: () =>
      new Promise<void>(resolve => {
        if (currentOperationCount > 0) return resolve();

        let l = operationsPerLineListener.register(() => {
          if (currentOperationCount <= 0) return;

          l();
          resolve();
        });
      }),

    start: async () => {
      if (isRunning) return { programName: '' };
      isRunning = true;

      await p1;
      await p2;
      await p3;
      await p4;
      await p5;
      await p6;

      let res = await manager.start(operationTrace);
      programName = res.programName;

      return res;
    },

    dispose: () => {
      worker.terminate();
    }
  };
};

export type MemoryWorkerManager = ReturnType<typeof createMemoryWorkerManager>;
