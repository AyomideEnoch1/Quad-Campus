import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, DimensionValue } from 'react-native';
import Svg, { Circle, Line as SvgLine } from 'react-native-svg';
import { BRAND } from '../constants/theme';

export interface SplashScreenProps {
  onDone: () => void;
}

function QMark({ size = 64 }: { size?: number }) {
  const sw = size * 0.16;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle
        cx="42" cy="40" r="34"
        fill="none" stroke={BRAND.PAPER} strokeWidth={sw}
      />
      <SvgLine
        x1="63" y1="61" x2="88" y2="86"
        stroke={BRAND.CORAL} strokeWidth={sw} strokeLinecap="round"
      />
    </Svg>
  );
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const dot0 = useRef(new Animated.Value(0.25)).current;
  const dot1 = useRef(new Animated.Value(0.25)).current;
  const dot2 = useRef(new Animated.Value(0.25)).current;
  const dots = [dot0, dot1, dot2];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.06, duration: 900, useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1, duration: 900, useNativeDriver: true,
        }),
      ])
    ).start();

    const animateDot = (idx: number) => {
      Animated.sequence([
        Animated.timing(dots[idx], {
          toValue: 1, duration: 380, useNativeDriver: true,
        }),
        Animated.timing(dots[idx], {
          toValue: 0.25, duration: 380, useNativeDriver: true,
        }),
      ]).start(() => animateDot((idx + 1) % 3));
    };
    animateDot(0);

    const timer = setTimeout(onDone, 2600);
    return () => clearTimeout(timer);
  }, []);

  const vLines = [1, 2, 3].map(i => ({ left: `${(i * 100) / 4}%` as DimensionValue }));
  const hLines = [1, 2, 3, 4, 5, 6, 7].map(i => ({ top: `${(i * 100) / 8}%` as DimensionValue }));

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {vLines.map((s, i) => (
          <View key={`v${i}`} style={[styles.vLine, s]} />
        ))}
        {hLines.map((s, i) => (
          <View key={`h${i}`} style={[styles.hLine, s]} />
        ))}
      </View>

      <Animated.View style={{ transform: [{ scale }] }}>
        <QMark size={92} />
      </Animated.View>

      <Text style={styles.wordmark}>QUAD</Text>
      <Text style={styles.tagline}>connect. trade. belong.</Text>

      <View style={styles.dotsRow}>
        {dots.map((opacity, i) => (
          <Animated.View key={i} style={[styles.dot, { opacity }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.INK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: BRAND.PAPER,
    opacity: 0.08,
  },
  hLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: BRAND.PAPER,
    opacity: 0.08,
  },
  wordmark: {
    marginTop: 28,
    fontWeight: '800',
    fontSize: 40,
    letterSpacing: 2,
    color: BRAND.PAPER,
  },
  tagline: {
    marginTop: 8,
    fontStyle: 'italic',
    fontSize: 14,
    color: '#9AA3B8',
    letterSpacing: 0.5,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 56,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BRAND.CORAL,
  },
});
