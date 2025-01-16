// This file is a fallback for using MaterialIcons on Android and web.

import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import type { MaterialIcons as MaterialIconsType } from '@expo/vector-icons/MaterialIcons';

export type IconType = keyof typeof MaterialIconsType.glyphMap;

interface IconSymbolProps {
  name: IconType;
  size?: number;
  color?: string;
}

export const IconSymbol: React.FC<IconSymbolProps> = ({
  name,
  size = 24,
  color = '#000'
}) => {
  return <MaterialIcons name={name} size={size} color={color} />;
};
