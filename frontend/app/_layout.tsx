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
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="login" options={{ title: 'Login' }} />
            <Stack.Screen name="register" options={{ title: 'Register' }} />
            <Stack.Screen name="search" options={{ title: 'Search' }} />
            <Stack.Screen name="locationSelect" options={{ title: 'Select Location' }} />
            <Stack.Screen name="searchResults" options={{ title: 'Search Results' }} />
            <Stack.Screen name="seats" options={{ title: 'Select Seats' }} />
            <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
            <Stack.Screen name="confirmation" options={{ title: 'Confirmation' }} />
            <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
            <Stack.Screen name="language" options={{ title: 'Language' }} />
            <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
            <Stack.Screen name="faqs" options={{ title: 'FAQs' }} />
            <Stack.Screen name="contact" options={{ title: 'Contact' }} />
            <Stack.Screen name="about" options={{ title: 'About' }} />
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
      const last = segments[segments.length - 1];
      const inAuth = last === 'login' || last === 'register' || last === 'index';
      
      // Skip index - it handles its own redirect
      if (last === 'index') return;
      
      if (!user && !inAuth) {
        router.replace('/login');
      } else if (user && inAuth) {
        router.replace('/search');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [user, initializing, segments, router]);

  return <>{children}</>;
}
