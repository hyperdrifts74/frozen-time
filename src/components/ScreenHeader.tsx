import React, { useRef } from 'react';
import {
  Animated,
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { HEADER_ROW_H, HEADER_TOP } from '../constants/config';
import { THEME } from '../constants/theme';

interface Props {
  title?: string;
  variant?: 'light' | 'dark';
  /** Renders the back control on the left when no custom left slot is given. */
  onBack?: () => void;
  backLabel?: string;
  backIcon?: ImageSourcePropType;
  leftSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

const HIT = { top: 8, bottom: 8, left: 8, right: 8 };

/**
 * One header for every screen — only the slots change. Inline header markup
 * duplicated per screen drifts in styling, so this is the single source.
 */
export function ScreenHeader({
  title,
  variant = 'light',
  onBack,
  backLabel = 'MENU',
  backIcon,
  leftSlot,
  centerSlot,
  rightSlot,
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;
  const dark = variant === 'dark';

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      ...THEME.spring.press,
      useNativeDriver: true,
    }).start();
  };
  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      ...THEME.spring.press,
      useNativeDriver: true,
    }).start();
  };

  let left: React.ReactNode = leftSlot ?? null;
  if (!left && onBack) {
    left = (
      <Pressable
        onPress={onBack}
        onPressIn={pressIn}
        onPressOut={pressOut}
        hitSlop={HIT}
        accessibilityRole="button"
        accessibilityLabel={backLabel}
        style={styles.backPress}>
        <Animated.View
          pointerEvents="box-none"
          style={[
            styles.backInner,
            dark ? styles.backInnerDark : styles.backInnerLight,
            { transform: [{ scale }] },
          ]}>
          <View style={styles.row}>
            {backIcon ? (
              <Image source={backIcon} style={styles.backIcon} />
            ) : null}
            <Text
              style={[
                styles.backLabel,
                { color: dark ? THEME.colors.textLight : THEME.colors.accentDeep },
              ]}>
              {backLabel}
            </Text>
          </View>
        </Animated.View>
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.header,
        dark ? styles.headerDark : null,
      ]}>
      <View style={styles.side}>{left}</View>
      <View style={styles.center}>
        {centerSlot}
        {!centerSlot && title ? (
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              { color: dark ? THEME.colors.textLight : THEME.colors.textDark },
            ]}>
            {title}
          </Text>
        ) : null}
      </View>
      <View style={[styles.side, styles.sideRight]}>{rightSlot}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: HEADER_TOP,
    height: HEADER_TOP + HEADER_ROW_H + 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerDark: {
    backgroundColor: THEME.surface.darkSoft,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(234,247,252,0.12)',
  },
  side: { width: 118, justifyContent: 'center' },
  sideRight: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  backPress: { width: 112, height: 48, justifyContent: 'center' },
  backInner: {
    width: 112,
    height: 44,
    borderRadius: THEME.radius.chip,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  backInnerLight: {
    backgroundColor: THEME.surface.light,
    borderColor: THEME.surface.borderLight,
  },
  backInnerDark: {
    backgroundColor: THEME.surface.onDark,
    borderColor: THEME.surface.borderDarkSoft,
  },
  backIcon: { width: 24, height: 24, resizeMode: 'contain' },
  backLabel: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 24,
    letterSpacing: 1.2,
  },
});

export default ScreenHeader;
