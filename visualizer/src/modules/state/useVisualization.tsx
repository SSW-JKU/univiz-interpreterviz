import { createContext, useContext } from 'react';
import { useAnimationState } from './animation';
import { useOperation } from './operation';

export let useRootVisualizationState = (id: string) => {
  let operationState = useOperation(id);
  let animationState = useAnimationState(operationState);

  return {
    operationState,
    animationState
  };
};

let VisualizationContext = createContext<ReturnType<typeof useRootVisualizationState> | null>(
  null
);

export let VisualizationStateProvider = ({
  children,
  state
}: {
  children: React.ReactNode;
  state: ReturnType<typeof useRootVisualizationState>;
}) => {
  return (
    <VisualizationContext.Provider value={state}>{children}</VisualizationContext.Provider>
  );
};

export let useVisualizationState = () => {
  let value = useContext(VisualizationContext);

  if (value == null) {
    throw new Error('useVisualizationState must be used within a VisualizationStateProvider');
  }

  return value;
};
