import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useInterval } from 'react-use';
import { useSettings } from '../../../../state';
import { useBanketOpen } from '../../../components/overlay';

let useRegionStateProvider = () => {
  let { animationMultiplier } = useSettings();

  let [currentRegion, setCurrentRegion] = useState<string>();
  let mouseTORef = useRef<NodeJS.Timeout>();

  let blanketOpen = useBanketOpen();

  useEffect(() => {
    if (blanketOpen) setCurrentRegion(undefined);
  }, [blanketOpen]);

  let lastHoverRef = useRef<number>();
  useInterval(() => {
    if (lastHoverRef.current && Date.now() - lastHoverRef.current > 5_000) {
      setCurrentRegion(undefined);
    }
  }, 1000);

  let [ready, setReady] = useState(false);

  useEffect(() => {
    let to = setTimeout(() => setReady(true), 1000);
    return () => clearTimeout(to);
  }, []);

  return {
    currentRegion: ready ? currentRegion : undefined,
    setCurrentRegion,
    mouseTORef,
    lastHoverRef,
    blanketOpen,
    animationMultiplier
  };
};

let RegionStateContext = createContext<ReturnType<typeof useRegionStateProvider>>(null!);

export let RegionStateProvider = ({ children }: { children: React.ReactNode }) => {
  let value = useRegionStateProvider();
  return <RegionStateContext.Provider value={value}>{children}</RegionStateContext.Provider>;
};

export let useRegionState = () => {
  let context = useContext(RegionStateContext);
  if (!context) throw new Error('useRegionState must be used within a RegionStateProvider');
  return context;
};
