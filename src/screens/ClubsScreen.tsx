import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import QuadImage from '../components/QuadImage';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { subscribeClubs, toggleJoinClub } from '../services/clubService';
import ClubDetailModal from '../components/ClubDetailModal';
import CreateClubModal from '../components/CreateClubModal';
import EmptyState from '../components/EmptyState';

export default function ClubsScreen({ clubs: initialClubs, currentUser, currentSchool }: any) {
  const [clubs, setClubs] = useState<any[]>(initialClubs || []);
  const [selectedClub, setSelectedClub] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const unsub = subscribeClubs(currentSchool?.id, currentUser?.uid, (liveClubs) => {
      if (liveClubs) {
        setClubs(liveClubs);
      }
    });
    return unsub;
  }, [currentSchool?.id, currentUser?.uid]);

  const toggleJoin = async (club) => {
    // Optimistic UI update
    setClubs(prev => prev.map(c => {
      if (c.id === club.id) {
        const isJoined = !c.isJoined;
        return { ...c, isJoined, memberCount: isJoined ? c.memberCount + 1 : c.memberCount - 1 };
      }
      return c;
    }));

    if (selectedClub && selectedClub.id === club.id) {
      setSelectedClub(prev => prev ? ({ ...prev, isJoined: !prev.isJoined, memberCount: !prev.isJoined ? prev.memberCount + 1 : prev.memberCount - 1 }) : null);
    }

    try {
      if (currentUser?.uid) {
        await toggleJoinClub(club.id, currentUser.uid, club.isJoined);
      }
    } catch (e) {
      console.warn("Error toggling club membership:", e);
    }
  };

  const renderClub = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => setSelectedClub(item)}
    >
      <QuadImage uri={item.bannerUrl } style={styles.banner} />
      <View style={styles.infoRow}>
        <QuadImage uri={item.logoUrl } style={styles.logo} />
        <View style={{ flex: 1 }}>
          <Text style={styles.clubName}>{item.name}</Text>
          <Text style={styles.tagline}>{item.tagline}</Text>
          <Text style={styles.meta}>{item.memberCount} members • {item.category}</Text>
        </View>

        <TouchableOpacity 
          onPress={() => toggleJoin(item)}
          style={[styles.joinBtn, item.isJoined && styles.joinedBtn]}
        >
          <Text style={[styles.joinText, item.isJoined && styles.joinedText]}>
            {item.isJoined ? 'Joined' : '+ Join'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const [searchQuery, setSearchQuery] = useState('');

  const filteredClubs = clubs.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return c.name?.toLowerCase().includes(q) || 
           c.tagline?.toLowerCase().includes(q) || 
           c.category?.toLowerCase().includes(q);
  });

  return (
    <View style={styles.container}>
      {/* Top Action Header Bar */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Campus Organizations</Text>
          <Text style={styles.headerSub}>Connect with student communities & groups</Text>
        </View>

        <TouchableOpacity 
          onPress={() => setShowCreateModal(true)} 
          style={styles.createClubBtn}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={16} color="#fff" />
          <Text style={styles.createClubText}>Create Club</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search clubs by name or interest..."
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filteredClubs}
        keyExtractor={item => item.id}
        renderItem={renderClub}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24, gap: 12 }}
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title={searchQuery ? "No clubs match your search" : "No clubs available"}
            subtitle={searchQuery ? "Try searching for a different keyword or category." : `Be the first student to create a club at ${currentSchool.shortName}!`}
            actionText="+ Create Club"
            onAction={() => setShowCreateModal(true)}
          />
        }
      />

      <ClubDetailModal
        visible={!!selectedClub}
        club={selectedClub}
        onClose={() => setSelectedClub(null)}
        currentUser={currentUser}
        onToggleJoin={(c) => toggleJoin(c)}
      />

      <CreateClubModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        currentUser={currentUser}
        currentSchool={currentSchool}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  headerSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  createClubBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  createClubText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    ...COLORS.shadowSm,
  },
  banner: {
    width: '100%',
    height: 80,
  },
  infoRow: {
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    marginTop: -22,
    borderWidth: 2,
    borderColor: '#fff',
  },
  clubName: {
    fontWeight: '800',
    fontSize: 14,
    color: COLORS.textMain,
  },
  tagline: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  meta: {
    fontSize: 10,
    color: COLORS.textLight,
    marginTop: 4,
  },
  joinBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  joinedBtn: {
    backgroundColor: COLORS.primaryLight,
  },
  joinText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  joinedText: {
    color: COLORS.primary,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    marginHorizontal: 12,
    marginVertical: 10,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMain,
  }
});
