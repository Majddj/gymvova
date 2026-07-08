import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE } from '../../constants/theme';

interface ProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
  height?: number;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  showLabel = true,
  height = 8,
  color,
}) => {
  const clamped = Math.min(Math.max(progress, 0), 100);

  const getColor = () => {
    if (color) return color;
    if (clamped < 30) return COLORS.danger;
    if (clamped < 70) return COLORS.warning;
    return COLORS.success;
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            { width: `${clamped}%`, backgroundColor: getColor(), height },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.label}>{Math.round(clamped)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  track: {
    flex: 1,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: BORDER_RADIUS.full,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    minWidth: 36,
    textAlign: 'right',
  },
});
