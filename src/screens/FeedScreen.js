import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { subscribeFeedPosts, toggleLikePost } from '../services/feedService';

export default function FeedScreen({ posts: initialPosts, currentSchool, currentUser, onOpenPostModal }) {
  const [feedScope, setFeedScope] = useState('my_school'); // 'my_school' | 'all_schools'
  const [posts, setPosts] = useState(initialPosts || []);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const schoolIdFilter = feedScope === 'my_school' ? currentSchool.id : null;
    const unsub = subscribeFeedPosts(schoolIdFilter, (livePosts) => {
      if (livePosts && livePosts.length > 0) {
        setPosts(livePosts.map(p => ({
          ...p,
          isLiked: p.likedBy?.includes(currentUser?.uid)
        })));
      }
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

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.authorRow}>
        <Image source={{ uri: item.authorAvatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.authorName}>{item.authorName}</Text>
            {item.isVerifiedAuthor && (
              <View style={styles.verifiedTag}>
                <Ionicons name="shield-checkmark" size={10} color="#fff" />
                <Text style={styles.verifiedText}>.edu</Text>
              </View>
            )}
          </View>
          <Text style={styles.authorSub}>@{item.authorUsername} • {item.authorSchoolName}</Text>
        </View>
        <Text style={styles.timeText}>{item.createdAt}</Text>
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

        <TouchableOpacity style={styles.actionBtn}>
          <Feather name="message-circle" size={18} color={COLORS.textMuted} />
          <Text style={styles.actionCount}>{item.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Feather name="repeat" size={18} color={COLORS.textMuted} />
          <Text style={styles.actionCount}>{item.repostsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Feather name="share" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Scope Switcher Pill Bar */}
      <View style={styles.pillContainer}>
        <TouchableOpacity 
          onPress={() => setFeedScope('my_school')}
          style={[styles.pillBtn, feedScope === 'my_school' && styles.pillActive]}
        >
          <Text style={[styles.pillText, feedScope === 'my_school' && styles.pillTextActive]}>
            🏫 {currentSchool.shortName}
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
      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24, gap: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        ListHeaderComponent={
          <TouchableOpacity onPress={onOpenPostModal} style={styles.composeCard}>
            <Image source={{ uri: currentUser.avatarUrl }} style={{ width: 36, height: 36, borderRadius: 18 }} />
            <Text style={styles.composePlaceholder}>What's happening on campus?</Text>
            <Ionicons name="image-outline" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        }
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
