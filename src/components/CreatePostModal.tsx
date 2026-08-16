import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS } from '../constants/theme';
import { createPost } from '../services/feedService';
import { uploadImage } from '../utils/uploadImage';

export default function CreatePostModal({ visible, onClose, currentUser, currentSchool }: any) {
  const [content, setContent] = useState('');
  const [scope, setScope] = useState('my_school'); // 'my_school' | 'all_schools'
  const [selectedMedia, setSelectedMedia] = useState(null); // { uri, type: 'image' | 'video' }

  const pickMedia = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'Permission to access photo and video gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setSelectedMedia({
        uri: asset.uri,
        type: asset.type === 'video' ? 'video' : 'image'
      });
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() && !selectedMedia) {
      Alert.alert('Empty Post', 'Please enter text or select a photo/video.');
      return;
    }

    setSubmitting(true);
    try {
      let uploadedMediaUrl = null;
      if (selectedMedia) {
        uploadedMediaUrl = await uploadImage(selectedMedia.uri, 'posts', selectedMedia.type);
      }

      await createPost({
        authorId: currentUser.uid,
        authorName: currentUser.displayName || 'Student',
        authorUsername: currentUser.username || 'student',
        authorAvatar: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&fm=jpg&fit=crop&q=80',
        authorSchoolId: currentSchool.id,
        authorSchoolName: currentSchool.name,
        isVerifiedAuthor: !!currentUser.isVerifiedSchool,
        content: content.trim(),
        mediaUrls: uploadedMediaUrl ? [uploadedMediaUrl] : [],
        mediaType: selectedMedia ? selectedMedia.type : null,
        scope
      });

      setContent('');
      setSelectedMedia(null);
      onClose();
    } catch (err) {
      console.error("Error creating post:", err);
      Alert.alert('Error', 'Failed to publish post. Please try again.');
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
            <Text style={styles.title}>Create Post</Text>
            <TouchableOpacity 
              onPress={handleSubmit} 
              disabled={submitting || (!content.trim() && !selectedMedia)}
              style={[
                styles.postBtn, 
                (submitting || (!content.trim() && !selectedMedia)) && styles.postBtnDisabled
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.postBtnText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Scope Selector */}
          <View style={styles.scopeRow}>
            <TouchableOpacity 
              onPress={() => setScope('my_school')}
              style={[styles.scopePill, scope === 'my_school' && styles.scopePillActive]}
            >
              <Text style={[styles.scopeText, scope === 'my_school' && styles.scopeTextActive]}>
                🏫 {currentSchool?.shortName || 'My School'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setScope('all_schools')}
              style={[styles.scopePill, scope === 'all_schools' && styles.scopePillActive]}
            >
              <Text style={[styles.scopeText, scope === 'all_schools' && styles.scopeTextActive]}>
                🌐 All Campuses
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input Area */}
          <TextInput
            style={styles.input}
            placeholder="What's happening on campus?"
            placeholderTextColor={COLORS.textLight}
            multiline
            value={content}
            onChangeText={setContent}
            autoFocus
          />

          {/* Media Preview */}
          {selectedMedia && (
            <View style={styles.imagePreviewContainer}>
              {selectedMedia.type === 'video' ? (
                <Video
                  source={{ uri: selectedMedia.uri }}
                  style={styles.imagePreview}
                  useNativeControls
                  resizeMode={ResizeMode.COVER}
                  isLooping
                />
              ) : (
                <Image source={{ uri: selectedMedia.uri }} style={styles.imagePreview} contentFit="cover" />
              )}

              <TouchableOpacity 
                onPress={() => setSelectedMedia(null)} 
                style={styles.removeImgBtn}
              >
                <Ionicons name="close-circle" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Action Toolbar */}
          <View style={styles.toolbar}>
            <TouchableOpacity onPress={pickMedia} style={styles.toolBtn}>
              <Ionicons name="images-outline" size={22} color={COLORS.primary} />
              <Text style={styles.toolText}>Photo / Video</Text>
            </TouchableOpacity>
          </View>
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
    maxHeight: '85%',
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
  scopeRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  scopePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.bgInput,
  },
  scopePillActive: {
    backgroundColor: COLORS.primaryLight,
  },
  scopeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  scopeTextActive: {
    color: COLORS.primary,
  },
  input: {
    minHeight: 100,
    maxHeight: 180,
    fontSize: 15,
    color: COLORS.textMain,
    textAlignVertical: 'top',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginVertical: 10,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 180,
  },
  removeImgBtn: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderColor,
    marginTop: 8,
  },
  toolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.bgInput,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  toolText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  }
});
