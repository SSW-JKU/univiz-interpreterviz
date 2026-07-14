import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import { smoothScrollIntoViewIfNeeded } from '../../../../lib';
import { RegionEntryState, useVisualizationState } from '../../../../state';

let Wrapper = styled(motion.div)`
  margin: 0px 0px 5px 0px;
`;

let Inner = styled.div`
  background: #ff4757;
  color: white;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 2px;

  h1 {
    font-size: 14px;
    font-weight: 600;
  }

  p {
    font-size: 12px;
    font-weight: 500;
  }
`;

export let RegionError = ({ region }: { region: RegionEntryState }) => {
  let {
    operationState: { currentOperation }
  } = useVisualizationState();

  let error = currentOperation?.error?.region == region.name ? currentOperation.error! : null;

  return (
    <AnimatePresence>
      {error && (
        <Wrapper
          initial={{ opacity: 0, height: 0, y: 10 }}
          animate={{ opacity: 1, height: 'auto', y: 0 }}
          exit={{ opacity: 0, height: 0, y: 10 }}
          ref={el => {
            if (el) {
              setTimeout(() => {
                smoothScrollIntoViewIfNeeded(el, {
                  offset: {
                    left: 200
                  }
                });
              }, 300);
            }
          }}
        >
          <Inner>
            <h1>{error.message}</h1>
            <p>{error.hint}</p>
          </Inner>
        </Wrapper>
      )}
    </AnimatePresence>
  );
};
