import { format, isToday, isYesterday, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { GoalPeriod } from '../../features/goals/types';

export const getTodayString = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

export const formatDate = (dateStr: string): string => {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Сегодня';
  if (isYesterday(date)) return 'Вчера';
  return format(date, 'd MMMM yyyy', { locale: ru });
};

export const formatDateShort = (dateStr: string): string => {
  return format(parseISO(dateStr), 'd MMM', { locale: ru });
};

export const formatTime = (isoString: string): string => {
  return format(parseISO(isoString), 'HH:mm');
};

export const getPeriodRange = (period: GoalPeriod): { start: string; end: string } => {
  const now = new Date();
  let start: Date;
  let end: Date;

  switch (period) {
    case 'daily':
      start = now;
      end = now;
      break;
    case 'weekly':
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
      break;
    case 'monthly':
      start = startOfMonth(now);
      end = endOfMonth(now);
      break;
    case 'yearly':
      start = startOfYear(now);
      end = endOfYear(now);
      break;
  }

  return {
    start: format(start, 'yyyy-MM-dd'),
    end: format(end, 'yyyy-MM-dd'),
  };
};

export const isDateInRange = (dateStr: string, start: string, end: string): boolean => {
  const date = parseISO(dateStr);
  return isWithinInterval(date, {
    start: parseISO(start),
    end: parseISO(end),
  });
};
