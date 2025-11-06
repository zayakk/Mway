import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function Confirmation() {
  const { booking } = useLocalSearchParams<{ booking: string }>();
  const data = booking ? JSON.parse(String(booking)) : null;
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Booking Confirmed</ThemedText>
      {data ? (
        <View style={styles.card}>
          <ThemedText>Booking ID: {data.id}</ThemedText>
          <ThemedText>Trip: {data.trip}</ThemedText>
          <ThemedText>Seats: {data.seats?.join(', ')}</ThemedText>
          <ThemedText>Total: ₮ {data.total}</ThemedText>
          <ThemedText>Status: {data.status}</ThemedText>
        </View>
      ) : (
        <ThemedText>No data.</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  card: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, padding: 12, backgroundColor: '#fff', gap: 4 },
});


