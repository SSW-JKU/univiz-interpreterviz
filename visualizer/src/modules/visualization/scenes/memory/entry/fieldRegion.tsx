import { Button } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { useId } from 'react';
import styled from 'styled-components';
import { smoothScrollIntoViewIfNeeded } from '../../../../lib';
import { PositionEntry } from '../../../../state';
import { toggleExpanded } from '../../../../state/animation/hooks/useExpanded';
import { EntryContentHeader } from './content';
import { EntryPosition } from './wrapper';

let EntryFieldRegionWrapper = styled(motion.div)`
  border-radius: 10px !important;
  border: 1px solid #ddd;
  padding: 6px 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.07);
  position: relative;
`;

let EntryFieldRegionCollapseWrapper = styled(motion.div)`
  position: absolute;
  bottom: 10px;
`;

export let EntryFieldRegion = ({
  entry,
  durationMultiplier
}: {
  entry: PositionEntry;
  durationMultiplier: number;
}) => {
  let isCollapsed = 'isCollapsed' in entry ? entry.isCollapsed : false;
  let isCollapsable = 'isCollapsable' in entry ? entry.isCollapsable : false;

  let hederId = useId();

  let content = (
    <>
      <EntryContentHeader id={hederId}>
        <mark>
          <b>{entry.name}</b>
        </mark>
      </EntryContentHeader>

      {isCollapsable && (
        <EntryFieldRegionCollapseWrapper
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Button
            size="1"
            onClick={() => {
              toggleExpanded(entry.fieldsMemoryRegionId!);

              let el = document.getElementById(hederId);
              if (el) smoothScrollIntoViewIfNeeded(el);
            }}
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </Button>
        </EntryFieldRegionCollapseWrapper>
      )}
    </>
  );

  let inner = <EntryFieldRegionWrapper>{content}</EntryFieldRegionWrapper>;

  if (entry.animation?.type == 'add') {
    inner = (
      <EntryFieldRegionWrapper
        key={`add-${entry.id}`}
        initial={{ opacity: 0, scale: 0.8, outline: '10px solid #ffffff' }}
        animate={{
          opacity: 1,
          scale: 1,
          outline: '1px solid #20bf6b',
          borderColor: '#20bf6b'
        }}
        transition={{ duration: 0.3 * durationMultiplier }}
      >
        {content}
      </EntryFieldRegionWrapper>
    );
  }

  if (entry.animation?.type == 'remove') {
    inner = (
      <EntryFieldRegionWrapper
        key={`remove-${entry.id}`}
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3 * durationMultiplier }}
      >
        {content}
      </EntryFieldRegionWrapper>
    );
  }

  return <EntryPosition entry={entry}>{inner}</EntryPosition>;
};
