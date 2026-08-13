import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

/**
 * Brand Role Badge Colors
 */
export const ROLE_COLORS = {
  student: '#0284C7',      // Ink Navy / Blue (Verified Student)
  club_admin: '#EF6F6C',   // Coral (Club Admin)
  school_admin: '#2D6A4F', // Meadow Green (School Admin)
  super_admin: '#F2B705',  // Gold (Super Admin)
  advertiser: '#3B82C4',   // Steel Blue (Advertiser)
  ads_reviewer: '#6B7280', // Slate (Ads Reviewer)
};

/**
 * Custom glossy 3D scalloped badge matching QUAD specification
 * 
 * @param {string} role - 'student' | 'club_admin' | 'school_admin' | 'super_admin' | 'advertiser' | 'ads_reviewer'
 * @param {number} size - Badge width/height (default: 16)
 * @param {string} customColor - Override color
 */
export default function RoleBadge({ role = 'student', size = 16, customColor }) {
  const badgeColor = customColor || ROLE_COLORS[role] || ROLE_COLORS.student;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
        {/* Scalloped Glossy Badge Background Path (12 Points) */}
        <Path
          d="M50 0 
             C56 6 62 6 68 3 
             C74 0 81 3 84 9 
             C87 15 92 18 97 19 
             C102 20 105 27 103 33 
             C101 39 104 45 108 50 
             C104 55 101 61 103 67 
             C105 73 102 80 97 81 
             C92 82 87 85 84 91 
             C81 97 74 100 68 97 
             C62 94 56 94 50 100 
             C44 94 38 94 32 97 
             C26 100 19 97 16 91 
             C13 85 8 82 3 81 
             C-2 80 -5 73 -3 67 
             C-1 61 -4 55 0 50 
             C-4 45 -1 39 -3 33 
             C-5 27 -2 20 3 19 
             C8 18 13 15 16 9 
             C19 3 26 0 32 3 
             C38 6 44 6 50 0 Z"
          fill={badgeColor}
          transform="scale(0.85) translate(8, 8)"
        />

        {/* Simplified exact glossy scalloped seal path */}
        <Path
          d="M50 2
             C54.8 6.2 61.4 7.5 67.2 5.5
             C73 3.5 79.5 5.7 82.8 10.9
             C86.1 16.1 91.8 19.4 98 19.3
             C104.2 19.2 109.4 23.9 110.4 30
             C111.4 36.1 108.1 42 107 48.2
             C105.9 54.4 108.9 60.5 114.2 63.8"
          fill={badgeColor}
        />
        
        {/* Render precision scalloped seal using mathematical circle points */}
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

        {/* White Checkmark */}
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
