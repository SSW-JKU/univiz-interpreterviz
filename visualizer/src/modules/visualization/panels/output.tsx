import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSettings, useVisualizationState } from '../../state';

export let LOGS_WIDTH = 400;

let Wrapper = styled(motion.section)`
  position: fixed;
  top: 15px;
  right: 15px;
  bottom: 15px;
  overflow: auto;

  background: rgba(240, 240, 240, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: ${LOGS_WIDTH}px;
  z-index: 300;

  padding: 20px;
`;

let Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  padding: 0px 0px 10px 0px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  line-height: 1;
  margin-bottom: 15px;
`;

let Log = styled(motion.div)`
  padding: 5px 10px;
  margin-bottom: 3px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 600;
`;

export let Output = () => {
  let { showLogs } = useSettings();
  let {
    operationState: { currentOperation, operationIndex }
  } = useVisualizationState();

  let [previousLogIndex, setPreviousLogIndex] = useState(-1);
  useEffect(() => {
    let current = currentOperation?.logs.length ?? 0;
    return () => setPreviousLogIndex(current);
  }, [currentOperation?.logs.length ?? 0, operationIndex]);

  return (
    <>
      <div style={{ width: showLogs ? LOGS_WIDTH + 30 : 0, height: 100 }} />

      <AnimatePresence>
        {showLogs && (
          <Wrapper
            initial={{ opacity: 0, right: -350 }}
            animate={{ opacity: 1, right: 15, transition: { delay: 0.1 } }}
            exit={{ opacity: 1, right: -500 }}
            transition={{ ease: 'anticipate' }}
          >
            <Title>Output</Title>

            {currentOperation?.logs.length == 0 && (
              <p>The program has not produced any output yet.</p>
            )}

            <AnimatePresence>
              {currentOperation?.logs.map((log, i) => (
                <Log
                  key={i}
                  initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    filter: 'blur(0px)',
                    background: previousLogIndex <= i ? '#10ac84' : 'transparent',
                    color: previousLogIndex <= i ? 'white' : 'black'
                  }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {log.message}
                </Log>
              ))}
            </AnimatePresence>
          </Wrapper>
        )}
      </AnimatePresence>
    </>
  );
};
