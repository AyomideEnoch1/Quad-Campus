import React, { useState } from 'react';
import {
  Modal, View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, SafeAreaView
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';
import { SCHOOLS } from '../data/mockData';

export default function SchoolPickerModal({ visible, onClose, onSelectSchool, selectedSchool }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchools = SCHOOLS.filter(s => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    const nameMatch = s.name?.toLowerCase().includes(query);
    const shortNameMatch = s.shortName?.toLowerCase().includes(query);
    const domainMatch = s.domain?.toLowerCase().includes(query);
    return nameMatch || shortNameMatch || domainMatch;
  });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <View 
          style={styles.sheetContainer} 
          onStartShouldSetResponder={() => true}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="school-outline" size={20} color={COLORS.primary} />
              <Text style={styles.title}>Select University</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Real-time Search Input Field */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search UNILAG, UI, OAU, Covenant, LASU..."
              placeholderTextColor={COLORS.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* School Count Badge */}
          <Text style={styles.countText}>
            Showing {filteredSchools.length} of {SCHOOLS.length} Universities
          </Text>

          {/* School List */}
          <FlatList
            data={filteredSchools}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={true}
            renderItem={({ item }) => {
              const isSelected = selectedSchool?.id === item.id;
              return (
                <TouchableOpacity
                  style={[styles.schoolItem, isSelected && styles.schoolItemActive]}
                  onPress={() => {
                    onSelectSchool(item);
                    onClose();
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.itemIconCircle}>
                    <Ionicons name="school" size={16} color={isSelected ? '#fff' : COLORS.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.schoolName, isSelected && styles.schoolNameActive]}>
                      {item.name}
                    </Text>
                    <Text style={styles.schoolDomain}>@{item.domain}</Text>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={36} color={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>No University Found</Text>
                <Text style={styles.emptySub}>Try searching by acronym (e.g. UNILAG, FUTA, LASU)</Text>
              </View>
            }
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '85%',
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textMain,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgInput,
    borderRadius: RADIUS.lg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textMain,
  },
  countText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  schoolItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: RADIUS.lg,
    gap: 12,
  },
  schoolItemActive: {
    backgroundColor: COLORS.primaryLight,
  },
  itemIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  schoolName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  schoolNameActive: {
    color: COLORS.primary,
  },
  schoolDomain: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderColor,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
  }
});
