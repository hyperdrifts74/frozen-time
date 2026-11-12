import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Eye, RotateCcw, Waves } from 'lucide-react-native';
import { ASSETS } from '../assets';
import AuroraBackground from '../components/AuroraBackground';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import SegmentedChips from '../components/SegmentedChips';
import { ASSIST_OFF_BONUS, SWEEP_MULTIPLIER } from '../constants/config';
import { THEME } from '../constants/theme';
import { SweepSetting } from '../game/hook';
import { AssistSetting, ProgressData } from '../game/progressStore';

interface Props {
  data: ProgressData;
  onBack: () => void;
  onSweep: (value: SweepSetting) => void;
  onAssist: (value: AssistSetting) => void;
  onReset: () => void;
}

const SWEEP_OPTIONS: SweepSetting[] = ['CALM', 'STANDARD', 'BRISK'];
const ASSIST_OPTIONS: AssistSetting[] = ['ON', 'OFF'];
const CONFIRM_MS = 4000;

export function SettingsScreen({
  data,
  onBack,
  onSweep,
  onAssist,
  onReset,
}: Props) {
  const [armed, setArmed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleReset = useCallback(() => {
    if (!armed) {
      setArmed(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => setArmed(false), CONFIRM_MS);
      return;
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setArmed(false);
    onReset();
  }, [armed, onReset]);

  const sweepNote =
    'HOOK PASS x' + SWEEP_MULTIPLIER[data.sweep].toFixed(2) + ' OF THE SPOT SPEED';
  const assistNote =
    data.assist === 'ON'
      ? 'TIMING ARC SHOWN · NO SCORE BONUS'
      : 'NO ARC · EVERY SCORE x' + ASSIST_OFF_BONUS.toFixed(2);

  return (
    <AuroraBackground variant="light" blobs="bottom">
      <ScreenHeader
        variant="light"
        title="SETTINGS"
        onBack={onBack}
        backLabel="MENU"
        backIcon={ASSETS.iconHome}
      />

      <View style={styles.body}>
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Waves size={24} color={THEME.colors.accent} strokeWidth={2} />
            <View style={styles.cardTexts}>
              <Text style={styles.cardTitle}>HOOK SWEEP</Text>
              <Text style={styles.cardNote}>{sweepNote}</Text>
            </View>
          </View>
          <SegmentedChips
            options={SWEEP_OPTIONS}
            value={data.sweep}
            onChange={v => onSweep(v as SweepSetting)}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Eye size={24} color={THEME.colors.violet} strokeWidth={2} />
            <View style={styles.cardTexts}>
              <Text style={styles.cardTitle}>RIPPLE ASSIST</Text>
              <Text style={styles.cardNote}>{assistNote}</Text>
            </View>
          </View>
          <SegmentedChips
            options={ASSIST_OPTIONS}
            value={data.assist}
            onChange={v => onAssist(v as AssistSetting)}
          />
        </View>

        <View style={[styles.card, styles.resetCard]}>
          <View style={styles.cardHead}>
            <RotateCcw size={24} color={THEME.colors.warn} strokeWidth={2} />
            <View style={styles.cardTexts}>
              <Text style={[styles.cardTitle, styles.resetTitle]}>
                RESET PROGRESS
              </Text>
              <Text style={styles.cardNote}>
                CATCHES, GRADES, BEST SCORES AND UNLOCKS GO BACK TO SPOT 1
              </Text>
            </View>
          </View>
          <SecondaryButton
            tone="warn"
            label={armed ? 'TAP AGAIN TO CONFIRM' : 'RESET PROGRESS'}
            onPress={handleReset}
          />
        </View>

        <View style={styles.spacer} />

        <Text style={styles.footer}>
          OFFLINE · NO ADS · NO PURCHASES · VERSION FROM THE TICKET
        </Text>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: 16, paddingBottom: 16, gap: 14 },
  card: {
    padding: 14,
    gap: 12,
    borderRadius: THEME.radius.card,
    backgroundColor: THEME.surface.lightStrong,
    borderWidth: 1,
    borderColor: THEME.surface.borderLight,
  },
  resetCard: {
    backgroundColor: 'rgba(224,115,79,0.14)',
    borderColor: THEME.colors.warn,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTexts: { flex: 1 },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.6,
    color: THEME.colors.textDark,
  },
  resetTitle: { color: THEME.colors.warn },
  cardNote: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    color: THEME.colors.textDarkSoft,
  },
  spacer: { flex: 1 },
  footer: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1,
    textAlign: 'center',
    color: THEME.colors.textDim,
  },
});

export default SettingsScreen;
