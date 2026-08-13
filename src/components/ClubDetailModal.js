import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, FlatList, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { toggleJoinClub, subscribeClubMessages, sendClubMessage } from '../services/clubService';
import RoleBadge from './RoleBadge';
import { pickAndUploadImage } from '../utils/uploadImage';

export default function ClubDetailModal({ visible, onClose, club, currentUser, onToggleJoin }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'chat'
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    if (!club?.id || !visible || activeTab !== 'chat') return;
    const unsub = subscribeClubMessages(club.id, (liveMsgs) => {
      setMessages(liveMsgs);
    });
    return unsub;
  }, [club?.id, visible, activeTab]);

  if (!club) return null;

  const isJoined = !!club.isJoined;

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;
    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      await sendClubMessage(club.id, {
        senderId: currentUser.uid,
        senderName: currentUser.displayName || 'Student',
        senderAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80',
        text: textToSend
      });
    } catch (err) {
      console.error("Error sending club message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleAttachMedia = async () => {
    try {
      const url = await pickAndUploadImage('club_chats');
      if (url) {
        await sendClubMessage(club.id, {
          senderId: currentUser.uid,
          senderName: currentUser.displayName || 'Student',
          senderAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80',
          senderRole: currentUser.role || 'student',
          mediaUrl: url,
          text: ''
        });
      }
    } catch (e) {
      console.warn("Error uploading chat media:", e);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.senderId === currentUser?.uid;
    return (
      <View style={[styles.msgRow, isMe && styles.msgRowMe]}>
        {!isMe && (
          <Image 
            source={{ uri: item.senderAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80' }} 
            style={styles.msgAvatar} 
          />
        )}
        <View style={[styles.msgBubble, isMe ? styles.msgBubbleMe : styles.msgBubbleOther]}>
          {!isMe && (
            <View style={styles.msgSenderHeader}>
              <Text style={styles.msgSender}>{item.senderName}</Text>
              <RoleBadge role={item.senderRole || 'student'} size={12} />
            </View>
          )}
          {item.mediaUrl && (
            <Image source={{ uri: item.mediaUrl }} style={styles.msgMedia} resizeMode="cover" />
          )}
          {!!item.text && (
            <Text style={[styles.msgText, isMe && styles.msgTextMe]}>{item.text}</Text>
          )}
          <View style={styles.msgTimeRow}>
            <Text style={[styles.msgTime, isMe && styles.msgTimeMe]}>{item.time || 'Just now'}</Text>
            {isMe && <Ionicons name="checkmark-done" size={12} color="rgba(255,255,255,0.9)" />}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.topTitle} numberOfLines={1}>{club.name}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Tab Selector Pill */}
        <View style={styles.tabBar}>
          <TouchableOpacity 
            onPress={() => setActiveTab('overview')}
            style={[styles.tabBtn, activeTab === 'overview' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>Overview</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveTab('chat')}
            style={[styles.tabBtn, activeTab === 'chat' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>
              💬 Group Chat {isJoined ? '' : '🔒'}
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'chat' && isJoined ? (
          /* Full Page Group Chat View */
          <KeyboardAvoidingView 
            style={{ flex: 1, backgroundColor: COLORS.bgMain }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {/* Full Chat Header */}
            <View style={styles.fullChatHeader}>
              <TouchableOpacity onPress={() => setActiveTab('overview')} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={22} color={COLORS.textMain} />
              </TouchableOpacity>
              <Image source={{ uri: club.logoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80' }} style={styles.chatHeaderAvatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.chatHeaderTitle} numberOfLines={1}>{club.name}</Text>
                <Text style={styles.chatHeaderSub}>{club.memberCount || 1} members</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeChatBtn}>
                <Ionicons name="close" size={22} color={COLORS.textMain} />
              </TouchableOpacity>
            </View>

            {/* Message List */}
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item.id}
              renderItem={renderMessage}
              contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 20 }}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              ListEmptyComponent={
                <View style={styles.emptyChat}>
                  <Ionicons name="chatbubbles-outline" size={44} color={COLORS.primary} />
                  <Text style={styles.emptyChatTitle}>Welcome to {club.name} Chat!</Text>
                  <Text style={styles.emptyChatText}>No messages sent yet. Be the first member to say hello!</Text>
                </View>
              }
            />

            {/* Input Bar */}
            <View style={styles.inputBar}>
              <TouchableOpacity onPress={handleAttachMedia} style={styles.attachBtn} activeOpacity={0.7}>
                <Ionicons name="add" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              <TextInput
                style={styles.input}
                placeholder={`Message ${club.name}...`}
                placeholderTextColor={COLORS.textLight}
                value={messageText}
                onChangeText={setMessageText}
              />
              <TouchableOpacity 
                onPress={handleSendMessage}
                disabled={!messageText.trim() || sending}
                style={[styles.sendBtn, (!messageText.trim() || sending) && styles.sendBtnDisabled]}
              >
                {sending ? <ActivityIndicator color="#fff" size="small" /> : <Ionicons name="send" size={16} color="#fff" />}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        ) : activeTab === 'chat' && !isJoined ? (
          /* Locked State if Not Joined */
          <View style={styles.lockedContainer}>
            <View style={styles.lockIconCircle}>
              <Ionicons name="lock-closed" size={36} color={COLORS.primary} />
            </View>
            <Text style={styles.lockedTitle}>Group Chat Locked</Text>
            <Text style={styles.lockedSubtitle}>
              This group chat is exclusive to members of {club.name}. Join the club to view and participate in discussions!
            </Text>
            <TouchableOpacity 
              onPress={() => onToggleJoin(club)}
              style={styles.joinCta}
              activeOpacity={0.85}
            >
              <Ionicons name="person-add" size={18} color="#fff" />
              <Text style={styles.joinCtaText}>Join Club to Unlock</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Overview Tab */
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Banner Image */}
            <View style={styles.heroBanner}>
              <Image 
                source={{ uri: club.bannerUrl || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&fm=jpg&fit=crop&q=80' }} 
                style={styles.bannerImg} 
              />
              <View style={styles.logoWrapper}>
                <Image 
                  source={{ uri: club.logoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80' }} 
                  style={styles.logoImg} 
                />
              </View>
            </View>

            {/* Title & Stats */}
            <View style={styles.infoCard}>
              <Text style={styles.clubName}>{club.name}</Text>
              <Text style={styles.tagline}>{club.tagline || 'Campus Student Organization'}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Ionicons name="school-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.metaText}>{club.schoolName || 'All Campuses'}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Feather name="users" size={13} color={COLORS.primary} />
                  <Text style={styles.metaText}>{club.memberCount || 1} Members</Text>
                </View>
              </View>

              {/* Join Button */}
              <TouchableOpacity 
                onPress={() => onToggleJoin(club)}
                style={[styles.joinCta, isJoined && styles.joinedCta]}
                activeOpacity={0.85}
              >
                <Ionicons name={isJoined ? "checkmark-circle" : "person-add"} size={18} color={isJoined ? COLORS.primary : "#fff"} />
                <Text style={[styles.joinCtaText, isJoined && styles.joinedCtaText]}>
                  {isJoined ? 'Joined ✓' : 'Join Club'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this Club</Text>
              <Text style={styles.descriptionText}>
                {club.description || `Welcome to ${club.name}! Join our campus community to collaborate, attend events, and chat with members.`}
              </Text>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    backgroundColor: COLORS.bgCard,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgInput,
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: RADIUS.full,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.full,
  },
  tabActive: {
    backgroundColor: COLORS.bgCard,
    ...COLORS.shadowSm,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  heroBanner: {
    position: 'relative',
    width: '100%',
    height: 180,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.bgCard,
  },
  bannerImg: {
    width: '100%',
    height: '100%',
    borderRadius: RADIUS.xl,
    resizeMode: 'cover',
  },
  logoWrapper: {
    position: 'absolute',
    bottom: -20,
    left: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: COLORS.bgCard,
    backgroundColor: COLORS.bgCard,
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  infoCard: {
    backgroundColor: COLORS.bgCard,
    padding: 16,
    paddingTop: 24,
    borderRadius: RADIUS.xl,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  clubName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textMain,
  },
  tagline: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  metaText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  joinCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 8,
    marginTop: 8,
  },
  joinCtaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  joinedCta: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  joinedCtaText: {
    color: COLORS.primary,
  },
  section: {
    backgroundColor: COLORS.bgCard,
    padding: 16,
    borderRadius: RADIUS.xl,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textMuted,
  },
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  lockIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  lockedSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 8,
  },
  emptyChatText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  msgRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    maxWidth: '80%',
  },
  msgRowMe: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  msgBubble: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.lg,
    gap: 2,
  },
  msgBubbleOther: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  msgBubbleMe: {
    backgroundColor: COLORS.primary,
  },
  msgSender: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  msgText: {
    fontSize: 13,
    color: COLORS.textMain,
  },
  msgTextMe: {
    color: '#fff',
  },
  msgTime: {
    fontSize: 9,
    color: COLORS.textLight,
    alignSelf: 'flex-end',
  },
  msgTimeMe: {
    color: 'rgba(255,255,255,0.8)',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    backgroundColor: COLORS.bgCard,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textMain,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: COLORS.textLight,
  },
  fullChatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    gap: 10,
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  chatHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  chatHeaderSub: {
    fontSize: 11,
    color: COLORS.badgeGreen,
    fontWeight: '600',
  },
  closeChatBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  msgSenderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  msgMedia: {
    width: 200,
    height: 140,
    borderRadius: RADIUS.md,
    marginVertical: 4,
  },
  msgTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 3,
    marginTop: 2,
  },
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
