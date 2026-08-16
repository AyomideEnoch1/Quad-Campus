import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { pickAndUploadImage } from '../utils/uploadImage';
import RoleBadge from './RoleBadge';

const INTEREST_CATEGORIES = [
  'General', 'Tech & Coding', 'Fashion & Apparel', 'Food & Dining',
  'Events & Parties', 'Education & Courses', 'Fitness & Health'
];

export default function AdComposerModal({ visible, onClose, currentUser, currentSchool }: any) {
  const [headline, setHeadline] = useState('');
  const [ctaText, setCtaText] = useState('Learn More');
  const [ctaUrl, setCtaUrl] = useState('');
  const [category, setCategory] = useState(INTEREST_CATEGORIES[0]);
  const [targetSchool, setTargetSchool] = useState('All Campuses');
  const [budget, setBudget] = useState('10000');
  const [bannerUrl, setBannerUrl] = useState('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&fm=jpg&fit=crop&q=80');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePickBanner = async () => {
    setUploadingImage(true);
    try {
      const res = await pickAndUploadImage('ads_creatives');
      if (res?.url) setBannerUrl(res.url);
    } catch (err) {
      console.warn("Ad image pick error:", err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitAd = async () => {
    if (!headline.trim()) {
      Alert.alert("Missing Headline", "Please enter an ad headline.");
      return;
    }

    setLoading(true);
    try {
      const adData = {
        advertiserId: currentUser.uid,
        advertiserName: currentUser.displayName || 'Advertiser',
        advertiserAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80',
        headline: headline.trim(),
        imageUrl: bannerUrl,
        ctaText: ctaText.trim() || 'Learn More',
        ctaUrl: ctaUrl.trim() || '#',
        category,
        targetSchool: targetSchool === 'All Campuses' ? 'all' : currentSchool.id,
        budget: parseFloat(budget) || 10000,
        status: 'pending', // 'pending' | 'approved' | 'rejected'
        impressionsCount: 0,
        clicksCount: 0,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'ads'), adData);
      Alert.alert("Ad Submitted! 🚀", "Your campaign has been submitted to the review queue. It will go live upon approval.");
      onClose();

      // Reset
      setHeadline('');
      setCtaUrl('');
    } catch (err) {
      console.error("Error submitting ad:", err);
      Alert.alert("Error", err?.message || "Failed to submit ad campaign.");
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.headerTitle}>Create Sponsored Campaign</Text>
            <RoleBadge role="advertiser" size={16} />
          </View>
          <TouchableOpacity 
            onPress={handleSubmitAd}
            disabled={!headline.trim() || loading}
            style={[styles.submitBtn, (!headline.trim() || loading) && styles.submitBtnDisabled]}
          >
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.submitBtnText}>Submit Ad</Text>}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView 
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Banner Creative Picker */}
            <TouchableOpacity onPress={handlePickBanner} style={styles.bannerPicker} activeOpacity={0.85}>
              <Image source={{ uri: bannerUrl }} style={styles.bannerPreview} />
              <View style={styles.bannerOverlay}>
                <Ionicons name="camera-outline" size={24} color="#fff" />
                <Text style={styles.bannerOverlayText}>
                  {uploadingImage ? 'Uploading...' : 'Upload Ad Image Creative'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Headline */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ad Headline / Copy *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Get 20% off all tech accessories for UNILAG students!"
                placeholderTextColor={COLORS.textLight}
                value={headline}
                onChangeText={setHeadline}
              />
            </View>

            {/* CTA Label & Link */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>CTA Button Label</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Shop Now, Claim Offer"
                  placeholderTextColor={COLORS.textLight}
                  value={ctaText}
                  onChangeText={setCtaText}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Website / Destination URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://yourbrand.com"
                  placeholderTextColor={COLORS.textLight}
                  value={ctaUrl}
                  onChangeText={setCtaUrl}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Category Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Target Interest Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
                {INTEREST_CATEGORIES.map(cat => {
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

            {/* Target Campus */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Campus Targeting</Text>
              <View style={styles.targetRow}>
                <TouchableOpacity 
                  onPress={() => setTargetSchool('All Campuses')}
                  style={[styles.targetBtn, targetSchool === 'All Campuses' && styles.targetBtnActive]}
                >
                  <Ionicons name="globe-outline" size={18} color={targetSchool === 'All Campuses' ? COLORS.primary : COLORS.textMuted} />
                  <Text style={[styles.targetText, targetSchool === 'All Campuses' && styles.targetTextActive]}>
                    All Campuses
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setTargetSchool(currentSchool.name)}
                  style={[styles.targetBtn, targetSchool !== 'All Campuses' && styles.targetBtnActive]}
                >
                  <Ionicons name="school-outline" size={18} color={targetSchool !== 'All Campuses' ? COLORS.primary : COLORS.textMuted} />
                  <Text style={[styles.targetText, targetSchool !== 'All Campuses' && styles.targetTextActive]}>
                    {currentSchool.shortName} Only
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Campaign Budget */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Campaign Budget (₦ Naira)</Text>
              <TextInput
                style={styles.input}
                placeholder="10000"
                placeholderTextColor={COLORS.textLight}
                value={budget}
                onChangeText={setBudget}
                keyboardType="numeric"
              />
            </View>

            {/* Note */}
            <View style={styles.reviewNoteCard}>
              <Ionicons name="information-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.reviewNoteText}>
                Every campaign is reviewed by QUAD Ads Reviewers before rendering live in the student feed as a Sponsored Post.
              </Text>
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
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  submitBtnDisabled: {
    backgroundColor: COLORS.textLight,
  },
  submitBtnText: {
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
    height: 180,
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  bannerOverlayText: {
    color: '#fff',
    fontSize: 13,
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
  targetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  targetBtn: {
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
  targetBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  targetText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  targetTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  reviewNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  reviewNoteText: {
    fontSize: 12,
    color: COLORS.primary,
    lineHeight: 18,
    flex: 1,
    fontWeight: '600',
  }
});
