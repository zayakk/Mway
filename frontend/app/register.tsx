import { useState } from 'react';
import { Alert, StyleSheet, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/lib/auth';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';
import { PrimaryButton } from '@/components/ui/primary-button';
import { BrandColors } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    try {
      if (!name || !email || !password) {
        setError('Нэр, имэйл, нууц үгийг бүрэн оруулна уу.');
        return;
      }
      if (password !== confirm) {
        setError('Нууц үг хоёр таарахгүй байна.');
        return;
      }
      setError(null);
      setLoading(true);
      await registerUser(name, email, password);
      Alert.alert(
        'Амжилттай',
        'Таны бүртгэл идэвхжлээ. Нэвтрэхийн тулд имэйл, нууц үгээ ашиглана уу.',
        [
          {
            text: 'Үргэлжлүүлэх',
            onPress: () => router.replace('/login'),
          },
        ],
        { cancelable: false }
      );
    } catch (e: any) {
      setError(e?.message ?? 'Бүртгэл үүсгэхэд алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scrollable>
      <ScreenHeader eyebrow="Join Mway" title="Бүртгүүлэх" subtitle="Аяллаа төлөвлөхөд туслах шинэ акаунт үүсгэе." />

      {error && (
        <View style={styles.errorBox}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      <View style={styles.card}>
        <Section title="Хувийн мэдээлэл">
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Бүтэн нэр</ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput
                nativeID="register-name"
                placeholder="Жишээ: Бат Эрдэнэ"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Имэйл</ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput
                nativeID="register-email"
                autoComplete="email"
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>
          </View>
        </Section>

        <Section title="Нууц үгийн тохиргоо">
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Нууц үг</ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput
                nativeID="register-password"
                autoComplete="new-password"
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Нууц үг давтах</ThemedText>
            <View style={styles.inputWrapper}>
              <TextInput
                nativeID="register-confirm-password"
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                value={confirm}
                onChangeText={setConfirm}
                style={styles.input}
              />
            </View>
          </View>

          <PrimaryButton onPress={onSubmit} loading={loading} accessibilityLabel="Бүртгэл үүсгэх">
            Бүртгэл үүсгэх
          </PrimaryButton>

          <View style={styles.registerRow}>
            <ThemedText style={styles.registerText}>Аль хэдийн бүртгэлтэй юу?</ThemedText>
            <Link href="/login">
              <ThemedText style={styles.registerLink}>Нэвтрэх</ThemedText>
            </Link>
          </View>
        </Section>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    gap: 24,
    borderWidth: 1,
    borderColor: BrandColors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 14,
    color: '#b91c1c',
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  inputWrapper: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  registerText: {
    fontSize: 14,
    color: '#475569',
  },
  registerLink: {
    fontSize: 14,
    color: BrandColors.primary,
    fontWeight: '600',
  },
});
