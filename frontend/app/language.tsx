import { useState } from 'react';
import { Pressable, StyleSheet, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LanguageScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState('mn');

  const languages = [
    { code: 'mn', name: 'Монгол', native: 'Монгол хэл' },
    { code: 'en', name: 'English', native: 'English', disabled: true },
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>Хэл сонгох</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>Хэл сонгох</ThemedText>
          </View>

          {languages.map((lang, index) => (
            <View key={lang.code}>
              {index > 0 && <View style={styles.divider} />}
              <Pressable
                style={({ pressed }) => [
                  styles.languageItem,
                  pressed && styles.languageItemPressed,
                  lang.disabled && styles.languageItemDisabled,
                ]}
                onPress={() => !lang.disabled && setSelectedLanguage(lang.code)}
                disabled={lang.disabled}
              >
                <View style={styles.languageContent}>
                  <ThemedText style={styles.languageName}>{lang.native}</ThemedText>
                  <ThemedText style={styles.languageCode}>{lang.name}</ThemedText>
                </View>
                {selectedLanguage === lang.code && !lang.disabled && (
                  <View style={styles.checkmark}>
                    <ThemedText style={styles.checkmarkText}>✓</ThemedText>
                  </View>
                )}
                {lang.disabled && (
                  <ThemedText style={styles.comingSoon}>Удахгүй</ThemedText>
                )}
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <ThemedText style={styles.infoText}>
            Одоогоор зөвхөн Монгол хэл дэмжигдэж байна. Бусад хэлүүд удахгүй нэмэгдэх болно.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#111827',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  languageItemPressed: {
    opacity: 0.7,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  languageItemDisabled: {
    opacity: 0.5,
  },
  languageContent: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  languageCode: {
    fontSize: 14,
    color: '#6b7280',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  comingSoon: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

