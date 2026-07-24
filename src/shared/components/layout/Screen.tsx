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

const getTelegramInsets = () => {
  if (Platform.OS !== 'web') {
    return {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    };
  }

  const tg = (globalThis as any).Telegram?.WebApp;

  const safeArea = tg?.safeAreaInset ?? {};
  const contentSafeArea = tg?.contentSafeAreaInset ?? {};

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
};

export const Screen: React.FC<ScreenProps> = ({
  children,
  scrollable = true,
  style,
  contentStyle,
}) => {
  const [insets, setInsets] = useState(getTelegramInsets);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      return;
    }

    const tg = (globalThis as any).Telegram?.WebApp;

    if (!tg) {
      return;
    }

    const updateInsets = () => {
      setInsets(getTelegramInsets());
    };

    updateInsets();

    tg.onEvent?.('safeAreaChanged', updateInsets);
    tg.onEvent?.('contentSafeAreaChanged', updateInsets);
    tg.onEvent?.('fullscreenChanged', updateInsets);
    tg.onEvent?.('viewportChanged', updateInsets);

    return () => {
      tg.offEvent?.('safeAreaChanged', updateInsets);
      tg.offEvent?.('contentSafeAreaChanged', updateInsets);
      tg.offEvent?.('fullscreenChanged', updateInsets);
      tg.offEvent?.('viewportChanged', updateInsets);
    };
  }, []);

  const safeStyle: ViewStyle =
    Platform.OS === 'web'
      ? {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }
      : {};

  return (
    <SafeAreaView
      style={[styles.safe, safeStyle, style]}
      edges={Platform.OS === 'web' ? [] : ['top']}
    >
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, contentStyle]}>
          {children}
        </View>
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