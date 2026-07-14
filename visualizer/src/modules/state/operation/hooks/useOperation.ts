import { useCurrentOperation } from './useCurrentOperation';
import { useOperationBytecode } from './useOperationBytecode';
import { useOperationJumps } from './useOperationJumps';

export let useOperation = (runId: string) => {
  let state = useCurrentOperation(runId);
  let bytecode = useOperationBytecode(state);
  let jumps = useOperationJumps({
    ...state,
    ...bytecode
  });

  return {
    ...state,
    ...jumps,
    ...bytecode
  };
};

export type OperationState = ReturnType<typeof useOperation>;
