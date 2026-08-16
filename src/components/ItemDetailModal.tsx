import React, { useState, useEffect } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { markItemSold, deleteListing, updateListing } from '../services/marketService';

export default function ItemDetailModal({ 
  visible, 
  onClose, 
  item, 
  currentUser, 
  onStartChat, 
  onItemUpdated,
  onOpenVendorStorefront 
}) {
  const { width, height } = useWindowDimensions();
  const heroHeight = Math.min(height * 0.35, 260);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setTitle(item.title || '');
      setPrice(item.price ? String(item.price) : '');
      setDescription(item.description || '');
      setIsEditing(false);
    }
  }, [item]);

  if (!item) return null;

  const isSeller = currentUser?.uid === item.sellerId;

  const handleSaveEdits = async () => {
    if (!title.trim() || !price.trim() || saving) return;
    setSaving(true);

    try {
      const updatedFields = {
        title: title.trim(),
        price: parseFloat(price) || 0,
        description: description.trim()
      };
      await updateListing(item.id, updatedFields);
      if (onItemUpdated) onItemUpdated({ ...item, ...updatedFields });
      setIsEditing(false);
      Alert.alert("Listing Updated ✅", "Your product details have been saved.");
    } catch (err) {
      console.error("Error updating listing:", err);
      Alert.alert("Error", "Failed to update listing.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkSold = async () => {
    Alert.alert(
      "Mark Item as Sold",
      "Are you sure you want to mark this item as sold?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Mark Sold", 
          onPress: async () => {
            try {
              await markItemSold(item.id);
              onClose();
            } catch (err) {
              console.error("Error marking sold:", err);
            }
          }
        }
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Listing",
      "Are you sure you want to delete this listing permanently?",
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
          <Text style={styles.topTitle} numberOfLines={1}>
            {isEditing ? 'Edit Product Details' : item.title}
          </Text>
          {isSeller && !isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editHeaderBtn}>
              <Feather name="edit-3" size={18} color={COLORS.primary} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 36 }} />
          )}
        </View>

        {/* Scrollable Content */}
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Large Responsive Hero Image */}
          <View style={[styles.heroImageContainer, { height: heroHeight }]}>
            <Image 
              source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&fm=jpg&fit=crop&q=80' }} 
              style={styles.heroImage} 
            />
            <View style={styles.conditionBadge}>
              <Text style={styles.conditionText}>{item.condition}</Text>
            </View>
          </View>

          {isEditing ? (
            /* Editing Form Mode */
            <View style={styles.formCard}>
              <Text style={styles.formTitle}>Edit Listing Information</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Product Title</Text>
                <TextInput 
                  style={styles.input} 
                  value={title} 
                  onChangeText={setTitle} 
                  placeholder="Item Title"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Price (₦)</Text>
                <TextInput 
                  style={styles.input} 
                  value={price} 
                  onChangeText={setPrice} 
                  keyboardType="numeric"
                  placeholder="Price"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  value={description} 
                  onChangeText={setDescription} 
                  multiline
                  placeholder="Item details..."
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <TouchableOpacity onPress={() => setIsEditing(false)} style={[styles.ctaBtn, { backgroundColor: COLORS.bgInput, flex: 1 }]}>
                  <Text style={[styles.ctaText, { color: COLORS.textMain }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveEdits} disabled={saving} style={[styles.ctaBtn, { flex: 2 }]}>
                  {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.ctaText}>Save Edits</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Normal Viewing Mode */
            <>
              {/* Title & Price Header */}
              <View style={styles.headerSection}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.category}>{item.category}</Text>
                </View>
                <Text style={styles.price}>₦{typeof item.price === 'number' ? item.price.toLocaleString() : item.price}</Text>
              </View>

              {/* Seller Card (Clickable Storefront Trigger) */}
              <TouchableOpacity 
                onPress={() => {
                  if (onOpenVendorStorefront) onOpenVendorStorefront(item);
                }} 
                style={styles.sellerCard}
                activeOpacity={0.85}
              >
                <Image 
                  source={{ uri: item.sellerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80' }} 
                  style={styles.sellerAvatar} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.sellerName} numberOfLines={1}>{item.sellerName}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Ionicons name="school-outline" size={12} color={COLORS.primary} />
                    <Text style={styles.sellerSchool} numberOfLines={1}>{item.sellerSchoolName || 'Campus Seller'}</Text>
                  </View>
                </View>
                <View style={styles.storefrontBadge}>
                  <Text style={styles.storefrontBadgeText}>View Store ➔</Text>
                </View>
              </TouchableOpacity>

              {/* Item Description / Overview */}
              <View style={styles.descriptionSection}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.sectionTitle}>Product Description</Text>
                  {item.createdAt && (
                    <Text style={{ fontSize: 11, color: COLORS.textMuted }}>Posted {item.createdAt}</Text>
                  )}
                </View>
                <Text style={styles.descriptionText}>
                  {item.description || "No detailed description provided by seller for this item."}
                </Text>
              </View>

              {/* Responsive Action Buttons */}
              <View style={styles.actionContainer}>
                {isSeller ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                    <TouchableOpacity onPress={() => setIsEditing(true)} style={[styles.ctaBtn, { backgroundColor: COLORS.primary, flex: 1, minWidth: 110 }]}>
                      <Feather name="edit" size={18} color="#fff" />
                      <Text style={styles.ctaText}>Edit Item</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleMarkSold} style={[styles.ctaBtn, { backgroundColor: COLORS.badgeGreen, flex: 1, minWidth: 110 }]}>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                      <Text style={styles.ctaText}>Mark Sold</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={[styles.ctaBtn, { backgroundColor: '#EF4444', width: 48 }]}>
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
            </>
          )}
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
  editHeaderBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
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
  formCard: {
    backgroundColor: COLORS.bgCard,
    padding: 16,
    borderRadius: RADIUS.xl,
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
    marginBottom: 4,
  },
  inputGroup: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  input: {
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.textMain,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
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
  },
  storefrontBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  storefrontBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  }
});
