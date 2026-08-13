import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Platform, KeyboardAvoidingView,
  Modal, FlatList, ActivityIndicator, Alert
} from 'react-native';
import Svg, { Circle, Line as SvgLine } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { BRAND } from '../constants/theme';
import { SCHOOLS } from '../data/mockData';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

function QMark({ size = 38 }) {
  const sw = size * 0.16;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Circle cx="42" cy="40" r="34" fill="none" stroke={BRAND.INK} strokeWidth={sw} />
      <SvgLine
        x1="63" y1="61" x2="88" y2="86"
        stroke={BRAND.CORAL} strokeWidth={sw} strokeLinecap="round"
      />
    </Svg>
  );
}

export default function AuthScreen({ onSignUp, onLogin }) {
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValid =
    email.length > 0 &&
    password.length >= 6 &&
    (mode === 'login' || selectedSchool !== null);

  const handleContinue = async () => {
    if (!isValid || loading) return;
    setLoading(true);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: email.split('@')[0],
          username: email.split('@')[0].toLowerCase(),
          schoolId: selectedSchool.id,
          schoolName: selectedSchool.name,
          isVerifiedSchool: false,
          bio: `Student @ ${selectedSchool.name}`,
          major: 'General Studies',
          gradYear: 2026,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          bannerUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
          followersCount: 0,
          followingCount: 0,
          likesReceived: 0,
          createdAt: serverTimestamp()
        });

        onSignUp({ email, selectedSchool, user });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        onLogin({ user: userCredential.user });
      }
    } catch (err) {
      console.error("Auth error:", err);
      Alert.alert("Authentication Error", err.message || "Failed to authenticate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.header}>
          <QMark size={38} />
          <Text style={styles.heading}>
            {mode === 'signup' ? 'Join your quad' : 'Welcome back'}
          </Text>
          <Text style={styles.subheading}>
            {mode === 'signup'
              ? 'Verify with your school email to unlock the feed, marketplace and clubs.'
              : 'Log in to pick up your conversations and posts.'}
          </Text>
        </View>

        {/* Tab switcher */}
        <View style={styles.tabRow}>
          {['signup', 'login'].map(m => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              style={[styles.tabBtn, mode === m && styles.tabBtnActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                {m === 'signup' ? 'Sign up' : 'Log in'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Fields */}
        <View style={styles.fields}>
          <View>
            <Text style={styles.label}>School email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@university.edu"
              placeholderTextColor={BRAND.SLATE}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={BRAND.SLATE}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {mode === 'signup' && (
            <View>
              <Text style={styles.label}>School</Text>
              <TouchableOpacity
                style={styles.input}
                onPress={() => setShowPicker(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.pickerText, !selectedSchool && styles.placeholder]}>
                  {selectedSchool ? selectedSchool.name : 'Select your school'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Verification note */}
          <View style={styles.noteRow}>
            <View style={styles.checkbox} />
            <Text style={styles.noteText}>
              School verification keeps the marketplace and chat student-only.
            </Text>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleContinue}
            style={[styles.ctaBtn, (!isValid || loading) && styles.ctaBtnDisabled]}
            activeOpacity={0.85}
            disabled={!isValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.ctaText}>
                {mode === 'signup' ? 'Create account' : 'Log in'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Or Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.line} />
          </View>

          {/* Google Sign In Button */}
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Google Sign-In",
                "Ensure Google provider is enabled in Firebase Console (Authentication -> Sign-in method -> Google)."
              );
            }}
            style={styles.googleBtn}
            activeOpacity={0.85}
          >
            <Ionicons name="logo-google" size={18} color="#EA4335" />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <Text style={styles.switchText}>
            {mode === 'signup' ? 'Already on QUAD? ' : 'New here? '}
            <Text
              style={styles.switchLink}
              onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')}
            >
              {mode === 'signup' ? 'Log in' : 'Sign up'}
            </Text>
          </Text>
        </View>
      </ScrollView>

      {/* School picker modal */}
      <Modal
        visible={showPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.pickerSheet}>
            <Text style={styles.pickerTitle}>Select your school</Text>
            <FlatList
              data={SCHOOLS}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.pickerItem,
                    selectedSchool?.id === item.id && styles.pickerItemActive,
                  ]}
                  onPress={() => {
                    setSelectedSchool(item);
                    setShowPicker(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      selectedSchool?.id === item.id && styles.pickerItemTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                  <Text style={styles.pickerItemDomain}>@{item.domain}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.divider} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: BRAND.PAPER },
  container: { flex: 1, backgroundColor: BRAND.PAPER },
  content: { paddingBottom: 40 },

  header: {
    paddingHorizontal: 26,
    paddingTop: 48,
    gap: 10,
  },
  heading: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: '800',
    color: BRAND.INK,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 13,
    color: BRAND.SLATE,
    lineHeight: 20,
  },

  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 26,
    marginTop: 24,
    backgroundColor: '#EFEAE1',
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: BRAND.PAPER,
    shadowColor: BRAND.INK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: BRAND.SLATE,
  },
  tabTextActive: {
    color: BRAND.INK,
  },

  fields: {
    paddingHorizontal: 26,
    marginTop: 22,
    gap: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.INK,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1.5,
    borderColor: BRAND.LINE,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 13,
    color: BRAND.INK,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  pickerText: {
    fontSize: 13,
    color: BRAND.INK,
  },
  placeholder: {
    color: BRAND.SLATE,
  },

  noteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 4,
  },
  checkbox: {
    width: 14,
    height: 14,
    marginTop: 1,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: BRAND.MEADOW,
    flexShrink: 0,
  },
  noteText: {
    fontSize: 11,
    color: BRAND.SLATE,
    flex: 1,
    lineHeight: 16,
  },

  footer: {
    paddingHorizontal: 26,
    marginTop: 32,
    gap: 16,
    alignItems: 'center',
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
  ctaBtnDisabled: {
    backgroundColor: '#D0CAC1',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 4,
    gap: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: BRAND.LINE,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND.SLATE,
  },
  googleBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: BRAND.LINE,
    paddingVertical: 12,
    borderRadius: 12,
  },
  googleBtnText: {
    color: BRAND.INK,
    fontWeight: '700',
    fontSize: 13,
  },
  switchText: {
    fontSize: 12,
    color: BRAND.SLATE,
  },
  switchLink: {
    color: BRAND.INK,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(22,33,62,0.5)',
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    backgroundColor: BRAND.PAPER,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  pickerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: BRAND.INK,
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  pickerItem: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  pickerItemActive: {
    backgroundColor: '#EFE9DE',
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: BRAND.INK,
  },
  pickerItemTextActive: {
    color: BRAND.CORAL,
  },
  pickerItemDomain: {
    fontSize: 11,
    color: BRAND.SLATE,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: BRAND.LINE,
    marginHorizontal: 24,
  },
});
