import { Pressable, StyleSheet, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>Бидний тухай</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <ThemedText style={styles.logoText}>🚌</ThemedText>
          </View>
          <ThemedText style={styles.appName}>Mway</ThemedText>
          <ThemedText style={styles.appTagline}>Хот хоорондын автобусны захиалгын систем</ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Бидний тухай</ThemedText>
          <ThemedText style={styles.paragraph}>
            Mway нь Монгол улсын хот хоорондын автобусны захиалгын онлайн платформ юм. Бид танд хурдан, найдвартай, хялбар үйлчилгээ үзүүлэхийг зорьж байна.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>Бидний зорилго</ThemedText>
          <ThemedText style={styles.paragraph}>
            • Хэрэглэгчдэд хурдан, хялбар захиалгын үйлчилгээ үзүүлэх{'\n'}
            • Автобусны компаниудын үйл ажиллагааг дэмжих{'\n'}
            • Цахим захиалгын соёлыг Монголд түгээх
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>Хувилбар</ThemedText>
          <ThemedText style={styles.paragraph}>
            Верс: 1.0.0{'\n'}
            Огноо: 2025
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>Хөгжүүлэгч</ThemedText>
          <ThemedText style={styles.paragraph}>
            Mway Development Team{'\n'}
            Бид танд хурдан, найдвартай үйлчилгээ үзүүлэхийг зорьж байна.
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
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 50,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 16,
  },
});

