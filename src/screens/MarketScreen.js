import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { subscribeMarketplaceItems } from '../services/marketService';

export default function MarketScreen({ items: initialItems, currentUser, onStartChatWithSeller }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState(initialItems || []);

  const categories = ['All', 'Textbooks', 'Tech', 'Dorm Gear', 'Tickets'];

  useEffect(() => {
    const unsub = subscribeMarketplaceItems(selectedCategory, (liveItems) => {
      if (liveItems && liveItems.length > 0) {
        setItems(liveItems);
      }
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
      onPress={() => onStartChatWithSeller(item.sellerName, item)}
    >
      <View style={styles.imgContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.itemImg} />
        <View style={styles.pricePill}>
          <Text style={styles.priceText}>${item.price.toFixed(2)}</Text>
        </View>
        <View style={styles.conditionTag}>
          <Text style={styles.conditionText}>{item.condition}</Text>
        </View>
      </View>

      <View style={styles.cardDetails}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.sellerSchool}>🏫 {item.sellerSchoolName}</Text>
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
      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        numColumns={2}
        renderItem={renderItemCard}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 24, gap: 12 }}
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
  }
});
