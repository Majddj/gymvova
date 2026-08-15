import React from 'react';

import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Screen } from '../../src/shared/components/layout/Screen';

import { BackupButton } from '../../src/features/backup/BackupButton';
import { ImportBackupButton } from '../../src/features/backup/ImportBackupButton';

import {
  COLORS,
} from '../../src/shared/constants/theme';

export default function BackupScreen() {
  return (
    <Screen>
      <View style={styles.container}>

        <Text style={styles.title}>
          Резервная копия
        </Text>

        <Text style={styles.description}>
          Сохраняй данные приложения и восстанавливай их на другом устройстве или после сброса.
        </Text>

        <View style={styles.buttons}>
          <BackupButton />
          <ImportBackupButton />
        </View>

      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingHorizontal: 20,
    paddingTop: 30,
  },

  title: {
    color: COLORS.text,

    fontSize: 24,
    fontWeight: '700',

    marginBottom: 8,
  },

  description: {
    color: COLORS.textMuted,

    fontSize: 14,
    lineHeight: 20,

    marginBottom: 30,
  },

  buttons: {
    flexDirection: 'row',
    alignItems: 'center',

    gap: 12,
  },
});