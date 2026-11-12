import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ASSETS } from '../assets';
import AuroraBackground from '../components/AuroraBackground';
import ScreenHeader from '../components/ScreenHeader';
import SpotCard from '../components/SpotCard';
import { THEME } from '../constants/theme';
import { ProgressData } from '../game/progressStore';
import { SPOTS, SpotConfig, isSpotUnlocked, unlockedCount } from '../game/spots';

interface Props {
  data: ProgressData;
  onBack: () => void;
  onStart: (spotIndex: number) => void;
}

export function LevelSelectScreen({ data, onBack, onStart }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const toastFade = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const animation = Animated.timing(toastFade, {
      toValue: toast ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [toast, toastFade]);

  const handlePress = useCallback(
    (spot: SpotConfig, unlocked: boolean) => {
      if (unlocked) {
        onStart(spot.index);
        return;
      }
      setToast('NEEDS ' + spot.unlockAt + ' CATCHES');
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setToast(null), 1600);
    },
    [onStart],
  );

  const open = unlockedCount(data.totalCatches);

  return (
    <AuroraBackground variant="light" blobs="bottom">
      <ScreenHeader
        variant="light"
        title="ICE SPOTS"
        onBack={onBack}
        backLabel="MENU"
        backIcon={ASSETS.iconHome}
        rightSlot={
          <Text style={styles.count}>{open + '/' + SPOTS.length}</Text>
        }
      />

      <View style={styles.body}>
        <Text style={styles.lead}>
          DEEPER WATER · FASTER RIPPLES · MORE EMPTY HOLES
        </Text>
        <View style={styles.list}>
          {SPOTS.map(spot => (
            <SpotCard
              key={spot.name}
              spot={spot}
              unlocked={isSpotUnlocked(spot.index, data.totalCatches)}
              best={data.bestPerSpot[spot.index] || 0}
              onPress={handlePress}
            />
          ))}
        </View>
      </View>

      <Animated.View
        pointerEvents="none"
        style={[styles.toast, { opacity: toastFade }]}>
        <Text style={styles.toastText}>{toast || ''}</Text>
      </Animated.View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  count: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textDarkSoft,
    fontVariant: ['tabular-nums'],
  },
  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 16 },
  lead: {
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textAlign: 'center',
    color: THEME.colors.textDarkSoft,
  },
  list: { flex: 1, gap: 10, justifyContent: 'space-between' },
  toast: {
    position: 'absolute',
    left: 40,
    right: 40,
    bottom: 34,
    paddingVertical: 10,
    borderRadius: THEME.radius.chip,
    alignItems: 'center',
    backgroundColor: 'rgba(6,32,47,0.82)',
  },
  toastText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    color: THEME.colors.textLight,
  },
});

export default LevelSelectScreen;
