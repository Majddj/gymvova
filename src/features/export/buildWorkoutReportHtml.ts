import {
  format,
  isValid,
  parseISO,
} from 'date-fns';

import { ru } from 'date-fns/locale';

import type {
  Exercise,
  WorkoutLog,
} from '../exercises/types';

import type {
  Goal,
  GoalPeriod,
} from '../goals/types';

interface WorkoutReportParams {
  readonly logs: readonly WorkoutLog[];
  readonly exercises: readonly Exercise[];
  readonly goals: readonly Goal[];
}

interface ExerciseSummary {
  readonly name: string;
  readonly unit: Exercise['unit'];
  records: number;
  sets: number;
  total: number;
}

const PRIMARY_COLOR = '#6C63FF';

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const periodLabels: Record<GoalPeriod, string> = {
  daily: 'Ежедневная цель',
  weekly: 'Еженедельная цель',
  monthly: 'Ежемесячная цель',
  yearly: 'Годовая цель',
};

const formatReportDate = (
  value: string
): string => {
  const parsedDate = parseISO(value);

  if (!isValid(parsedDate)) {
    return escapeHtml(value);
  }

  return format(
    parsedDate,
    'd MMMM yyyy',
    {
      locale: ru,
    }
  );
};

const formatReportTime = (
  value: string
): string => {
  const parsedDate = parseISO(value);

  if (!isValid(parsedDate)) {
    return '';
  }

  return format(parsedDate, 'HH:mm');
};

const getUnitLabel = (
  unit: Exercise['unit'] | undefined
): string => {
  return unit === 'seconds'
    ? 'сек.'
    : 'повт.';
};

