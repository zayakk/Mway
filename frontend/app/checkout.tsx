import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Api, Trip } from '@/lib/api';
import { saveBooking } from '@/lib/orders';

export default function Checkout() {
  const { tripId, seats } = useLocalSearchParams<{ tripId: string; seats: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const selectedSeats = useMemo(() => (seats ? String(seats).split(',').filter(Boolean) : []), [seats]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tripId) Api.trip(Number(tripId)).then(setTrip).catch((e) => Alert.alert('Error', e.message));
  }, [tripId]);

  const total = useMemo(() => {
    const unit = trip ? Number(trip.base_price) : 0;
    return unit * selectedSeats.length;
  }, [trip, selectedSeats]);

  const onPay = async () => {
    if (!tripId || !selectedSeats.length) {
      Alert.alert('Missing', 'Trip or seats not provided.');
      return;
    }
    if (!name || !phone) {
      Alert.alert('Required', 'Please enter passenger name and phone.');
      return;
    }
    try {
      setLoading(true);
      const result = await Api.book({ trip: Number(tripId), seats: selectedSeats, passenger: { name, phone } });
      // persist to local history
      try {
        await saveBooking({
          id: result?.id ?? `${tripId}-${Date.now()}`,
          trip: Number(tripId),
          seats: selectedSeats,
          total,
          status: result?.status ?? 'confirmed',
          payload: result,
        });
      } catch {}
      router.replace({ pathname: '/confirmation', params: { booking: JSON.stringify(result) } });
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Checkout</ThemedText>
      {trip && (
        <View style={styles.card}>
          <ThemedText type="defaultSemiBold">{trip.route.origin.city.name} → {trip.route.destination.city.name}</ThemedText>
          <ThemedText>{new Date(trip.depart_at).toLocaleString()}</ThemedText>
          <ThemedText>Bus: {trip.bus.plate_number}</ThemedText>
        </View>
      )}
      <View style={styles.card}>
        <ThemedText>Seats: {selectedSeats.join(', ') || '—'}</ThemedText>
        <ThemedText>Unit: ₮ {trip?.base_price ?? '0'}</ThemedText>
        <ThemedText type="defaultSemiBold">Total: ₮ {total}</ThemedText>
      </View>

      <ThemedText type="subtitle">Passenger</ThemedText>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

      <Pressable onPress={onPay} style={styles.button} disabled={loading}>
        <ThemedText type="defaultSemiBold">{loading ? 'Processing…' : 'Confirm & Pay (mock)'}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, backgroundColor: '#fff', gap: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  button: { marginTop: 8, alignItems: 'center', paddingVertical: 12, borderRadius: 10, backgroundColor: '#e0f2fe', borderWidth: 1, borderColor: '#38bdf8' },
});


