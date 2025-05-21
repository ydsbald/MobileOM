import { useEffect } from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold
} from '@expo-google-fonts/poppins';
import { SplashScreen } from 'expo-router';
import { AuthProvider } from '@/context/AuthContext';
import { DataProvider } from '@/context/DataContext';
import { NetworkProvider } from '@/context/NetworkContext';
import * as SystemUI from 'expo-system-ui'; // ✅ Ajout pour gérer les barres système

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // ✅ Cache la navigation bar Android quand c'est possible
  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync('transparent');
    }
  }, []);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <DataProvider>
        <NetworkProvider>
          <StatusBar hidden={false} />
          <Stack screenOptions={{ headerShown: false, statusBarHidden: true, }}>
            <Stack.Screen name="auth" options={{ headerShown: false, statusBarHidden: true, }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false, statusBarHidden: true, }} />

            {/* ✅ Mode fullscreen pour patient */}
            <Stack.Screen
              name="patient/[id]"
              options={{
                presentation: 'modal',
                headerShown: true,
                statusBarHidden: true,
              }}
            />

            {/* ✅ Mode fullscreen pour observation */}
            <Stack.Screen
              name="observation/[id]"
              options={{
                presentation: 'modal',
                headerShown: true,
                statusBarHidden: true,
              }}
            />

            <Stack.Screen name="+not-found" options={{ presentation: 'modal' }} />
          </Stack>
        </NetworkProvider>
      </DataProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#0A6EBD',
  },
});
