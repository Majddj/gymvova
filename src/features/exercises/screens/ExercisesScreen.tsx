import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { Screen } from '../../../shared/components/layout/Screen';
import { ExerciseCard } from '../components/ExerciseCard';
import { LogWorkoutModal } from '../components/LogWorkoutModal';
import { useExercises } from '../hooks/useExercises';
import { Exercise, WorkoutLog } from '../types';

import {
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  SPACING,
} from '../../../shared/constants/theme';

export const ExercisesScreen: React.FC = () => {
  const {
    exercises,
    todayLogs,
    handleAddLog,
    handleEditLog,
  } = useExercises();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] =
    useState<Exercise | null>(null);
  const [editingLog, setEditingLog] =
    useState<WorkoutLog | null>(null);

  const getTotalForExercise = (exerciseId: string) =>
    todayLogs
      .filter((log) => log.exerciseId === exerciseId)
      .reduce((sum, log) => sum + log.reps * log.sets, 0);

  const openAdd = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setEditingLog(null);
    setModalVisible(true);
  };

  const handleSave = (
    reps: number,
    sets: number,
    note: string,
    date?: string,
  ) => {
    if (!selectedExercise) {
      return;
    }

    if (editingLog) {
      handleEditLog(editingLog, reps, sets, note, date);
    } else {
      handleAddLog(selectedExercise, reps, sets, note, date);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 300 }} 
    >
    <Screen>
      <Text style={styles.heading}>Упражнения</Text>

      <Text style={styles.sub}>
        Нажми на упражнение, чтобы добавить результат
      </Text>

      <View style={styles.list}>
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            totalToday={getTotalForExercise(exercise.id)}
            onPress={() => openAdd(exercise)}
          />
        ))}
      </View>

      <LogWorkoutModal
        visible={modalVisible}
        exercise={selectedExercise}
        editingLog={editingLog}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </Screen>
    </ScrollView>
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