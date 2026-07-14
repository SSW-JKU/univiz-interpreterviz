import { motion } from 'framer-motion';
import styled from 'styled-components';

let Wrapper = styled(motion.div)`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-grow: 1;
`;

let Content = styled.main`
  width: 100%;
  max-width: 500px;
  padding: 70px 20px;
  border-radius: 10px;
  border: 1px solid #efefef;
`;

let Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 6px;
  text-align: center;
`;

let Description = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: #777;
  margin-bottom: 40px;
  text-align: center;
`;

let Inner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export let CenterLayout = ({
  children,
  title,
  description
}: {
  children: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
}) => {
  return (
    <Wrapper
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ ease: 'easeOut', duration: 0.3, delay: 0.1 }}
    >
      <Content>
        <Title>{title}</Title>
        <Description>{description}</Description>
        <Inner>{children}</Inner>
      </Content>
    </Wrapper>
  );
};
