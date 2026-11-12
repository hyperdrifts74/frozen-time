import { useCallback, useEffect, useState } from 'react';
import {
  AssistSetting,
  ProgressData,
  progressStore,
} from '../game/progressStore';
import { SweepSetting } from '../game/hook';

/**
 * Thin selector hook over the progress repository. Components read exactly the
 * slices they need from the returned object instead of each one re-deriving it.
 */
export function useProgress() {
  const [data, setData] = useState<ProgressData>(() => progressStore.load());

  useEffect(() => {
    setData(progressStore.load());
    return progressStore.subscribe(setData);
  }, []);

  const setSweep = useCallback((sweep: SweepSetting) => {
    progressStore.update(d => ({ ...d, sweep }));
  }, []);

  const setAssist = useCallback((assist: AssistSetting) => {
    progressStore.update(d => ({ ...d, assist }));
  }, []);

  const setLastSpot = useCallback((lastSpot: number) => {
    progressStore.update(d => ({ ...d, lastSpot }));
  }, []);

  const resetAll = useCallback(() => {
    progressStore.reset();
  }, []);

  return { data, setSweep, setAssist, setLastSpot, resetAll };
}
