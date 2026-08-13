import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { subscribeMarketplaceItems } from '../services/marketService';
import CreateItemModal from '../components/CreateItemModal';
import ItemDetailModal from '../components/ItemDetailModal';
import VendorStorefrontModal from '../components/VendorStorefrontModal';
import { MarketCardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

export default function MarketScreen({ items: initialItems, currentUser, currentSchool, onStartChatWithSeller }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(initialItems || []);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const categories = ['All', 'Textbooks', 'Tech', 'Dorm Gear', 'Tickets'];

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeMarketplaceItems(selectedCategory, (liveItems) => {
      if (liveItems) {
        setItems(liveItems);
      }
      setLoading(false);
    });
    return unsub;
  }, [selectedCategory]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderItemCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => setSelectedDetailItem(item)}
    >
      <View style={styles.imgContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.itemImg} />
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>₦{typeof item.price === 'number' ? item.price.toLocaleString() : item.price}</Text>
        </View>
        <View style={styles.conditionTag}>
          <Text style={styles.conditionText}>{item.condition}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.sellerSchool}>🏫 {item.sellerSchoolName || currentSchool?.shortName}</Text>
          {item.isVerifiedSeller && (
            <Ionicons name="shield-checkmark" size={14} color={COLORS.badgeGreen} />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchBox}>
        <Feather name="search" size={18} color={COLORS.textMuted} />
        <TextInput 
          placeholder="Search textbooks, iPads, mini-fridges..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Category Scroll */}
      <View style={styles.categoryScroll}>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCategory(cat)}
            style={[styles.catBtn, selectedCategory === cat && styles.catActive]}
          >
            <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 2-Column Listing Grid */}
      {loading ? (
        <View style={{ flexDirection: 'row', paddingHorizontal: 12, gap: 12 }}>
          <MarketCardSkeleton />
          <MarketCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          numColumns={2}
          renderItem={renderItemCard}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 80, gap: 12 }}
          ListEmptyComponent={
            <EmptyState
              icon="cart-outline"
              title="No listings found"
              subtitle="Be the first to sell a textbook, tech item, or dorm gear on campus!"
              actionText="List an Item"
              onAction={() => setShowItemModal(true)}
            />
          }
        />
      )}

      {/* Floating Sell Item Button */}
      <TouchableOpacity 
        onPress={() => setShowItemModal(true)} 
        style={styles.fabBtn}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={22} color="#fff" />
        <Text style={styles.fabText}>Sell Item</Text>
      </TouchableOpacity>

      <CreateItemModal
        visible={showItemModal}
        onClose={() => setShowItemModal(false)}
        currentUser={currentUser}
        currentSchool={currentSchool}
      />

      <ItemDetailModal
        visible={!!selectedDetailItem}
        item={selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
        currentUser={currentUser}
        onStartChat={onStartChatWithSeller}
        onOpenVendorStorefront={(vendorItem) => setSelectedVendor(vendorItem)}
      />

      <VendorStorefrontModal
        visible={!!selectedVendor}
        seller={selectedVendor}
        items={items}
        onClose={() => setSelectedVendor(null)}
        onSelectListing={(item) => setSelectedDetailItem(item)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    marginHorizontal: 12,
    marginTop: 10,
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMain,
  },
  categoryScroll: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  catActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMain,
  },
  catTextActive: {
    color: '#fff',
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    ...COLORS.shadowSm,
  },
  imgContainer: {
    height: 120,
    position: 'relative',
  },
  itemImg: {
    width: '100%',
    height: '100%',
  },
  pricePill: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  priceText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 12,
  },
  conditionTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  conditionText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 10,
  },
  cardDetails: {
    padding: 10,
    gap: 6,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerSchool: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  fabBtn: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 6,
    ...COLORS.shadowMd,
  },
  fabText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  }
});
