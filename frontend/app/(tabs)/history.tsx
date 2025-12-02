import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { BrandColors } from '@/constants/theme';
import { listBookings, StoredBooking } from '@/lib/orders';
import { Screen, ScreenHeader } from '@/components/ui/screen';
import { Section } from '@/components/ui/section';

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
    <Screen scrollable contentContainerStyle={styles.screenContent}>
      <ScreenHeader
        eyebrow="Bookings"
        title="Захиалгын түүх"
        subtitle="Сүүлд хийсэн бүх захиалгаа эндээс үзнэ үү."
      />

      <Section
        title="Миний захиалгууд"
        subtitle={items.length ? 'Өнгөрсөн болон идэвхтэй захиалгууд' : 'Одоогоор захиалга алга'}
      >
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
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 80,
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
    backgroundColor: '#f9fafb',
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


