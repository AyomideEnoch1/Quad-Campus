import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

export function SkeletonItem({ style }) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.skeleton, style, { opacity }]} />;
}

export function FeedCardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <SkeletonItem style={styles.avatar} />
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonItem style={{ width: '40%', height: 14, borderRadius: 4 }} />
          <SkeletonItem style={{ width: '25%', height: 10, borderRadius: 4 }} />
        </View>
      </View>
      <SkeletonItem style={{ width: '90%', height: 14, borderRadius: 4, marginTop: 12 }} />
      <SkeletonItem style={{ width: '70%', height: 14, borderRadius: 4, marginTop: 6 }} />
      <SkeletonItem style={{ width: '100%', height: 140, borderRadius: RADIUS.lg, marginTop: 12 }} />
    </View>
  );
}

export function MarketCardSkeleton() {
  return (
    <View style={styles.marketCard}>
      <SkeletonItem style={{ width: '100%', height: 120, borderRadius: RADIUS.md }} />
      <SkeletonItem style={{ width: '80%', height: 12, borderRadius: 4, marginTop: 8 }} />
      <SkeletonItem style={{ width: '50%', height: 10, borderRadius: 4, marginTop: 4 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E2E8F0',
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  marketCard: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  }
});
