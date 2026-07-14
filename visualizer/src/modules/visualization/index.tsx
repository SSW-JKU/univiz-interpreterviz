import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { useScrollbarWidth } from 'react-use';
import styled from 'styled-components';
import { useRootVisualizationState, VisualizationStateProvider } from '../state';
import { Info } from './panels/info';
import { AnimationBar } from './panels/navigation/animationBar';
import { RangeBar } from './panels/navigation/rangeBar';
import { Output } from './panels/output';
import { Settings } from './panels/settings';
import { Code } from './scenes/code';
import { Regions } from './scenes/memory/region';

let Wrapper = styled(motion.div)`
  display: flex;
  width: fit-content;
`;

export let Visualization = () => {
  let { runId } = useParams();
  let state = useRootVisualizationState(runId!);
  let scrollbarWidth = useScrollbarWidth() ?? 0;

  let ready = state.operationState.operationCount > 0;

  return (
    <Wrapper
      style={{
        height: `calc(100vh - ${scrollbarWidth}px)`
      }}
    >
      <VisualizationStateProvider state={state}>
        {ready && (
          <>
            <AnimationBar />

            <Code />

            <Regions />

            <Output />

            <Settings />

            <Info />

            <RangeBar />
          </>
        )}
      </VisualizationStateProvider>
    </Wrapper>
  );
};
