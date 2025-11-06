import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert('Required', 'Name, email and password are required.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      // TODO: Replace with real backend endpoint
      // const res = await fetch('http://127.0.0.1:8000/api/auth/register/', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, email, password }),
      // });
      // const data = await res.json();
      // if (!res.ok) throw new Error(data?.detail || 'Registration failed');
      Alert.alert('Success', 'Account created (mock).');
      router.replace('/login');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Create account</ThemedText>
      <View style={styles.form}>
        <ThemedText>Name</ThemedText>
        <TextInput
          placeholder="Your name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
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
          placeholder="Create a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <ThemedText>Confirm password</ThemedText>
        <TextInput
          placeholder="Repeat your password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
          style={styles.input}
        />
        <Pressable onPress={onSubmit} style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} disabled={loading}>
          <ThemedText type="defaultSemiBold">{loading ? 'Creating…' : 'Create account'}</ThemedText>
        </Pressable>
        <View style={styles.row}>
          <ThemedText>Already have an account? </ThemedText>
          <Link href="/login">
            <ThemedText type="link">Sign in</ThemedText>
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


