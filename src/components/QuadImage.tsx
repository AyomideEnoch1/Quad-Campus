import React, { useState, useEffect } from 'react';
import { Image as RNImage, View, StyleSheet, StyleProp, ImageStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export interface QuadImageProps {
  uri?: string | null;
  fallbackUri?: string;
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ImageStyle>;
  contentFit?: 'cover' | 'contain' | 'stretch' | 'center';
  [key: string]: any;
}

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80';

export default function QuadImage({
  uri,
  style,
  fallbackUri = DEFAULT_AVATAR,
  fallbackIcon = 'person-circle-outline',
  contentFit = 'cover',
  ...props
}: QuadImageProps) {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [uri]);

  let cleanedUri = (uri && typeof uri === 'string' && uri.trim().length > 0) ? uri.trim() : null;
  
  if (cleanedUri && !cleanedUri.startsWith('http://') && !cleanedUri.startsWith('https://') && !cleanedUri.startsWith('file://') && !cleanedUri.startsWith('data:') && !cleanedUri.startsWith('content://')) {
    cleanedUri = `https://${cleanedUri}`;
  }

  const activeUri = !error && cleanedUri ? cleanedUri : fallbackUri;

  const resizeModeMap: Record<string, 'cover' | 'contain' | 'stretch' | 'center'> = {
    cover: 'cover',
    contain: 'contain',
    stretch: 'stretch',
    center: 'center'
  };

  if (error || !activeUri) {
    return (
      <View style={[styles.placeholderContainer, style]}>
        <Ionicons name={fallbackIcon} size={22} color={COLORS.textMuted} />
      </View>
    );
  }

  return (
    <RNImage
      source={{ uri: activeUri }}
      style={style as any}
      resizeMode={resizeModeMap[contentFit] || 'cover'}
      onError={() => {
        if (!error) setError(true);
      }}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    backgroundColor: COLORS.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }
});
