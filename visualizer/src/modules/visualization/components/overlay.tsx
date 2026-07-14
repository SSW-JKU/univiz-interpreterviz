import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { createGlobalStyle } from 'styled-components';
import { atom } from '../../lib';

let NoScroll = createGlobalStyle`
  body {
    overflow: hidden;
  }
`;

let portalElement: Element | null = null;

let blanketState = atom(false);

export let OverlayElementRoot = () => {
  let [blanket] = blanketState.use();

  return (
    <>
      <div ref={el => (portalElement = el)} id="overlay-root" />

      {blanket && <NoScroll />}

      <AnimatePresence>
        {blanket && (
          <motion.div
            key="overlay-blanket"
            id="overlay-blanket"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(100, 100, 100, 0.4)',
              zIndex: 450
              // pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export let useBanketOpen = () => blanketState.use()[0];

export let Overlay = ({
  children,
  blanket
}: {
  children: React.ReactNode;
  blanket?: boolean;
}) => {
  let [el] = useState(() => {
    let el = document.createElement('div');
    el.style.position = 'fixed';
    el.style.top = '0';
    el.style.left = '0';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.zIndex = '500';
    el.style.pointerEvents = 'none';

    portalElement!.appendChild(el);
    return el;
  });

  useEffect(() => {
    blanketState.set(!!blanket);

    return () => {
      blanketState.set(false);
    };
  }, [blanket]);

  let unmountToRef = useRef<number | null>(null);
  useEffect(() => {
    clearTimeout(unmountToRef.current!);
    return () => {
      clearTimeout(unmountToRef.current!);

      unmountToRef.current = window.setTimeout(() => {
        portalElement!.removeChild(el);
      }, 50);
    };
  }, [el]);

  return ReactDOM.createPortal(children, el);
};
