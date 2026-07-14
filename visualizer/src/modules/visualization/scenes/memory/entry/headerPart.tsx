import styled from 'styled-components';

let HeaderPartWrapper = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;

  &:hover {
    .popover {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
      transform: scale(1.1);
      transition: all 0.15s ease-out;
    }
  }
`;

let HeaderPartContent = styled.span``;

let HeaderPartPopover = styled.span`
  position: absolute;
  top: -5px;
  background: white;
  color: black;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  opacity: 0;
  padding: 5px 10px;
  border-radius: 5px;
  pointer-events: none;
  visibility: hidden;
  transition: all 0.25s ease-out;
  display: flex;
  transform: scale(1);
  z-index: 5;
`;

let HeaderPartPopoverName = styled.span`
  font-weight: 400;
`;

export let EntryHeaderPart = ({
  name,
  nameShort,
  value,
  eq = ' = ',
  reverse = false
}: {
  name: React.ReactNode;
  value: (isPopup: boolean) => React.ReactNode;
  nameShort?: React.ReactNode;
  eq?: React.ReactNode;
  reverse?: boolean;
}) => {
  return (
    <HeaderPartWrapper>
      <HeaderPartContent>
        {nameShort && (
          <>
            {nameShort}
            {eq}
          </>
        )}
        {value(false)}
      </HeaderPartContent>
      <HeaderPartPopover
        className="popover"
        style={{
          left: reverse ? -10 : undefined,
          right: reverse ? undefined : -10
        }}
      >
        <HeaderPartContent>
          {reverse ? (
            <>
              {value(true)}
              {eq}
              <HeaderPartPopoverName>{name}</HeaderPartPopoverName>
            </>
          ) : (
            <>
              <HeaderPartPopoverName>{name}</HeaderPartPopoverName>
              {eq}
              {value(true)}
            </>
          )}
        </HeaderPartContent>
      </HeaderPartPopover>
    </HeaderPartWrapper>
  );
};
