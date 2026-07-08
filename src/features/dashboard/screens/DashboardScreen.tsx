import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { Screen } from '../../../shared/components/layout/Screen';
import { Card } from '../../../shared/components/ui/Card';
import { ProgressBar } from '../../../shared/components/ui/ProgressBar';
import { LogWorkoutModal } from '../../exercises/components/LogWorkoutModal';
import { useExercises } from '../../exercises/hooks/useExercises';
import { useGoals } from '../../goals/hooks/useGoals';
import { Exercise } from '../../exercises/types';
import { formatDate, getTodayString, getPeriodRange } from '../../../shared/utils/dateUtils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../../../shared/constants/theme';

export const DashboardScreen: React.FC = () => {
  const { exercises, logs, todayLogs, handleAddLog, handleEditLog, handleDeleteLog } = useExercises();
  const { goals, getProgressForGoal } = useGoals();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineReps, setInlineReps] = useState('');
  const [inlineSets, setInlineSets] = useState('');
  const [inlineNote, setInlineNote] = useState('');
  const [chartPeriod, setChartPeriod] = useState<'week' | 'month' | 'year'>('week');

  const activeGoals = goals.slice(0, 3);
  const screenWidth = Dimensions.get('window').width - 40;

  const totalToday = todayLogs.reduce((sum, l) => sum + l.reps * l.sets, 0);
  const setsToday = todayLogs.reduce((sum, l) => sum + l.sets, 0);

  const { chartData, maxValue } = useMemo(() => {
    let days: Date[] = [];
    let dayLabels: string[] = [];

    if (chartPeriod === 'week') {
      dayLabels = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
      days = Array.from({ length: 7 }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return date;
      });
    } else if (chartPeriod === 'month') {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      dayLabels = Array.from({ length: daysInMonth }, (_, i) => {
        const date = new Date(now.getFullYear(), now.getMonth(), i + 1);
        return i % 3 === 0 ? `${i + 1}` : '';
      });
      days = Array.from({ length: daysInMonth }, (_, i) => {
        return new Date(now.getFullYear(), now.getMonth(), i + 1);
      });
    } else if (chartPeriod === 'year') {
      const monthLabels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
      dayLabels = monthLabels;
      const now = new Date();
      days = Array.from({ length: 12 }, (_, i) => {
        return new Date(now.getFullYear(), i, 1);
      });
    }

    const data = days.map((date, index) => {
      let value = 0;
      if (chartPeriod === 'week' || chartPeriod === 'month') {
        const dayKey = date.toISOString().slice(0, 10);
        value = logs
          .filter((log) => log.date === dayKey)
          .reduce((sum, log) => sum + log.reps * log.sets, 0);
      } else if (chartPeriod === 'year') {
        const year = date.getFullYear();
        const month = date.getMonth();
        value = logs
          .filter((log) => {
            const logDate = new Date(log.date);
            return logDate.getFullYear() === year && logDate.getMonth() === month;
          })
          .reduce((sum, log) => sum + log.reps * log.sets, 0);
      }

      return {
        value: Math.round(value),
        label: dayLabels[index] || '',
        labelTextStyle: { color: COLORS.textSecondary, fontSize: FONT_SIZE.xs },
      };
    });

    // Вычисляем максимум с буфером (25%), чтобы график не прыгал
    const maxDataValue = Math.max(...data.map((d) => d.value), 1);
    const calculatedMax = Math.ceil(maxDataValue * 1.25 / 10) * 10;

    return { chartData: data, maxValue: calculatedMax };
  }, [logs, chartPeriod]);

  const openQuickLog = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setEditingLog(null);
    setModalVisible(true);
  };

  const openEdit = (log: any) => {
    setEditingLog(log);
    setSelectedExercise(exercises.find((item) => item.id === log.exerciseId) ?? null);
    setModalVisible(true);
  };

  const startInlineEdit = (log: any) => {
    setInlineEditId(log.id);
    setInlineReps(String(log.reps));
    setInlineSets(String(log.sets));
    setInlineNote(log.note ?? '');
  };

  const saveInlineEdit = (log: any) => {
    const repsNum = parseInt(inlineReps, 10);
    const setsNum = parseInt(inlineSets, 10);

    if (!inlineReps || isNaN(repsNum) || repsNum <= 0) {
      Alert.alert('Ошибка', 'Введите корректное количество повторений');
      return;
    }

    handleEditLog(log, repsNum, setsNum || 1, inlineNote.trim(), log.date);
    setInlineEditId(null);
  };

  const confirmDelete = (logId: string) => {
    Alert.alert('Удалить запись?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => handleDeleteLog(logId) },
    ]);
  };

  return (
    <Screen>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>VOVA</Text>
          <Text style={styles.greeting}>Привет, Атлет! 💪</Text>
          <Text style={styles.date}>{formatDate(getTodayString())}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={18} color={COLORS.warning} />
          <Text style={styles.streakText}>{new Set(todayLogs.map((l) => l.date)).size > 0 ? '🔥' : '—'}</Text>
        </View>
      </View>

      {/* Today stats */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={styles.statNum}>{totalToday}</Text>
          <Text style={styles.statLabel}>Повторений</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNum}>{setsToday}</Text>
          <Text style={styles.statLabel}>Подходов</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statNum}>{todayLogs.length}</Text>
          <Text style={styles.statLabel}>Записей</Text>
        </Card>
      </View>

      <Card style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Text style={styles.sectionTitle}>
            {chartPeriod === 'week' ? 'Прогресс за неделю' : chartPeriod === 'month' ? 'Прогресс за месяц' : 'Прогресс за год'}
          </Text>
        </View>
        <View style={styles.periodButtons}>
          <TouchableOpacity
            style={[styles.periodBtn, chartPeriod === 'week' && styles.periodBtnActive]}
            onPress={() => setChartPeriod('week')}
          >
            <Text style={[styles.periodBtnText, chartPeriod === 'week' && styles.periodBtnTextActive]}>Неделя</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodBtn, chartPeriod === 'month' && styles.periodBtnActive]}
            onPress={() => setChartPeriod('month')}
          >
            <Text style={[styles.periodBtnText, chartPeriod === 'month' && styles.periodBtnTextActive]}>Месяц</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodBtn, chartPeriod === 'year' && styles.periodBtnActive]}
            onPress={() => setChartPeriod('year')}
          >
            <Text style={[styles.periodBtnText, chartPeriod === 'year' && styles.periodBtnTextActive]}>Год</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={screenWidth}
            height={150}
            hideDataPoints={false}
            dataPointsRadius={4}
            dataPointsColor={COLORS.primary}
            color={COLORS.primary}
            startFillColor={COLORS.primary}
            endFillColor={'rgba(44, 132, 99, 0.1)'}
            startOpacity={0.3}
            endOpacity={0}
            yAxisTextStyle={{ color: COLORS.textSecondary, fontSize: FONT_SIZE.xs }}
            xAxisColor={COLORS.border}
            yAxisColor={COLORS.border}
            showVerticalLines
            verticalLinesColor={`${COLORS.border}33`}
            noOfSections={5}
            animationDuration={1000}
            maxValue={maxValue}
            showXAxisIndices={false}
          />
        </View>
      </Card>

      {/* Quick log */}
      <Text style={styles.sectionTitle}>Быстрый старт</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
        {exercises.slice(0, 5).map((ex) => (
          <TouchableOpacity
            key={ex.id}
            onPress={() => openQuickLog(ex)}
            style={styles.quickBtn}
          >
            <View style={styles.quickIcon}>
              <Ionicons name={ex.icon as any} size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.quickLabel} numberOfLines={2}>{ex.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Active goals */}
      {activeGoals.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Активные цели</Text>
          {activeGoals.map((goal) => {
            const { total, percentage } = getProgressForGoal(goal);
            return (
              <Card key={goal.id} style={styles.goalCard}>
                <View style={styles.goalHeader}>
                  <Ionicons name={goal.exerciseIcon as any} size={18} color={COLORS.primary} />
                  <Text style={styles.goalName}>{goal.exerciseName}</Text>
                  <Text style={styles.goalPct}>{Math.round(percentage)}%</Text>
                </View>
                <ProgressBar progress={percentage} height={6} showLabel={false} />
                <Text style={styles.goalCount}>{total} / {goal.targetReps} повт</Text>
              </Card>
            );
          })}
        </>
      )}

      {/* Recent logs */}
      {todayLogs.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Сегодня</Text>
          {[...todayLogs].reverse().slice(0, 5).map((log) => {
            const isEditing = inlineEditId === log.id;

            return (
              <Card key={log.id} style={styles.logItem}>
                <View style={styles.logMain}>
                  <View style={styles.logInfo}>
                    <Text style={styles.logName}>{log.exerciseName}</Text>
                    {isEditing ? (
                      <View style={styles.inlineEditBlock}>
                        <View style={styles.inlineInputRow}>
                          <TextInput
                            value={inlineReps}
                            onChangeText={setInlineReps}
                            keyboardType="numeric"
                            style={styles.inlineInput}
                            placeholder="повт"
                          />
                          <Text style={styles.inlineSep}>×</Text>
                          <TextInput
                            value={inlineSets}
                            onChangeText={setInlineSets}
                            keyboardType="numeric"
                            style={styles.inlineInput}
                            placeholder="подх"
                          />
                        </View>
                        <TextInput
                          value={inlineNote}
                          onChangeText={setInlineNote}
                          style={styles.inlineNoteInput}
                          placeholder="Заметка"
                          multiline
                        />
                      </View>
                    ) : (
                      <>
                        <Text style={styles.logValue}>{log.reps} × {log.sets}</Text>
                        {log.note ? <Text style={styles.logNote}>{log.note}</Text> : null}
                      </>
                    )}
                  </View>
                  <View style={styles.logActions}>
                    {isEditing ? (
                      <TouchableOpacity onPress={() => saveInlineEdit(log)} style={styles.iconBtn}>
                        <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => startInlineEdit(log)} style={styles.iconBtn}>
                        <Ionicons name="pencil" size={16} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => confirmDelete(log.id)} style={styles.iconBtn}>
                      <Ionicons name="trash" size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            );
          })}
        </>
      )}

      <LogWorkoutModal
        visible={modalVisible}
        exercise={selectedExercise}
        editingLog={editingLog}
        onClose={() => {
          setModalVisible(false);
          setEditingLog(null);
        }}
        onSave={(reps, sets, note, date) => {
          if (editingLog) {
            handleEditLog(editingLog, reps, sets, note, date);
          } else if (selectedExercise) {
            handleAddLog(selectedExercise, reps, sets, note, date);
          }
        }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.lg },
  logo: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary, marginBottom: SPACING.xs },
  greeting: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  date: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  streakBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.surfaceLight, padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
  },
  streakText: { fontSize: FONT_SIZE.md, color: COLORS.text },
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard: { flex: 1, alignItems: 'center', padding: SPACING.md },
  statNum: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  sectionTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text, marginBottom: SPACING.sm },
  chartCard: { marginBottom: SPACING.lg, paddingVertical: SPACING.sm, paddingHorizontal: SPACING.sm, overflow: 'hidden' },
  chartHeader: { marginBottom: SPACING.sm },
  periodButtons: { flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.md },
  periodBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
  },
  periodBtnActive: {
    backgroundColor: COLORS.primary,
  },
  periodBtnText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  periodBtnTextActive: {
    color: COLORS.surface,
    fontWeight: FONT_WEIGHT.bold,
  },
  chartContainer: { alignItems: 'center', marginTop: 0, overflow: 'hidden' },
  quickRow: { marginBottom: SPACING.lg, marginTop: SPACING.lg },
  quickBtn: { alignItems: 'center', marginRight: SPACING.md, width: 72 },
  quickIcon: {
    width: 56, height: 56, borderRadius: BORDER_RADIUS.lg,
    backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  quickLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, textAlign: 'center' },
  goalCard: { marginBottom: SPACING.sm, gap: SPACING.xs },
  goalHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  goalName: { flex: 1, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium, color: COLORS.text },
  goalPct: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  goalCount: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
  logItem: { marginBottom: SPACING.sm },
  logMain: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: SPACING.sm },
  logInfo: { flex: 1 },
  logName: { fontSize: FONT_SIZE.md, color: COLORS.text },
  logValue: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary, marginTop: 4 },
  logNote: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 4, fontStyle: 'italic' },
  logActions: { flexDirection: 'row', gap: SPACING.xs },
  iconBtn: { padding: SPACING.xs },
  inlineEditBlock: { gap: SPACING.xs, marginTop: 4 },
  inlineInputRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  inlineInput: {
    flex: 1,
    minWidth: 54,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    color: COLORS.text,
    backgroundColor: COLORS.surfaceLight,
  },
  inlineSep: { color: COLORS.textSecondary },
  inlineNoteInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    color: COLORS.text,
    backgroundColor: COLORS.surfaceLight,
    minHeight: 48,
  },
});
