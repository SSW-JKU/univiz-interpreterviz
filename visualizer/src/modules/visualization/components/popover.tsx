import { Popover } from '@radix-ui/themes';
import styled from 'styled-components';

export let PopoverContent = styled(Popover.Content)`
  background: rgba(240, 240, 240, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.1);
  width: 300px;
  display: flex;
  flex-direction: column;
  padding: 10px 15px;
`;
