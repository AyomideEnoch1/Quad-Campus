import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { db } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, addDoc } from 'firebase/firestore';
import RoleBadge from '../components/RoleBadge';

export default function AdsReviewScreen({ visible, onClose, currentUser }) {
  const [pendingAds, setPendingAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    const q = query(
      collection(db, 'ads'),
      where('status', '==', 'pending')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingAds(list);
      setLoading(false);
    }, (err) => {
      console.warn("Ads review queue notice:", err?.message || err);
      setPendingAds([]);
      setLoading(false);
    });

    return unsub;
  }, [visible]);

  const handleApproveAd = async (ad) => {
    try {
      await updateDoc(doc(db, 'ads', ad.id), {
        status: 'approved',
        approvedBy: currentUser.uid,
        approvedAt: serverTimestamp()
      });

      // Audit Log
      await addDoc(collection(db, 'audit_log'), {
        actorId: currentUser.uid,
        action: 'APPROVE_AD',
        targetId: ad.id,
        timestamp: serverTimestamp()
      });

      Alert.alert("Ad Approved! ✅", "This campaign is now active and rendering in student feeds.");
    } catch (err) {
      console.error("Error approving ad:", err);
      Alert.alert("Error", "Failed to approve campaign.");
    }
  };

  const handleRejectAd = async (ad) => {
    Alert.alert(
      "Reject Ad Campaign",
      "Are you sure you want to reject this ad campaign?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject Campaign",
          style: "destructive",
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'ads', ad.id), {
                status: 'rejected',
                rejectedBy: currentUser.uid,
                rejectedAt: serverTimestamp()
              });

              // Audit Log
              await addDoc(collection(db, 'audit_log'), {
                actorId: currentUser.uid,
                action: 'REJECT_AD',
                targetId: ad.id,
                timestamp: serverTimestamp()
              });
            } catch (err) {
              console.error("Error rejecting ad:", err);
            }
          }
        }
      ]
    );
  };

  const renderAdCard = ({ item }) => (
    <View style={styles.adCard}>
      {/* Header */}
      <View style={styles.advertiserHeader}>
        <Image source={{ uri: item.advertiserAvatar }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.advertiserName}>{item.advertiserName}</Text>
            <RoleBadge role="advertiser" size={14} />
          </View>
          <Text style={styles.targetSub}>Target: {item.targetSchool} • ₦{item.budget?.toLocaleString()}</Text>
        </View>
        <View style={styles.pendingTag}>
          <Text style={styles.pendingText}>Pending Review</Text>
        </View>
      </View>

      {/* Ad Image */}
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.adImage} />
      )}

      {/* Headline & Link */}
      <View style={styles.adBody}>
        <Text style={styles.headline}>{item.headline}</Text>
        <Text style={styles.ctaUrl}>{item.ctaUrl}</Text>
      </View>

      {/* Review Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={() => handleRejectAd(item)} style={styles.rejectBtn}>
          <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
          <Text style={styles.rejectText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleApproveAd(item)} style={styles.approveBtn}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
          <Text style={styles.approveText}>Approve Campaign</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={COLORS.textMain} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.topTitle}>Ads Review Queue</Text>
            <RoleBadge role="ads_reviewer" size={16} />
          </View>
          <View style={{ width: 36 }} />
        </View>

        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={pendingAds}
            keyExtractor={item => item.id}
            renderItem={renderAdCard}
            contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 40 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-done-circle-outline" size={48} color={COLORS.badgeGreen} />
                <Text style={styles.emptyTitle}>Queue Cleared!</Text>
                <Text style={styles.emptySub}>No pending ad campaigns awaiting review right now.</Text>
              </View>
            }
          />
        )}
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
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
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
  },
  centerLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: RADIUS.xl,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    ...COLORS.shadowSm,
  },
  advertiserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  advertiserName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  targetSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  pendingTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  pendingText: {
    color: '#D97706',
    fontSize: 11,
    fontWeight: '700',
  },
  adImage: {
    width: '100%',
    height: 180,
    borderRadius: RADIUS.lg,
    resizeMode: 'cover',
  },
  adBody: {
    gap: 4,
  },
  headline: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textMain,
    lineHeight: 20,
  },
  ctaUrl: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  rejectText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800',
  },
  approveBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.badgeGreen,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    gap: 6,
  },
  approveText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textMuted,
  }
});
