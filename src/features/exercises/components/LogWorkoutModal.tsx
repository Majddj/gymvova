import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
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
import { Exercise, WorkoutLog } from '../types';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZE, FONT_WEIGHT } from '../../../shared/constants/theme';
import { formatDate, getTodayString } from '../../../shared/utils/dateUtils';

interface LogWorkoutModalProps {
  visible: boolean;
  exercise: Exercise | null;
  editingLog?: WorkoutLog | null;
  onClose: () => void;
  onSave: (reps: number, sets: number, note: string, date?: string) => void;
}

export const LogWorkoutModal: React.FC<LogWorkoutModalProps> = ({
  visible,
  exercise,
  editingLog,
  onClose,
  onSave,
}) => {
  const [reps, setReps] = useState('');
  const [sets, setSets] = useState('1');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const nextDate = editingLog?.date ?? getTodayString();
    setSelectedDate(nextDate);
    setCalendarMonth(parseISO(nextDate));
    setShowCalendar(false);
    if (editingLog) {
      setReps(String(editingLog.reps));
      setSets(String(editingLog.sets));
      setNote(editingLog.note);
    } else {
      setReps('');
      setSets('1');
      setNote('');
    }
    setError('');
  }, [editingLog, visible]);

  const handleSave = () => {
    const repsNum = parseInt(reps, 10);
    const setsNum = parseInt(sets, 10);
    if (!reps || isNaN(repsNum) || repsNum <= 0) {
      setError('Введите корректное количество повторений');
      return;
    }
    onSave(repsNum, setsNum || 1, note.trim(), selectedDate);
    onClose();
  };

  const calendarDays = (() => {
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
    }));
  })();

  if (!exercise) return null;

  const unitLabel = exercise.unit === 'seconds' ? 'секунд' : 'повторений';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kvContainer}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {editingLog ? 'Редактировать' : 'Добавить запись'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.exerciseName}>{exercise.name}</Text>

          <TouchableOpacity style={styles.dateRow} onPress={() => setShowCalendar((value) => !value)}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
            <Ionicons name={showCalendar ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {showCalendar && (
            <View style={styles.calendarBox}>
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
                    onPress={() => {
                      setSelectedDate(day.value);
                      setCalendarMonth(parseISO(day.value));
                    }}
                  >
                    <Text style={[styles.dayText, !day.isCurrentMonth && styles.dayTextMuted, day.isSelected && styles.dayTextSelected]}>
                      {day.dayNumber}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Input
            label={`Количество ${unitLabel}`}
            value={reps}
            onChangeText={(v) => { setReps(v); setError(''); }}
            keyboardType="numeric"
            placeholder={`Введите ${unitLabel}`}
            error={error}
          />

          <Input
            label="Подходы"
            value={sets}
            onChangeText={setSets}
            keyboardType="numeric"
            placeholder="1"
            style={{ marginTop: SPACING.md }}
          />

          <Input
            label="Заметка (необязательно)"
            value={note}
            onChangeText={setNote}
            placeholder="Как прошло?"
            multiline
            style={{ marginTop: SPACING.md }}
          />

          <View style={styles.actions}>
            <Button
              title="Отмена"
              onPress={onClose}
              variant="secondary"
              style={styles.actionBtn}
            />
            <Button
              title={editingLog ? 'Сохранить' : 'Добавить'}
              onPress={handleSave}
              style={styles.actionBtn}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  kvContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  exerciseName: {
    fontSize: FONT_SIZE.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: SPACING.sm,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  dateText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  calendarBox: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    gap: SPACING.xs,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  calendarMonth: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
    marginBottom: 4,
  },
  dayCellMuted: {
    opacity: 0.4,
  },
  dayCellSelected: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  dayTextMuted: {
    color: COLORS.textMuted,
  },
  dayTextSelected: {
    color: COLORS.surface,
    fontWeight: FONT_WEIGHT.bold,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionBtn: {
    flex: 1,
  },
});
