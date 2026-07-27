import React, { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';

import Ionicons from '@expo/vector-icons/Ionicons';
import * as Print from 'expo-print';
import * as ExpoSharing from 'expo-sharing';

import type {
  Exercise,
  WorkoutLog,
} from '../exercises/types';

import type { Goal } from '../goals/types';

import { COLORS } from '../../shared/constants/theme';

import {
  buildWorkoutReportHtml,
} from './buildWorkoutReportHtml';

interface PdfExportButtonProps {
  readonly logs: readonly WorkoutLog[];
  readonly exercises: readonly Exercise[];
  readonly goals: readonly Goal[];
}

const printHtmlOnWeb = (html: string): void => {
  const browser = globalThis as any;
  const documentRef = browser.document;

  if (!documentRef?.body) {
    throw new Error('Браузер недоступен');
  }

  const iframe = documentRef.createElement('iframe');

  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.border = '0';
  iframe.style.opacity = '0';

  iframe.setAttribute('title', 'Отчёт GYM Check');

  documentRef.body.appendChild(iframe);

  const iframeDocument =
    iframe.contentDocument ??
    iframe.contentWindow?.document;

  if (!iframeDocument) {
    iframe.remove();
    throw new Error('Не удалось создать документ');
  }

  iframeDocument.open();
  iframeDocument.write(html);
  iframeDocument.close();

  browser.setTimeout(() => {
    const iframeWindow = iframe.contentWindow;

    if (!iframeWindow) {
      iframe.remove();
      return;
    }

    iframeWindow.focus();
    iframeWindow.print();

    browser.setTimeout(() => {
      iframe.remove();
    }, 2000);
  }, 500);
};

export const PdfExportButton: React.FC<
  PdfExportButtonProps
> = ({
  logs,
  exercises,
  goals,
}) => {
  const [isExporting, setIsExporting] =
    useState(false);

  const handleExport = async (): Promise<void> => {
    if (logs.length === 0 && goals.length === 0) {
      Alert.alert(
        'Нет данных',
        'Пока нечего добавлять в отчёт.'
      );

      return;
    }

    try {
      setIsExporting(true);

      const html = buildWorkoutReportHtml({
        logs,
        exercises,
        goals,
      });

      if (Platform.OS === 'web') {
        printHtmlOnWeb(html);
        return;
      }

      const result = await Print.printToFileAsync({
        html,
        width: 595,
        height: 842,
      });

      const canShare =
        await ExpoSharing.isAvailableAsync();

      if (!canShare) {
        Alert.alert(
          'PDF создан',
          'Отчёт успешно сформирован.'
        );

        return;
      }

      await ExpoSharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        UTI: 'com.adobe.pdf',
        dialogTitle: 'Экспорт отчёта GYM Check',
      });
    } catch (error) {
      console.error('Ошибка экспорта PDF:', error);

      Alert.alert(
        'Ошибка',
        'Не удалось сформировать PDF-отчёт.'
      );
    } finally {
      setIsExporting(false);
    }
  };

return (
  <TouchableOpacity
    onPress={handleExport}
    disabled={isExporting}
    accessibilityRole="button"
    accessibilityLabel="Экспортировать PDF"
    style={[
      styles.button,
      isExporting && styles.buttonDisabled,
    ]}
  >
    {isExporting ? (
      <ActivityIndicator
        size="small"
        color="#ffffff"
      />
    ) : (
      <>
        <Ionicons
          name="document-text-outline"
          size={12}
          color="#ffffff"
        />

        <Text style={styles.buttonText}>
          PDF
        </Text>
      </>
    )}
  </TouchableOpacity>
);
};

const styles = StyleSheet.create({
  button: {
    minWidth: 64,
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },

  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  buttonDisabled: {
    opacity: 0.5,
  },
});