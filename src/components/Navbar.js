import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import QuadLogo from './QuadLogo';
import { COLORS, RADIUS } from '../constants/theme';

export default function Navbar({ 
  currentSchool, 
  onOpenSchoolPicker, 
  unreadNotifications, 
  onOpenSearch, 
  onOpenNotifications,
  onOpenVerification
}) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo & Campus Button */}
        <View style={styles.leftSection}>
          <QuadLogo height={24} showText={true} />

          <TouchableOpacity 
            onPress={onOpenSchoolPicker} 
            style={styles.schoolPill}
            activeOpacity={0.7}
          >
            <Ionicons name="school-outline" size={14} color={COLORS.primary} />
            <Text style={styles.schoolText} numberOfLines={1}>{currentSchool.shortName}</Text>
            <Feather name="chevron-down" size={14} color={COLORS.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onOpenVerification}
            style={styles.eduBadge}
            activeOpacity={0.7}
          >
            <Ionicons name="shield-checkmark" size={12} color={COLORS.badgeGreen} />
            <Text style={styles.eduText}>.edu</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.rightSection}>
          <TouchableOpacity 
            onPress={onOpenSearch} 
            style={styles.iconBtn}
            activeOpacity={0.7}
          >
            <Feather name="search" size={18} color={COLORS.textMain} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={onOpenNotifications} 
            style={styles.iconBtn}
            activeOpacity={0.7}
          >
            <Feather name="bell" size={18} color={COLORS.textMain} />
            {unreadNotifications > 0 && <View style={styles.redDot} />}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  container: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    backgroundColor: COLORS.bgCard,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  schoolPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  schoolText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  eduBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  eduText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.badgeGreen,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  redDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  }
});
