import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import QuadImage from '../components/QuadImage';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { subscribeMarketplaceItems } from '../services/marketService';
import CreateItemModal from '../components/CreateItemModal';
import ItemDetailModal from '../components/ItemDetailModal';
import VendorStorefrontModal from '../components/VendorStorefrontModal';
import { MarketCardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

export default function MarketScreen({ items: initialItems, currentUser, currentSchool, onStartChatWithSeller }: any) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<any[]>(initialItems || []);
  const [loading, setLoading] = useState(true);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const categories = ['All', 'Textbooks', 'Tech & Electronics', 'Dorm & Living', 'Fashion & Apparel', 'Tickets & Passes', 'Services & Tutoring'];

  useEffect(() => {
    setLoading(true);
    const safetyTimer = setTimeout(() => setLoading(false), 2500);

    const unsub = subscribeMarketplaceItems(selectedCategory, (liveItems) => {
      clearTimeout(safetyTimer);
      if (liveItems && liveItems.length > 0) {
        setItems(liveItems);
      } else if (initialItems && initialItems.length > 0 && selectedCategory === 'All') {
        setItems(initialItems);
      } else {
        setItems([]);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsub();
    };
  }, [selectedCategory]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const renderItemCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => setSelectedDetailItem(item)}
    >
      <View style={styles.imgContainer}>
        <QuadImage uri={item.imageUrl} style={styles.itemImg} />
        {item.condition ? (
          <View style={styles.conditionTag}>
            <Text style={styles.conditionText}>{item.condition}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardDetails}>
        <View style={styles.tagRow}>
          <Text style={styles.categoryTag} numberOfLines={1}>
            {item.category?.toUpperCase() || 'MARKET'}
          </Text>
          <Text style={styles.tagDot}>•</Text>
          <Text style={styles.schoolTag} numberOfLines={1}>
            {item.sellerSchoolName || currentSchool?.shortName || 'Campus'}
          </Text>
        </View>

        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>

        <Text style={styles.priceText}>
          ₦{typeof item.price === 'number' ? item.price.toLocaleString() : item.price}
        </Text>

        <View style={styles.cardFooter}>
          <TouchableOpacity 
            onPress={() => setSelectedVendor(item)}
            style={styles.vendorStoreChip}
            activeOpacity={0.7}
          >
            <Ionicons name="storefront-outline" size={11} color={COLORS.textMain} />
            <Text style={styles.vendorStoreText}>{item.sellerName ? item.sellerName.split(' ')[0] : 'Store'}</Text>
          </TouchableOpacity>

          {item.createdAt && (
            <Text style={styles.timeAgo}>{item.createdAt}</Text>
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
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Horizontal Scroll */}
      <View style={{ height: 44, marginVertical: 8 }}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[styles.catBtn, selectedCategory === cat && styles.catActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.catText, selectedCategory === cat && styles.catTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        onItemUpdated={() => {}}
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMain,
    paddingVertical: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
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
    width: '100%',
    aspectRatio: 1,
    position: 'relative',
    backgroundColor: COLORS.bgSubtle,
  },
  itemImg: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  conditionTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  conditionText: {
    color: COLORS.textMain,
    fontWeight: '700',
    fontSize: 10,
  },
  cardDetails: {
    padding: 10,
    gap: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryTag: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  tagDot: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  schoolTag: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMain,
    lineHeight: 17,
    height: 34,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  vendorStoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  vendorStoreText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  timeAgo: {
    fontSize: 10,
    color: COLORS.textLight,
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
