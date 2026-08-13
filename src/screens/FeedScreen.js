import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, RefreshControl, Alert, Share, Modal } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { subscribeFeedPosts, toggleLikePost, deletePost, updatePostScope } from '../services/feedService';
import { doc, updateDoc, increment, collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import CreatePostModal from '../components/CreatePostModal';
import CommentsModal from '../components/CommentsModal';
import { FeedCardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import RoleBadge from '../components/RoleBadge';
import AdComposerModal from '../components/AdComposerModal';
import { createNotificationEvent } from '../services/notificationService';

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

  const [activeAds, setActiveAds] = useState([]);
  const [showAdComposer, setShowAdComposer] = useState(false);
  const [showAdsReview, setShowAdsReview] = useState(false);
  const [menuPost, setMenuPost] = useState(null);

  useEffect(() => {
    setLoading(true);
    const schoolIdFilter = feedScope === 'my_school' ? currentSchool.id : null;
    const unsubFeed = subscribeFeedPosts(schoolIdFilter, (livePosts) => {
      if (livePosts) {
        setPosts(livePosts.map(p => ({
          ...p,
          isLiked: p.likedBy?.includes(currentUser?.uid)
        })));
      }
      setLoading(false);
    });

    // Subscribe to approved ads
    const qAds = query(collection(db, 'ads'), where('status', '==', 'approved'));
    const unsubAds = onSnapshot(qAds, (snap) => {
      const liveAds = snap.docs.map(d => ({ id: d.id, ...d.data(), isSponsored: true }));
      setActiveAds(liveAds);
    }, (err) => {
      setActiveAds([]);
    });

    return () => {
      unsubFeed();
      unsubAds();
    };
  }, [feedScope, currentSchool.id, currentUser?.uid]);

  // Interleave sponsored ads every 8th post
  const combinedFeedData = React.useMemo(() => {
    if (!activeAds || activeAds.length === 0) return posts;
    const result = [];
    let adIndex = 0;

    posts.forEach((post, index) => {
      result.push(post);
      if ((index + 1) % 8 === 0) {
        const adToInsert = activeAds[adIndex % activeAds.length];
        result.push({ ...adToInsert, id: `ad_${adToInsert.id}_${index}` });
        adIndex++;
      }
    });

    return result;
  }, [posts, activeAds]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleLike = async (post) => {
    const isNowLiked = !post.isLiked;

    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        return { ...p, isLiked: isNowLiked, likesCount: isNowLiked ? p.likesCount + 1 : p.likesCount - 1 };
      }
      return p;
    }));

    if (isNowLiked && post.authorId && post.authorId !== currentUser?.uid) {
      createNotificationEvent({
        userId: post.authorId,
        title: 'New Like ❤️',
        message: `${currentUser?.displayName || 'A student'} liked your post.`,
        type: 'like',
        avatar: currentUser?.avatarUrl
      });
    }

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

  const handleAdClick = async (ad) => {
    try {
      await addDoc(collection(db, 'ad_impressions'), {
        adId: ad.id,
        advertiserId: ad.advertiserId,
        userId: currentUser?.uid,
        action: 'CLICK',
        timestamp: serverTimestamp()
      });
      await updateDoc(doc(db, 'ads', ad.id), {
        clicksCount: increment(1)
      });
      Alert.alert("Sponsored Link", `Visiting ${ad.advertiserName}: ${ad.ctaUrl || 'Campaign Page'}`);
    } catch (err) {
      console.warn("Ad click tracking notice:", err);
    }
  };

  const renderPost = ({ item }) => {
    if (item.isSponsored) {
      return (
        <View style={[styles.postCard, { borderColor: '#3B82C4', borderWidth: 1.5 }]}>
          {/* Header */}
          <View style={styles.authorRow}>
            <Image source={{ uri: item.advertiserAvatar }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <Text style={styles.authorName}>{item.advertiserName}</Text>
                <RoleBadge role="advertiser" size={15} />
              </View>
              <Text style={styles.authorSub}>Promoted Campaign</Text>
            </View>

            <View style={styles.sponsoredTag}>
              <Text style={styles.sponsoredText}>Sponsored</Text>
            </View>
          </View>

          {/* Ad Copy */}
          <Text style={styles.content}>{item.headline}</Text>

          {/* Ad Creative Image */}
          {item.imageUrl && (
            <Image source={{ uri: item.imageUrl }} style={styles.mediaImage} />
          )}

          {/* Ad CTA Bar */}
          <TouchableOpacity onPress={() => handleAdClick(item)} style={styles.adCtaBtn} activeOpacity={0.85}>
            <Text style={styles.adCtaText}>{item.ctaText || 'Learn More'}</Text>
            <Feather name="external-link" size={14} color="#fff" />
          </TouchableOpacity>
        </View>
      );
    }

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

          <TouchableOpacity onPress={() => setMenuPost(item)} style={styles.morePostBtn}>
            <Feather name="more-horizontal" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
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
      {/* Segmented Control Bar */}
      <View style={styles.segmentedContainer}>
        <TouchableOpacity 
          onPress={() => setFeedScope('my_school')}
          style={[styles.segmentedTab, feedScope === 'my_school' && styles.segmentedTabActive]}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="school-outline" 
            size={16} 
            color={feedScope === 'my_school' ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[styles.segmentedText, feedScope === 'my_school' && styles.segmentedTextActive]}>
            {currentSchool?.shortName || 'My School'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => setFeedScope('all_schools')}
          style={[styles.segmentedTab, feedScope === 'all_schools' && styles.segmentedTabActive]}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="globe-outline" 
            size={16} 
            color={feedScope === 'all_schools' ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[styles.segmentedText, feedScope === 'all_schools' && styles.segmentedTextActive]}>
            All Campuses
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
          data={combinedFeedData}
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

      <AdComposerModal
        visible={showAdComposer}
        onClose={() => setShowAdComposer(false)}
        currentUser={currentUser}
        currentSchool={currentSchool}
      />

      <AdsReviewScreen
        visible={showAdsReview}
        onClose={() => setShowAdsReview(false)}
        currentUser={currentUser}
      />

      {/* Post Options 3-Dots Dropdown Modal */}
      <Modal visible={!!menuPost} animationType="fade" transparent onRequestClose={() => setMenuPost(null)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setMenuPost(null)}>
          <View style={styles.menuSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.menuTitle}>Post Options</Text>

            {menuPost?.authorId === currentUser?.uid && menuPost?.scope === 'my_school' && (
              <>
                <TouchableOpacity 
                  onPress={() => {
                    const target = menuPost;
                    setMenuPost(null);
                    handleBroadcastToAllCampuses(target);
                  }}
                  style={styles.menuItem}
                >
                  <Ionicons name="globe-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.menuItemText}>Broadcast to All Campuses 🌐</Text>
                </TouchableOpacity>
                <View style={styles.menuDivider} />
              </>
            )}

            {menuPost?.authorId === currentUser?.uid ? (
              <TouchableOpacity 
                onPress={() => {
                  const target = menuPost;
                  setMenuPost(null);
                  handleDeletePost(target);
                }}
                style={styles.menuItem}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
                <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Delete Post</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                onPress={() => {
                  setMenuPost(null);
                  Alert.alert("Report Received", "Thank you for helping keep QUAD safe. Our team will review this post.");
                }}
                style={styles.menuItem}
              >
                <Ionicons name="flag-outline" size={18} color="#EF4444" />
                <Text style={[styles.menuItemText, { color: '#EF4444' }]}>Report Inappropriate Post</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgInput,
    marginHorizontal: 14,
    marginVertical: 10,
    borderRadius: RADIUS.full,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  segmentedTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  segmentedTabActive: {
    backgroundColor: COLORS.bgCard,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  segmentedText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  segmentedTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
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
  },
  sponsoredTag: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  sponsoredText: {
    color: '#0284C7',
    fontSize: 10,
    fontWeight: '800',
  },
  adCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82C4',
    paddingVertical: 10,
    borderRadius: RADIUS.lg,
    gap: 6,
    marginTop: 4,
  },
  adCtaText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  morePostBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: 20,
    gap: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.borderColor,
  }
});
