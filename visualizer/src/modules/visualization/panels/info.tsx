import { FocusScope } from '@radix-ui/react-focus-scope';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { atom } from '../../lib';

let Wrapper = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  background: rgba(200, 200, 200, 0.5);

  z-index: 999999;
`;

let Content = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  width: 500px;
  height: 600px;
  border-radius: 15px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  & > * {
    outline: none;
    display: flex;
    flex-direction: column;

    h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 5px;
    }

    p {
      font-size: 14px;
      line-height: 1.5;
      color: rgba(0, 0, 0, 0.8);
      margin-top: 5px;

      span {
        font-weight: 600;
        color: rgba(0, 0, 0, 0.6);
      }

      a {
        color: inherit;
        text-decoration: none;
        border-bottom: 1px dashed rgba(0, 0, 0, 0.6);
      }
    }
  }
`;

let NoScroll = createGlobalStyle`
  body {
    overflow: hidden;
  }
`;

export let infoAtom = atom(false);

export let Info = () => {
  let [isOpen, setIsOpen] = infoAtom.use();

  useEffect(() => {
    let handleKeyDown = (e: KeyboardEvent) => {
      if (e.key == 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <Wrapper
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(100px)' }}
          exit={{
            opacity: 0,
            backdropFilter: 'blur(0px)',
            transition: { delay: 0.3, duration: 0.5 }
          }}
          transition={{ duration: 0.5 }}
          onClick={() => setIsOpen(false)}
        >
          <NoScroll />

          <Content
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)',
              transition: { ease: 'anticipate', delay: 0.35, duration: 1 }
            }}
            exit={{
              opacity: 0,
              scale: 2,
              filter: 'blur(50px)',
              transition: { duration: 0.3 }
            }}
            onClick={e => e.stopPropagation()}
          >
            <FocusScope loop>
              <h1>Bytecode Visualizer</h1>

              <p>
                <span>Author</span>: <a href="https://github.com/herber">Tobias Herber</a>
              </p>

              <p>
                <span>Advisor</span>:{' '}
                <a href="https://ssw.jku.at/General/Staff/Weninger/">Dr. Markus Weninger</a>
              </p>

              <p>
                <span>Version</span>: v1.0.0
              </p>
            </FocusScope>
          </Content>
        </Wrapper>
      )}
    </AnimatePresence>
  );
};
