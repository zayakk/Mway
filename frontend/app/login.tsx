import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Required', 'Email and password are required.');
      return;
    }
    try {
      setLoading(true);
      await login(email, password);
      router.replace('/search');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Sign in</ThemedText>
      <View style={styles.form}>
        <ThemedText>Email</ThemedText>
        <TextInput
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
        />
        <ThemedText>Password</ThemedText>
        <TextInput
          placeholder="Your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <Pressable onPress={onSubmit} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} disabled={loading}>
          <ThemedText type="defaultSemiBold">{loading ? 'Signing in…' : 'Sign in'}</ThemedText>
        </Pressable>
        <View style={styles.row}>
          <ThemedText>New here? </ThemedText>
          <Link href="/register">
            <ThemedText type="link">Create an account</ThemedText>
          </Link>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 16, justifyContent: 'center' },
  form: { gap: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  buttonPressed: { opacity: 0.8 },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
});


