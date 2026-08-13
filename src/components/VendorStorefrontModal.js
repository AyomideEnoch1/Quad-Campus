import React from 'react';
import {
  Modal, View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import RoleBadge from './RoleBadge';

export default function VendorStorefrontModal({ visible, onClose, seller, items = [], onSelectListing }) {
  if (!seller) return null;

  // Filter listings by sellerId or sellerName
  const sellerListings = items.filter(i => 
    i.sellerId === seller.sellerId || 
    i.sellerId === seller.uid ||
    i.sellerName === seller.sellerName ||
    i.sellerName === seller.displayName
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => {
        onClose();
        if (onSelectListing) onSelectListing(item);
      }}
    >
      <Image source={{ uri: item.imageUrl || item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.itemPrice}>₦{item.price?.toLocaleString()}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={COLORS.textMuted} />
          <Text style={styles.locationText} numberOfLines={1}>{item.pickupLocation || item.location || 'Campus'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const sellerName = seller.displayName || seller.sellerName || 'Student Seller';
  const sellerAvatar = seller.avatarUrl || seller.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80';
  const schoolName = seller.schoolName || seller.sellerSchool || 'University';

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Header Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.topTitle} numberOfLines={1}>Vendor Storefront</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Vendor Header Hero Card */}
        <View style={styles.vendorHero}>
          <Image source={{ uri: sellerAvatar }} style={styles.vendorAvatar} />
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.vendorName}>{sellerName}</Text>
              <RoleBadge role={seller.role || 'student'} size={15} />
            </View>
            <Text style={styles.vendorSub}>Verified Seller • {schoolName}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.statPill}>
                <Ionicons name="pricetags-outline" size={12} color={COLORS.primary} />
                <Text style={styles.statText}>{sellerListings.length} Active Listings</Text>
              </View>
              <View style={styles.statPill}>
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text style={styles.statText}>5.0 (Verified)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Products from {sellerName}</Text>
        </View>

        {/* Listings Grid */}
        <FlatList
          data={sellerListings}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ padding: 14, gap: 12, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="basket-outline" size={48} color={COLORS.textLight} />
              <Text style={styles.emptyTitle}>No Active Listings</Text>
              <Text style={styles.emptySub}>This vendor does not have any active products listed right now.</Text>
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
  vendorHero: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    padding: 16,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  vendorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  vendorName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  vendorSub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    ...COLORS.shadowSm,
  },
  cardImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  cardContent: {
    padding: 10,
    gap: 4,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  locationText: {
    fontSize: 10,
    color: COLORS.textMuted,
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
