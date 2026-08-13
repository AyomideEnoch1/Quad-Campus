import React from 'react';
import {
  Modal, View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'New Like on your post',
    message: 'Tobi liked your post in UNILAG Campus feed.',
    time: '5m ago',
    type: 'like',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'n2',
    title: 'Marketplace Inquiry 🛍️',
    message: 'Chika sent you a message about "Engineering Textbook".',
    time: '1h ago',
    type: 'market',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'n3',
    title: 'Club Announcement 🚀',
    message: 'Google Developer Student Club posted a new workshop event.',
    time: '3h ago',
    type: 'club',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&auto=format&fit=crop&q=80'
  }
];

export default function NotificationsModal({ visible, onClose }) {
  const renderItem = ({ item }) => (
    <View style={[styles.notifCard, !item.read && styles.notifUnread]}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.notifTitle}>{item.title}</Text>
        <Text style={styles.notifMsg}>{item.message}</Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.blueDot} />}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Notifications</Text>
          <View style={{ width: 36 }} />
        </View>

        <FlatList
          data={MOCK_NOTIFICATIONS}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 14, gap: 10 }}
        />
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
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
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
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.bgCard,
    padding: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  notifUnread: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  notifMsg: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
  notifTime: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 2,
  },
  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  }
});