export const buildWorkoutReportHtml = ({
  logs,
  exercises,
  goals,
}: WorkoutReportParams): string => {
  /*
   * Все данные только читаются.
   * Перед сортировкой создаётся копия массива.
   * Redux Store и Redux Persist не изменяются.
   */
  const sortedLogs = [...logs].sort(
    (first, second) => {
      const firstValue =
        `${first.date}-${first.createdAt}`;

      const secondValue =
        `${second.date}-${second.createdAt}`;

      return secondValue.localeCompare(
        firstValue
      );
    }
  );

  const exerciseById = new Map(
    exercises.map((exercise) => [
      exercise.id,
      exercise,
    ])
  );

  const logsByDate = sortedLogs.reduce<
    Record<string, WorkoutLog[]>
  >((result, log) => {
    if (!result[log.date]) {
      result[log.date] = [];
    }

    result[log.date].push(log);

    return result;
  }, {});

  const totalSets = logs.reduce(
    (sum, log) =>
      sum + Number(log.sets || 0),
    0
  );

  const totalVolume = logs.reduce(
    (sum, log) =>
      sum +
      Number(log.reps || 0) *
        Number(log.sets || 0),
    0
  );

  const trainingDays = new Set(
    logs.map((log) => log.date)
  ).size;

  const completedGoals = goals.filter(
    (goal) => {
      const completed = logs
        .filter(
          (log) =>
            log.exerciseId ===
              goal.exerciseId &&
            log.date >= goal.startDate &&
            log.date <= goal.endDate
        )
        .reduce(
          (sum, log) =>
            sum +
            Number(log.reps || 0) *
              Number(log.sets || 0),
          0
        );

      return completed >= goal.targetReps;
    }
  ).length;

  const exerciseSummary = logs.reduce<
    Record<string, ExerciseSummary>
  >((result, log) => {
    const exercise = exerciseById.get(
      log.exerciseId
    );

    const key =
      log.exerciseId ||
      log.exerciseName;

    if (!result[key]) {
      result[key] = {
        name: log.exerciseName,
        unit: exercise?.unit ?? 'reps',
        records: 0,
        sets: 0,
        total: 0,
      };
    }

    result[key].records += 1;

    result[key].sets += Number(
      log.sets || 0
    );

    result[key].total +=
      Number(log.reps || 0) *
      Number(log.sets || 0);

    return result;
  }, {});

  const dateTotals = Object.entries(
    logsByDate
  ).map(([date, dateLogs]) => ({
    date,
    total: dateLogs.reduce(
      (sum, log) =>
        sum +
        Number(log.reps || 0) *
          Number(log.sets || 0),
      0
    ),
  }));

  const bestDay =
    dateTotals.length > 0
      ? dateTotals.reduce(
          (best, current) =>
            current.total > best.total
              ? current
              : best
        )
      : null;

  const firstTrainingDate =
    sortedLogs.length > 0
      ? sortedLogs[
          sortedLogs.length - 1
        ].date
      : null;

  const lastTrainingDate =
    sortedLogs.length > 0
      ? sortedLogs[0].date
      : null;

  const reportPeriod =
    firstTrainingDate &&
    lastTrainingDate
      ? `${formatReportDate(
          firstTrainingDate
        )} — ${formatReportDate(
          lastTrainingDate
        )}`
      : 'Нет тренировок';

  const goalsHtml =
    goals.length === 0
      ? `
        <div class="empty-state">
          <div class="empty-icon">—</div>

          <div class="empty-title">
            Цели пока не добавлены
          </div>

          <div class="empty-description">
            После добавления целей здесь
            появится прогресс выполнения.
          </div>
        </div>
      `
      : goals
          .map((goal, index) => {
            const exercise =
              exerciseById.get(
                goal.exerciseId
              );

            const unit = getUnitLabel(
              exercise?.unit
            );

            const goalLogs = logs.filter(
              (log) =>
                log.exerciseId ===
                  goal.exerciseId &&
                log.date >=
                  goal.startDate &&
                log.date <= goal.endDate
            );

            const completed =
              goalLogs.reduce(
                (sum, log) =>
                  sum +
                  Number(
                    log.reps || 0
                  ) *
                    Number(
                      log.sets || 0
                    ),
                0
              );

            const rawPercentage =
              goal.targetReps > 0
                ? (completed /
                    goal.targetReps) *
                  100
                : 0;

            const progressWidth =
              Math.max(
                0,
                Math.min(
                  rawPercentage,
                  100
                )
              );

            const displayedPercentage =
              Math.max(
                0,
                Math.round(rawPercentage)
              );

            const isCompleted =
              completed >= goal.targetReps;

            const statusText =
              isCompleted
                ? 'Выполнена'
                : goal.isActive
                  ? 'Активна'
                  : 'Завершена';

            const statusClass =
              isCompleted
                ? 'status-completed'
                : goal.isActive
                  ? 'status-active'
                  : 'status-inactive';

            return `
              <article class="goal-card">
                <div class="goal-number">
                  ${String(
                    index + 1
                  ).padStart(2, '0')}
                </div>

                <div class="goal-content">
                  <div class="goal-header">
                    <div>
                      <div class="goal-name">
                        ${escapeHtml(
                          goal.exerciseName
                        )}
                      </div>

                      <div class="goal-period">
                        ${
                          periodLabels[
                            goal.period
                          ]
                        }
                      </div>
                    </div>

                    <div
                      class="goal-status ${statusClass}"
                    >
                      ${statusText}
                    </div>
                  </div>

                  <div class="goal-progress-header">
                    <span>
                      Прогресс
                    </span>

                    <strong>
                      ${displayedPercentage}%
                    </strong>
                  </div>

                  <div class="progress-track">
                    <div
                      class="progress-value"
                      style="
                        width:
                        ${progressWidth}%;
                      "
                    ></div>
                  </div>

                  <div class="goal-statistics">
                    <div class="goal-stat">
                      <span>
                        Выполнено
                      </span>

                      <strong>
                        ${completed}
                        ${unit}
                      </strong>
                    </div>

                    <div class="goal-stat">
                      <span>
                        Цель
                      </span>

                      <strong>
                        ${goal.targetReps}
                        ${unit}
                      </strong>
                    </div>

                    <div class="goal-stat">
                      <span>
                        Период
                      </span>

                      <strong>
                        ${formatReportDate(
                          goal.startDate
                        )}
                        —
                        ${formatReportDate(
                          goal.endDate
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              </article>
            `;
          })
          .join('');

  const exerciseSummaryItems =
    Object.values(exerciseSummary)
      .sort(
        (first, second) =>
          second.total - first.total
      );

  const exerciseSummaryHtml =
    exerciseSummaryItems.length === 0
      ? `
        <tr>
          <td
            colspan="5"
            class="table-empty"
          >
            Данных об упражнениях пока нет.
          </td>
        </tr>
      `
      : exerciseSummaryItems
          .map(
            (item, index) => `
              <tr>
                <td class="position-cell">
                  ${index + 1}
                </td>

                <td>
                  <div class="exercise-name">
                    ${escapeHtml(
                      item.name
                    )}
                  </div>
                </td>

                <td>
                  ${item.records}
                </td>

                <td>
                  ${item.sets}
                </td>

                <td>
                  <strong class="accent-value">
                    ${item.total}
                    ${getUnitLabel(
                      item.unit
                    )}
                  </strong>
                </td>
              </tr>
            `
          )
          .join('');

  const historyHtml =
    Object.keys(logsByDate).length === 0
      ? `
        <div class="empty-state">
          <div class="empty-icon">—</div>

          <div class="empty-title">
            История тренировок пуста
          </div>

          <div class="empty-description">
            Записанные тренировки будут
            отображаться в этом разделе.
          </div>
        </div>
      `
      : Object.entries(logsByDate)
          .sort(
            ([firstDate], [secondDate]) =>
              secondDate.localeCompare(
                firstDate
              )
          )
          .map(
            ([date, dateLogs]) => {
              const daySets =
                dateLogs.reduce(
                  (sum, log) =>
                    sum +
                    Number(
                      log.sets || 0
                    ),
                  0
                );

              const dayTotal =
                dateLogs.reduce(
                  (sum, log) =>
                    sum +
                    Number(
                      log.reps || 0
                    ) *
                      Number(
                        log.sets || 0
                      ),
                  0
                );

              const rows = dateLogs
                .map((log) => {
                  const exercise =
                    exerciseById.get(
                      log.exerciseId
                    );

                  const unit =
                    getUnitLabel(
                      exercise?.unit
                    );

                  const total =
                    Number(
                      log.reps || 0
                    ) *
                    Number(
                      log.sets || 0
                    );

                  const note =
                    log.note?.trim()
                      ? `
                        <div class="workout-note">
                          ${escapeHtml(
                            log.note
                          )}
                        </div>
                      `
                      : '';

                  return `
                    <tr>
                      <td>
                        <div class="exercise-name">
                          ${escapeHtml(
                            log.exerciseName
                          )}
                        </div>

                        ${note}
                      </td>

                      <td>
                        <span class="time-badge">
                          ${formatReportTime(
                            log.createdAt
                          )}
                        </span>
                      </td>

                      <td>
                        <strong>
                          ${log.reps}
                        </strong>

                        <span class="multiplication">
                          ×
                        </span>

                        <strong>
                          ${log.sets}
                        </strong>
                      </td>

                      <td>
                        <strong class="accent-value">
                          ${total}
                          ${unit}
                        </strong>
                      </td>
                    </tr>
                  `;
                })
                .join('');

              return `
                <section class="workout-day">
                  <div class="day-header">
                    <div>
                      <div class="day-date">
                        ${formatReportDate(
                          date
                        )}
                      </div>

                      <div class="day-subtitle">
                        Тренировочный день
                      </div>
                    </div>

                    <div class="day-statistics">
                      <div class="day-stat">
                        <strong>
                          ${dateLogs.length}
                        </strong>

                        <span>
                          записей
                        </span>
                      </div>

                      <div class="day-stat">
                        <strong>
                          ${daySets}
                        </strong>

                        <span>
                          подходов
                        </span>
                      </div>

                      <div class="day-stat">
                        <strong>
                          ${dayTotal}
                        </strong>

                        <span>
                          объём
                        </span>
                      </div>
                    </div>
                  </div>

                  <table class="history-table">
                    <thead>
                      <tr>
                        <th>
                          Упражнение
                        </th>

                        <th>
                          Время
                        </th>

                        <th>
                          Значение
                        </th>

                        <th>
                          Итого
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      ${rows}
                    </tbody>
                  </table>
                </section>
              `;
            }
          )
          .join('');

  const createdAt = format(
    new Date(),
    'd MMMM yyyy, HH:mm',
    {
      locale: ru,
    }
  );

  return `
    <!DOCTYPE html>

    <html lang="ru">
      <head>
        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="
            width=device-width,
            initial-scale=1
          "
        />

        <title>
          VOVA — отчёт о тренировках
        </title>

        <style>
          @page {
            size: A4;
            margin: 12mm;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
          }

          body {
            color: #252532;
            background: #ffffff;
            font-family:
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Arial,
              Helvetica,
              sans-serif;
            font-size: 11px;
            line-height: 1.5;
            -webkit-print-color-adjust:
              exact;
            print-color-adjust: exact;
          }

          h1,
          h2,
          h3,
          p {
            margin-top: 0;
          }

          .hero {
            position: relative;
            overflow: hidden;
            padding: 30px;
            margin-bottom: 18px;
            border-radius: 22px;
            color: #ffffff;
            background-color:
              ${PRIMARY_COLOR};
            background-image:
              linear-gradient(
                135deg,
                #5148e5 0%,
                ${PRIMARY_COLOR} 52%,
                #918aff 100%
              );
            page-break-inside: avoid;
          }

          .hero-circle-one,
          .hero-circle-two {
            position: absolute;
            border-radius: 999px;
            background:
              rgba(
                255,
                255,
                255,
                0.12
              );
          }

          .hero-circle-one {
            width: 180px;
            height: 180px;
            top: -90px;
            right: -40px;
          }

          .hero-circle-two {
            width: 100px;
            height: 100px;
            right: 90px;
            bottom: -65px;
          }

          .hero-content {
            position: relative;
            z-index: 2;
          }

          .brand-row {
            display: flex;
            align-items: center;
            margin-bottom: 30px;
          }

          .brand-mark {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            margin-right: 10px;
            border-radius: 12px;
            color: ${PRIMARY_COLOR};
            background: #ffffff;
            font-size: 16px;
            font-weight: 800;
          }

          .brand-name {
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 1.5px;
          }

          .hero-label {
            margin-bottom: 7px;
            color:
              rgba(
                255,
                255,
                255,
                0.75
              );
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1.4px;
            text-transform: uppercase;
          }

          .hero h1 {
            max-width: 500px;
            margin-bottom: 10px;
            font-size: 30px;
            line-height: 1.1;
          }

          .hero-description {
            max-width: 480px;
            margin-bottom: 26px;
            color:
              rgba(
                255,
                255,
                255,
                0.82
              );
            font-size: 13px;
          }

          .hero-footer {
            display: flex;
            align-items: flex-end;
            justify-content:
              space-between;
          }

          .hero-meta-label {
            margin-bottom: 3px;
            color:
              rgba(
                255,
                255,
                255,
                0.65
              );
            font-size: 8px;
            letter-spacing: 0.8px;
            text-transform: uppercase;
          }

          .hero-meta-value {
            font-size: 10px;
            font-weight: 600;
          }

          .report-number {
            padding: 7px 11px;
            border: 1px solid
              rgba(
                255,
                255,
                255,
                0.24
              );
            border-radius: 20px;
            background:
              rgba(
                255,
                255,
                255,
                0.12
              );
            font-size: 9px;
          }

          .summary-grid {
            display: flex;
            gap: 9px;
            margin-bottom: 22px;
          }

          .summary-card {
            position: relative;
            flex: 1;
            min-height: 86px;
            overflow: hidden;
            padding: 14px;
            border: 1px solid #e9e8f5;
            border-radius: 16px;
            background: #fafaff;
            page-break-inside: avoid;
          }

          .summary-card::after {
            position: absolute;
            width: 46px;
            height: 46px;
            right: -16px;
            bottom: -18px;
            border-radius: 999px;
            background:
              rgba(
                108,
                99,
                255,
                0.08
              );
            content: "";
          }

          .summary-number {
            position: relative;
            z-index: 1;
            margin-bottom: 5px;
            color: ${PRIMARY_COLOR};
            font-size: 23px;
            font-weight: 800;
            line-height: 1;
          }

          .summary-label {
            position: relative;
            z-index: 1;
            color: #78768a;
            font-size: 9px;
          }

          .summary-card-highlight {
            border-color:
              rgba(
                108,
                99,
                255,
                0.28
              );
            background: #f3f1ff;
          }

          .info-strip {
            display: flex;
            align-items: center;
            justify-content:
              space-between;
            padding: 12px 15px;
            margin-bottom: 22px;
            border: 1px solid #e9e8f5;
            border-radius: 14px;
            background: #ffffff;
            page-break-inside: avoid;
          }

          .info-item {
            flex: 1;
          }

          .info-item + .info-item {
            padding-left: 15px;
            border-left: 1px solid
              #ecebf5;
          }

          .info-label {
            margin-bottom: 3px;
            color: #9b99aa;
            font-size: 8px;
            letter-spacing: 0.6px;
            text-transform: uppercase;
          }

          .info-value {
            color: #353442;
            font-size: 10px;
            font-weight: 700;
          }

          .section {
            margin-top: 24px;
          }

          .section-header {
            display: flex;
            align-items: center;
            justify-content:
              space-between;
            padding-bottom: 9px;
            margin-bottom: 12px;
            border-bottom: 1px solid
              #e9e8f5;
          }

          .section-title-row {
            display: flex;
            align-items: center;
          }

          .section-mark {
            width: 5px;
            height: 22px;
            margin-right: 10px;
            border-radius: 5px;
            background:
              ${PRIMARY_COLOR};
          }

          .section-title {
            margin: 0;
            color: #282734;
            font-size: 18px;
            font-weight: 800;
          }

          .section-description {
            margin-top: 2px;
            color: #9290a0;
            font-size: 9px;
          }

          .section-count {
            padding: 5px 9px;
            border-radius: 20px;
            color: ${PRIMARY_COLOR};
            background: #f0efff;
            font-size: 9px;
            font-weight: 700;
          }

          .goal-card {
            display: flex;
            padding: 15px;
            margin-bottom: 10px;
            border: 1px solid #e8e7f1;
            border-left: 4px solid
              ${PRIMARY_COLOR};
            border-radius: 14px;
            background: #ffffff;
            page-break-inside: avoid;
            break-inside: avoid;
          }

          .goal-number {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            width: 34px;
            height: 34px;
            margin-right: 13px;
            border-radius: 11px;
            color: ${PRIMARY_COLOR};
            background: #f0efff;
            font-size: 10px;
            font-weight: 800;
          }

          .goal-content {
            flex: 1;
          }

          .goal-header {
            display: flex;
            align-items: flex-start;
            justify-content:
              space-between;
          }

          .goal-name {
            color: #302f3c;
            font-size: 13px;
            font-weight: 800;
          }

          .goal-period {
            margin-top: 2px;
            color: #9694a3;
            font-size: 9px;
          }

          .goal-status {
            padding: 4px 8px;
            border-radius: 20px;
            font-size: 8px;
            font-weight: 700;
          }

          .status-active {
            color: #5148e5;
            background: #eeecff;
          }

          .status-completed {
            color: #20795c;
            background: #e4f7ef;
          }

          .status-inactive {
            color: #777582;
            background: #efeff2;
          }

          .goal-progress-header {
            display: flex;
            align-items: center;
            justify-content:
              space-between;
            margin-top: 12px;
            color: #8c8a98;
            font-size: 9px;
          }

          .goal-progress-header strong {
            color: ${PRIMARY_COLOR};
            font-size: 11px;
          }

          .progress-track {
            height: 8px;
            margin: 6px 0 12px;
            overflow: hidden;
            border-radius: 20px;
            background: #eae9f2;
          }

          .progress-value {
            height: 100%;
            min-width: 2px;
            border-radius: 20px;
            background-color:
              ${PRIMARY_COLOR};
            background-image:
              linear-gradient(
                90deg,
                #5148e5,
                #8c85ff
              );
          }

          .goal-statistics {
            display: flex;
            gap: 10px;
          }

          .goal-stat {
            flex: 1;
          }

          .goal-stat span {
            display: block;
            margin-bottom: 2px;
            color: #9c9aa7;
            font-size: 8px;
          }

          .goal-stat strong {
            color: #3d3b48;
            font-size: 9px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          thead {
            display: table-header-group;
          }

          tr {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          th {
            padding: 10px;
            color: #777582;
            border-bottom: 1px solid
              #e3e2eb;
            background: #f7f6fc;
            text-align: left;
            font-size: 8px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
          }

          td {
            padding: 11px 10px;
            color: #4d4b58;
            border-bottom: 1px solid
              #eeeeF3;
            vertical-align: top;
            font-size: 9px;
          }

          tbody tr:nth-child(even) {
            background: #fcfcff;
          }

          .summary-table {
            overflow: hidden;
            border: 1px solid #e8e7f1;
            border-radius: 14px;
          }

          .position-cell {
            width: 32px;
            color: #a3a1ae;
            font-weight: 700;
          }

          .exercise-name {
            color: #34323f;
            font-weight: 700;
          }

          .accent-value {
            color: ${PRIMARY_COLOR};
          }

          .workout-day {
            overflow: hidden;
            margin-bottom: 15px;
            border: 1px solid #e7e6ef;
            border-radius: 15px;
            background: #ffffff;
          }

          .day-header {
            display: flex;
            align-items: center;
            justify-content:
              space-between;
            padding: 13px 15px;
            color: #ffffff;
            background-color:
              ${PRIMARY_COLOR};
            background-image:
              linear-gradient(
                120deg,
                #554ce8,
                ${PRIMARY_COLOR}
              );
          }

          .day-date {
            font-size: 12px;
            font-weight: 800;
            text-transform:
              capitalize;
          }

          .day-subtitle {
            margin-top: 2px;
            color:
              rgba(
                255,
                255,
                255,
                0.7
              );
            font-size: 8px;
          }

          .day-statistics {
            display: flex;
            gap: 16px;
          }

          .day-stat {
            text-align: right;
          }

          .day-stat strong {
            display: block;
            font-size: 11px;
          }

          .day-stat span {
            display: block;
            color:
              rgba(
                255,
                255,
                255,
                0.68
              );
            font-size: 7px;
          }

          .history-table th {
            background: #f5f4ff;
          }

          .workout-note {
            max-width: 280px;
            margin-top: 4px;
            color: #8e8c99;
            font-size: 8px;
            font-style: italic;
          }

          .time-badge {
            display: inline-block;
            padding: 3px 7px;
            border-radius: 8px;
            color: #666370;
            background: #f1f0f5;
            font-size: 8px;
          }

          .multiplication {
            margin: 0 3px;
            color: #aaa8b3;
          }

          .empty-state {
            padding: 30px;
            border: 1px dashed #d8d6e5;
            border-radius: 15px;
            background: #fbfbfe;
            text-align: center;
          }

          .empty-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            margin: 0 auto 10px;
            border-radius: 13px;
            color: ${PRIMARY_COLOR};
            background: #efedff;
            font-size: 20px;
            font-weight: 800;
          }

          .empty-title {
            margin-bottom: 4px;
            color: #3b3946;
            font-size: 12px;
            font-weight: 800;
          }

          .empty-description {
            color: #9795a2;
            font-size: 9px;
          }

          .table-empty {
            padding: 24px;
            color: #9997a3;
            text-align: center;
          }

          .report-footer {
            display: flex;
            align-items: center;
            justify-content:
              space-between;
            padding-top: 13px;
            margin-top: 28px;
            color: #9997a4;
            border-top: 1px solid
              #e8e7ef;
            font-size: 8px;
          }

          .footer-brand {
            color: ${PRIMARY_COLOR};
            font-weight: 800;
            letter-spacing: 0.7px;
          }

          @media print {
            body {
              background: #ffffff;
            }

            .hero,
            .summary-card,
            .goal-card,
            .workout-day {
              -webkit-print-color-adjust:
                exact;
              print-color-adjust: exact;
            }
          }
        </style>
      </head>

      <body>
        <header class="hero">
          <div class="hero-circle-one"></div>
          <div class="hero-circle-two"></div>

          <div class="hero-content">
            <div class="brand-row">
              <div class="brand-mark">
                V
              </div>

              <div class="brand-name">
                VOVA
              </div>
            </div>

            <div class="hero-label">
              Персональная статистика
            </div>

            <h1>
              Отчёт о тренировках
              и спортивных целях
            </h1>

            <div class="hero-description">
              Полная история тренировок,
              результаты упражнений и
              текущий прогресс по целям.
            </div>

            <div class="hero-footer">
              <div>
                <div class="hero-meta-label">
                  Дата формирования
                </div>

                <div class="hero-meta-value">
                  ${createdAt}
                </div>
              </div>

              <div class="report-number">
                FITNESS REPORT
              </div>
            </div>
          </div>
        </header>

        <section class="summary-grid">
          <div class="summary-card">
            <div class="summary-number">
              ${trainingDays}
            </div>

            <div class="summary-label">
              Тренировочных дней
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-number">
              ${logs.length}
            </div>

            <div class="summary-label">
              Записей в истории
            </div>
          </div>

          <div class="summary-card">
            <div class="summary-number">
              ${totalSets}
            </div>

            <div class="summary-label">
              Всего подходов
            </div>
          </div>

          <div
            class="
              summary-card
              summary-card-highlight
            "
          >
            <div class="summary-number">
              ${totalVolume}
            </div>

            <div class="summary-label">
              Общий объём
            </div>
          </div>
        </section>

        <section class="info-strip">
          <div class="info-item">
            <div class="info-label">
              Период отчёта
            </div>

            <div class="info-value">
              ${reportPeriod}
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">
              Лучший день
            </div>

            <div class="info-value">
              ${
                bestDay
                  ? `${formatReportDate(
                      bestDay.date
                    )} · ${
                      bestDay.total
                    }`
                  : 'Нет данных'
              }
            </div>
          </div>

          <div class="info-item">
            <div class="info-label">
              Выполнено целей
            </div>

            <div class="info-value">
              ${completedGoals}
              из
              ${goals.length}
            </div>
          </div>
        </section>

        <section class="section">
          <div class="section-header">
            <div class="section-title-row">
              <div class="section-mark"></div>

              <div>
                <h2 class="section-title">
                  Спортивные цели
                </h2>

                <div class="section-description">
                  Текущий прогресс и
                  результаты выполнения
                </div>
              </div>
            </div>

            <div class="section-count">
              ${goals.length}
            </div>
          </div>

          ${goalsHtml}
        </section>

        <section class="section">
          <div class="section-header">
            <div class="section-title-row">
              <div class="section-mark"></div>

              <div>
                <h2 class="section-title">
                  Итоги по упражнениям
                </h2>

                <div class="section-description">
                  Сводная статистика за
                  весь период
                </div>
              </div>
            </div>

            <div class="section-count">
              ${
                exerciseSummaryItems.length
              }
            </div>
          </div>

          <div class="summary-table">
            <table>
              <thead>
                <tr>
                  <th>
                    №
                  </th>

                  <th>
                    Упражнение
                  </th>

                  <th>
                    Записей
                  </th>

                  <th>
                    Подходов
                  </th>

                  <th>
                    Результат
                  </th>
                </tr>
              </thead>

              <tbody>
                ${exerciseSummaryHtml}
              </tbody>
            </table>
          </div>
        </section>

        <section class="section">
          <div class="section-header">
            <div class="section-title-row">
              <div class="section-mark"></div>

              <div>
                <h2 class="section-title">
                  История тренировок
                </h2>

                <div class="section-description">
                  Все записи,
                  сгруппированные по датам
                </div>
              </div>
            </div>

            <div class="section-count">
              ${logs.length}
            </div>
          </div>

          ${historyHtml}
        </section>

        <footer class="report-footer">
          <div>
            Отчёт автоматически создан
            приложением
            <span class="footer-brand">
              VOVA
            </span>
          </div>

          <div>
            ${createdAt}
          </div>
        </footer>
      </body>
    </html>
  `;
};