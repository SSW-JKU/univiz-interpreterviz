import { motion } from 'framer-motion';
import { memo } from 'react';
import styled, { keyframes } from 'styled-components';
import { OperationSnapshot } from '../../../../run-manager';
import { PositionEntry, RegionEntryState } from '../../../../state';
import { ErrorBoundary } from '../../../components/errorBoundary';
import { AnimateFusion } from '../animations/animateFusion';
import { AnimateCopy, AnimateMove } from '../animations/animateMove';
import { EntryContent } from './content';
import { EntryFieldRegion } from './fieldRegion';
import { EntryPointerReference } from './pointerReference';
import { EntryPosition, EntryWrapper } from './wrapper';

let fadeOut = keyframes`
  from { opacity: 1; }
  to {  opacity: 0; }
`;

let FadeOut = styled.div`
  animation: ${fadeOut} 0.2s ease forwards;
`;

let EntryInner = memo(
  ({
    entry,
    region,
    currentOperation,
    durationMultiplier
  }: {
    region: RegionEntryState;
    entry: PositionEntry;
    durationMultiplier: number;
    currentOperation: OperationSnapshot;
  }) => {
    if (entry.fieldKind == 'field_region') {
      return <EntryFieldRegion entry={entry} durationMultiplier={durationMultiplier} />;
    }

    let content = (
      <EntryPointerReference entry={entry}>
        <EntryContent entry={entry} region={region} />
      </EntryPointerReference>
    );

    if (entry.animation?.type == 'add') {
      return (
        <EntryPosition entry={entry}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3 * durationMultiplier,
              delay: (entry.animation.delay ?? 0) / 1000
            }}
          >
            <EntryWrapper
              entry={entry}
              tag="New"
              highlight="#20bf6b"
              background="#d5f3e3"
              durationMultiplier={durationMultiplier}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.3 * durationMultiplier,
                  delay: ((entry.animation.delay ?? 0) / 1000 + 0.2) * durationMultiplier
                }}
              >
                {content}
              </motion.div>
            </EntryWrapper>
          </motion.div>
        </EntryPosition>
      );
    } else if (entry.animation?.type == 'move-from') {
      return (
        <EntryWrapper
          entry={entry}
          tag="Moving"
          highlight="#f7b731"
          background="#fff2c6"
          durationMultiplier={durationMultiplier}
        >
          {content}
        </EntryWrapper>
      );
    } else if (entry.animation?.type == 'move-to') {
      return (
        <EntryPosition entry={entry}>
          <AnimateMove
            sourceElementSelector={`[data-entry-id="${entry.animation.fromEntryId}"]`}
            durationMultiplier={durationMultiplier}
          >
            <EntryWrapper
              durationMultiplier={durationMultiplier}
              entry={entry}
              delay={0.55}
              tag="Moved"
              highlight="#f7b731"
              background="#fff2c6"
            >
              {content}
            </EntryWrapper>
          </AnimateMove>
        </EntryPosition>
      );
    } else if (entry.animation?.type == 'copy-from') {
      return (
        <EntryWrapper
          entry={entry}
          tag="Copied From"
          highlight="#0fb9b1"
          background="#c7e9e7"
          durationMultiplier={durationMultiplier}
        >
          {content}
        </EntryWrapper>
      );
    } else if (entry.animation?.type == 'copy-to') {
      return (
        <EntryPosition entry={entry}>
          <AnimateCopy
            sourceElementSelector={`[data-entry-id="${entry.animation.fromEntryId}"]`}
            durationMultiplier={durationMultiplier}
          >
            <EntryWrapper
              durationMultiplier={durationMultiplier}
              entry={entry}
              delay={0.45}
              tag="Copied To"
              highlight="#0fb9b1"
              background="#c7e9e7"
            >
              {content}
            </EntryWrapper>
          </AnimateCopy>
        </EntryPosition>
      );
    } else if (entry.animation?.type == 'removing' || entry.animation?.type == 'remove') {
      let inner = (
        <EntryWrapper
          entry={entry}
          tag="Popping"
          highlight="#eb3b5a"
          background="#f7d7da"
          durationMultiplier={durationMultiplier}
        >
          {content}
        </EntryWrapper>
      );

      if (entry.animation?.type == 'removing') return inner;
      return <FadeOut>{inner}</FadeOut>;
    } else if (entry.animation?.type == 'fusion') {
      return (
        <EntryPosition entry={entry}>
          <AnimateFusion
            sourceElementSelectors={entry.animation.inputEntryIds.map(
              id => `[data-entry-id="${id}"]`
            )}
            label={currentOperation.operation?.name}
            animationIndex={entry.animation.animationIndex}
            durationMultiplier={durationMultiplier}
          >
            <EntryWrapper
              durationMultiplier={durationMultiplier}
              entry={entry}
              tag={`Result of ${currentOperation.operation?.name}`}
              highlight="#45aaf2"
              background="#e0f2ff"
            >
              {content}
            </EntryWrapper>
          </AnimateFusion>
        </EntryPosition>
      );
    } else if (entry.animation?.type == 'hidden') {
      return (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.3 * durationMultiplier }}
        >
          {content}
        </motion.div>
      );
    } else if (entry.animation?.type == 'modify') {
      return (
        <motion.div
          initial={
            entry.animation.animationIndex == 2
              ? { scale: 1, opacity: 0 }
              : { scale: 1, opacity: 1 }
          }
          animate={
            entry.animation.animationIndex == 1
              ? { scale: 1, opacity: 0 }
              : { scale: 1, opacity: 1 }
          }
          transition={{
            duration: 0.3 * durationMultiplier,
            delay: entry.animation.animationIndex == 1 ? 0.3 * durationMultiplier : 0
          }}
        >
          <EntryWrapper
            entry={entry}
            tag={entry.animation.animationIndex <= 1 ? 'Read Value' : 'Modified'}
            highlight="#4b7bec"
            background="#d0deff"
            durationMultiplier={durationMultiplier}
            extraKey={entry.animation.animationIndex}
          >
            {content}
          </EntryWrapper>
        </motion.div>
      );
    }

    if (entry.type.kind == 'pointer') {
      return (
        <EntryWrapper entry={entry} durationMultiplier={durationMultiplier} highlight="#bbb">
          {content}
        </EntryWrapper>
      );
    }

    return (
      <EntryWrapper entry={entry} durationMultiplier={durationMultiplier}>
        {content}
      </EntryWrapper>
    );
  }
);

export let Entry = ({
  entry,
  region,
  currentOperation,
  durationMultiplier
}: {
  entry: PositionEntry;
  region: RegionEntryState;
  durationMultiplier: number;
  currentOperation: OperationSnapshot;
}) => {
  return (
    <ErrorBoundary key={entry.id}>
      <EntryInner
        entry={entry}
        region={region}
        currentOperation={currentOperation}
        durationMultiplier={durationMultiplier}
      />
    </ErrorBoundary>
  );
};
