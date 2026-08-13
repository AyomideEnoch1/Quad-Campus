import React from 'react';
import {
  Modal, View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert
} from 'react-native';
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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header Image with Close Button */}
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' }} 
              style={styles.productImage} 
            />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.bodyContent}>
            {/* Title & Price */}
            <View style={styles.titleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.category}>{item.category} • {item.condition}</Text>
              </View>
              <Text style={styles.price}>₦{typeof item.price === 'number' ? item.price.toLocaleString() : item.price}</Text>
            </View>

            {/* Seller Info */}
            <View style={styles.sellerCard}>
              <Image 
                source={{ uri: item.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80' }} 
                style={styles.sellerAvatar} 
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.sellerName}>{item.sellerName}</Text>
                <Text style={styles.sellerSchool}>{item.sellerSchoolName || 'Campus Seller'}</Text>
              </View>
              {item.location && (
                <View style={styles.locationTag}>
                  <Ionicons name="location-outline" size={14} color={COLORS.primary} />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.description}>
                {item.description || "No description provided for this item."}
              </Text>
            </View>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            {isSeller ? (
              <View style={{ flexDirection: 'row', gap: 10, flex: 1 }}>
                <TouchableOpacity onPress={handleMarkSold} style={[styles.ctaBtn, { backgroundColor: COLORS.badgeGreen, flex: 1 }]}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.ctaText}>Mark Sold</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={[styles.ctaBtn, { backgroundColor: '#EF4444', width: 48 }]}>
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                onPress={() => {
                  onClose();
                  if (onStartChat) onStartChat(item.sellerName, item);
                }} 
                style={styles.ctaBtn}
              >
                <Feather name="message-square" size={18} color="#fff" />
                <Text style={styles.ctaText}>Message Seller</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 220,
    backgroundColor: '#000',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyContent: {
    padding: 16,
    gap: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  category: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.primary,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    padding: 12,
    borderRadius: RADIUS.lg,
    gap: 10,
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  sellerSchool: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textMuted,
  },
  footer: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    backgroundColor: COLORS.bgCard,
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.full,
    gap: 8,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  }
});
