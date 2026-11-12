import { useEffect, useRef, useState } from 'react';
import { Animated } from 'react-native';

/**
 * Counts 0 -> value over `ms`. Drives plain state (not a style prop), so the
 * JS driver is correct here — no layout property is animated natively.
 */
export function useCountUp(value: number, ms: number): number {
  const [shown, setShown] = useState(0);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value <= 0) {
      setShown(0);
      return;
    }
    anim.setValue(0);
    const id = anim.addListener(({ value: v }) => {
      setShown(Math.round(v));
    });
    const animation = Animated.timing(anim, {
      toValue: value,
      duration: ms,
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) {
        setShown(value);
      }
    });
    return () => {
      animation.stop();
      anim.removeListener(id);
    };
  }, [value, ms, anim]);

  return shown;
}
