import { Button, DropdownMenu } from '@radix-ui/themes';
import clsx from 'clsx';
import { useState } from 'react';
import { MoreVertical } from 'react-feather';
import styled from 'styled-components';
import { useVisualizationState } from '../../../state';

let LineMenu = styled.div`
  opacity: 0;
  visibility: hidden;
  display: flex;
  align-items: center;
  gap: 5px;
  position: absolute;
  right: 3px;
  top: 0px;
  bottom: 0px;
  transition: all 0.3s ease;

  &.force-show {
    opacity: 1;
    visibility: visible;
  }
`;

export let DropdownMenuContent = styled(DropdownMenu.Content)`
  background: rgba(240, 240, 240, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 300px;
  display: flex;
  flex-direction: column;
`;

export let BytecodeMenu = ({
  for: for_
}: {
  for:
    | {
        type: 'line';
        lineNumber: number;
      }
    | {
        type: 'bytecode';
        lineNumber: number;
        pc: number;
      };
}) => {
  let { operationState, animationState } = useVisualizationState();

  let [isOpen, setIsOpen] = useState(false);
  let [canPlayUntil, setCanPlayUntil] = useState(true);
  let [canJumpTo, setCanJumpRo] = useState(true);

  let op = operationState.currentOperation?.operation?.properties.operation;
  let currentLine = op?.line;
  let isCurrentLine = currentLine === for_.lineNumber;
  let isCurrentBytecode = isCurrentLine && 'pc' in for_ && op?.pc === for_.pc;

  return (
    <LineMenu
      className={clsx('line-menu', {
        'force-show': isOpen
      })}
    >
      <DropdownMenu.Root
        onOpenChange={o => {
          setIsOpen(o);
          animationState.canPlayUntil(for_).then(setCanPlayUntil);
          animationState.canJumpTo(for_).then(setCanJumpRo);
        }}
      >
        <DropdownMenu.Trigger>
          <Button disabled={isCurrentBytecode} size="1">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenuContent>
          <DropdownMenu.Item
            disabled={animationState.playingUntil || isCurrentBytecode || !canJumpTo}
            onClick={async () => {
              await animationState.waitUntilNotAnimating();
              operationState.jumpTo(for_);
            }}
          >
            Jump to {for_.type === 'line' ? 'line' : 'operation'}
          </DropdownMenu.Item>

          <DropdownMenu.Item
            disabled={
              !canPlayUntil ||
              animationState.playingUntil ||
              isCurrentBytecode ||
              animationState.animating
            }
            onClick={async () => {
              await animationState.waitUntilNotAnimating();
              animationState.playUntil(for_);
            }}
          >
            Play until {for_.type === 'line' ? 'line' : 'operation'}
          </DropdownMenu.Item>
        </DropdownMenuContent>
      </DropdownMenu.Root>
    </LineMenu>
  );
};
