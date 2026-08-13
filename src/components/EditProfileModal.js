import React, { useState } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS } from '../constants/theme';
import { updateUserProfile } from '../services/userService';
import { uploadImage } from '../utils/uploadImage';

export default function EditProfileModal({ visible, onClose, currentUser, onProfileUpdated }) {
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [username, setUsername] = useState(currentUser?.username || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [major, setMajor] = useState(currentUser?.major || '');
  const [gradYear, setGradYear] = useState(currentUser?.gradYear ? String(currentUser.gradYear) : '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || '');
  const [bannerUrl, setBannerUrl] = useState(currentUser?.bannerUrl || '');
  const [submitting, setSubmitting] = useState(false);

  const pickAvatar = async () => {
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
      setAvatarUrl(result.assets[0].uri);
    }
  };

  const pickBanner = async () => {
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
      setBannerUrl(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Validation Error', 'Display name cannot be empty.');
      return;
    }

    setSubmitting(true);
    try {
      let finalAvatarUrl = avatarUrl;
      let finalBannerUrl = bannerUrl;

      if (avatarUrl && !avatarUrl.startsWith('http')) {
        finalAvatarUrl = await uploadImage(avatarUrl, 'avatars');
      }

      if (bannerUrl && !bannerUrl.startsWith('http')) {
        finalBannerUrl = await uploadImage(bannerUrl, 'banners');
      }

      const updateData = {
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        major: major.trim(),
        gradYear: parseInt(gradYear) || 2026,
        avatarUrl: finalAvatarUrl,
        bannerUrl: finalBannerUrl
      };

      await updateUserProfile(currentUser.uid, updateData);
      if (onProfileUpdated) onProfileUpdated(updateData);
      onClose();
    } catch (err) {
      console.error("Error updating profile:", err);
      Alert.alert('Error', 'Failed to update profile.');
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
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity 
              onPress={handleSave} 
              disabled={submitting}
              style={styles.saveBtn}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.formContent}>
            {/* Banner Picker */}
            <TouchableOpacity onPress={pickBanner} style={styles.bannerPicker}>
              <Image source={{ uri: bannerUrl || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&fm=jpg&fit=crop&q=80' }} style={styles.bannerImg} />
              <View style={styles.cameraIconOverlay}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            {/* Avatar Picker */}
            <View style={styles.avatarRow}>
              <TouchableOpacity onPress={pickAvatar} style={styles.avatarPicker}>
                <Image source={{ uri: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80' }} style={styles.avatarImg} />
                <View style={styles.avatarCameraOverlay}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Display Name */}
            <Text style={styles.label}>Display Name *</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
            />

            {/* Handle / Username */}
            <Text style={styles.label}>Username / Handle</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />

            {/* Bio */}
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              multiline
              value={bio}
              onChangeText={setBio}
            />

            {/* Major & Grad Year */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 2 }}>
                <Text style={styles.label}>Major</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Computer Science"
                  value={major}
                  onChangeText={setMajor}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Grad Year</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2026"
                  keyboardType="number-pad"
                  value={gradYear}
                  onChangeText={setGradYear}
                />
              </View>
            </View>
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
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  formContent: {
    paddingVertical: 12,
    gap: 8,
  },
  bannerPicker: {
    height: 100,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
  cameraIconOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRow: {
    alignItems: 'center',
    marginTop: -30,
    marginBottom: 8,
  },
  avatarPicker: {
    position: 'relative',
  },
  avatarImg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: COLORS.bgCard,
  },
  avatarCameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 4,
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
  }
});
