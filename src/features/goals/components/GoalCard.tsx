import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Goal } from '../types';
import { Card } from '../../../shared/components/ui/Card';
import { ProgressBar } from '../../../shared/components/ui/ProgressBar';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../../shared/constants/theme';

const PERIOD_LABEL: Record<string, string> = {
  daily: 'День',
  weekly: 'Неделя',
  monthly: 'Месяц',
  yearly: 'Год',
};

interface GoalCardProps {
  goal: Goal;
  total: number;
  percentage: number;
  onEdit: () => void;
  onDelete: () => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  total,
  percentage,
  onEdit,
  onDelete,
}) => {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Ionicons name={goal.exerciseIcon as any} size={22} color={COLORS.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{goal.exerciseName}</Text>
          <Text style={styles.period}>{PERIOD_LABEL[goal.period]}</Text>
        </View>
        <TouchableOpacity onPress={onEdit} style={styles.action}>
          <Ionicons name="pencil" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.action}>
          <Ionicons name="trash" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.current}>{total}</Text>
        <Text style={styles.divider}> / </Text>
        <Text style={styles.target}>{goal.targetReps}</Text>
        <Text style={styles.unit}> повт</Text>
      </View>

      <ProgressBar progress={percentage} height={10} />

      {percentage >= 100 && (
        <View style={styles.badge}>
          <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
          <Text style={styles.badgeText}>Цель достигнута! 🎉</Text>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  name: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  period: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  action: { padding: SPACING.xs },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  current: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primary,
  },
  divider: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textMuted,
  },
  target: {
    fontSize: FONT_SIZE.lg,
    color: COLORS.textSecondary,
  },
  unit: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  badgeText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.success,
    fontWeight: FONT_WEIGHT.medium,
  },
});
