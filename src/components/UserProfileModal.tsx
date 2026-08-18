import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import QuadImage from './QuadImage';
import RoleBadge from './RoleBadge';
import { COLORS, RADIUS } from '../constants/theme';
import { UserProfile } from '../types';
import { getUser, subscribeUserProfile, checkIfFollowing, toggleFollowUser, checkIfProfileLiked, toggleLikeUserProfile } from '../services/userService';
import { createNotificationEvent } from '../services/notificationService';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: string | null;
  initialUserData?: Partial<UserProfile> | null;
  currentUser: UserProfile;
  onStartChat?: (partner: any) => void;
}

export default function UserProfileModal({
  visible,
  onClose,
  userId,
  initialUserData,
  currentUser,
  onStartChat,
}: UserProfileModalProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 16);

  const [user, setUser] = useState<any>(initialUserData || null);
  const [loading, setLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const targetUid = userId || initialUserData?.uid;
  const isMe = currentUser?.uid === targetUid;

  useEffect(() => {
    if (!visible || !targetUid) return;

    if (initialUserData) {
      setUser(initialUserData);
    }

    setLoading(true);

    const unsub = subscribeUserProfile(targetUid, (liveUser) => {
      if (liveUser) {
        setUser((prev: any) => ({ ...prev, ...liveUser }));
      }
      setLoading(false);
    });

    if (!isMe && currentUser?.uid) {
      Promise.all([
        checkIfFollowing(currentUser.uid, targetUid),
        checkIfProfileLiked(currentUser.uid, targetUid),
      ]).then(([followingStatus, likedStatus]) => {
        setIsFollowing(followingStatus);
        setIsLiked(likedStatus);
      }).catch((err) => {
        console.warn("Status check notice:", err);
      });
    }

    return () => {
      unsub();
    };
  }, [visible, targetUid, currentUser?.uid]);

  const handleToggleFollow = async () => {
    if (!currentUser?.uid || !targetUid || isMe || followLoading) return;

    setFollowLoading(true);
    const newFollowingState = !isFollowing;
    setIsFollowing(newFollowingState);
    setUser((prev: any) => ({
      ...prev,
      followersCount: Math.max(0, (prev?.followersCount || 0) + (newFollowingState ? 1 : -1))
    }));

    try {
      await toggleFollowUser(currentUser.uid, targetUid, isFollowing);

      if (newFollowingState) {
        createNotificationEvent({
          userId: targetUid,
          title: 'New Follower 🎉',
          message: `${currentUser.displayName || 'A student'} started following you!`,
          type: 'follow',
          avatar: currentUser.avatarUrl,
        });
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      // Revert on failure
      setIsFollowing(!newFollowingState);
      setUser((prev: any) => ({
        ...prev,
        followersCount: Math.max(0, (prev?.followersCount || 0) + (!newFollowingState ? 1 : -1))
      }));
    } finally {
      setFollowLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!currentUser?.uid || !targetUid || isMe || likeLoading) return;

    setLikeLoading(true);
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setUser((prev: any) => ({
      ...prev,
      likesReceived: Math.max(0, (prev?.likesReceived || 0) + (newLikedState ? 1 : -1))
    }));

    try {
      await toggleLikeUserProfile(currentUser.uid, targetUid);

      if (newLikedState) {
        createNotificationEvent({
          userId: targetUid,
          title: 'Profile Liked ❤️',
          message: `${currentUser.displayName || 'A student'} liked your profile!`,
          type: 'like',
          avatar: currentUser.avatarUrl,
        });
      }
    } catch (err) {
      console.error("Error toggling profile like:", err);
      setIsLiked(!newLikedState);
      setUser((prev: any) => ({
        ...prev,
        likesReceived: Math.max(0, (prev?.likesReceived || 0) + (!newLikedState ? 1 : -1))
      }));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleMessage = () => {
    if (!user || isMe) return;
    onClose();
    if (onStartChat) {
      onStartChat({
        uid: targetUid,
        displayName: user.displayName || user.name || 'Student',
        avatarUrl: user.avatarUrl,
      });
    }
  };

  if (!visible) return null;

  const displayName = user?.displayName || user?.name || 'Student';
  const username = user?.username || displayName.toLowerCase().replace(/\s+/g, '');
  const avatarUrl = user?.avatarUrl || user?.authorAvatar;
  const bannerUrl = user?.bannerUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&fm=jpg&fit=crop&q=80';
  const schoolName = user?.schoolName || user?.authorSchoolName || 'Campus Community';
  const role = user?.role || user?.authorRole || (user?.roles ? user.roles[0] : 'student');

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bgCard }} edges={['top', 'bottom']}>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: bottomPadding + 20 }}>
          {/* Banner with Floating Back Button */}
          <View style={{ position: 'relative' }}>
            <QuadImage uri={bannerUrl} style={styles.banner} />
            <TouchableOpacity 
              onPress={onClose} 
              style={styles.topBackBtn}
              activeOpacity={0.8}
            >
              <Feather name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Header Card */}
          <View style={styles.headerCard}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              <QuadImage uri={avatarUrl} fallbackIcon="person-circle" style={styles.avatar} />
              {user?.isVerifiedSchool && (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#fff" />
                </View>
              )}
            </View>

            {/* Name and Role */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.name}>{displayName}</Text>
              <RoleBadge role={role} size={18} />
            </View>
            <Text style={styles.username}>@{username}</Text>

            {/* School Tag */}
            <View style={styles.schoolPill}>
              <Ionicons name="school-outline" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
              <Text style={styles.schoolText}>{schoolName} • {user?.gradYear || 2026}</Text>
            </View>

            {/* Bio */}
            <Text style={styles.bio}>{user?.bio || `Student @ ${schoolName}`}</Text>

            {/* Stats Row Bar */}
            <View style={styles.statsBar}>
              <View style={styles.statItem}>
                <Text style={styles.statNum}>{user?.followersCount || 0}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.statItem}>
                <Text style={styles.statNum}>{user?.followingCount || 0}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.statItem}>
                <Text style={[styles.statNum, { color: COLORS.primary }]}>
                  {user?.likesReceived || 0}
                </Text>
                <Text style={styles.statLabel}>Likes</Text>
              </View>
            </View>

            {/* Action Buttons for Other Users */}
            {!isMe && (
              <View style={styles.actionBtnRow}>
                {/* Follow Button */}
                <TouchableOpacity
                  onPress={handleToggleFollow}
                  disabled={followLoading}
                  style={[styles.followBtn, isFollowing && styles.followingBtn]}
                  activeOpacity={0.85}
                >
                  {followLoading ? (
                    <ActivityIndicator size="small" color={isFollowing ? COLORS.textMain : "#fff"} />
                  ) : (
                    <>
                      <Ionicons
                        name={isFollowing ? "checkmark" : "person-add"}
                        size={16}
                        color={isFollowing ? COLORS.textMain : "#fff"}
                      />
                      <Text style={[styles.followBtnText, isFollowing && styles.followingBtnText]}>
                        {isFollowing ? "Following" : "Follow"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>

                {/* Like Profile Button */}
                <TouchableOpacity
                  onPress={handleToggleLike}
                  disabled={likeLoading}
                  style={[styles.likeProfileBtn, isLiked && styles.likedProfileBtn]}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={isLiked ? "heart" : "heart-outline"}
                    size={18}
                    color={isLiked ? COLORS.primary : COLORS.textMain}
                  />
                  <Text style={[styles.likeProfileText, isLiked && { color: COLORS.primary }]}>
                    {isLiked ? "Liked" : "Like"}
                  </Text>
                </TouchableOpacity>

                {/* Message Button */}
                <TouchableOpacity
                  onPress={handleMessage}
                  style={styles.messageBtn}
                  activeOpacity={0.85}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.messageBtnText}>Message</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
  },
  banner: {
    width: '100%',
    height: 150,
  },
  topBackBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  headerCard: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: -45,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: COLORS.bgCard,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.badgeGreen,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.bgCard,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  username: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  schoolPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginTop: 8,
  },
  schoolText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  bio: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.xl,
    paddingVertical: 12,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNum: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.borderColor,
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    marginTop: 16,
  },
  followBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  followingBtn: {
    backgroundColor: COLORS.bgInput,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  followBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  followingBtnText: {
    color: COLORS.textMain,
  },
  likeProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  likedProfileBtn: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.primaryLight,
  },
  likeProfileText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  messageBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  }
});
