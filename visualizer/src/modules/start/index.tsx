import { Button, Callout } from '@radix-ui/themes';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { delay } from '../lib';
import { useNavigateWithPrefix } from '../lib/hooks/useNavigateWithPrefix';
import { RunManager, StoredRun } from '../run-manager';
import { AsideLayout } from './components/aside';
import { CenterLayout } from './components/center';
import { Dropzone } from './components/dropzone';
import { DemoItems, RunItems } from './components/items';

let Wrapper = styled(motion.div)`
  display: flex;
  height: 100vh;
`;

let DemoHighlight = styled.button`
  border-radius: 50px;
  height: 40px;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.1) 100%);
  border: solid 1px rgba(0, 0, 0, 0.1);
  padding: 0px 20px;
  margin: 0px auto 30px auto;
`;

export let Start = ({ isDemo }: { isDemo?: boolean }) => {
  let navigate = useNavigateWithPrefix();
  let [transitioning, setTransitioning] = useState(false);

  let [runs, setRuns] = useState<StoredRun[]>([]);
  useEffect(() => {
    RunManager.getAll().then(setRuns);
  }, []);

  let activeRunId = useMemo(() => RunManager.getActive(), []);
  let activeRun = useMemo(() => runs.find(run => run.id === activeRunId), [runs, activeRunId]);

  return (
    <Wrapper animate={transitioning ? { opacity: 0 } : { opacity: 1 }}>
      <CenterLayout
        title="Choose a Bytecode File"
        description="Select a .v0t file to visualize"
      >
        <DemoHighlight onClick={() => navigate('/demo')}>Continue with Demo</DemoHighlight>

        <Dropzone
          extension=".v0t"
          onDrop={async files => {
            if (!files.length || transitioning) return;
            setTransitioning(true);

            let { id } = await RunManager.create(files[0]);
            navigate(`/${id}`);
          }}
          placeholder="Drag and drop a .v0t file here or click to select"
        />
      </CenterLayout>

      <AnimatePresence>
        {runs.length && !isDemo && (
          <AsideLayout
            title="History"
            description="Revisit previous bytecode runs"
            innerKey="history"
          >
            {activeRun ? (
              <div
                style={{ marginBottom: 15, display: 'block' }}
                onClick={() => {
                  navigate(`/${activeRun.id}`);
                }}
              >
                <Callout.Root
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Callout.Text>
                    Resume current run for <strong>{activeRun.programName}</strong>
                  </Callout.Text>

                  <Button size="1">Resume</Button>
                </Callout.Root>
              </div>
            ) : (
              <div
                style={{ marginBottom: 15, display: 'block' }}
                onClick={() => {
                  navigate(`/demo`);
                }}
              >
                <Callout.Root
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <Callout.Text>Continue with a demo</Callout.Text>

                  <Button size="1">Continue</Button>
                </Callout.Root>
              </div>
            )}

            <RunItems
              runs={runs
                // .filter(r => !r.isDemo)
                .map(run => ({
                  id: run.id,
                  date: run.date,
                  title: run.programName,
                  size: `${(run.size / 1024).toFixed(2)} KB`
                }))}
              onClick={async id => {
                if (transitioning) return;
                setTransitioning(true);

                await RunManager.prepare(id);

                navigate(`/${id}`);
              }}
              onClear={async () => {
                if (transitioning) return;

                await RunManager.clear();
                await delay(300);
                setRuns([]);
              }}
              onRemove={async id => {
                if (transitioning) return;

                await RunManager.remove(id);
                setRuns(runs.filter(run => run.id !== id));
              }}
            />
          </AsideLayout>
        )}

        {isDemo && (
          <AsideLayout
            title="Interpreter Visualization"
            description="Explore our demo bytecode traces"
            innerKey="demo"
          >
            <DemoItems
              demo={[
                {
                  id: 'https://ssw.jku.at/General/Staff/Weninger/Projects/InterpreterViz/VISSOFT25/demos/Demo1.v0t',
                  title: 'Arithmetic',
                  description: 'Simple program with arithmetic operations'
                },
                {
                  id: 'https://ssw.jku.at/General/Staff/Weninger/Projects/InterpreterViz/VISSOFT25/demos/Demo2.v0t',
                  title: 'Heap Allocation',
                  description: 'Array and object allocation on the heap'
                },
                {
                  id: 'https://ssw.jku.at/General/Staff/Weninger/Projects/InterpreterViz/VISSOFT25/demos/Demo3.v0t',
                  title: 'Control Flow',
                  description: 'Complex program showcasing short-circuit evaluation'
                },
                {
                  id: 'https://ssw.jku.at/General/Staff/Weninger/Projects/InterpreterViz/VISSOFT25/demos/Error.v0t',
                  title: 'Interpreter Error',
                  description: 'Trace with an interpreter error'
                },
                {
                  id: 'https://ssw.jku.at/General/Staff/Weninger/Projects/InterpreterViz/VISSOFT25/demos/DifferentBytecodes.v0t',
                  title: 'Reference Bytecode',
                  description: 'Bytecode diverging from the reference implementation'
                }
              ]}
              onClick={async url => {
                let res = await fetch(url);
                let blob = await res.blob();

                if (transitioning) return;
                setTransitioning(true);

                let { id } = await RunManager.create(blob, { isDemo: true });
                navigate(`/${id}`);
              }}
            />
          </AsideLayout>
        )}
      </AnimatePresence>
    </Wrapper>
  );
};
