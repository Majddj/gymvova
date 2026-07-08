import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Screen } from '../../../shared/components/layout/Screen';
import { ExerciseCard } from '../components/ExerciseCard';
import { LogWorkoutModal } from '../components/LogWorkoutModal';
import { useExercises } from '../hooks/useExercises';
import { Exercise, WorkoutLog } from '../types';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '../../../shared/constants/theme';

export const ExercisesScreen: React.FC = () => {
  const { exercises, todayLogs, handleAddLog, handleEditLog } = useExercises();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null);

  const getTotalForExercise = (exerciseId: string) =>
    todayLogs
      .filter((l) => l.exerciseId === exerciseId)
      .reduce((sum, l) => sum + l.reps * l.sets, 0);

  const openAdd = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setEditingLog(null);
    setModalVisible(true);
  };

  const handleSave = (reps: number, sets: number, note: string, date?: string) => {
    if (!selectedExercise) return;
    if (editingLog) {
      handleEditLog(editingLog, reps, sets, note, date);
    } else {
      handleAddLog(selectedExercise, reps, sets, note, date);
    }
  };

  return (
    <Screen>
      <Text style={styles.heading}>Упражнения</Text>
      <Text style={styles.sub}>Нажми на упражнение, чтобы добавить результат</Text>

      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExerciseCard
            exercise={item}
            totalToday={getTotalForExercise(item.id)}
            onPress={() => openAdd(item)}
          />
        )}
        scrollEnabled={false}
        style={styles.list}
      />

      <LogWorkoutModal
        visible={modalVisible}
        exercise={selectedExercise}
        editingLog={editingLog}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  heading: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  list: {
    marginTop: SPACING.sm,
  },
});
