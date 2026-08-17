import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import QuadImage from '../components/QuadImage';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { deleteUserAccount } from '../services/userService';
import EditProfileModal from '../components/EditProfileModal';
import RoleBadge from '../components/RoleBadge';
import AdComposerModal from '../components/AdComposerModal';
import AdsReviewScreen from './AdsReviewScreen';

export default function ProfileScreen({ currentUser, setCurrentUser, onOpenVerification, onSignOut }: any) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Sign Out", 
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              if (onSignOut) onSignOut();
            } catch (err) {
              console.error("Error signing out:", err);
            }
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and will delete your profile document.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserAccount(currentUser.uid);
              if (onSignOut) onSignOut();
            } catch (err) {
              console.error("Error deleting account:", err);
              Alert.alert("Error", err.message || "Failed to delete account.");
            }
          }
        }
      ]
    );
  };

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Banner with 3-Dots Settings Menu */}
      <View style={{ position: 'relative' }}>
        <QuadImage uri={currentUser.bannerUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&fm=jpg&fit=crop&q=80' } style={styles.banner} />
        <TouchableOpacity 
          onPress={() => setShowSettingsMenu(true)} 
          style={styles.topMenuBtn}
          activeOpacity={0.8}
        >
          <Feather name="more-vertical" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main Profile Info */}
      <View style={styles.headerCard}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <QuadImage uri={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80' } style={styles.avatar} />
          {currentUser.isVerifiedSchool && (
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" />
            </View>
          )}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={styles.name}>{currentUser.displayName}</Text>
          <RoleBadge role={currentUser.role || (currentUser.roles ? currentUser.roles[0] : 'student')} size={18} />
        </View>
        <Text style={styles.username}>@{currentUser.username}</Text>

        <View style={styles.schoolPill}>
          <Ionicons name="school-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
          <Text style={styles.schoolText}>{currentUser.schoolName} • {currentUser.gradYear || 2026}</Text>
        </View>

        <Text style={styles.bio}>{currentUser.bio || 'Student @ ' + currentUser.schoolName}</Text>

        {/* Stats Row Bar */}
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{currentUser.followersCount || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={styles.statNum}>{currentUser.followingCount || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: COLORS.primary }]}>
              {((currentUser.likesReceived || 0) / 1000).toFixed(1)}k
            </Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>

        {/* Active Account Role Switcher (Super Admin Only) */}
        {(currentUser?.role === 'super_admin' || currentUser?.roles?.includes('super_admin') || currentUser?.email?.toLowerCase() === 'ayomidenoch15@gmail.com') && (
          <View style={styles.roleSection}>
            <Text style={styles.roleSectionTitle}>Active Account Role Badge (Super Admin Tool)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleRow}>
              {[
                { id: 'student', name: 'Student' },
                { id: 'club_admin', name: 'Club Admin' },
                { id: 'school_admin', name: 'School Admin' },
                { id: 'super_admin', name: 'Super Admin' },
                { id: 'advertiser', name: 'Advertiser' },
                { id: 'ads_reviewer', name: 'Ads Reviewer' },
              ].map(r => {
                const currentRole = currentUser.role || 'student';
                const isSelected = currentRole === r.id;
                return (
                  <TouchableOpacity
                    key={r.id}
                    onPress={() => {
                      if (setCurrentUser) {
                        setCurrentUser(prev => ({ ...prev, role: r.id }));
                      }
                    }}
                    style={[styles.rolePill, isSelected && styles.rolePillActive]}
                  >
                    <RoleBadge role={r.id} size={14} />
                    <Text style={[styles.rolePillText, isSelected && styles.rolePillTextActive]}>{r.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.editBtn}>
            <Feather name="edit-3" size={14} color="#fff" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowAdModal(true)} style={[styles.editBtn, { backgroundColor: '#3B82C4' }]}>
            <Ionicons name="megaphone-outline" size={14} color="#fff" />
            <Text style={styles.editBtnText}>Create Ad</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowReviewModal(true)} style={[styles.editBtn, { backgroundColor: '#6B7280' }]}>
            <Ionicons name="checkmark-done-circle-outline" size={14} color="#fff" />
            <Text style={styles.editBtnText}>Review Queue</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3-Dots Settings Popup Modal */}
      <Modal visible={showSettingsMenu} animationType="fade" transparent onRequestClose={() => setShowSettingsMenu(false)}>
        <TouchableOpacity style={styles.settingsOverlay} activeOpacity={1} onPress={() => setShowSettingsMenu(false)}>
          <View style={styles.settingsSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.settingsTitle}>Account Settings</Text>

            <TouchableOpacity 
              onPress={() => {
                setShowSettingsMenu(false);
                handleSignOut();
              }}
              style={styles.settingsItem}
            >
              <Feather name="log-out" size={18} color={COLORS.primary} />
              <Text style={styles.settingsItemText}>Sign Out</Text>
            </TouchableOpacity>

            <View style={styles.settingsDivider} />

            <TouchableOpacity 
              onPress={() => {
                setShowSettingsMenu(false);
                handleDeleteAccount();
              }}
              style={styles.settingsItem}
            >
              <Ionicons name="trash-outline" size={18} color="#EF4444" />
              <Text style={[styles.settingsItemText, { color: '#EF4444' }]}>Delete Account Permanently</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentUser={currentUser}
        onProfileUpdated={(updatedData) => {
          if (setCurrentUser) {
            setCurrentUser(prev => ({ ...prev, ...updatedData }));
          }
        }}
      />

      <AdComposerModal
        visible={showAdModal}
        onClose={() => setShowAdModal(false)}
        currentUser={currentUser}
        currentSchool={{ id: currentUser.schoolId || 'school', name: currentUser.schoolName || 'University', shortName: 'School' }}
      />

      <AdsReviewScreen
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        currentUser={currentUser}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  banner: {
    width: '100%',
    height: 120,
  },
  headerCard: {
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: -40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.bgCard,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.badgeGreen,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  name: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  username: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  schoolPill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    marginTop: 8,
  },
  schoolText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bio: {
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textMain,
    textAlign: 'center',
    marginTop: 8,
  },
  statsBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    ...COLORS.shadowSm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.borderColor,
  },
  btnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginTop: 16,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.badgeGreen,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  signOutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  roleSection: {
    width: '100%',
    marginTop: 16,
    backgroundColor: COLORS.bgInput,
    padding: 12,
    borderRadius: RADIUS.xl,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  roleSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleRow: {
    gap: 8,
    paddingVertical: 2,
  },
  rolePillText: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  rolePillTextActive: { color: COLORS.primary, fontWeight: '800' },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  rolePillActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  topMenuBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  settingsSheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 20,
    gap: 14,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  settingsItemText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  settingsDivider: {
    height: 1,
    backgroundColor: COLORS.borderColor,
  }
});
