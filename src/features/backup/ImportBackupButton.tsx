import React from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';

import { importBackup } from './importBackup';
import { COLORS } from '../../shared/constants/theme';

export const ImportBackupButton = () => {
  const handleImport = async (): Promise<void> => {
    try {
      // Берём backup прямо из буфера обмена
      const backupText =
        await Clipboard.getStringAsync();

      if (!backupText) {
        Alert.alert(
          'Ошибка',
          'Сначала скопируй backup.'
        );

        return;
      }

      // Передаём backup в функцию восстановления
      const result =
        await importBackup(backupText);

      Alert.alert(
        'Готово',
        `Восстановлено:

Тренировок: ${result.logsAdded}
Упражнений: ${result.exercisesAdded}
Целей: ${result.goalsAdded}`
      );
    } catch (error) {
      console.error(
        'Ошибка восстановления:',
        error
      );

      Alert.alert(
        'Ошибка',
        error instanceof Error
          ? error.message
          : 'Не удалось восстановить backup'
      );
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleImport}
      activeOpacity={0.8}
    >
      <Ionicons
        name="cloud-upload-outline"
        size={19}
        color={COLORS.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.surface,

    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 10,

    marginHorizontal: 4,

    paddingVertical: 12,
    paddingHorizontal: 10,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,
  },

  text: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});