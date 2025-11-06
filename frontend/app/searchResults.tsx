import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Api, Trip } from '@/lib/api';

export default function SearchResults() {
  const { origin, destination, date } = useLocalSearchParams<{ origin: string; destination: string; date: string }>();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);

  useEffect(() => {
    if (origin && destination && date) {
      Api.search(Number(origin), Number(destination), date).then((r) => setTrips(r.results));
    }
  }, [origin, destination, date]);

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Results</ThemedText>
      <View style={{ gap: 8 }}>
        {trips.map((t) => (
          <Pressable key={t.id} style={styles.card} onPress={() => router.push({ pathname: '/seats', params: { tripId: String(t.id) } })}>
            <ThemedText type="defaultSemiBold">{t.route.origin.city.name} → {t.route.destination.city.name}</ThemedText>
            <ThemedText>{t.route.origin.name} → {t.route.destination.name}</ThemedText>
            <ThemedText>{new Date(t.depart_at).toLocaleString()} — {new Date(t.arrive_at).toLocaleString()}</ThemedText>
            <ThemedText>₮ {t.base_price}</ThemedText>
          </Pressable>
        ))}
        {!trips.length && <ThemedText>No trips.</ThemedText>}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, backgroundColor: '#fff' },
});


