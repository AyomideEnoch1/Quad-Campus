import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import QuadImage from './QuadImage';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import RoleBadge from './RoleBadge';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import UserProfileModal from './UserProfileModal';

export default function GlobalSearchModal({ visible, onClose, posts = [], marketplaceItems = [], clubs = [], onSelectClub, onSelectListing, currentUser }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'users' | 'posts' | 'market' | 'clubs'
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedSearchUser, setSelectedSearchUser] = useState<any>(null);

  useEffect(() => {
    if (!visible) return;
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const snap = await getDocs(query(collection(db, 'users'), limit(50)));
        const users = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsersList(users);
      } catch (err) {
        console.warn("GlobalSearch user fetch notice:", err?.message || err);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [visible]);

  const queryClean = searchQuery.trim().toLowerCase();

  const filteredUsers = !queryClean ? usersList.slice(0, 5) : usersList.filter(u =>
    u.displayName?.toLowerCase().includes(queryClean) ||
    u.username?.toLowerCase().includes(queryClean) ||
    u.schoolName?.toLowerCase().includes(queryClean)
  );

  const filteredPosts = !queryClean ? [] : posts.filter(p => 
    p.content?.toLowerCase().includes(queryClean) ||
    p.authorName?.toLowerCase().includes(queryClean)
  );

  const filteredItems = !queryClean ? [] : marketplaceItems.filter(i => 
    i.title?.toLowerCase().includes(queryClean) ||
    i.category?.toLowerCase().includes(queryClean) ||
    i.sellerName?.toLowerCase().includes(queryClean)
  );

  const filteredClubs = !queryClean ? [] : clubs.filter(c => 
    c.name?.toLowerCase().includes(queryClean) ||
    c.tagline?.toLowerCase().includes(queryClean) ||
    c.category?.toLowerCase().includes(queryClean)
  );

  return (
    <Modal visible={visible} animationType="fade" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Search Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textMain} />
          </TouchableOpacity>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Search students, posts, market, clubs..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabRow}>
          {[
            { id: 'all', label: 'All Results' },
            { id: 'users', label: `Users (${filteredUsers.length})` },
            { id: 'posts', label: `Posts (${filteredPosts.length})` },
            { id: 'market', label: `Market (${filteredItems.length})` },
            { id: 'clubs', label: `Clubs (${filteredClubs.length})` },
          ].map(t => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setActiveTab(t.id)}
              style={[styles.tabPill, activeTab === t.id && styles.tabPillActive]}
            >
              <Text style={[styles.tabText, activeTab === t.id && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Results List */}
        {!queryClean ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Search QUAD</Text>
            <Text style={styles.emptySub}>Search students by name, campus posts, products, and student clubs.</Text>
          </View>
        ) : (
          <FlatList
            data={[
              ...(activeTab === 'all' || activeTab === 'users' ? filteredUsers.map(u => ({ ...u, _type: 'user' })) : []),
              ...(activeTab === 'all' || activeTab === 'posts' ? filteredPosts.map(p => ({ ...p, _type: 'post' })) : []),
              ...(activeTab === 'all' || activeTab === 'market' ? filteredItems.map(i => ({ ...i, _type: 'item' })) : []),
              ...(activeTab === 'all' || activeTab === 'clubs' ? filteredClubs.map(c => ({ ...c, _type: 'club' })) : []),
            ]}
            keyExtractor={(item, index) => `${item._type}_${item.id}_${index}`}
            contentContainerStyle={{ padding: 14, gap: 12 }}
            renderItem={({ item }) => {
              if (item._type === 'user') {
                return (
                  <TouchableOpacity 
                    onPress={() => setSelectedSearchUser(item)}
                    style={styles.resultCard}
                    activeOpacity={0.7}
                  >
                    <View style={styles.cardHeader}>
                      <QuadImage uri={item.avatarUrl} fallbackIcon="person-circle" style={styles.avatar} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={styles.name}>{item.displayName}</Text>
                          <RoleBadge role={item.role || 'student'} size={14} />
                        </View>
                        <Text style={styles.sub}>@{item.username} • {item.schoolName}</Text>
                      </View>
                      <View style={styles.badgePill}>
                        <Text style={styles.badgeText}>User</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }
              if (item._type === 'post') {
                return (
                  <View style={styles.resultCard}>
                    <TouchableOpacity 
                      onPress={() => setSelectedSearchUser({
                        uid: item.authorId,
                        displayName: item.authorName,
                        avatarUrl: item.authorAvatar,
                        schoolName: item.authorSchoolName,
                        role: item.authorRole || 'student',
                      })}
                      style={styles.cardHeader}
                      activeOpacity={0.7}
                    >
                      <QuadImage uri={item.authorAvatar} fallbackIcon="person-circle" style={styles.avatar} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Text style={styles.name}>{item.authorName}</Text>
                          <RoleBadge role={item.authorRole || 'student'} size={14} />
                        </View>
                        <Text style={styles.sub}>Post • {item.authorSchoolName}</Text>
                      </View>
                    </TouchableOpacity>
                    <Text style={styles.bodyText} numberOfLines={2}>{item.content}</Text>
                  </View>
                );
              }

              if (item._type === 'item') {
                return (
                  <TouchableOpacity 
                    onPress={() => {
                      onClose();
                      if (onSelectListing) onSelectListing(item);
                    }}
                    style={styles.resultCard}
                  >
                    <View style={styles.cardHeader}>
                      <QuadImage uri={item.imageUrl || item.image } style={styles.itemThumb} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{item.title}</Text>
                        <Text style={styles.price}>₦{item.price?.toLocaleString()}</Text>
                        <Text style={styles.sub}>Market Listing • {item.category}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }

              if (item._type === 'club') {
                return (
                  <TouchableOpacity 
                    onPress={() => {
                      onClose();
                      if (onSelectClub) onSelectClub(item);
                    }}
                    style={styles.resultCard}
                  >
                    <View style={styles.cardHeader}>
                      <QuadImage uri={item.logoUrl || item.logo } style={styles.avatar} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.sub}>{item.tagline || 'Campus Club'} • {item.memberCount || 1} members</Text>
                      </View>
                      <View style={styles.badgePill}>
                        <Text style={styles.badgeText}>View Club</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }

              return null;
            }}
          />
        )}
      </SafeAreaView>

      <UserProfileModal
        visible={!!selectedSearchUser}
        onClose={() => setSelectedSearchUser(null)}
        userId={selectedSearchUser?.id || selectedSearchUser?.uid}
        initialUserData={selectedSearchUser}
        currentUser={currentUser}
      />
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMain,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgInput,
  },
  tabPillActive: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
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
  },
  resultCard: {
    backgroundColor: COLORS.bgCard,
    padding: 12,
    borderRadius: RADIUS.lg,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  itemThumb: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
  },
  name: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  price: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
  sub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  bodyText: {
    fontSize: 13,
    color: COLORS.textMain,
    lineHeight: 18,
  },
  badgePill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '800',
  }
});
