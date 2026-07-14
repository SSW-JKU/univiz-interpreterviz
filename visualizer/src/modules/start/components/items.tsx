import { Button } from '@radix-ui/themes';
import { ArrowRight, Trash2 } from 'react-feather';
import styled from 'styled-components';

let Wrapper = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  padding: 0;
  margin: 0;
`;

let Item = styled.li`
  padding: 10px 0px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;

  &:not(:last-of-type) {
    border-bottom: 1px solid #efefef;
  }
`;

let Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

let Title = styled.h2`
  font-size: 16px;
  font-weight: 600;
`;

let Extra = styled.p`
  font-size: 12px;
  color: #444;
`;

let Size = styled.p`
  font-size: 12px;
  color: #777;
`;

let Right = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
`;

export let RunItems = ({
  runs,
  onClick,
  onClear,
  onRemove
}: {
  runs: { title: string; id: string; date: string | Date; size: string }[];
  onRemove: (id: string) => void;
  onClick: (id: string) => void;
  onClear: () => void;
}) => {
  return (
    <Wrapper>
      {runs.map(run => (
        <Item
          onClick={() => onClick(run.id)}
          onKeyDown={e => e.key === 'Enter' && onClick(run.id)}
          role="button"
          tabIndex={0}
          key={run.id}
        >
          <Left>
            <Title>{run.title}</Title>
            <Extra>{new Date(run.date).toLocaleString()}</Extra>
          </Left>

          <Right>
            <Size>{run.size}</Size>

            <Button
              onClick={e => {
                e.stopPropagation();
                onRemove(run.id);
              }}
              size="1"
            >
              <Trash2 size={12} />
            </Button>
          </Right>
        </Item>
      ))}

      <div style={{ marginTop: 10 }}>
        <Button onClick={onClear} size="1">
          Clear
        </Button>
      </div>
    </Wrapper>
  );
};

export let DemoItems = ({
  demo,
  onClick
}: {
  demo: { title: string; description: string; id: string }[];
  onClick: (id: string) => void;
}) => {
  return (
    <Wrapper>
      {demo.map(run => (
        <Item
          onClick={() => onClick(run.id)}
          onKeyDown={e => e.key === 'Enter' && onClick(run.id)}
          role="button"
          tabIndex={0}
          key={run.id}
        >
          <Left>
            <Title>{run.title}</Title>
            <Extra>{run.description}</Extra>
          </Left>

          <Right>
            <Button
              onClick={e => {
                e.stopPropagation();
                onClick(run.id);
              }}
              size="1"
            >
              <ArrowRight size={12} />
            </Button>
          </Right>
        </Item>
      ))}
    </Wrapper>
  );
};
