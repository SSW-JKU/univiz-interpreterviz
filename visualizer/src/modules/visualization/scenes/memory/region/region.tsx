import { Flex, Popover, Switch, Text } from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { Fragment, useRef } from 'react';
import { MoreVertical } from 'react-feather';
import styled from 'styled-components';
import { useIsScrollable } from '../../../../lib/hooks/useIsScrollable';
import {
  parsedVizspec,
  REGION_GAP,
  REGION_PADDING,
  RegionEntryState,
  useSettings,
  useVisualizationState
} from '../../../../state';
import { useExpanded } from '../../../../state/animation/hooks/useExpanded';
import { PopoverContent } from '../../../components/popover';
import { SettingsItem } from '../../../panels/settings';
import { Entry } from '../entry';
import { RegionError } from './error';
import { RegionFunctionHeader } from './functionHeader';
import { RegionPointers } from './pointers';
import { useRegionState } from './state';

let RegionOuter = styled.div`
  position: absolute;
`;

let RegionRelative = styled.section`
  position: relative;
  padding: 0px ${REGION_GAP / 2}px;
`;

let RegionBox = styled(motion.div)`
  overflow-y: auto;
  overflow-x: hidden;
  padding: ${REGION_PADDING}px;
  background: #fff;
  border: 1px solid #ccc;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  height: 100%;
  width: 100%;

  scrollbar-color: #999 #efefef;
  scrollbar-width: thin;
`;

let RegionInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

let RegionHeader = styled.header`
  display: flex;
  align-items: center;
  height: 36px;
  padding: 0px 10px 0px 10px;
  justify-content: space-between;
`;

let MoreButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  transition: all 0.2s;

  &:hover,
  &:focus {
    background: rgba(0, 0, 0, 0.05);
  }
`;

let RegionTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
`;

export let Region = ({
  region,
  regionIndex
}: {
  region: RegionEntryState;
  regionIndex: number;
}) => {
  {
    let { setCurrentRegion, mouseTORef, lastHoverRef, animationMultiplier } = useRegionState();

    let {
      operationState: { currentOperation }
    } = useVisualizationState();

    let { hidePointers, setHidePointers, entrySize, regionWidth } = useSettings();
    let [expanded] = useExpanded();
    let expandedKey = expanded.sort().join(':');

    let boxRef = useRef<HTMLDivElement>(null);
    let isScrollable = useIsScrollable(boxRef);

    let meta = parsedVizspec.declarations.region[region.name];
    let width = region.position.width + (isScrollable ? 10 : 0);

    return (
      <RegionOuter
        key={region.id}
        style={{
          width,
          left: region.position.left,
          top: region.position.top,
          height: region.position.height
        }}
        onMouseMove={() => {
          lastHoverRef.current = Date.now();
        }}
        onMouseEnter={() => {
          if (hidePointers) return;

          lastHoverRef.current = Date.now();

          clearTimeout(mouseTORef.current);
          mouseTORef.current = setTimeout(() => {
            setCurrentRegion(region.id);
          }, 350);
        }}
        onMouseLeave={() => {
          clearTimeout(mouseTORef.current);
        }}
      >
        <RegionRelative
          data-region-id={region.id}
          style={{
            width,
            height: region.position.height
          }}
        >
          <RegionBox
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * regionIndex }}
            ref={boxRef}
          >
            <RegionHeader>
              <RegionTitle>{meta.name}</RegionTitle>

              <Popover.Root>
                <Popover.Trigger>
                  <MoreButton>
                    <MoreVertical size={16} />
                  </MoreButton>
                </Popover.Trigger>

                <PopoverContent>
                  <SettingsItem>
                    <Text as="label" size="2" weight="medium">
                      <Flex gap="2" align="center">
                        Hide pointer names (can be shown by hovering over arrows)
                        <Switch
                          size="2"
                          checked={hidePointers}
                          onCheckedChange={setHidePointers}
                        />
                      </Flex>
                    </Text>
                  </SettingsItem>
                </PopoverContent>
              </Popover.Root>
            </RegionHeader>

            <RegionError region={region} />

            <RegionInner
              style={{
                height: Math.max(Math.min(region.position.scrollHeight, 9999), 0)
              }}
            >
              <RegionPointers
                region={region}
                // key={`pointer:${entrySize}:${expandedKey}`}
                key={`pointer:${entrySize}:${regionWidth}`}
                expandedKey={expandedKey}
              />

              {currentOperation &&
                region.entries.map((entry, i) => {
                  return (
                    <Fragment key={entry.id + i}>
                      <RegionFunctionHeader
                        animationMultiplier={animationMultiplier}
                        entry={entry}
                      />

                      <Entry
                        entry={entry}
                        region={region}
                        currentOperation={currentOperation}
                        durationMultiplier={animationMultiplier}
                      />
                    </Fragment>
                  );
                })}
            </RegionInner>
          </RegionBox>
        </RegionRelative>
      </RegionOuter>
    );
  }
};
