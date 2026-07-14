import { motion } from 'framer-motion';
import styled from 'styled-components';
import { METHOD_HEADER_HEIGHT, PositionEntry } from '../../../../state';

let FunctionHeader = styled(motion.div)`
  position: absolute;
  font-size: 18px;
  font-weight: 600;
  padding: 0px 10px;
`;

export let RegionFunctionHeader = ({
  animationMultiplier,
  entry
}: {
  animationMultiplier: number;
  entry: PositionEntry;
}) => {
  if (!entry.isFunctionStart || !entry.function) return null;

  return (
    <FunctionHeader
      style={{
        height: METHOD_HEADER_HEIGHT,
        top: entry.position.top - METHOD_HEADER_HEIGHT
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 * animationMultiplier }}
    >
      {entry.function?.name}
    </FunctionHeader>
  );
};
