import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { deleteUserAccount } from '../services/userService';
import EditProfileModal from '../components/EditProfileModal';
import RoleBadge from '../components/RoleBadge';

export default function ProfileScreen({ currentUser, setCurrentUser, onOpenVerification, onSignOut }) {
  const [showEditModal, setShowEditModal] = useState(false);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* Banner */}
      <Image source={{ uri: currentUser.bannerUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80' }} style={styles.banner} />

      {/* Main Profile Info */}
      <View style={styles.headerCard}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image source={{ uri: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' }} style={styles.avatar} />
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

        {/* Action Buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity onPress={() => setShowEditModal(true)} style={styles.editBtn}>
            <Feather name="edit-3" size={14} color="#fff" />
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>

          {!currentUser.isVerifiedSchool && (
            <TouchableOpacity onPress={onOpenVerification} style={styles.verifyBtn}>
              <Ionicons name="shield-checkmark" size={14} color="#fff" />
              <Text style={styles.verifyBtnText}>Verify .edu</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
            <Feather name="log-out" size={14} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDeleteAccount} style={[styles.signOutBtn, { backgroundColor: '#FEE2E2', borderColor: '#FCA5A5' }]}>
            <Ionicons name="trash-outline" size={14} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

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
    gap: 10,
    width: '100%',
    marginTop: 14,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  editBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  verifyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.badgeGreen,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  signOutBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryTint,
  }
});
