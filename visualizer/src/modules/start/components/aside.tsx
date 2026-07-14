import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

let Wrapper = styled(motion.div)`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 50vw;
  padding: 30px;
  position: fixed;
  right: 0;
`;

let Content = styled.main`
  width: 100%;
  height: 100%;
  padding: 70px;
  border-radius: 10px;
  border: 1px solid #efefef;
  background: #fff;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.12);
  overflow: auto;
`;

let Title = styled.h1`
  font-size: 22px;
  font-weight: 600;
`;

let Description = styled.p`
  font-size: 14px;
  font-weight: 500;
  color: #777;
  margin-bottom: 20px;
`;

let Inner = styled(motion.div)``;

export let AsideLayout = ({
  children,
  title,
  description,
  innerKey
}: {
  children: React.ReactNode;
  title: React.ReactNode;
  description: React.ReactNode;
  innerKey?: string;
}) => {
  let [rendered, setRendered] = useState(false);

  useEffect(() => {
    setTimeout(() => setRendered(true), 1000);
  }, []);

  return (
    <>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '50vw' }}
        exit={{ width: 0, transition: { delay: 0.2 } }}
        transition={{ delay: 0.4 }}
      />

      <Wrapper
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
        exit={{ opacity: 0, x: '100%', transition: { delay: 0 } }}
      >
        <Content>
          <Inner
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rendered ? 0 : 0.8 }}
            key={innerKey}
          >
            <Title>{title}</Title>
            <Description>{description}</Description>

            {children}
          </Inner>
        </Content>
      </Wrapper>
    </>
  );
};
