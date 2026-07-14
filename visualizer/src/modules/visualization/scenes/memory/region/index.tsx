import { motion } from 'framer-motion';
import { ArcherContainer } from 'react-archer';
import styled from 'styled-components';
import { REGION_GAP, useVisualizationState } from '../../../../state';
import { ErrorBoundary } from '../../../components/errorBoundary';
import { Region } from './region';
import { RegionStateProvider } from './state';

let Wrapper = styled(motion.div)`
  position: relative;
  background: #efefef;
  display: flex;
`;

export let Regions = () => {
  let {
    animationState: { currentStep }
  } = useVisualizationState();

  let width: any = 0;
  if (currentStep?.after && currentStep.after.length) {
    let lastRegion = currentStep.after[currentStep.after.length - 1];
    width = lastRegion.position.left + lastRegion.position.width + REGION_GAP;
  }

  if (width === 0) width = undefined;

  return (
    <ErrorBoundary>
      <ArcherContainer
        strokeColor="#1e90ff"
        strokeDasharray="10,2"
        strokeWidth={2}
        svgContainerStyle={{ zIndex: 100 }}
      >
        <Wrapper style={{ width, height: '100%' }}>
          <RegionStateProvider>
            {currentStep?.after.map((region, regionIndex) => (
              <Region key={region.id} region={region} regionIndex={regionIndex} />
            ))}
          </RegionStateProvider>
        </Wrapper>
      </ArcherContainer>
    </ErrorBoundary>
  );
};
