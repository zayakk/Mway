import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { I18nProvider } from '@/i18n';
import { AuthProvider, useAuth } from '@/lib/auth';
import { useSegments, useRouter } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <I18nProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate>
          <Stack
            screenOptions={{
              headerShown: false,
              gestureEnabled: true,
              animation: Platform.select({
                ios: 'slide_from_right',
                android: 'fade_from_bottom',
                default: 'fade',
              }),
              animationTypeForReplace: 'push',
              contentStyle: { backgroundColor: '#f8fafc' },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'transparentModal',
                animation: 'fade',
              }}
            />
            <Stack.Screen name="login" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="register" options={{ animation: 'slide_from_bottom' }} />
            <Stack.Screen name="search" />
            <Stack.Screen name="locationSelect" />
            <Stack.Screen name="searchResults" />
            <Stack.Screen name="seats" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="confirmation" options={{ animation: 'fade_from_bottom' }} />
            <Stack.Screen name="notifications" />
            <Stack.Screen name="language" />
            <Stack.Screen name="privacy" />
            <Stack.Screen name="faqs" />
            <Stack.Screen name="contact" />
            <Stack.Screen name="about" />
          </Stack>
        </AuthGate>
        <StatusBar style="auto" />
      </ThemeProvider>
      </I18nProvider>
    </AuthProvider>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    
    // Wait a bit to ensure router is ready
    const timer = setTimeout(() => {
      const lastSegment = segments[segments.length - 1] as string | undefined;
      const inAuth = lastSegment === 'login' || lastSegment === 'register' || lastSegment === 'index';
      
      // Skip index - it handles its own redirect
      if (lastSegment === 'index') return;
      
      if (!user && !inAuth) {
        router.replace('/login');
      } else if (user && inAuth) {
        router.replace('/');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, initializing, segments, router]);

  return <>{children}</>;
}
