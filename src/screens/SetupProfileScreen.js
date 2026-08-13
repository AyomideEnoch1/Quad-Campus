import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { BRAND } from '../constants/theme';
import { updateUserProfile } from '../services/userService';
import { uploadImage } from '../utils/uploadImage';

export default function SetupProfileScreen({ currentUser, onComplete }) {
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [bio, setBio] = useState('');
  const [major, setMajor] = useState('');
  const [gradYear, setGradYear] = useState('2026');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [saving, setSaving] = useState(false);

  const pickAvatar = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access photo gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const handleSaveAndContinue = async () => {
    setSaving(true);
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarUrl && !avatarUrl.startsWith('http')) {
        finalAvatarUrl = await uploadImage(avatarUrl, 'avatars');
      }

      if (currentUser?.uid) {
        await updateUserProfile(currentUser.uid, {
          displayName: displayName.trim() || currentUser?.displayName,
          bio: bio.trim() || `Student @ ${currentUser?.schoolName || 'Campus'}`,
          major: major.trim() || 'General Studies',
          gradYear: parseInt(gradYear) || 2026,
          avatarUrl: finalAvatarUrl || currentUser?.avatarUrl
        });
      }

      onComplete({
        displayName: displayName.trim() || currentUser?.displayName,
        bio: bio.trim() || `Student @ ${currentUser?.schoolName || 'Campus'}`,
        major: major.trim() || 'General Studies',
        gradYear: parseInt(gradYear) || 2026,
        avatarUrl: finalAvatarUrl || currentUser?.avatarUrl
      });
    } catch (err) {
      console.error("Error setting up profile:", err);
      onComplete({});
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.heading}>Set up your profile</Text>
          <Text style={styles.subheading}>
            Let fellow students know who you are. You can change this anytime later.
          </Text>
        </View>

        {/* Avatar Picker */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickAvatar} style={styles.avatarPicker} activeOpacity={0.8}>
            <Image 
              source={{ uri: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80' }} 
              style={styles.avatarImg} 
            />
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>Tap to upload profile picture</Text>
        </View>

        {/* Display Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Display Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={BRAND.SLATE}
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        {/* Bio */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, { minHeight: 70, textAlignVertical: 'top' }]}
            placeholder="Tell your quad about yourself, your hobbies, or what you're studying..."
            placeholderTextColor={BRAND.SLATE}
            multiline
            value={bio}
            onChangeText={setBio}
          />
        </View>

        {/* Major & Grad Year */}
        <View style={styles.rowGroup}>
          <View style={{ flex: 2 }}>
            <Text style={styles.label}>Major</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Computer Science"
              placeholderTextColor={BRAND.SLATE}
              value={major}
              onChangeText={setMajor}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Grad Year</Text>
            <TextInput
              style={styles.input}
              placeholder="2026"
              placeholderTextColor={BRAND.SLATE}
              keyboardType="number-pad"
              value={gradYear}
              onChangeText={setGradYear}
            />
          </View>
        </View>

        {/* CTA Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleSaveAndContinue}
            disabled={saving}
            activeOpacity={0.85}
            style={styles.ctaBtn}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.ctaText}>Enter QUAD 🚀</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND.PAPER,
  },
  scrollContent: {
    paddingHorizontal: 26,
    paddingTop: 52,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    gap: 8,
    marginBottom: 8,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: BRAND.INK,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 13,
    color: BRAND.SLATE,
    lineHeight: 19,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: 10,
    gap: 8,
  },
  avatarPicker: {
    position: 'relative',
  },
  avatarImg: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: BRAND.INK,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: BRAND.CORAL,
    borderRadius: 14,
    padding: 6,
  },
  avatarHint: {
    fontSize: 11,
    fontWeight: '600',
    color: BRAND.SLATE,
  },
  fieldGroup: {
    gap: 6,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.INK,
  },
  input: {
    borderWidth: 1.5,
    borderColor: BRAND.LINE,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: BRAND.INK,
    backgroundColor: '#fff',
  },
  footer: {
    marginTop: 16,
  },
  ctaBtn: {
    width: '100%',
    backgroundColor: BRAND.CORAL,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: BRAND.CORAL,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 6,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  }
});
