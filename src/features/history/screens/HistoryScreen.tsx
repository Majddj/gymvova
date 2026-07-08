import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  addMonths,
  endOfMonth,
  eachDayOfInterval,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import { Screen } from '../../../shared/components/layout/Screen';
import { Card } from '../../../shared/components/ui/Card';
import { LogWorkoutModal } from '../../exercises/components/LogWorkoutModal';
import { useExercises } from '../../exercises/hooks/useExercises';
import { WorkoutLog } from '../../exercises/types';
import { formatDate, formatTime, getTodayString } from '../../../shared/utils/dateUtils';
import { COLORS, SPACING, FONT_SIZE, FONT_WEIGHT, BORDER_RADIUS } from '../../../shared/constants/theme';

export const HistoryScreen: React.FC = () => {
  const { logs, exercises, handleEditLog, handleDeleteLog } = useExercises();

  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [editingLog, setEditingLog] = useState<WorkoutLog | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineReps, setInlineReps] = useState('');
  const [inlineSets, setInlineSets] = useState('');
  const [inlineNote, setInlineNote] = useState('');

  const selectedDateLogs = useMemo(() => {
    return [...logs]
      .filter((log) => log.date === selectedDate)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [logs, selectedDate]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start, end }).map((day) => ({
      key: format(day, 'yyyy-MM-dd'),
      value: format(day, 'yyyy-MM-dd'),
      dayNumber: day.getDate(),
      isCurrentMonth: isSameMonth(day, calendarMonth),
      isSelected: isSameDay(day, parseISO(selectedDate)),
      hasLogs: logs.some((log) => log.date === format(day, 'yyyy-MM-dd')),
    }));
  }, [calendarMonth, logs, selectedDate]);

  const openEdit = (log: WorkoutLog) => {
    setEditingLog(log);
    setModalVisible(true);
  };

  const startInlineEdit = (log: WorkoutLog) => {
    setInlineEditId(log.id);
    setInlineReps(String(log.reps));
    setInlineSets(String(log.sets));
    setInlineNote(log.note ?? '');
  };

  const saveInlineEdit = (log: WorkoutLog) => {
    const repsNum = parseInt(inlineReps, 10);
    const setsNum = parseInt(inlineSets, 10);

    if (!inlineReps || isNaN(repsNum) || repsNum <= 0) {
      Alert.alert('Ошибка', 'Введите корректное количество повторений');
      return;
    }

    handleEditLog(log, repsNum, setsNum || 1, inlineNote.trim(), log.date);
    setInlineEditId(null);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingLog(null);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setCalendarMonth(parseISO(date));
  };

  const moveDate = (offset: number) => {
    const next = new Date(parseISO(selectedDate));
    next.setDate(next.getDate() + offset);
    handleSelectDate(format(next, 'yyyy-MM-dd'));
  };

  const confirmDelete = (logId: string) => {
    Alert.alert('Удалить запись?', 'Это действие нельзя отменить.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Удалить', style: 'destructive', onPress: () => handleDeleteLog(logId) },
    ]);
  };

  const getExercise = (exerciseId: string) =>
    exercises.find((e) => e.id === exerciseId) ?? null;

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>История</Text>
        <Text style={styles.sub}>{logs.length} всего записей</Text>

        <View style={styles.navRow}>
          <TouchableOpacity style={styles.navButton} onPress={() => moveDate(-1)}>
            <Ionicons name="chevron-back" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <View style={styles.navCenter}>
            <Text style={styles.navDate}>{formatDate(selectedDate)}</Text>
            <Text style={styles.navCount}>{selectedDateLogs.length} записей</Text>
          </View>
          <TouchableOpacity style={styles.navButton} onPress={() => moveDate(1)}>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.todayButton} onPress={() => handleSelectDate(getTodayString())}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
          <Text style={styles.todayButtonText}>Сегодня</Text>
        </TouchableOpacity>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setCalendarMonth(subMonths(calendarMonth, 1))}>
              <Ionicons name="chevron-back" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.calendarMonth}>{format(calendarMonth, 'LLLL yyyy', { locale: ru })}</Text>
            <TouchableOpacity onPress={() => setCalendarMonth(addMonths(calendarMonth, 1))}>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.weekRow}>
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((item) => (
              <Text key={item} style={styles.weekDay}>{item}</Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map((day) => (
              <TouchableOpacity
                key={day.key}
                style={[styles.dayCell, !day.isCurrentMonth && styles.dayCellMuted, day.isSelected && styles.dayCellSelected]}
                onPress={() => handleSelectDate(day.value)}
              >
                <Text style={[styles.dayText, !day.isCurrentMonth && styles.dayTextMuted, day.isSelected && styles.dayTextSelected]}>
                  {day.dayNumber}
                </Text>
                {day.hasLogs ? <View style={styles.dayDot} /> : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedDateLogs.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="time-outline" size={60} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Нет записей</Text>
            <Text style={styles.emptySub}>В этот день ещё нет тренировок</Text>
          </View>
        ) : (
          <View style={styles.listSection}>
            {selectedDateLogs.map((log) => {
              const isEditing = inlineEditId === log.id;

              return (
                <Card key={log.id} style={styles.logCard}>
                  <View style={styles.logHeader}>
                    <View style={styles.logIconBox}>
                      <Ionicons
                        name={(getExercise(log.exerciseId)?.icon ?? 'fitness') as any}
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>
                    <View style={styles.logInfo}>
                      <Text style={styles.logName}>{log.exerciseName}</Text>
                      <Text style={styles.logTime}>{formatTime(log.createdAt)}</Text>
                    </View>
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
                      <View style={styles.logStats}>
                        <Text style={styles.logReps}>{log.reps}</Text>
                        <Text style={styles.logSets}>× {log.sets} подх.</Text>
                      </View>
                    )}
                    {isEditing ? (
                      <TouchableOpacity onPress={() => saveInlineEdit(log)} style={styles.action}>
                        <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => startInlineEdit(log)} style={styles.action}>
                        <Ionicons name="pencil" size={16} color={COLORS.textSecondary} />
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => confirmDelete(log.id)} style={styles.action}>
                      <Ionicons name="trash" size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                  {!isEditing && (log.note ? <Text style={styles.note}>{log.note}</Text> : null)}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>

      <LogWorkoutModal
        visible={modalVisible}
        exercise={editingLog ? getExercise(editingLog.exerciseId) : null}
        editingLog={editingLog}
        onClose={handleCloseModal}
        onSave={(reps, sets, note, date) => {
          if (editingLog) handleEditLog(editingLog, reps, sets, note, date);
        }}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: SPACING.xxl },
  heading: { fontSize: FONT_SIZE.xxl, fontWeight: FONT_WEIGHT.bold, color: COLORS.text, marginBottom: SPACING.xs },
  sub: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginBottom: SPACING.lg },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  navButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center' },
  navCenter: { flex: 1, alignItems: 'center' },
  navDate: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  navCount: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  todayButton: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.md, alignSelf: 'flex-start' },
  todayButtonText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: FONT_WEIGHT.semibold },
  calendarCard: { backgroundColor: COLORS.surface, borderRadius: BORDER_RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.lg },
  calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.sm },
  calendarMonth: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text, textTransform: 'capitalize' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xs },
  weekDay: { flex: 1, textAlign: 'center', fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: BORDER_RADIUS.sm, marginBottom: 4 },
  dayCellMuted: { opacity: 0.4 },
  dayCellSelected: { backgroundColor: COLORS.primary },
  dayText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  dayTextMuted: { color: COLORS.textMuted },
  dayTextSelected: { color: COLORS.surface, fontWeight: FONT_WEIGHT.bold },
  dayDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: COLORS.primary, marginTop: 2 },
  empty: { alignItems: 'center', paddingTop: SPACING.xxl, gap: SPACING.sm },
  emptyTitle: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  emptySub: { fontSize: FONT_SIZE.md, color: COLORS.textSecondary, textAlign: 'center' },
  listSection: { gap: SPACING.sm },
  logCard: { marginBottom: SPACING.sm, gap: SPACING.xs },
  logHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  logIconBox: {
    width: 36, height: 36, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center',
  },
  logInfo: { flex: 1 },
  logName: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.medium, color: COLORS.text },
  logTime: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  logStats: { alignItems: 'flex-end' },
  logReps: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.primary },
  logSets: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  inlineEditBlock: { flex: 1, gap: SPACING.xs },
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
  action: { padding: SPACING.xs },
  note: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, fontStyle: 'italic' },
});
