import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import { listBookings, StoredBooking } from '@/lib/orders';

export default function HistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<StoredBooking[]>([]);

  useEffect(() => {
    let mounted = true;
    listBookings().then((list) => {
      if (mounted) setItems(list);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const open = (b: StoredBooking) => {
    const payload = b?.payload ?? {
      id: b.id,
      trip: b.trip,
      seats: b.seats,
      total: b.total,
      status: b.status,
    };
    router.push({ pathname: '/confirmation', params: { booking: JSON.stringify(payload) } });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Захиалгын түүх</ThemedText>
        <ThemedText style={styles.headerSubtitle}>Сүүлд хийсэн бүх захиалгаа эндээс үзнэ үү</ThemedText>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {items.map((b) => (
          <Pressable key={`${b.id}-${b.createdAt}`} style={styles.card} onPress={() => open(b)}>
            <View style={styles.cardHeader}>
              <ThemedText style={styles.cardTitle}>#{b.id}</ThemedText>
              <ThemedText style={styles.cardAmount}>₮ {b.total}</ThemedText>
            </View>
            <ThemedText style={styles.cardText}>Суудал: {b.seats.join(', ')}</ThemedText>
            <ThemedText style={styles.cardText}>Төлөв: {b.status}</ThemedText>
            <ThemedText style={styles.cardDate}>{new Date(b.createdAt).toLocaleString()}</ThemedText>
          </Pressable>
        ))}
        {!items.length && (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyTitle}>Одоогоор захиалга алга</ThemedText>
            <ThemedText style={styles.emptyText}>Хайлт хийж шинэ аялал захиалаарай.</ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.primary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
  content: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.primary,
  },
  cardText: {
    fontSize: 14,
    color: '#4b5563',
  },
  cardDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
  },
});


