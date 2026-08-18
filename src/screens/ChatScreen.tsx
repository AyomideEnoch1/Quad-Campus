import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import QuadImage from '../components/QuadImage';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { subscribeUserChats } from '../services/chatService';
import EmptyState from '../components/EmptyState';
import ChatDetailScreen from './ChatDetailScreen';

export default function ChatScreen({ chats: initialChats, currentUser, activeChat: externalActiveChat, onClearActiveChat }: any) {
  const [chats, setChats] = useState(initialChats || []);
  const [activeChat, setActiveChat] = useState<any>(externalActiveChat || null);

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

  const renderChatItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      onPress={() => setActiveChat(item)} 
      style={styles.chatCard} 
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <QuadImage uri={item.partner?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80' } style={styles.avatar} />
        <View style={styles.onlineDot} />
      </View>

      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.partnerName}>{item.partner?.displayName || 'Campus Student'}</Text>
          <Text style={styles.timeText}>{item.lastMessageTime}</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
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
        contentContainerStyle={{ padding: 14, gap: 10 }}
        ListEmptyComponent={
          <EmptyState
            icon="chatbubble-ellipses-outline"
            title="No conversations yet"
            subtitle="Message sellers in the marketplace or chat with campus club members to start talking!"
          />
        }
      />

      {/* Full-Screen Edge-to-Edge Chat Room Modal */}
      <Modal
        visible={!!activeChat}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => {
          setActiveChat(null);
          if (onClearActiveChat) onClearActiveChat();
        }}
      >
        {activeChat && (
          <ChatDetailScreen
            chatId={activeChat.id}
            partner={activeChat.partner}
            currentUser={currentUser}
            onBack={() => {
              setActiveChat(null);
              if (onClearActiveChat) onClearActiveChat();
            }}
          />
        )}
      </Modal>
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
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    ...COLORS.shadowSm,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  lastMsg: {
    fontSize: 13,
    color: COLORS.textMuted,
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
  }
});
