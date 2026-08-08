import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { exportBackup } from './exportBackup';
import { COLORS } from '../../shared/constants/theme';

export const BackupButton = () => {
  const handleBackup = (): void => {
    try {
      exportBackup();
    } catch (error) {
      console.error('Ошибка создания backup:', error);

      Alert.alert(
        'Ошибка',
        'Не удалось создать резервную копию.'
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
        name="download-outline"
        size={25}
        color="#FFFFFF"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 10, 
    backgroundColor: COLORS.primary
  }
});