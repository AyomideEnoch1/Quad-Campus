import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, Alert
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'New Like on your post',
    message: 'Tobi liked your post in UNILAG Campus feed.',
    time: '5m ago',
    type: 'like',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80'
  },
  {
    id: 'n2',
    title: 'Marketplace Inquiry 🛍️',
    message: 'Chika sent you a message about "Engineering Textbook".',
    time: '1h ago',
    type: 'market',
    read: false,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&fm=jpg&fit=crop&q=80'
  },
  {
    id: 'n3',
    title: 'Club Announcement 🚀',
    message: 'Google Developer Student Club posted a new workshop event.',
    time: '3h ago',
    type: 'club',
    read: true,
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&fm=jpg&fit=crop&q=80'
  }
];

export default function NotificationsModal({ 
  visible, 
  onClose,
  notifications: parentNotifications,
  onMarkAllRead: parentMarkAllRead,
  onClearAll: parentClearAll,
  onToggleRead: parentToggleRead
}) {
  const [internalNotifications, setInternalNotifications] = useState(INITIAL_NOTIFICATIONS);

  const notifications = parentNotifications || internalNotifications;

  const handleMarkAllRead = () => {
    if (parentMarkAllRead) {
      parentMarkAllRead();
    } else {
      setInternalNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
    Alert.alert("Marked All as Read ✅", "All unread notifications have been marked as read.");
  };

  const handleClearAll = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear All", 
          style: "destructive", 
          onPress: () => {
            if (parentClearAll) {
              parentClearAll();
            } else {
              setInternalNotifications([]);
            }
          }
        }
      ]
    );
  };

  const handleToggleRead = (id) => {
    if (parentToggleRead) {
      parentToggleRead(id);
    } else {
      setInternalNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => handleToggleRead(item.id)}
      style={[styles.notifCard, !item.read && styles.notifUnread]}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.notifTitle}>{item.title}</Text>
        <Text style={styles.notifMsg}>{item.message}</Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
      {!item.read && <View style={styles.blueDot} />}
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Notifications</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Action Controls Bar */}
        {notifications.length > 0 && (
          <View style={styles.actionRow}>
            <TouchableOpacity onPress={handleMarkAllRead} style={styles.actionBtn}>
              <Ionicons name="checkmark-done-outline" size={16} color={COLORS.primary} />
              <Text style={styles.actionText}>Mark all as read</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleClearAll} style={styles.actionBtn}>
              <Ionicons name="trash-outline" size={15} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Clear all</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="notifications-off-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No Notifications</Text>
              <Text style={styles.emptySub}>You are all caught up! New notifications will appear here.</Text>
            </View>
          }
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
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
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
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  }
});
