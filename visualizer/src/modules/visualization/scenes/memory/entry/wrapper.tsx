import { motion } from 'framer-motion';
import { createContext, useContext } from 'react';
import styled from 'styled-components';
import { getEntryHeight, PositionEntry, useSettings } from '../../../../state';
import { EntryTag } from './tag';

let Outer = styled.div.withConfig({
  shouldForwardProp: prop => !['height'].includes(prop)
})<{
  height: number;
}>`
  position: absolute;
  height: ${p => p.height}px;

  & > div,
  & > div > div {
    width: 100%;
    height: ${p => p.height}px;
    border-radius: 5px;
  }
`;

let Relative = styled(motion.div)`
  position: relative;
  border-radius: 5px;
`;

let IsGlobalContext = createContext(false);
export let IsGlobalProvider = ({ children }: { children: React.ReactNode }) => (
  <IsGlobalContext.Provider value={true}>{children}</IsGlobalContext.Provider>
);

export let EntryPosition = ({
  entry,
  children,
  extraKey
}: {
  entry: PositionEntry;
  children?: React.ReactNode;
  extraKey?: string | number;
}) => {
  let isGlobal = useContext(IsGlobalContext);

  useSettings(); // To listen to entry height changes

  return (
    <Outer
      key={entry.id + (extraKey ?? '')}
      // initial={isGlobal === true ? undefined : entry.position}
      // animate={isGlobal === true ? undefined : entry.position}
      style={isGlobal === true ? undefined : entry.position}
      height={entry.position.height ?? getEntryHeight()}
      data-entry-id={entry.id}
    >
      <IsGlobalProvider>{children}</IsGlobalProvider>
    </Outer>
  );
};

export let EntryWrapper = ({
  entry,
  highlight,
  background,
  tag,
  children,
  delay = 0,
  extraKey,
  durationMultiplier
}: {
  entry: PositionEntry;
  highlight?: string;
  background?: string;
  tag?: string;
  children?: React.ReactNode;
  delay?: number;
  extraKey?: string | number;
  durationMultiplier: number;
}) => {
  let dashed = entry.type.kind == 'pointer';

  return (
    <EntryPosition entry={entry} extraKey={extraKey}>
      <Relative
        style={{
          outline: highlight
            ? `2px ${dashed ? 'dashed' : 'solid'} ${highlight}`
            : `2px ${dashed ? 'dashed' : 'solid'} transparent`,
          background: background || '#efefef',
          transition: `outline 0.2s ease ${0.1 + delay}s, background 0.2s ease ${0.1 + delay}s`
        }}
      >
        {children}

        {/* <AnimatePresence> */}
        {tag && (
          <EntryTag delay={delay} durationMultiplier={durationMultiplier}>
            {tag}
          </EntryTag>
        )}
        {/* </AnimatePresence> */}
      </Relative>
    </EntryPosition>
  );
};
