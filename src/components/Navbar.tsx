import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import QuadLogo from './QuadLogo';
import QuadImage from './QuadImage';
import { COLORS, RADIUS } from '../constants/theme';

export default function Navbar({ 
  currentSchool, 
  onOpenSchoolPicker, 
  unreadNotifications, 
  onOpenSearch, 
  onOpenNotifications, 
  onOpenVerification, 
  currentUser,
  onOpenProfile
}: any) {
  const isAdmin = currentUser?.role === 'super_admin' || 
    currentUser?.roles?.includes('super_admin') || 
    currentUser?.role === 'school_admin' || 
    currentUser?.roles?.includes('school_admin') ||
    currentUser?.email?.toLowerCase() === 'ayomidenoch15@gmail.com';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Left Section: Profile Avatar (Left of Logo) + Logo + Campus Badge (Admins Only) */}
        <View style={styles.leftSection}>
          {/* Profile Avatar Button */}
          <TouchableOpacity 
            onPress={onOpenProfile} 
            style={styles.profileBtn}
            activeOpacity={0.8}
          >
            <QuadImage 
              uri={currentUser?.avatarUrl} 
              fallbackIcon="person-circle" 
              style={styles.profileAvatar} 
            />
          </TouchableOpacity>

          <QuadLogo height={24} showText={true} />

          {isAdmin && (
            <TouchableOpacity 
              onPress={onOpenSchoolPicker} 
              style={styles.schoolPill}
              activeOpacity={0.7}
            >
              <Ionicons name="school-outline" size={14} color={COLORS.primary} />
              <Text style={styles.schoolText} numberOfLines={1}>{currentSchool?.shortName || 'Campus'}</Text>
              <Feather name="chevron-down" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}

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
    paddingHorizontal: 12,
    backgroundColor: COLORS.bgCard,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  profileBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    overflow: 'hidden',
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  schoolPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    maxWidth: 90,
  },
  schoolPillStatic: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    maxWidth: 90,
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
    paddingHorizontal: 6,
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
