import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import QuadImage from '../components/QuadImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { subscribeChatMessages, sendMessage } from '../services/chatService';
import { pickAndUploadImage } from '../utils/uploadImage';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatDetailScreen({ chatId, partner, currentUser, onBack }: any) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 12);

  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const flatListRef = useRef<any>(null);

  useEffect(() => {
    if (!chatId) return;
    const unsub = subscribeChatMessages(chatId, (liveMessages) => {
      setMessages(liveMessages);
    });
    return unsub;
  }, [chatId]);

  const handleSend = async (customText?: string, mediaUrl?: string) => {
    const textToSend = (customText !== undefined ? customText : inputText).trim();
    if (!textToSend && !mediaUrl) return;

    if (customText === undefined) setInputText('');

    try {
      await sendMessage(chatId, currentUser.uid, textToSend || '📷 Photo attachment');
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleAttachImage = async () => {
    setUploadingImage(true);
    try {
      const res = await pickAndUploadImage('chat_attachments');
      if (res?.url) {
        await handleSend('📷 Photo attachment', res.url);
      }
    } catch (err) {
      console.warn("Error attaching chat photo:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderUid === currentUser.uid;

    return (
      <View style={[styles.msgWrapper, isMe ? styles.msgRight : styles.msgLeft]}>
        {!isMe && (
          <QuadImage
            uri={partner?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80'}
            style={styles.smallAvatar}
          />
        )}
        <View style={{ maxWidth: '78%' }}>
          {!isMe && partner?.displayName && (
            <Text style={styles.senderName}>{partner.displayName}</Text>
          )}

          <View style={[styles.msgBubble, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
            {item.mediaUrl && (
              <QuadImage uri={item.mediaUrl} style={styles.chatImage} contentFit="cover" />
            )}
            {item.text ? (
              <Text style={[styles.msgText, isMe ? styles.textRight : styles.textLeft]}>
                {item.text}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.timeText, isMe ? { textAlign: 'right' } : { textAlign: 'left' }]}>
            {item.time || 'Just now'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={26} color={COLORS.textMain} />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <QuadImage
            uri={partner?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80'}
            style={styles.headerAvatar}
          />
          <View style={styles.onlineDot} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerName} numberOfLines={1}>{partner?.displayName || 'Campus Student'}</Text>
          <Text style={styles.headerSub}>Active now • Verified Student</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionIconBtn}>
            <Ionicons name="call-outline" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionIconBtn}>
            <Ionicons name="information-circle-outline" size={22} color={COLORS.textMain} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages Thread */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 16, gap: 12 }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input Footer Bar */}
        <View style={[styles.inputBar, { paddingBottom: bottomPadding }]}>
          <TouchableOpacity
            onPress={handleAttachImage}
            disabled={uploadingImage}
            style={styles.attachBtn}
            activeOpacity={0.7}
          >
            {uploadingImage ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Ionicons name="add-circle-outline" size={26} color={COLORS.primary} />
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backBtn: {
    padding: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headerName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionIconBtn: {
    padding: 6,
  },
  msgWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 2,
    gap: 8,
  },
  msgLeft: {
    justifyContent: 'flex-start',
  },
  msgRight: {
    justifyContent: 'flex-end',
  },
  smallAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 16,
  },
  senderName: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 3,
    marginLeft: 4,
  },
  msgBubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleLeft: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleRight: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  chatImage: {
    width: 200,
    height: 140,
    borderRadius: 12,
    marginBottom: 6,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  textLeft: {
    color: COLORS.textMain,
  },
  textRight: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  timeText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
    marginHorizontal: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 10,
  },
  attachBtn: {
    padding: 4,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: RADIUS.full,
    paddingHorizontal: 16,
    paddingVertical: 9,
    maxHeight: 100,
    fontSize: 14,
    color: COLORS.textMain,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  }
});
