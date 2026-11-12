import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ASSETS } from '../assets';
import { THEME } from '../constants/theme';

export type AuroraVariant = 'light' | 'deep' | 'game' | 'result';
export type BlobPlacement = 'top' | 'mid' | 'bottom';

interface Props {
  variant?: AuroraVariant;
  blobs?: BlobPlacement;
  /** Extra tint over the gradient (Collection uses a cool parchment wash). */
  wash?: string;
  children?: React.ReactNode;
}

const GRADIENTS: Record<AuroraVariant, string[]> = {
  light: [...THEME.gradients.light],
  deep: [...THEME.gradients.loaderBase],
  game: ['#0B3246', '#06202F', '#06202F'],
  result: [...THEME.gradients.result],
};

// bg_game is the only background in the project; each screen differs by overlay.
const IMAGE_OPACITY: Record<AuroraVariant, number> = {
  light: 0.1,
  deep: 0.5,
  game: 0.22,
  result: 0.16,
};

const GRADIENT_OPACITY: Record<AuroraVariant, number> = {
  light: 0.94,
  deep: 0.9,
  game: 0.88,
  result: 0.92,
};

const BLOB_A: Record<BlobPlacement, { top: number; left: number }> = {
  top: { top: -60, left: -40 },
  mid: { top: 240, left: -70 },
  bottom: { top: 470, left: -50 },
};

const BLOB_B: Record<BlobPlacement, { top: number; right: number }> = {
  top: { top: 30, right: -50 },
  mid: { top: 330, right: -60 },
  bottom: { top: 560, right: -40 },
};

export function AuroraBackground({
  variant = 'light',
  blobs = 'top',
  wash,
  children,
}: Props) {
  const a = BLOB_A[blobs];
  const b = BLOB_B[blobs];
  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ImageBackground
        source={ASSETS.bgGame}
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: IMAGE_OPACITY[variant] }}
        resizeMode="cover">
        <LinearGradient
          colors={GRADIENTS[variant]}
          locations={[0, 0.55, 1]}
          style={[
            StyleSheet.absoluteFill,
            { opacity: GRADIENT_OPACITY[variant] },
          ]}
        />
        {variant === 'deep' ? (
          <LinearGradient
            colors={[...THEME.gradients.loaderAurora]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={styles.auroraBand}
          />
        ) : null}
        <View
          style={[
            styles.blob,
            styles.blobViolet,
            { top: a.top, left: a.left },
          ]}
        />
        <View
          style={[styles.blob, styles.blobMint, { top: b.top, right: b.right }]}
        />
        {wash ? (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: wash }]} />
        ) : null}
      </ImageBackground>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.colors.water1 },
  content: { flex: 1 },
  auroraBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobViolet: {
    width: 260,
    height: 260,
    backgroundColor: 'rgba(110,91,216,0.18)',
  },
  blobMint: {
    width: 220,
    height: 220,
    backgroundColor: 'rgba(95,227,192,0.20)',
  },
});

export default AuroraBackground;
