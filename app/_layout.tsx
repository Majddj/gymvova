import 'react-native-get-random-values';

import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { store, persistor } from '../src/store';
import { COLORS } from '../src/shared/constants/theme';

const LoadingSplash = () => {
  return (
    <View style={styles.splash}>
      <Image
        source={require('../assets/splash.png')}
        style={styles.splashImage}
        resizeMode="contain"
      />

      <ActivityIndicator
        color={COLORS.primary}
        size="small"
        style={styles.loader}
      />
    </View>
  );
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate
            loading={<LoadingSplash />}
            persistor={persistor}
          >
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: {
                  backgroundColor: COLORS.background,
                },
              }}
            />
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },

  splashImage: {
    width: 180,
    height: 180,
  },

  loader: {
    marginTop: 20,
  },
});