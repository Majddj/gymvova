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

export const ImportBackupButton = () => {
  const [status, setStatus] =
    useState('');

  const handleImport =
    async (): Promise<void> => {
      try {
        setStatus('');

        const result =
          await importBackup();

        if (!result) {
          return;
        }

        setStatus(
          `Готово! Тренировок: ${result.logsAdded}, упражнений: ${result.exercisesAdded}, целей: ${result.goalsAdded}`
        );
      } catch (error) {
        console.error(
          'Ошибка импорта:',
          error
        );

        setStatus(
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

      {status !== '' && (
        <Text style={styles.status}>
          {status}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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

  status: {
    marginTop: 8,

    color: COLORS.text,

    fontSize: 12,
  },
});