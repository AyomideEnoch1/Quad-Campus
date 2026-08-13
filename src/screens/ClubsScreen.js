import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { subscribeClubs, toggleJoinClub } from '../services/clubService';

export default function ClubsScreen({ clubs: initialClubs, currentUser, currentSchool }) {
  const [clubs, setClubs] = useState(initialClubs || []);

  useEffect(() => {
    const unsub = subscribeClubs(currentSchool?.id, currentUser?.uid, (liveClubs) => {
      if (liveClubs && liveClubs.length > 0) {
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

    try {
      if (currentUser?.uid) {
        await toggleJoinClub(club.id, currentUser.uid, club.isJoined);
      }
    } catch (e) {
      console.warn("Error toggling club membership:", e);
    }
  };

  const renderClub = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.bannerUrl }} style={styles.banner} />
      <View style={styles.infoRow}>
        <Image source={{ uri: item.logoUrl }} style={styles.logo} />
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
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={clubs}
        keyExtractor={item => item.id}
        renderItem={renderClub}
        contentContainerStyle={{ padding: 12, gap: 12 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
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
  }
});
