import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { UserRole } from '../types';

export const ROLE_COLORS: Record<string, string> = {
  student: '#0284C7',      // Ink Navy / Blue (Verified Student)
  club_admin: '#EF6F6C',   // Coral (Club Admin)
  school_admin: '#2D6A4F', // Meadow Green (School Admin)
  super_admin: '#F2B705',  // Gold (Super Admin)
  advertiser: '#3B82C4',   // Steel Blue (Advertiser)
  ads_reviewer: '#6B7280', // Slate (Ads Reviewer)
};

export interface RoleBadgeProps {
  role?: UserRole | string;
  size?: number;
  customColor?: string;
}

export default function RoleBadge({ role = 'student', size = 16, customColor }: RoleBadgeProps) {
  const badgeColor = customColor || ROLE_COLORS[role] || ROLE_COLORS.student;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        <Path
          d="M50 5 
             C54.5 5 57.5 1.5 61.8 3.2 
             C66 4.9 67.5 9.5 71.4 12 
             C75.3 14.5 80.3 14.4 83.5 17.7 
             C86.7 21 86.6 26 89.1 29.9 
             C91.6 33.8 96.2 35.3 97.9 39.5 
             C99.6 43.8 96.1 46.8 96.1 51.3 
             C96.1 55.8 99.6 58.8 97.9 63.1 
             C96.2 67.3 91.6 68.8 89.1 72.7 
             C86.6 76.6 86.7 81.6 83.5 84.9 
             C80.3 88.2 75.3 88.1 71.4 90.6 
             C67.5 93.1 66 97.7 61.8 99.4 
             C57.5 101.1 54.5 97.6 50 97.6 
             C45.5 97.6 42.5 101.1 38.2 99.4 
             C34 97.7 32.5 93.1 28.6 90.6 
             C24.7 88.1 19.7 88.2 16.5 84.9 
             C13.3 81.6 13.4 76.6 10.9 72.7 
             C8.4 68.8 3.8 67.3 2.1 63.1 
             C0.4 58.8 3.9 55.8 3.9 51.3 
             C3.9 46.8 0.4 43.8 2.1 39.5 
             C3.8 35.3 8.4 33.8 10.9 29.9 
             C13.4 26 13.3 21 16.5 17.7 
             C19.7 14.4 24.7 14.5 28.6 12 
             C32.5 9.5 34 4.9 38.2 3.2 
             C42.5 1.5 45.5 5 50 5 Z"
          fill={badgeColor}
        />
        <Path
          d="M33 51 L45 63 L69 37"
          stroke="#FFFFFF"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  }
});
