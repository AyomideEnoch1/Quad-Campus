import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import QuadImage from './QuadImage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { subscribeComments, addComment } from '../services/commentService';
import RoleBadge from './RoleBadge';
import { createNotificationEvent } from '../services/notificationService';

export default function CommentsModal({ visible, onClose, post, currentUser }: any) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!post?.id || !visible) return;
    const unsub = subscribeComments(post.id, (liveComments) => {
      setComments(liveComments);
    });
    return unsub;
  }, [post?.id, visible]);

  const handleSendComment = async () => {
    if (!commentText.trim() || submitting) return;
    const textToSend = commentText.trim();
    setCommentText('');
    setSubmitting(true);

    if (post?.authorId && post.authorId !== currentUser?.uid) {
      createNotificationEvent({
        userId: post.authorId,
        title: 'New Comment 💬',
        message: `${currentUser?.displayName || 'A student'} commented: "${textToSend.slice(0, 40)}"`,
        type: 'comment',
        avatar: currentUser?.avatarUrl
      });
    }

    try {
      await addComment(post.id, {
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Student',
        authorAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80',
        text: textToSend
      });
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentRow}>
      <QuadImage uri={item.authorAvatar } style={styles.commentAvatar} />
      <View style={styles.commentBubble}>
        <View style={styles.commentHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.commentAuthor}>{item.authorName}</Text>
            <RoleBadge role={item.authorRole || 'student'} size={13} />
          </View>
          <Text style={styles.commentTime}>{item.createdAt}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Comments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
          </View>

          {/* List of Comments */}
          <FlatList
            data={comments}
            keyExtractor={item => item.id}
            renderItem={renderComment}
            contentContainerStyle={{ padding: 12, gap: 10 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="chatbubble-outline" size={32} color={COLORS.textMuted} />
                <Text style={styles.emptyText}>No comments yet. Start the conversation!</Text>
              </View>
            }
          />

          {/* Input Bar */}
          <View style={styles.inputBar}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor={COLORS.textLight}
              value={commentText}
              onChangeText={setCommentText}
            />
            <TouchableOpacity 
              onPress={handleSendComment}
              disabled={!commentText.trim() || submitting}
              style={[styles.sendBtn, (!commentText.trim() || submitting) && styles.sendBtnDisabled]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="send" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: 16,
    maxHeight: '75%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  closeBtn: {
    padding: 4,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.lg,
    gap: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  commentTime: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  commentText: {
    fontSize: 13,
    color: COLORS.textMain,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: COLORS.textMain,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.textLight,
  }
});
