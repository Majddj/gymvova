import React from 'react';

import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Clipboard from 'expo-clipboard';

import { exportBackup } from './exportBackup';
import { COLORS } from '../../shared/constants/theme';

export const BackupButton = () => {
  const handleBackup =
    async (): Promise<void> => {
      try {
        const backup = exportBackup();

        const copied =
          await Clipboard.setStringAsync(
            backup
          );

        if (!copied) {
          throw new Error(
            'Не удалось скопировать backup'
          );
        }

        Alert.alert(
          'Готово',
          'Backup скопирован в буфер обмена.'
        );
      } catch (error) {
        console.error(
          'Ошибка создания backup:',
          error
        );

        Alert.alert(
          'Ошибка',
          error instanceof Error
            ? error.message
            : 'Не удалось создать backup'
        );
      }
    };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleBackup}
      activeOpacity={0.8}
    >
      <Ionicons
        name="copy-outline"
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