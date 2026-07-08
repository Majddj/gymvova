import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Goal, GoalPeriod } from '../types';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../../shared/constants/theme';
import { DEFAULT_EXERCISES } from '../../../shared/constants/exercises';

const PERIODS: { value: GoalPeriod; label: string }[] = [
  { value: 'daily',   label: 'На день' },
  { value: 'weekly',  label: 'На неделю' },
  { value: 'monthly', label: 'На месяц' },
  { value: 'yearly',  label: 'На год' },
];

interface SetGoalModalProps {
  visible: boolean;
  editingGoal?: Goal | null;
  onClose: () => void;
  onSave: (
    exerciseId: string,
    exerciseName: string,
    exerciseIcon: string,
    targetReps: number,
    period: GoalPeriod
  ) => void;
}

export const SetGoalModal: React.FC<SetGoalModalProps> = ({
  visible, editingGoal, onClose, onSave,
}) => {
  const [selectedExerciseId, setSelectedExerciseId] = useState(DEFAULT_EXERCISES[0].id);
  const [target, setTarget] = useState('');
  const [period, setPeriod] = useState<GoalPeriod>('monthly');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingGoal) {
      setSelectedExerciseId(editingGoal.exerciseId);
      setTarget(String(editingGoal.targetReps));
      setPeriod(editingGoal.period);
    } else {
      setSelectedExerciseId(DEFAULT_EXERCISES[0].id);
      setTarget('');
      setPeriod('monthly');
    }
    setError('');
  }, [editingGoal, visible]);

  const handleSave = () => {
    const num = parseInt(target, 10);
    if (!target || isNaN(num) || num <= 0) {
      setError('Введите корректное число');
      return;
    }
    const ex = DEFAULT_EXERCISES.find((e) => e.id === selectedExerciseId)!;
    onSave(ex.id, ex.name, ex.icon, num, period);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kv}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{editingGoal ? 'Изменить цель' : 'Новая цель'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Exercise picker */}
          <Text style={styles.label}>Упражнение</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pills}>
            {DEFAULT_EXERCISES.map((ex) => (
              <TouchableOpacity
                key={ex.id}
                onPress={() => setSelectedExerciseId(ex.id)}
                style={[styles.pill, selectedExerciseId === ex.id && styles.pillActive]}
              >
                <Ionicons
                  name={ex.icon as any}
                  size={16}
                  color={selectedExerciseId === ex.id ? COLORS.text : COLORS.textSecondary}
                />
                <Text style={[styles.pillText, selectedExerciseId === ex.id && styles.pillTextActive]}>
                  {ex.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Target */}
          <Input
            label="Цель (повторений / секунд)"
            value={target}
            onChangeText={(v) => { setTarget(v); setError(''); }}
            keyboardType="numeric"
            placeholder="Например: 1000"
            error={error}
          />

          {/* Period */}
          <Text style={[styles.label, { marginTop: SPACING.md }]}>Период</Text>
          <View style={styles.periodRow}>
            {PERIODS.map((p) => (
              <TouchableOpacity
                key={p.value}
                onPress={() => setPeriod(p.value)}
                style={[styles.periodBtn, period === p.value && styles.periodBtnActive]}
              >
                <Text style={[styles.periodText, period === p.value && styles.periodTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <Button title="Отмена" onPress={onClose} variant="secondary" style={styles.btn} />
            <Button title={editingGoal ? 'Сохранить' : 'Создать'} onPress={handleSave} style={styles.btn} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  kv: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  label: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.medium },
  pills: { flexDirection: 'row', marginVertical: SPACING.xs },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: SPACING.xs, paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1, borderColor: COLORS.border,
    marginRight: SPACING.sm, backgroundColor: COLORS.surfaceLight,
  },
  pillActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  pillText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  pillTextActive: { color: COLORS.text, fontWeight: FONT_WEIGHT.semibold },
  periodRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  periodBtn: {
    flex: 1, paddingVertical: SPACING.sm, alignItems: 'center',
    borderRadius: BORDER_RADIUS.md, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.surfaceLight,
  },
  periodBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  periodText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  periodTextActive: { color: COLORS.text, fontWeight: FONT_WEIGHT.semibold },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.md },
  btn: { flex: 1 },
});
