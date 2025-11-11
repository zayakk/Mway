import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
      <ThemedText type="title">Orders</ThemedText>
      <View style={{ gap: 8 }}>
        {items.map((b) => (
          <Pressable key={`${b.id}-${b.createdAt}`} style={styles.card} onPress={() => open(b)}>
            <ThemedText type="defaultSemiBold">#{b.id} — ₮ {b.total}</ThemedText>
            <ThemedText>Seats: {b.seats.join(', ')}</ThemedText>
            <ThemedText>Status: {b.status}</ThemedText>
            <ThemedText>{new Date(b.createdAt).toLocaleString()}</ThemedText>
          </Pressable>
        ))}
        {!items.length && <ThemedText>No orders yet.</ThemedText>}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, backgroundColor: '#fff', gap: 4 },
});


