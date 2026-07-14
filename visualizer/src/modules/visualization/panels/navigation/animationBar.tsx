import { Button, Tooltip } from '@radix-ui/themes';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { FastForward, Pause, RefreshCcw } from 'react-feather';
import styled from 'styled-components';
import { useVisualizationState } from '../../../state';

let Wrapper = styled(motion.nav)`
  position: fixed;
  bottom: 75px;
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 600px;
  margin: 0 auto;
`;

let Inner = styled(motion.div)`
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 0 auto;
  background: rgba(240, 240, 240, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

let Row = styled(motion.div)`
  display: flex;
  align-items: center;
`;

let PartsRelative = styled.div`
  width: 250px;
  position: relative;
  margin-right: 10px;
  height: 10px;
`;

let Parts = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 4px;
  position: absolute;
  left: 0px;
  right: 0px;
  top: 0px;
  bottom: 0px;
`;

let Part = styled.div`
  height: 6px;
  border-radius: 3px;
  background: #ccc;
`;

let PartProgress = styled.div`
  background: #0190ff;
  height: 100%;
  border-radius: 3px;
`;

let LabelWrapper = styled.div`
  height: 16px;
  position: relative;
  width: 100%;
`;

let Label = styled(motion.div)`
  font-size: 12px;
  color: #666;
  font-weight: 600;
  text-align: center;
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
`;

export let AnimationBar = () => {
  let {
    operationState: { operationIndex },
    animationState
  } = useVisualizationState();

  let [reset, setReset] = useState(false);
  useEffect(() => {
    setReset(true);
    setTimeout(() => setReset(false), 20);
  }, [operationIndex, animationState.animationIndex]);

  if (animationState.animationBarState.length <= 1) return null;

  return (
    <Wrapper
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: animationState.finished && !animationState.playingUntil ? 20 : 0
      }}
    >
      <Inner
        animate={{
          padding:
            !animationState.finished || animationState.playingUntil ? '10px 20px' : '10px'
        }}
      >
        {!animationState.playingUntil && (
          <AnimatePresence>
            {!animationState.finished &&
              !animationState.autoPlay &&
              animationState.currentStep.animation?.label && (
                <Row
                  style={{ justifyContent: 'center' }}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <LabelWrapper>
                    <AnimatePresence>
                      <Label
                        key={String(animationState.currentStep.animation.label)}
                        initial={{ opacity: 0, scale: 1.4 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                      >
                        {animationState.currentStep.animation.label}
                      </Label>
                    </AnimatePresence>
                  </LabelWrapper>
                </Row>
              )}
          </AnimatePresence>
        )}

        <Row>
          <motion.div
            style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}
            initial={{ opacity: 0, width: 0 }}
            animate={
              animationState.finished && !animationState.playingUntil
                ? { opacity: 0, width: 0 }
                : { opacity: 1, width: 'auto' }
            }
          >
            <PartsRelative>
              <AnimatePresence>
                <Parts
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 1, scale: 1, transition: { delay: 0.1 } }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  key={operationIndex}
                >
                  {animationState.animationBarState.map((part, index) => (
                    <Tooltip content={part.label ?? `Step ${index + 1}`} key={index}>
                      <Part
                        style={{
                          width: `${part.percent * 100}%`
                        }}
                      >
                        <PartProgress
                          style={
                            reset
                              ? { width: '0%' }
                              : part.status == 'done'
                                ? { width: `100%` }
                                : {
                                    transition: `width ${part.duration}ms linear`,
                                    width: part.status == 'active' ? '100%' : '0%'
                                  }
                          }
                        />
                      </Part>
                    </Tooltip>
                  ))}
                </Parts>
              </AnimatePresence>
            </PartsRelative>
          </motion.div>

          {animationState.playingUntil ? (
            <Tooltip content="Abort playback">
              <Button
                size="1"
                onClick={() => animationState.abortPlayUntil()}
                disabled={animationState.playUntilStopped}
              >
                <Pause size={12} strokeWidth={3} />
              </Button>
            </Tooltip>
          ) : (animationState.paused || !animationState.autoPlay) &&
            !animationState.finished ? (
            <Tooltip content="Go to next step">
              <Button
                size="1"
                onClick={() => animationState.next()}
                disabled={animationState.animating}
              >
                {animationState.finished ? (
                  <RefreshCcw size={12} strokeWidth={3} />
                ) : (
                  <FastForward size={12} strokeWidth={3} />
                )}
              </Button>
            </Tooltip>
          ) : animationState.animating || animationState.aborting ? (
            <Tooltip content="Pause">
              <Button
                size="1"
                onClick={() => animationState.pause()}
                disabled={
                  animationState.animationBarState.length <= 1 ||
                  !animationState.animationBarState.some(s => s.status == 'upcoming')
                }
              >
                <Pause size={12} strokeWidth={3} />
              </Button>
            </Tooltip>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Tooltip content="Restart">
                <Button size="1" onClick={() => animationState.restart()}>
                  <RefreshCcw size={12} strokeWidth={3} />
                </Button>
              </Tooltip>

              {animationState.animationBarState.length > 1 && (
                <Tooltip content="Restart with stepping">
                  <Button size="1" onClick={() => animationState.next()}>
                    <FastForward size={12} strokeWidth={3} />
                  </Button>
                </Tooltip>
              )}
            </div>
          )}
        </Row>
      </Inner>
    </Wrapper>
  );
};
