import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
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
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="login" options={{ title: 'Login' }} />
            <Stack.Screen name="register" options={{ title: 'Register' }} />
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
    const last = segments[segments.length - 1];
    const inAuth = last === 'login' || last === 'register';
    if (!user && !inAuth) {
      router.replace('/login');
    } else if (user && inAuth) {
      router.replace('/search');
    }
  }, [user, initializing, segments, router]);

  return <>{children}</>;
}
