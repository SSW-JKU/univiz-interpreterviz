import { motion } from 'framer-motion';
import React from 'react';
import styled from 'styled-components';

let Wrapper = styled(motion.span)`
  position: absolute;
  top: -20px;
  right: 10px;
  height: 26px;
  font-size: 12px;
  font-weight: 600;
  background: #222;
  color: white;
  font-weight: 800;
  padding: 0px 7px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  z-index: auto;
`;

export let EntryTag = ({
  children,
  delay = 0,
  durationMultiplier
}: {
  children: React.ReactNode;
  durationMultiplier?: number;
  delay?: number;
}) => {
  return (
    <Wrapper
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: 0.2 + delay, duration: 0.25 }}
      className="tag"
    >
      {children}
    </Wrapper>
  );
};
