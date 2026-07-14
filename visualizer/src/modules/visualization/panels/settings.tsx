import {
  Button,
  Flex,
  Popover,
  Select,
  Slider,
  Switch,
  Text,
  Tooltip
} from '@radix-ui/themes';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ChevronRight, Home, Info, Printer, Settings as SettingsIcon } from 'react-feather';
import styled, { createGlobalStyle } from 'styled-components';
import { useNavigateWithPrefix } from '../../lib/hooks/useNavigateWithPrefix';
import { useSettings } from '../../state';
import { PopoverContent } from '../components/popover';
import { infoAtom } from './info';
import { LOGS_WIDTH } from './output';

let Wrapper = styled(motion.nav)`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin: 0 auto;
  padding: 10px;
  background: rgba(240, 240, 240, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 60px;
  top: 30px;
  gap: 10px;
  position: fixed;
  z-index: 300;
`;

export let SettingsItem = styled.div`
  padding: 10px 5px;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
`;

let BodyFadeOut = createGlobalStyle`
  body > * {
    opacity: 0;
    transition: opacity 0.2s;
  }
`;

export let Settings = () => {
  let settings = useSettings();
  let navigate = useNavigateWithPrefix();
  let [exit, setExit] = useState(false);

  return (
    <>
      <div style={{ height: 100, width: 40 }} />

      {exit && <BodyFadeOut />}

      <Wrapper
        transition={{ ease: 'anticipate' }}
        initial={{ opacity: 0, right: -40 }}
        animate={
          settings.showLogs
            ? { opacity: 1, right: LOGS_WIDTH + 30 }
            : {
                opacity: 1,
                right: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0
              }
        }
      >
        <Tooltip content="Select new bytecode trace">
          <Button
            size="2"
            onClick={() => {
              setExit(true);
              setTimeout(() => navigate('/'), 150);
            }}
          >
            <Home size={16} />
          </Button>
        </Tooltip>

        <Tooltip content="Open Output">
          <Button size="2" onClick={() => settings.setShowLogs(!settings.showLogs)}>
            {settings.showLogs ? <ChevronRight size={16} /> : <Printer size={16} />}
          </Button>
        </Tooltip>

        <Popover.Root>
          <Popover.Trigger>
            <Button size="2">
              <SettingsIcon size={16} />
            </Button>
          </Popover.Trigger>

          <PopoverContent sideOffset={15} side="left">
            <SettingsItem>
              <Text as="label" size="2" weight="medium">
                <Flex gap="2" align="center">
                  Expand bytecode for all operations
                  <Switch
                    size="2"
                    checked={settings.showAllBytecode}
                    onCheckedChange={settings.setShowAllBytecode}
                  />
                </Flex>
              </Text>
            </SettingsItem>

            <SettingsItem>
              <Text as="label" size="2" weight="medium">
                <Flex gap="2" align="center">
                  Hide pointer names (can be shown by hovering over arrows)
                  <Switch
                    size="2"
                    checked={settings.hidePointers}
                    onCheckedChange={settings.setHidePointers}
                  />
                </Flex>
              </Text>
            </SettingsItem>

            <SettingsItem>
              <Text as="label" size="2" weight="medium">
                <Flex gap="2" align="center">
                  <span style={{ flexGrow: 1 }}>Entry size</span>
                  <Select.Root
                    onValueChange={v => settings.setEntrySize(v as any)}
                    value={settings.entrySize}
                  >
                    <Select.Trigger />

                    <Select.Content>
                      <Select.Item value="small">Compact</Select.Item>
                      <Select.Item value="large">Large</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Text>
            </SettingsItem>

            <SettingsItem>
              <Text as="label" size="2" weight="medium">
                <Flex gap="2" align="center">
                  <span style={{ flexGrow: 1 }}>Entry name</span>
                  <Select.Root
                    onValueChange={v => settings.setEntryName(v as any)}
                    value={settings.entryName}
                  >
                    <Select.Trigger />

                    <Select.Content>
                      <Select.Item value="symbolic">Symbolic</Select.Item>
                      <Select.Item value="numeric">Numeric</Select.Item>
                    </Select.Content>
                  </Select.Root>
                </Flex>
              </Text>
            </SettingsItem>

            <SettingsItem>
              <Text as="label" size="2" weight="medium">
                <Flex gap="2" direction="column">
                  Animation speed multiplier ({settings.animationMultiplierValue.toFixed(1)}x)
                  <Slider
                    defaultValue={[settings.animationMultiplierValue]}
                    onValueChange={v => settings.setAnimationMultiplierValue(v[0])}
                    min={0.5}
                    max={1}
                    step={0.1}
                  />
                </Flex>
              </Text>
            </SettingsItem>

            <SettingsItem>
              <Text as="label" size="2" weight="medium">
                <Flex gap="2" direction="column">
                  Region width ({settings.regionWidth.toFixed(1)}x)
                  <Slider
                    defaultValue={[settings.regionWidth]}
                    onValueChange={v => settings.setRegionWidth(v[0])}
                    min={200}
                    max={500}
                    step={10}
                  />
                </Flex>
              </Text>
            </SettingsItem>

            {/* <AnimatePresence>
              {settings.regionWidth !== regionWidth && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                >
                  <Button
                    size="2"
                    variant="secondary"
                    onClick={() => {
                      settings.setRegionWidth(regionWidth);
                      settings.setShowLogs(false);
                      setExit(true);
                      setTimeout(() => navigate('/'), 150);
                    }}
                    style={{ marginTop: 10 }}
                  >
                    Apply
                  </Button>
                </motion.div>
              )}
            </AnimatePresence> */}

            <SettingsItem>
              <Text as="label" size="2" weight="medium">
                <Flex gap="2" align="center">
                  Collapse structures (such as classes or arrays)
                  <Switch
                    size="2"
                    checked={settings.collapseStructures}
                    onCheckedChange={settings.setCollapseStructures}
                  />
                </Flex>
              </Text>
            </SettingsItem>

            {settings.collapseStructures && (
              <SettingsItem>
                <Text as="label" size="2" weight="medium">
                  <Flex gap="2" direction="column">
                    Collapse structure size threshold ({settings.collapseStructureSize})
                    <Slider
                      defaultValue={[settings.collapseStructureSize]}
                      onValueChange={v => settings.setCollapseStructureSize(v[0])}
                      min={3}
                      max={20}
                      step={1}
                    />
                  </Flex>
                </Text>
              </SettingsItem>
            )}
          </PopoverContent>
        </Popover.Root>

        <Tooltip content="Project Info">
          <Button size="2" onClick={() => infoAtom.set(true)}>
            <Info size={16} />
          </Button>
        </Tooltip>
      </Wrapper>
    </>
  );
};
