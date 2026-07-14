import styled, { keyframes } from 'styled-components';

let rotate = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' }
});

let SpinnerEl = styled.div<{ size: number }>`
  animation: ${rotate} 900ms ease infinite;
  border: ${props => props.size / 7}px solid #f3f3f3;
  border-top: ${props => props.size / 7}px solid #ffba18;
  border-radius: 50%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

export let Spinner = ({ size, center }: { size?: number; center?: boolean }) => {
  return (
    <SpinnerEl
      aria-live="polite"
      title="Loading..."
      size={size || 30}
      style={{
        margin: center ? '0px auto' : undefined
      }}
    />
  );
};
