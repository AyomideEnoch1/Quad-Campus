import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import QuadImage from '../components/QuadImage';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { subscribeUserChats } from '../services/chatService';
import EmptyState from '../components/EmptyState';
import ChatDetailScreen from './ChatDetailScreen';

export default function ChatScreen({ chats: initialChats, currentUser, activeChat: externalActiveChat, onClearActiveChat }) {
  const [chats, setChats] = useState(initialChats || []);
  const [activeChat, setActiveChat] = useState(externalActiveChat || null);

  useEffect(() => {
    if (externalActiveChat) {
      setActiveChat(externalActiveChat);
    }
  }, [externalActiveChat]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsub = subscribeUserChats(currentUser.uid, (liveChats) => {
      if (liveChats) {
        setChats(liveChats);
      }
    });
    return unsub;
  }, [currentUser?.uid]);

  if (activeChat) {
    return (
      <ChatDetailScreen
        chatId={activeChat.id}
        partner={activeChat.partner}
        currentUser={currentUser}
        onBack={() => {
          setActiveChat(null);
          if (onClearActiveChat) onClearActiveChat();
        }}
      />
    );
  }

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => setActiveChat(item)} 
      style={styles.chatCard} 
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <QuadImage uri={item.partner.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80' } style={styles.avatar} />
        <View style={styles.onlineDot} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={styles.partnerName}>{item.partner.displayName}</Text>
          <Text style={styles.timeText}>{item.lastMessageTime}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 3 }}>
          <Text style={styles.lastMsg} numberOfLines={1}>{item.lastMessage}</Text>
          {item.unread > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={item => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={{ padding: 12, gap: 8 }}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="No conversations yet"
            subtitle="Message sellers in the marketplace or chat with campus club members to start talking!"
          />
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
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    ...COLORS.shadowSm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.badgeGreen,
    borderWidth: 2,
    borderColor: '#fff',
  },
  partnerName: {
    fontWeight: '700',
    fontSize: 14,
    color: COLORS.textMain,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  lastMsg: {
    fontSize: 12,
    color: COLORS.textMuted,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  unreadText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  }
});
