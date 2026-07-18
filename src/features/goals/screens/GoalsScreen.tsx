import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../../shared/components/layout/Screen';
import { Button } from '../../../shared/components/ui/Button';
import { GoalCard } from '../components/GoalCard';
import { SetGoalModal } from '../components/SetGoalModal';
import { useGoals } from '../hooks/useGoals';
import { Goal, GoalPeriod } from '../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../../../shared/constants/theme';

export const GoalsScreen: React.FC = () => {
  const { goals, getProgressForGoal, handleAddGoal, handleEditGoal, handleDeleteGoal } = useGoals();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const openAdd = () => { setEditingGoal(null); setModalVisible(true); };
  const openEdit = (goal: Goal) => { setEditingGoal(goal); setModalVisible(true); };

  const confirmDelete = (goalId: string) => {
    Alert.alert('Удалить цель?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => handleDeleteGoal(goalId) },
    ]);
  };

  const handleSave = (
    exerciseId: string, exerciseName: string,
    exerciseIcon: string, targetReps: number, period: GoalPeriod
  ) => {
    if (editingGoal) {
      handleEditGoal(editingGoal, targetReps, period);
    } else {
      handleAddGoal(exerciseId, exerciseName, exerciseIcon, targetReps, period);
    }
  };

  const goalsText = "🎯 Мой прогресс по целям:\n\n" + 
  goals.map((goal) => {
    const { total, percentage } = getProgressForGoal(goal);
    return `💪 ${goal.exerciseName}: ${Math.round(percentage)}% (${total} из ${goal.targetReps} повт.)`;
  }).join('\n');


  return (
    <Screen>
      <View style={styles.titleRow}>
        <View>
          <Text style={styles.heading}>Мои цели</Text>
          <Text style={styles.sub}>{goals.length} активных целей</Text>
        </View>
        <Button title="+ Цель" onPress={openAdd} size="sm" />
      </View>

      {goals.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="flag-outline" size={60} color={COLORS.textMuted} />
          <Text style={styles.emptyTitle}>Нет целей</Text>
          <Text style={styles.emptySub}>Поставь первую цель и начни отслеживать прогресс</Text>
          <Button title="Поставить цель" onPress={openAdd} style={styles.emptyBtn} />
        </View>
      ) : (
        <FlatList
          data={goals}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const { total, percentage } = getProgressForGoal(item);
            return (
              <GoalCard
                goal={item}
                total={total}
                percentage={percentage}
                onEdit={() => openEdit(item)}
                onDelete={() => confirmDelete(item.id)}
              />
            );
          }}
          scrollEnabled={false}
        />
      )}

      <SetGoalModal
        visible={modalVisible}
        editingGoal={editingGoal}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SPACING.lg,
  },
  heading: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  sub: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: SPACING.xxl, gap: SPACING.sm },
  emptyTitle: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  emptySub: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, textAlign: 'center' },
  emptyBtn: { marginTop: SPACING.md, paddingHorizontal: SPACING.xl },
});
