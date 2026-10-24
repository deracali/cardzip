import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function GoogleLogo({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" accessibilityLabel="Google">
      <Path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3A12 12 0 0 1 24 36a12 12 0 1 1 8-20.9l5.7-5.7A20 20 0 1 0 44 24c0-1.2-.1-2.3-.4-3.5Z" />
      <Path fill="#34A853" d="M6.3 14.7 13 19.5A12 12 0 0 1 32 15.1l5.7-5.7A20 20 0 0 0 6.3 14.7Z" />
      <Path fill="#FBBC05" d="M4 24c0 3.8 1.1 7.4 3 10.4l6.6-4.8a12 12 0 0 1 0-11.2L7 13.6A20 20 0 0 0 4 24Z" />
      <Path fill="#EA4335" d="M24 44c5.4 0 10-1.8 13.4-4.9l-6.5-5.1A12 12 0 0 1 13 29.6l-6.6 4.8A20 20 0 0 0 24 44Z" />
    </Svg>
  );
}