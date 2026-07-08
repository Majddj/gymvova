import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Exercise } from '../types';
import { Card } from '../../../shared/components/ui/Card';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../../shared/constants/theme';

interface ExerciseCardProps {
  exercise: Exercise;
  totalToday: number;
  onPress: () => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  totalToday,
  onPress,
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <View style={styles.iconBox}>
          <Ionicons name={exercise.icon as any} size={28} color={COLORS.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{exercise.name}</Text>
          <Text style={styles.today}>
            Сегодня:{' '}
            <Text style={styles.count}>
              {totalToday} {exercise.unit === 'seconds' ? 'сек' : 'повт'}
            </Text>
          </Text>
        </View>
        <Ionicons name="add-circle" size={32} color={COLORS.primary} />
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  today: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  count: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
  },
});
