import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated,
} from 'react-native';
import { BRAND } from '../constants/theme';

const INTERESTS = [
  { label: 'Music',        size: 118, color: BRAND.INK    },
  { label: 'Marketplace',  size: 150, color: BRAND.CORAL  },
  { label: 'Coding',       size: 104, color: BRAND.MEADOW },
  { label: 'Sports',       size: 132, color: BRAND.INK    },
  { label: 'Art & Design', size: 112, color: BRAND.GOLD   },
  { label: 'Gaming',       size: 126, color: BRAND.MEADOW },
  { label: 'Film',         size:  96, color: BRAND.CORAL  },
  { label: 'Photography',  size: 120, color: BRAND.INK    },
  { label: 'Business',     size: 108, color: BRAND.GOLD   },
  { label: 'Volunteering', size: 114, color: BRAND.MEADOW },
  { label: 'Fitness',      size: 100, color: BRAND.CORAL  },
  { label: 'Food',         size: 104, color: BRAND.INK    },
];

function InterestBubble({ item, isActive, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: isActive ? 1 : 1.04, duration: 120, useNativeDriver: true }),
    ]).start();
    onPress(item.label);
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.9}
        style={[
          styles.bubble,
          {
            width: item.size,
            height: item.size,
            borderRadius: item.size / 2,
            backgroundColor: isActive
              ? item.color
              : 'rgba(250,247,242,0.06)',
            borderWidth: isActive ? 0 : 1.5,
            borderColor: 'rgba(250,247,242,0.22)',
          },
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            {
              fontSize: item.size > 120 ? 14 : 12,
              color: isActive ? '#fff' : '#C9CEDA',
            },
          ]}
          numberOfLines={2}
        >
          {item.label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function InterestsScreen({ onContinue }: any) {
  const [selected, setSelected] = useState(new Set(['Marketplace']));

  const toggle = (label) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const enough = selected.size >= 3;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.heading}>What's your quad?</Text>
        <Text style={styles.subheading}>
          Pick a few things you're into. We'll shape your feed and suggest clubs.
        </Text>
      </View>

      {/* Bubble field */}
      <ScrollView
        contentContainerStyle={styles.bubblesContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bubblesWrap}>
          {INTERESTS.map(item => (
            <InterestBubble
              key={item.label}
              item={item}
              isActive={selected.has(item.label)}
              onPress={toggle}
            />
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.countText}>
          {selected.size} selected
          {!enough ? `  ·  pick ${3 - selected.size} more` : ''}
        </Text>

        <TouchableOpacity
          onPress={onContinue}
          disabled={!enough}
          activeOpacity={0.85}
          style={[styles.ctaBtn, !enough && styles.ctaBtnDisabled]}
        >
          <Text style={[styles.ctaText, !enough && styles.ctaTextDisabled]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.INK,
  },
  header: {
    paddingHorizontal: 26,
    paddingTop: 52,
    paddingBottom: 4,
    gap: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: BRAND.PAPER,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 12.5,
    color: '#9AA3B8',
    lineHeight: 19,
  },
  bubblesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  bubblesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  bubbleText: {
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: 26,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 12,
    alignItems: 'center',
  },
  countText: {
    fontSize: 11,
    color: '#9AA3B8',
  },
  ctaBtn: {
    width: '100%',
    backgroundColor: BRAND.CORAL,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: BRAND.CORAL,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  ctaBtnDisabled: {
    backgroundColor: 'rgba(250,247,242,0.12)',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  ctaTextDisabled: {
    color: BRAND.SLATE,
  },
});
