import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import QuadImage from './QuadImage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS } from '../constants/theme';
import { createListing } from '../services/marketService';
import { uploadImage } from '../utils/uploadImage';

export default function CreateItemModal({ visible, onClose, currentUser, currentSchool }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Textbooks');
  const [condition, setCondition] = useState('Like New');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Textbooks',
    'Tech & Electronics',
    'Dorm & Living',
    'Fashion & Apparel',
    'Tickets & Passes',
    'Services & Tutoring',
    'Other'
  ];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access photos is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !price.trim()) {
      Alert.alert('Missing Fields', 'Please provide a title and price.');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&fm=jpg&fit=crop&q=80';
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage, 'marketplace');
      }

      await createListing({
        sellerId: currentUser.uid,
        sellerName: currentUser.displayName || 'Student Seller',
        sellerAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80',
        sellerSchoolId: currentSchool.id,
        sellerSchoolName: currentSchool.name,
        isVerifiedSeller: !!currentUser.isVerifiedSchool,
        title: title.trim(),
        price: parseFloat(price) || 0,
        category,
        condition,
        description: description.trim(),
        imageUrl,
        location: location.trim() || `${currentSchool.shortName} Campus`
      });

      setTitle('');
      setPrice('');
      setDescription('');
      setLocation('');
      setSelectedImage(null);
      onClose();
    } catch (err) {
      console.error("Error creating listing:", err);
      Alert.alert('Error', 'Failed to list item. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={styles.overlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.textMain} />
            </TouchableOpacity>
            <Text style={styles.title}>List Item for Sale</Text>
            <TouchableOpacity 
              onPress={handleSubmit} 
              disabled={submitting || !title.trim() || !price.trim()}
              style={[
                styles.postBtn, 
                (submitting || !title.trim() || !price.trim()) && styles.postBtnDisabled
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.postBtnText}>Publish</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formContent}>
            {/* Image Upload Area */}
            <TouchableOpacity onPress={pickImage} style={styles.imagePickerBox}>
              {selectedImage ? (
                <QuadImage uri={selectedImage } style={styles.uploadedImg} />
              ) : (
                <View style={styles.placeholderBox}>
                  <Ionicons name="camera-outline" size={32} color={COLORS.primary} />
                  <Text style={styles.uploadText}>Add Product Photo</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Title */}
            <Text style={styles.label}>Item Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Calculus 8th Ed / iPad Air M1"
              value={title}
              onChangeText={setTitle}
            />

            {/* Price */}
            <Text style={styles.label}>Price (₦ Naira) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />

            {/* Category Selector */}
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
              {categories.map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  onPress={() => setCategory(cat)}
                  style={[styles.chip, category === cat && styles.chipActive]}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Condition Selector */}
            <Text style={styles.label}>Condition</Text>
            <View style={styles.chipRow}>
              {conditions.map(cond => (
                <TouchableOpacity 
                  key={cond} 
                  onPress={() => setCondition(cond)}
                  style={[styles.chip, condition === cond && styles.chipActive]}
                >
                  <Text style={[styles.chipText, condition === cond && styles.chipTextActive]}>
                    {cond}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 75, textAlignVertical: 'top' }]}
              placeholder="Tell buyers about highlights, missing pages, or condition..."
              multiline
              value={description}
              onChangeText={setDescription}
            />

            {/* Location */}
            <Text style={styles.label}>Pickup Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Student Center / Mail Room"
              value={location}
              onChangeText={setLocation}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
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
    padding: 16,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  closeBtn: {
    padding: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  postBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  postBtnDisabled: {
    backgroundColor: COLORS.textLight,
  },
  postBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  formContent: {
    paddingVertical: 12,
    gap: 8,
  },
  imagePickerBox: {
    height: 140,
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  placeholderBox: {
    alignItems: 'center',
    gap: 6,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  uploadedImg: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMain,
    marginTop: 6,
  },
  input: {
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textMain,
  },
  chipScroll: {
    flexDirection: 'row',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgInput,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: COLORS.primaryLight,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  chipTextActive: {
    color: COLORS.primary,
  }
});
