import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../constants/theme';

export default function QuadLogo({ height = 26, showText = true }) {
  const width = showText ? 150 : 40;

  return (
    <View style={{ height, width }}>
      <Svg height={height} width={width} viewBox="0 0 240 60">
        {/* 'Q' Circle Ring */}
        <Circle 
          cx="30" 
          cy="30" 
          r="18" 
          stroke={COLORS.navy} 
          strokeWidth="6" 
          fill="none"
        />
        {/* 'Q' Coral Slash Tail */}
        <Line 
          x1="32" 
          y1="32" 
          x2="46" 
          y2="46" 
          stroke={COLORS.coralSlash} 
          strokeWidth="6" 
          strokeLinecap="round" 
        />

        {showText && (
          <SvgText 
            x="64" 
            y="41" 
            fill={COLORS.navy} 
            fontWeight="800" 
            fontSize="34" 
            letterSpacing="2"
          >
            UAD
          </SvgText>
        )}
      </Svg>
    </View>
  );
}
