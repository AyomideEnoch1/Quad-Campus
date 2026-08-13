import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../constants/theme';

export default function QuadLogo({ height = 24, showText = true }) {
  const width = showText ? 100 : 32;

  return (
    <View style={{ height, width, justifyContent: 'center' }}>
      <Svg height={height} width={width} viewBox="0 0 160 48">
        {/* 'Q' Circle Ring */}
        <Circle 
          cx="22" 
          cy="24" 
          r="14" 
          stroke={COLORS.navy} 
          strokeWidth="5" 
          fill="none"
        />
        {/* 'Q' Coral Slash Tail */}
        <Line 
          x1="24" 
          y1="24" 
          x2="36" 
          y2="36" 
          stroke={COLORS.coralSlash} 
          strokeWidth="5" 
          strokeLinecap="round" 
        />

        {showText && (
          <SvgText 
            x="48" 
            y="33" 
            fill={COLORS.navy} 
            fontWeight="900" 
            fontSize="28" 
            letterSpacing="1"
          >
            UAD
          </SvgText>
        )}
      </Svg>
    </View>
  );
}
