import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { importBackup } from './importBackup';
import { COLORS } from '../../shared/constants/theme';

type ImportResult = {
  logsAdded: number;
  exercisesAdded: number;
  goalsAdded: number;
};

export const ImportBackupButton = () => {
  const [status, setStatus] =
    useState<ImportResult | null>(null);

  const [errorText, setErrorText] =
    useState('');

  const handleImport =
    async (): Promise<void> => {
      try {
        setStatus(null);
        setErrorText('');

        const result =
          await importBackup();

        if (!result) {
          return;
        }

        setStatus({
          logsAdded: result.logsAdded,
          exercisesAdded:
            result.exercisesAdded,
          goalsAdded: result.goalsAdded,
        });
      } catch (error) {
        console.error(
          'Ошибка импорта:',
          error
        );

        setErrorText(
          error instanceof Error
            ? `Ошибка: ${error.message}`
            : 'Ошибка импорта'
        );
      }
    };

  return (
  <View style={styles.container}>
    <TouchableOpacity
      style={styles.iconButton}
      onPress={handleImport}
      activeOpacity={0.7}
    >
      <Ionicons
        name="cloud-upload-outline"
        size={22}
        color={COLORS.primary}
      />
    </TouchableOpacity>

    {status && (
      <View style={styles.statusBox}>
        <Text style={styles.statusTitle}>
          Готово!
        </Text>

        <Text style={styles.statusItem}>
          Тренировок: {status.logsAdded}
        </Text>

        <Text style={styles.statusItem}>
          Упражнений: {status.exercisesAdded}
        </Text>

        <Text style={styles.statusItem}>
          Целей: {status.goalsAdded}
        </Text>
      </View>
    )}
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
  },

  iconButton: {
    width: 42,
    height: 42,

    borderRadius: 10,

    marginVertical: 5,
    marginHorizontal: 3,

    borderWidth: 1,
    borderColor: COLORS.primary,

    backgroundColor: COLORS.surface,

    alignItems: 'center',
    justifyContent: 'center',
  },

  statusBox: {
    position: 'absolute',

    top: 58,

    width: 220,

    // Центрируем относительно кнопки
    left: '50%',
    transform: [
      { translateX: -110 },
    ],

    paddingVertical: 12,
    paddingHorizontal: 16,

    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,

    backgroundColor: COLORS.surface,

    zIndex: 10,
  },

  statusTitle: {
    marginBottom: 10,

    color: COLORS.primary,

    fontSize: 14,
    fontWeight: '700',

    textAlign: 'center',
  },

  statusItem: {
    marginBottom: 5,

    color: COLORS.text,

    fontSize: 13,
  },
});