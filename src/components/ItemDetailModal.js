import React from 'react';
import {
  Modal, View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { markItemSold, deleteListing } from '../services/marketService';

export default function ItemDetailModal({ visible, onClose, item, currentUser, onStartChat }) {
  if (!item) return null;

  const isSeller = item.sellerId === currentUser?.uid;

  const handleMarkSold = async () => {
    try {
      await markItemSold(item.id);
      Alert.alert("Item Marked Sold", "This product is now marked as sold.");
      onClose();
    } catch (err) {
      console.error("Error marking item sold:", err);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteListing(item.id);
              onClose();
            } catch (err) {
              console.error("Error deleting listing:", err);
            }
          }
        }
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Top Navigation Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.topTitle} numberOfLines={1}>{item.title}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Scrollable Content (Includes Hero Image, Details, and Action Button) */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Large Hero Image */}
          <View style={styles.heroImageContainer}>
            <Image 
              source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' }} 
              style={styles.heroImage} 
            />
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>{item.condition}</Text>
            </View>
          </View>

          {/* Title & Price Header */}
          <View style={styles.headerSection}>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
            <Text style={styles.price}>₦{typeof item.price === 'number' ? item.price.toLocaleString() : item.price}</Text>
          </View>

          {/* Seller Card */}
          <View style={styles.sellerCard}>
            <Image 
              source={{ uri: item.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' }} 
              style={styles.sellerAvatar} 
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.sellerName}>{item.sellerName}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Ionicons name="school-outline" size={12} color={COLORS.primary} />
                <Text style={styles.sellerSchool}>{item.sellerSchoolName || 'Campus Seller'}</Text>
              </View>
            </View>
            {item.location && (
              <View style={styles.locationTag}>
                <Ionicons name="location-outline" size={14} color={COLORS.primary} />
                <Text style={styles.locationText}>{item.location}</Text>
              </View>
            )}
          </View>

          {/* Item Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Item Overview</Text>
            <Text style={styles.descriptionText}>
              {item.description || "No detailed description provided by seller for this item."}
            </Text>
          </View>

          {/* Action Buttons (Inside ScrollView so never cut off) */}
          <View style={styles.actionContainer}>
            {isSeller ? (
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={handleMarkSold} style={[styles.ctaBtn, { backgroundColor: COLORS.badgeGreen, flex: 1 }]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                  <Text style={styles.ctaText}>Mark as Sold</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={[styles.ctaBtn, { backgroundColor: '#EF4444', width: 52 }]}>
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => {
                  onClose();
                  if (onStartChat) onStartChat(item.sellerName, item);
                }} 
                style={styles.ctaBtn}
                activeOpacity={0.85}
              >
                <Feather name="message-square" size={20} color="#fff" />
                <Text style={styles.ctaText}>Message Seller</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    backgroundColor: COLORS.bgCard,
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
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  heroImageContainer: {
    position: 'relative',
    width: '100%',
    height: 260,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  conditionBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  conditionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgCard,
    padding: 16,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.textMain,
  },
  category: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.primary,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    padding: 14,
    borderRadius: RADIUS.xl,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  sellerName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  sellerSchool: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '700',
  },
  descriptionSection: {
    backgroundColor: COLORS.bgCard,
    padding: 16,
    borderRadius: RADIUS.xl,
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.textMuted,
  },
  actionContainer: {
    marginTop: 8,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    gap: 8,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 15,
  }
});
