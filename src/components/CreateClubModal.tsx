import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import QuadImage from './QuadImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { createClub } from '../services/clubService';
import { pickAndUploadImage } from '../utils/uploadImage';

const CATEGORIES = [
  'Tech & Coding',
  'Sports & Fitness',
  'Arts & Music',
  'Business & Startup',
  'Academic & Research',
  'Gaming & Esports',
  'Social & Lifestyle'
];

export default function CreateClubModal({ visible, onClose, currentUser, currentSchool, onClubCreated }: any) {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [isInterSchool, setIsInterSchool] = useState(false);
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&fm=jpg&fit=crop&q=80');
  const [logoUrl, setLogoUrl] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePickBanner = async () => {
    setUploadingImage(true);
    try {
      const res = await pickAndUploadImage('club_banners');
      if (res?.url) setBannerUrl(res.url);
    } catch (err) {
      console.warn("Banner upload error:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert("Missing Name", "Please enter a club name.");
      return;
    }

    setLoading(true);
    try {
      const clubId = await createClub({
        name: name.trim(),
        tagline: tagline.trim() || `${category} Club @ ${currentSchool.shortName}`,
        schoolId: currentSchool.id,
        schoolName: currentSchool.name,
        isInterSchool,
        category,
        description: description.trim(),
        logoUrl,
        bannerUrl,
        leaderId: currentUser.uid
      });

      Alert.alert("Club Created! 🎉", `${name.trim()} has been published successfully.`);
      if (onClubCreated) onClubCreated();
      onClose();
      
      // Reset form
      setName('');
      setTagline('');
      setDescription('');
    } catch (err) {
      console.error("Error creating club:", err);
      Alert.alert("Error", err?.message || "Failed to create club.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Campus Club</Text>
          <TouchableOpacity 
            onPress={handleCreate} 
            disabled={!name.trim() || loading}
            style={[styles.publishBtn, (!name.trim() || loading) && styles.publishBtnDisabled]}
          >
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.publishBtnText}>Create</Text>}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Banner Upload Card */}
            <TouchableOpacity onPress={handlePickBanner} style={styles.bannerPicker} activeOpacity={0.85}>
              <QuadImage uri={bannerUrl } style={styles.bannerPreview} />
              <View style={styles.bannerOverlay}>
                <Ionicons name="camera-outline" size={24} color="#fff" />
                <Text style={styles.bannerOverlayText}>
                  {uploadingImage ? 'Uploading...' : 'Change Cover Photo'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Club Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Club Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Developer Student Club, Tech Hub, Robotics..."
                placeholderTextColor={COLORS.textLight}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Tagline */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tagline / Motto</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Building tech solutions for Nigerian campuses"
                placeholderTextColor={COLORS.textLight}
                value={tagline}
                onChangeText={setTagline}
              />
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
                {CATEGORIES.map(cat => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategory(cat)}
                      style={[styles.catPill, isSelected && styles.catPillActive]}
                    >
                      <Text style={[styles.catPillText, isSelected && styles.catPillTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Scope Privacy */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Scope Visibility</Text>
              <View style={styles.scopeRow}>
                <TouchableOpacity 
                  onPress={() => setIsInterSchool(false)}
                  style={[styles.scopeBtn, !isInterSchool && styles.scopeBtnActive]}
                >
                  <Ionicons name="school-outline" size={18} color={!isInterSchool ? COLORS.primary : COLORS.textMuted} />
                  <Text style={[styles.scopeText, !isInterSchool && styles.scopeTextActive]}>
                    {currentSchool.shortName} Only
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setIsInterSchool(true)}
                  style={[styles.scopeBtn, isInterSchool && styles.scopeBtnActive]}
                >
                  <Ionicons name="globe-outline" size={18} color={isInterSchool ? COLORS.primary : COLORS.textMuted} />
                  <Text style={[styles.scopeText, isInterSchool && styles.scopeTextActive]}>
                    All Campuses (Nationwide)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>About Club / Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What is this club about? What activities, projects, or events do you host?"
                placeholderTextColor={COLORS.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgMain,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    backgroundColor: COLORS.bgCard,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  publishBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  publishBtnDisabled: {
    backgroundColor: COLORS.textLight,
  },
  publishBtnText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 40,
  },
  bannerPicker: {
    position: 'relative',
    width: '100%',
    height: 140,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  bannerPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bannerOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  input: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textMain,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  catRow: {
    gap: 8,
    paddingVertical: 4,
  },
  catPill: {
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  catPillActive: {
    backgroundColor: COLORS.primary,
  },
  catPillText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  catPillTextActive: {
    color: '#fff',
    fontWeight: '800',
  },
  scopeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scopeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    gap: 6,
  },
  scopeBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  scopeText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  scopeTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  }
});
