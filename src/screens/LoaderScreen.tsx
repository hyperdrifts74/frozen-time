import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ASSETS } from '../assets';
import AuroraBackground from '../components/AuroraBackground';
import { LOADER_DURATION_MS } from '../constants/config';
import { THEME } from '../constants/theme';

interface Props {
  onDone: () => void;
}

/**
 * Frost field. Every speck sits in the upper band or hard against a side
 * margin, so no decoration can ever land on the brand lettering.
 */
const SPECKS = [
  { left: 28, top: 86, size: 3 },
  { left: 92, top: 58, size: 2 },
  { left: 164, top: 142, size: 4 },
  { left: 236, top: 74, size: 2 },
  { left: 300, top: 118, size: 3 },
  { left: 56, top: 196, size: 2 },
  { left: 132, top: 238, size: 3 },
  { left: 268, top: 212, size: 2 },
  { left: 204, top: 268, size: 4 },
  { left: 14, top: 352, size: 2 },
  { left: 12, top: 470, size: 3 },
  { left: 16, top: 612, size: 2 },
  { left: 352, top: 398, size: 3 },
  { left: 356, top: 540, size: 2 },
];

const BAR_W = 180;

function FrostSpeck({ index, spec }: { index: number; spec: typeof SPECKS[0] }) {
  const fade = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const duration = 2400 + (index % 5) * 200;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fade, {
          toValue: 0.7,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0.25,
          duration,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
    };
  }, [fade, index]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.speck,
        {
          left: spec.left,
          top: spec.top,
          width: spec.size,
          height: spec.size,
          opacity: fade,
        },
      ]}
    />
  );
}

/**
 * Brand card, never a menu duplicate: no PLAY, no chips, not tappable. The
 * 8000 ms timer is the only thing that moves it on.
 */
export function LoaderScreen({ onDone }: Props) {
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const logoFade = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;
  const titleRise = useRef(new Animated.Value(16)).current;
  const subFade = useRef(new Animated.Value(0)).current;
  const barFill = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const entry = Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 42,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoFade, {
        toValue: 1,
        duration: 420,
        useNativeDriver: true,
      }),
      Animated.timing(titleFade, {
        toValue: 1,
        duration: 480,
        delay: 260,
        useNativeDriver: true,
      }),
      Animated.timing(titleRise, {
        toValue: 0,
        duration: 480,
        delay: 260,
        useNativeDriver: true,
      }),
      Animated.timing(subFade, {
        toValue: 1,
        duration: 420,
        delay: 520,
        useNativeDriver: true,
      }),
    ]);
    entry.start();

    // width is not a native-driver property — JS driver is required here.
    const bar = Animated.timing(barFill, {
      toValue: BAR_W,
      duration: LOADER_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    bar.start();

    return () => {
      entry.stop();
      bar.stop();
    };
  }, [logoScale, logoFade, titleFade, titleRise, subFade, barFill]);

  useEffect(() => {
    const id = setTimeout(onDone, LOADER_DURATION_MS);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <AuroraBackground variant="deep" blobs="mid">
      <View style={styles.specks} pointerEvents="none">
        {SPECKS.map((s, i) => (
          <FrostSpeck key={'sp' + i} index={i} spec={s} />
        ))}
      </View>

      <View style={styles.center}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.glowDisc,
            { opacity: logoFade, transform: [{ scale: logoScale }] },
          ]}>
          <Image source={ASSETS.logo} style={styles.logo} />
        </Animated.View>

        <Animated.Text
          style={[
            styles.title,
            { opacity: titleFade, transform: [{ translateY: titleRise }] },
          ]}>
          FROZEN TIME
        </Animated.Text>

        <Animated.Text style={[styles.subtitle, { opacity: subFade }]}>
          READ THE ICE · DROP THE LINE
        </Animated.Text>

        <View style={styles.barTrack}>
          <Animated.View
            pointerEvents="none"
            style={[styles.barFillWrap, { width: barFill }]}>
            <LinearGradient
              colors={[...THEME.gradients.loaderBar]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.barFill}
            />
          </Animated.View>
        </View>
        <Text style={styles.loading}>LOADING…</Text>
      </View>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  specks: { ...StyleSheet.absoluteFillObject },
  speck: {
    position: 'absolute',
    borderRadius: 2,
    backgroundColor: 'rgba(234,247,252,0.35)',
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  glowDisc: {
    width: 168,
    height: 168,
    borderRadius: 84,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,166,203,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(234,247,252,0.18)',
  },
  logo: { width: 148, height: 148, resizeMode: 'contain' },
  title: {
    marginTop: 28,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 5,
    color: THEME.colors.textLight,
    textShadowColor: THEME.colors.accent,
    textShadowRadius: 18,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 2.4,
    color: THEME.colors.textLightSoft,
  },
  barTrack: {
    marginTop: 40,
    width: BAR_W,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(234,247,252,0.14)',
    overflow: 'hidden',
  },
  barFillWrap: { height: 5, borderRadius: 3, overflow: 'hidden' },
  barFill: { flex: 1 },
  loading: {
    marginTop: 12,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 3,
    color: THEME.colors.textDim,
  },
});

export default LoaderScreen;
