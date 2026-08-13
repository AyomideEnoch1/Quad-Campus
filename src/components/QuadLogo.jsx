import React from 'react';

export default function QuadLogo({ height = 26, showText = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
      <svg 
        height={height} 
        viewBox="0 0 240 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block' }}
      >
        {/* 'Q' Circle Ring */}
        <circle 
          cx="30" 
          cy="30" 
          r="18" 
          stroke="#141C2E" 
          strokeWidth="6" 
        />
        {/* 'Q' Coral Slash Tail */}
        <line 
          x1="32" 
          y1="32" 
          x2="46" 
          y2="46" 
          stroke="#FF5A60" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />

        {showText && (
          <text 
            x="64" 
            y="41" 
            fill="#141C2E" 
            fontFamily="'Outfit', 'Plus Jakarta Sans', sans-serif" 
            fontWeight="800" 
            fontSize="34" 
            letterSpacing="2"
          >
            UAD
          </text>
        )}
      </svg>
    </div>
  );
}
