import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function Confirmation() {
  const { booking } = useLocalSearchParams<{ booking: string }>();
  const router = useRouter();
  const data = booking ? JSON.parse(String(booking)) : null;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Захиалга баталгаажлаа</ThemedText>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {data ? (
          <>
            {/* Success Icon */}
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <ThemedText style={styles.successCheck}>✓</ThemedText>
              </View>
              <ThemedText style={styles.successTitle}>Амжилттай!</ThemedText>
              <ThemedText style={styles.successSubtitle}>
                Таны захиалга амжилттай хийгдлээ
              </ThemedText>
            </View>

            {/* Booking Details Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardTitle}>Захиалгын мэдээлэл</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Захиалгын дугаар:</ThemedText>
                <ThemedText style={styles.infoValue}>{data.id}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Аялалын дугаар:</ThemedText>
                <ThemedText style={styles.infoValue}>{data.trip}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Суудал:</ThemedText>
                <ThemedText style={styles.infoValue}>{data.seats?.join(', ') || '—'}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Нийт дүн:</ThemedText>
                <ThemedText style={styles.totalValue}>
                  {data.total ? Number(data.total).toLocaleString() : '0'} MNT
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Төлөв:</ThemedText>
                <ThemedText style={[styles.statusValue, data.status === 'confirmed' && styles.statusConfirmed]}>
                  {data.status === 'confirmed' ? 'Баталгаажсан' : data.status || '—'}
                </ThemedText>
              </View>
            </View>

            {/* QR Code Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText style={styles.cardTitle}>QR код</ThemedText>
              </View>
              <View style={styles.qrBox}>
                <ThemedText style={styles.qrTitle}>Захиалгын дугаар</ThemedText>
                <ThemedText style={styles.qrCode} selectable>{String(data.id)}</ThemedText>
              </View>
              <ThemedText style={styles.qrInstruction}>
                Энэ QR код эсвэл захиалгын дугаарыг автобусанд суухдаа харуулна уу
              </ThemedText>
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Мэдээлэл олдсонгүй</ThemedText>
          </View>
        )}
      </ScrollView>

      {/* Footer Button */}
      <View style={styles.footer}>
        <Pressable
          onPress={() => router.replace('/')}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <ThemedText style={styles.buttonText}>Шинэ аялал хайх</ThemedText>
        </Pressable>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
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
  successContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successCheck: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  successSubtitle: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f97316',
    flex: 1,
    textAlign: 'right',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusConfirmed: {
    color: '#10b981',
  },
  qrBox: {
    marginTop: 8,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#111827',
    borderRadius: 12,
    padding: 24,
    backgroundColor: '#fff',
    minHeight: 160,
  },
  qrTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  qrCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: 2,
  },
  qrInstruction: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#f97316',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});


