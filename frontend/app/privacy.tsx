import { Pressable, StyleSheet, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ThemedText style={styles.backIcon}>‹</ThemedText>
        </Pressable>
        <ThemedText style={styles.headerTitle}>Нууцлал</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Нууцлалын бодлого</ThemedText>
          <ThemedText style={styles.paragraph}>
            Бид таны хувийн мэдээллийг нууцлалтай хадгална. Таны мэдээлэл зөвхөн захиалга хийх зориулалтаар ашиглагдана.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>Бидний цуглуулж буй мэдээлэл</ThemedText>
          <ThemedText style={styles.paragraph}>
            • Нэр, имэйл хаяг{'\n'}
            • Утасны дугаар{'\n'}
            • Захиалгын мэдээлэл{'\n'}
            • Төлбөрийн мэдээлэл
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>Мэдээллийг хэрхэн ашиглаж байна</ThemedText>
          <ThemedText style={styles.paragraph}>
            • Захиалга боловсруулах{'\n'}
            • Төлбөр хийх{'\n'}
            • Захиалгын статусын мэдээлэл илгээх{'\n'}
            • Үйлчилгээг сайжруулах
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>Мэдээллийг хадгалах хугацаа</ThemedText>
          <ThemedText style={styles.paragraph}>
            Бид таны мэдээллийг захиалгын түүх хадгалах шаардлагатай хугацаанд хадгална.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>Мэдээллийг хуваалцах</ThemedText>
          <ThemedText style={styles.paragraph}>
            Бид таны мэдээллийг гуравдагч этгээдэд хуваалцдаггүй, зөвхөн захиалга боловсруулах зориулалтаар ашиглана.
          </ThemedText>

          <ThemedText style={styles.sectionTitle}>Холбоо барих</ThemedText>
          <ThemedText style={styles.paragraph}>
            Нууцлалын талаар асуулт байвал бидэнтэй холбогдоно уу:{'\n'}
            Имэйл: privacy@mway.mn
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

