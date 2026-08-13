import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, Alert, Share } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { subscribeFeedPosts, toggleLikePost, deletePost, updatePostScope } from '../services/feedService';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import CreatePostModal from '../components/CreatePostModal';
import CommentsModal from '../components/CommentsModal';
import { FeedCardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import RoleBadge from '../components/RoleBadge';

export default function FeedScreen({ posts: initialPosts, currentSchool, currentUser, onOpenPostModal }) {
  const [feedScope, setFeedScope] = useState('my_school'); // 'my_school' | 'all_schools'
  const [posts, setPosts] = useState(initialPosts || []);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeCommentPost, setActiveCommentPost] = useState(null);

  const handleBroadcastToAllCampuses = (post) => {
    Alert.alert(
      "Broadcast to All Campuses",
      "Would you like to make this post visible to students across all Nigerian universities?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Broadcast Nationwide 🌐",
          onPress: async () => {
            setPosts(prev => prev.map(p => p.id === post.id ? { ...p, scope: 'all_schools' } : p));
            try {
              await updatePostScope(post.id, 'all_schools');
              Alert.alert("Broadcasted!", "Your post is now visible on the All Campuses feed.");
            } catch (err) {
              console.error("Error updating post scope:", err);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    setLoading(true);
    const schoolIdFilter = feedScope === 'my_school' ? currentSchool.id : null;
    const unsub = subscribeFeedPosts(schoolIdFilter, (livePosts) => {
      if (livePosts) {
        setPosts(livePosts.map(p => ({
          ...p,
          isLiked: p.likedBy?.includes(currentUser?.uid)
        })));
      }
      setLoading(false);
    });
    return unsub;
  }, [feedScope, currentSchool.id, currentUser?.uid]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLike = async (post) => {
    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        const isLiked = !p.isLiked;
        return { ...p, isLiked, likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1 };
      }
      return p;
    }));

    try {
      await toggleLikePost(post.id, currentUser.uid, post.isLiked);
    } catch (e) {
      console.warn("Error toggling like:", e);
    }
  };

  const handleRepost = async (post) => {
    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        return { ...p, repostsCount: (p.repostsCount || 0) + 1 };
      }
      return p;
    }));

    Alert.alert("Reposted!", "This post has been shared to your quad feed.");

    try {
      const postRef = doc(db, 'posts', post.id);
      await updateDoc(postRef, {
        repostsCount: increment(1)
      });
    } catch (err) {
      console.error("Error reposting:", err);
    }
  };

  const handleShare = async (post) => {
    try {
      await Share.share({
        message: `Check out this post on QUAD campus app:\n\n"${post.content}" - by ${post.authorName} (${post.authorSchoolName})`,
      });
    } catch (err) {
      console.error("Error sharing post:", err);
    }
  };

  const handleDeletePost = (post) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setPosts(prev => prev.filter(p => p.id !== post.id));
            try {
              await deletePost(post.id);
            } catch (err) {
              console.error("Error deleting post:", err);
            }
          }
        }
      ]
    );
  };

  const renderPost = ({ item }) => {
    const isMe = item.authorId === currentUser?.uid;
    const avatar = isMe ? (currentUser?.avatarUrl || item.authorAvatar) : item.authorAvatar;
    const authorName = isMe ? (currentUser?.displayName || item.authorName) : item.authorName;
    const authorUsername = isMe ? (currentUser?.username || item.authorUsername) : item.authorUsername;

    return (
      <View style={styles.postCard}>
        {/* Header */}
        <View style={styles.authorRow}>
          <Image source={{ uri: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={styles.authorName}>{authorName}</Text>
              <RoleBadge role={item.authorRole || 'student'} size={15} />
            </View>
            <Text style={styles.authorSub}>@{authorUsername} • {item.authorSchoolName}</Text>
          </View>
          <Text style={styles.timeText}>{item.createdAt}</Text>

          {isMe && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {item.scope === 'my_school' && (
                <TouchableOpacity 
                  onPress={() => handleBroadcastToAllCampuses(item)}
                  style={styles.broadcastTagBtn}
                >
                  <Ionicons name="globe-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.broadcastTagText}>Broadcast</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => handleDeletePost(item)} style={styles.deletePostBtn}>
                <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        </View>

      {/* Body */}
      <Text style={styles.content}>{item.content}</Text>

      {/* Media */}
      {item.mediaUrls && item.mediaUrls.length > 0 && (
        <Image source={{ uri: item.mediaUrls[0] }} style={styles.mediaImage} />
      )}

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity onPress={() => handleLike(item)} style={styles.actionBtn}>
          <Ionicons 
            name={item.isLiked ? "heart" : "heart-outline"} 
            size={20} 
            color={item.isLiked ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[styles.actionCount, item.isLiked && { color: COLORS.primary }]}>
            {item.likesCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveCommentPost(item)} style={styles.actionBtn}>
          <Feather name="message-circle" size={18} color={COLORS.textMuted} />
          <Text style={styles.actionCount}>{item.commentsCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleRepost(item)} style={styles.actionBtn}>
          <Feather name="repeat" size={18} color={COLORS.textMuted} />
          <Text style={styles.actionCount}>{item.repostsCount || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleShare(item)} style={styles.actionBtn}>
          <Feather name="share" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

  return (
    <View style={styles.container}>
      {/* Scope Switcher Pill Bar */}
      <View style={styles.pillContainer}>
        <TouchableOpacity 
          onPress={() => setFeedScope('my_school')}
          style={[styles.pillBtn, feedScope === 'my_school' && styles.pillActive]}
        >
          <Text style={[styles.pillText, feedScope === 'my_school' && styles.pillTextActive]}>
            🏫 {currentSchool?.shortName || 'My School'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setFeedScope('all_schools')}
          style={[styles.pillBtn, feedScope === 'all_schools' && styles.pillActive]}
        >
          <Text style={[styles.pillText, feedScope === 'all_schools' && styles.pillTextActive]}>
            🌐 All Campuses
          </Text>
        </TouchableOpacity>
      </View>

      {/* Feed List */}
      {loading ? (
        <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
          <FeedCardSkeleton />
          <FeedCardSkeleton />
          <FeedCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item.id}
          renderItem={renderPost}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24, gap: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
          ListHeaderComponent={
            <TouchableOpacity onPress={() => setShowPostModal(true)} style={styles.composeCard}>
              <Image source={{ uri: currentUser.avatarUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} />
              <Text style={styles.composePlaceholder}>What's happening on campus?</Text>
              <Ionicons name="image-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles-outline"
              title="No posts yet"
              subtitle={`Be the first to share what's happening at ${currentSchool.shortName}!`}
              actionText="Create First Post"
              onAction={() => setShowPostModal(true)}
            />
          }
        />
      )}

      <CreatePostModal
        visible={showPostModal}
        onClose={() => setShowPostModal(false)}
        currentUser={currentUser}
        currentSchool={currentSchool}
      />

      <CommentsModal
        visible={!!activeCommentPost}
        onClose={() => setActiveCommentPost(null)}
        post={activeCommentPost}
        currentUser={currentUser}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  pillContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgInput,
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: RADIUS.full,
    padding: 3,
  },
  pillBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.full,
  },
  pillActive: {
    backgroundColor: COLORS.bgCard,
    ...COLORS.shadowSm,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  pillTextActive: {
    color: COLORS.primary,
  },
  composeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  composePlaceholder: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 13,
  },
  postCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: 14,
    gap: 10,
    ...COLORS.shadowSm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deletePostBtn: {
    padding: 6,
    marginLeft: 4,
  },
  broadcastTagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 3,
  },
  broadcastTagText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorName: {
    fontWeight: '700',
    fontSize: 14,
    color: COLORS.textMain,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.badgeGreen,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    gap: 2,
  },
  verifiedText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  authorSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textMain,
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.lg,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    paddingTop: 8,
    marginTop: 4,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  }
});
