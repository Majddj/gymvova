import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COLORS, SPACING } from '../../constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

interface TelegramInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const EMPTY_INSETS: TelegramInsets = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
};

function getTelegramInsets(): TelegramInsets {
  if (Platform.OS !== 'web') {
    return EMPTY_INSETS;
  }

  const telegram = (globalThis as any).Telegram?.WebApp;

  if (!telegram) {
    return EMPTY_INSETS;
  }

  const safeArea = telegram.safeAreaInset ?? EMPTY_INSETS;
  const contentSafeArea =
    telegram.contentSafeAreaInset ?? EMPTY_INSETS;

  return {
    top: Math.max(
      Number(safeArea.top) || 0,
      Number(contentSafeArea.top) || 0,
    ),
    bottom: Math.max(
      Number(safeArea.bottom) || 0,
      Number(contentSafeArea.bottom) || 0,
    ),
    left: Math.max(
      Number(safeArea.left) || 0,
      Number(contentSafeArea.left) || 0,
    ),
    right: Math.max(
      Number(safeArea.right) || 0,
      Number(contentSafeArea.right) || 0,
    ),
  };
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = true,
  style,
  contentStyle,
}) => {
  const [telegramInsets, setTelegramInsets] =
    useState<TelegramInsets>(EMPTY_INSETS);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const telegram = (globalThis as any).Telegram?.WebApp;

    if (!telegram) {
      return;
    }

    const updateInsets = () => {
      setTelegramInsets(getTelegramInsets());
    };

    updateInsets();

    telegram.onEvent?.('safeAreaChanged', updateInsets);
    telegram.onEvent?.('contentSafeAreaChanged', updateInsets);
    telegram.onEvent?.('fullscreenChanged', updateInsets);
    telegram.onEvent?.('viewportChanged', updateInsets);

    return () => {
      telegram.offEvent?.('safeAreaChanged', updateInsets);
      telegram.offEvent?.('contentSafeAreaChanged', updateInsets);
      telegram.offEvent?.('fullscreenChanged', updateInsets);
      telegram.offEvent?.('viewportChanged', updateInsets);
    };
  }, []);

  const telegramPadding: ViewStyle | undefined =
    Platform.OS === 'web'
      ? {
          paddingTop: SPACING.md + telegramInsets.top,
          paddingBottom: SPACING.xxl + telegramInsets.bottom,
          paddingLeft: SPACING.md + telegramInsets.left,
          paddingRight: SPACING.md + telegramInsets.right,
        }
      : undefined;

  const content = [
    styles.content,
    telegramPadding,
    contentStyle,
  ];

  return (
    <SafeAreaView
      style={[styles.safe, style]}
      edges={Platform.OS === 'web' ? [] : ['top']}
    >
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={content}>{children}</View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
});